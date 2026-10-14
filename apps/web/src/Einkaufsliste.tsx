import {
  EINHEITEN,
  type Einheit,
  formatiereMenge,
} from "@haushalt/db/einheiten";
import {
  KATEGORIEN,
  kategorieName,
  kategorieRang,
} from "@haushalt/db/kategorien";
import { standardmaessigImVorrat } from "@haushalt/db/vorrat";
import { usePowerSync, useQuery } from "@powersync/react";
import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eingabeleiste } from "@/components/Eingabeleiste";
import { Gruppe } from "@/components/Gruppe";
import { NativeAuswahl } from "@/components/NativeAuswahl";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWischen } from "@/hooks/use-wischen";
import { cn } from "@/lib/utils";
import { einkaufBuchen, einkaufZuruecknehmen } from "./vorratsaktionen";

type Zeile = {
  id: string;
  artikel_id: string;
  name: string;
  kategorie: string | null;
  menge: number | null;
  einheit: Einheit | null;
  erledigt: number;
  erledigt_von_name: string | null;
};

type Artikel = {
  id: string;
  name: string;
  kategorie: string | null;
  standardeinheit: Einheit;
};

export const EINHEIT_NAMEN: Record<Einheit, string> = {
  stueck: "Stk.",
  g: "g",
  ml: "ml",
};

