import { usePowerSync, useQuery, useStatus } from "@powersync/react";
import { type FormEvent, useState } from "react";
import type { Listeneintrag } from "./powersync";

export function App() {
  const db = usePowerSync();
  const { data: eintraege } = useQuery<Listeneintrag & { id: string }>(
    "SELECT * FROM listeneintraege ORDER BY erledigt, erstellt_am",
  );
  const [neu, setNeu] = useState("");

  async function hinzufuegen(event: FormEvent) {
    event.preventDefault();
    const name = neu.trim();
    if (!name) {
      return;
    }
    await db.execute(
      "INSERT INTO listeneintraege (id, name, erledigt, erstellt_am) VALUES (uuid(), ?, 0, ?)",
      [name, new Date().toISOString()],
    );
    setNeu("");
  }

  return (
    <main>
      <h1>Einkaufsliste</h1>
      <SyncStatus />

      <form onSubmit={hinzufuegen}>
        <input
          value={neu}
          onChange={(e) => setNeu(e.target.value)}
          placeholder="Was fehlt?"
          aria-label="Neuer Eintrag"
        />
        <button type="submit">Hinzufügen</button>
      </form>

      <ul>
        {eintraege.map((eintrag) => (
          <li key={eintrag.id} className={eintrag.erledigt ? "erledigt" : ""}>
            <label>
              <input
                type="checkbox"
                checked={eintrag.erledigt === 1}
                onChange={() =>
                  db.execute(
                    "UPDATE listeneintraege SET erledigt = ? WHERE id = ?",
                    [eintrag.erledigt ? 0 : 1, eintrag.id],
                  )
                }
              />
              {eintrag.name}
            </label>
            <button
              type="button"
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
    </main>
  );
}

function SyncStatus() {
  const status = useStatus();
  const laedtHoch = status.dataFlowStatus.uploading;
  const text = status.connected
    ? laedtHoch
      ? "Online · lädt hoch …"
      : "Online · synchron"
    : "Offline · Änderungen werden lokal gespeichert";
  return (
    <p
      className={`status ${status.connected ? "online" : "offline"}`}
      data-testid="sync-status"
    >
      {text}
    </p>
  );
}
