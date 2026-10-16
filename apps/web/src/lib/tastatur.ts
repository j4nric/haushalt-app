/**
 * Bildschirmtastatur (vor allem iPhone): Feste Leisten am unteren Rand bleiben in
 * Safari am „Layout-Viewport“ kleben, der beim Einblenden der Tastatur nicht kleiner
 * wird – die Eingabeleiste rutscht dann hinter die Tastatur oder hängt mitten im Bild.
 *
 * - Schon beim Antippen eines Textfelds gilt die Tastatur als offen
 *   (`html[data-tastatur="offen"]`): Die Navigation verschwindet sofort, statt
 *   erst über der Tastatur zu schweben.
 * - Wie weit die Tastatur hereinragt, misst `visualViewport`; während sie
 *   ein- und ausfährt, bei jedem Bild (Safari meldet das nicht zuverlässig).
 *   Ergebnis als CSS-Variable `--tastatur` (px).
 */
const SCHWELLE = 120;
const NACHMESSEN_MS = 1200;

export function tastaturAbstand(
  fensterHoehe: number,
  viewport: { height: number; offsetTop: number },
): number {
  return Math.max(
    0,
    Math.round(fensterHoehe - viewport.height - viewport.offsetTop),
  );
}

/** Felder, die eine Bildschirmtastatur öffnen. */
function istTextfeld(el: EventTarget | null): boolean {
  if (el instanceof HTMLTextAreaElement) {
    return true;
  }
  if (!(el instanceof HTMLInputElement)) {
    return (el as HTMLElement | null)?.isContentEditable === true;
  }
  return ![
    "checkbox",
    "radio",
    "button",
    "submit",
    "range",
    "color",
    "file",
    "hidden",
  ].includes(el.type);
}

/** Nur Geräte mit Bildschirmtastatur – am Rechner bleibt die Navigation stehen. */
function hatBildschirmtastatur(): boolean {
  return (
    matchMedia("(pointer: coarse)").matches ||
    (navigator.maxTouchPoints > 0 &&
      /iPhone|iPad|Android|Mobi/i.test(navigator.userAgent))
  );
}

export function tastaturBeobachten() {
  const vv = window.visualViewport;
  const html = document.documentElement;
  let fokus = false;
  let messenBis = 0;
  let bild = 0;

  const anwenden = () => {
    const abstand = vv ? tastaturAbstand(window.innerHeight, vv) : 0;
    const sichtbar = abstand > SCHWELLE;
    html.style.setProperty("--tastatur", `${sichtbar ? abstand : 0}px`);
    if (sichtbar || fokus) {
      html.dataset.tastatur = "offen";
    } else {
      delete html.dataset.tastatur;
    }
  };

  // Während die Tastatur ein- oder ausfährt: jedes Bild nachmessen.
  const schleife = () => {
    anwenden();
    if (performance.now() < messenBis) {
      bild = requestAnimationFrame(schleife);
    }
  };
  const nachmessen = () => {
    messenBis = performance.now() + NACHMESSEN_MS;
    cancelAnimationFrame(bild);
    bild = requestAnimationFrame(schleife);
  };

  document.addEventListener("focusin", (e) => {
    if (istTextfeld(e.target) && hatBildschirmtastatur()) {
      fokus = true;
      anwenden();
      nachmessen();
    }
  });
  document.addEventListener("focusout", () => {
    // Wechselt der Fokus nur zum nächsten Feld, bleibt alles, wie es ist.
    setTimeout(() => {
      if (!istTextfeld(document.activeElement)) {
        fokus = false;
        anwenden();
        nachmessen();
      }
    }, 50);
  });
  vv?.addEventListener("resize", nachmessen);
  vv?.addEventListener("scroll", nachmessen);
  window.addEventListener("resize", nachmessen);
  anwenden();
}
