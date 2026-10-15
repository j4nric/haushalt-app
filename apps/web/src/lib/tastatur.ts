/**
 * Bildschirmtastatur (vor allem iPhone): Feste Leisten am unteren Rand bleiben in
 * Safari am „Layout-Viewport“ kleben, der beim Einblenden der Tastatur nicht kleiner
 * wird – die Eingabeleiste rutscht dann hinter die Tastatur oder hängt mitten im Bild.
 * Wir messen über `visualViewport`, wie weit die Tastatur hereinragt, und geben das als
 * CSS-Variable `--tastatur` (px) und `html[data-tastatur="offen"]` weiter.
 */
const SCHWELLE = 120;

export function tastaturAbstand(
  fensterHoehe: number,
  viewport: { height: number; offsetTop: number },
): number {
  return Math.max(
    0,
    Math.round(fensterHoehe - viewport.height - viewport.offsetTop),
  );
}

export function tastaturBeobachten() {
  const vv = window.visualViewport;
  if (!vv) {
    return;
  }
  let bild = 0;
  const messen = () => {
    cancelAnimationFrame(bild);
    bild = requestAnimationFrame(() => {
      const abstand = tastaturAbstand(window.innerHeight, vv);
      const offen = abstand > SCHWELLE;
      const html = document.documentElement;
      html.style.setProperty("--tastatur", `${offen ? abstand : 0}px`);
      if (offen) {
        html.dataset.tastatur = "offen";
      } else {
        delete html.dataset.tastatur;
      }
    });
  };
  vv.addEventListener("resize", messen);
  vv.addEventListener("scroll", messen);
  window.addEventListener("resize", messen);
  messen();
}
