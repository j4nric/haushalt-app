ALTER TABLE "artikel" ADD COLUMN "gericht" text;--> statement-breakpoint
ALTER TABLE "artikel" ADD COLUMN "lagerort" text;--> statement-breakpoint
ALTER TABLE "artikel" ADD COLUMN "eingelagert_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "artikel" ADD COLUMN "rest_von" uuid;--> statement-breakpoint
ALTER TABLE "artikel" ADD CONSTRAINT "artikel_gericht_gueltig" CHECK ("artikel"."gericht" is null or "artikel"."gericht" in ('fertig', 'rest'));--> statement-breakpoint
ALTER TABLE "artikel" ADD CONSTRAINT "artikel_lagerort_gueltig" CHECK ("artikel"."lagerort" is null or "artikel"."lagerort" in ('kuehlschrank', 'tk'));