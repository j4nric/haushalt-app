/** Standardeinheiten, in denen Artikel gezählt oder gemessen werden. */
export const EINHEITEN = ["stueck", "g", "ml"] as const;

export type Einheit = (typeof EINHEITEN)[number];

const ANZEIGE: Record<Einheit, string> = {
  stueck: "Stk.",
  g: "g",
  ml: "ml",
};

/** Formatiert eine Menge für die Anzeige, z. B. `1500 g` → `1,5 kg`. */
export function formatiereMenge(menge: number, einheit: Einheit): string {
  if (einheit !== "stueck" && menge >= 1000) {
    const gross = einheit === "g" ? "kg" : "l";
    return `${zahl(menge / 1000)} ${gross}`;
  }
  return `${zahl(menge)} ${ANZEIGE[einheit]}`;
}

function zahl(wert: number): string {
  return wert.toLocaleString("de-DE", { maximumFractionDigits: 2 });
}
