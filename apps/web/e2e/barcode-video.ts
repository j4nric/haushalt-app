import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Ein Barcode als Kamerabild für Chromes simulierte Kamera
 * (--use-file-for-fake-video-capture): ein einzelnes Bild im Y4M-Format, das Chrome
 * in Schleife abspielt. EAN-13 von Hand gezeichnet – keine Zusatzwerkzeuge nötig.
 */

const L = [
  "0001101",
  "0011001",
  "0010011",
  "0111101",
  "0100011",
  "0110001",
  "0101111",
  "0111011",
  "0110111",
  "0001011",
];
const G = [
  "0100111",
  "0110011",
  "0011011",
  "0100001",
  "0011101",
  "0111001",
  "0000101",
  "0010001",
  "0001001",
  "0010111",
];
const R = L.map((m) => [...m].map((b) => (b === "0" ? "1" : "0")).join(""));
const PARITAET = [
  "LLLLLL",
  "LLGLGG",
  "LLGGLG",
  "LLGGGL",
  "LGLLGG",
  "LGGLLG",
  "LGGGLL",
  "LGLGLG",
  "LGLGGL",
  "LGGLGL",
];

/** EAN-13 mit Prüfziffer aus 12 Ziffern. */
export function ean13(basis: string): string {
  const summe = [...basis].reduce(
    (s, z, i) => s + Number(z) * (i % 2 ? 3 : 1),
    0,
  );
  return basis + String((10 - (summe % 10)) % 10);
}

export function barcodeVideo(code: string): string {
  const z = [...code].map(Number);
  let bits = "101";
  const paritaet = PARITAET[z[0] ?? 0] ?? "LLLLLL";
  for (let i = 1; i <= 6; i++) {
    bits += (paritaet[i - 1] === "L" ? L : G)[z[i] ?? 0];
  }
  bits += "01010";
  for (let i = 7; i <= 12; i++) {
    bits += R[z[i] ?? 0];
  }
  bits += "101";

  const breite = 640;
  const hoehe = 480;
  const modul = 4;
  const balken = 220;
  const x0 = Math.floor((breite - bits.length * modul) / 2);
  const y0 = Math.floor((hoehe - balken) / 2);
  const y = Buffer.alloc(breite * hoehe, 235);
  for (let zeile = y0; zeile < y0 + balken; zeile++) {
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === "1") {
        y.fill(
          16,
          zeile * breite + x0 + i * modul,
          zeile * breite + x0 + (i + 1) * modul,
        );
      }
    }
  }
  const farbe = Buffer.alloc((breite / 2) * (hoehe / 2) * 2, 128);
  const datei = join(tmpdir(), `barcode-${code}.y4m`);
  writeFileSync(
    datei,
    Buffer.concat([
      Buffer.from(
        `YUV4MPEG2 W${breite} H${hoehe} F10:1 Ip A1:1 C420jpeg\nFRAME\n`,
      ),
      y,
      farbe,
    ]),
  );
  return datei;
}
