import { usePowerSync } from "@powersync/react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { heute, tageAb, tagePlus, tagName } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { einplanen } from "./aktionen";
import { usePlan, useStandardPortionen } from "./daten";

/** Im Rezept: „Einplanen“ – einen der nächsten 14 Tage wählen. */
export function Einplanen({
  offen,
  schliessen,
  haushaltId,
  nutzerId,
  rezept,
}: {
  offen: boolean;
  schliessen: () => void;
  haushaltId: string;
  nutzerId: string;
  rezept: { id: string; titel: string };
}) {
  const db = usePowerSync();
  const start = heute();
  const tage = tageAb(start, 14);
  const plan = usePlan(haushaltId, start, tagePlus(start, 13));
  const standard = useStandardPortionen(haushaltId);

  async function waehlen(datum: string) {
    await einplanen(db, {
      haushaltId,
      nutzerId,
      datum,
      rezeptId: rezept.id,
      titel: rezept.titel,
      portionen: standard,
    });
    schliessen();
    toast.success(`„${rezept.titel}“ für ${tagName(datum)} eingeplant`, {
      action: {
        label: "Zum Plan",
        onClick: () => {
          location.hash = "plan";
        },
      },
    });
  }

  return (
    <Drawer open={offen} onOpenChange={(o) => !o && schliessen()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg pb-4">
          <DrawerHeader>
            <DrawerTitle>Wann gibt's „{rezept.titel}“?</DrawerTitle>
            <DrawerDescription>
              Für {standard} Portionen – im Plan änderbar.
            </DrawerDescription>
          </DrawerHeader>
          <ul className="max-h-[55dvh] space-y-1 overflow-y-auto px-4">
            {tage.map((tag) => {
              const geplant = plan.filter((e) => e.datum === tag);
              return (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => waehlen(tag)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left active:bg-muted"
                  >
                    <span
                      className={cn(
                        "w-24 shrink-0 font-medium",
                        tag === start && "text-primary",
                      )}
                    >
                      {tagName(tag)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {geplant.length > 0
                        ? geplant.map((e) => e.titel).join(", ")
                        : "noch frei"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
