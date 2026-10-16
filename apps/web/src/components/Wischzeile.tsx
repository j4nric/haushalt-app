import { type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Aktion = {
  text: string;
  symbol: ReactNode;
  /** Tailwind-Klassen für den Hintergrund, der beim Wischen erscheint. */
  farbe: string;
  ausfuehren: () => void;
};

const SCHWELLE = 80;
const HOECHSTENS = 120;

/**
 * Listenzeile mit Wischgesten: nach links bzw. rechts ziehen löst eine Aktion aus.
 * Senkrechtes Scrollen bleibt unberührt; ein Wisch löst keinen Klick aus.
 * Die Aktionen gibt es zusätzlich per Knopf (Barrierefreiheit), das hier ist die
 * Abkürzung.
 */
export function Wischzeile({
  links,
  rechts,
  children,
  className,
}: {
  /** Nach links wischen. */
  links?: Aktion | undefined;
  /** Nach rechts wischen. */
  rechts?: Aktion | undefined;
  children: ReactNode;
  className?: string;
}) {
  const [versatz, setVersatz] = useState(0);
  const [zieht, setZieht] = useState(false);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const gewischt = useRef(false);

  function loslassen() {
    if (versatz <= -SCHWELLE && links) {
      links.ausfuehren();
      navigator.vibrate?.(20);
    } else if (versatz >= SCHWELLE && rechts) {
      rechts.ausfuehren();
      navigator.vibrate?.(20);
    }
    start.current = null;
    setZieht(false);
    setVersatz(0);
  }

  const aktiv = versatz < 0 ? links : versatz > 0 ? rechts : undefined;
  const erreicht = Math.abs(versatz) >= SCHWELLE;

  return (
    <li className={cn("relative overflow-hidden", className)}>
      {aktiv && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 flex items-center gap-2 px-5 text-sm font-medium transition-opacity",
            aktiv.farbe,
            versatz < 0 ? "justify-end" : "justify-start",
            erreicht ? "opacity-100" : "opacity-70",
          )}
        >
          {aktiv.symbol}
          {aktiv.text}
        </div>
      )}
      <div
        className={cn(
          "relative bg-card [touch-action:pan-y]",
          !zieht && "transition-transform duration-200",
        )}
        style={{ transform: `translateX(${versatz}px)` }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) {
            return;
          }
          start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          gewischt.current = false;
        }}
        onPointerMove={(e) => {
          const s = start.current;
          if (!s || s.id !== e.pointerId) {
            return;
          }
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          if (!zieht) {
            // Erst entscheiden, ob gewischt oder gescrollt wird.
            if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
              start.current = null;
              return;
            }
            if (Math.abs(dx) < 10) {
              return;
            }
            setZieht(true);
            gewischt.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          const erlaubt = (dx < 0 && links) || (dx > 0 && rechts) ? dx : 0;
          setVersatz(Math.max(-HOECHSTENS, Math.min(HOECHSTENS, erlaubt)));
        }}
        onPointerUp={loslassen}
        onPointerCancel={() => {
          start.current = null;
          setZieht(false);
          setVersatz(0);
        }}
        onClickCapture={(e) => {
          if (gewischt.current) {
            e.preventDefault();
            e.stopPropagation();
            gewischt.current = false;
          }
        }}
      >
        {children}
      </div>
    </li>
  );
}
