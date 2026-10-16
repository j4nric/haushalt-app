import { useStatus } from "@powersync/react";
import { ChevronsUpDown } from "lucide-react";
import {
  Activity,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Anmeldung } from "./Anmeldung";
import { Navigation, useAnsicht } from "./Ansicht";
import { Einkaufsliste } from "./Einkaufsliste";
import { HaushaltEinrichten } from "./HaushaltEinrichten";
import { HaushaltWechseln } from "./HaushaltWechseln";
import { useHaushalte } from "./haushaltwahl";
import { useNutzer } from "./nutzer";
import { verbinden } from "./powersync";
import { SyncStatus } from "./SyncStatus";

// Nicht gebraucht beim Start: separat geladen (offline trotzdem vorhanden – der
// Service Worker speichert alle Teile vorab). Nach dem Start lädt die App sie im
// Leerlauf vor, damit der erste Wechsel nicht warten muss.
const laden = {
  haushalt: () => import("./Haushalt").then((m) => ({ default: m.Haushalt })),
  plan: () => import("./plan/Plan").then((m) => ({ default: m.Plan })),
  rezepte: () =>
    import("./rezepte/Rezepte").then((m) => ({ default: m.Rezepte })),
  vorrat: () => import("./Vorrat").then((m) => ({ default: m.Vorrat })),
  // Unterseite der Rezepte mit der Sammlung – nur vorladen, nicht anzeigen.
  entdecken: () =>
    import("./entdecken/Entdecken").then((m) => ({ default: m.Entdecken })),
};
const Haushalt = lazy(laden.haushalt);
const Plan = lazy(laden.plan);
const Rezepte = lazy(laden.rezepte);
const Vorrat = lazy(laden.vorrat);

function vorladen() {
  const los = () => {
    for (const f of Object.values(laden)) {
      f().catch(() => {});
    }
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(los, { timeout: 3000 });
  } else {
    setTimeout(los, 1500);
  }
}

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
  // Welche Bereiche schon einmal offen waren – die bleiben aufgebaut.
  const [besucht, setBesucht] = useState<Set<string>>(() => new Set([ansicht]));
  if (!besucht.has(ansicht)) {
    setBesucht(new Set([...besucht, ansicht]));
  }
  // Nach dem Start im Leerlauf: Code aller Bereiche laden und sie ruhend vorbauen
  // (React Activity „hidden“ – ohne Abfragen). Das erste Öffnen ist dann so schnell
  // wie jedes weitere.
  useEffect(() => {
    vorladen();
    const vorbauen = () =>
      setBesucht(new Set(["liste", "vorrat", "plan", "rezepte", "haushalt"]));
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(vorbauen, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(vorbauen, 2500);
    return () => clearTimeout(t);
  }, []);
  // Jeder Bereich behält seine Scrollposition (sie teilen sich das Fenster). Laufend
  // mitschreiben: Beim Ausblenden schrumpft die Seite, der Browser kürzt sonst vorher.
  const scrollPositionen = useRef(new Map<string, number>());
  const aktuell = useRef(ansicht);
  useEffect(() => {
    const merken = () =>
      scrollPositionen.current.set(aktuell.current, window.scrollY);
    window.addEventListener("scroll", merken, { passive: true });
    return () => window.removeEventListener("scroll", merken);
  }, []);
  useLayoutEffect(() => {
    if (aktuell.current === ansicht) {
      return;
    }
    aktuell.current = ansicht;
    window.scrollTo(0, scrollPositionen.current.get(ansicht) ?? 0);
  }, [ansicht]);

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
            {/* Einmal geöffnete Bereiche bleiben bestehen (React Activity): Zustand
                und zuletzt geladene Daten bleiben, aber im Hintergrund ruhen Abfragen
                und Effekte – Änderungen kosten dort nichts, der Wechsel ist sofort da. */}
            {(
              [
                [
                  "liste",
                  <Einkaufsliste
                    key="liste"
                    haushaltId={haushalt.id}
                    nutzerId={nutzerId}
                  />,
                ],
                [
                  "vorrat",
                  <Vorrat
                    key="vorrat"
                    haushaltId={haushalt.id}
                    nutzerId={nutzerId}
                  />,
                ],
                [
                  "plan",
                  <Plan
                    key="plan"
                    haushaltId={haushalt.id}
                    nutzerId={nutzerId}
                  />,
                ],
                [
                  "rezepte",
                  <Rezepte
                    key="rezepte"
                    haushaltId={haushalt.id}
                    nutzerId={nutzerId}
                  />,
                ],
                [
                  "haushalt",
                  <Haushalt
                    key="haushalt"
                    haushaltId={haushalt.id}
                    name={name}
                    haushalte={haushalte}
                    wechseln={() => setWechselnOffen(true)}
                  />,
                ],
              ] as const
            ).map(
              ([id, inhalt]) =>
                besucht.has(id) && (
                  <Activity
                    key={id}
                    mode={ansicht === id ? "visible" : "hidden"}
                  >
                    <Suspense fallback={null}>{inhalt}</Suspense>
                  </Activity>
                ),
            )}
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
