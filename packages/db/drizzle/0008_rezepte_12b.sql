CREATE TABLE "bilder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"mime" text NOT NULL,
	"daten" "bytea" NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gekocht" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"rezept_id" uuid NOT NULL,
	"gekocht_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_von" text
);
--> statement-breakpoint
ALTER TABLE "rezepte" ADD COLUMN "favorit" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "rezepte" ADD COLUMN "schlagwoerter" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "bilder" ADD CONSTRAINT "bilder_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bilder" ADD CONSTRAINT "bilder_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gekocht" ADD CONSTRAINT "gekocht_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gekocht" ADD CONSTRAINT "gekocht_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gekocht" ADD CONSTRAINT "gekocht_rezept_id_haushalt_id_rezepte_id_haushalt_id_fk" FOREIGN KEY ("rezept_id","haushalt_id") REFERENCES "public"."rezepte"("id","haushalt_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bilder_haushalt_id_index" ON "bilder" USING btree ("haushalt_id");--> statement-breakpoint
CREATE INDEX "gekocht_haushalt_id_index" ON "gekocht" USING btree ("haushalt_id");--> statement-breakpoint
CREATE INDEX "gekocht_rezept_id_index" ON "gekocht" USING btree ("rezept_id");