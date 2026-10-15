CREATE TABLE "push_abos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nutzer_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"arten" text[] DEFAULT '{}'::text[] NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_abos_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "push_gesendet" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "push_abos" ADD CONSTRAINT "push_abos_nutzer_id_user_id_fk" FOREIGN KEY ("nutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "push_abos_nutzer_id_index" ON "push_abos" USING btree ("nutzer_id");