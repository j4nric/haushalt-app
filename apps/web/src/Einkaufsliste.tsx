import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { kategorieName, kategorieRang } from "@haushalt/db/kategorien";
import { zerlegeEingabe } from "@haushalt/db/zutaten";
import { usePowerSync, useQuery } from "@powersync/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Eingabeleiste, kategorieVorschlag } from "@/components/Eingabeleiste";
import { type Kaufverlauf, ueberfaellige } from "@/lib/vergessen";
import { AusDemVerlauf, KategorieRaster, VerlaufKnopf } from "./liste/Bereiche";
import { EintragBearbeiten } from "./liste/EintragBearbeiten";
import { finde, nachKategorie } from "./liste/gruppieren";
import { Kachel } from "./liste/Kachel";
import { Wagen, ZumWagenKnopf } from "./liste/Wagen";
import type { Zeile } from "./liste/zeile";
import { artikelFindenOderAnlegen, aufListeSetzen } from "./listenaktionen";
import { HeuteKarte } from "./plan/HeuteKarte";
import { BarcodeScan } from "./scanner/BarcodeScan";
import { Vergessen } from "./Vergessen";
import { type VerlaufArtikel, VerlaufBlock } from "./Verlauf";
import { einkaufBuchen, einkaufZuruecknehmen } from "./vorratsaktionen";
import { FlugEbene } from "./WagenFlug";

export function Einkaufsliste({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const { data: eintraege } = useQuery<Zeile>(
    `SELECT l.id, l.artikel_id, a.name, a.kategorie, l.erledigt, l.menge, l.einheit,
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

  // „Mehl 1 kg“, „2 Dosen Tomaten“: Menge und Name getrennt.
  const eingabe = zerlegeEingabe(name);
  const vorschlag = kategorieVorschlag(
    finde(bekannteArtikel, eingabe.name)?.kategorie,
    erkenneKategorie(eingabe.konserve ? `Dose ${eingabe.name}` : eingabe.name),
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
    // Sofort leeren: Was gleich weiter getippt wird, soll nicht verloren gehen.
    const gewaehlt = manuell;
    setName("");
    setManuell(null);
    const { neu, artikelName } = await db.writeTransaction(async (tx) => {
      const artikel = await artikelFindenOderAnlegen(tx, {
        haushaltId,
        name: eingabe.name,
        kategorie,
      });
      // Von Hand eine andere Kategorie gewählt: gilt ab jetzt für diesen Artikel.
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
      return {
        neu: await aufListeSetzen(tx, {
          haushaltId,
          nutzerId,
          artikelId: artikel.id,
          menge: eingabe.menge,
          einheit: eingabe.einheit,
        }),
        artikelName: artikel.name,
      };
    });
    if (!neu) {
      toast(`${artikelName} steht schon auf der Liste`);
    }
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
    await db.writeTransaction((tx) =>
      aufListeSetzen(tx, { haushaltId, nutzerId, artikelId: artikel.id }),
    );
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
      <HeuteKarte haushaltId={haushaltId} />
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
        zusatz={
          <BarcodeScan
            haushaltId={haushaltId}
            titel="Scannen: auf die Liste oder abhaken"
            aktionText="Auf die Liste"
            aktion={async (a) => {
              // Steht es offen auf der Liste, wandert es in den Wagen (im Laden).
              const offenerEintrag = eintraege.find(
                (e) => e.artikel_id === a.id && !e.erledigt,
              );
              if (offenerEintrag) {
                await umschalten(offenerEintrag);
                return `✓ ${a.name} abgehakt`;
              }
              const neu = await db.writeTransaction((tx) =>
                aufListeSetzen(tx, { haushaltId, nutzerId, artikelId: a.id }),
              );
              return neu
                ? `${a.name} auf die Liste`
                : `${a.name} steht schon auf der Liste`;
            }}
          />
        }
      />
    </>
  );
}
