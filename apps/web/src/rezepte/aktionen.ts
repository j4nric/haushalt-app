import {
  type Zutat,
  type ZutatZeile,
  zeileAlsText,
  zerlegeZeile,
} from "@haushalt/db/zutaten";
import type { AbstractPowerSyncDatabase, Transaction } from "@powersync/web";
import { heute } from "@/lib/plan";
import { artikelFindenOderAnlegen, aufListeSetzen } from "../listenaktionen";
import {
  angebrochenSetzen,
  bestandVon,
  mindestbestandPruefen,
} from "../vorratsaktionen";

/**
 * Schreibende Aktionen für Rezepte – alle lokal (offline) und in einer Transaktion.
 */

export type RezeptDaten = {
  titel: string;
  portionen: number | null;
  quelle_url: string | null;
  bild_url: string | null;
  /** Ein Schritt je Zeile. */
  schritte: string;
  /** Eine Zutat je Zeile, wie eingegeben. */
  zutatenText: string;
  /** Eigener Absatz für Gewürze, Mengen optional. */
  gewuerzeText: string;
  schlagwoerter: string[];
};

/** „Schnell, vegetarisch,,“ → ["schnell", "vegetarisch"] (klein, ohne Doppelte). */
export function schlagwoerterAusText(
  text: string | null | undefined,
): string[] {
  return [
    ...new Set(
      (text ?? "")
        .split(",")
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export type GespeicherteZutat = Zutat & {
  id: string;
  position: number;
  /** 1 = steht unter „Gewürze“ (lokal ggf. noch NULL = nein). */
  gewuerz: number | null;
  /** 1 = optional, steht am Ende (lokal ggf. noch NULL = nein). */
  optional: number | null;
};

/** Optionale ans Ende, sonst die eingegebene Reihenfolge. */
export function optionaleZuletzt<
  T extends { optional: number | boolean | null },
>(zutaten: T[]): T[] {
  return [...zutaten].sort(
    (a, b) => Number(a.optional ?? 0) - Number(b.optional ?? 0),
  );
}

/** Zutaten-Textfeld → einzelne Zutaten (leere Zeilen fallen weg; „(…)“ = optional). */
export function zutatenAusText(text: string): ZutatZeile[] {
  return text
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean)
    .map(zerlegeZeile);
}

/** Gespeicherte Zutaten → Textfeld zum Bearbeiten (optionale wieder in Klammern). */
export function zutatenAlsText(
  zutaten: (Zutat & { optional: number | boolean | null })[],
): string {
  return zutaten
    .map((z) => zeileAlsText({ ...z, optional: Boolean(z.optional) }))
    .join("\n");
}

/** Legt ein Rezept an oder überschreibt es (Zutaten werden komplett ersetzt). */
export async function rezeptSpeichern(
  db: AbstractPowerSyncDatabase,
  {
    id,
    haushaltId,
    nutzerId,
    daten,
  }: {
    id: string | null;
    haushaltId: string;
    nutzerId: string;
    daten: RezeptDaten;
  },
): Promise<string> {
  const rezeptId = id ?? crypto.randomUUID();
  const schritte = daten.schritte
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
  await db.writeTransaction(async (tx) => {
    if (id) {
      await tx.execute(
        `UPDATE rezepte SET titel = ?, portionen = ?, quelle_url = ?, bild_url = ?, schritte = ?, schlagwoerter = ?
          WHERE id = ?`,
        [
          daten.titel.trim(),
          daten.portionen,
          daten.quelle_url,
          daten.bild_url,
          schritte,
          daten.schlagwoerter.join(","),
          id,
        ],
      );
      await tx.execute("DELETE FROM rezept_zutaten WHERE rezept_id = ?", [id]);
    } else {
      await tx.execute(
        `INSERT INTO rezepte (id, haushalt_id, titel, portionen, quelle_url, bild_url, schritte, schlagwoerter, favorit, erstellt_von, erstellt_am)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          rezeptId,
          haushaltId,
          daten.titel.trim(),
          daten.portionen,
          daten.quelle_url,
          daten.bild_url,
          schritte,
          daten.schlagwoerter.join(","),
          nutzerId,
          new Date().toISOString(),
        ],
      );
    }
    await zutatenEinfuegen(tx, haushaltId, rezeptId, [
      ...zutatenAusText(daten.zutatenText).map((z) => ({ ...z, gewuerz: 0 })),
      ...zutatenAusText(daten.gewuerzeText).map((z) => ({ ...z, gewuerz: 1 })),
    ]);
  });
  return rezeptId;
}

async function zutatenEinfuegen(
  tx: Transaction,
  haushaltId: string,
  rezeptId: string,
  zutaten: (Zutat & {
    gewuerz: number | null;
    optional: number | boolean | null;
  })[],
) {
  for (const [position, z] of zutaten.entries()) {
    await tx.execute(
      `INSERT INTO rezept_zutaten (id, haushalt_id, rezept_id, position, menge, einheit, name, zusatz, gewuerz, optional)
       VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        haushaltId,
        rezeptId,
        position,
        z.menge,
        z.einheit,
        z.name,
        z.zusatz,
        z.gewuerz ? 1 : 0,
        z.optional ? 1 : 0,
      ],
    );
  }
}

/** Löscht ein Rezept; gibt eine Funktion zurück, die es wiederherstellt. */
export async function rezeptLoeschen(
  db: AbstractPowerSyncDatabase,
  id: string,
): Promise<() => Promise<void>> {
  const rezept = await db.getOptional<Record<string, unknown>>(
    "SELECT * FROM rezepte WHERE id = ?",
    [id],
  );
  const zutaten = await db.getAll<GespeicherteZutat>(
    "SELECT * FROM rezept_zutaten WHERE rezept_id = ? ORDER BY position",
    [id],
  );
  // Die Kochhistorie löscht der Server mit – für Rückgängig mit sichern.
  const gekocht = await db.getAll<Record<string, unknown>>(
    "SELECT * FROM gekocht WHERE rezept_id = ?",
    [id],
  );
  await db.writeTransaction(async (tx) => {
    await tx.execute("DELETE FROM rezept_zutaten WHERE rezept_id = ?", [id]);
    await tx.execute("DELETE FROM gekocht WHERE rezept_id = ?", [id]);
    await tx.execute("DELETE FROM rezepte WHERE id = ?", [id]);
  });
  return async () => {
    if (!rezept) {
      return;
    }
    await db.writeTransaction(async (tx) => {
      const spalten = Object.keys(rezept);
      await tx.execute(
        `INSERT INTO rezepte (${spalten.join(", ")}) VALUES (${spalten.map(() => "?").join(", ")})`,
        spalten.map((s) => rezept[s]),
      );
      await zutatenEinfuegen(tx, String(rezept.haushalt_id), id, zutaten);
      for (const g of gekocht) {
        await tx.execute(
          `INSERT INTO gekocht (id, haushalt_id, rezept_id, gekocht_am, erstellt_von)
           VALUES (uuid(), ?, ?, ?, ?)`,
          [g.haushalt_id, id, g.gekocht_am, g.erstellt_von],
        );
      }
    });
  };
}

export type ListenZutat = {
  name: string;
  menge: number | null;
  einheit: "stueck" | "g" | "ml" | null;
  /** Text für die Kategorie-Erkennung neuer Artikel („Dose Tomaten“). */
  erkennenAls?: string;
};

/**
 * Setzt Zutaten auf die Einkaufsliste. Artikel werden über den Namen gefunden oder
 * neu angelegt (Kategorie wird erkannt); was schon offen auf der Liste steht, bleibt.
 * Gibt die Zahl der neuen Einträge zurück.
 */
export async function zutatenAufListe(
  db: AbstractPowerSyncDatabase,
  {
    haushaltId,
    nutzerId,
    zutaten,
  }: { haushaltId: string; nutzerId: string; zutaten: ListenZutat[] },
): Promise<number> {
  return db.writeTransaction(async (tx) => {
    let neu = 0;
    for (const z of zutaten) {
      const artikel = await artikelFindenOderAnlegen(tx, {
        haushaltId,
        name: z.name,
        ...(z.erkennenAls ? { erkennenAls: z.erkennenAls } : {}),
      });
      if (
        await aufListeSetzen(tx, {
          haushaltId,
          nutzerId,
          artikelId: artikel.id,
          menge: z.menge,
          einheit: z.einheit,
        })
      ) {
        neu++;
      }
    }
    return neu;
  });
}

export function favoritUmschalten(
  db: AbstractPowerSyncDatabase,
  id: string,
  favorit: boolean,
) {
  return db.execute("UPDATE rezepte SET favorit = ? WHERE id = ?", [
    favorit ? 1 : 0,
    id,
  ]);
}

/**
 * „Fertig gekocht“: merkt sich den Kochvorgang, bucht Verbrauchtes aus dem Vorrat
 * ab und hakt den Plan-Eintrag ab – ohne angegebenen den heutigen mit diesem Rezept.
 * Gibt zurück, zum wievielten Mal, und eine Funktion zum Zurücknehmen.
 */
export async function kochenAbschliessen(
  db: AbstractPowerSyncDatabase,
  {
    haushaltId,
    nutzerId,
    rezeptId,
    planEintragId,
    abbuchen,
  }: {
    haushaltId: string;
    nutzerId: string;
    rezeptId: string;
    planEintragId: string | null;
    /** Ganze verbrauchte Packungen und ob danach eine offen ist. */
    abbuchen: { artikelId: string; menge: number; angebrochen: boolean }[];
  },
): Promise<{ anzahl: number; zuruecknehmen: () => Promise<unknown> }> {
  const gekochtId = crypto.randomUUID();
  const buchungen: string[] = [];
  /** „angebrochen“ vor dem Kochen – fürs Zurücknehmen. */
  const vorher = new Map<string, number>();
  const jetzt = new Date();
  const anzahl = await db.writeTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO gekocht (id, haushalt_id, rezept_id, gekocht_am, erstellt_von)
       VALUES (?, ?, ?, ?, ?)`,
      [gekochtId, haushaltId, rezeptId, jetzt.toISOString(), nutzerId],
    );
    for (const { artikelId, menge, angebrochen } of abbuchen) {
      const { offen } = await tx.get<{ offen: number }>(
        "SELECT COALESCE(angebrochen, 0) AS offen FROM artikel WHERE id = ?",
        [artikelId],
      );
      vorher.set(artikelId, offen);
      if (menge > 0) {
        const id = crypto.randomUUID();
        buchungen.push(id);
        await tx.execute(
          `INSERT INTO vorratsbuchungen (id, haushalt_id, artikel_id, menge, grund, erstellt_von, erstellt_am)
           VALUES (?, ?, ?, ?, 'verbrauch', ?, ?)`,
          [id, haushaltId, artikelId, -menge, nutzerId, jetzt.toISOString()],
        );
      }
      // Ist nichts mehr da, ist auch nichts offen.
      await angebrochenSetzen(
        tx,
        artikelId,
        angebrochen && (await bestandVon(tx, artikelId)) > 0,
      );
      await mindestbestandPruefen(tx, artikelId, nutzerId);
    }
    const eintrag =
      planEintragId ??
      (
        await tx.getOptional<{ id: string }>(
          `SELECT id FROM plan_eintraege
            WHERE rezept_id = ? AND datum = ? AND COALESCE(erledigt, 0) = 0
            ORDER BY erstellt_am LIMIT 1`,
          [rezeptId, heute(jetzt)],
        )
      )?.id;
    if (eintrag) {
      await tx.execute(
        "UPDATE plan_eintraege SET erledigt = 1, gekocht_id = ? WHERE id = ?",
        [gekochtId, eintrag],
      );
    }
    const { n } = await tx.get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM gekocht WHERE rezept_id = ?",
      [rezeptId],
    );
    return n;
  });
  return {
    anzahl,
    zuruecknehmen: () =>
      db.writeTransaction(async (tx) => {
        await tx.execute("DELETE FROM gekocht WHERE id = ?", [gekochtId]);
        for (const id of buchungen) {
          await tx.execute("DELETE FROM vorratsbuchungen WHERE id = ?", [id]);
        }
        for (const [artikelId, offen] of vorher) {
          await angebrochenSetzen(tx, artikelId, Boolean(offen));
        }
        await tx.execute(
          "UPDATE plan_eintraege SET erledigt = 0, gekocht_id = NULL WHERE gekocht_id = ?",
          [gekochtId],
        );
      }),
  };
}

const FOTO_KANTE = 1600;

/**
 * Verkleinert ein Foto im Browser (längste Kante 1600 px, WebP bzw. JPEG) und lädt es
 * hoch. Gibt die Adresse zurück, unter der es abrufbar ist. Braucht Netz.
 */
export async function fotoHochladen(
  haushaltId: string,
  datei: File,
): Promise<string> {
  const bild = await createImageBitmap(datei, {
    imageOrientation: "from-image",
  });
  const faktor = Math.min(1, FOTO_KANTE / Math.max(bild.width, bild.height));
  const leinwand = document.createElement("canvas");
  leinwand.width = Math.round(bild.width * faktor);
  leinwand.height = Math.round(bild.height * faktor);
  leinwand
    .getContext("2d")
    ?.drawImage(bild, 0, 0, leinwand.width, leinwand.height);
  bild.close();
  const alsBlob = (typ: string, qualitaet: number) =>
    new Promise<Blob | null>((fertig) =>
      leinwand.toBlob(fertig, typ, qualitaet),
    );
  // Safari kann (noch) kein WebP erzeugen und liefert dann PNG – lieber JPEG.
  let blob = await alsBlob("image/webp", 0.8);
  if (blob?.type !== "image/webp") {
    blob = await alsBlob("image/jpeg", 0.85);
  }
  if (!blob) {
    throw new Error("Das Foto ließ sich nicht verarbeiten");
  }
  const antwort = await fetch(`/api/haushalte/${haushaltId}/bilder`, {
    method: "POST",
    headers: { "Content-Type": blob.type },
    body: blob,
  }).catch(() => null);
  const inhalt = await antwort?.json().catch(() => ({}));
  if (!antwort?.ok) {
    throw new Error(
      inhalt?.fehler ?? "Hochladen fehlgeschlagen – bist du online?",
    );
  }
  return (inhalt as { url: string }).url;
}
