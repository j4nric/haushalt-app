import { Bell, BellOff, LoaderCircle, Send, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  artenSpeichern,
  ausschalten,
  einschalten,
  PUSH_ARTEN,
  type PushArt,
  type PushZustand,
  pushZustand,
  testSenden,
} from "@/lib/push";
import { cn } from "@/lib/utils";

/** Benachrichtigungen für dieses Gerät: an/aus, welche Arten, Test. */
export function Benachrichtigungen() {
  const [zustand, setZustand] = useState<PushZustand | null>(null);
  const [beschaeftigt, setBeschaeftigt] = useState(false);

  useEffect(() => {
    pushZustand()
      .then(setZustand)
      .catch(() => setZustand({ art: "aus" }));
  }, []);

  async function ausfuehren(arbeit: () => Promise<void>) {
    setBeschaeftigt(true);
    try {
      await arbeit();
    } catch (fehler) {
      toast.error(
        fehler instanceof Error && fehler.message
          ? fehler.message
          : "Hat nicht geklappt – bist du online?",
      );
      setZustand(await pushZustand().catch(() => zustand));
    } finally {
      setBeschaeftigt(false);
    }
  }

  function umschalten(art: PushArt, an: boolean) {
    if (zustand?.art !== "an") {
      return;
    }
    const arten = an
      ? [...zustand.arten, art]
      : zustand.arten.filter((a) => a !== art);
    setZustand({ art: "an", arten });
    ausfuehren(() => artenSpeichern(arten));
  }

  return (
    <section>
      <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">
        Benachrichtigungen
      </h2>
      <div className="divide-y rounded-xl border bg-card">
        {zustand === null ? (
          <LoaderCircle className="mx-auto my-4 size-5 animate-spin text-muted-foreground" />
        ) : zustand.art === "nicht-moeglich" ? (
          <div className="flex gap-3 px-4 py-3 text-sm">
            <BellOff className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            {zustand.ios ? (
              <p>
                Auf dem iPhone gibt es Benachrichtigungen nur in der
                installierten App: in Safari auf{" "}
                <Share className="inline size-4 align-text-bottom" />{" "}
                <strong>Teilen</strong> tippen, dann{" "}
                <strong>„Zum Home-Bildschirm“</strong> – und die App von dort
                öffnen.
              </p>
            ) : (
              <p>Dieser Browser kann keine Benachrichtigungen empfangen.</p>
            )}
          </div>
        ) : zustand.art === "blockiert" ? (
          <div className="flex gap-3 px-4 py-3 text-sm">
            <BellOff className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <p>
              Benachrichtigungen sind für diese App blockiert. Erlauben lässt
              sich das in den Einstellungen des Browsers bzw. des Telefons.
            </p>
          </div>
        ) : (
          <>
            <Zeile
              titel="Auf diesem Gerät"
              text={
                zustand.art === "an"
                  ? "Deine eigenen Änderungen melden sich nie."
                  : "Erfahre, wenn andere etwas eintragen."
              }
              an={zustand.art === "an"}
              gesperrt={beschaeftigt}
              symbol={<Bell className="size-5 text-primary" />}
              umschalten={(an) =>
                ausfuehren(async () => {
                  if (an) {
                    setZustand({ art: "an", arten: await einschalten() });
                  } else {
                    await ausschalten();
                    setZustand({ art: "aus" });
                  }
                })
              }
            />
            {zustand.art === "an" && (
              <>
                {PUSH_ARTEN.map((a) => (
                  <Zeile
                    key={a.id}
                    titel={a.name}
                    text={a.beispiel}
                    an={zustand.arten.includes(a.id)}
                    gesperrt={beschaeftigt}
                    umschalten={(an) => umschalten(a.id, an)}
                  />
                ))}
                <div className="px-4 py-2">
                  <Button
                    variant="ghost"
                    className="-mx-2"
                    disabled={beschaeftigt}
                    onClick={() =>
                      ausfuehren(async () => {
                        await testSenden();
                        toast.success("Test verschickt");
                      })
                    }
                  >
                    <Send /> Test-Benachrichtigung
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <p className="px-1 pt-2 text-xs text-muted-foreground">
        Gilt nur für dieses Gerät und alle deine Haushalte.
      </p>
    </section>
  );
}

function Zeile({
  titel,
  text,
  an,
  gesperrt,
  symbol,
  umschalten,
}: {
  titel: string;
  text: string;
  an: boolean;
  gesperrt: boolean;
  symbol?: React.ReactNode;
  umschalten: (an: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      disabled={gesperrt}
      onClick={() => umschalten(!an)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted disabled:opacity-60"
    >
      {symbol}
      <span className="flex-1">
        <span className="block font-medium">{titel}</span>
        <span className="text-xs text-muted-foreground">{text}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          an ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform",
            an && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
