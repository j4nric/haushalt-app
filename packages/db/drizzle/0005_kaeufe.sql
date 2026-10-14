CREATE TABLE "kaeufe" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"artikel_id" uuid NOT NULL,
	"listeneintrag_id" uuid,
	"gekauft_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_von" text
);
--> statement-breakpoint
ALTER TABLE "kaeufe" ADD CONSTRAINT "kaeufe_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kaeufe" ADD CONSTRAINT "kaeufe_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kaeufe" ADD CONSTRAINT "kaeufe_artikel_id_haushalt_id_artikel_id_haushalt_id_fk" FOREIGN KEY ("artikel_id","haushalt_id") REFERENCES "public"."artikel"("id","haushalt_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kaeufe_haushalt_id_index" ON "kaeufe" USING btree ("haushalt_id");--> statement-breakpoint
CREATE INDEX "kaeufe_artikel_id_index" ON "kaeufe" USING btree ("artikel_id");