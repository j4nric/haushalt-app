import { EINHEITEN, type Einheit } from "@haushalt/db/einheiten";
import { KATEGORIEN, OHNE_KATEGORIE } from "@haushalt/db/kategorien";
import { namensVarianten } from "@haushalt/db/namen";
import { usePowerSync, useQuery } from "@powersync/react";
import { PackageX, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NativeAuswahl } from "@/components/NativeAuswahl";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ersterBuchstabeGross } from "@/lib/farben";
import { cn } from "@/lib/utils";
import { zeitWert } from "@/lib/zeit";
import {
  angebrochenSetzen,
  artikelLoeschen,
  bestandSetzen,
  mindestbestandPruefen,
} from "../vorratsaktionen";
import { stueck, type VorratsZeile, vorratVon } from "./daten";
import { Zaehler } from "./Zaehler";

const EINHEIT_NAME: Record<Einheit, string> = {
  g: "g",
  ml: "ml",
  stueck: "Stück",
};

/**
 * Alles zu einem Vorratsartikel: Name, Kategorie, Packungsgröße, Bestand (mit
 * „1 offen“), Mindestbestand – und der Verlauf. „Aufgebraucht“ und „Nicht mehr
 * führen“ stehen bewusst getrennt.
 */
export function Details({
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
  return (
    <Drawer
      open={zeile != null}
      onOpenChange={(offen) => !offen && schliessen()}
    >
      <DrawerContent>
        {zeile && (
          <Formular
            key={zeile.id}
            zeile={zeile}
            schliessen={schliessen}
            haushaltId={haushaltId}
            nutzerId={nutzerId}
            entfernen={entfernen}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Formular({
  zeile,
  schliessen,
  haushaltId,
  nutzerId,
  entfernen,
}: {
  zeile: VorratsZeile;
  schliessen: () => void;
  haushaltId: string;
  nutzerId: string;
  entfernen: (artikelId: string) => void;
}) {
  const db = usePowerSync();
  const vorrat = vorratVon(zeile);
  const [name, setName] = useState(zeile.name);
  const [kategorie, setKategorie] = useState(zeile.kategorie ?? "");
  const [packungMenge, setPackungMenge] = useState(
    zeile.packung_menge != null ? zahlOhnePunkt(zeile.packung_menge) : "",
  );
  const [packungEinheit, setPackungEinheit] = useState<Einheit>(
    (zeile.packung_einheit as Einheit | null) ?? "g",
  );
  const [bestand, setBestand] = useState(vorrat.bestand);
  const [offen, setOffen] = useState(vorrat.angebrochen);
  const [mindest, setMindest] = useState(zeile.mindestbestand ?? 0);
  const [loeschenFragen, setLoeschenFragen] = useState(false);

  async function speichern() {
    const neuerName = ersterBuchstabeGross(name.trim());
    if (!neuerName) {
      toast.error("Der Name fehlt");
      return;
    }
    const menge = zahlLesen(packungMenge);
    const packung =
      packungMenge.trim() && Number.isFinite(menge) && menge > 0
        ? { menge, einheit: packungEinheit }
        : null;
    const ergebnis = await db.writeTransaction(async (tx) => {
      if (neuerName !== zeile.name) {
        // Kein zweiter Artikel mit gleichem Namen (auch nicht in anderer Form).
        const andere = await tx.getAll<{ name: string }>(
          "SELECT name FROM artikel WHERE haushalt_id = ? AND id != ?",
          [haushaltId, zeile.id],
        );
        const varianten = new Set(namensVarianten(neuerName));
        const gleich = andere.find((a) =>
          varianten.has(a.name.trim().toLowerCase()),
        );
        if (gleich) {
          return `„${gleich.name}“ gibt es schon`;
        }
      }
      await tx.execute(
        `UPDATE artikel SET name = ?, kategorie = ?, packung_menge = ?, packung_einheit = ?, mindestbestand = ?
          WHERE id = ?`,
        [
          neuerName,
          kategorie || null,
          packung?.menge ?? null,
          packung?.einheit ?? null,
          mindest > 0 ? mindest : null,
          zeile.id,
        ],
      );
      await angebrochenSetzen(tx, zeile.id, offen && bestand > 0);
      if (bestand !== vorrat.bestand) {
        await bestandSetzen(tx, {
          haushaltId,
          artikelId: zeile.id,
          neu: bestand,
          nutzerId,
        });
      } else {
        await mindestbestandPruefen(tx, zeile.id, nutzerId);
      }
      return null;
    });
    if (ergebnis) {
      toast.error(ergebnis);
      return;
    }
    schliessen();
  }

  async function aufgebraucht() {
    await db.writeTransaction((tx) =>
      bestandSetzen(tx, { haushaltId, artikelId: zeile.id, neu: 0, nutzerId }),
    );
    schliessen();
  }

  return (
    <form
      className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        speichern();
      }}
    >
      <DrawerHeader className="pb-2">
        <DrawerTitle>{zeile.name}</DrawerTitle>
        <DrawerDescription>
          Im Vorrat · gilt für alle im Haushalt
        </DrawerDescription>
      </DrawerHeader>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">Bestand</p>
            <p className="text-xs text-muted-foreground">
              {vorrat.packung ? "Packungen" : "Stück"}
            </p>
          </div>
          <Zaehler
            wert={bestand}
            setzen={setBestand}
            label={`Bestand ${zeile.name}`}
          />
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={offen && bestand > 0}
          disabled={bestand <= 0}
          onClick={() => setOffen(!offen)}
          className="flex w-full items-center justify-between gap-3 text-left disabled:opacity-50"
        >
          <span>
            <span className="block font-medium">Eine ist angebrochen</span>
            <span className="text-xs text-muted-foreground">
              Wird nur markiert, nicht abgezogen.
            </span>
          </span>
          <span
            aria-hidden
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
              offen && bestand > 0 ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform",
                offen && bestand > 0 && "translate-x-5",
              )}
            />
          </span>
        </button>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">Mindestbestand</p>
            <p className="text-xs text-muted-foreground">
              Darunter kommt es auf die Liste.
            </p>
          </div>
          <Zaehler
            wert={mindest}
            setzen={setMindest}
            label={`Mindestbestand ${zeile.name}`}
            leer="–"
          />
        </div>

        <div className="space-y-3 rounded-xl border p-3">
          <div className="space-y-1.5">
            <Label htmlFor="vorrat-name">Name</Label>
            <Input
              id="vorrat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vorrat-kategorie">Kategorie</Label>
            <NativeAuswahl
              id="vorrat-kategorie"
              value={kategorie}
              onChange={(e) => setKategorie(e.target.value)}
              className="w-full"
            >
              <option value="">{OHNE_KATEGORIE}</option>
              {KATEGORIEN.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </NativeAuswahl>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vorrat-packung">Inhalt einer Packung</Label>
            <div className="flex gap-2">
              <Input
                id="vorrat-packung"
                inputMode="decimal"
                placeholder="z. B. 500"
                value={packungMenge}
                onChange={(e) => setPackungMenge(e.target.value)}
                className="h-11 flex-1 text-base"
              />
              <NativeAuswahl
                aria-label="Einheit der Packung"
                value={packungEinheit}
                onChange={(e) => setPackungEinheit(e.target.value as Einheit)}
              >
                {EINHEITEN.map((e) => (
                  <option key={e} value={e}>
                    {EINHEIT_NAME[e]}
                  </option>
                ))}
              </NativeAuswahl>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Damit rechnen Rezepte Gramm und Milliliter in Packungen
              um.
            </p>
          </div>
        </div>

        <Verlauf artikelId={zeile.id} />

        <div className="flex flex-col items-center gap-1 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => entfernen(zeile.id)}
          >
            <PackageX /> Nicht mehr im Vorrat führen
          </Button>
          {loeschenFragen ? (
            <div
              role="alertdialog"
              aria-label="Produkt löschen?"
              className="w-full space-y-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-center text-sm"
            >
              <p>
                „{zeile.name}“ ganz löschen? Bestand, Verlauf, Barcodes und ein
                offener Listeneintrag gehen mit.
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLoeschenFragen(false)}
                >
                  Behalten
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await db.writeTransaction((tx) =>
                      artikelLoeschen(tx, zeile.id),
                    );
                    schliessen();
                    toast(`${zeile.name} gelöscht`);
                  }}
                >
                  <Trash2 /> Löschen
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setLoeschenFragen(true)}
            >
              <Trash2 /> Produkt löschen
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t p-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-full"
          disabled={vorrat.bestand <= 0}
          onClick={aufgebraucht}
        >
          Aufgebraucht
        </Button>
        <Button type="submit" className="h-12 rounded-full">
          Speichern
        </Button>
      </div>
    </form>
  );
}

