import { useQuery, useStatus } from "@powersync/react";
import { useEffect } from "react";
import { Anmeldung } from "./Anmeldung";
import { Navigation, useAnsicht } from "./Ansicht";
import { Einkaufsliste } from "./Einkaufsliste";
import { Haushalt } from "./Haushalt";
import { HaushaltEinrichten } from "./HaushaltEinrichten";
import { useNutzer } from "./nutzer";
import { verbinden } from "./powersync";
import { SyncStatus } from "./SyncStatus";
import { Vorrat } from "./Vorrat";

export function App() {
  const { nutzer, laedt } = useNutzer();

  if (laedt) {
    return (
      <main className="p-8 text-center text-muted-foreground">Lädt …</main>
    );
  }
  if (!nutzer) {
    return <Anmeldung />;
  }
  return <Angemeldet nutzerId={nutzer.id} name={nutzer.name} />;
}

function Angemeldet({ nutzerId, name }: { nutzerId: string; name: string }) {
  const status = useStatus();
  const [ansicht, wechseln] = useAnsicht();
  // Lokal liegen nur die eigenen Haushalte (siehe sync-config.yaml); vorerst genau einer.
  const { data: haushalte } = useQuery<{ id: string; name: string }>(
    "SELECT id, name FROM haushalte LIMIT 1",
  );
  const haushalt = haushalte[0];

  useEffect(() => {
    verbinden();
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
          <h1 className="truncate text-lg font-semibold">
            {haushalt?.name ?? "Haushalt"}
          </h1>
          <SyncStatus />
        </div>
      </header>

      {haushalt ? (
        <>
          {/* Platz unten für Eingabeleiste und Navigation. */}
          <main className="mx-auto max-w-lg px-4 pt-2 pb-48">
            {ansicht === "vorrat" ? (
              <Vorrat haushaltId={haushalt.id} nutzerId={nutzerId} />
            ) : ansicht === "haushalt" ? (
              <Haushalt haushaltId={haushalt.id} name={name} />
            ) : (
              <Einkaufsliste haushaltId={haushalt.id} nutzerId={nutzerId} />
            )}
          </main>
          <Navigation ansicht={ansicht} wechseln={wechseln} />
        </>
      ) : (
        <main className="mx-auto max-w-lg px-4 py-6">
          {status.hasSynced ? (
            <HaushaltEinrichten />
          ) : (
            <p className="text-muted-foreground">Daten werden geladen …</p>
          )}
        </main>
      )}
    </div>
  );
}
