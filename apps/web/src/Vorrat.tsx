import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { kategorieName, kategorieRang } from "@haushalt/db/kategorien";
import { usePowerSync, useQuery } from "@powersync/react";
import { Minus, PackageOpen, Plus } from "lucide-react";
import { useState } from "react";
import { Eingabeleiste, kategorieVorschlag } from "@/components/Eingabeleiste";
import { Gruppe } from "@/components/Gruppe";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  bestandSetzen,
  buchen,
  mindestbestandPruefen,
} from "./vorratsaktionen";

type VorratsZeile = {
  id: string;
  name: string;
  kategorie: string | null;
  mindestbestand: number | null;
  bestand: number;
  auf_liste: number;
};

const stueck = (zahl: number) =>
  Math.max(zahl, 0).toLocaleString("de-DE", { maximumFractionDigits: 2 });

export function Vorrat({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const { data: zeilen } = useQuery<VorratsZeile>(
    `SELECT a.id, a.name, a.kategorie, a.mindestbestand,
            COALESCE((SELECT SUM(b.menge) FROM vorratsbuchungen b WHERE b.artikel_id = a.id), 0) AS bestand,
            EXISTS (SELECT 1 FROM listeneintraege l WHERE l.artikel_id = a.id AND l.erledigt = 0) AS auf_liste
       FROM artikel a
      WHERE a.haushalt_id = ? AND a.im_vorrat = 1
      ORDER BY a.name`,
    [haushaltId],
  );
  const { data: andere } = useQuery<{ id: string; name: string }>(
    "SELECT id, name FROM artikel WHERE haushalt_id = ? AND im_vorrat = 0 ORDER BY name",
    [haushaltId],
  );
  const [details, setDetails] = useState<string | null>(null);
  const detailZeile = zeilen.find((z) => z.id === details) ?? null;

  const gruppen = gruppieren(zeilen);
  const knapp = zeilen.filter(istKnapp).length;

  function aendern(zeile: VorratsZeile, menge: number) {
    return db.writeTransaction(async (tx) => {
      await buchen(tx, {
        haushaltId,
        artikelId: zeile.id,
        menge,
        grund: menge > 0 ? "korrektur" : "verbrauch",
        nutzerId,
      });
      await mindestbestandPruefen(tx, zeile.id, nutzerId);
    });
  }

  function imVorratFuehren(artikelId: string, an: boolean) {
    return db.execute("UPDATE artikel SET im_vorrat = ? WHERE id = ?", [
      an ? 1 : 0,
      artikelId,
    ]);
  }

  return (
    <>
      {knapp > 0 && (
        <p
          role="status"
          className="mt-2 rounded-lg bg-warning/15 px-3 py-2 text-sm text-warning-foreground"
        >
          {knapp === 1 ? "1 Artikel ist" : `${knapp} Artikel sind`} unter dem
          Mindestbestand.
        </p>
      )}

      {gruppen.map(([gruppe, artikel]) => (
        <Gruppe key={gruppe} titel={gruppe}>
          {artikel.map((zeile) => (
            <VorratsEintrag
              key={zeile.id}
              zeile={zeile}
              aendern={aendern}
              oeffnen={() => setDetails(zeile.id)}
            />
          ))}
        </Gruppe>
      ))}

      {zeilen.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <PackageOpen className="size-10" strokeWidth={1.5} />
          <p>Noch nichts im Vorrat.</p>
          <p className="max-w-xs text-sm">
            Abgehakte Einkäufe von Vorratsartikeln landen automatisch hier, oder
            du trägst unten etwas ein.
          </p>
        </div>
      )}

      {andere.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer px-1 text-sm text-muted-foreground">
            Weitere Artikel ({andere.length}) – nicht im Vorrat
          </summary>
          <ul className="mt-2 divide-y rounded-xl border bg-card">
            {andere.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between py-1 pr-2 pl-4"
              >
                <span>{a.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => imVorratFuehren(a.id, true)}
                >
                  Im Vorrat führen
                </Button>
              </li>
            ))}
          </ul>
        </details>
      )}

      <VorratsDetails
        zeile={detailZeile}
        schliessen={() => setDetails(null)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        entfernen={(id) => {
          setDetails(null);
          imVorratFuehren(id, false);
        }}
      />

      <NeuerVorratsartikel haushaltId={haushaltId} nutzerId={nutzerId} />
    </>
  );
}

