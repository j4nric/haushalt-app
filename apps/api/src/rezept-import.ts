import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Rezept-Import per Link: Die Seite wird vom Server geholt (Browser dürften das wegen
 * CORS nicht) und die strukturierten Rezeptdaten (schema.org/Recipe als JSON-LD)
 * ausgelesen – die liefern fast alle Rezeptseiten für Suchmaschinen mit.
 * Das Ergebnis geht roh an die App; Zutaten zerlegt die App selbst.
 */

export type RezeptImport = {
  titel: string;
  portionen: number | null;
  bild_url: string | null;
  quelle_url: string;
  zutaten: string[];
  schritte: string[];
};

/** Seite nicht abrufbar oder nicht erlaubt (HTTP 502 bzw. 400). */
export class ImportFehler extends Error {
  constructor(
    message: string,
    readonly status: 400 | 422 | 502,
  ) {
    super(message);
  }
}

const HOECHSTENS_BYTES = 5 * 1024 * 1024;
const HOECHSTENS_WEITERLEITUNGEN = 5;

// --- Abrufen ------------------------------------------------------------------------

/** Private, lokale und reservierte Adressen – dorthin darf der Server nicht greifen. */
export function istInterneAdresse(adresse: string): boolean {
  const v4 = adresse.startsWith("::ffff:") ? adresse.slice(7) : adresse;
  if (isIP(v4) === 4) {
    const [a = 0, b = 0] = v4.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const v6 = adresse.toLowerCase();
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe8") ||
    v6.startsWith("fe9") ||
    v6.startsWith("fea") ||
    v6.startsWith("feb")
  );
}

async function pruefeZiel(url: URL, lokalErlaubt: boolean) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ImportFehler("Nur http- und https-Links", 400);
  }
  if (lokalErlaubt) {
    return;
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const adressen = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true }).catch(() => {
        throw new ImportFehler("Adresse nicht gefunden", 502);
      });
  if (adressen.some((a) => istInterneAdresse(a.address))) {
    throw new ImportFehler("Diese Adresse ist nicht erlaubt", 400);
  }
}

/** Holt eine Seite: nur öffentliche Adressen, mit Zeit- und Größenlimit. */
export async function seiteHolen(
  adresse: string,
  { lokalErlaubt = false }: { lokalErlaubt?: boolean } = {},
): Promise<{ html: string; url: string }> {
  let url: URL;
  try {
    url = new URL(adresse);
  } catch {
    throw new ImportFehler("Das ist kein gültiger Link", 400);
  }
  for (let i = 0; i <= HOECHSTENS_WEITERLEITUNGEN; i++) {
    await pruefeZiel(url, lokalErlaubt);
    const antwort = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 (compatible; Haushalt-App Rezeptimport)",
      },
    }).catch((fehler: unknown) => {
      throw nichtErreichbar(url, fehler);
    });
    const weiter = antwort.headers.get("location");
    if (antwort.status >= 300 && antwort.status < 400 && weiter) {
      url = new URL(weiter, url);
      continue;
    }
    if (!antwort.ok || !antwort.body) {
      throw new ImportFehler(
        `Die Seite antwortet mit Fehler ${antwort.status}`,
        502,
      );
    }
    return { html: await lesenBegrenzt(antwort.body), url: url.toString() };
  }
  throw new ImportFehler("Zu viele Weiterleitungen", 502);
}

/**
 * Warum der Abruf scheiterte – im Protokoll mit Ursache (DNS, abgelehnt, Zeit),
 * in der App kurz und verständlich.
 */
function nichtErreichbar(url: URL, fehler: unknown): ImportFehler {
  const e = fehler as {
    name?: string;
    cause?: { code?: string; message?: string };
  };
  const ursache =
    e?.cause?.code ?? e?.cause?.message ?? e?.name ?? String(fehler);
  console.warn(`Rezept-Import: ${url.host} nicht erreichbar (${ursache})`);
  if (e?.name === "TimeoutError" || ursache === "UND_ERR_CONNECT_TIMEOUT") {
    return new ImportFehler(
      `${url.host} antwortet nicht – die Seite lässt den Abruf vom Server vielleicht nicht zu`,
      502,
    );
  }
  return new ImportFehler(`${url.host} ist nicht erreichbar (${ursache})`, 502);
}

async function lesenBegrenzt(body: ReadableStream<Uint8Array>) {
  const teile: Uint8Array[] = [];
  let groesse = 0;
  for await (const teil of body) {
    groesse += teil.byteLength;
    if (groesse > HOECHSTENS_BYTES) {
      throw new ImportFehler("Die Seite ist zu groß", 502);
    }
    teile.push(teil);
  }
  return new TextDecoder().decode(Buffer.concat(teile));
}

// --- Auslesen -----------------------------------------------------------------------

const ENTITAETEN: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
  deg: "°",
  ndash: "–",
};

/** HTML-Tags und -Entitäten aus Texten entfernen (JSON-LD enthält oft beides). */
function reinerText(roh: string): string {
  return roh
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (ganz, code: string) => {
      if (code[0] === "#") {
        const zahl =
          code[1]?.toLowerCase() === "x"
            ? Number.parseInt(code.slice(2), 16)
            : Number(code.slice(1));
        return Number.isFinite(zahl) ? String.fromCodePoint(zahl) : ganz;
      }
      return ENTITAETEN[code] ?? ganz;
    })
    .replace(/[ \t]+/g, " ")
    .trim();
}

function istRezept(wert: unknown): wert is Record<string, unknown> {
  if (!wert || typeof wert !== "object") {
    return false;
  }
  const typ = (wert as Record<string, unknown>)["@type"];
  return Array.isArray(typ) ? typ.includes("Recipe") : typ === "Recipe";
}

