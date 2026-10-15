CREATE TABLE "bon_artikel" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"artikel_id" uuid NOT NULL,
	"text" text NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kassenbons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"schluessel" text NOT NULL,
	"positionen" integer NOT NULL,
	"erstellt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bon_artikel" ADD CONSTRAINT "bon_artikel_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bon_artikel" ADD CONSTRAINT "bon_artikel_artikel_id_haushalt_id_artikel_id_haushalt_id_fk" FOREIGN KEY ("artikel_id","haushalt_id") REFERENCES "public"."artikel"("id","haushalt_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kassenbons" ADD CONSTRAINT "kassenbons_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kassenbons" ADD CONSTRAINT "kassenbons_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bon_artikel_haushalt_id_text_index" ON "bon_artikel" USING btree ("haushalt_id","text");--> statement-breakpoint
CREATE INDEX "kassenbons_haushalt_id_schluessel_index" ON "kassenbons" USING btree ("haushalt_id","schluessel");