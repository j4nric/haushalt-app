import { useQuery, useStatus } from "@powersync/react";
import { useEffect } from "react";
import { Anmeldung } from "./Anmeldung";
import { authClient } from "./auth";
import { Einkaufsliste } from "./Einkaufsliste";
import { HaushaltEinrichten } from "./HaushaltEinrichten";
import { HaushaltInfo } from "./HaushaltInfo";
import { useNutzer, vergessen } from "./nutzer";
import { trennenUndLeeren, verbinden } from "./powersync";
import { SyncStatus } from "./SyncStatus";

export function App() {
  const { nutzer, laedt } = useNutzer();

  if (laedt) {
    return <main className="mitte">Lädt …</main>;
  }
  if (!nutzer) {
    return <Anmeldung />;
  }
  return <Angemeldet nutzerId={nutzer.id} name={nutzer.name} />;
}

function Angemeldet({ nutzerId, name }: { nutzerId: string; name: string }) {
  const status = useStatus();
  // Lokal liegen nur die eigenen Haushalte (siehe sync-config.yaml); vorerst genau einer.
  const { data: haushalte } = useQuery<{ id: string; name: string }>(
    "SELECT id, name FROM haushalte LIMIT 1",
  );
  const haushalt = haushalte[0];

  useEffect(() => {
    verbinden();
  }, []);

  async function abmelden() {
    await trennenUndLeeren();
    vergessen();
    await authClient.signOut();
  }

  return (
    <main>
      <header>
        <h1>{haushalt?.name ?? "Einkaufsliste"}</h1>
        <button type="button" className="leise" onClick={abmelden}>
          {name} abmelden
        </button>
      </header>
      <SyncStatus />

      {haushalt ? (
        <>
          <Einkaufsliste haushaltId={haushalt.id} nutzerId={nutzerId} />
          <HaushaltInfo haushaltId={haushalt.id} />
        </>
      ) : status.hasSynced ? (
        <HaushaltEinrichten />
      ) : (
        <p className="leer">Daten werden geladen …</p>
      )}
    </main>
  );
}
