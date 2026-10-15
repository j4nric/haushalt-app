ALTER TABLE "artikel" ADD COLUMN "packung_menge" double precision;--> statement-breakpoint
ALTER TABLE "artikel" ADD COLUMN "packung_einheit" text;--> statement-breakpoint
ALTER TABLE "artikel" ADD COLUMN "angebrochen" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "artikel" ADD CONSTRAINT "artikel_packung_vollstaendig" CHECK (("artikel"."packung_menge" is null) = ("artikel"."packung_einheit" is null) and ("artikel"."packung_menge" is null or "artikel"."packung_menge" > 0));--> statement-breakpoint
-- Vorrat zählt ab jetzt Packungen bzw. Stück. Artikel, die bisher in g/ml geführt
-- wurden, bekommen – wenn ein gescannter Barcode sie verrät – ihre Packungsgröße.
UPDATE "artikel" a SET "packung_menge" = b."packung_menge", "packung_einheit" = b."packung_einheit"
FROM (
  SELECT DISTINCT ON ("artikel_id") "artikel_id", "packung_menge", "packung_einheit"
  FROM "artikel_barcodes" WHERE "packung_menge" IS NOT NULL
  ORDER BY "artikel_id", "erstellt_am" DESC
) b
WHERE b."artikel_id" = a."id" AND a."standardeinheit" <> 'stueck' AND b."packung_einheit" = a."standardeinheit";--> statement-breakpoint
-- Bestand umrechnen: angebrochene Packung = aufgerundet und als „angebrochen“ markiert;
-- ohne bekannte Packungsgröße wird aus jedem Rest eine Packung.
CREATE TEMP TABLE "umstellung" AS
SELECT a."id", a."haushalt_id", a."packung_menge",
       COALESCE((SELECT sum(v."menge") FROM "vorratsbuchungen" v WHERE v."artikel_id" = a."id"), 0) AS "bestand"
FROM "artikel" a WHERE a."standardeinheit" <> 'stueck';--> statement-breakpoint
INSERT INTO "vorratsbuchungen" ("id", "haushalt_id", "artikel_id", "menge", "grund", "erstellt_am")
SELECT gen_random_uuid(), u."haushalt_id", u."id", z."ziel" - u."bestand", 'korrektur', now()
FROM "umstellung" u,
LATERAL (SELECT CASE
  WHEN u."bestand" <= 0 THEN 0
  WHEN u."packung_menge" IS NOT NULL THEN ceil(u."bestand" / u."packung_menge")
  ELSE 1 END AS "ziel") z
WHERE z."ziel" - u."bestand" <> 0;--> statement-breakpoint
UPDATE "artikel" a SET "angebrochen" = true FROM "umstellung" u
WHERE u."id" = a."id" AND u."bestand" > 0 AND u."packung_menge" IS NOT NULL
  AND mod(u."bestand"::numeric, u."packung_menge"::numeric) <> 0;--> statement-breakpoint
UPDATE "artikel" SET
  "mindestbestand" = CASE
    WHEN "mindestbestand" IS NULL THEN NULL
    WHEN "packung_menge" IS NOT NULL THEN greatest(1, ceil("mindestbestand" / "packung_menge"))
    ELSE 1 END,
  "standardeinheit" = 'stueck'
WHERE "standardeinheit" <> 'stueck';--> statement-breakpoint
DROP TABLE "umstellung";
