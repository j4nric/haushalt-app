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
import { usePowerSync, useQuery } from "@powersync/react";
import { type FormEvent, useState } from "react";
import {
  bestandSetzen,
  buchen,
  mindestbestandPruefen,
} from "./vorratsaktionen";

type VorratsZeile = {
  id: string;
  name: string;
  kategorie: string | null;
  standardeinheit: Einheit;
  mindestbestand: number | null;
  bestand: number;
  auf_liste: number;
};

type AndererArtikel = { id: string; name: string };

const EINHEIT_NAMEN: Record<Einheit, string> = {
  stueck: "Stk.",
  g: "g",
  ml: "ml",
};

/** Schrittweite für Plus/Minus: ein Stück bzw. 100 g / 100 ml. */
const SCHRITT: Record<Einheit, number> = { stueck: 1, g: 100, ml: 100 };

export function Vorrat({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const { data: zeilen } = useQuery<VorratsZeile>(
    `SELECT a.id, a.name, a.kategorie, a.standardeinheit, a.mindestbestand,
            COALESCE((SELECT SUM(b.menge) FROM vorratsbuchungen b WHERE b.artikel_id = a.id), 0) AS bestand,
            EXISTS (SELECT 1 FROM listeneintraege l WHERE l.artikel_id = a.id AND l.erledigt = 0) AS auf_liste
       FROM artikel a
      WHERE a.haushalt_id = ? AND a.im_vorrat = 1
      ORDER BY a.name`,
    [haushaltId],
  );
  const { data: andere } = useQuery<AndererArtikel>(
    "SELECT id, name FROM artikel WHERE haushalt_id = ? AND im_vorrat = 0 ORDER BY name",
    [haushaltId],
  );

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

  function setzen(zeile: VorratsZeile, neu: number) {
    return db.writeTransaction((tx) =>
      bestandSetzen(tx, { haushaltId, artikelId: zeile.id, neu, nutzerId }),
    );
  }

  function mindestbestandAendern(zeile: VorratsZeile, wert: number | null) {
    return db.writeTransaction(async (tx) => {
      await tx.execute("UPDATE artikel SET mindestbestand = ? WHERE id = ?", [
        wert,
        zeile.id,
      ]);
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
    <section>
      <NeuerVorratsartikel haushaltId={haushaltId} nutzerId={nutzerId} />

      {knapp > 0 && (
        <p className="hinweis" role="status">
          {knapp === 1 ? "1 Artikel ist" : `${knapp} Artikel sind`} unter dem
          Mindestbestand.
        </p>
      )}

      {gruppen.map(([gruppe, artikel]) => (
        <div key={gruppe} className="gruppe">
          <h3>{gruppe}</h3>
          <ul>
            {artikel.map((zeile) => (
              <VorratsEintrag
                key={zeile.id}
                zeile={zeile}
                aendern={aendern}
                setzen={setzen}
                mindestbestandAendern={mindestbestandAendern}
                entfernen={() => imVorratFuehren(zeile.id, false)}
              />
            ))}
          </ul>
        </div>
      ))}

      {zeilen.length === 0 && (
        <p className="leer">
          Noch nichts im Vorrat. Abgehakte Einkäufe von Vorratsartikeln landen
          automatisch hier, oder du trägst oben etwas ein.
        </p>
      )}

      {andere.length > 0 && (
        <details className="weitere">
          <summary>Weitere Artikel ({andere.length}) – nicht im Vorrat</summary>
          <ul>
            {andere.map((a) => (
              <li key={a.id}>
                <span>{a.name}</span>
                <button
                  type="button"
                  className="leise"
                  onClick={() => imVorratFuehren(a.id, true)}
                >
                  Im Vorrat führen
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function VorratsEintrag({
  zeile,
  aendern,
  setzen,
  mindestbestandAendern,
  entfernen,
}: {
  zeile: VorratsZeile;
  aendern: (zeile: VorratsZeile, menge: number) => void;
  setzen: (zeile: VorratsZeile, neu: number) => void;
  mindestbestandAendern: (zeile: VorratsZeile, wert: number | null) => void;
  entfernen: () => void;
}) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const schritt = SCHRITT[zeile.standardeinheit];
  const bestand = Math.max(zeile.bestand, 0);
  const einheit = EINHEIT_NAMEN[zeile.standardeinheit];

  return (
    <li className={istKnapp(zeile) ? "knapp" : ""}>
      <span className="vorrat-name">
        {zeile.name}
        {istKnapp(zeile) && (
          <small> · knapp{zeile.auf_liste ? ", auf der Liste" : ""}</small>
        )}
      </span>
      <span className="vorrat-steuerung">
        <button
          type="button"
          aria-label={`${zeile.name}: ${schritt} ${einheit} weniger`}
          disabled={bestand <= 0}
          onClick={() => aendern(zeile, -Math.min(schritt, bestand))}
        >
          −
        </button>
        {bearbeiten ? (
          <ZahlEingabe
            wert={bestand}
            label={`Bestand ${zeile.name}`}
            fertig={(neu) => {
              setBearbeiten(false);
              if (neu != null && neu !== bestand) {
                setzen(zeile, neu);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="bestand"
            aria-label={`Bestand ${zeile.name}`}
            title="Antippen, um den Bestand zu ändern"
            onClick={() => setBearbeiten(true)}
          >
            {formatiereMenge(bestand, zeile.standardeinheit)}
          </button>
        )}
        <button
          type="button"
          aria-label={`${zeile.name}: ${schritt} ${einheit} mehr`}
          onClick={() => aendern(zeile, schritt)}
        >
          +
        </button>
        <button
          type="button"
          className="leise"
          disabled={bestand <= 0}
          onClick={() => aendern(zeile, -bestand)}
        >
          Aufgebraucht
        </button>
      </span>
      <span className="vorrat-mindest">
        <span className="mindest-feld">
          min.
          <ZahlEingabe
            key={zeile.mindestbestand ?? "leer"}
            wert={zeile.mindestbestand}
            label={`Mindestbestand ${zeile.name}`}
            fertig={(neu) => {
              if (neu !== zeile.mindestbestand) {
                mindestbestandAendern(zeile, neu && neu > 0 ? neu : null);
              }
            }}
            leerErlaubt
            immer
          />
          {einheit}
        </span>
        <button
          type="button"
          className="leise"
          aria-label={`${zeile.name} nicht mehr im Vorrat führen`}
          onClick={entfernen}
        >
          ×
        </button>
      </span>
    </li>
  );
}

/** Zahlenfeld, das seinen Wert beim Verlassen oder mit Enter übernimmt. */
function ZahlEingabe({
  wert,
  label,
  fertig,
  leerErlaubt = false,
  immer = false,
}: {
  wert: number | null;
  label: string;
  fertig: (neu: number | null) => void;
  leerErlaubt?: boolean;
  immer?: boolean;
}) {
  const [text, setText] = useState(wert == null ? "" : String(wert));
  function uebernehmen() {
    const roh = text.trim().replace(",", ".");
    if (roh === "") {
      fertig(leerErlaubt ? null : wert);
      return;
    }
    const zahl = Number(roh);
    fertig(Number.isFinite(zahl) && zahl >= 0 ? zahl : wert);
  }
  return (
    <input
      className="zahl"
      inputMode="decimal"
      aria-label={label}
      value={text}
      // biome-ignore lint/a11y/noAutofocus: Feld erscheint erst nach Antippen
      autoFocus={!immer}
      onChange={(e) => setText(e.target.value)}
      onBlur={uebernehmen}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}

/** Artikel direkt in den Vorrat eintragen, z. B. bei der ersten Inventur. */
function NeuerVorratsartikel({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const [name, setName] = useState("");
  const [menge, setMenge] = useState("");
  const [einheit, setEinheit] = useState<Einheit>("stueck");
  const [kategorie, setKategorie] = useState("vorrat");

  async function eintragen(event: FormEvent) {
    event.preventDefault();
    const artikelName = name.trim();
    if (!artikelName) {
      return;
    }
    const zahl = menge.trim() === "" ? 0 : Number(menge.replace(",", "."));
    await db.writeTransaction(async (tx) => {
      const vorhanden = await tx.getOptional<{ id: string }>(
        "SELECT id FROM artikel WHERE haushalt_id = ? AND lower(name) = lower(?)",
        [haushaltId, artikelName],
      );
      let artikelId = vorhanden?.id;
      if (artikelId) {
        await tx.execute("UPDATE artikel SET im_vorrat = 1 WHERE id = ?", [
          artikelId,
        ]);
      } else {
        artikelId = crypto.randomUUID();
        await tx.execute(
          `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, im_vorrat, erstellt_am)
           VALUES (?, ?, ?, ?, ?, 1, ?)`,
          [
            artikelId,
            haushaltId,
            artikelName,
            kategorie || null,
            einheit,
            new Date().toISOString(),
          ],
        );
      }
      if (Number.isFinite(zahl) && zahl > 0) {
        await bestandSetzen(tx, { haushaltId, artikelId, neu: zahl, nutzerId });
      }
    });
    setName("");
    setMenge("");
  }

  return (
    <form className="eingabe" onSubmit={eintragen}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Was ist da?"
        aria-label="Vorratsartikel"
        className="name"
      />
      <input
        value={menge}
        onChange={(e) => setMenge(e.target.value)}
        inputMode="decimal"
        placeholder="Menge"
        aria-label="Bestand"
        className="menge"
      />
      <select
        value={einheit}
        onChange={(e) => setEinheit(e.target.value as Einheit)}
        aria-label="Einheit"
      >
        {EINHEITEN.map((e) => (
          <option key={e} value={e}>
            {EINHEIT_NAMEN[e]}
          </option>
        ))}
      </select>
      <select
        value={kategorie}
        onChange={(e) => setKategorie(e.target.value)}
        aria-label="Kategorie"
        className="kategorie"
      >
        {KATEGORIEN.map((k) => (
          <option key={k.id} value={k.id}>
            {k.name}
          </option>
        ))}
      </select>
      <button type="submit">Eintragen</button>
    </form>
  );
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
