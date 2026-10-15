import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { HaushaltEinrichten } from "./HaushaltEinrichten";
import { haushaltWaehlen, type MeinHaushalt } from "./haushaltwahl";

/** Haushalt wechseln, neuen anlegen oder per Code beitreten. */
export function HaushaltWechseln({
  offen,
  schliessen,
  haushalte,
  aktivId,
}: {
  offen: boolean;
  schliessen: () => void;
  haushalte: MeinHaushalt[];
  aktivId: string | undefined;
}) {
  const [neu, setNeu] = useState(false);
  const zu = () => {
    setNeu(false);
    schliessen();
  };

  return (
    <Drawer open={offen} onOpenChange={(o) => !o && zu()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg px-4 pb-6">
          <DrawerHeader className="px-0">
            <DrawerTitle>
              {neu ? "Weiterer Haushalt" : "Haushalt wechseln"}
            </DrawerTitle>
            <DrawerDescription>
              {neu
                ? "Neu anlegen oder mit einem Einladungscode beitreten."
                : "Gilt für dieses Gerät – die anderen bleiben, wo sie sind."}
            </DrawerDescription>
          </DrawerHeader>
          {neu ? (
            <HaushaltEinrichten
              ueberschrift={false}
              fertig={() => {
                zu();
                toast.success("Haushalt hinzugefügt – er erscheint gleich");
              }}
            />
          ) : (
            <div className="space-y-3">
              <ul className="space-y-1">
                {haushalte.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => {
                        haushaltWaehlen(h.id);
                        zu();
                        if (h.id !== aktivId) {
                          toast(`Gewechselt zu „${h.name}“`);
                        }
                      }}
                      aria-current={h.id === aktivId ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left active:bg-muted",
                        h.id === aktivId && "bg-secondary",
                      )}
                    >
                      <span className="flex-1 font-medium">{h.name}</span>
                      {h.id === aktivId && (
                        <Check className="size-5 text-primary" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="h-11 w-full rounded-full"
                onClick={() => setNeu(true)}
              >
                <Plus /> Weiteren Haushalt hinzufügen
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
