import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!offen) {
      return;
    }
    setFehler(null);
    fetch("/api/admin/uebersicht")
      .then(async (a) => {
        if (!a.ok) {
          throw new Error();
        }
        setDaten(await a.json());
      })
      .catch(() => setFehler("Laden braucht eine Internetverbindung."));
  }, [offen]);

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
            <ul className="max-h-[60dvh] space-y-2 overflow-y-auto px-4">
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
