CREATE TABLE "rezept_zutaten" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"rezept_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"menge" double precision,
	"einheit" text,
	"name" text NOT NULL,
	"zusatz" text,
	CONSTRAINT "rezept_zutaten_menge_positiv" CHECK ("rezept_zutaten"."menge" is null or "rezept_zutaten"."menge" > 0)
);
--> statement-breakpoint
CREATE TABLE "rezepte" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"titel" text NOT NULL,
	"portionen" integer,
	"quelle_url" text,
	"bild_url" text,
	"schritte" text DEFAULT '' NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rezepte_id_haushalt_id_unique" UNIQUE("id","haushalt_id"),
	CONSTRAINT "rezepte_portionen_positiv" CHECK ("rezepte"."portionen" is null or "rezepte"."portionen" > 0)
);
--> statement-breakpoint
ALTER TABLE "rezept_zutaten" ADD CONSTRAINT "rezept_zutaten_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezept_zutaten" ADD CONSTRAINT "rezept_zutaten_rezept_id_haushalt_id_rezepte_id_haushalt_id_fk" FOREIGN KEY ("rezept_id","haushalt_id") REFERENCES "public"."rezepte"("id","haushalt_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezepte" ADD CONSTRAINT "rezepte_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rezepte" ADD CONSTRAINT "rezepte_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rezept_zutaten_haushalt_id_index" ON "rezept_zutaten" USING btree ("haushalt_id");--> statement-breakpoint
CREATE INDEX "rezept_zutaten_rezept_id_index" ON "rezept_zutaten" USING btree ("rezept_id");--> statement-breakpoint
CREATE INDEX "rezepte_haushalt_id_index" ON "rezepte" USING btree ("haushalt_id");