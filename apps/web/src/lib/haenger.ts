/**
 * Notausgang: Modale Dialoge (Radix/vaul) sperren die Seite mit
 * `body { pointer-events: none }` und heben das beim Schließen wieder auf. Geht dabei
 * etwas schief (iOS-Tastatur, Dialog verschwindet mitten in einer Geste), bleibt die
 * Sperre stehen und nichts lässt sich mehr antippen – bis zum Neustart. Ist die Seite
 * gesperrt, aber kein Dialog offen, heben wir die Sperre nach kurzer Zeit selbst auf.
 */
const OFFENER_DIALOG =
  '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]';

/**
 * Offen heißt: wirklich zu sehen. Ein Dialog, der weggewischt aus dem Bild gerutscht
 * ist, aber nicht sauber geschlossen wurde, zählt nicht – sonst bliebe die Sperre.
 */
function dialogSichtbar(): boolean {
  return [...document.querySelectorAll(OFFENER_DIALOG)].some((d) => {
    const r = d.getBoundingClientRect();
    return (
      r.height > 0 &&
      r.width > 0 &&
      r.top < window.innerHeight - 24 &&
      r.bottom > 24 &&
      getComputedStyle(d).visibility !== "hidden"
    );
  });
}

export function haengendeSperrenLoesen(warteMs = 600) {
  let zeitgeber: ReturnType<typeof setTimeout> | undefined;
  const pruefen = () => {
    clearTimeout(zeitgeber);
    if (document.body.style.pointerEvents !== "none") {
      return;
    }
    // Erst abwarten: Beim Wechsel zwischen zwei Dialogen ist kurz keiner offen.
    zeitgeber = setTimeout(() => {
      if (document.body.style.pointerEvents === "none" && !dialogSichtbar()) {
        document.body.style.removeProperty("pointer-events");
      }
    }, warteMs);
  };
  new MutationObserver(pruefen).observe(document.body, {
    attributes: true,
    attributeFilter: ["style"],
    childList: true,
  });
  // Antippen einer gesperrten Seite landet am <html> – auch dann nachsehen.
  document.addEventListener("pointerdown", pruefen, true);
  document.addEventListener("visibilitychange", pruefen);
}