/** Kompakte Zeile: Name (antippen für Details), −, Bestand, +. */
function VorratsEintrag({
  zeile,
  aendern,
  oeffnen,
}: {
  zeile: VorratsZeile;
  aendern: (zeile: VorratsZeile, menge: number) => void;
  oeffnen: () => void;
}) {
  const bestand = Math.max(zeile.bestand, 0);
  const knapp = istKnapp(zeile);

  return (
    <li className="flex min-h-14 items-center gap-1 pr-2">
      <button
        type="button"
        onClick={oeffnen}
        className="flex-1 self-stretch px-4 py-2 text-left"
      >
        <span
          className={cn(
            "block text-base",
            knapp && "font-medium text-warning-foreground",
          )}
        >
          {zeile.name}
        </span>
        {knapp && (
          <span className="text-xs text-warning-foreground">
            knapp{zeile.auf_liste ? ", auf der Liste" : ""}
          </span>
        )}
      </button>
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-full"
        aria-label={`${zeile.name} weniger`}
        disabled={bestand <= 0}
        onClick={() => aendern(zeile, -Math.min(1, bestand))}
      >
        <Minus />
      </Button>
      <button
        type="button"
        onClick={oeffnen}
        aria-label={`Bestand ${zeile.name}`}
        className={cn(
          "min-w-10 text-center text-lg font-medium tabular-nums",
          bestand <= 0 && "text-muted-foreground",
        )}
      >
        {stueck(bestand)}
      </button>
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-full"
        aria-label={`${zeile.name} mehr`}
        onClick={() => aendern(zeile, 1)}
      >
        <Plus />
      </Button>
    </li>
  );
}

