CREATE TABLE "artikel_barcodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"haushalt_id" uuid NOT NULL,
	"artikel_id" uuid NOT NULL,
	"barcode" text NOT NULL,
	"packung_menge" double precision,
	"packung_einheit" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artikel_barcodes_format" CHECK ("artikel_barcodes"."barcode" ~ '^[0-9]{8,14}$')
);
--> statement-breakpoint
CREATE TABLE "produkte" (
	"barcode" text PRIMARY KEY NOT NULL,
	"gefunden" boolean NOT NULL,
	"name" text,
	"marke" text,
	"menge" text,
	"bild_url" text,
	"abgerufen_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artikel_barcodes" ADD CONSTRAINT "artikel_barcodes_haushalt_id_haushalte_id_fk" FOREIGN KEY ("haushalt_id") REFERENCES "public"."haushalte"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artikel_barcodes" ADD CONSTRAINT "artikel_barcodes_artikel_id_haushalt_id_artikel_id_haushalt_id_fk" FOREIGN KEY ("artikel_id","haushalt_id") REFERENCES "public"."artikel"("id","haushalt_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artikel_barcodes_haushalt_id_barcode_index" ON "artikel_barcodes" USING btree ("haushalt_id","barcode");