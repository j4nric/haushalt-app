import { DoorOpen, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { haushaltWaehlen } from "./haushaltwahl";

/**
 * Haushalt verlassen. Ist man das letzte Mitglied, verschwindet der Haushalt mit
 * allen Daten – dann muss zur Sicherheit der Name eingetippt werden.
 */
export function HaushaltVerlassen({
  offen,
  schliessen,
  haushaltId,
  name,
  mitglieder,
}: {
  offen: boolean;
  schliessen: () => void;
  haushaltId: string;
  name: string;
  mitglieder: number;
}) {
  const letztes = mitglieder <= 1;
  const [bestaetigung, setBestaetigung] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const darf = !letztes || bestaetigung.trim() === name.trim();

  async function verlassen() {
    setLaeuft(true);
    const antwort = await fetch(`/api/haushalte/${haushaltId}/mitgliedschaft`, {
      method: "DELETE",
    }).catch(() => null);
    setLaeuft(false);
    if (!antwort?.ok) {
      toast.error("Verlassen braucht eine Internetverbindung.");
      return;
    }
    // Der nächste Haushalt wird aktiv; die Daten des alten entfernt der Sync.
    haushaltWaehlen(null);
    setBestaetigung("");
    schliessen();
    location.hash = "";
    toast(letztes ? `„${name}“ wurde gelöscht` : `Du hast „${name}“ verlassen`);
  }

  return (
    <Drawer
      open={offen}
      onOpenChange={(o) => {
        if (!o) {
          setBestaetigung("");
          schliessen();
        }
      }}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>„{name}“ verlassen?</DrawerTitle>
            <DrawerDescription>
              {letztes
                ? "Du bist das letzte Mitglied. Der Haushalt wird mit allen Listen, Vorräten, Rezepten und Plänen endgültig gelöscht."
                : `Die anderen ${mitglieder - 1 === 1 ? "Mitglied behält" : `${mitglieder - 1} Mitglieder behalten`} alles. Du kannst später mit einem neuen Code wieder beitreten.`}
            </DrawerDescription>
          </DrawerHeader>
          {letztes && (
            <div className="space-y-1.5 px-4">
              <label htmlFor="verlassen-name" className="text-sm">
                Zum Bestätigen den Namen eintippen:{" "}
                <strong className="select-all">{name}</strong>
              </label>
              <Input
                id="verlassen-name"
                value={bestaetigung}
                onChange={(e) => setBestaetigung(e.target.value)}
                autoComplete="off"
                className="h-11 text-base"
              />
            </div>
          )}
          <DrawerFooter className="grid grid-cols-2">
            <Button
              variant="outline"
              className="h-12 rounded-full"
              onClick={schliessen}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              className="h-12 rounded-full"
              disabled={!darf || laeuft}
              onClick={verlassen}
            >
              {laeuft ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <DoorOpen />
              )}
              {letztes ? "Löschen" : "Verlassen"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
