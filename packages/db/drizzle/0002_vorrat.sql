CREATE TABLE "vorratsbuchungen" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"artikel_id" uuid NOT NULL,
	"menge" double precision NOT NULL,
	"grund" text NOT NULL,
	"listeneintrag_id" uuid,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vorratsbuchungen_menge_nicht_null" CHECK ("vorratsbuchungen"."menge" <> 0),
	CONSTRAINT "vorratsbuchungen_grund_gueltig" CHECK ("vorratsbuchungen"."grund" in ('einkauf', 'verbrauch', 'korrektur'))
);
--> statement-breakpoint
ALTER TABLE "artikel" ADD COLUMN "im_vorrat" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "artikel" ADD COLUMN "mindestbestand" double precision;--> statement-breakpoint
ALTER TABLE "vorratsbuchungen" ADD CONSTRAINT "vorratsbuchungen_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vorratsbuchungen" ADD CONSTRAINT "vorratsbuchungen_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vorratsbuchungen" ADD CONSTRAINT "vorratsbuchungen_artikel_id_haushalt_id_artikel_id_haushalt_id_fk" FOREIGN KEY ("artikel_id","haushalt_id") REFERENCES "public"."artikel"("id","haushalt_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vorratsbuchungen_haushalt_id_index" ON "vorratsbuchungen" USING btree ("haushalt_id");--> statement-breakpoint
CREATE INDEX "vorratsbuchungen_artikel_id_index" ON "vorratsbuchungen" USING btree ("artikel_id");--> statement-breakpoint
ALTER TABLE "artikel" ADD CONSTRAINT "artikel_mindestbestand_positiv" CHECK ("artikel"."mindestbestand" is null or "artikel"."mindestbestand" > 0);