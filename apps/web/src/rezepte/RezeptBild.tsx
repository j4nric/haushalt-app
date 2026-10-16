import { useState } from "react";
import { produktEmoji } from "@/lib/persoenlichkeit";
import { cn } from "@/lib/utils";

/** Typische Gerichte – vor den Produkt-Emojis geprüft („Kürbissuppe“ → 🍲). */
const GERICHTE: [RegExp, string][] = [
  [/pfannkuchen|pancake|crêpe|eierkuchen/i, "🥞"],
  [/waffel/i, "🧇"],
  [/suppe|eintopf|brühe/i, "🍲"],
  [/curry|dal\b/i, "🍛"],
  [/salat|salad|bowl/i, "🥗"],
  [/kuchen|torte/i, "🍰"],
  [/muffin|cupcake/i, "🧁"],
  [/plätzchen|cookie/i, "🍪"],
  [/burger/i, "🍔"],
  [/taco|chili/i, "🌮"],
  [/wrap|burrito/i, "🌯"],
  [/döner|kebab|falafel/i, "🥙"],
  [/sushi/i, "🍣"],
  [/risotto|paella/i, "🥘"],
  [/omelett|rührei|spiegelei/i, "🍳"],
  [/smoothie|shake/i, "🥤"],
  [/gratin|auflauf/i, "🥘"],
];

/** Emoji passend zum Titel („Spaghetti …“ → 🍝), sonst eine Pfanne. */
export function rezeptEmoji(titel: string) {
  // Nudel- und Fleischgerichte zeigt das Produkt-Emoji besser („Nudelauflauf“ → 🍝).
  const produkt = produktEmoji(titel, null);
  const gericht = GERICHTE.find(([m]) => m.test(titel))?.[1];
  if (/nudel|pasta|spaghetti|lasagne|pizza/i.test(titel)) {
    return produkt;
  }
  return gericht ?? (produkt === "🛍️" ? "🍳" : produkt);
}

/**
 * Bild des Rezepts; ohne Bild (oder wenn es nicht lädt, z. B. offline und nie
 * zwischengespeichert) eine farbige Fläche mit Emoji.
 */
export function RezeptBild({
  url,
  titel,
  className,
}: {
  url: string | null;
  titel: string;
  className?: string;
}) {
  const [kaputt, setKaputt] = useState(false);
  if (url && !kaputt) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setKaputt(true)}
        className={cn("w-full bg-muted object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex w-full items-center justify-center text-5xl",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, var(--card)), color-mix(in oklab, var(--favorit) 22%, var(--card)))",
      }}
    >
      {rezeptEmoji(titel)}
    </span>
  );
}
