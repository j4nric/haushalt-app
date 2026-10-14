CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp,
	"alg" text,
	"crv" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artikel" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kategorie" text,
	"standardeinheit" text DEFAULT 'stueck' NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artikel_id_haushalt_id_unique" UNIQUE("id","haushalt_id"),
	CONSTRAINT "artikel_standardeinheit_gueltig" CHECK ("artikel"."standardeinheit" in ('stueck', 'g', 'ml'))
);
--> statement-breakpoint
CREATE TABLE "einladungen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"code" text NOT NULL,
	"erstellt_von" text NOT NULL,
	"gueltig_bis" timestamp with time zone NOT NULL,
	"angenommen_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "einladungen_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "haushalt_mitglieder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"nutzer_id" text NOT NULL,
	"anzeigename" text NOT NULL,
	"rolle" text NOT NULL,
	"beigetreten_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "haushalt_mitglieder_haushalt_id_nutzer_id_unique" UNIQUE("haushalt_id","nutzer_id")
);
--> statement-breakpoint
CREATE TABLE "haushalte" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listeneintraege" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"artikel_id" uuid NOT NULL,
	"menge" double precision,
	"einheit" text,
	"erledigt" boolean DEFAULT false NOT NULL,
	"erstellt_von" text,
	"erledigt_von" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listeneintraege_menge_positiv" CHECK ("listeneintraege"."menge" is null or "listeneintraege"."menge" > 0),
	CONSTRAINT "listeneintraege_einheit_gueltig" CHECK ("listeneintraege"."einheit" is null or "listeneintraege"."einheit" in ('stueck', 'g', 'ml'))
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artikel" ADD CONSTRAINT "artikel_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "einladungen" ADD CONSTRAINT "einladungen_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "einladungen" ADD CONSTRAINT "einladungen_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "einladungen" ADD CONSTRAINT "einladungen_angenommen_von_user_id_fk" FOREIGN KEY ("angenommen_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haushalt_mitglieder" ADD CONSTRAINT "haushalt_mitglieder_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haushalt_mitglieder" ADD CONSTRAINT "haushalt_mitglieder_nutzer_id_user_id_fk" FOREIGN KEY ("nutzer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listeneintraege" ADD CONSTRAINT "listeneintraege_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listeneintraege" ADD CONSTRAINT "listeneintraege_erstellt_von_user_id_fk" FOREIGN KEY ("erstellt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listeneintraege" ADD CONSTRAINT "listeneintraege_erledigt_von_user_id_fk" FOREIGN KEY ("erledigt_von") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listeneintraege" ADD CONSTRAINT "listeneintraege_artikel_id_haushalt_id_artikel_id_haushalt_id_fk" FOREIGN KEY ("artikel_id","haushalt_id") REFERENCES "public"."artikel"("id","haushalt_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "artikel_haushalt_id_index" ON "artikel" USING btree ("haushalt_id");--> statement-breakpoint
CREATE INDEX "haushalt_mitglieder_nutzer_id_index" ON "haushalt_mitglieder" USING btree ("nutzer_id");--> statement-breakpoint
CREATE INDEX "listeneintraege_haushalt_id_index" ON "listeneintraege" USING btree ("haushalt_id");