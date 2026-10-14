import { useQuery } from "@powersync/react";
import { Check, Copy, LogOut, Share2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "./auth";
import { vergessen } from "./nutzer";
import { trennenUndLeeren } from "./powersync";

/** Bereich „Haushalt“: Mitglieder, Einladen, Konto. */
export function Haushalt({
  haushaltId,
  name,
}: {
  haushaltId: string;
  name: string;
}) {
  const { data: mitglieder } = useQuery<{
    id: string;
    anzeigename: string;
    rolle: string;
  }>(
    "SELECT id, anzeigename, rolle FROM haushalt_mitglieder WHERE haushalt_id = ? ORDER BY beigetreten_am",
    [haushaltId],
  );

  async function abmelden() {
    await trennenUndLeeren();
    vergessen();
    await authClient.signOut();
  }

  return (
    <div className="space-y-6 pt-2">
      <section>
        <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">
          Mitglieder
        </h2>
        <ul className="divide-y rounded-xl border bg-card">
          {mitglieder.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="font-medium">{m.anzeigename}</span>
              {m.rolle === "besitzer" && (
                <span className="text-xs text-muted-foreground">
                  hat den Haushalt angelegt
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Einladen haushaltId={haushaltId} />

      <section>
        <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">
          Konto
        </h2>
        <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
          <span>
            Angemeldet als <strong>{name}</strong>
          </span>
          <Button variant="ghost" onClick={abmelden}>
            <LogOut /> Abmelden
          </Button>
        </div>
        <p className="px-1 pt-2 text-xs text-muted-foreground">
          Beim Abmelden werden alle Daten von diesem Gerät gelöscht. Auf dem
          Server bleiben sie erhalten.
        </p>
      </section>
    </div>
  );
}

function Einladen({ haushaltId }: { haushaltId: string }) {
  const [einladung, setEinladung] = useState<{
    code: string;
    gueltigBis: string;
  } | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);

  async function erzeugen() {
    setFehler(null);
    const antwort = await fetch(`/api/haushalte/${haushaltId}/einladungen`, {
      method: "POST",
    }).catch(() => null);
    if (antwort?.ok) {
      setEinladung(await antwort.json());
    } else {
      setFehler("Einladen braucht eine Internetverbindung.");
    }
  }

  async function teilen(code: string) {
    const text = `Komm in unseren Haushalt! Öffne ${location.origin}, registriere dich und gib diesen Code ein: ${code}`;
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(code);
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  }

  return (
    <section>
      <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">
        Jemanden einladen
      </h2>
      <div className="rounded-xl border bg-card p-4">
        {einladung ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">Einladungscode</p>
            <p
              data-testid="einladungscode"
              className="font-mono text-3xl font-semibold tracking-widest"
            >
              {einladung.code}
            </p>
            <p className="text-xs text-muted-foreground">
              Gültig bis{" "}
              {new Date(einladung.gueltigBis).toLocaleDateString("de-DE")},
              einmal verwendbar.
            </p>
            <Button className="w-full" onClick={() => teilen(einladung.code)}>
              {"share" in navigator ? (
                <Share2 />
              ) : kopiert ? (
                <Check />
              ) : (
                <Copy />
              )}
              {"share" in navigator
                ? "Code teilen"
                : kopiert
                  ? "Kopiert"
                  : "Code kopieren"}
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={erzeugen}>
            <UserPlus /> Jemanden einladen
          </Button>
        )}
        {fehler && <p className="pt-2 text-sm text-destructive">{fehler}</p>}
      </div>
    </section>
  );
}
