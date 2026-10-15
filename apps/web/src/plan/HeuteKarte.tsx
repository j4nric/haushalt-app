import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heute } from "@/lib/plan";
import { rezeptEmoji } from "../rezepte/Rezepte";
import { usePlan } from "./daten";

/** Oben auf der Einkaufsliste: Was gibt's heute? Ein Tipp führt zum Plan. */
export function HeuteKarte({ haushaltId }: { haushaltId: string }) {
  const tag = heute();
  const offen = usePlan(haushaltId, tag, tag).filter((e) => !e.erledigt);
  if (offen.length === 0) {
    return null;
  }
  return (
    <section
      aria-label="Heute geplant"
      className="mt-2 flex items-center gap-3 rounded-2xl border p-3"
      style={{
        background: "color-mix(in oklab, var(--card), var(--primary) 8%)",
      }}
    >
      <button
        type="button"
        onClick={() => {
          location.hash = "plan";
        }}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span aria-hidden className="text-3xl">
          {offen[0]?.rezept_id ? rezeptEmoji(offen[0].titel) : "🍽️"}
        </span>
        <span className="min-w-0">
          <span className="block text-xs text-muted-foreground">
            Heute gibt's
          </span>
          <span className="block truncate font-semibold">
            {offen.map((e) => e.titel).join(" & ")}
          </span>
        </span>
      </button>
      {offen[0]?.rezept_id && offen[0].rezept_da ? (
        <Button
          size="sm"
          className="shrink-0 rounded-full"
          onClick={() => {
            location.hash = `plan/${offen[0]?.id}/kochen`;
          }}
        >
          <ChefHat /> Kochen
        </Button>
      ) : null}
    </section>
  );
}
