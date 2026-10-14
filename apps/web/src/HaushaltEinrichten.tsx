import { type FormEvent, useState } from "react";

/** Erster Start: eigenen Haushalt anlegen oder mit Einladungscode beitreten. */
export function HaushaltEinrichten() {
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  // Danach bringt der Sync den Haushalt aufs Gerät, und die Liste erscheint von selbst.
  async function senden(pfad: string, body: unknown) {
    setFehler(null);
    setLaeuft(true);
    const antwort = await fetch(`/api${pfad}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    setLaeuft(false);
    if (!antwort?.ok) {
      const { fehler: meldung } =
        (await antwort?.json().catch(() => ({}))) ?? {};
      setFehler(
        meldung ?? "Keine Verbindung. Für diesen Schritt braucht es Internet.",
      );
    }
  }

  return (
    <section className="stapel">
      <h2>Haushalt einrichten</h2>
      <form
        className="zeile"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          senden("/haushalte", {
            name: new FormData(e.currentTarget).get("name"),
          });
        }}
      >
        <input
          name="name"
          required
          placeholder="z. B. Familie Muster"
          aria-label="Name des Haushalts"
        />
        <button type="submit" disabled={laeuft}>
          Neuen Haushalt anlegen
        </button>
      </form>
      <p className="leer">oder</p>
      <form
        className="zeile"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          senden("/einladungen/annehmen", {
            code: new FormData(e.currentTarget).get("code"),
          });
        }}
      >
        <input
          name="code"
          required
          placeholder="ABCD-2345"
          aria-label="Einladungscode"
          autoCapitalize="characters"
        />
        <button type="submit" disabled={laeuft}>
          Beitreten
        </button>
      </form>
      {fehler && (
        <p className="fehler" role="alert">
          {fehler}
        </p>
      )}
    </section>
  );
}
