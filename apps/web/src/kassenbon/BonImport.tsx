import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { standardmaessigImVorrat } from "@haushalt/db/vorrat";
import { usePowerSync, useQuery } from "@powersync/react";
import { LoaderCircle, Minus, Plus, ReceiptText } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { zeitWert } from "@/lib/zeit";
import { artikelFindenOderAnlegen } from "../listenaktionen";
import { buchen, mindestbestandPruefen } from "../vorratsaktionen";
import { bonZeilen } from "./lesen";
import { type Kassenbon, type Position, zerlegeBon } from "./zerlegen";
import { bonSchluessel, namensVorschlag, zuordnen } from "./zuordnen";

type Artikel = {
  id: string;
  name: string;
  kategorie: string | null;
  im_vorrat: number;
  offen: string | null;
};

type Zeile = {
  position: Position;
  name: string;
  /** Zugeordneter Artikel – `null` = wird neu angelegt. */
  artikelId: string | null;
  an: boolean;
  anzahl: number;
};

const ARTIKEL_ABFRAGE = `SELECT a.id, a.name, a.kategorie, COALESCE(a.im_vorrat, 0) AS im_vorrat,
       (SELECT l.id FROM listeneintraege l WHERE l.artikel_id = a.id AND l.erledigt = 0 LIMIT 1) AS offen
  FROM artikel a WHERE a.haushalt_id = ?`;

/** Frisches zählt man meist nicht nach – vorausgewählt ist es nur, wenn es schon im Vorrat ist. */
const FRISCH = new Set(["obst_gemuese", "brot_backwaren"]);

/**
 * Kassenbon (PDF, z. B. REWE-eBon) hochladen: Positionen erkennen, mit den Artikeln
 * des Haushalts verknüpfen (gelernt fürs nächste Mal), prüfen und in den Vorrat
 * buchen. Steht etwas offen auf der Liste, wird es dort gleich abgehakt.
 */
