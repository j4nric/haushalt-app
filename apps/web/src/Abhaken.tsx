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

/** CSS-Klasse, die Strich und Ausblenden steuert (siehe index.css). */
export const ABHAK_KLASSE = "abhaken-kritzeln";

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

// --- Kritzel-Formen ---------------------------------------------------------------
// Koordinaten im viewBox 0..100 × 0..40; das SVG ist rundum 6 px größer als die Kachel,
// dadurch ragen die Striche leicht über den Rand.
// Ein fester Zufallsgenerator sorgt für Handschrift-Zittern, das jedes Mal gleich ist.

function zufall(saat: number) {
  let a = saat;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5; // -0.5 … 0.5
  };
}

function pfad(punkte: [number, number][]) {
  return punkte
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
}

/** Dichter, senkrechter Zickzack quer über die Kachel. */
function zickzack() {
  const r = zufall(7);
  const punkte: [number, number][] = [];
  for (let i = 0, x = -3; x <= 103; i++, x += 3.6) {
    punkte.push([x + r() * 1.5, (i % 2 ? 37 : 3) + r() * 4]);
  }
  return pfad(punkte);
}

/** Waagerechtes Durchstreichen: Striche hin und zurück, die langsam nach unten wandern. */
function hinUndHer() {
  const r = zufall(11);
  const punkte: [number, number][] = [];
  const striche = 9;
  for (let i = 0; i <= striche; i++) {
    const y = 8 + (24 * i) / striche;
    punkte.push([(i % 2 ? 103 : -3) + r() * 4, y + r() * 4]);
  }
  return pfad(punkte);
}

/** Fortlaufende Schleifen wie hastige Schreibschrift. */
function kringel() {
  const r = zufall(23);
  const punkte: [number, number][] = [];
  const schleifen = 10;
  const schritte = 300;
  for (let i = 0; i <= schritte; i++) {
    const t = i / schritte;
    const w = 2 * Math.PI * schleifen * t;
    punkte.push([
      -3 + 106 * t + 6 * Math.sin(w),
      20 + 15 * Math.cos(w) + r() * 1.2,
    ]);
  }
  return pfad(punkte);
}

const FORMEN: Record<AbhakAnimation, string> = {
  zickzack: zickzack(),
  "hin-und-her": hinUndHer(),
  kringel: kringel(),
};

/** Strich über der Kachel – ragt über den Rand und ist leicht transparent. */
export function KritzelStrich({ form }: { form: AbhakAnimation }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -inset-1.5 overflow-visible"
      style={{ width: "calc(100% + 0.75rem)", height: "calc(100% + 0.75rem)" }}
    >
      <path
        className="kritzel-strich"
        pathLength={1}
        d={FORMEN[form]}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.55}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * VORÜBERGEHEND, zum Aussuchen: drei Beispielkacheln spielen ihre Animation in
 * Dauerschleife. Antippen wählt die Form für das echte Abhaken.
 */
export function AbhakVorschau() {
  const { abhakAnimation } = useEinstellungen();
  return (
    <section
      aria-label="Abhak-Animation wählen"
      className="mt-2 border border-dashed px-4 py-3"
    >
      <p className="pb-3 text-center text-xs text-muted-foreground">
        Test: Welches Kritzeln beim Abhaken? Antippen zum Auswählen.
      </p>
      <ul className="grid grid-cols-3 gap-4">
        {ABHAK_ANIMATIONEN.map((a) => (
          <li key={a.id} className="flex flex-col items-center gap-2">
            <div className="h-14 w-full">
              <div
                className={cn(
                  "abhak-schleife relative flex h-full items-center justify-center border bg-card text-base font-medium text-primary",
                  ABHAK_KLASSE,
                )}
              >
                <KritzelStrich form={a.id} />
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
