import { useEffect, useRef, useState } from "react";
import {
  ABHAK_ANIMATIONEN,
  type AbhakAnimation,
  einstellungenAendern,
  useEinstellungen,
} from "@/einstellungen";
import { cn } from "@/lib/utils";

/** So lange läuft die Animation; so lange lässt sich das Abhaken noch abbrechen. */
export const ABHAK_DAUER_MS = 1500;

/**
 * Verzögertes Abhaken: Der erste Tipp startet die Animation, ein zweiter innerhalb
 * von ABHAK_DAUER_MS bricht ab. Erst danach wird wirklich abgehakt.
 * Verschwindet die Kachel vorher (z. B. Wechsel in einen anderen Bereich), wird
 * sofort abgehakt – sonst ginge der Tipp verloren.
 */
export function useVerzoegertesAbhaken(abhaken: () => void) {
  const [laeuft, setLaeuft] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ausstehend = useRef(false);
  const aktion = useRef(abhaken);
  aktion.current = abhaken;

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (ausstehend.current) {
        ausstehend.current = false;
        aktion.current();
      }
    },
    [],
  );

  return {
    laeuft,
    /** Startet das Abhaken oder bricht ein laufendes ab. */
    umschalten() {
      clearTimeout(timer.current);
      if (ausstehend.current) {
        ausstehend.current = false;
        setLaeuft(false);
        return;
      }
      ausstehend.current = true;
      setLaeuft(true);
      timer.current = setTimeout(() => {
        ausstehend.current = false;
        setLaeuft(false);
        aktion.current();
      }, ABHAK_DAUER_MS);
    },
  };
}

/** CSS-Klasse der gewählten Abhak-Animation. */
export function abhakKlasse(animation: AbhakAnimation) {
  return `abhaken-${animation}`;
}

/** Zickzack, der beim „Kritzeln“ über die Kachel gezeichnet wird. */
export function KritzelStrich() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <path
        className="kritzel-strich"
        pathLength={1}
        d="M6 30 L18 9 L28 31 L40 8 L50 32 L62 9 L72 31 L84 8 L94 28"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * VORÜBERGEHEND, zum Aussuchen: drei Beispielkacheln spielen ihre Animation in
 * Dauerschleife. Antippen wählt die Animation für das echte Abhaken.
 */
export function AbhakVorschau() {
  const { abhakAnimation } = useEinstellungen();
  return (
    <section
      aria-label="Abhak-Animation wählen"
      className="mt-2 rounded-2xl border border-dashed p-3"
    >
      <p className="pb-2 text-center text-xs text-muted-foreground">
        Test: Welche Animation beim Abhaken? Antippen zum Auswählen.
      </p>
      <ul className="grid grid-cols-3 gap-2">
        {ABHAK_ANIMATIONEN.map((a) => (
          <li key={a.id} className="flex flex-col items-center gap-1.5">
            <div className="h-14 w-full">
              <div
                className={cn(
                  "abhak-schleife relative flex h-full items-center justify-center rounded-xl border bg-card text-sm font-medium text-primary",
                  abhakKlasse(a.id),
                )}
              >
                {a.id === "kritzeln" && <KritzelStrich />}
                <span className="text-foreground">Milch</span>
              </div>
            </div>
            <button
              type="button"
              aria-pressed={abhakAnimation === a.id}
              onClick={() => einstellungenAendern({ abhakAnimation: a.id })}
              className={cn(
                "w-full rounded-full px-2 py-1 text-xs font-medium",
                abhakAnimation === a.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {a.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
