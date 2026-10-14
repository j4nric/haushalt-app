import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import {
  KATEGORIEN,
  kategorieName,
  kategorieRang,
  OHNE_KATEGORIE,
} from "@haushalt/db/kategorien";
import { standardmaessigImVorrat } from "@haushalt/db/vorrat";
import { usePowerSync, useQuery } from "@powersync/react";
import {
  Check,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eingabeleiste, kategorieVorschlag } from "@/components/Eingabeleiste";
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
import { Label } from "@/components/ui/label";
import { useWischen } from "@/hooks/use-wischen";
import { cn } from "@/lib/utils";
import { einkaufBuchen, einkaufZuruecknehmen } from "./vorratsaktionen";

type Zeile = {
  id: string;
  artikel_id: string;
  name: string;
  kategorie: string | null;
  /** Anzahl in Stück; leer bedeutet 1. */
  menge: number | null;
  erledigt: number;
  erledigt_von_name: string | null;
};

type Artikel = { id: string; name: string; kategorie: string | null };

const anzahl = (zeile: { menge: number | null }) => zeile.menge ?? 1;

export function Einkaufsliste({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const { data: eintraege } = useQuery<Zeile>(
    `SELECT l.id, l.artikel_id, a.name, a.kategorie, l.menge, l.erledigt,
            m.anzeigename AS erledigt_von_name
       FROM listeneintraege l
       JOIN artikel a ON a.id = l.artikel_id
       LEFT JOIN haushalt_mitglieder m ON m.nutzer_id = l.erledigt_von AND m.haushalt_id = l.haushalt_id
      WHERE l.haushalt_id = ?
      ORDER BY l.erstellt_am`,
    [haushaltId],
  );
  const { data: bekannteArtikel } = useQuery<Artikel>(
    "SELECT id, name, kategorie FROM artikel WHERE haushalt_id = ? ORDER BY name",
    [haushaltId],
  );

  const [name, setName] = useState("");
  const [manuell, setManuell] = useState<string | null>(null);
  const [bearbeitet, setBearbeitet] = useState<Zeile | null>(null);

  const vorschlag = kategorieVorschlag(
    finde(bekannteArtikel, name)?.kategorie,
    erkenneKategorie(name),
    manuell,
  );
  const offen = eintraege.filter((e) => !e.erledigt);
  const imWagen = eintraege.filter((e) => e.erledigt);
  const gruppen = useMemo(() => nachKategorie(offen), [offen]);

  /**
   * Trägt ein. Steht der Artikel schon offen auf der Liste, zählt das die Anzahl
   * hoch statt eine zweite Zeile anzulegen.
   */
  async function hinzufuegen(kategorie: string) {
    const artikelName = name.trim();
    const jetzt = new Date().toISOString();

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
           VALUES (?, ?, ?, ?, 'stueck', ?, ?)`,
          [
            artikelId,
            haushaltId,
            artikelName,
            kategorie || null,
            standardmaessigImVorrat(kategorie) ? 1 : 0,
            jetzt,
          ],
        );
      } else if ((vorhanden?.kategorie ?? "") !== kategorie) {
        // Kategorie gewählt oder geändert: gilt ab jetzt für diesen Artikel.
        await tx.execute("UPDATE artikel SET kategorie = ? WHERE id = ?", [
          kategorie || null,
          artikelId,
        ]);
      }

      const offenerEintrag = await tx.getOptional<{ id: string }>(
        "SELECT id FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0",
        [artikelId],
      );
      if (offenerEintrag) {
        await tx.execute(
          "UPDATE listeneintraege SET menge = COALESCE(menge, 1) + 1, einheit = 'stueck' WHERE id = ?",
          [offenerEintrag.id],
        );
      } else {
        await tx.execute(
          `INSERT INTO listeneintraege (id, haushalt_id, artikel_id, menge, einheit, erledigt, erstellt_von, erstellt_am)
           VALUES (uuid(), ?, ?, 1, 'stueck', 0, ?, ?)`,
          [haushaltId, artikelId, nutzerId, jetzt],
        );
      }
    });
    setName("");
    setManuell(null);
  }

  function anzahlAendern(eintrag: Zeile, um: number) {
    const neu = Math.max(1, anzahl(eintrag) + um);
    return db.execute(
      "UPDATE listeneintraege SET menge = ?, einheit = 'stueck' WHERE id = ?",
      [neu, eintrag.id],
    );
  }

  /** Abhaken bucht ins Vorrat, Zurücknehmen entfernt die Buchung wieder. */
  async function umschalten(eintrag: Zeile) {
    const erledigt = eintrag.erledigt ? 0 : 1;
    await db.writeTransaction(async (tx) => {
      await tx.execute(
        "UPDATE listeneintraege SET erledigt = ?, erledigt_von = ? WHERE id = ?",
        [erledigt, erledigt ? nutzerId : null, eintrag.id],
      );
      if (erledigt) {
        await einkaufBuchen(tx, eintrag.id, nutzerId);
      } else {
        await einkaufZuruecknehmen(tx, eintrag.id, nutzerId);
      }
    });
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

  const zeile = (eintrag: Zeile) => (
    <Eintrag
      key={eintrag.id}
      eintrag={eintrag}
      umschalten={umschalten}
      loeschen={loeschen}
      bearbeiten={setBearbeitet}
      anzahlAendern={anzahlAendern}
    />
  );

  return (
    <>
      {gruppen.map(([gruppe, zeilen]) => (
        <Gruppe key={gruppe} titel={gruppe}>
          {zeilen.map(zeile)}
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
          {imWagen.map(zeile)}
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
        aendern={(wert) => {
          setName(wert);
          setManuell(null);
        }}
        absenden={hinzufuegen}
        platzhalter="Was fehlt?"
        label="Neuer Eintrag"
        absendenLabel="Hinzufügen"
        kategorie={vorschlag.kategorie}
        kategorieAendern={setManuell}
        auswahl={vorschlag.auswahl}
        vorschlaege={bekannteArtikel.map((a) => a.name)}
      />
    </>
  );
}

/**
 * Eine Zeile: antippen = abhaken, nach links wischen = löschen, lang drücken = bearbeiten.
 * Offene Einträge haben − / Anzahl / +.
 */
function Eintrag({
  eintrag,
  umschalten,
  loeschen,
  bearbeiten,
  anzahlAendern,
}: {
  eintrag: Zeile;
  umschalten: (e: Zeile) => void;
  loeschen: (e: Zeile) => void;
  bearbeiten: (e: Zeile) => void;
  anzahlAendern: (e: Zeile, um: number) => void;
}) {
  const erledigt = eintrag.erledigt === 1;
  const stueck = anzahl(eintrag);
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
          className="flex min-h-14 flex-1 touch-pan-y items-center gap-3 py-2 pl-4 text-left select-none"
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
            {/* Nur den Namen durchstreichen, nicht „von …“. */}
            <span className={cn("text-base", erledigt && "line-through")}>
              {eintrag.name}
              {erledigt && stueck > 1 && (
                <span className="ml-2 text-sm tabular-nums">{stueck}×</span>
              )}
            </span>
            {erledigt && eintrag.erledigt_von_name && (
              <span className="block text-xs">
                von {eintrag.erledigt_von_name}
              </span>
            )}
          </span>
        </button>

        {!erledigt && (
          <div className="flex items-center gap-0.5 pr-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-muted-foreground"
              aria-label={`${eintrag.name} weniger`}
              disabled={stueck <= 1}
              onClick={() => anzahlAendern(eintrag, -1)}
            >
              <Minus />
            </Button>
            <output
              aria-label={`Anzahl ${eintrag.name}`}
              className="min-w-6 text-center tabular-nums"
            >
              {stueck}
            </output>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full text-muted-foreground"
              aria-label={`${eintrag.name} mehr`}
              onClick={() => anzahlAendern(eintrag, 1)}
            >
              <Plus />
            </Button>
          </div>
        )}

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
              <Pencil /> Kategorie ändern
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

/** Kategorie eines Artikels nachträglich ändern (gilt auch für künftige Einträge). */
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
              const kategorie =
                String(new FormData(e.currentTarget).get("kategorie")) || null;
              if (kategorie !== eintrag.kategorie) {
                await db.execute(
                  "UPDATE artikel SET kategorie = ? WHERE id = ?",
                  [kategorie, eintrag.artikel_id],
                );
              }
              schliessen();
            }}
          >
            <DrawerHeader>
              <DrawerTitle>{eintrag.name}</DrawerTitle>
              <DrawerDescription>
                Die Kategorie gilt auch für künftige Einträge.
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-1.5 px-4">
              <Label htmlFor="bearbeiten-kategorie">Kategorie</Label>
              <NativeAuswahl
                id="bearbeiten-kategorie"
                name="kategorie"
                defaultValue={eintrag.kategorie ?? ""}
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
  return gesucht
    ? artikel.find((a) => a.name.toLowerCase() === gesucht)
    : undefined;
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
