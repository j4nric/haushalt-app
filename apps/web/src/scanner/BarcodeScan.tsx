import type { Einheit } from "@haushalt/db/einheiten";
import { usePowerSync, useQuery } from "@powersync/react";
import { LoaderCircle, ScanBarcode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { artikelFindenOderAnlegen } from "../listenaktionen";
import { kurzname, packungsmenge, passendeArtikel } from "./produktname";
import { type ScanAntwort, Scanner } from "./Scanner";

export type GescannterArtikel = {
  id: string;
  name: string;
  /** Packungsgröße dieses Barcodes, falls bekannt („500 g“). */
  packung: { menge: number; einheit: Einheit } | null;
};

type Produkt = {
  barcode: string;
  gefunden: boolean;
  name: string | null;
  marke: string | null;
  menge: string | null;
};

/**
 * Scannen → bekannter Barcode: sofort `aktion` (z. B. auf die Liste, abhaken, in den
 * Vorrat), weiter scannen. Unbekannt: Produktdaten holen, Namen bestätigen oder mit
 * vorhandenem Artikel verknüpfen, dann `aktion`. Die Verknüpfung gilt fürs nächste
 * Mal – auch offline.
 */
export function BarcodeScan({
  haushaltId,
  titel,
  aktionText,
  aktion,
}: {
  haushaltId: string;
  titel: string;
  /** Beschriftung des Speichern-Knopfs, z. B. „Auf die Liste“. */
  aktionText: string;
  /** Führt die Aktion aus und gibt die Meldung zurück („Milch abgehakt“). */
  aktion: (a: GescannterArtikel) => Promise<string>;
}) {
  const db = usePowerSync();
  const [scannen, setScannen] = useState(false);
  const [unbekannt, setUnbekannt] = useState<string | null>(null);

  async function erkannt(barcode: string): Promise<ScanAntwort> {
    const bekannt = await db.getOptional<{
      id: string;
      name: string;
      packung_menge: number | null;
      packung_einheit: Einheit | null;
    }>(
      `SELECT a.id, a.name, b.packung_menge, b.packung_einheit
         FROM artikel_barcodes b JOIN artikel a ON a.id = b.artikel_id
        WHERE b.haushalt_id = ? AND b.barcode = ?
        ORDER BY b.erstellt_am DESC LIMIT 1`,
      [haushaltId, barcode],
    );
    if (bekannt) {
      const meldung = await aktion({
        id: bekannt.id,
        name: bekannt.name,
        packung:
          bekannt.packung_menge != null && bekannt.packung_einheit
            ? { menge: bekannt.packung_menge, einheit: bekannt.packung_einheit }
            : null,
      });
      return { meldung };
    }
    setUnbekannt(barcode);
    return "schliessen";
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="size-11 shrink-0 rounded-full"
        aria-label="Barcode scannen"
        onClick={() => setScannen(true)}
      >
        <ScanBarcode />
      </Button>
      <Scanner
        offen={scannen}
        schliessen={() => setScannen(false)}
        erkannt={erkannt}
        titel={titel}
      />
      <Unbekannt
        barcode={unbekannt}
        schliessen={() => setUnbekannt(null)}
        haushaltId={haushaltId}
        aktionText={aktionText}
        fertig={async (a) => {
          setUnbekannt(null);
          toast.success(await aktion(a));
        }}
      />
    </>
  );
}

function Unbekannt({
  barcode,
  schliessen,
  haushaltId,
  aktionText,
  fertig,
}: {
  barcode: string | null;
  schliessen: () => void;
  haushaltId: string;
  aktionText: string;
  fertig: (a: GescannterArtikel) => void;
}) {
  const db = usePowerSync();
  const { data: artikel } = useQuery<{ id: string; name: string }>(
    "SELECT id, name FROM artikel WHERE haushalt_id = ? ORDER BY name",
    [haushaltId],
  );
  const [produkt, setProdukt] = useState<Produkt | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [offline, setOffline] = useState(false);
  const [name, setName] = useState("");
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [geladenFuer, setGeladenFuer] = useState<string | null>(null);

  // Beim Öffnen einmal die Produktdaten holen.
  if (barcode && geladenFuer !== barcode) {
    setGeladenFuer(barcode);
    setProdukt(null);
    setName("");
    setGewaehlt(null);
    setOffline(false);
    setLaedt(true);
    fetch(`/api/produkte/${barcode}`)
      .then(async (a) => {
        if (!a.ok) {
          throw new Error();
        }
        const p = (await a.json()) as Produkt;
        setProdukt(p);
        if (p.name) {
          setName(kurzname(p.name, p.marke));
          setGewaehlt(passendeArtikel(p.name, artikel)[0]?.id ?? null);
        }
      })
      .catch(() => setOffline(true))
      .finally(() => setLaedt(false));
  }

  const vorschlaege = produkt?.name
    ? passendeArtikel(produkt.name, artikel)
    : [];

  async function speichern() {
    if (!barcode || (!gewaehlt && !name.trim())) {
      return;
    }
    const packung = packungsmenge(produkt?.menge ?? null);
    const ergebnis = await db.writeTransaction(async (tx) => {
      const ziel = gewaehlt
        ? artikel.find((a) => a.id === gewaehlt)
        : await artikelFindenOderAnlegen(tx, {
            haushaltId,
            name,
            packung,
          });
      if (!ziel) {
        return null;
      }
      // Kennt der Artikel seine Packungsgröße noch nicht, verrät sie der Barcode.
      if (packung) {
        await tx.execute(
          "UPDATE artikel SET packung_menge = ?, packung_einheit = ? WHERE id = ? AND packung_menge IS NULL",
          [packung.menge, packung.einheit, ziel.id],
        );
      }
      await tx.execute(
        `INSERT INTO artikel_barcodes (id, haushalt_id, artikel_id, barcode, packung_menge, packung_einheit, erstellt_am)
         VALUES (uuid(), ?, ?, ?, ?, ?, ?)`,
        [
          haushaltId,
          ziel.id,
          barcode,
          packung?.menge ?? null,
          packung?.einheit ?? null,
          new Date().toISOString(),
        ],
      );
      return { id: ziel.id, name: ziel.name, packung };
    });
    if (ergebnis) {
      fertig(ergebnis);
    }
  }

  return (
    <Drawer open={barcode != null} onOpenChange={(o) => !o && schliessen()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Neues Produkt</DrawerTitle>
            <DrawerDescription>
              {laedt
                ? "Suche in der Produktdatenbank …"
                : offline
                  ? "Ohne Internet keine Produktdaten – einfach benennen."
                  : produkt?.gefunden
                    ? `${produkt.marke ? `${produkt.marke} · ` : ""}${produkt.name}${produkt.menge ? ` · ${produkt.menge}` : ""}`
                    : "Nicht in der Produktdatenbank – einfach benennen."}
            </DrawerDescription>
          </DrawerHeader>
          {laedt ? (
            <LoaderCircle className="mx-auto my-6 size-6 animate-spin text-muted-foreground" />
          ) : (
            <div className="space-y-4 px-4">
              {vorschlaege.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Ist das …</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vorschlaege.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        aria-pressed={gewaehlt === a.id}
                        onClick={() => setGewaehlt(a.id)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm",
                          gewaehlt === a.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-card",
                        )}
                      >
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div
                className={cn(
                  "space-y-1.5 transition-opacity",
                  gewaehlt && "opacity-50",
                )}
              >
                <Label htmlFor="scan-name">
                  {vorschlaege.length > 0 ? "… oder neu als" : "Name"}
                </Label>
                <Input
                  id="scan-name"
                  value={name}
                  onFocus={() => setGewaehlt(null)}
                  onChange={(e) => {
                    setName(e.target.value);
                    setGewaehlt(null);
                  }}
                  placeholder="z. B. Milch"
                  className="h-11 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Barcode {barcode} – wird beim nächsten Scan sofort erkannt.
                  {produkt?.gefunden && (
                    <>
                      {" "}
                      Produktdaten:{" "}
                      <a
                        href={`https://world.openfoodfacts.org/product/${barcode}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline underline-offset-2"
                      >
                        Open Food Facts
                      </a>{" "}
                      (ODbL).
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
          <DrawerFooter>
            <Button
              className="h-12 rounded-full text-base"
              disabled={laedt || (!gewaehlt && !name.trim())}
              onClick={speichern}
            >
              {aktionText}
              {(gewaehlt || name.trim()) &&
                ` als „${gewaehlt ? (artikel.find((a) => a.id === gewaehlt)?.name ?? "") : name.trim()}“`}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