export function Einkaufsliste({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const { data: eintraege } = useQuery<Zeile>(
    `SELECT l.id, l.artikel_id, a.name, a.kategorie, l.menge, l.einheit, l.erledigt,
            m.anzeigename AS erledigt_von_name
       FROM listeneintraege l
       JOIN artikel a ON a.id = l.artikel_id
       LEFT JOIN haushalt_mitglieder m ON m.nutzer_id = l.erledigt_von AND m.haushalt_id = l.haushalt_id
      WHERE l.haushalt_id = ?
      ORDER BY l.erstellt_am`,
    [haushaltId],
  );
  const { data: bekannteArtikel } = useQuery<Artikel>(
    "SELECT id, name, kategorie, standardeinheit FROM artikel WHERE haushalt_id = ? ORDER BY name",
    [haushaltId],
  );

  const [name, setName] = useState("");
  const [menge, setMenge] = useState("");
  const [einheit, setEinheit] = useState<Einheit>("stueck");
  const [kategorie, setKategorie] = useState("");
  const [bearbeitet, setBearbeitet] = useState<Zeile | null>(null);

  const offen = eintraege.filter((e) => !e.erledigt);
  const imWagen = eintraege.filter((e) => e.erledigt);
  const gruppen = useMemo(() => nachKategorie(offen), [offen]);

  /** Bekannter Artikel getippt? Dann seine Kategorie und Einheit vorschlagen. */
  function nameAendern(wert: string) {
    setName(wert);
    const bekannt = finde(bekannteArtikel, wert);
    if (bekannt) {
      setKategorie(bekannt.kategorie ?? "");
      setEinheit(bekannt.standardeinheit);
    }
  }

  async function hinzufuegen() {
    const artikelName = name.trim();
    const zahl = menge.trim() === "" ? null : Number(menge.replace(",", "."));
    const jetzt = new Date().toISOString();

    // Artikel wiederverwenden, falls der Haushalt ihn schon kennt – sonst neu anlegen.
    await db.writeTransaction(async (tx) => {
      const vorhanden = await tx.getOptional<{
        id: string;
        kategorie: string | null;
      }>(
        "SELECT id, kategorie FROM artikel WHERE haushalt_id = ? AND lower(name) = lower(?)",
        [haushaltId, artikelName],
      );
      let artikelId = vorhanden?.id;
      if (!artikelId) {
        artikelId = crypto.randomUUID();
        await tx.execute(
          `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, im_vorrat, erstellt_am)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            artikelId,
            haushaltId,
            artikelName,
            kategorie || null,
            einheit,
            standardmaessigImVorrat(kategorie) ? 1 : 0,
            jetzt,
          ],
        );
      } else if ((vorhanden?.kategorie ?? "") !== kategorie) {
        // Kategorie geändert: gilt ab jetzt für diesen Artikel.
        await tx.execute("UPDATE artikel SET kategorie = ? WHERE id = ?", [
          kategorie || null,
          artikelId,
        ]);
      }
      await tx.execute(
        `INSERT INTO listeneintraege (id, haushalt_id, artikel_id, menge, einheit, erledigt, erstellt_von, erstellt_am)
         VALUES (uuid(), ?, ?, ?, ?, 0, ?, ?)`,
        [
          haushaltId,
          artikelId,
          zahl && zahl > 0 ? zahl : null,
          zahl ? einheit : null,
          nutzerId,
          jetzt,
        ],
      );
    });
    setName("");
    setMenge("");
    setKategorie("");
  }

  /** Abhaken bucht ins Vorrat, Zurücknehmen entfernt die Buchung wieder. */
  async function umschalten(eintrag: Zeile) {
    const erledigt = eintrag.erledigt ? 0 : 1;
    const gebucht = await db.writeTransaction(async (tx) => {
      await tx.execute(
        "UPDATE listeneintraege SET erledigt = ?, erledigt_von = ? WHERE id = ?",
        [erledigt, erledigt ? nutzerId : null, eintrag.id],
      );
      if (erledigt) {
        return einkaufBuchen(tx, eintrag.id, nutzerId);
      }
      await einkaufZuruecknehmen(tx, eintrag.id, nutzerId);
      return true;
    });
    if (!gebucht) {
      toast.info(`${eintrag.name} wurde nicht in den Vorrat gebucht`, {
        description:
          "Ohne passende Menge geht das nicht automatisch. Bitte im Vorrat nachtragen.",
      });
    }
  }

  /** Löschen mit „Rückgängig“: Die Zeile wird vorher gemerkt und bei Bedarf neu angelegt. */
  async function loeschen(eintrag: Zeile) {
    const zeile = await db.getOptional<Record<string, unknown>>(
      "SELECT * FROM listeneintraege WHERE id = ?",
      [eintrag.id],
    );
    await db.execute("DELETE FROM listeneintraege WHERE id = ?", [eintrag.id]);
    if (!zeile) {
      return;
    }
    toast(`${eintrag.name} gelöscht`, {
      action: {
        label: "Rückgängig",
        onClick: () => {
          const spalten = Object.keys(zeile);
          db.execute(
            `INSERT INTO listeneintraege (${spalten.join(", ")}) VALUES (${spalten.map(() => "?").join(", ")})`,
            spalten.map((s) => zeile[s]),
          );
        },
      },
    });
  }

  function imWagenLeeren() {
    return db.execute(
      "DELETE FROM listeneintraege WHERE haushalt_id = ? AND erledigt = 1",
      [haushaltId],
    );
  }

  return (
    <>
      {gruppen.map(([gruppe, zeilen]) => (
        <Gruppe key={gruppe} titel={gruppe}>
          {zeilen.map((eintrag) => (
            <Eintrag
              key={eintrag.id}
              eintrag={eintrag}
              umschalten={umschalten}
              loeschen={loeschen}
              bearbeiten={setBearbeitet}
            />
          ))}
        </Gruppe>
      ))}

      {imWagen.length > 0 && (
        <Gruppe
          titel="Im Wagen"
          aktion={
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 normal-case"
              onClick={imWagenLeeren}
            >
              Leeren
            </Button>
          }
        >
          {imWagen.map((eintrag) => (
            <Eintrag
              key={eintrag.id}
              eintrag={eintrag}
              umschalten={umschalten}
              loeschen={loeschen}
              bearbeiten={setBearbeitet}
            />
          ))}
        </Gruppe>
      )}

      {eintraege.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <p>Die Liste ist leer.</p>
          <p className="text-sm">Unten eintragen, was fehlt.</p>
        </div>
      )}

      <EintragBearbeiten
        eintrag={bearbeitet}
        schliessen={() => setBearbeitet(null)}
        loeschen={loeschen}
      />

      <Eingabeleiste
        wert={name}
        aendern={nameAendern}
        absenden={hinzufuegen}
        platzhalter="Was fehlt?"
        label="Neuer Eintrag"
        absendenLabel="Hinzufügen"
        vorschlaege={bekannteArtikel.map((a) => a.name)}
        details={
          <>
            <Input
              value={menge}
              onChange={(e) => setMenge(e.target.value)}
              inputMode="decimal"
              placeholder="Menge"
              aria-label="Menge"
              className="h-11 text-base"
            />
            <NativeAuswahl
              value={einheit}
              onChange={(e) => setEinheit(e.target.value as Einheit)}
              aria-label="Einheit"
            >
              {EINHEITEN.map((e) => (
                <option key={e} value={e}>
                  {EINHEIT_NAMEN[e]}
                </option>
              ))}
            </NativeAuswahl>
            <NativeAuswahl
              value={kategorie}
              onChange={(e) => setKategorie(e.target.value)}
              aria-label="Kategorie"
            >
              <option value="">Kategorie …</option>
              {KATEGORIEN.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </NativeAuswahl>
          </>
        }
      />
    </>
  );
}

/** Eine Zeile: antippen = abhaken, nach links wischen = löschen, lang drücken = bearbeiten. */
function Eintrag({
  eintrag,
  umschalten,
  loeschen,
  bearbeiten,
}: {
  eintrag: Zeile;
  umschalten: (e: Zeile) => void;
  loeschen: (e: Zeile) => void;
  bearbeiten: (e: Zeile) => void;
}) {
  const erledigt = eintrag.erledigt === 1;
  const { versatz, handler, klick } = useWischen({
    loeschen: () => loeschen(eintrag),
    lang: () => bearbeiten(eintrag),
  });

  return (
    <li className="relative overflow-hidden">
      {/* Liegt unter der Zeile und wird beim Wischen sichtbar. */}
      <div
        className="absolute inset-0 flex items-center justify-end bg-destructive px-5 text-white"
        aria-hidden
      >
        <Trash2 className="size-5" />
      </div>
      <div
        className="relative flex items-center bg-card transition-transform"
        style={{
          transform: `translateX(${versatz}px)`,
          transitionDuration: versatz ? "0ms" : "150ms",
        }}
      >
        {/* biome-ignore lint/a11y/useSemanticElements: Die ganze Zeile ist die Tippfläche und trägt die Wisch-Gesten; ein <input type="checkbox"> kann das nicht. */}
        <button
          type="button"
          role="checkbox"
          aria-checked={erledigt}
          {...handler}
          onClick={klick(() => umschalten(eintrag))}
          className="flex min-h-14 flex-1 touch-pan-y items-center gap-3 px-4 py-2 text-left select-none"
        >
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              erledigt
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input",
            )}
          >
            {erledigt && <Check className="size-4" strokeWidth={3} />}
          </span>
          <span className={cn("flex-1", erledigt && "text-muted-foreground")}>
            {/* Nur Name und Menge durchstreichen, nicht „von …“. */}
            <span className={cn(erledigt && "line-through")}>
              <span className="text-base">{eintrag.name}</span>
              {eintrag.menge && eintrag.einheit && (
                <span className="ml-2 text-sm text-muted-foreground tabular-nums">
                  {formatiereMenge(eintrag.menge, eintrag.einheit)}
                </span>
              )}
            </span>
            {erledigt && eintrag.erledigt_von_name && (
              <span className="block text-xs">
                von {eintrag.erledigt_von_name}
              </span>
            )}
          </span>
        </button>
        {/* Am Rechner (mit Maus) statt Wischen und langem Drücken. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 hidden text-muted-foreground [@media(hover:hover)]:flex"
              aria-label={`Aktionen für ${eintrag.name}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => bearbeiten(eintrag)}>
              <Pencil /> Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => loeschen(eintrag)}
            >
              <Trash2 /> Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

/** Menge, Einheit und Kategorie eines Eintrags nachträglich ändern. */
function EintragBearbeiten({
  eintrag,
  schliessen,
  loeschen,
}: {
  eintrag: Zeile | null;
  schliessen: () => void;
  loeschen: (e: Zeile) => void;
}) {
  const db = usePowerSync();
  return (
    <Drawer
      open={eintrag != null}
      onOpenChange={(offen) => !offen && schliessen()}
    >
      <DrawerContent>
        {eintrag && (
          <form
            key={eintrag.id}
            className="mx-auto w-full max-w-lg"
            onSubmit={async (e) => {
              e.preventDefault();
              const daten = new FormData(e.currentTarget);
              const roh = String(daten.get("menge")).trim().replace(",", ".");
              const zahl = roh === "" ? null : Number(roh);
              const gueltig =
                zahl != null && Number.isFinite(zahl) && zahl > 0 ? zahl : null;
              const kategorie = String(daten.get("kategorie")) || null;
              await db.writeTransaction(async (tx) => {
                await tx.execute(
                  "UPDATE listeneintraege SET menge = ?, einheit = ? WHERE id = ?",
                  [
                    gueltig,
                    gueltig ? String(daten.get("einheit")) : null,
                    eintrag.id,
                  ],
                );
                if (kategorie !== eintrag.kategorie) {
                  await tx.execute(
                    "UPDATE artikel SET kategorie = ? WHERE id = ?",
                    [kategorie, eintrag.artikel_id],
                  );
                }
              });
              schliessen();
            }}
          >
            <DrawerHeader>
              <DrawerTitle>{eintrag.name}</DrawerTitle>
              <DrawerDescription>Menge und Kategorie ändern</DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-[1fr_auto] gap-3 px-4">
              <div className="space-y-1.5">
                <Label htmlFor="bearbeiten-menge">Menge</Label>
                <Input
                  id="bearbeiten-menge"
                  name="menge"
                  inputMode="decimal"
                  defaultValue={eintrag.menge ?? ""}
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bearbeiten-einheit">Einheit</Label>
                <NativeAuswahl
                  id="bearbeiten-einheit"
                  name="einheit"
                  defaultValue={eintrag.einheit ?? "stueck"}
                >
                  {EINHEITEN.map((e) => (
                    <option key={e} value={e}>
                      {EINHEIT_NAMEN[e]}
                    </option>
                  ))}
                </NativeAuswahl>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="bearbeiten-kategorie">Kategorie</Label>
                <NativeAuswahl
                  id="bearbeiten-kategorie"
                  name="kategorie"
                  defaultValue={eintrag.kategorie ?? ""}
                  className="w-full"
                >
                  <option value="">Sonstiges</option>
                  {KATEGORIEN.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </NativeAuswahl>
              </div>
            </div>
            <DrawerFooter className="grid grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 text-destructive"
                onClick={() => {
                  schliessen();
                  loeschen(eintrag);
                }}
              >
                <Trash2 /> Löschen
              </Button>
              <Button type="submit" className="h-11">
                Speichern
              </Button>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function finde(artikel: Artikel[], name: string) {
  const gesucht = name.trim().toLowerCase();
  return artikel.find((a) => a.name.toLowerCase() === gesucht);
}

/** Gruppiert offene Einträge nach Kategorie, in Supermarkt-Reihenfolge. */
function nachKategorie(zeilen: Zeile[]): [string, Zeile[]][] {
  const sortiert = [...zeilen].sort(
    (a, b) => kategorieRang(a.kategorie) - kategorieRang(b.kategorie),
  );
  const gruppen = new Map<string, Zeile[]>();
  for (const zeile of sortiert) {
    const gruppe = kategorieName(zeile.kategorie);
    gruppen.set(gruppe, [...(gruppen.get(gruppe) ?? []), zeile]);
  }
  return [...gruppen];
}
