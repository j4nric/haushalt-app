import { type MouseEvent, type PointerEvent, useRef, useState } from "react";

const SCHWELLE_LOESCHEN = 96; // px nach links
const SCHWELLE_RICHTUNG = 8; // px, bevor feststeht: wischen oder scrollen
const LANG_DRUECKEN_MS = 500;

/**
 * Gesten für eine Listenzeile: nach links wischen → `loeschen`, lang drücken → `lang`.
 * Kurzes Antippen bleibt ein normaler Klick (funktioniert so auch per Tastatur);
 * nach einer Geste unterdrückt `klick()` den darauf folgenden Klick.
 * Vertikales Scrollen bleibt erlaubt (touch-action: pan-y an der Zeile).
 */
export function useWischen({
  loeschen,
  lang,
}: {
  loeschen?: () => void;
  lang?: () => void;
}) {
  const [versatz, setVersatz] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const modus = useRef<"offen" | "wischen" | "scrollen" | "lang">("offen");
  const geste = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return {
    versatz,
    /** Für onClick: führt `aktion` nur aus, wenn kein Wischen/langes Drücken vorausging. */
    klick(aktion: () => void) {
      return () => {
        if (geste.current) {
          geste.current = false;
          return;
        }
        aktion();
      };
    },
    handler: {
      onPointerDown(e: PointerEvent) {
        if (e.button !== 0) {
          return;
        }
        start.current = { x: e.clientX, y: e.clientY };
        modus.current = "offen";
        geste.current = false;
        if (lang) {
          timer.current = setTimeout(() => {
            modus.current = "lang";
            geste.current = true;
            navigator.vibrate?.(10);
            lang();
          }, LANG_DRUECKEN_MS);
        }
      },
      onPointerMove(e: PointerEvent) {
        if (!start.current || modus.current === "lang") {
          return;
        }
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        if (
          modus.current === "offen" &&
          Math.max(Math.abs(dx), Math.abs(dy)) > SCHWELLE_RICHTUNG
        ) {
          clearTimeout(timer.current);
          modus.current =
            loeschen && Math.abs(dx) > Math.abs(dy) ? "wischen" : "scrollen";
          geste.current = true;
        }
        if (modus.current === "wischen") {
          setVersatz(Math.min(0, dx));
        }
      },
      onPointerUp() {
        clearTimeout(timer.current);
        start.current = null;
        if (modus.current === "wischen" && versatz < -SCHWELLE_LOESCHEN) {
          loeschen?.();
        }
        setVersatz(0);
      },
      onPointerCancel() {
        clearTimeout(timer.current);
        start.current = null;
        setVersatz(0);
      },
      onContextMenu(e: MouseEvent) {
        // Lang drücken öffnet auf dem Handy sonst das Kontextmenü des Browsers.
        if (lang) {
          e.preventDefault();
        }
      },
    },
  };
}
