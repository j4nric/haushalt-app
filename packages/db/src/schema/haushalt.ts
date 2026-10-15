import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { EINHEITEN } from "../einheiten";
import { KATEGORIE_IDS } from "../kategorien";
import { user } from "./auth";

/**
 * Konventionen:
 * - Tabellen, die PowerSync auf die Geräte synchronisiert, haben eine `id` vom Typ
 *   uuid, die der Client selbst erzeugen kann (offline!).
 * - Jede synchronisierte Tabelle trägt `haushalt_id`, damit Sync-Filter und
 *   Rechteprüfung beim Upload einfach bleiben.
 * - Bewusst keine Unique-Constraints auf Namen: Zwei Geräte, die offline denselben
 *   Artikel anlegen, dürfen beim Hochladen nicht dauerhaft scheitern.
 */

const erstelltAm = () =>
  timestamp("erstellt_am", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow();

export const haushalte = pgTable("haushalte", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  erstelltAm: erstelltAm(),
});

export const haushaltMitglieder = pgTable(
  "haushalt_mitglieder",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    nutzerId: text("nutzer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Kopie des Nutzernamens, damit die Geräte keine Nutzerdaten syncen müssen. */
    anzeigename: text("anzeigename").notNull(),
    rolle: text("rolle", { enum: ["besitzer", "mitglied"] }).notNull(),
    beigetretenAm: timestamp("beigetreten_am", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.haushaltId, t.nutzerId), index().on(t.nutzerId)],
);

export const einladungen = pgTable("einladungen", {
  id: uuid("id").primaryKey().defaultRandom(),
  haushaltId: uuid("haushalt_id")
    .notNull()
    .references(() => haushalte.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  erstelltVon: text("erstellt_von")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  gueltigBis: timestamp("gueltig_bis", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  angenommenVon: text("angenommen_von").references(() => user.id, {
    onDelete: "set null",
  }),
  erstelltAm: erstelltAm(),
});

export const artikel = pgTable(
  "artikel",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kategorie: text("kategorie"),
    standardeinheit: text("standardeinheit", { enum: EINHEITEN })
      .notNull()
      .default("stueck"),
    /** Wird der Bestand dieses Artikels im Vorrat geführt? */
    imVorrat: boolean("im_vorrat").notNull().default(false),
    /**
     * Aus dem Verlauf (Schnell-Hinzufügen, Vorschläge) ausgeblendet. Nicht gelöscht,
     * weil Vorrat und Buchungen am Artikel hängen; erneutes Eintragen blendet ihn ein.
     */
    archiviert: boolean("archiviert").notNull().default(false),
    /** Fällt der Bestand darunter, kommt der Artikel auf die Einkaufsliste. */
    mindestbestand: doublePrecision("mindestbestand"),
    erstelltAm: erstelltAm(),
  },
  (t) => [
    index().on(t.haushaltId),
    check(
      "artikel_mindestbestand_positiv",
      sql`${t.mindestbestand} is null or ${t.mindestbestand} > 0`,
    ),
    // Ziel des zusammengesetzten Fremdschlüssels aus listeneintraege.
    unique().on(t.id, t.haushaltId),
    check(
      "artikel_standardeinheit_gueltig",
      sql`${t.standardeinheit} in ('stueck', 'g', 'ml')`,
    ),
    // Neue Kategorien in kategorien.ts brauchen eine neue Migration (db:generate).
    // Alphabetisch, damit eine andere Anzeige-Reihenfolge keine Migration auslöst.
    check(
      "artikel_kategorie_gueltig",
      sql`${t.kategorie} is null or ${t.kategorie} in (${sql.raw(
        [...KATEGORIE_IDS]
          .sort()
          .map((k) => `'${k}'`)
          .join(", "),
      )})`,
    ),
  ],
);

export const listeneintraege = pgTable(
  "listeneintraege",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    artikelId: uuid("artikel_id").notNull(),
    menge: doublePrecision("menge"),
    einheit: text("einheit", { enum: EINHEITEN }),
    erledigt: boolean("erledigt").notNull().default(false),
    erstelltVon: text("erstellt_von").references(() => user.id, {
      onDelete: "set null",
    }),
    erledigtVon: text("erledigt_von").references(() => user.id, {
      onDelete: "set null",
    }),
    erstelltAm: erstelltAm(),
  },
  (t) => [
    index().on(t.haushaltId),
    // Artikel muss zum selben Haushalt gehören wie der Listeneintrag.
    foreignKey({
      columns: [t.artikelId, t.haushaltId],
      foreignColumns: [artikel.id, artikel.haushaltId],
    }).onDelete("cascade"),
    check(
      "listeneintraege_menge_positiv",
      sql`${t.menge} is null or ${t.menge} > 0`,
    ),
    check(
      "listeneintraege_einheit_gueltig",
      sql`${t.einheit} is null or ${t.einheit} in ('stueck', 'g', 'ml')`,
    ),
  ],
);

