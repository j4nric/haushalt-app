import { Flashlight, Keyboard, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Kamera-Scanner für Barcodes (EAN-13/-8, UPC). Nutzt die eingebaute Erkennung des
 * Browsers (Android/Chrome) und sonst eine mitgelieferte Bibliothek (iPhone/Safari),
 * die erst beim ersten Scannen geladen wird – aus der App selbst, nicht von fremden
 * Servern. Bleibt für weitere Scans offen, bis man ihn schließt.
 */

const FORMATE = ["ean_13", "ean_8", "upc_a", "upc_e"];

type Erkenner = {
  detect: (quelle: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};

export type ScanAntwort =
  /** Erledigt – kurz anzeigen und weiter scannen. */
  | { meldung: string }
  /** Mehr Angaben nötig – Scanner schließen. */
  | "schliessen";

async function erkennerErstellen(): Promise<Erkenner> {
  const Nativ = (
    window as unknown as {
      BarcodeDetector?: {
        new (o: { formats: string[] }): Erkenner;
        getSupportedFormats(): Promise<string[]>;
      };
    }
  ).BarcodeDetector;
  // Für Tests lässt sich die Bibliothek erzwingen (so wie auf dem iPhone).
  const bibliothekErzwingen = (() => {
    try {
      return localStorage.getItem("scanner-bibliothek") === "1";
    } catch {
      return false;
    }
  })();
  if (Nativ && !bibliothekErzwingen) {
    const unterstuetzt: string[] = await Nativ.getSupportedFormats().catch(
      () => [],
    );
    if (FORMATE.every((f) => unterstuetzt.includes(f))) {
      return new Nativ({ formats: FORMATE });
    }
  }
  const [{ BarcodeDetector, prepareZXingModule }, { default: wasmUrl }] =
    await Promise.all([
      import("barcode-detector/ponyfill"),
      import("zxing-wasm/reader/zxing_reader.wasm?url"),
    ]);
  await prepareZXingModule({
    overrides: {
      locateFile: (pfad: string, prefix: string) =>
        pfad.endsWith(".wasm") ? wasmUrl : prefix + pfad,
    },
    fireImmediately: true,
  });
  return new BarcodeDetector({ formats: FORMATE as never[] });
}

/** Prüfziffer von EAN/UPC – schützt vor Fehllesungen. */
export function pruefzifferStimmt(code: string): boolean {
  if (!/^\d{8,14}$/.test(code)) {
    return false;
  }
  const ziffern = [...code].map(Number);
  const pruef = ziffern.pop();
  const summe = ziffern
    .reverse()
    .reduce((s, z, i) => s + z * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (summe % 10)) % 10 === pruef;
}

export function Scanner({
  offen,
  schliessen,
  erkannt,
  titel,
}: {
  offen: boolean;
  schliessen: () => void;
  erkannt: (code: string) => Promise<ScanAntwort>;
  titel: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [zustand, setZustand] = useState<"startet" | "bereit" | "fehler">(
    "startet",
  );
  const [meldung, setMeldung] = useState<string | null>(null);
  const [treffer, setTreffer] = useState(false);
  const [licht, setLicht] = useState<{ an: boolean; geht: boolean }>({
    an: false,
    geht: false,
  });
  const [eintippen, setEintippen] = useState(false);
  const [code, setCode] = useState("");
  const spur = useRef<MediaStreamTrack | null>(null);
  const erkanntRef = useRef(erkannt);
  erkanntRef.current = erkannt;

  // Ein gerade erkannter Code wird ein paar Sekunden nicht erneut gemeldet.
  const zuletzt = useRef<{ code: string; zeit: number } | null>(null);
  const beschaeftigt = useRef(false);

  async function melden(c: string) {
    if (beschaeftigt.current) {
      return;
    }
    if (
      zuletzt.current?.code === c &&
      Date.now() - zuletzt.current.zeit < 3000
    ) {
      return;
    }
    beschaeftigt.current = true;
    zuletzt.current = { code: c, zeit: Date.now() };
    navigator.vibrate?.(60);
    setTreffer(true);
    setTimeout(() => setTreffer(false), 450);
    try {
      const antwort = await erkanntRef.current(c);
      if (antwort === "schliessen") {
        schliessen();
      } else {
        setMeldung(antwort.meldung);
        setTimeout(() => setMeldung(null), 2200);
      }
    } finally {
      beschaeftigt.current = false;
    }
  }
  const meldenRef = useRef(melden);
  meldenRef.current = melden;

  useEffect(() => {
    if (!offen) {
      return;
    }
    let aktiv = true;
    let strom: MediaStream | null = null;
    let zeitgeber: ReturnType<typeof setTimeout> | undefined;
    setZustand("startet");
    setEintippen(false);
    setCode("");

    (async () => {
      try {
        const [erkenner, s] = await Promise.all([
          erkennerErstellen(),
          navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          }),
        ]);
        strom = s;
        if (!aktiv || !video.current) {
          for (const t of s.getTracks()) {
            t.stop();
          }
          return;
        }
        video.current.srcObject = s;
        await video.current.play();
        const track = s.getVideoTracks()[0] ?? null;
        spur.current = track;
        const kann = track?.getCapabilities?.() as
          | { torch?: boolean }
          | undefined;
        setLicht({ an: false, geht: Boolean(kann?.torch) });
        setZustand("bereit");

        const runde = async () => {
          if (!aktiv || !video.current) {
            return;
          }
          if (video.current.readyState >= 2) {
            const funde = await erkenner.detect(video.current).catch(() => []);
            const gueltig = funde
              .map((f) => f.rawValue)
              .find((c) => pruefzifferStimmt(c));
            if (gueltig) {
              await meldenRef.current(gueltig);
            }
          }
          zeitgeber = setTimeout(runde, 120);
        };
        runde();
      } catch {
        if (aktiv) {
          setZustand("fehler");
          setEintippen(true);
        }
      }
    })();

    return () => {
      aktiv = false;
      clearTimeout(zeitgeber);
      for (const t of strom?.getTracks() ?? []) {
        t.stop();
      }
      spur.current = null;
    };
  }, [offen]);

  async function lichtUmschalten() {
    const an = !licht.an;
    await spur.current
      ?.applyConstraints({
        advanced: [{ torch: an } as MediaTrackConstraintSet],
      })
      .catch(() => {});
    setLicht({ ...licht, an });
  }

  if (!offen) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titel}
      className="fixed inset-0 z-50 flex flex-col bg-black text-white"
    >
      <video
        ref={video}
        playsInline
        muted
        className="absolute inset-0 size-full object-cover"
      />
      {/* Abdunkeln außerhalb des Rahmens */}
      <div className="pointer-events-none absolute inset-0 bg-black/45 [mask-image:linear-gradient(black,black),linear-gradient(black,black)] [mask-composite:exclude] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%,min(78vw,340px)_150px]" />

      <header className="relative z-10 flex items-center justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <h2 className="text-base font-semibold drop-shadow">{titel}</h2>
        <div className="flex gap-2">
          {licht.geht && (
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "size-11 rounded-full",
                licht.an && "bg-amber-300 text-black",
              )}
              aria-label={licht.an ? "Licht aus" : "Licht an"}
              aria-pressed={licht.an}
              onClick={lichtUmschalten}
            >
              <Flashlight />
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="size-11 rounded-full"
            aria-label="Scanner schließen"
            onClick={schliessen}
          >
            <X />
          </Button>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div
          className={cn(
            "relative h-[150px] w-[min(78vw,340px)] overflow-hidden rounded-2xl border-2 transition-colors duration-200",
            treffer ? "border-emerald-400" : "border-white/80",
          )}
        >
          {zustand === "bereit" && (
            <span className="absolute inset-x-3 h-0.5 rounded bg-emerald-400/90 shadow-[0_0_12px_2px] shadow-emerald-400/60 [animation:scanlinie_1.8s_ease-in-out_infinite_alternate]" />
          )}
        </div>
      </div>

      <footer className="relative z-10 space-y-3 px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
        <p
          aria-live="polite"
          className={cn(
            "mx-auto w-fit rounded-full px-4 py-2 text-center text-sm font-medium transition-all",
            meldung ? "bg-emerald-500 text-white" : "bg-black/50",
          )}
        >
          {meldung ??
            (zustand === "startet"
              ? "Kamera startet …"
              : zustand === "fehler"
                ? "Keine Kamera – Code einfach eintippen"
                : "Barcode in den Rahmen halten")}
        </p>
        {eintippen ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const c = code.replace(/\D/g, "");
              if (/^\d{8,14}$/.test(c)) {
                setCode("");
                melden(c);
              }
            }}
          >
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="z. B. 4001234567890"
              aria-label="Barcode eintippen"
              className="h-11 rounded-full border-white/30 bg-black/60 px-4 text-base text-white placeholder:text-white/50"
            />
            <Button type="submit" className="h-11 rounded-full">
              Suchen
            </Button>
          </form>
        ) : (
          <Button
            variant="secondary"
            className="mx-auto flex h-10 rounded-full"
            onClick={() => setEintippen(true)}
          >
            <Keyboard /> Code eintippen
          </Button>
        )}
      </footer>
    </div>,
    document.body,
  );
}
