import type postgres from "postgres";

/**
 * Fotos aufräumen: Hochgeladene Fotos, die kein Rezept (mehr) als Bild verwendet –
 * ersetzt, entfernt oder das Rezept gelöscht. Eine Mindestfrist schützt Fotos, deren
 * Rezept noch nicht gespeichert oder noch nicht vom Gerät hochgeladen ist.
 */
export async function ungenutzteFotosLoeschen(
  sql: postgres.Sql,
  mindestAlterStunden: number,
): Promise<{ anzahl: number; bytes: number }> {
  const geloescht = await sql<{ bytes: number }[]>`
    delete from bilder b
    where b.erstellt_am < now() - make_interval(hours => ${mindestAlterStunden})
      and not exists (
        select 1 from rezepte r where r.bild_url = '/api/bilder/' || b.id::text
      )
    returning octet_length(b.daten) as bytes
  `;
  return {
    anzahl: geloescht.length,
    bytes: geloescht.reduce((s, z) => s + z.bytes, 0),
  };
}

/** Wie viele Fotos gibt es, wie viele sind ungenutzt (fürs Admin-Panel). */
export async function fotoStatistik(sql: postgres.Sql) {
  const [z] = await sql<
    { gesamt: number; ungenutzt: number; ungenutzt_bytes: number }[]
  >`
    select count(*)::int as gesamt,
           count(*) filter (where not genutzt)::int as ungenutzt,
           coalesce(sum(octet_length(daten)) filter (where not genutzt), 0)::int as ungenutzt_bytes
    from (
      select b.daten, exists (
        select 1 from rezepte r where r.bild_url = '/api/bilder/' || b.id::text
      ) as genutzt
      from bilder b
    ) f
  `;
  return z ?? { gesamt: 0, ungenutzt: 0, ungenutzt_bytes: 0 };
}

const TAG_MS = 24 * 60 * 60 * 1000;

/** Kurz nach dem Start und dann täglich: Fotos älter als 24 h ohne Rezept löschen. */
export function aufraeumenPlanen(sql: postgres.Sql) {
  const laufen = () =>
    ungenutzteFotosLoeschen(sql, 24)
      .then(({ anzahl, bytes }) => {
        if (anzahl > 0) {
          console.log(
            `Aufgeräumt: ${anzahl} ungenutzte Fotos (${Math.round(bytes / 1024)} KB)`,
          );
        }
      })
      .catch((fehler) => console.error("Aufräumen fehlgeschlagen", fehler));
  setTimeout(laufen, 60_000).unref();
  setInterval(laufen, TAG_MS).unref();
}
