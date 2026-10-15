CREATE TABLE "plan_eintraege" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"datum" date NOT NULL,
	"rezept_id" uuid,
	"titel" text NOT NULL,
	"portionen" integer,
	"erledigt" boolean DEFAULT false NOT NULL,
	"gekocht_id" uuid,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_eintraege_portionen_positiv" CHECK ("plan_eintraege"."portionen" is null or "plan_eintraege"."portionen" > 0)
);
--> statement-breakpoint
ALTER TABLE "haushalte" ADD COLUMN "standard_portionen" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_eintraege" ADD CONSTRAINT "plan_eintraege_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_eintraege" ADD CONSTRAINT "plan_eintraege_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plan_eintraege_haushalt_id_datum_index" ON "plan_eintraege" USING btree ("haushalt_id","datum");--> statement-breakpoint
ALTER TABLE "haushalte" ADD CONSTRAINT "haushalte_standard_portionen_gueltig" CHECK ("haushalte"."standard_portionen" between 1 and 50);