import { randomInt } from "node:crypto";

// Ohne leicht verwechselbare Zeichen (0/O, 1/I/L), damit man Codes vorlesen kann.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LAENGE = 8;

/** Erzeugt einen zufälligen Einladungscode, z. B. `K7MQ-2XPA`. */
export function neuerCode(): string {
  let code = "";
  for (let i = 0; i < LAENGE; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/** Vereinheitlicht eine Eingabe: Kleinbuchstaben, Leerzeichen, fehlender Bindestrich. */
export function normalisiereCode(eingabe: string): string {
  const roh = eingabe.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return roh.length === LAENGE ? `${roh.slice(0, 4)}-${roh.slice(4)}` : roh;
}