const GRUND: Record<string, string> = {
  einkauf: "Gekauft",
  verbrauch: "Verbraucht",
  korrektur: "Korrigiert",
};

/** Wer hat wann was gekauft, verbraucht, korrigiert – die letzten 15 Buchungen. */
function Verlauf({ artikelId }: { artikelId: string }) {
  const { data: buchungen } = useQuery<{
    id: string;
    menge: number;
    grund: string;
    erstellt_am: string;
    wer: string | null;
  }>(
    `SELECT b.id, b.menge, b.grund, b.erstellt_am, m.anzeigename AS wer
       FROM vorratsbuchungen b
       LEFT JOIN haushalt_mitglieder m ON m.nutzer_id = b.erstellt_von AND m.haushalt_id = b.haushalt_id
      WHERE b.artikel_id = ?
      ORDER BY b.erstellt_am DESC LIMIT 15`,
    [artikelId],
  );
  if (buchungen.length === 0) {
    return null;
  }
  return (
    <section aria-label="Verlauf">
      <h3 className="pb-1 text-sm font-medium text-muted-foreground">
        Verlauf
      </h3>
      <ul className="divide-y text-sm">
        {buchungen.map((b) => (
          <li key={b.id} className="flex items-center gap-3 py-1.5">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">
              {wann(b.erstellt_am)}
            </span>
            <span className="flex-1">
              {GRUND[b.grund] ?? b.grund}
              {b.wer && (
                <span className="text-muted-foreground"> · {b.wer}</span>
              )}
            </span>
            <span
              className={cn(
                "tabular-nums",
                b.menge > 0 ? "text-primary" : "text-muted-foreground",
              )}
            >
              {b.menge > 0 ? "+" : "−"}
              {stueck(Math.abs(b.menge))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** „1000“, „1,5“ – ohne Tausenderpunkt, damit es sich wieder einlesen lässt. */
function zahlOhnePunkt(zahl: number): string {
  return zahl.toLocaleString("de-DE", {
    maximumFractionDigits: 2,
    useGrouping: false,
  });
}

/** „1.000“ und „1000“ sind tausend, „1,5“ ist anderthalb. */
function zahlLesen(text: string): number {
  const t = text
    .trim()
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  return Number(t);
}

function wann(zeitpunkt: string): string {
  const d = new Date(zeitWert(zeitpunkt));
  const heute = new Date().toDateString() === d.toDateString();
  return heute
    ? `heute ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    : d.toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
}
