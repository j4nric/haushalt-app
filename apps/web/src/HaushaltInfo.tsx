import { useQuery } from "@powersync/react";
import { useState } from "react";

export function HaushaltInfo({ haushaltId }: { haushaltId: string }) {
  const { data: mitglieder } = useQuery<{ id: string; anzeigename: string }>(
    "SELECT id, anzeigename FROM haushalt_mitglieder WHERE haushalt_id = ? ORDER BY beigetreten_am",
    [haushaltId],
  );
  const [einladung, setEinladung] = useState<{
    code: string;
    gueltigBis: string;
  } | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  async function einladen() {
    setFehler(null);
    const antwort = await fetch(`/api/haushalte/${haushaltId}/einladungen`, {
      method: "POST",
    }).catch(() => null);
    if (antwort?.ok) {
      setEinladung(await antwort.json());
    } else {
      setFehler("Einladen braucht eine Internetverbindung.");
    }
  }

  return (
    <section className="haushalt-info">
      <h2>Mitglieder</h2>
      <p>{mitglieder.map((m) => m.anzeigename).join(", ")}</p>
      {einladung ? (
        <p>
          Einladungscode:{" "}
          <strong data-testid="einladungscode">{einladung.code}</strong>
          <br />
          <small>
            Gültig bis{" "}
            {new Date(einladung.gueltigBis).toLocaleDateString("de-DE")}, einmal
            verwendbar.
          </small>
        </p>
      ) : (
        <button type="button" className="leise" onClick={einladen}>
          Jemanden einladen
        </button>
      )}
      {fehler && <p className="fehler">{fehler}</p>}
    </section>
  );
}