/** Sucht das Rezept in beliebig verschachteltem JSON-LD (@graph, Listen …). */
function findeRezept(wert: unknown, tiefe = 0): Record<string, unknown> | null {
  if (tiefe > 6 || !wert || typeof wert !== "object") {
    return null;
  }
  if (istRezept(wert)) {
    return wert;
  }
  const kinder = Array.isArray(wert) ? wert : Object.values(wert);
  for (const kind of kinder) {
    const treffer = findeRezept(kind, tiefe + 1);
    if (treffer) {
      return treffer;
    }
  }
  return null;
}

function texte(wert: unknown): string[] {
  if (typeof wert === "string") {
    return reinerText(wert)
      .split(/\n+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (Array.isArray(wert)) {
    return wert.flatMap(texte);
  }
  if (wert && typeof wert === "object") {
    const o = wert as Record<string, unknown>;
    // HowToSection: Abschnitt mit eigenen Schritten; HowToStep: { text }.
    if (o.itemListElement) {
      return texte(o.itemListElement);
    }
    return texte(o.text ?? o.name ?? "");
  }
  return [];
}

/** Alle Objekte mit `@id` – Seiten wie Chefkoch verweisen auf Bild und Autor nur per Id. */
function idVerzeichnis(
  wert: unknown,
  ziel = new Map<string, Record<string, unknown>>(),
  tiefe = 0,
) {
  if (tiefe > 6 || !wert || typeof wert !== "object") {
    return ziel;
  }
  const o = wert as Record<string, unknown>;
  if (
    !Array.isArray(wert) &&
    typeof o["@id"] === "string" &&
    Object.keys(o).length > 1
  ) {
    ziel.set(o["@id"], o);
  }
  for (const kind of Array.isArray(wert) ? wert : Object.values(o)) {
    idVerzeichnis(kind, ziel, tiefe + 1);
  }
  return ziel;
}

/** `{ "@id": … }` durch das gemeinte Objekt ersetzen. */
function aufloesen(
  wert: unknown,
  ids: Map<string, Record<string, unknown>>,
): unknown {
  if (Array.isArray(wert)) {
    return wert.map((w) => aufloesen(w, ids));
  }
  if (wert && typeof wert === "object") {
    const id = (wert as Record<string, unknown>)["@id"];
    if (typeof id === "string" && Object.keys(wert).length === 1) {
      return ids.get(id) ?? wert;
    }
  }
  return wert;
}

/** „Eier in Senfsauce von manuela-one“ → „Eier in Senfsauce“ (Autor steht im Titel). */
function ohneAutor(titel: string, autor: unknown): string {
  const namen = (Array.isArray(autor) ? autor : [autor])
    .map((a) =>
      typeof a === "string"
        ? a
        : a && typeof a === "object"
          ? (a as Record<string, unknown>).name
          : null,
    )
    .filter((n): n is string => typeof n === "string" && n.trim() !== "");
  for (const name of namen) {
    const endung = ` von ${name.trim()}`;
    if (
      titel.toLowerCase().endsWith(endung.toLowerCase()) &&
      titel.length > endung.length
    ) {
      return titel.slice(0, -endung.length).trim();
    }
  }
  return titel;
}

function bild(wert: unknown, basis: string): string | null {
  const roh = Array.isArray(wert) ? wert[0] : wert;
  const o =
    roh && typeof roh === "object" ? (roh as Record<string, unknown>) : null;
  const adresse =
    typeof roh === "string" ? roh : (o?.url ?? o?.contentUrl ?? null);
  if (typeof adresse !== "string") {
    return null;
  }
  try {
    const url = new URL(adresse, basis);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function portionen(wert: unknown): number | null {
  const roh = Array.isArray(wert) ? wert[0] : wert;
  const zahl =
    typeof roh === "number" ? roh : Number(String(roh ?? "").match(/\d+/)?.[0]);
  return Number.isInteger(zahl) && zahl > 0 && zahl < 1000 ? zahl : null;
}

/** Tracking-Zusätze („?utm_source=…“ beim Teilen) gehören nicht in die Quelle. */
export function ohneTracking(adresse: string): string {
  try {
    const url = new URL(adresse);
    for (const name of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_[ce]id$|igshid$|si$)/i.test(name)) {
        url.searchParams.delete(name);
      }
    }
    return url.toString();
  } catch {
    return adresse;
  }
}

/** Vorschaubild für soziale Netze – Ersatz, wenn das Rezept selbst keins nennt. */
function ogBild(html: string, basis: string): string | null {
  const treffer =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    );
  return treffer?.[1] ? bild(reinerText(treffer[1]), basis) : null;
}

/** Liest das Rezept aus einer HTML-Seite; `null`, wenn keins drinsteht. */
export function rezeptAusHtml(html: string, url: string): RezeptImport | null {
  const bloecke = html.matchAll(
    /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const [, inhalt] of bloecke) {
    let daten: unknown;
    try {
      daten = JSON.parse(inhalt ?? "");
    } catch {
      continue;
    }
    const r = findeRezept(daten);
    const roherTitel =
      r && typeof r.name === "string" ? reinerText(r.name) : "";
    if (!r || !roherTitel) {
      continue;
    }
    const ids = idVerzeichnis(daten);
    const titel = ohneAutor(roherTitel, aufloesen(r.author, ids));
    return {
      titel,
      portionen: portionen(r.recipeYield),
      bild_url: bild(aufloesen(r.image, ids), url) ?? ogBild(html, url),
      quelle_url: ohneTracking(url),
      zutaten: texte(r.recipeIngredient ?? r.ingredients),
      schritte: texte(r.recipeInstructions),
    };
  }
  return null;
}
