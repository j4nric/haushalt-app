import { zutatAlsText } from "@haushalt/db/zutaten";
import { ChefHat, Sun, Timer, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { findeZeitangaben, formatiereRestzeit } from "@/lib/timer";
import { cn } from "@/lib/utils";
import type { Rezept } from "@/rezepte/daten";
import { type GespeicherteZutat, optionaleZuletzt } from "./aktionen";

type LaufenderTimer = {
  id: number;
  name: string;
  /** Zeitpunkt (ms), zu dem er abläuft. */
  ende: number;
  fertig: boolean;
};

/**
 * Kochen: große Schrift, Bildschirm bleibt an, Zutaten zum Abhaken, Zeitangaben in
 * den Schritten starten per Tipp einen Timer. Alles nur auf diesem Gerät.
 */
export function Kochansicht({
  rezept,
  zutaten,
  faktor,
  portionen,
  schliessen,
  fertigGekocht,
}: {
  rezept: Rezept;
  zutaten: GespeicherteZutat[];
  faktor: number;
  portionen: number | null;
  schliessen: () => void;
  fertigGekocht: () => void;
}) {
  const wachBleiben = useWachBleiben();
  const [erledigt, setErledigt] = useState<Set<string>>(new Set());
  const { timer, starten, entfernen } = useTimer();
  const umschalten = (id: string) =>
    setErledigt((alt) => {
      const neu = new Set(alt);
      if (neu.has(id)) {
        neu.delete(id);
      } else {
        neu.add(id);
      }
      return neu;
    });
  const schritte = rezept.schritte.split("\n").filter(Boolean);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg px-4 pb-16">
        <header className="sticky top-0 z-10 -mx-4 space-y-2 bg-background/95 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl leading-tight font-bold">
                {rezept.titel}
              </h2>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {portionen ? `${portionen} Portionen` : null}
                {wachBleiben && (
                  <>
                    {portionen ? " · " : null}
                    <Sun className="size-3.5" /> Bildschirm bleibt an
                  </>
                )}
              </p>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="size-11 rounded-full"
              aria-label="Kochen beenden"
              onClick={schliessen}
            >
              <X />
            </Button>
          </div>
          {timer.length > 0 && (
            <ul aria-label="Timer" className="flex flex-wrap gap-2">
              {timer.map((t) => (
                <li key={t.id}>
                  <TimerAnzeige timer={t} entfernen={() => entfernen(t.id)} />
                </li>
              ))}
            </ul>
          )}
        </header>

        <ZutatenAbhaken
          id="koch-zutaten"
          titel="Zutaten"
          zutaten={optionaleZuletzt(zutaten.filter((z) => !z.gewuerz))}
          faktor={faktor}
          erledigt={erledigt}
          umschalten={umschalten}
        />
        <ZutatenAbhaken
          id="koch-gewuerze"
          titel="Gewürze"
          zutaten={optionaleZuletzt(zutaten.filter((z) => z.gewuerz))}
          faktor={faktor}
          erledigt={erledigt}
          umschalten={umschalten}
        />

        {schritte.length > 0 && (
          <section aria-labelledby="koch-schritte" className="space-y-4 pt-6">
            <h3 id="koch-schritte" className="text-lg font-semibold">
              Zubereitung
            </h3>
            <ol className="space-y-5">
              {schritte.map((s, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Schritte sind Textzeilen ohne eigene IDs.
                <li key={i} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-xl leading-relaxed">
                    <SchrittMitTimern
                      text={s}
                      starten={(sekunden, text) =>
                        starten(`Schritt ${i + 1}: ${text}`, sekunden)
                      }
                    />
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <Button
          className="mt-10 h-14 w-full rounded-full text-lg"
          onClick={fertigGekocht}
        >
          <ChefHat className="size-5" /> Fertig gekocht
        </Button>
        <p className="pt-2 text-center text-xs text-muted-foreground">
          Zählt fürs „zuletzt gekocht“ und eure Kochstatistik.
        </p>
      </div>
    </div>
  );
}

function ZutatenAbhaken({
  id,
  titel,
  zutaten,
  faktor,
  erledigt,
  umschalten,
}: {
  id: string;
  titel: string;
  zutaten: GespeicherteZutat[];
  faktor: number;
  erledigt: Set<string>;
  umschalten: (id: string) => void;
}) {
  if (zutaten.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby={id} className="space-y-2 pt-2">
      <h3 id={id} className="text-lg font-semibold">
        {titel}
      </h3>
      <ul className="space-y-1">
        {zutaten.map((z) => {
          const an = erledigt.has(z.id);
          return (
            <li key={z.id}>
              <label
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2 py-2 text-lg active:bg-muted",
                  z.optional && "text-muted-foreground opacity-70",
                )}
              >
                <input
                  type="checkbox"
                  checked={an}
                  onChange={() => umschalten(z.id)}
                  className="size-6 shrink-0 accent-[var(--primary)]"
                />
                <span
                  className={cn(
                    "transition-opacity",
                    an && "text-muted-foreground line-through opacity-60",
                  )}
                >
                  {z.optional ? "(" : ""}
                  {zutatAlsText(z, faktor)}
                  {z.zusatz && (
                    <span className="text-base text-muted-foreground">
                      , {z.zusatz}
                    </span>
                  )}
                  {z.optional ? ")" : ""}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Schritttext, in dem Zeitangaben als Timer-Knöpfe erscheinen. */
function SchrittMitTimern({
  text,
  starten,
}: {
  text: string;
  starten: (sekunden: number, text: string) => void;
}) {
  const angaben = findeZeitangaben(text);
  let bisher = 0;
  return (
    <>
      {angaben.map((a) => {
        const davor = text.slice(bisher, a.start);
        bisher = a.ende;
        return (
          <Fragment key={a.start}>
            {davor}
            <button
              type="button"
              onClick={() => starten(a.sekunden, a.text)}
              aria-label={`Timer ${a.text} starten`}
              className="mx-0.5 inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-0.5 align-baseline font-semibold text-primary active:scale-95"
            >
              <Timer className="size-4" />
              {a.text}
            </button>
          </Fragment>
        );
      })}
      {text.slice(bisher)}
    </>
  );
}

function TimerAnzeige({
  timer,
  entfernen,
}: {
  timer: LaufenderTimer;
  entfernen: () => void;
}) {
  const [, neuZeichnen] = useState(0);
  useEffect(() => {
    if (timer.fertig) {
      return;
    }
    const takt = setInterval(() => neuZeichnen((n) => n + 1), 250);
    return () => clearInterval(takt);
  }, [timer.fertig]);
  const rest = (timer.ende - Date.now()) / 1000;
  return (
    <span
      className={cn(
        "flex items-center gap-2 rounded-full border bg-card py-1 pr-1 pl-3 text-sm shadow-xs",
        timer.fertig &&
          "animate-pulse border-primary bg-primary text-primary-foreground",
      )}
    >
      <Timer className="size-4" />
      <span className="max-w-36 truncate">{timer.name}</span>
      <span className="font-semibold tabular-nums">
        {timer.fertig ? "Fertig!" : formatiereRestzeit(rest)}
      </span>
      <button
        type="button"
        aria-label={`Timer ${timer.name} ${timer.fertig ? "schließen" : "abbrechen"}`}
        onClick={entfernen}
        className="flex size-7 items-center justify-center rounded-full hover:bg-muted/50"
      >
        <X className="size-4" />
      </button>
    </span>
  );
}

/** Timer dieses Kochvorgangs; beim Ablaufen piept und vibriert es. */
function useTimer() {
  const [timer, setTimer] = useState<LaufenderTimer[]>([]);

  useEffect(() => {
    const laufend = timer.filter((t) => !t.fertig);
    if (laufend.length === 0) {
      return;
    }
    const naechster = Math.min(...laufend.map((t) => t.ende));
    const warten = setTimeout(
      () => {
        const jetzt = Date.now();
        const abgelaufen = laufend.filter((t) => t.ende <= jetzt);
        if (abgelaufen.length > 0) {
          klingeln();
        }
        for (const t of abgelaufen) {
          toast(`⏰ ${t.name} – fertig!`);
        }
        const ids = new Set(abgelaufen.map((t) => t.id));
        setTimer((alle) =>
          alle.map((t) => (ids.has(t.id) ? { ...t, fertig: true } : t)),
        );
      },
      Math.max(0, naechster - Date.now()),
    );
    return () => clearTimeout(warten);
  }, [timer]);

  return {
    timer,
    starten(name: string, sekunden: number) {
      setTimer((alle) => [
        ...alle,
        {
          id: Date.now() + Math.random(),
          name,
          ende: Date.now() + sekunden * 1000,
          fertig: false,
        },
      ]);
    },
    entfernen(id: number) {
      setTimer((alle) => alle.filter((t) => t.id !== id));
    },
  };
}

/** Drei kurze Töne und Vibration (wo das Gerät es kann). */
function klingeln() {
  navigator.vibrate?.([300, 150, 300, 150, 300]);
  try {
    const ton = new AudioContext();
    for (const [i, start] of [0, 0.35, 0.7].entries()) {
      const osz = ton.createOscillator();
      const laut = ton.createGain();
      osz.frequency.value = i === 2 ? 1046 : 880;
      laut.gain.setValueAtTime(0.25, ton.currentTime + start);
      laut.gain.exponentialRampToValueAtTime(
        0.001,
        ton.currentTime + start + 0.3,
      );
      osz.connect(laut).connect(ton.destination);
      osz.start(ton.currentTime + start);
      osz.stop(ton.currentTime + start + 0.3);
    }
    setTimeout(() => ton.close(), 1500);
  } catch {
    // Ohne Audio bleibt die Anzeige.
  }
}

/** Hält den Bildschirm an, solange die Kochansicht offen ist (Screen Wake Lock). */
function useWachBleiben(): boolean {
  const [aktiv, setAktiv] = useState(false);
  useEffect(() => {
    let sperre: WakeLockSentinel | null = null;
    let beendet = false;
    async function anfordern() {
      if (
        !("wakeLock" in navigator) ||
        document.visibilityState !== "visible"
      ) {
        return;
      }
      try {
        sperre = await navigator.wakeLock.request("screen");
        if (beendet) {
          await sperre.release();
          return;
        }
        setAktiv(true);
        sperre.addEventListener("release", () => setAktiv(false));
      } catch {
        setAktiv(false);
      }
    }
    // Beim Wechsel zurück in die App geht die Sperre verloren – neu anfordern.
    const sichtbar = () => anfordern();
    anfordern();
    document.addEventListener("visibilitychange", sichtbar);
    return () => {
      beendet = true;
      document.removeEventListener("visibilitychange", sichtbar);
      sperre?.release().catch(() => {});
    };
  }, []);
  return aktiv;
}
