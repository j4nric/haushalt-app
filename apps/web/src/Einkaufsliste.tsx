import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import {
  KATEGORIEN,
  kategorieName,
  kategorieRang,
  OHNE_KATEGORIE,
} from "@haushalt/db/kategorien";
import { standardmaessigImVorrat } from "@haushalt/db/vorrat";
import { usePowerSync, useQuery } from "@powersync/react";
import { ChevronDown, NotepadText, ShoppingCart, Trash2 } from "lucide-react";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Eingabeleiste, kategorieVorschlag } from "@/components/Eingabeleiste";
import {
  KategorieSymbol,
  useKategorieFarbe,
} from "@/components/KategorieSymbol";
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
import { Label } from "@/components/ui/label";
import { useEinstellungen } from "@/einstellungen";
import { useWischen } from "@/hooks/use-wischen";
import { ersterBuchstabeGross } from "@/lib/farben";
import { cn } from "@/lib/utils";
import { type Kaufverlauf, ueberfaellige } from "@/lib/vergessen";
import { ABHAK_KLASSE, KritzelStrich, useVerzoegertesAbhaken } from "./Abhaken";
import { Vergessen } from "./Vergessen";
import {
  knalligeFlaeche,
  RASTER,
  SymbolKnopf,
  type VerlaufArtikel,
  VerlaufBlock,
} from "./Verlauf";
import { einkaufBuchen, einkaufZuruecknehmen } from "./vorratsaktionen";
import { FlugEbene, WAGEN_ZIEL, zumWagenFliegen } from "./WagenFlug";

