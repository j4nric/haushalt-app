import type { AbstractPowerSyncDatabase } from "@powersync/web";

/** Schreibende Aktionen für den Wochenplan – lokal, funktionieren offline. */

export async function einplanen(
  db: AbstractPowerSyncDatabase,
  e: {
    haushaltId: string;
    nutzerId: string;
    datum: string;
    rezeptId: string | null;
    titel: string;
    portionen: number | null;
  },
) {
  const id = crypto.randomUUID();
  await db.execute(
    `INSERT INTO plan_eintraege (id, haushalt_id, datum, rezept_id, titel, portionen, erledigt, erstellt_von, erstellt_am)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [
      id,
      e.haushaltId,
      e.datum,
      e.rezeptId,
      e.titel.trim(),
      e.portionen,
      e.nutzerId,
      new Date().toISOString(),
    ],
  );
  return id;
}

/** Entfernt einen Eintrag; gibt eine Funktion zurück, die ihn wiederherstellt. */
export async function entfernen(db: AbstractPowerSyncDatabase, id: string) {
  const zeile = await db.getOptional<Record<string, unknown>>(
    "SELECT * FROM plan_eintraege WHERE id = ?",
    [id],
  );
  await db.execute("DELETE FROM plan_eintraege WHERE id = ?", [id]);
  return async () => {
    if (!zeile) {
      return;
    }
    const spalten = Object.keys(zeile);
    await db.execute(
      `INSERT INTO plan_eintraege (${spalten.join(", ")}) VALUES (${spalten.map(() => "?").join(", ")})`,
      spalten.map((s) => zeile[s]),
    );
  };
}

export function verschieben(
  db: AbstractPowerSyncDatabase,
  id: string,
  datum: string,
) {
  return db.execute("UPDATE plan_eintraege SET datum = ? WHERE id = ?", [
    datum,
    id,
  ]);
}

/** Zwei Einträge tauschen die Tage. */
export function tauschen(
  db: AbstractPowerSyncDatabase,
  a: { id: string; datum: string },
  b: { id: string; datum: string },
) {
  return db.writeTransaction(async (tx) => {
    await tx.execute("UPDATE plan_eintraege SET datum = ? WHERE id = ?", [
      b.datum,
      a.id,
    ]);
    await tx.execute("UPDATE plan_eintraege SET datum = ? WHERE id = ?", [
      a.datum,
      b.id,
    ]);
  });
}

export function portionenSetzen(
  db: AbstractPowerSyncDatabase,
  id: string,
  portionen: number,
) {
  return db.execute("UPDATE plan_eintraege SET portionen = ? WHERE id = ?", [
    portionen,
    id,
  ]);
}

/** Von Hand abhaken (z. B. „Reste“) – ohne Kochvorgang und ohne Vorrat. */
export function erledigtSetzen(
  db: AbstractPowerSyncDatabase,
  id: string,
  erledigt: boolean,
) {
  return db.execute("UPDATE plan_eintraege SET erledigt = ? WHERE id = ?", [
    erledigt ? 1 : 0,
    id,
  ]);
}
