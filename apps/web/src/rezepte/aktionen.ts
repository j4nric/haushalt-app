import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { standardmaessigImVorrat } from "@haushalt/db/vorrat";
import { type Zutat, zerlegeZutat, zutatAlsText } from "@haushalt/db/zutaten";
import type { AbstractPowerSyncDatabase, Transaction } from "@powersync/web";
import { ersterBuchstabeGross } from "@/lib/farben";

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
};

/** Zutaten-Textfeld → einzelne Zutaten (leere Zeilen fallen weg). */
export function zutatenAusText(text: string): Zutat[] {
  return text
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean)
    .map(zerlegeZutat);
}

/** Gespeicherte Zutaten → Textfeld zum Bearbeiten. */
export function zutatenAlsText(zutaten: Zutat[]): string {
  return zutaten
    .map((z) => zutatAlsText(z) + (z.zusatz ? `, ${z.zusatz}` : ""))
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
  zutaten: (Zutat & { gewuerz: number | null })[],
) {
  for (const [position, z] of zutaten.entries()) {
    await tx.execute(
      `INSERT INTO rezept_zutaten (id, haushalt_id, rezept_id, position, menge, einheit, name, zusatz, gewuerz)
       VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        haushaltId,
        rezeptId,
        position,
        z.menge,
        z.einheit,
        z.name,
        z.zusatz,
        z.gewuerz ? 1 : 0,
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
  const jetzt = new Date().toISOString();
  return db.writeTransaction(async (tx) => {
    let neu = 0;
    for (const z of zutaten) {
      const name = ersterBuchstabeGross(z.name.trim());
      const vorhanden = await tx.getOptional<{ id: string }>(
        "SELECT id FROM artikel WHERE haushalt_id = ? AND lower(name) = lower(?)",
        [haushaltId, name],
      );
      let artikelId = vorhanden?.id;
      if (!artikelId) {
        artikelId = crypto.randomUUID();
        const kategorie = erkenneKategorie(name)[0] ?? null;
        await tx.execute(
          `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, im_vorrat, archiviert, erstellt_am)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
          [
            artikelId,
            haushaltId,
            name,
            kategorie,
            z.einheit ?? "stueck",
            standardmaessigImVorrat(kategorie) ? 1 : 0,
            jetzt,
          ],
        );
      }
      await tx.execute(
        "UPDATE artikel SET archiviert = 0 WHERE id = ? AND archiviert = 1",
        [artikelId],
      );
      const offen = await tx.getOptional(
        "SELECT 1 FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0",
        [artikelId],
      );
      if (offen) {
        continue;
      }
      await tx.execute(
        `INSERT INTO listeneintraege (id, haushalt_id, artikel_id, menge, einheit, erledigt, erstellt_von, erstellt_am)
         VALUES (uuid(), ?, ?, ?, ?, 0, ?, ?)`,
        [haushaltId, artikelId, z.menge, z.einheit, nutzerId, jetzt],
      );
      neu++;
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
 * „Fertig gekocht“: merkt sich den Kochvorgang. Gibt zurück, zum wievielten Mal und
 * eine Funktion zum Zurücknehmen.
 */
export async function gekochtMerken(
  db: AbstractPowerSyncDatabase,
  {
    haushaltId,
    nutzerId,
    rezeptId,
  }: { haushaltId: string; nutzerId: string; rezeptId: string },
): Promise<{ anzahl: number; zuruecknehmen: () => Promise<unknown> }> {
  const id = crypto.randomUUID();
  const anzahl = await db.writeTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO gekocht (id, haushalt_id, rezept_id, gekocht_am, erstellt_von)
       VALUES (?, ?, ?, ?, ?)`,
      [id, haushaltId, rezeptId, new Date().toISOString(), nutzerId],
    );
    const { n } = await tx.get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM gekocht WHERE rezept_id = ?",
      [rezeptId],
    );
    return n;
  });
  return {
    anzahl,
    zuruecknehmen: () => db.execute("DELETE FROM gekocht WHERE id = ?", [id]),
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
