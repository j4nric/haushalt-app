import { formatiereMenge } from "@haushalt/db/einheiten";
import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { findeNachName } from "@haushalt/db/namen";
import {
  bestandBeschreibung,
  eingekauftePackungen,
  gelerntePackung,
  packungVon,
} from "@haushalt/db/vorrat";
import { zerlegeEingabe } from "@haushalt/db/zutaten";
import { usePowerSync, useQuery } from "@powersync/react";
import type { AbstractPowerSyncDatabase } from "@powersync/web";
import {
  ClipboardCheck,
  Minus,
  PackageOpen,
  PackageX,
  Plus,
  Refrigerator,
  SearchX,
  ShoppingCart,
  Snowflake,
} from "lucide-react";
import { memo, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Eingabeleiste, kategorieVorschlag } from "@/components/Eingabeleiste";
import { Gruppe } from "@/components/Gruppe";
import { KategorieSymbol } from "@/components/KategorieSymbol";
import { Button } from "@/components/ui/button";
import { Wischzeile } from "@/components/Wischzeile";
import { cn } from "@/lib/utils";
import { zeitWert } from "@/lib/zeit";
import { BonImport } from "./kassenbon/BonImport";
import { artikelFindenOderAnlegen, aufListeSetzen } from "./listenaktionen";
import { BarcodeScan, type GescannterArtikel } from "./scanner/BarcodeScan";
import { Details } from "./vorrat/Details";
import {
  gruppieren,
  istKnapp,
  istLeer,
  istSichtbar,
  stueck,
  VORRAT_ABFRAGE,
  type VorratsZeile,
  vorratVon,
} from "./vorrat/daten";
import { LAGERORT_NAME, restAlter } from "./vorrat/gerichte";
import { Inventur } from "./vorrat/Inventur";
import {
  bestandSetzen,
  buchen,
  einsVerbrauchen,
  mindestbestandPruefen,
} from "./vorratsaktionen";

type Filter = "alle" | "knapp" | "leer";