type Zeile = {
  id: string;
  artikel_id: string;
  name: string;
  kategorie: string | null;
  erledigt: number;
  erledigt_von_name: string | null;
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
    `SELECT l.id, l.artikel_id, a.name, a.kategorie, l.erledigt,
            m.anzeigename AS erledigt_von_name
       FROM listeneintraege l
       JOIN artikel a ON a.id = l.artikel_id
       LEFT JOIN haushalt_mitglieder m ON m.nutzer_id = l.erledigt_von AND m.haushalt_id = l.haushalt_id
      WHERE l.haushalt_id = ?
      ORDER BY l.erstellt_am`,
    [haushaltId],
  );
  // Die lokale Datenbank kennt keine Standardwerte der Server-Spalten: Ein gerade erst
  // angelegter Artikel hat archiviert = NULL, bis der Server-Stand zurückkommt.
  const { data: bekannteArtikel } = useQuery<VerlaufArtikel>(
    `SELECT a.id, a.name, a.kategorie,
            EXISTS (SELECT 1 FROM listeneintraege l WHERE l.artikel_id = a.id AND l.erledigt = 0) AS auf_liste,
            COALESCE((SELECT MAX(k.gekauft_am) FROM kaeufe k WHERE k.artikel_id = a.id), a.erstellt_am) AS zuletzt
       FROM artikel a
      WHERE a.haushalt_id = ? AND COALESCE(a.archiviert, 0) = 0
      ORDER BY a.name`,
    [haushaltId],
  );

  // Kaufhistorie je Artikel (ohne offene Einträge) für „Vielleicht vergessen?“.
  const { data: kaufverlaeufe } = useQuery<
    Omit<Kaufverlauf, "kaeufe"> & { kaeufe: string }
  >(
    `SELECT a.id, a.name, a.kategorie, json_group_array(k.gekauft_am) AS kaeufe
       FROM artikel a
       JOIN kaeufe k ON k.artikel_id = a.id
      WHERE a.haushalt_id = ? AND COALESCE(a.archiviert, 0) = 0
        AND NOT EXISTS (SELECT 1 FROM listeneintraege l WHERE l.artikel_id = a.id AND l.erledigt = 0)
      GROUP BY a.id`,
    [haushaltId],
  );
  const vergessen = useMemo(
    () =>
      ueberfaellige(
        kaufverlaeufe.map((a) => ({ ...a, kaeufe: JSON.parse(a.kaeufe) })),
      ),
    [kaufverlaeufe],
  );

  const [name, setName] = useState("");
  const [manuell, setManuell] = useState<string | null>(null);
  const [bearbeitet, setBearbeitet] = useState<Zeile | null>(null);
  /** Kategorie, deren Verlauf aufgeklappt ist ("" = Sonstiges). */
  const [verlaufOffen, setVerlaufOffen] = useState<string | null>(null);
  /** Bereich „Aus dem Verlauf“ aufgeklappt (Akkordeon, anfangs zu). */
  const [weitereOffen, setWeitereOffen] = useState(false);
  const verlaufBlock = useRef<HTMLElement>(null);
  const wagen = useRef<HTMLElement>(null);

  // Ein Tipp außerhalb des aufgeklappten Verlaufs schließt ihn. Ausgenommen sind Knöpfe,
  // die selbst einen Verlauf öffnen („Aus dem Verlauf“), und Meldungen (Rückgängig).
  useEffect(() => {
    if (verlaufOffen == null) {
      return;
    }
    const tippen = (e: PointerEvent) => {
      const ziel = e.target as Element;
      if (
        !verlaufBlock.current?.contains(ziel) &&
        !ziel.closest("[data-verlauf-ausloeser], [data-sonner-toaster]")
      ) {
        setVerlaufOffen(null);
      }
    };
    document.addEventListener("pointerdown", tippen);
    return () => document.removeEventListener("pointerdown", tippen);
  }, [verlaufOffen]);

  const vorschlag = kategorieVorschlag(
    finde(bekannteArtikel, name)?.kategorie,
    erkenneKategorie(name),
    manuell,
  );
  const offen = eintraege.filter((e) => !e.erledigt);
  const imWagen = eintraege.filter((e) => e.erledigt);
  const gruppen = useMemo(() => nachKategorie(offen), [offen]);
  const verlaufNach = useMemo(() => {
    const nach = new Map<string, VerlaufArtikel[]>();
    for (const a of bekannteArtikel) {
      nach.set(a.kategorie ?? "", [...(nach.get(a.kategorie ?? "") ?? []), a]);
    }
    return nach;
  }, [bekannteArtikel]);
  // Kategorien mit Verlauf, aber ohne offene Einträge – in Supermarkt-Reihenfolge.
  const weitereVerlaeufe = [...verlaufNach.keys()]
    .filter((k) => !gruppen.some(([, kategorie]) => (kategorie ?? "") === k))
    .sort((a, b) => kategorieRang(a || null) - kategorieRang(b || null));

  /** Trägt ein; steht der Artikel schon offen auf der Liste, gibt es nur einen Hinweis. */
  async function hinzufuegen(kategorie: string) {
    const artikelName = ersterBuchstabeGross(name);
    const jetzt = new Date().toISOString();

    const schonDa = await db.writeTransaction(async (tx) => {
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
          `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, im_vorrat, archiviert, erstellt_am)
           VALUES (?, ?, ?, ?, 'stueck', ?, 0, ?)`,
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

      await tx.execute(
        "UPDATE artikel SET archiviert = 0 WHERE id = ? AND archiviert = 1",
        [artikelId],
      );

      const offenerEintrag = await tx.getOptional(
        "SELECT 1 FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0",
        [artikelId],
      );
      if (offenerEintrag) {
        return true;
      }
      await tx.execute(
        `INSERT INTO listeneintraege (id, haushalt_id, artikel_id, erledigt, erstellt_von, erstellt_am)
         VALUES (uuid(), ?, ?, 0, ?, ?)`,
        [haushaltId, artikelId, nutzerId, jetzt],
      );
      return false;
    });
    if (schonDa) {
      toast(`${artikelName} steht schon auf der Liste`);
    }
    setName("");
    setManuell(null);
  }

  /**
   * Antippen = gekauft (bucht ins Vorrat); nochmal antippen nimmt es zurück.
   * Steht derselbe Artikel inzwischen wieder offen auf der Liste, wird der Eintrag
   * aus dem Wagen gelöscht statt ein zweites Mal aufzutauchen.
   */
  async function umschalten(eintrag: Zeile) {
    const erledigt = eintrag.erledigt ? 0 : 1;
    await db.writeTransaction(async (tx) => {
      if (!erledigt) {
        await einkaufZuruecknehmen(tx, eintrag.id, nutzerId);
        await tx.execute("DELETE FROM kaeufe WHERE listeneintrag_id = ?", [
          eintrag.id,
        ]);
        const doppelt = await tx.getOptional(
          "SELECT 1 FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0 AND id != ?",
          [eintrag.artikel_id, eintrag.id],
        );
        if (doppelt) {
          await tx.execute("DELETE FROM listeneintraege WHERE id = ?", [
            eintrag.id,
          ]);
          return;
        }
      }
      await tx.execute(
        "UPDATE listeneintraege SET erledigt = ?, erledigt_von = ? WHERE id = ?",
        [erledigt, erledigt ? nutzerId : null, eintrag.id],
      );
      if (erledigt) {
        await einkaufBuchen(tx, eintrag.id, nutzerId);
        // Kaufhistorie für jeden Artikel (Grundlage für „Vielleicht vergessen?“).
        await tx.execute(
          `INSERT INTO kaeufe (id, haushalt_id, artikel_id, listeneintrag_id, gekauft_am, erstellt_von)
           SELECT uuid(), haushalt_id, artikel_id, id, ?, ? FROM listeneintraege WHERE id = ?`,
          [new Date().toISOString(), nutzerId, eintrag.id],
        );
      }
    });
  }

  /** Aus dem Verlauf: wieder auf die Liste setzen. */
  async function ausVerlaufHinzufuegen(artikel: Pick<VerlaufArtikel, "id">) {
    await db.writeTransaction(async (tx) => {
      const offen = await tx.getOptional(
        "SELECT 1 FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0",
        [artikel.id],
      );
      if (!offen) {
        await tx.execute(
          `INSERT INTO listeneintraege (id, haushalt_id, artikel_id, erledigt, erstellt_von, erstellt_am)
           VALUES (uuid(), ?, ?, 0, ?, ?)`,
          [haushaltId, artikel.id, nutzerId, new Date().toISOString()],
        );
      }
    });
  }

  /** Aus dem Verlauf nehmen (ausblenden, nicht löschen – Vorrat hängt am Artikel). */
  async function ausVerlaufNehmen(artikel: VerlaufArtikel) {
    await db.execute("UPDATE artikel SET archiviert = 1 WHERE id = ?", [
      artikel.id,
    ]);
    toast(`${artikel.name} aus dem Verlauf genommen`, {
      action: {
        label: "Rückgängig",
        onClick: () =>
          db.execute("UPDATE artikel SET archiviert = 0 WHERE id = ?", [
            artikel.id,
          ]),
      },
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

  const kachel = (eintrag: Zeile) => (
    <Kachel
      key={eintrag.id}
      eintrag={eintrag}
      umschalten={umschalten}
      bearbeiten={setBearbeitet}
    />
  );

  return (
    <>
      <FlugEbene />
      <Vergessen
        artikel={vergessen}
        hinzufuegen={(id) => ausVerlaufHinzufuegen({ id })}
      />
      {gruppen.map(([gruppe, kategorie, zeilen]) => {
        const schluessel = kategorie ?? "";
        if (verlaufOffen === schluessel) {
          return (
            <VerlaufBlock
              key={gruppe}
              blockRef={verlaufBlock}
              titel={gruppe}
              kategorie={kategorie}
              artikel={verlaufNach.get(schluessel) ?? []}
              schliessen={() => setVerlaufOffen(null)}
              hinzufuegen={ausVerlaufHinzufuegen}
              ausblenden={ausVerlaufNehmen}
            />
          );
        }
        return (
          <KategorieRaster
            key={gruppe}
            titel={gruppe}
            kategorie={kategorie}
            verlaufOeffnen={() => setVerlaufOffen(schluessel)}
          >
            {zeilen.map(kachel)}
          </KategorieRaster>
        );
      })}

      {weitereVerlaeufe.length > 0 && (
        <AusDemVerlauf
          offen={weitereOffen}
          umschalten={() => {
            // Beim Zuklappen auch einen hier geöffneten Verlauf schließen.
            if (
              verlaufOffen != null &&
              weitereVerlaeufe.includes(verlaufOffen)
            ) {
              setVerlaufOffen(null);
            }
            setWeitereOffen(!weitereOffen);
          }}
        >
          {weitereVerlaeufe.map((schluessel) => (
            <li key={schluessel}>
              <VerlaufKnopf
                kategorie={schluessel || null}
                offen={verlaufOffen === schluessel}
                umschalten={() =>
                  setVerlaufOffen(
                    verlaufOffen === schluessel ? null : schluessel,
                  )
                }
              />
            </li>
          ))}
        </AusDemVerlauf>
      )}
      {weitereOffen &&
        verlaufOffen != null &&
        weitereVerlaeufe.includes(verlaufOffen) && (
          <VerlaufBlock
            blockRef={verlaufBlock}
            titel={kategorieName(verlaufOffen || null)}
            kategorie={verlaufOffen || null}
            artikel={verlaufNach.get(verlaufOffen) ?? []}
            schliessen={() => setVerlaufOffen(null)}
            hinzufuegen={ausVerlaufHinzufuegen}
            ausblenden={ausVerlaufNehmen}
          />
        )}

      {imWagen.length > 0 && (
        <Wagen
          bereich={wagen}
          leeren={imWagenLeeren}
          // Direkt unter „Aus dem Verlauf“ ohne Lücke anschließen.
          anschliessend={weitereVerlaeufe.length > 0}
        >
          {imWagen.map(kachel)}
        </Wagen>
      )}

      <ZumWagenKnopf wagen={wagen} anzahl={imWagen.length} />

      {eintraege.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <p>Die Liste ist leer.</p>
          <p className="text-sm">Unten eintragen, was fehlt.</p>
        </div>
      )}

      {offen.length > 0 && (
        <p className="pt-6 text-center text-xs text-muted-foreground">
          Antippen = gekauft · lang drücken = ändern oder löschen · Symbol = aus
          dem Verlauf
        </p>
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
 * Überschrift (in Kategoriefarbe) und ein Raster aus Kacheln. Das Symbol der Kategorie
 * steht einmal links mittig daneben und öffnet den Verlauf.
 */
function KategorieRaster({
  titel,
  kategorie,
  verlaufOeffnen,
  children,
}: {
  titel: string;
  kategorie: string | null;
  verlaufOeffnen: () => void;
  children: ReactNode;
}) {
  const farbe = useKategorieFarbe(kategorie);
  const { spalten, ueberschriften } = useEinstellungen();
  return (
    <section className={ueberschriften ? "mt-5 first:mt-2" : "mt-3 first:mt-2"}>
      <h3
        className={
          ueberschriften
            ? "pb-1.5 pl-[3.25rem] text-xs font-semibold tracking-wide uppercase"
            : "sr-only"
        }
        style={{ color: farbe }}
      >
        {titel}
      </h3>
      <div className="flex items-center gap-3">
        <div className="-ml-1.5 flex w-11 shrink-0 justify-center">
          <SymbolKnopf
            titel={titel}
            kategorie={kategorie}
            offen={false}
            umschalten={verlaufOeffnen}
          />
        </div>
        {/* auto-rows-fr: Alle Zeilen eines Rasters so hoch wie die höchste Kachel. */}
        <ul
          data-spalten={spalten}
          className={cn("grid flex-1 auto-rows-fr gap-2", RASTER[spalten])}
        >
          {children}
        </ul>
      </div>
    </section>
  );
}

/**
 * Kategorien mit Verlauf, aber ohne offene Einträge – als Akkordeon (anfangs zu),
 * abgesetzt wie der Wagen, nur neutral getönt.
 */
function AusDemVerlauf({
  offen,
  umschalten,
  children,
}: {
  offen: boolean;
  umschalten: () => void;
  children: ReactNode;
}) {
  return (
    <section
      aria-label="Aus dem Verlauf"
      className="-mx-4 mt-8 px-4"
      style={{
        background:
          "color-mix(in oklab, var(--background), var(--foreground) 4%)",
        borderTop:
          "1px solid color-mix(in oklab, var(--background), var(--foreground) 12%)",
      }}
    >
      <h3>
        <button
          type="button"
          aria-expanded={offen}
          onClick={umschalten}
          className="flex w-full items-center justify-center gap-2 py-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
        >
          <NotepadText className="size-4" /> Aus dem Verlauf
          <ChevronDown
            className={cn("size-4 transition-transform", offen && "rotate-180")}
          />
        </button>
      </h3>
      {offen && (
        <ul className="flex flex-wrap justify-center gap-2 pb-5 animate-in fade-in">
          {children}
        </ul>
      )}
    </section>
  );
}

/** Der Wagen: abgesetzt durch eine Fläche in der Akzentfarbe, Überschrift mittig. */
function Wagen({
  bereich,
  leeren,
  anschliessend,
  children,
}: {
  bereich: RefObject<HTMLElement | null>;
  leeren: () => void;
  anschliessend: boolean;
  children: ReactNode;
}) {
  const { spalten } = useEinstellungen();
  return (
    <section
      ref={bereich}
      aria-label="Im Wagen"
      className={cn(
        "-mx-4 scroll-mt-16 px-4 pt-4 pb-5",
        anschliessend ? "mt-0" : "mt-8",
      )}
      style={{
        background:
          "color-mix(in oklab, var(--background), var(--primary) 10%)",
        borderTop:
          "1px solid color-mix(in oklab, var(--background), var(--primary) 25%)",
      }}
    >
      <h3 className="flex items-center justify-center gap-2 pb-3 text-sm font-semibold tracking-wide text-primary uppercase">
        <span {...{ [WAGEN_ZIEL]: "" }} className="inline-flex">
          <ShoppingCart className="size-4" />
        </span>{" "}
        Im Wagen
      </h3>
      <ul className={cn("grid auto-rows-fr gap-2", RASTER[spalten])}>
        {children}
      </ul>
      <div className="pt-3 text-center">
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={leeren}
        >
          Wagen leeren
        </Button>
      </div>
    </section>
  );
}

/**
 * Runder Knopf unten mittig: erscheint, sobald etwas gescrollt wurde und der Wagen nicht
 * im Bild ist; ein Tipp scrollt hinunter. Ist ein Teil des Wagens sichtbar, verschwindet er.
 */
function ZumWagenKnopf({
  wagen,
  anzahl,
}: {
  wagen: RefObject<HTMLElement | null>;
  anzahl: number;
}) {
  const [gescrollt, setGescrollt] = useState(false);
  const [wagenSichtbar, setWagenSichtbar] = useState(false);

  useEffect(() => {
    const pruefen = () => setGescrollt(window.scrollY > 40);
    pruefen();
    window.addEventListener("scroll", pruefen, { passive: true });
    return () => window.removeEventListener("scroll", pruefen);
  }, []);

  useEffect(() => {
    const element = wagen.current;
    if (!element || anzahl === 0) {
      setWagenSichtbar(false);
      return;
    }
    // Eingabeleiste und Navigation verdecken unten ~9 rem – die zählen nicht als sichtbar.
    // rootMargin akzeptiert nur px oder %, daher umrechnen.
    const beobachter = new IntersectionObserver(
      ([e]) => setWagenSichtbar(Boolean(e?.isIntersecting)),
      {
        rootMargin: `0px 0px -${9 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)}px 0px`,
      },
    );
    beobachter.observe(element);
    return () => beobachter.disconnect();
  }, [wagen, anzahl]);

  if (anzahl === 0 || !gescrollt || wagenSichtbar) {
    return null;
  }
  return (
    <button
      type="button"
      aria-label={`Zum Wagen (${anzahl})`}
      {...{ [WAGEN_ZIEL]: "" }}
      onClick={() =>
        wagen.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2"
    >
      <ShoppingCart className="size-5" />
      {anzahl}
    </button>
  );
}

/** Knopf „Aus dem Verlauf“ für eine Kategorie ohne offene Einträge. */
function VerlaufKnopf({
  kategorie,
  offen,
  umschalten,
}: {
  kategorie: string | null;
  offen: boolean;
  umschalten: () => void;
}) {
  const farbe = useKategorieFarbe(kategorie);
  const name = kategorieName(kategorie);
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={`Verlauf ${name}`}
      aria-expanded={offen}
      data-verlauf-ausloeser
      onClick={umschalten}
      className="rounded-full"
      style={
        offen
          ? { ...knalligeFlaeche(farbe), borderColor: farbe }
          : { borderColor: farbe, color: farbe }
      }
    >
      <KategorieSymbol
        kategorie={kategorie}
        className={cn("size-4", offen && "text-current!")}
      />
      {name}
    </Button>
  );
}

/** Eine Kachel: antippen = gekauft / zurück, lang drücken = bearbeiten. */
function Kachel({
  eintrag,
  umschalten,
  bearbeiten,
}: {
  eintrag: Zeile;
  umschalten: (e: Zeile) => void;
  bearbeiten: (e: Zeile) => void;
}) {
  const erledigt = eintrag.erledigt === 1;
  const farbe = useKategorieFarbe(eintrag.kategorie);
  const { handler, klick } = useWischen({ lang: () => bearbeiten(eintrag) });
  const { spalten } = useEinstellungen();
  // Bei 3 Spalten etwas kompakter, damit weniger Namen umbrechen.
  const kompakt = spalten === 3;
  // Abhaken mit kurzer Verzögerung (Animation); nochmal antippen bricht ab.
  // Zurücknehmen aus dem Wagen geschieht sofort.
  const knopf = useRef<HTMLButtonElement>(null);
  const abhaken = useVerzoegertesAbhaken(() => {
    // Ab in den Wagen – nur wenn die Kachel noch da ist (sonst kein Startpunkt).
    const r = knopf.current?.getBoundingClientRect();
    if (r) {
      zumWagenFliegen(r, eintrag.name, eintrag.kategorie);
    }
    umschalten(eintrag);
  });

  return (
    <li className="min-w-0">
      {/* biome-ignore lint/a11y/useSemanticElements: Die ganze Kachel ist die Tippfläche und erkennt langes Drücken; ein <input type="checkbox"> kann das nicht. */}
      <button
        ref={knopf}
        type="button"
        role="checkbox"
        aria-checked={erledigt}
        aria-busy={abhaken.laeuft}
        aria-label={eintrag.name}
        {...handler}
        onClick={klick(() =>
          erledigt ? umschalten(eintrag) : abhaken.umschalten(),
        )}
        className={cn(
          "relative flex h-full min-h-14 w-full touch-pan-y flex-col items-center justify-center rounded-xl border py-2 text-center transition-colors select-none active:scale-[0.98]",
          kompakt ? "px-2.5" : "px-3",
          erledigt ? "border-dashed text-foreground/80" : "bg-card shadow-xs",
          abhaken.laeuft && ABHAK_KLASSE,
        )}
        style={
          erledigt
            ? {
                // Im Wagen zurückgenommen, aber gut lesbar: kräftige Strichlinie, zarte Fläche.
                borderColor:
                  "color-mix(in oklab, var(--foreground) 40%, transparent)",
                background: "color-mix(in oklab, var(--card) 70%, transparent)",
              }
            : {
                borderColor: `color-mix(in oklab, ${farbe} 35%, var(--border))`,
                background: `color-mix(in oklab, var(--card), ${farbe} 7%)`,
              }
        }
      >
        {abhaken.laeuft && (
          <span className="contents" style={{ color: farbe }}>
            <KritzelStrich />
          </span>
        )}
        <span
          className={cn(
            "leading-tight font-medium break-words hyphens-auto",
            kompakt ? "text-sm" : "text-base",
            erledigt && "line-through",
          )}
        >
          {eintrag.name}
        </span>
        {erledigt && eintrag.erledigt_von_name && (
          <span className="text-xs">von {eintrag.erledigt_von_name}</span>
        )}
      </button>
    </li>
  );
}

/** Lang gedrückt: Kategorie ändern (gilt auch künftig) oder löschen. */
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
              <DrawerTitle className="flex items-center justify-center gap-2">
                <KategorieSymbol kategorie={eintrag.kategorie} />
                {eintrag.name}
              </DrawerTitle>
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

function finde(artikel: VerlaufArtikel[], name: string) {
  const gesucht = name.trim().toLowerCase();
  return gesucht
    ? artikel.find((a) => a.name.toLowerCase() === gesucht)
    : undefined;
}

/** Gruppiert offene Einträge nach Kategorie, in Supermarkt-Reihenfolge. */
function nachKategorie(zeilen: Zeile[]): [string, string | null, Zeile[]][] {
  const sortiert = [...zeilen].sort(
    (a, b) => kategorieRang(a.kategorie) - kategorieRang(b.kategorie),
  );
  const gruppen = new Map<string, [string, string | null, Zeile[]]>();
  for (const zeile of sortiert) {
    const name = kategorieName(zeile.kategorie);
    const gruppe = gruppen.get(name) ?? [name, zeile.kategorie, []];
    gruppe[2].push(zeile);
    gruppen.set(name, gruppe);
  }
  return [...gruppen.values()];
}