/** Bestand genau setzen, Mindestbestand, aufbrauchen, aus dem Vorrat nehmen. */
function VorratsDetails({
  zeile,
  schliessen,
  haushaltId,
  nutzerId,
  entfernen,
}: {
  zeile: VorratsZeile | null;
  schliessen: () => void;
  haushaltId: string;
  nutzerId: string;
  entfernen: (artikelId: string) => void;
}) {
  const db = usePowerSync();

  return (
    <Drawer
      open={zeile != null}
      onOpenChange={(offen) => !offen && schliessen()}
    >
      <DrawerContent>
        {zeile && (
          <form
            key={zeile.id}
            className="mx-auto w-full max-w-lg"
            onSubmit={async (e) => {
              e.preventDefault();
              const daten = new FormData(e.currentTarget);
              const bestand = zahl(daten.get("bestand"));
              const mindestbestand = zahl(daten.get("mindestbestand"));
              await db.writeTransaction(async (tx) => {
                await tx.execute(
                  "UPDATE artikel SET mindestbestand = ? WHERE id = ?",
                  [
                    mindestbestand && mindestbestand > 0
                      ? mindestbestand
                      : null,
                    zeile.id,
                  ],
                );
                if (bestand != null && bestand !== Math.max(zeile.bestand, 0)) {
                  await bestandSetzen(tx, {
                    haushaltId,
                    artikelId: zeile.id,
                    neu: bestand,
                    nutzerId,
                  });
                } else {
                  await mindestbestandPruefen(tx, zeile.id, nutzerId);
                }
              });
              schliessen();
            }}
          >
            <DrawerHeader>
              <DrawerTitle>{zeile.name}</DrawerTitle>
              <DrawerDescription>
                {kategorieName(zeile.kategorie)}
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-2 gap-3 px-4">
              <div className="space-y-1.5">
                <Label htmlFor="details-bestand">Bestand</Label>
                <Input
                  id="details-bestand"
                  name="bestand"
                  inputMode="numeric"
                  defaultValue={Math.max(zeile.bestand, 0)}
                  aria-label={`Bestand setzen ${zeile.name}`}
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="details-mindest">Mindestbestand</Label>
                <Input
                  id="details-mindest"
                  name="mindestbestand"
                  inputMode="numeric"
                  placeholder="keiner"
                  defaultValue={zeile.mindestbestand ?? ""}
                  aria-label={`Mindestbestand ${zeile.name}`}
                  className="h-11 text-base"
                />
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">
                Fällt der Bestand unter den Mindestbestand, kommt der Artikel
                automatisch auf die Einkaufsliste.
              </p>
            </div>
            <DrawerFooter>
              <Button type="submit" className="h-11">
                Speichern
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  disabled={zeile.bestand <= 0}
                  onClick={async () => {
                    await db.writeTransaction((tx) =>
                      bestandSetzen(tx, {
                        haushaltId,
                        artikelId: zeile.id,
                        neu: 0,
                        nutzerId,
                      }),
                    );
                    schliessen();
                  }}
                >
                  Aufgebraucht
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 text-muted-foreground"
                  onClick={() => entfernen(zeile.id)}
                >
                  Nicht im Vorrat führen
                </Button>
              </div>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/**
 * Artikel direkt in den Vorrat eintragen, z. B. bei der ersten Inventur: legt ihn
 * mit Bestand 1 an bzw. erhöht den Bestand um 1. Feinjustieren mit + / −.
 */
function NeuerVorratsartikel({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const { data: bekannte } = useQuery<{
    name: string;
    kategorie: string | null;
  }>("SELECT name, kategorie FROM artikel WHERE haushalt_id = ?", [haushaltId]);
  const [name, setName] = useState("");
  const [manuell, setManuell] = useState<string | null>(null);
  const bekannt = bekannte.find(
    (a) => a.name.toLowerCase() === name.trim().toLowerCase(),
  );
  const vorschlag = kategorieVorschlag(
    bekannt?.kategorie,
    erkenneKategorie(name),
    manuell,
  );

  async function eintragen(kategorie: string) {
    const artikelName = name.trim();
    await db.writeTransaction(async (tx) => {
      const vorhanden = await tx.getOptional<{
        id: string;
        kategorie: string | null;
      }>(
        "SELECT id, kategorie FROM artikel WHERE haushalt_id = ? AND lower(name) = lower(?)",
        [haushaltId, artikelName],
      );
      let artikelId = vorhanden?.id;
      if (artikelId) {
        await tx.execute(
          "UPDATE artikel SET im_vorrat = 1, kategorie = ? WHERE id = ?",
          [kategorie || null, artikelId],
        );
      } else {
        artikelId = crypto.randomUUID();
        await tx.execute(
          `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, im_vorrat, erstellt_am)
           VALUES (?, ?, ?, ?, 'stueck', 1, ?)`,
          [
            artikelId,
            haushaltId,
            artikelName,
            kategorie || null,
            new Date().toISOString(),
          ],
        );
      }
      await buchen(tx, {
        haushaltId,
        artikelId,
        menge: 1,
        grund: "korrektur",
        nutzerId,
      });
    });
    setName("");
    setManuell(null);
  }

  return (
    <Eingabeleiste
      wert={name}
      aendern={(wert) => {
        setName(wert);
        setManuell(null);
      }}
      absenden={eintragen}
      platzhalter="Was ist da?"
      label="Vorratsartikel"
      absendenLabel="Eintragen"
      kategorie={vorschlag.kategorie}
      kategorieAendern={setManuell}
      auswahl={vorschlag.auswahl}
      vorschlaege={bekannte.map((a) => a.name)}
    />
  );
}

/** Eingabe als Zahl ≥ 0 lesen (Komma oder Punkt); leer oder ungültig → null. */
function zahl(wert: FormDataEntryValue | null): number | null {
  const roh = String(wert ?? "")
    .trim()
    .replace(",", ".");
  const z = roh === "" ? null : Number(roh);
  return z != null && Number.isFinite(z) && z >= 0 ? z : null;
}

function istKnapp(zeile: VorratsZeile) {
  return zeile.mindestbestand != null && zeile.bestand < zeile.mindestbestand;
}

function gruppieren(zeilen: VorratsZeile[]): [string, VorratsZeile[]][] {
  const sortiert = [...zeilen].sort(
    (a, b) => kategorieRang(a.kategorie) - kategorieRang(b.kategorie),
  );
  const gruppen = new Map<string, VorratsZeile[]>();
  for (const zeile of sortiert) {
    const gruppe = kategorieName(zeile.kategorie);
    gruppen.set(gruppe, [...(gruppen.get(gruppe) ?? []), zeile]);
  }
  return [...gruppen];
}
