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
    erstelltAm: erstelltAm(),
  },
  (t) => [
    index().on(t.haushaltId),
    // Ziel des zusammengesetzten Fremdschlüssels aus listeneintraege.
    unique().on(t.id, t.haushaltId),
    check(
      "artikel_standardeinheit_gueltig",
      sql`${t.standardeinheit} in ('stueck', 'g', 'ml')`,
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
