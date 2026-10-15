import { useQuery } from "@powersync/react";
import {
  ArrowLeftRight,
  Check,
  Copy,
  DoorOpen,
  LogOut,
  Share2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { PortionenWahl } from "@/components/PortionenWahl";
import { Button } from "@/components/ui/button";
import { AdminPanel, useIstAdmin } from "./AdminPanel";
import { authClient } from "./auth";
import { Benachrichtigungen } from "./Benachrichtigungen";
import { Darstellung } from "./Darstellung";
import { HaushaltVerlassen } from "./HaushaltVerlassen";
import type { MeinHaushalt } from "./haushaltwahl";
import { ausschalten } from "./lib/push";
import { vergessen } from "./nutzer";
import { useStandardPortionen } from "./plan/daten";
import { trennenUndLeeren } from "./powersync";

/** Bereich „Haushalt“: Haushalt wechseln/verlassen, Mitglieder, Einladen, Konto. */
export function Haushalt({
  haushaltId,
  name,
  haushalte,
  wechseln,
}: {
  haushaltId: string;
  name: string;
  haushalte: MeinHaushalt[];
  wechseln: () => void;
}) {
  const [verlassenOffen, setVerlassenOffen] = useState(false);
  const [adminOffen, setAdminOffen] = useState(false);
  const admin = useIstAdmin();
  const haushalt = haushalte.find((h) => h.id === haushaltId);
  const { data: mitglieder } = useQuery<{
    id: string;
    anzeigename: string;
    rolle: string;
  }>(
    "SELECT id, anzeigename, rolle FROM haushalt_mitglieder WHERE haushalt_id = ? ORDER BY beigetreten_am",
    [haushaltId],
  );

  async function abmelden() {
    // Abgemeldete Geräte sollen nichts mehr gemeldet bekommen.
    await ausschalten().catch(() => {});
    await trennenUndLeeren();
    vergessen();
    await authClient.signOut();
  }

  return (
    <div className="space-y-6 pt-2">
      <section>
        <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">
          Haushalt
        </h2>
        <div className="divide-y rounded-xl border bg-card">
          <button
            type="button"
            onClick={wechseln}
            className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted"
          >
            <span className="flex-1">
              <span className="block font-medium">{haushalt?.name}</span>
              <span className="text-xs text-muted-foreground">
                {haushalte.length > 1
                  ? `${haushalte.length} Haushalte – antippen zum Wechseln`
                  : "Wechseln oder weiteren hinzufügen"}
              </span>
            </span>
            <ArrowLeftRight className="size-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setVerlassenOffen(true)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-destructive active:bg-muted"
          >
            <DoorOpen className="size-5" />
            <span className="flex-1 font-medium">Haushalt verlassen</span>
          </button>
        </div>
      </section>

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

      <StandardPortionen haushaltId={haushaltId} />

      <Benachrichtigungen />

      <Darstellung />

      {admin && (
        <section>
          <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">
            Admin
          </h2>
          <button
            type="button"
            onClick={() => setAdminOffen(true)}
            className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left active:bg-muted"
          >
            <ShieldCheck className="size-5 text-primary" />
            <span className="flex-1 font-medium">
              Alle Nutzer und Haushalte
            </span>
          </button>
          <AdminPanel
            offen={adminOffen}
            schliessen={() => setAdminOffen(false)}
          />
        </section>
      )}

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
      <HaushaltVerlassen
        offen={verlassenOffen}
        schliessen={() => setVerlassenOffen(false)}
        haushaltId={haushaltId}
        name={haushalt?.name ?? ""}
        mitglieder={mitglieder.length}
      />
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

/** Für wie viele im Wochenplan standardmäßig gekocht wird (gilt für den Haushalt). */
function StandardPortionen({ haushaltId }: { haushaltId: string }) {
  const gespeichert = useStandardPortionen(haushaltId);
  // Sofort anzeigen; der gespeicherte Wert kommt erst über den Sync zurück.
  const [lokal, setLokal] = useState<number | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const portionen = lokal ?? gespeichert;

  async function setzen(n: number) {
    setFehler(null);
    setLokal(n);
    const antwort = await fetch(`/api/haushalte/${haushaltId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ standard_portionen: n }),
    }).catch(() => null);
    if (!antwort?.ok) {
      setLokal(null);
      setFehler("Ändern braucht eine Internetverbindung.");
    }
  }

  return (
    <section>
      <h2 className="px-1 pb-2 text-sm font-semibold text-muted-foreground">
        Wochenplan
      </h2>
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <span>Standard-Portionen</span>
        <PortionenWahl wert={portionen} aendern={setzen} />
      </div>
      <p className="px-1 pt-2 text-xs text-muted-foreground">
        {fehler ??
          "Neu geplante Gerichte starten mit so vielen Portionen – je Eintrag änderbar."}
      </p>
    </section>
  );
}
