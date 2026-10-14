import {
  EINHEITEN,
  type Einheit,
  formatiereMenge,
} from "@haushalt/db/einheiten";
import { usePowerSync, useQuery } from "@powersync/react";
import { type FormEvent, useState } from "react";

type Zeile = {
  id: string;
  name: string;
  menge: number | null;
  einheit: Einheit | null;
  erledigt: number;
  erledigt_von_name: string | null;
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
    `SELECT l.id, a.name, l.menge, l.einheit, l.erledigt, m.anzeigename AS erledigt_von_name
       FROM listeneintraege l
       JOIN artikel a ON a.id = l.artikel_id
       LEFT JOIN haushalt_mitglieder m ON m.nutzer_id = l.erledigt_von AND m.haushalt_id = l.haushalt_id
      WHERE l.haushalt_id = ?
      ORDER BY l.erledigt, l.erstellt_am`,
    [haushaltId],
  );
  const [name, setName] = useState("");
  const [menge, setMenge] = useState("");
  const [einheit, setEinheit] = useState<Einheit>("stueck");

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
      const vorhanden = await tx.getOptional<{ id: string }>(
        "SELECT id FROM artikel WHERE haushalt_id = ? AND lower(name) = lower(?)",
        [haushaltId, artikelName],
      );
      let artikelId = vorhanden?.id;
      if (!artikelId) {
        artikelId = crypto.randomUUID();
        await tx.execute(
          "INSERT INTO artikel (id, haushalt_id, name, standardeinheit, erstellt_am) VALUES (?, ?, ?, ?, ?)",
          [artikelId, haushaltId, artikelName, einheit, jetzt],
        );
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
  }

  function umschalten(eintrag: Zeile) {
    const erledigt = eintrag.erledigt ? 0 : 1;
    return db.execute(
      "UPDATE listeneintraege SET erledigt = ?, erledigt_von = ? WHERE id = ?",
      [erledigt, erledigt ? nutzerId : null, eintrag.id],
    );
  }

  return (
    <section>
      <form className="zeile" onSubmit={hinzufuegen}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Was fehlt?"
          aria-label="Neuer Eintrag"
        />
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
        <button type="submit">Hinzufügen</button>
      </form>

      <ul>
        {eintraege.map((eintrag) => (
          <li key={eintrag.id} className={eintrag.erledigt ? "erledigt" : ""}>
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
              onClick={() =>
                db.execute("DELETE FROM listeneintraege WHERE id = ?", [
                  eintrag.id,
                ])
              }
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {eintraege.length === 0 && <p className="leer">Die Liste ist leer.</p>}
    </section>
  );
}
