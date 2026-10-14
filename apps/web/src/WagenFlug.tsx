import { useEffect, useRef, useState } from "react";
import { produktEmoji } from "@/lib/persoenlichkeit";

/**
 * Abgehakte Produkte fliegen als Emoji im Bogen in den Wagen; dort wackelt der
 * Wagen kurz. Ziel ist, was gerade sichtbar ist: der Knopf „Zum Wagen“ oder das
 * Wagen-Symbol über dem Wagen – sonst die Stelle unten mittig, wo der Knopf erscheint.
 * Bei „Bewegung reduzieren“ fliegt nichts.
 */

type Flug = { id: number; von: DOMRect; emoji: string };

const zuhoerer = new Set<(f: Flug) => void>();
let naechsteId = 0;

/** Ziel-Elemente tragen dieses Attribut (Knopf „Zum Wagen“, Symbol im Wagen). */
export const WAGEN_ZIEL = "data-wagen-ziel";

export function zumWagenFliegen(
  von: DOMRect,
  name: string,
  kategorie: string | null,
) {
  if (
    von.width === 0 ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  const flug = { id: naechsteId++, von, emoji: produktEmoji(name, kategorie) };
  for (const z of zuhoerer) {
    z(flug);
  }
}

export function FlugEbene() {
  const [fluege, setFluege] = useState<Flug[]>([]);
  useEffect(() => {
    const z = (f: Flug) => setFluege((alle) => [...alle, f]);
    zuhoerer.add(z);
    return () => {
      zuhoerer.delete(z);
    };
  }, []);
  return fluege.map((f) => (
    <Flieger
      key={f.id}
      flug={f}
      fertig={() => setFluege((alle) => alle.filter((x) => x.id !== f.id))}
    />
  ));
}

const rem = () =>
  Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

/** Erstes sichtbare Ziel (unten verdecken Eingabeleiste und Navigation ~9 rem). */
function ziel(): { x: number; y: number; element: HTMLElement | null } {
  const unten = window.innerHeight - 9 * rem();
  for (const element of document.querySelectorAll<HTMLElement>(
    `[${WAGEN_ZIEL}]`,
  )) {
    const r = element.getBoundingClientRect();
    if (r.width > 0 && r.top >= 0 && r.bottom <= unten) {
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, element };
    }
  }
  return { x: window.innerWidth / 2, y: unten - 2 * rem(), element: null };
}

const WACKELN: Keyframe[] = [
  { transform: "rotate(0) scale(1)" },
  { transform: "rotate(-14deg) scale(1.2)" },
  { transform: "rotate(10deg) scale(1.12)" },
  { transform: "rotate(-6deg) scale(1.05)" },
  { transform: "rotate(0) scale(1)" },
];

function Flieger({ flug, fertig }: { flug: Flug; fertig: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fertigRef = useRef(fertig);
  fertigRef.current = fertig;
  const start = {
    x: flug.von.left + flug.von.width / 2,
    y: flug.von.top + flug.von.height / 2,
  };
  const startRef = useRef(start);

  useEffect(() => {
    let animation: Animation | undefined;
    // Zwei Frames warten: Wagen bzw. Knopf erscheinen erst nach dem Abhaken.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const element = ref.current;
        if (!element) {
          return;
        }
        const von = startRef.current;
        const z = ziel();
        const dx = z.x - von.x;
        const dy = z.y - von.y;
        // Bogen nach oben, je weiter der Weg, desto höher (begrenzt).
        const hub = Math.min(140, 50 + Math.abs(dy) * 0.3);
        const schritte = [0, 0.2, 0.4, 0.6, 0.8, 1];
        animation = element.animate(
          schritte.map((t) => ({
            offset: t,
            opacity: t === 1 ? 0.4 : 1,
            transform: `translate(${dx * t}px, ${dy * t - 4 * hub * t * (1 - t)}px) scale(${1 + 0.5 * Math.sin(Math.PI * t) - 0.5 * t}) rotate(${t * 300}deg)`,
          })),
          { duration: 750, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
        );
        animation.onfinish = () => {
          z.element?.animate(WACKELN, { duration: 450, easing: "ease-out" });
          fertigRef.current();
        };
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      animation?.cancel();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed z-50 flex size-10 items-center justify-center text-3xl drop-shadow-md select-none"
      style={{ left: start.x - 20, top: start.y - 20 }}
    >
      {flug.emoji}
    </div>
  );
}
