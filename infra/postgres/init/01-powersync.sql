-- Läuft nur beim allerersten Start (leeres Datenvolume), in der Datenbank POSTGRES_DB.

-- Eigene Datenbank, in der PowerSync seinen Sync-Zustand (Buckets) ablegt.
CREATE DATABASE powersync_storage;

-- Publikation, über die PowerSync Änderungen mitliest. "FOR ALL TABLES" erfasst
-- auch Tabellen, die später per Drizzle-Migration entstehen. Welche Daten welcher
-- Nutzer bekommt, regelt infra/powersync/sync-config.yaml.
CREATE PUBLICATION powersync FOR ALL TABLES;