export function BonImport({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const eingabe = useRef<HTMLInputElement>(null);
  const [laedt, setLaedt] = useState(false);
  const [bon, setBon] = useState<Kassenbon | null>(null);
  const [zeilen, setZeilen] = useState<Zeile[]>([]);
  const { data: artikel } = useQuery<Artikel>(ARTIKEL_ABFRAGE, [haushaltId]);
  const { data: frueher } = useQuery<{
    schluessel: string;
    erstellt_am: string;
  }>("SELECT schluessel, erstellt_am FROM kassenbons WHERE haushalt_id = ?", [
    haushaltId,
  ]);
  const schonAm = bon?.schluessel
    ? frueher.find((k) => k.schluessel === bon.schluessel)?.erstellt_am
    : undefined;

  async function lesen(datei: File) {
    setLaedt(true);
    try {
      const b = zerlegeBon(await bonZeilen(datei));
      if (b.positionen.length === 0) {
        toast.error("Auf dem Bon wurden keine Artikel gefunden.");
        return;
      }
      // Direkt aus der Datenbank: Die Live-Abfragen sind kurz nach dem Öffnen
      // der Seite womöglich noch leer.
      const [artikel, gelernt] = await Promise.all([
        db.getAll<Artikel>(ARTIKEL_ABFRAGE, [haushaltId]),
        db.getAll<{ text: string; artikel_id: string }>(
          "SELECT text, artikel_id FROM bon_artikel WHERE haushalt_id = ? ORDER BY erstellt_am",
          [haushaltId],
        ),
      ]);
      // Spätere Einträge gewinnen – die Map behält den letzten.
      const nachText = new Map(gelernt.map((g) => [g.text, g.artikel_id]));
      setZeilen(
        b.positionen.map((position) => {
          const treffer = zuordnen(position.text, artikel, nachText);
          const a = treffer
            ? artikel.find((x) => x.id === treffer.artikel.id)
            : undefined;
          const name = a?.name ?? namensVorschlag(position.text);
          const kategorie = a
            ? a.kategorie
            : (erkenneKategorie(name)[0] ?? null);
          return {
            position,
            name,
            artikelId: a?.id ?? null,
            an: a?.im_vorrat
              ? true
              : !FRISCH.has(kategorie ?? "") ||
                standardmaessigImVorrat(kategorie),
            anzahl: position.kg != null ? 1 : position.anzahl,
          };
        }),
      );
      setBon(b);
    } catch {
      toast.error("Das PDF ließ sich nicht lesen – ist es ein Kassenbon?");
    } finally {
      setLaedt(false);
    }
  }

  function aendern(i: number, teil: Partial<Zeile>) {
    setZeilen((alle) => alle.map((z, j) => (j === i ? { ...z, ...teil } : z)));
  }

  function nameAendern(i: number, name: string) {
    // Passt der Name genau zu einem Artikel, wird damit verknüpft – sonst neu.
    const a = artikel.find(
      (x) => x.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    aendern(i, { name, artikelId: a?.id ?? null });
  }

  async function uebernehmen() {
    if (!bon) {
      return;
    }
    const gewaehlt = zeilen.filter((z) => z.an && z.name.trim());
    const gekauftAm = bon.datum
      ? new Date(`${bon.datum}T12:00:00`).toISOString()
      : new Date().toISOString();
    await db.writeTransaction(async (tx) => {
      for (const z of gewaehlt) {
        const a = await artikelFindenOderAnlegen(tx, {
          haushaltId,
          name: z.name,
        });
        await tx.execute("UPDATE artikel SET im_vorrat = 1 WHERE id = ?", [
          a.id,
        ]);
        // Fürs nächste Mal merken, wofür dieser Bon-Text steht.
        const text = bonSchluessel(z.position.text);
        const gemerkt = await tx.getOptional<{ artikel_id: string }>(
          "SELECT artikel_id FROM bon_artikel WHERE haushalt_id = ? AND text = ? ORDER BY erstellt_am DESC LIMIT 1",
          [haushaltId, text],
        );
        if (gemerkt?.artikel_id !== a.id) {
          await tx.execute(
            "INSERT INTO bon_artikel (id, haushalt_id, artikel_id, text, erstellt_am) VALUES (uuid(), ?, ?, ?, ?)",
            [haushaltId, a.id, text, new Date().toISOString()],
          );
        }
        // Offen auf der Liste? Dann ist es jetzt gekauft.
        const offen = await tx.getOptional<{ id: string }>(
          "SELECT id FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0 LIMIT 1",
          [a.id],
        );
        if (offen) {
          await tx.execute(
            "UPDATE listeneintraege SET erledigt = 1, erledigt_von = ? WHERE id = ?",
            [nutzerId, offen.id],
          );
        }
        await tx.execute(
          `INSERT INTO kaeufe (id, haushalt_id, artikel_id, listeneintrag_id, gekauft_am, erstellt_von)
           VALUES (uuid(), ?, ?, ?, ?, ?)`,
          [haushaltId, a.id, offen?.id ?? null, gekauftAm, nutzerId],
        );
        await buchen(tx, {
          haushaltId,
          artikelId: a.id,
          menge: Math.max(1, z.anzahl),
          grund: "einkauf",
          nutzerId,
          ...(offen ? { listeneintragId: offen.id } : {}),
        });
        await mindestbestandPruefen(tx, a.id, nutzerId);
      }
      if (bon.schluessel) {
        await tx.execute(
          "INSERT INTO kassenbons (id, haushalt_id, schluessel, positionen, erstellt_von, erstellt_am) VALUES (uuid(), ?, ?, ?, ?, ?)",
          [
            haushaltId,
            bon.schluessel,
            gewaehlt.length,
            nutzerId,
            new Date().toISOString(),
          ],
        );
      }
    });
    setBon(null);
    toast.success(
      gewaehlt.length === 1
        ? "1 Produkt vom Bon im Vorrat"
        : `${gewaehlt.length} Produkte vom Bon im Vorrat`,
    );
  }

  const anzahlGewaehlt = zeilen.filter((z) => z.an && z.name.trim()).length;
  const datum = bon?.datum
    ? new Date(`${bon.datum}T12:00:00`).toLocaleDateString("de-DE")
    : null;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full"
        disabled={laedt}
        onClick={() => eingabe.current?.click()}
      >
        {laedt ? <LoaderCircle className="animate-spin" /> : <ReceiptText />}
        Kassenbon
      </Button>
      <input
        ref={eingabe}
        type="file"
        accept="application/pdf,.pdf"
        aria-label="Kassenbon hochladen"
        className="hidden"
        onChange={(e) => {
          const datei = e.target.files?.[0];
          e.target.value = "";
          if (datei) {
            lesen(datei);
          }
        }}
      />
      <Drawer open={bon != null} onOpenChange={(o) => !o && setBon(null)}>
        <DrawerContent>
          {bon && (
            <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Kassenbon übernehmen</DrawerTitle>
                <DrawerDescription>
                  {[bon.laden, datum, `${bon.positionen.length} Positionen`]
                    .filter(Boolean)
                    .join(" · ")}
                  {bon.uebersprungen > 0 &&
                    ` · ${bon.uebersprungen}× Pfand/Rabatt übersprungen`}
                </DrawerDescription>
              </DrawerHeader>
              {schonAm && (
                <p
                  role="status"
                  className="mx-4 mb-2 rounded-lg bg-warning/15 px-3 py-2 text-sm text-warning-foreground"
                >
                  Diesen Bon habt ihr am{" "}
                  {new Date(zeitWert(schonAm)).toLocaleDateString("de-DE")}{" "}
                  schon übernommen.
                </p>
              )}
              <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 pb-2">
                {zeilen.map((z, i) => {
                  const a = z.artikelId
                    ? artikel.find((x) => x.id === z.artikelId)
                    : undefined;
                  return (
                    <li
                      key={z.position.text}
                      className="flex items-center gap-2 border-b py-2 last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={z.an}
                        aria-label={`${z.name} übernehmen`}
                        onChange={() => aendern(i, { an: !z.an })}
                        className="size-5 shrink-0 accent-[var(--primary)]"
                      />
                      <div
                        className={cn("min-w-0 flex-1", !z.an && "opacity-50")}
                      >
                        <input
                          value={z.name}
                          list="bon-artikel"
                          aria-label={`Artikel für ${z.position.text}`}
                          onChange={(e) => nameAendern(i, e.target.value)}
                          className="w-full rounded-md bg-transparent px-1 py-0.5 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                        <p className="truncate px-1 text-xs text-muted-foreground">
                          {z.position.text} ·{" "}
                          {z.position.preis.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                          {z.position.kg != null &&
                            ` · ${z.position.kg.toLocaleString("de-DE")} kg`}
                          {!a && (
                            <span className="font-medium text-primary">
                              {" "}
                              · neu
                            </span>
                          )}
                          {a?.offen && (
                            <span className="font-medium text-primary">
                              {" "}
                              · auf der Liste
                            </span>
                          )}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          !z.an && "pointer-events-none opacity-40",
                        )}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 rounded-full"
                          aria-label={`${z.name} eins weniger`}
                          disabled={z.anzahl <= 1}
                          onClick={() => aendern(i, { anzahl: z.anzahl - 1 })}
                        >
                          <Minus />
                        </Button>
                        <span
                          className="w-6 text-center tabular-nums"
                          data-testid={`bon-anzahl-${z.position.text}`}
                        >
                          {z.anzahl}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 rounded-full"
                          aria-label={`${z.name} eins mehr`}
                          onClick={() => aendern(i, { anzahl: z.anzahl + 1 })}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <datalist id="bon-artikel">
                {artikel.map((a) => (
                  <option key={a.id} value={a.name} />
                ))}
              </datalist>
              <div className="space-y-2 border-t p-4">
                <p className="text-center text-xs text-muted-foreground">
                  Frisches (Obst, Gemüse, Brot) ist abgewählt – antippen zum
                  Mitnehmen. Zuordnungen merkt sich die App fürs nächste Mal.
                </p>
                <Button
                  className="h-12 w-full rounded-full text-base"
                  disabled={anzahlGewaehlt === 0}
                  onClick={uebernehmen}
                >
                  {anzahlGewaehlt === 1
                    ? "1 Produkt in den Vorrat"
                    : `${anzahlGewaehlt} Produkte in den Vorrat`}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
