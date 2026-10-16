import { KATEGORIEN, OHNE_KATEGORIE } from "@haushalt/db/kategorien";
import { usePowerSync } from "@powersync/react";
import { Trash2 } from "lucide-react";
import { KategorieSymbol } from "@/components/KategorieSymbol";
import { NativeAuswahl } from "@/components/NativeAuswahl";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import type { Zeile } from "./zeile";

/** Lang gedrückt: Kategorie ändern (gilt auch künftig) oder löschen. */
export function EintragBearbeiten({
  eintrag,
  schliessen,
  loeschen,
}: {
  eintrag: Zeile | null;
  schliessen: () => void;
  loeschen: (e: Zeile) => void;
}) {
  const db = usePowerSync();
  return (
    <Drawer
      open={eintrag != null}
      onOpenChange={(offen) => !offen && schliessen()}
    >
      <DrawerContent>
        {eintrag && (
          <form
            key={eintrag.id}
            className="mx-auto w-full max-w-lg"
            onSubmit={async (e) => {
              e.preventDefault();
              const kategorie =
                String(new FormData(e.currentTarget).get("kategorie")) || null;
              if (kategorie !== eintrag.kategorie) {
                await db.execute(
                  "UPDATE artikel SET kategorie = ? WHERE id = ?",
                  [kategorie, eintrag.artikel_id],
                );
              }
              schliessen();
            }}
          >
            <DrawerHeader>
              <DrawerTitle className="flex items-center justify-center gap-2">
                <KategorieSymbol
                  kategorie={eintrag.kategorie}
                  name={eintrag.name}
                />
                {eintrag.name}
              </DrawerTitle>
              <DrawerDescription>
                Die Kategorie gilt auch für künftige Einträge.
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-1.5 px-4">
              <Label htmlFor="bearbeiten-kategorie">Kategorie</Label>
              <NativeAuswahl
                id="bearbeiten-kategorie"
                name="kategorie"
                defaultValue={eintrag.kategorie ?? ""}
                className="w-full"
              >
                <option value="">{OHNE_KATEGORIE}</option>
                {KATEGORIEN.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </NativeAuswahl>
            </div>
            <DrawerFooter className="grid grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 text-destructive"
                onClick={() => {
                  schliessen();
                  loeschen(eintrag);
                }}
              >
                <Trash2 /> Löschen
              </Button>
              <Button type="submit" className="h-11">
                Speichern
              </Button>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
