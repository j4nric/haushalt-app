/** Gemeinsame Abfragen und Typen für Rezepte, Plan und Einkauf. */

export type Rezept = {
  id: string;
  titel: string;
  portionen: number | null;
  quelle_url: string | null;
  bild_url: string | null;
  schritte: string;
  favorit: number | null;
  schlagwoerter: string | null;
  gekocht_anzahl: number;
  zuletzt_gekocht: string | null;
};

/** Vorratsstand aller Artikel des Haushalts (für „kochbar“ und „Auf die Liste“). */
export const ARTIKEL_STAND = `SELECT a.id, lower(a.name) AS name, COALESCE(a.im_vorrat, 0) AS im_vorrat,
       COALESCE(a.angebrochen, 0) AS angebrochen, a.packung_menge, a.packung_einheit,
       COALESCE((SELECT SUM(b.menge) FROM vorratsbuchungen b WHERE b.artikel_id = a.id), 0) AS bestand,
       EXISTS (SELECT 1 FROM listeneintraege l WHERE l.artikel_id = a.id AND l.erledigt = 0) AS auf_liste
  FROM artikel a WHERE a.haushalt_id = ?`;
