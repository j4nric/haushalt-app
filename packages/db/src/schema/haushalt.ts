import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  date,
  doublePrecision,
  foreignKey,
  index,
  integer,
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

export const haushalte = pgTable(
  "haushalte",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    /** Für so viele Personen wird im Wochenplan standardmäßig gekocht. */
    standardPortionen: integer("standard_portionen").notNull().default(2),
    erstelltAm: erstelltAm(),
  },
  (t) => [
    check(
      "haushalte_standard_portionen_gueltig",
      sql`${t.standardPortionen} between 1 and 50`,
    ),
  ],
);

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
    /**
     * Inhalt einer Packung („500 g“), optional. Der Vorrat zählt Packungen; damit
     * rechnen Rezepte Gramm und Milliliter in Packungen um.
     */
    packungMenge: doublePrecision("packung_menge"),
    packungEinheit: text("packung_einheit", { enum: EINHEITEN }),
    /** Eine der Packungen im Vorrat ist offen (nur markiert, nicht gezählt). */
    angebrochen: boolean("angebrochen").notNull().default(false),
    erstelltAm: erstelltAm(),
  },
  (t) => [
    index().on(t.haushaltId),
    check(
      "artikel_packung_vollstaendig",
      sql`(${t.packungMenge} is null) = (${t.packungEinheit} is null) and (${t.packungMenge} is null or ${t.packungMenge} > 0)`,
    ),
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

/**
 * Rezepte des Haushalts. Schritte als Text, ein Schritt je Zeile. Das Bild ist eine
 * Adresse (z. B. vom Import); eigene Fotos kommen später.
 */
export const rezepte = pgTable(
  "rezepte",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    titel: text("titel").notNull(),
    /** Für wie viele Portionen die Mengen gelten (Grundlage fürs Umrechnen). */
    portionen: integer("portionen"),
    quelleUrl: text("quelle_url"),
    bildUrl: text("bild_url"),
    schritte: text("schritte").notNull().default(""),
    /** Favorit des Haushalts (ein Stern für alle). */
    favorit: boolean("favorit").notNull().default(false),
    /** Freie Schlagwörter, kommagetrennt („schnell,vegetarisch“). */
    schlagwoerter: text("schlagwoerter").notNull().default(""),
    erstelltVon: text("erstellt_von").references(() => user.id, {
      onDelete: "set null",
    }),
    erstelltAm: erstelltAm(),
  },
  (t) => [
    index().on(t.haushaltId),
    unique().on(t.id, t.haushaltId),
    check(
      "rezepte_portionen_positiv",
      sql`${t.portionen} is null or ${t.portionen} > 0`,
    ),
  ],
);

/**
 * Zutaten eines Rezepts, strukturiert (Menge, Einheit, Name, Zusatz), damit sie sich
 * umrechnen und über den Namen mit Artikeln, Liste und Vorrat abgleichen lassen.
 * Die Einheit ist frei („EL“, „Dose“, …) – nicht nur die Artikel-Einheiten.
 */
export const rezeptZutaten = pgTable(
  "rezept_zutaten",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    rezeptId: uuid("rezept_id").notNull(),
    position: integer("position").notNull(),
    menge: doublePrecision("menge"),
    einheit: text("einheit"),
    name: text("name").notNull(),
    /** Z. B. „fein gehackt“ oder „(400 g)“ – wird angezeigt, aber nicht abgeglichen. */
    zusatz: text("zusatz"),
    /** Steht im eigenen Absatz „Gewürze“ (Mengen dort optional). */
    gewuerz: boolean("gewuerz").notNull().default(false),
    /** Optional („(100 g Salami)“): steht am Ende, kommt nicht von selbst auf die Liste. */
    optional: boolean("optional").notNull().default(false),
  },
  (t) => [
    index().on(t.haushaltId),
    index().on(t.rezeptId),
    foreignKey({
      columns: [t.rezeptId, t.haushaltId],
      foreignColumns: [rezepte.id, rezepte.haushaltId],
    }).onDelete("cascade"),
    check(
      "rezept_zutaten_menge_positiv",
      sql`${t.menge} is null or ${t.menge} > 0`,
    ),
  ],
);

/**
 * Kochhistorie: eine Zeile je „Fertig gekocht“. Grundlage für „zuletzt gekocht“ und
 * die Kochstatistik. Unveränderlich; Zurücknehmen löscht.
 */
export const gekocht = pgTable(
  "gekocht",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    rezeptId: uuid("rezept_id").notNull(),
    gekochtAm: timestamp("gekocht_am", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    erstelltVon: text("erstellt_von").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    index().on(t.haushaltId),
    index().on(t.rezeptId),
    foreignKey({
      columns: [t.rezeptId, t.haushaltId],
      foreignColumns: [rezepte.id, rezepte.haushaltId],
    }).onDelete("cascade"),
  ],
);

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

