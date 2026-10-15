import { Plus, X } from "lucide-react";
import { useState } from "react";
import { produktEmoji, vergessenSatz } from "@/lib/persoenlichkeit";
import type { Ueberfaellig } from "@/lib/vergessen";

const SCHLUESSEL = "haushalt-vergessen-weggetippt";

/** Weggetippte Erinnerungen: Artikel → letzter Kauf. Nach dem nächsten Kauf zählt sie neu. */
function ladeWeggetippt(): Record<string, string> {
  try {
    const roh = JSON.parse(localStorage.getItem(SCHLUESSEL) ?? "{}");
    return roh && typeof roh === "object" ? roh : {};
  } catch {
    return {};
  }
}

/**
 * „Vielleicht vergessen?“ – überfällige Produkte melden sich oben auf der Liste selbst
 * zu Wort. Plus setzt sie auf die Liste, X blendet die Erinnerung bis zum nächsten
 * Kauf aus (nur auf diesem Gerät).
 */
export function Vergessen({
  artikel,
  hinzufuegen,
}: {
  artikel: Ueberfaellig[];
  hinzufuegen: (id: string) => void;
}) {
  const [weggetippt, setWeggetippt] = useState(ladeWeggetippt);
  const sichtbar = artikel.filter((a) => weggetippt[a.id] !== a.letzterKauf);
  if (sichtbar.length === 0) {
    return null;
  }

  function wegtippen(a: Ueberfaellig) {
    const neu = { ...weggetippt, [a.id]: a.letzterKauf };
    setWeggetippt(neu);
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(neu));
    } catch {
      // Ohne Speicher gilt es bis zum Neuladen.
    }
  }

  return (
    <section
      aria-label="Vielleicht vergessen"
      className="mt-2 rounded-2xl border p-3 animate-in fade-in slide-in-from-top-1"
      style={{
        background: "color-mix(in oklab, var(--card), #f59e0b 12%)",
        borderColor: "color-mix(in oklab, var(--border), #f59e0b 35%)",
      }}
    >
      <h3 className="px-1 pb-2 text-sm font-semibold">
        💭 Vielleicht vergessen?
      </h3>
      <ul className="space-y-1.5">
        {sichtbar.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-xl bg-card/70 py-2 pr-1.5 pl-3"
          >
            <span aria-hidden className="text-2xl">
              {produktEmoji(a.name, a.kategorie)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-tight">{a.name}</p>
              <p className="text-xs leading-snug text-muted-foreground italic">
                „{vergessenSatz(a.name, a.abstandTage, a.seitTage)}“
              </p>
            </div>
            <button
              type="button"
              aria-label={`${a.name} auf die Liste`}
              onClick={() => hinzufuegen(a.id)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95"
            >
              <Plus className="size-5" />
            </button>
            <button
              type="button"
              aria-label={`${a.name} brauche ich nicht`}
              onClick={() => wegtippen(a)}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground active:scale-95"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
