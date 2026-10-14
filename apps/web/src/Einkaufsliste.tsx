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
import { type FormEvent, useMemo, useState } from "react";

type Zeile = {
  id: string;
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

const EINHEIT_NAMEN: Record<Einheit, string> = {
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
    `SELECT l.id, a.name, a.kategorie, l.menge, l.einheit, l.erledigt,
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

  async function hinzufuegen(event: FormEvent) {
    event.preventDefault();
    const artikelName = name.trim();
    if (!artikelName) {
      return;
    }
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
          `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, erstellt_am)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            artikelId,
            haushaltId,
            artikelName,
            kategorie || null,
            einheit,
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

  function umschalten(eintrag: Zeile) {
    const erledigt = eintrag.erledigt ? 0 : 1;
    return db.execute(
      "UPDATE listeneintraege SET erledigt = ?, erledigt_von = ? WHERE id = ?",
      [erledigt, erledigt ? nutzerId : null, eintrag.id],
    );
  }

  function loeschen(eintrag: Zeile) {
    return db.execute("DELETE FROM listeneintraege WHERE id = ?", [eintrag.id]);
  }

  function imWagenLeeren() {
    return db.execute(
      "DELETE FROM listeneintraege WHERE haushalt_id = ? AND erledigt = 1",
      [haushaltId],
    );
  }

  return (
    <section>
      <form className="eingabe" onSubmit={hinzufuegen}>
        <input
          value={name}
          onChange={(e) => nameAendern(e.target.value)}
          placeholder="Was fehlt?"
          aria-label="Neuer Eintrag"
          list="artikel-vorschlaege"
          autoComplete="off"
          className="name"
        />
        <datalist id="artikel-vorschlaege">
          {bekannteArtikel.map((a) => (
            <option key={a.id} value={a.name} />
          ))}
        </datalist>
        <input
          value={menge}
          onChange={(e) => setMenge(e.target.value)}
          inputMode="decimal"
          placeholder="Menge"
          aria-label="Menge"
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
          <option value="">Kategorie …</option>
          {KATEGORIEN.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        <button type="submit">Hinzufügen</button>
      </form>

      {gruppen.map(([gruppe, zeilen]) => (
        <div key={gruppe} className="gruppe">
          <h3>{gruppe}</h3>
          <ul>
            {zeilen.map((eintrag) => (
              <Eintrag
                key={eintrag.id}
                eintrag={eintrag}
                umschalten={umschalten}
                loeschen={loeschen}
              />
            ))}
          </ul>
        </div>
      ))}

      {imWagen.length > 0 && (
        <div className="gruppe im-wagen">
          <h3>
            Im Wagen
            <button type="button" className="leise" onClick={imWagenLeeren}>
              Leeren
            </button>
          </h3>
          <ul>
            {imWagen.map((eintrag) => (
              <Eintrag
                key={eintrag.id}
                eintrag={eintrag}
                umschalten={umschalten}
                loeschen={loeschen}
              />
            ))}
          </ul>
        </div>
      )}

      {eintraege.length === 0 && <p className="leer">Die Liste ist leer.</p>}
    </section>
  );
}

function Eintrag({
  eintrag,
  umschalten,
  loeschen,
}: {
  eintrag: Zeile;
  umschalten: (e: Zeile) => void;
  loeschen: (e: Zeile) => void;
}) {
  return (
    <li className={eintrag.erledigt ? "erledigt" : ""}>
      <label>
        <input
          type="checkbox"
          checked={eintrag.erledigt === 1}
          onChange={() => umschalten(eintrag)}
        />
        <span>
          {eintrag.menge && eintrag.einheit && (
            <span className="menge-anzeige">
              {formatiereMenge(eintrag.menge, eintrag.einheit)}{" "}
            </span>
          )}
          {eintrag.name}
          {eintrag.erledigt === 1 && eintrag.erledigt_von_name && (
            <small> · {eintrag.erledigt_von_name}</small>
          )}
        </span>
      </label>
      <button
        type="button"
        className="leise"
        aria-label={`${eintrag.name} löschen`}
        onClick={() => loeschen(eintrag)}
      >
        ×
      </button>
    </li>
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
