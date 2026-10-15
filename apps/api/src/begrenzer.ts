/**
 * Einfache Begrenzung pro Konto (gleitendes Fenster, im Speicher): Das API läuft als
 * ein Prozess, das reicht. Nach einem Neustart beginnt die Zählung von vorn – für den
 * Schutz vor versehentlichen Schleifen und Missbrauch genügt das.
 */

export type Grenze = { max: number; fensterMs: number };

export class Begrenzer {
  private readonly zeiten = new Map<string, number[]>();
  private readonly laengstesFenster: number;

  constructor(private readonly grenzen: Grenze[]) {
    this.laengstesFenster = Math.max(...grenzen.map((g) => g.fensterMs));
  }

  /**
   * Zählt einen Versuch, wenn er erlaubt ist. Sonst: wie viele Sekunden bis zum
   * nächsten erlaubten.
   */
  versuch(
    schluessel: string,
    jetzt = Date.now(),
  ): { erlaubt: true } | { erlaubt: false; wiederInSekunden: number } {
    const zeiten = (this.zeiten.get(schluessel) ?? []).filter(
      (t) => jetzt - t < this.laengstesFenster,
    );
    for (const { max, fensterMs } of this.grenzen) {
      const imFenster = zeiten.filter((t) => jetzt - t < fensterMs);
      if (imFenster.length >= max) {
        const aeltester = imFenster[imFenster.length - max] ?? jetzt;
        this.zeiten.set(schluessel, zeiten);
        return {
          erlaubt: false,
          wiederInSekunden: Math.max(
            1,
            Math.ceil((aeltester + fensterMs - jetzt) / 1000),
          ),
        };
      }
    }
    zeiten.push(jetzt);
    this.zeiten.set(schluessel, zeiten);
    // Gelegentlich aufräumen, damit die Map nicht wächst.
    if (this.zeiten.size > 1000) {
      for (const [k, v] of this.zeiten) {
        if (v.every((t) => jetzt - t >= this.laengstesFenster)) {
          this.zeiten.delete(k);
        }
      }
    }
    return { erlaubt: true };
  }
}

const MINUTE = 60_000;
const STUNDE = 60 * MINUTE;

/** Standard-Grenzen; Tests setzen eigene. */
export const GRENZEN = {
  /** Server ruft fremde Seiten ab. */
  import: [
    { max: 5, fensterMs: MINUTE },
    { max: 30, fensterMs: STUNDE },
  ],
  /** Fotos belegen Speicher. */
  foto: [
    { max: 20, fensterMs: 10 * MINUTE },
    { max: 100, fensterMs: 24 * STUNDE },
  ],
  /** Gegen Durchprobieren von Codes. */
  einladung: [{ max: 10, fensterMs: 10 * MINUTE }],
  /** Produktsuche bei Open Food Facts (schnelles Scannen im Laden erlaubt). */
  produkt: [
    { max: 30, fensterMs: MINUTE },
    { max: 500, fensterMs: 24 * STUNDE },
  ],
} satisfies Record<string, Grenze[]>;

/** So viel Foto-Speicher darf ein Haushalt belegen. */
export const FOTO_SPEICHER_HOECHSTENS = 200 * 1024 * 1024;
