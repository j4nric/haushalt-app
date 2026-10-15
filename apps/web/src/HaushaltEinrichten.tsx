import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { haushaltWaehlen } from "./haushaltwahl";

/**
 * Haushalt anlegen oder mit Einladungscode beitreten – beim ersten Start und später
 * für weitere Haushalte. `fertig` bekommt die ID (der neue Haushalt wird aktiv).
 */
export function HaushaltEinrichten({
  fertig,
  ueberschrift = true,
}: {
  fertig?: (id: string) => void;
  ueberschrift?: boolean;
} = {}) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  // Danach bringt der Sync den Haushalt aufs Gerät, und die Liste erscheint von selbst.
  async function senden(pfad: string, body: unknown) {
    setFehler(null);
    setLaeuft(true);
    const antwort = await fetch(`/api${pfad}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    setLaeuft(false);
    if (antwort?.ok) {
      const { id } = (await antwort.json().catch(() => ({}))) as {
        id?: string;
      };
      if (id) {
        haushaltWaehlen(id);
        fertig?.(id);
      }
      return;
    }
    if (!antwort?.ok) {
      const { fehler: meldung } =
        (await antwort?.json().catch(() => ({}))) ?? {};
      setFehler(
        meldung ?? "Keine Verbindung. Für diesen Schritt braucht es Internet.",
      );
    }
  }

  return (
    <section className="space-y-6">
      {ueberschrift && (
        <div>
          <h2 className="text-xl font-semibold">Haushalt einrichten</h2>
          <p className="text-sm text-muted-foreground">
            Leg einen neuen Haushalt an oder tritt mit einem Code bei.
          </p>
        </div>
      )}
      <form
        className="space-y-2"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          senden("/haushalte", {
            name: new FormData(e.currentTarget).get("name"),
          });
        }}
      >
        <Input
          name="name"
          required
          placeholder="z. B. Familie Muster"
          aria-label="Name des Haushalts"
          className="h-11 text-base"
        />
        <Button type="submit" disabled={laeuft} className="h-11 w-full">
          Neuen Haushalt anlegen
        </Button>
      </form>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator className="flex-1" /> oder <Separator className="flex-1" />
      </div>
      <form
        className="space-y-2"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          senden("/einladungen/annehmen", {
            code: new FormData(e.currentTarget).get("code"),
          });
        }}
      >
        <Input
          name="code"
          required
          placeholder="ABCD-2345"
          aria-label="Einladungscode"
          autoCapitalize="characters"
          className="h-11 text-center font-mono text-base tracking-widest"
        />
        <Button
          type="submit"
          variant="outline"
          disabled={laeuft}
          className="h-11 w-full"
        >
          Beitreten
        </Button>
      </form>
      {fehler && (
        <p className="text-sm text-destructive" role="alert">
          {fehler}
        </p>
      )}
    </section>
  );
}