export function Vorrat({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const { data: alleZeilen } = useQuery<VorratsZeile>(VORRAT_ABFRAGE, [
    haushaltId,
  ]);
  const zeilen = alleZeilen.filter(istSichtbar);
  const { data: andere } = useQuery<{ id: string; name: string }>(
    "SELECT id, name FROM artikel WHERE haushalt_id = ? AND COALESCE(im_vorrat, 0) = 0 ORDER BY name",
    [haushaltId],
  );
  const [details, setDetails] = useState<string | null>(null);
  const [inventur, setInventur] = useState(false);
  const [filter, setFilter] = useState<Filter>("alle");
  // Was unten getippt wird, sucht zugleich im Vorrat.
  const [eingabe, setEingabe] = useState("");
  const suche = zerlegeEingabe(eingabe).name.trim().toLowerCase();
  const detailZeile = zeilen.find((z) => z.id === details) ?? null;

  const knapp = zeilen.filter(istKnapp).length;
  const leer = zeilen.filter(istLeer).length;
  const sichtbar = zeilen.filter(
    (z) =>
      (filter === "alle" ||
        (filter === "knapp" && istKnapp(z)) ||
        (filter === "leer" && istLeer(z))) &&
      (!suche || z.name.toLowerCase().includes(suche)),
  );
  const gruppen = gruppieren(sichtbar.filter((z) => !z.gericht));
  // Eigener Bereich oben: Reste (älteste zuerst – die sollten zuerst weg) und Fertiggerichte.
  const reste = sichtbar
    .filter((z) => z.gericht === "rest")
    .sort((a, b) =>
      (a.eingelagert_am ?? "").localeCompare(b.eingelagert_am ?? ""),
    );
  const fertiggerichte = sichtbar.filter((z) => z.gericht === "fertig");
  const weitere = andere.filter(
    (a) => !suche || a.name.toLowerCase().includes(suche),
  );

  const plus = (zeile: VorratsZeile) =>
    db.writeTransaction(async (tx) => {
      await buchen(tx, {
        haushaltId,
        artikelId: zeile.id,
        menge: 1,
        grund: "korrektur",
        nutzerId,
      });
      await mindestbestandPruefen(tx, zeile.id, nutzerId);
    });
  const minus = (zeile: VorratsZeile) =>
    db.writeTransaction((tx) =>
      einsVerbrauchen(tx, { haushaltId, artikelId: zeile.id, nutzerId }),
    );

  async function aufgebraucht(zeile: VorratsZeile) {
    const vorher = Math.max(zeile.bestand, 0);
    const offen = Boolean(zeile.angebrochen);
    if (vorher <= 0) {
      return;
    }
    await db.writeTransaction((tx) =>
      bestandSetzen(tx, { haushaltId, artikelId: zeile.id, neu: 0, nutzerId }),
    );
    toast(`${zeile.name} aufgebraucht`, {
      action: {
        label: "Rückgängig",
        onClick: () =>
          db.writeTransaction(async (tx) => {
            await bestandSetzen(tx, {
              haushaltId,
              artikelId: zeile.id,
              neu: vorher,
              nutzerId,
            });
            if (offen) {
              await tx.execute(
                "UPDATE artikel SET angebrochen = 1 WHERE id = ?",
                [zeile.id],
              );
            }
          }),
      },
    });
  }

  async function aufDieListe(zeile: VorratsZeile) {
    const neu = await db.writeTransaction((tx) =>
      aufListeSetzen(tx, { haushaltId, nutzerId, artikelId: zeile.id }),
    );
    toast(
      neu
        ? `${zeile.name} auf der Liste`
        : `${zeile.name} steht schon auf der Liste`,
    );
  }

  // Stabile Aktionen für die Zeilen: So zeichnet React nur Zeilen neu, deren Daten
  // sich geändert haben (VorratsZeileStill vergleicht Feld für Feld).
  const neueste = useRef({ plus, minus, aufgebraucht, aufDieListe });
  neueste.current = { plus, minus, aufgebraucht, aufDieListe };
  const aktionen = useMemo<ZeilenAktionen>(
    () => ({
      plus: (z) => neueste.current.plus(z),
      minus: (z) => neueste.current.minus(z),
      aufgebraucht: (z) => neueste.current.aufgebraucht(z),
      aufDieListe: (z) => neueste.current.aufDieListe(z),
      oeffnen: (z) => setDetails(z.id),
    }),
    [],
  );

  function imVorratFuehren(artikelId: string, an: boolean) {
    return db.execute("UPDATE artikel SET im_vorrat = ? WHERE id = ?", [
      an ? 1 : 0,
      artikelId,
    ]);
  }

  return (
    <>
      <NeuerVorratsartikel
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        name={eingabe}
        setName={setEingabe}
        oeffnen={setDetails}
      />

      <div className="space-y-2 pt-2">
        <div className="flex justify-end gap-2">
          <BonImport haushaltId={haushaltId} nutzerId={nutzerId} />
          {zeilen.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => setInventur(true)}
            >
              <ClipboardCheck /> Inventur
            </Button>
          )}
        </div>
        {zeilen.length > 0 && (
          <fieldset
            aria-label="Filter"
            className="m-0 flex min-w-0 flex-1 gap-1.5 overflow-x-auto border-0 p-0"
          >
            {(
              [
                ["alle", `Alle ${zeilen.length}`],
                ["knapp", `Knapp ${knapp}`],
                ["leer", `Leer ${leer}`],
              ] as const
            ).map(([id, text]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(filter === id ? "alle" : id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm",
                  filter === id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card",
                  id === "knapp" &&
                    knapp > 0 &&
                    filter !== id &&
                    "border-warning/50 text-warning-foreground",
                )}
              >
                {text}
              </button>
            ))}
          </fieldset>
        )}
      </div>

      {[
        ["Reste", reste],
        ["Fertiggerichte", fertiggerichte],
      ].map(
        ([titel, liste]) =>
          (liste as VorratsZeile[]).length > 0 && (
            <Gruppe key={titel as string} titel={titel as string}>
              {(liste as VorratsZeile[]).map((zeile) => (
                <VorratsZeileStill
                  key={zeile.id}
                  zeile={zeile}
                  aktionen={aktionen}
                />
              ))}
            </Gruppe>
          ),
      )}

      {gruppen.map(([gruppe, kategorie, artikel]) => (
        <Gruppe key={gruppe} titel={gruppe} kategorie={kategorie}>
          {artikel.map((zeile) => (
            <VorratsZeileStill
              key={zeile.id}
              zeile={zeile}
              aktionen={aktionen}
            />
          ))}
        </Gruppe>
      ))}

      {zeilen.length > 0 && sichtbar.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
          <SearchX className="size-8" strokeWidth={1.5} />
          <p>
            {suche
              ? `„${eingabe.trim()}“ ist nicht im Vorrat – mit + eintragen.`
              : filter === "knapp"
                ? "Nichts ist knapp."
                : "Nichts ist leer."}
          </p>
        </div>
      )}

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

      {zeilen.length > 0 && filter === "alle" && !suche && (
        <p className="px-1 pt-3 text-center text-xs text-muted-foreground">
          Wischen: ← aufgebraucht · → auf die Liste
        </p>
      )}

      {weitere.length > 0 && (
        <details className="mt-6" open={Boolean(suche) || undefined}>
          <summary className="cursor-pointer px-1 text-sm text-muted-foreground">
            Weitere Artikel ({weitere.length}) – nicht im Vorrat
          </summary>
          <ul className="mt-2 divide-y rounded-xl border bg-card">
            {weitere.map((a) => (
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

      <Details
        zeile={detailZeile}
        schliessen={() => setDetails(null)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        entfernen={(id) => {
          setDetails(null);
          imVorratFuehren(id, false);
        }}
      />

      <Inventur
        offen={inventur}
        schliessen={() => setInventur(false)}
        zeilen={gruppieren(zeilen).flatMap(([, , z]) => z)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
      />
    </>
  );
}

type ZeilenAktionen = Record<
  "plus" | "minus" | "aufgebraucht" | "aufDieListe" | "oeffnen",
  (z: VorratsZeile) => unknown
>;

const gleicheZeile = (a: VorratsZeile, b: VorratsZeile) =>
  (Object.keys(a) as (keyof VorratsZeile)[]).every((k) => a[k] === b[k]);

/** Zeichnet nur neu, wenn sich die Daten der Zeile wirklich geändert haben. */
const VorratsZeileStill = memo(
  function VorratsZeileStill({
    zeile,
    aktionen,
  }: {
    zeile: VorratsZeile;
    aktionen: ZeilenAktionen;
  }) {
    return (
      <VorratsEintrag
        zeile={zeile}
        plus={() => aktionen.plus(zeile)}
        minus={() => aktionen.minus(zeile)}
        aufgebraucht={() => aktionen.aufgebraucht(zeile)}
        aufDieListe={() => aktionen.aufDieListe(zeile)}
        oeffnen={() => aktionen.oeffnen(zeile)}
      />
    );
  },
  (a, b) => a.aktionen === b.aktionen && gleicheZeile(a.zeile, b.zeile),
);

/**
 * Zeile: Name (antippen für Details), −, Bestand, +. Wischen nach links =
 * aufgebraucht, nach rechts = auf die Liste.
 */
function VorratsEintrag({
  zeile,
  plus,
  minus,
  aufgebraucht,
  aufDieListe,
  oeffnen,
}: {
  zeile: VorratsZeile;
  plus: () => void;
  minus: () => void;
  aufgebraucht: () => void;
  aufDieListe: () => void;
  oeffnen: () => void;
}) {
  const vorrat = vorratVon(zeile);
  const knapp = istKnapp(zeile);
  const leer = istLeer(zeile);
  const offen = vorrat.angebrochen && vorrat.bestand > 0;
  const rest = zeile.gericht === "rest";
  const alter = rest
    ? restAlter(
        zeile.eingelagert_am ? zeitWert(zeile.eingelagert_am) : null,
        zeile.lagerort,
      )
    : null;
  const zusatz = [
    zeile.gericht && zeile.lagerort ? LAGERORT_NAME[zeile.lagerort] : "",
    alter?.text ?? "",
    rest ? "" : bestandBeschreibung(vorrat),
    knapp ? `knapp${zeile.auf_liste ? ", auf der Liste" : ""}` : "",
    !knapp && zeile.auf_liste ? "auf der Liste" : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Wischzeile
      links={
        leer
          ? undefined
          : {
              text: rest ? "Aufgegessen" : "Aufgebraucht",
              symbol: <PackageX className="size-5" />,
              farbe: "bg-destructive text-white",
              ausfuehren: aufgebraucht,
            }
      }
      rechts={
        rest
          ? undefined
          : {
              text: "Auf die Liste",
              symbol: <ShoppingCart className="size-5" />,
              farbe: "bg-primary text-primary-foreground",
              ausfuehren: aufDieListe,
            }
      }
    >
      <div
        data-testid={`vorrat-${zeile.name}`}
        className="flex min-h-14 items-center gap-1 pr-2"
      >
        <button
          type="button"
          onClick={oeffnen}
          className={cn(
            "flex flex-1 items-center gap-3 self-stretch px-4 py-2 text-left",
            leer && "opacity-55",
          )}
        >
          {zeile.gericht ? (
            zeile.lagerort === "tk" ? (
              <Snowflake className="size-6 shrink-0 text-frost" aria-hidden />
            ) : (
              <Refrigerator
                className="size-6 shrink-0 text-muted-foreground"
                aria-hidden
              />
            )
          ) : (
            <KategorieSymbol kategorie={zeile.kategorie} name={zeile.name} />
          )}
          <span className="flex-1">
            <span
              className={cn(
                "block text-base",
                knapp && "font-medium text-warning-foreground",
              )}
            >
              {zeile.name}
            </span>
            {(zusatz || offen) && (
              <span
                className={cn(
                  "text-xs",
                  knapp ? "text-warning-foreground" : "text-muted-foreground",
                )}
              >
                {offen && (
                  <span className="font-semibold text-primary">offen</span>
                )}
                {offen && zusatz && " · "}
                {zusatz}
              </span>
            )}
          </span>
        </button>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full"
          aria-label={`${zeile.name} weniger`}
          disabled={leer}
          onClick={minus}
        >
          <Minus />
        </Button>
        <button
          type="button"
          onClick={oeffnen}
          aria-label={`Bestand ${zeile.name}`}
          className={cn(
            "min-w-10 text-center text-lg font-medium tabular-nums",
            leer && "text-muted-foreground",
          )}
        >
          {stueck(vorrat.bestand)}
        </button>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full"
          aria-label={`${zeile.name} mehr`}
          onClick={plus}
        >
          <Plus />
        </Button>
      </div>
    </Wischzeile>
  );
}

/**
 * Artikel direkt in den Vorrat eintragen, z. B. bei der ersten Inventur. „Mehl 1 kg“
 * merkt sich die Packungsgröße, „Eier 10“ bucht 10 Stück; sonst eine Packung.
 */
function NeuerVorratsartikel({
  haushaltId,
  nutzerId,
  name,
  setName,
  oeffnen,
}: {
  haushaltId: string;
  nutzerId: string;
  name: string;
  setName: (name: string) => void;
  /** Nach dem Eintragen oder Scannen gleich die Details zeigen. */
  oeffnen: (artikelId: string) => void;
}) {
  const db = usePowerSync();
  const { data: bekannte } = useQuery<{
    name: string;
    kategorie: string | null;
  }>("SELECT name, kategorie FROM artikel WHERE haushalt_id = ?", [haushaltId]);
  const [manuell, setManuell] = useState<string | null>(null);
  const eingabe = zerlegeEingabe(name);
  const bekannt = eingabe.name.trim()
    ? findeNachName(
        new Map(bekannte.map((a) => [a.name.toLowerCase(), a])),
        eingabe.name,
      )
    : undefined;
  const vorschlag = kategorieVorschlag(
    bekannt?.kategorie,
    erkenneKategorie(eingabe.konserve ? `Dose ${eingabe.name}` : eingabe.name),
    manuell,
  );

  async function eintragen(kategorie: string) {
    // Sofort leeren: Was gleich weiter getippt wird, soll nicht verloren gehen.
    const gewaehlt = manuell;
    setName("");
    setManuell(null);
    const artikelId = await db.writeTransaction(async (tx) => {
      const artikel = await artikelFindenOderAnlegen(tx, {
        haushaltId,
        name: eingabe.name,
        kategorie,
      });
      // Nur eine von Hand gewählte Kategorie ändert einen bekannten Artikel.
      if (
        !artikel.neu &&
        gewaehlt != null &&
        (artikel.kategorie ?? "") !== kategorie
      ) {
        await tx.execute("UPDATE artikel SET kategorie = ? WHERE id = ?", [
          kategorie || null,
          artikel.id,
        ]);
      }
      const a = await tx.get<{
        packung_menge: number | null;
        packung_einheit: string | null;
      }>("SELECT packung_menge, packung_einheit FROM artikel WHERE id = ?", [
        artikel.id,
      ]);
      const packung = packungVon(a);
      const gelernt = gelerntePackung(eingabe, packung);
      await tx.execute(
        `UPDATE artikel SET im_vorrat = 1, packung_menge = ?, packung_einheit = ? WHERE id = ?`,
        [
          (packung ?? gelernt)?.menge ?? null,
          (packung ?? gelernt)?.einheit ?? null,
          artikel.id,
        ],
      );
      const menge = eingekauftePackungen(eingabe, packung ?? gelernt);
      await buchen(tx, {
        haushaltId,
        artikelId: artikel.id,
        menge,
        grund: "korrektur",
        nutzerId,
      });
      await mindestbestandPruefen(tx, artikel.id, nutzerId);
      return artikel.id;
    });
    // Eingetragen ist es schon – die Details sind zum Feinjustieren da.
    oeffnen(artikelId);
  }

  return (
    <Eingabeleiste
      oben
      wert={name}
      aendern={(wert) => {
        setName(wert);
        setManuell(null);
      }}
      absenden={eintragen}
      platzhalter="Suchen oder eintragen"
      label="Vorratsartikel"
      absendenLabel="Eintragen"
      kategorie={vorschlag.kategorie}
      kategorieAendern={setManuell}
      auswahl={vorschlag.auswahl}
      vorschlaege={bekannte.map((a) => a.name)}
      zusatz={
        <BarcodeScan
          haushaltId={haushaltId}
          titel="Scannen: in den Vorrat"
          aktionText="In den Vorrat"
          aktion={(a) =>
            scanEinbuchen(db, { haushaltId, nutzerId, artikel: a })
          }
          danach={(a) => oeffnen(a.id)}
        />
      }
    />
  );
}

/**
 * Gescannt im Vorrat: als Vorratsartikel führen und eine Packung einbuchen. Kennt
 * der Artikel seine Packungsgröße noch nicht, übernimmt er die des Barcodes.
 */
async function scanEinbuchen(
  db: AbstractPowerSyncDatabase,
  {
    haushaltId,
    nutzerId,
    artikel,
  }: { haushaltId: string; nutzerId: string; artikel: GescannterArtikel },
): Promise<string> {
  return db.writeTransaction(async (tx) => {
    await tx.execute("UPDATE artikel SET im_vorrat = 1 WHERE id = ?", [
      artikel.id,
    ]);
    if (artikel.packung) {
      await tx.execute(
        "UPDATE artikel SET packung_menge = ?, packung_einheit = ? WHERE id = ? AND packung_menge IS NULL",
        [artikel.packung.menge, artikel.packung.einheit, artikel.id],
      );
    }
    await buchen(tx, {
      haushaltId,
      artikelId: artikel.id,
      menge: 1,
      grund: "einkauf",
      nutzerId,
    });
    await mindestbestandPruefen(tx, artikel.id, nutzerId);
    return `+1 ${artikel.name}${artikel.packung ? ` (${formatiereMenge(artikel.packung.menge, artikel.packung.einheit)})` : ""} im Vorrat`;
  });
}