/**
 * Eigene Fotos (Rezepte). Bewusst in der Datenbank statt als Dateien: Die App
 * verkleinert sie vor dem Hochladen (wenige hundert KB), und so sind sie ohne
 * Zusatzaufwand in den Backups. Wird nicht synchronisiert – Geräte laden die Bilder
 * über /api/bilder/<id> und der Service Worker speichert sie zwischen.
 */
export const bilder = pgTable(
  "bilder",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    mime: text("mime").notNull(),
    daten: bytea("daten").notNull(),
    erstelltVon: text("erstellt_von").references(() => user.id, {
      onDelete: "set null",
    }),
    erstelltAm: erstelltAm(),
  },
  (t) => [index().on(t.haushaltId)],
);

/**
 * Wochenplan: ein Eintrag je geplantem Abendessen. Entweder ein Rezept (der Titel
 * wird mitgeschrieben, falls das Rezept später gelöscht wird) oder freier Text
 * („Reste“, „Pizza bestellen“). Bewusst ohne Fremdschlüssel aufs Rezept und ohne
 * „ein Eintrag pro Tag“-Regel: Offline geplante Einträge dürfen beim Hochladen nicht
 * scheitern; zwei am selben Tag zeigt die App einfach beide.
 */
export const planEintraege = pgTable(
  "plan_eintraege",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    datum: date("datum", { mode: "string" }).notNull(),
    rezeptId: uuid("rezept_id"),
    titel: text("titel").notNull(),
    portionen: integer("portionen"),
    erledigt: boolean("erledigt").notNull().default(false),
    /** Der Kochvorgang, mit dem der Eintrag abgehakt wurde (zum Zurücknehmen). */
    gekochtId: uuid("gekocht_id"),
    erstelltVon: text("erstellt_von").references(() => user.id, {
      onDelete: "set null",
    }),
    erstelltAm: erstelltAm(),
  },
  (t) => [
    index().on(t.haushaltId, t.datum),
    check(
      "plan_eintraege_portionen_positiv",
      sql`${t.portionen} is null or ${t.portionen} > 0`,
    ),
  ],
);

/**
 * Gescannte Barcodes (EAN/UPC) → Artikel des Haushalts. Ein Artikel kann mehrere
 * haben („Milch“ von verschiedenen Marken). Synchronisiert, damit einmal Gescanntes
 * auch offline erkannt wird. Bewusst ohne Unique-Regel (offline von zwei Geräten
 * gleichzeitig verknüpft darf nicht scheitern); die App nimmt den neuesten Eintrag.
 */
export const artikelBarcodes = pgTable(
  "artikel_barcodes",
  {
    id: uuid("id").primaryKey(),
    haushaltId: uuid("haushalt_id")
      .notNull()
      .references(() => haushalte.id, { onDelete: "cascade" }),
    artikelId: uuid("artikel_id").notNull(),
    barcode: text("barcode").notNull(),
    /** Packungsgröße laut Produktdaten („500 g“) – bucht später gleich die richtige Menge. */
    packungMenge: doublePrecision("packung_menge"),
    packungEinheit: text("packung_einheit", { enum: EINHEITEN }),
    erstelltAm: erstelltAm(),
  },
  (t) => [
    index().on(t.haushaltId, t.barcode),
    foreignKey({
      columns: [t.artikelId, t.haushaltId],
      foreignColumns: [artikel.id, artikel.haushaltId],
    }).onDelete("cascade"),
    check("artikel_barcodes_format", sql`${t.barcode} ~ '^[0-9]{8,14}$'`),
  ],
);

/**
 * Zwischenspeicher für Produktdaten aus Open Food Facts (für alle Haushalte gleich,
 * nicht synchronisiert). Auch „nicht gefunden“ wird gemerkt, damit derselbe Code
 * nicht ständig neu angefragt wird.
 */
export const produkte = pgTable("produkte", {
  barcode: text("barcode").primaryKey(),
  gefunden: boolean("gefunden").notNull(),
  name: text("name"),
  marke: text("marke"),
  menge: text("menge"),
  bildUrl: text("bild_url"),
  abgerufenAm: timestamp("abgerufen_am", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

/**
 * Push-Abos: ein Eintrag je Gerät (Browser), das Benachrichtigungen bekommen will.
 * `arten` = welche Benachrichtigungen dieses Gerät möchte. Nicht synchronisiert –
 * nur der Server braucht das.
 */
export const pushAbos = pgTable(
  "push_abos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nutzerId: text("nutzer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    arten: text("arten").array().notNull().default(sql`'{}'::text[]`),
    erstelltAm: erstelltAm(),
  },
  (t) => [index().on(t.nutzerId)],
);

/** Schon verschickte Tagesmeldungen (z. B. „Heute im Plan“), damit nichts doppelt kommt. */
export const pushGesendet = pgTable("push_gesendet", {
  schluessel: text("schluessel").primaryKey(),
  am: timestamp("am", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});
