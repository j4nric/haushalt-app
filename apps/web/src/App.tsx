import { useStatus } from "@powersync/react";
import { ChevronsUpDown } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Anmeldung } from "./Anmeldung";
import { Navigation, useAnsicht } from "./Ansicht";
import { Einkaufsliste } from "./Einkaufsliste";
import { HaushaltEinrichten } from "./HaushaltEinrichten";
import { HaushaltWechseln } from "./HaushaltWechseln";
import { useHaushalte } from "./haushaltwahl";
import { useNutzer } from "./nutzer";
import { verbinden } from "./powersync";
import { SyncStatus } from "./SyncStatus";

// Nicht gebraucht beim Start: erst beim ersten Öffnen laden (offline trotzdem
// vorhanden – der Service Worker speichert alle Teile vorab).
const Haushalt = lazy(() =>
  import("./Haushalt").then((m) => ({ default: m.Haushalt })),
);

// Nicht gebraucht beim Start: erst beim ersten Öffnen laden (offline trotzdem
// vorhanden – der Service Worker speichert alle Teile vorab).
const Plan = lazy(() =>
  import("./plan/Plan").then((m) => ({ default: m.Plan })),
);

// Nicht gebraucht beim Start: erst beim ersten Öffnen laden (offline trotzdem
// vorhanden – der Service Worker speichert alle Teile vorab).
const Rezepte = lazy(() =>
  import("./rezepte/Rezepte").then((m) => ({ default: m.Rezepte })),
);

// Nicht gebraucht beim Start: erst beim ersten Öffnen laden (offline trotzdem
// vorhanden – der Service Worker speichert alle Teile vorab).
const Vorrat = lazy(() =>
  import("./Vorrat").then((m) => ({ default: m.Vorrat })),
);

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
  const { haushalte, aktiv: haushalt } = useHaushalte();
  const [wechselnOffen, setWechselnOffen] = useState(false);

  useEffect(() => {
    verbinden();
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
          {/* Mehrere Haushalte: Antippen des Namens wechselt. */}
          {haushalte.length > 1 ? (
            <button
              type="button"
              onClick={() => setWechselnOffen(true)}
              className="flex min-w-0 items-center gap-1 rounded-lg active:opacity-70"
              aria-label={`Haushalt wechseln (aktuell ${haushalt?.name ?? ""})`}
            >
              <h1 className="truncate text-lg font-semibold">
                {haushalt?.name ?? "Haushalt"}
              </h1>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ) : (
            <h1 className="truncate text-lg font-semibold">
              {haushalt?.name ?? "Haushalt"}
            </h1>
          )}
          <SyncStatus />
        </div>
      </header>

      {haushalt ? (
        <>
          {/* Platz unten für Eingabeleiste und Navigation. */}
          {/* Beim Wechsel des Haushalts alles frisch aufbauen (Filter, offene Dialoge …). */}
          <main key={haushalt.id} className="mx-auto max-w-lg px-4 pt-2 pb-48">
            <Suspense fallback={null}>
              {ansicht === "vorrat" ? (
                <Vorrat haushaltId={haushalt.id} nutzerId={nutzerId} />
              ) : ansicht === "plan" ? (
                <Plan haushaltId={haushalt.id} nutzerId={nutzerId} />
              ) : ansicht === "rezepte" ? (
                <Rezepte haushaltId={haushalt.id} nutzerId={nutzerId} />
              ) : ansicht === "haushalt" ? (
                <Haushalt
                  haushaltId={haushalt.id}
                  name={name}
                  haushalte={haushalte}
                  wechseln={() => setWechselnOffen(true)}
                />
              ) : (
                <Einkaufsliste haushaltId={haushalt.id} nutzerId={nutzerId} />
              )}
            </Suspense>
          </main>
          <Navigation ansicht={ansicht} wechseln={wechseln} />
          <HaushaltWechseln
            offen={wechselnOffen}
            schliessen={() => setWechselnOffen(false)}
            haushalte={haushalte}
            aktivId={haushalt.id}
          />
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
