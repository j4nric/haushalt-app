import { ImageOff, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { vorWann } from "@/lib/zeit";

type Uebersicht = {
  nutzer: {
    id: string;
    name: string;
    email: string;
    erstellt_am: string;
    zuletzt_aktiv: string | null;
    haushalte: {
      id: string;
      name: string;
      rolle: string;
      mitglieder: number;
    }[];
  }[];
  zahlen: { haushalte: number; rezepte: number; eintraege: number };
  fotos: { gesamt: number; ungenutzt: number; ungenutzt_bytes: number };
};

/** Ist dieses Konto Admin? Fragt einmal beim Server (offline: nein). */
export function useIstAdmin(): boolean {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    fetch("/api/ich")
      .then((a) => (a.ok ? a.json() : { admin: false }))
      .then((d: { admin?: boolean }) => setAdmin(Boolean(d.admin)))
      .catch(() => setAdmin(false));
  }, []);
  return admin;
}

/** Nur lesend: alle Konten mit ihren Haushalten. Wird nicht synchronisiert. */
export function AdminPanel({
  offen,
  schliessen,
}: {
  offen: boolean;
  schliessen: () => void;
}) {
  const [daten, setDaten] = useState<Uebersicht | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [raeumt, setRaeumt] = useState(false);

  const laden = useCallback(() => {
    setFehler(null);
    fetch("/api/admin/uebersicht")
      .then(async (a) => {
        if (!a.ok) {
          throw new Error();
        }
        setDaten(await a.json());
      })
      .catch(() => setFehler("Laden braucht eine Internetverbindung."));
  }, []);

  useEffect(() => {
    if (offen) {
      laden();
    }
  }, [offen, laden]);

  async function aufraeumen() {
    setRaeumt(true);
    const antwort = await fetch("/api/admin/fotos-aufraeumen", {
      method: "POST",
    }).catch(() => null);
    setRaeumt(false);
    if (!antwort?.ok) {
      toast.error("Aufräumen hat nicht geklappt – bist du online?");
      return;
    }
    const { anzahl, bytes } = (await antwort.json()) as {
      anzahl: number;
      bytes: number;
    };
    toast.success(
      anzahl === 0
        ? "Nichts zu löschen – jüngere Fotos (unter 1 h) bleiben noch."
        : `${anzahl} ${anzahl === 1 ? "Foto" : "Fotos"} gelöscht (${kb(bytes)})`,
    );
    laden();
  }

  return (
    <Drawer open={offen} onOpenChange={(o) => !o && schliessen()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg pb-6">
          <DrawerHeader>
            <DrawerTitle>Nutzer und Haushalte</DrawerTitle>
            <DrawerDescription>
              {daten
                ? `${daten.nutzer.length} Konten · ${daten.zahlen.haushalte} Haushalte · ${daten.zahlen.rezepte} Rezepte · ${daten.zahlen.eintraege} Listeneinträge`
                : (fehler ?? "Wird geladen …")}
            </DrawerDescription>
          </DrawerHeader>
          {!daten && !fehler && (
            <LoaderCircle className="mx-auto size-6 animate-spin text-muted-foreground" />
          )}
          {daten && (
            <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl border bg-card p-3">
              <ImageOff className="size-5 shrink-0 text-muted-foreground" />
              <p className="flex-1 text-sm">
                {daten.fotos.gesamt} Fotos
                <span className="block text-xs text-muted-foreground">
                  {daten.fotos.ungenutzt === 0
                    ? "alle in Rezepten verwendet"
                    : `${daten.fotos.ungenutzt} ungenutzt (${kb(daten.fotos.ungenutzt_bytes)}) – täglich automatisch nach 24 h`}
                </span>
              </p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={daten.fotos.ungenutzt === 0 || raeumt}
                onClick={aufraeumen}
              >
                {raeumt ? <LoaderCircle className="animate-spin" /> : null}
                Jetzt aufräumen
              </Button>
            </div>
          )}
          {daten && (
            <ul className="max-h-[55dvh] space-y-2 overflow-y-auto px-4">
              {daten.nutzer.map((n) => (
                <li key={n.id} className="rounded-xl border bg-card p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{n.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {n.zuletzt_aktiv
                        ? `aktiv ${vorWann(n.zuletzt_aktiv)}`
                        : "nie aktiv"}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {n.email} · seit{" "}
                    {new Date(n.erstellt_am).toLocaleDateString("de-DE")}
                  </p>
                  {n.haushalte.length === 0 ? (
                    <p className="pt-1 text-sm text-amber-700 dark:text-amber-300">
                      Kein Haushalt
                    </p>
                  ) : (
                    <ul className="flex flex-wrap gap-1.5 pt-2">
                      {n.haushalte.map((h) => (
                        <li
                          key={h.id}
                          className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                        >
                          {h.rolle === "besitzer" ? "👑 " : ""}
                          {h.name} · {h.mitglieder}{" "}
                          {h.mitglieder === 1 ? "Mitglied" : "Mitglieder"}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;
