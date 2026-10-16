import { ShoppingCart } from "lucide-react";
import { type ReactNode, type RefObject, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEinstellungen } from "@/einstellungen";
import { cn } from "@/lib/utils";
import { RASTER } from "../Verlauf";

/** Der Wagen: abgesetzt durch eine Fläche in der Akzentfarbe, Überschrift mittig. */
export function Wagen({
  bereich,
  leeren,
  anschliessend,
  children,
}: {
  bereich: RefObject<HTMLElement | null>;
  leeren: () => void;
  anschliessend: boolean;
  children: ReactNode;
}) {
  const { spalten } = useEinstellungen();
  return (
    <section
      ref={bereich}
      aria-label="Im Wagen"
      className={cn(
        "-mx-4 scroll-mt-16 px-4 pt-4 pb-5",
        anschliessend ? "mt-0" : "mt-8",
      )}
      style={{
        background:
          "color-mix(in oklab, var(--background), var(--primary) 10%)",
        borderTop:
          "1px solid color-mix(in oklab, var(--background), var(--primary) 25%)",
      }}
    >
      <h3 className="flex items-center justify-center gap-2 pb-3 text-sm font-semibold tracking-wide text-primary uppercase">
        <span className="inline-flex">
          <ShoppingCart className="size-4" />
        </span>{" "}
        Im Wagen
      </h3>
      <ul className={cn("grid auto-rows-fr gap-2", RASTER[spalten])}>
        {children}
      </ul>
      <div className="pt-3 text-center">
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={leeren}
        >
          Wagen leeren
        </Button>
      </div>
    </section>
  );
}

/**
 * Runder Knopf unten mittig: erscheint, sobald etwas gescrollt wurde und der Wagen nicht
 * im Bild ist; ein Tipp scrollt hinunter. Ist ein Teil des Wagens sichtbar, verschwindet er.
 */
export function ZumWagenKnopf({
  wagen,
  anzahl,
}: {
  wagen: RefObject<HTMLElement | null>;
  anzahl: number;
}) {
  const [gescrollt, setGescrollt] = useState(false);
  const [wagenSichtbar, setWagenSichtbar] = useState(false);

  useEffect(() => {
    const pruefen = () => setGescrollt(window.scrollY > 40);
    pruefen();
    window.addEventListener("scroll", pruefen, { passive: true });
    return () => window.removeEventListener("scroll", pruefen);
  }, []);

  useEffect(() => {
    const element = wagen.current;
    if (!element || anzahl === 0) {
      setWagenSichtbar(false);
      return;
    }
    // Eingabeleiste und Navigation verdecken unten ~9 rem – die zählen nicht als sichtbar.
    // rootMargin akzeptiert nur px oder %, daher umrechnen.
    const beobachter = new IntersectionObserver(
      ([e]) => setWagenSichtbar(Boolean(e?.isIntersecting)),
      {
        rootMargin: `0px 0px -${9 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)}px 0px`,
      },
    );
    beobachter.observe(element);
    return () => beobachter.disconnect();
  }, [wagen, anzahl]);

  if (anzahl === 0 || !gescrollt || wagenSichtbar) {
    return null;
  }
  return (
    <button
      type="button"
      aria-label={`Zum Wagen (${anzahl})`}
      onClick={() =>
        wagen.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg"
    >
      <ShoppingCart className="size-5" />
      {anzahl}
    </button>
  );
}
