import { Dices } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ziehenOhneZuruecklegen } from "@/lib/zufall";
import { rezeptEmoji } from "@/rezepte/RezeptBild";

export type RadRezept = {
  id: string;
  titel: string;
  /** Höher = landet eher auf dem Rad und gewinnt eher. */
  gewicht: number;
};

const FELDER = 8;
const FARBEN = [
  "#16a34a",
  "#db2777",
  "#0284c7",
  "#c2410c",
  "#9333ea",
  "#0891b2",
  "#a16207",
  "#dc2626",
];

/** Titel passt aufs Feld: höchstens 13 Zeichen. */
function kurz(titel: string) {
  return titel.length > 13 ? `${titel.slice(0, 12).trimEnd()}…` : titel;
}

/**
 * „Ich weiß nicht, was ich kochen soll“: Bis zu acht Rezepte auf einem Rad –
 * Favoriten, gut Vorrätiges und lange nicht Gekochtes kommen eher dran.
 */
export function Gluecksrad({
  rezepte,
  oeffnen,
}: {
  rezepte: RadRezept[];
  oeffnen: (id: string) => void;
}) {
  const [offen, setOffen] = useState(false);
  const [felder, setFelder] = useState<RadRezept[]>([]);
  const [drehung, setDrehung] = useState(0);
  const [dreht, setDreht] = useState(false);
  const [gewinner, setGewinner] = useState<RadRezept | null>(null);

  function starten() {
    setFelder(ziehenOhneZuruecklegen(rezepte, FELDER));
    setGewinner(null);
    setDrehung(0);
    setOffen(true);
  }

  function drehen() {
    const [sieger] = ziehenOhneZuruecklegen(felder, 1);
    if (!sieger) {
      return;
    }
    const index = felder.indexOf(sieger);
    const winkel = 360 / felder.length;
    // Mindestens fünf volle Runden, dann steht das Feld des Siegers oben am Zeiger.
    const ziel = 360 - (index + 0.5) * winkel;
    const basis = drehung - (drehung % 360) + 360 * 5;
    setGewinner(null);
    setDreht(true);
    setDrehung(basis + ziel);
    const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(
      () => {
        setDreht(false);
        setGewinner(sieger);
      },
      ruhig ? 0 : 4200,
    );
  }

  if (rezepte.length < 2) {
    return null;
  }
  const winkel = 360 / Math.max(felder.length, 1);

  return (
    <>
      <Button
        size="icon"
        variant="secondary"
        className="size-11 shrink-0 rounded-full"
        aria-label="Glücksrad: Was koche ich heute?"
        onClick={starten}
      >
        <Dices />
      </Button>
      <Drawer open={offen} onOpenChange={setOffen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg pb-6">
            <DrawerHeader>
              <DrawerTitle>Was koche ich heute?</DrawerTitle>
              <DrawerDescription>
                Favoriten und was im Vorrat ist, kommen eher dran.
              </DrawerDescription>
            </DrawerHeader>
            <div className="relative mx-auto aspect-square w-72">
              {/* Zeiger oben */}
              <div
                aria-hidden
                className="absolute top-[-6px] left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[20px] border-x-transparent border-t-foreground drop-shadow"
              />
              <svg
                viewBox="-100 -100 200 200"
                className="size-full drop-shadow-lg"
                role="img"
                aria-label={`Glücksrad mit ${felder.map((f) => f.titel).join(", ")}`}
                style={{
                  transform: `rotate(${drehung}deg)`,
                  transition: dreht
                    ? "transform 4.2s cubic-bezier(0.15, 0.7, 0.1, 1)"
                    : "none",
                }}
              >
                {felder.map((f, i) => {
                  const von = ((i * winkel - 90) * Math.PI) / 180;
                  const bis = (((i + 1) * winkel - 90) * Math.PI) / 180;
                  const mitte = (((i + 0.5) * winkel - 90) * Math.PI) / 180;
                  const gross = winkel > 180 ? 1 : 0;
                  return (
                    <g key={f.id}>
                      <path
                        d={`M0 0 L${98 * Math.cos(von)} ${98 * Math.sin(von)} A98 98 0 ${gross} 1 ${98 * Math.cos(bis)} ${98 * Math.sin(bis)} Z`}
                        fill={FARBEN[i % FARBEN.length]}
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      {/* Emoji außen, Titel entlang des Radius nach innen. */}
                      <text
                        x={78 * Math.cos(mitte)}
                        y={78 * Math.sin(mitte)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="16"
                        transform={`rotate(${(i + 0.5) * winkel} ${78 * Math.cos(mitte)} ${78 * Math.sin(mitte)})`}
                      >
                        {rezeptEmoji(f.titel)}
                      </text>
                      <text
                        x={44 * Math.cos(mitte)}
                        y={44 * Math.sin(mitte)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="8.5"
                        fontWeight="600"
                        fill="white"
                        transform={`rotate(${(i + 0.5) * winkel - 90} ${44 * Math.cos(mitte)} ${44 * Math.sin(mitte)})`}
                      >
                        {kurz(f.titel)}
                      </text>
                    </g>
                  );
                })}
                <circle r="14" fill="white" stroke="#e5e7eb" strokeWidth="2" />
              </svg>
            </div>
            <div className="space-y-3 px-4 pt-5 text-center" aria-live="polite">
              {gewinner ? (
                <>
                  <p className="text-sm text-muted-foreground">Heute gibt's:</p>
                  <p className="text-2xl font-bold animate-in zoom-in-50">
                    {rezeptEmoji(gewinner.titel)} {gewinner.titel}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="h-11 rounded-full"
                      onClick={drehen}
                    >
                      Nochmal
                    </Button>
                    <Button
                      className="h-11 rounded-full"
                      onClick={() => {
                        setOffen(false);
                        oeffnen(gewinner.id);
                      }}
                    >
                      Zum Rezept
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  className="h-12 w-full rounded-full text-base"
                  disabled={dreht}
                  onClick={drehen}
                >
                  <Dices /> {dreht ? "Dreht …" : "Drehen!"}
                </Button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
