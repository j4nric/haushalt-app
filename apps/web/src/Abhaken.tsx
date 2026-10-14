import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

// --- Kritzel-Strich -----------------------------------------------------------------
// Der Zickzack wird in echten Pixeln der Kachel gezeichnet (gemessen beim Einblenden).
// Ein gestrecktes SVG (preserveAspectRatio="none") mit gleich dicker Linie würde die
// normierte Strichlänge (pathLength) verfälschen: Der Strich endete dann vor dem Rand.
// Ein fester Zufallsgenerator sorgt für Handschrift-Zittern, das jedes Mal gleich ist.

/** So weit ragt der Strich rundum über die Kachel hinaus. */
const UEBERSTAND = 6;
const ZACKEN = 28;

function zufall(saat: number) {
  let a = saat;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5; // -0.5 … 0.5
  };
}

/**
 * Dichter, senkrechter Zickzack von ganz links bis ganz rechts (Breite b, Höhe h in px).
 * Die Spitzen sind unterschiedlich hoch und tief, wie von Hand gekritzelt; jede Saat
 * ergibt einen anderen Strich.
 */
export function zickzackPfad(b: number, h: number, saat = 7) {
  const r = zufall(saat);
  const punkte: string[] = [];
  for (let i = 0; i <= ZACKEN; i++) {
    // Erster und letzter Punkt exakt am Rand, dazwischen Zittern in der Breite.
    const x = (b * i) / ZACKEN + (i > 0 && i < ZACKEN ? r() * 4 : 0);
    // Oben zwischen 2 % und 34 % der Höhe, unten zwischen 66 % und 98 %.
    const ausschlag = (r() + 0.5) * h * 0.32;
    const y = i % 2 ? h * 0.98 - ausschlag : h * 0.02 + ausschlag;
    punkte.push(`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return punkte.join(" ");
}

/** Strich über der Kachel – ragt über den Rand und ist leicht durchscheinend. */
export function KritzelStrich() {
  const svg = useRef<SVGSVGElement>(null);
  const [groesse, setGroesse] = useState<{ b: number; h: number } | null>(null);
  // Jede Kachel bekommt ihren eigenen Strich.
  const [saat] = useState(() => Math.floor(Math.random() * 2 ** 31));
  useLayoutEffect(() => {
    const rechteck = svg.current?.getBoundingClientRect();
    if (rechteck) {
      setGroesse({ b: rechteck.width, h: rechteck.height });
    }
  }, []);

  return (
    <svg
      ref={svg}
      aria-hidden
      className="pointer-events-none absolute overflow-visible"
      style={{
        inset: -UEBERSTAND,
        width: `calc(100% + ${2 * UEBERSTAND}px)`,
        height: `calc(100% + ${2 * UEBERSTAND}px)`,
      }}
      viewBox={groesse ? `0 0 ${groesse.b} ${groesse.h}` : undefined}
    >
      {groesse && (
        <path
          className="kritzel-strich"
          pathLength={1}
          d={zickzackPfad(groesse.b, groesse.h, saat)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.8}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