/**
 * Vorrat als Buchungen statt als eine Zahl pro Artikel: Der Bestand ist die Summe
 * aller Buchungen. Zwei Geräte, die offline gleichzeitig ändern, hängen nur Zeilen
 * an und überschreiben sich nie gegenseitig (eine einzelne Zahl würde „zuletzt
 * hochgeladen gewinnt“ und damit verlorene Änderungen bedeuten).
 * Buchungen werden nie geändert, höchstens gelöscht (z. B. beim Zurücknehmen
 * eines Hakens).
 */
export const vorratsbuchungen = pgTable(
  "vorratsbuchungen",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    artikelId: uuid("artikel_id").notNull(),
    /** In der Standardeinheit des Artikels; positiv = Zugang, negativ = Abgang. */
    menge: doublePrecision("menge").notNull(),
    grund: text("grund", {
      enum: ["einkauf", "verbrauch", "korrektur"],
    }).notNull(),
    /**
     * Der abgehakte Listeneintrag, aus dem ein Einkauf stammt (zum Zurücknehmen).
     * Bewusst ohne Fremdschlüssel: Hat ein anderes Gerät den Eintrag inzwischen
     * gelöscht, darf die offline erfasste Buchung beim Upload nicht scheitern.
     */
    listeneintragId: uuid("listeneintrag_id"),
    erstelltVon: text("erstellt_von").references(() => user.id, {
      onDelete: "set null",
    }),
    erstelltAm: erstelltAm(),
  },
  (t) => [
    index().on(t.haushaltId),
    index().on(t.artikelId),
    foreignKey({
      columns: [t.artikelId, t.haushaltId],
      foreignColumns: [artikel.id, artikel.haushaltId],
    }).onDelete("cascade"),
    check("vorratsbuchungen_menge_nicht_null", sql`${t.menge} <> 0`),
    check(
      "vorratsbuchungen_grund_gueltig",
      sql`${t.grund} in ('einkauf', 'verbrauch', 'korrektur')`,
    ),
  ],
);

/**
 * Kaufhistorie: eine Zeile je abgehaktem Listeneintrag, für jeden Artikel (nicht nur
 * Vorratsartikel). Daraus schätzt die App, wie oft etwas gekauft wird, und erinnert,
 * wenn es überfällig scheint. Unveränderlich wie die Buchungen; Zurücknehmen löscht.
 */
export const kaeufe = pgTable(
  "kaeufe",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    artikelId: uuid("artikel_id").notNull(),
    /** Bewusst ohne Fremdschlüssel (siehe vorratsbuchungen.listeneintragId). */
    listeneintragId: uuid("listeneintrag_id"),
    gekauftAm: timestamp("gekauft_am", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    erstelltVon: text("erstellt_von").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    index().on(t.haushaltId),
    index().on(t.artikelId),
    foreignKey({
      columns: [t.artikelId, t.haushaltId],
      foreignColumns: [artikel.id, artikel.haushaltId],
    }).onDelete("cascade"),
  ],
);
