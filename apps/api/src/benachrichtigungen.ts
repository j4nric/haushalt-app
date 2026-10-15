import { findeNachName } from "@haushalt/db/namen";
import type postgres from "postgres";
import webpush from "web-push";
import type { Ereignis } from "./upload";

/**
 * Push-Benachrichtigungen (Web Push mit VAPID, ohne fremden Dienst). Jedes Gerät wählt
 * selbst, welche Arten es bekommt. Eigene Änderungen melden sich nie bei einem selbst.
 * Viele Änderungen kurz hintereinander („5 Sachen auf die Liste“) werden gebündelt.
 */

export const ARTEN = {
  liste: { standard: true },
  einkauf: { standard: true },
  plan_heute: { standard: true },
  mitglied: { standard: true },
  rezept: { standard: true },
  plan: { standard: false },
} as const;
export type Art = keyof typeof ARTEN;
export const STANDARD_ARTEN = (Object.keys(ARTEN) as Art[]).filter(
  (a) => ARTEN[a].standard,
);
export const istArt = (a: unknown): a is Art =>
  typeof a === "string" && Object.hasOwn(ARTEN, a);

export type Nachricht = {
  titel: string;
  text: string;
  /** Wohin ein Tipp auf die Benachrichtigung führt. */
  url: string;
  /** Gleiche Kennung ersetzt die vorige Benachrichtigung statt sich zu stapeln. */
  kennung?: string;
};
export type Abo = { endpoint: string; p256dh: string; auth: string };
/** „weg“ = der Push-Dienst kennt das Abo nicht mehr (abgemeldet, App gelöscht). */
export type Sender = (abo: Abo, nachricht: Nachricht) => Promise<"ok" | "weg">;

export type Vapid = { publicKey: string; privateKey: string; subject: string };

export function webPushSender(vapid: Vapid): Sender {
  return async (abo, nachricht) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: abo.endpoint,
          keys: { p256dh: abo.p256dh, auth: abo.auth },
        },
        JSON.stringify(nachricht),
        {
          vapidDetails: vapid,
          TTL: 12 * 60 * 60,
          urgency: "normal",
          timeout: 10_000,
        },
      );
      return "ok";
    } catch (fehler) {
      const status = (fehler as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        return "weg";
      }
      throw fehler;
    }
  };
}

/**
 * Nur an die bekannten Push-Dienste der Browser senden – sonst könnte jemand den Server
 * Anfragen an beliebige Adressen schicken lassen.
 */
const PUSH_DIENSTE = [
  /\.googleapis\.com$/,
  /\.mozilla\.(com|org)$/,
  /\.push\.apple\.com$/,
  /\.notify\.windows\.com$/,
];
export function istPushAdresse(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== "string" || endpoint.length > 1000) {
    return false;
  }
  try {
    const url = new URL(endpoint);
    return (
      url.protocol === "https:" &&
      PUSH_DIENSTE.some((d) => d.test(`.${url.hostname}`))
    );
  } catch {
    return false;
  }
}

/** „Milch“, „Milch und Brot“, „Milch, Brot und 3 weitere“ */
export function aufzaehlen(namen: string[], zeigen = 2): string {
  if (namen.length <= zeigen + 1) {
    return namen.length <= 1
      ? (namen[0] ?? "")
      : `${namen.slice(0, -1).join(", ")} und ${namen.at(-1)}`;
  }
  return `${namen.slice(0, zeigen).join(", ")} und ${namen.length - zeigen} weitere`;
}

/** Datum und Uhrzeit in Berlin – der Tag im Plan ist ein Kalendertag dort. */
export function berlin(jetzt: Date): { tag: string; stunde: number } {
  const teile = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(jetzt)
      .map((t) => [t.type, t.value]),
  );
  return {
    tag: `${teile.year}-${teile.month}-${teile.day}`,
    stunde: Number(teile.hour),
  };
}

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const wochentag = (tag: string) =>
  WOCHENTAGE[new Date(`${tag}T12:00:00Z`).getUTCDay()] ?? "";

type Sammelart = "liste" | "plan" | "rezept";
type Sammlung = {
  art: Sammelart;
  haushaltId: string;
  autorId: string;
  ids: Set<string>;
  zeitgeber: ReturnType<typeof setTimeout>;
};

export class Benachrichtiger {
  private sammlungen = new Map<string, Sammlung>();
  private zuletztEinkauf = new Map<string, number>();
  private laufend = new Set<Promise<unknown>>();

  constructor(
    private sql: postgres.Sql,
    private sender: Sender,
    readonly oeffentlicherSchluessel: string,
    private optionen: {
      /** So lange sammeln, bevor „Neu auf der Liste“ rausgeht. */
      sammelMs?: number;
      /** „… kauft gerade ein“ höchstens so oft je Person und Haushalt. */
      einkaufPauseMs?: number;
      jetzt?: () => number;
    } = {},
  ) {}

  /** Änderungen aus einem Upload. Kehrt sofort zurück; gesendet wird im Hintergrund. */
  ereignisse(autorId: string, ereignisse: Ereignis[]) {
    for (const e of ereignisse) {
      if (e.art === "einkauf") {
        this.einkauf(e.haushaltId, autorId);
        continue;
      }
      const id =
        e.art === "liste"
          ? e.eintragId
          : e.art === "rezept"
            ? e.rezeptId
            : e.planId;
      this.sammeln(e.art, e.haushaltId, autorId, id);
    }
  }

  mitgliedBeigetreten(haushaltId: string, nutzerId: string) {
    this.imHintergrund(async () => {
      const kopf = await this.kopf(haushaltId, nutzerId);
      if (!kopf) {
        return;
      }
      await this.senden(haushaltId, "mitglied", nutzerId, {
        titel: `👋 ${kopf.autor} ist dabei`,
        text: `${kopf.autor} ist „${kopf.haushalt}“ beigetreten.`,
        url: this.url(haushaltId, "haushalt"),
      });
    });
  }

  /** Testnachricht an genau ein Gerät. */
  async test(nutzerId: string, endpoint: string): Promise<boolean> {
    const [abo] = await this.sql<Abo[]>`
      select endpoint, p256dh, auth from push_abos
      where endpoint = ${endpoint} and nutzer_id = ${nutzerId}
    `;
    if (!abo) {
      return false;
    }
    await this.zustellen([abo], {
      titel: "🔔 Es klappt!",
      text: "So sehen Benachrichtigungen vom Haushalt aus.",
      url: "/#haushalt",
      kennung: "test",
    });
    return true;
  }

  /**
   * „Heute im Plan“: einmal am Tag ab 16 Uhr (Berlin) für jeden Haushalt mit einem
   * noch nicht gekochten Gericht – mit dem, was dafür noch auf der Liste steht.
   */
  async planHeute(jetzt = new Date(), abStunde = 16) {
    const { tag, stunde } = berlin(jetzt);
    // Nach einem Neustart am späten Abend nichts mehr nachholen.
    if (stunde < abStunde || stunde >= 21) {
      return 0;
    }
    const gerichte = await this.sql<
      { haushalt_id: string; titel: string; rezept_id: string | null }[]
    >`
      select haushalt_id, titel, rezept_id from plan_eintraege
      where datum = ${tag} and not erledigt
      order by erstellt_am
    `;
    const nachHaushalt = new Map<string, (typeof gerichte)[number][]>();
    for (const g of gerichte) {
      nachHaushalt.set(g.haushalt_id, [
        ...(nachHaushalt.get(g.haushalt_id) ?? []),
        g,
      ]);
    }
    let gesendet = 0;
    for (const [haushaltId, heute] of nachHaushalt) {
      const [neu] = await this.sql`
        insert into push_gesendet (schluessel)
        values (${`plan_heute|${tag}|${haushaltId}`})
        on conflict do nothing returning 1
      `;
      if (!neu) {
        continue;
      }
      const rezeptIds = heute.flatMap((g) =>
        g.rezept_id ? [g.rezept_id] : [],
      );
      const zutaten =
        rezeptIds.length === 0
          ? []
          : await this.sql<{ name: string }[]>`
              select distinct name from rezept_zutaten
              where rezept_id in ${this.sql(rezeptIds)} and not gewuerz and not optional
            `;
      const offen = await this.sql<{ name: string }[]>`
        select a.name from listeneintraege l join artikel a on a.id = l.artikel_id
        where l.haushalt_id = ${haushaltId} and not l.erledigt
      `;
      const aufListe = new Map(
        offen.map((o) => [o.name.toLowerCase(), o.name]),
      );
      const fehlt = [
        ...new Set(
          zutaten.flatMap((z) => {
            const treffer = findeNachName(aufListe, z.name);
            return treffer ? [treffer] : [];
          }),
        ),
      ];
      const titel = aufzaehlen(heute.map((g) => g.titel));
      await this.senden(haushaltId, "plan_heute", null, {
        titel: `🍳 Heute gibt's ${titel}`,
        text:
          fehlt.length > 0
            ? `Noch auf der Liste: ${aufzaehlen(fehlt, 3)}`
            : "Alles da – guten Appetit!",
        url: this.url(haushaltId, "plan"),
        kennung: "plan_heute",
      });
      gesendet++;
    }
    return gesendet;
  }

  /** Prüft alle paar Minuten, ob „Heute im Plan“ fällig ist. */
  planen() {
    const laufen = () =>
      this.planHeute().catch((fehler) =>
        console.error("„Heute im Plan“ fehlgeschlagen", fehler),
      );
    setTimeout(laufen, 30_000).unref();
    setInterval(laufen, 5 * 60_000).unref();
    // Alte Einträge der Doppel-Sperre wegräumen.
    setInterval(
      () =>
        this
          .sql`delete from push_gesendet where am < now() - interval '7 days'`.catch(
          () => {},
        ),
      24 * 60 * 60_000,
    ).unref();
  }

  /** Alles Gesammelte sofort senden und warten, bis alles raus ist (Tests, Beenden). */
  async leeren() {
    for (const [schluessel, s] of this.sammlungen) {
      clearTimeout(s.zeitgeber);
      this.sammlungen.delete(schluessel);
      this.imHintergrund(() => this.sammlungSenden(s));
    }
    while (this.laufend.size > 0) {
      await Promise.allSettled([...this.laufend]);
    }
  }

  // --- intern ---------------------------------------------------------------------

  private sammeln(
    art: Sammelart,
    haushaltId: string,
    autorId: string,
    id: string,
  ) {
    const schluessel = `${art}|${haushaltId}|${autorId}`;
    const bisher = this.sammlungen.get(schluessel);
    if (bisher) {
      bisher.ids.add(id);
      return;
    }
    const s: Sammlung = {
      art,
      haushaltId,
      autorId,
      ids: new Set([id]),
      zeitgeber: setTimeout(() => {
        this.sammlungen.delete(schluessel);
        this.imHintergrund(() => this.sammlungSenden(s));
      }, this.optionen.sammelMs ?? 90_000),
    };
    s.zeitgeber.unref?.();
    this.sammlungen.set(schluessel, s);
  }

  private einkauf(haushaltId: string, autorId: string) {
    const schluessel = `${haushaltId}|${autorId}`;
    const jetzt = (this.optionen.jetzt ?? Date.now)();
    const zuletzt = this.zuletztEinkauf.get(schluessel);
    if (
      zuletzt !== undefined &&
      jetzt - zuletzt < (this.optionen.einkaufPauseMs ?? 2 * 60 * 60_000)
    ) {
      return;
    }
    this.zuletztEinkauf.set(schluessel, jetzt);
    this.imHintergrund(async () => {
      const kopf = await this.kopf(haushaltId, autorId);
      if (!kopf) {
        return;
      }
      await this.senden(haushaltId, "einkauf", autorId, {
        titel: `🏃 ${kopf.autor} kauft gerade ein`,
        text: "Fehlt noch was? Jetzt auf die Liste setzen.",
        url: this.url(haushaltId, ""),
        kennung: `einkauf-${haushaltId}`,
      });
    });
  }

  private async sammlungSenden(s: Sammlung) {
    const kopf = await this.kopf(s.haushaltId, s.autorId);
    if (!kopf) {
      return;
    }
    const ids = [...s.ids];
    if (s.art === "liste") {
      // Nur, was nicht inzwischen schon wieder abgehakt oder gelöscht ist.
      const zeilen = await this.sql<{ name: string }[]>`
        select a.name from listeneintraege l join artikel a on a.id = l.artikel_id
        where l.id in ${this.sql(ids)} and not l.erledigt
        order by l.erstellt_am
      `;
      if (zeilen.length === 0) {
        return;
      }
      await this.senden(s.haushaltId, "liste", s.autorId, {
        titel: `🛒 Neu auf der Liste`,
        text: `${kopf.autor}: ${aufzaehlen(zeilen.map((z) => z.name))}`,
        url: this.url(s.haushaltId, ""),
        kennung: `liste-${s.haushaltId}`,
      });
    } else if (s.art === "rezept") {
      const zeilen = await this.sql<{ id: string; titel: string }[]>`
        select id, titel from rezepte where id in ${this.sql(ids)} order by erstellt_am
      `;
      const [erstes] = zeilen;
      if (!erstes) {
        return;
      }
      await this.senden(s.haushaltId, "rezept", s.autorId, {
        titel: `📖 Neues Rezept von ${kopf.autor}`,
        text: aufzaehlen(zeilen.map((z) => z.titel)),
        url: this.url(
          s.haushaltId,
          zeilen.length === 1 ? `rezepte/${erstes.id}` : "rezepte",
        ),
      });
    } else {
      const zeilen = await this.sql<{ titel: string; datum: string }[]>`
        select titel, datum::text as datum from plan_eintraege
        where id in ${this.sql(ids)} order by datum
      `;
      if (zeilen.length === 0) {
        return;
      }
      await this.senden(s.haushaltId, "plan", s.autorId, {
        titel: `📅 ${kopf.autor} hat geplant`,
        text: aufzaehlen(
          zeilen.map((z) => `${z.titel} (${wochentag(z.datum)})`),
        ),
        url: this.url(s.haushaltId, "plan"),
        kennung: `plan-${s.haushaltId}`,
      });
    }
  }

  /** Name des Haushalts und Anzeigename der Person darin. */
  private async kopf(haushaltId: string, nutzerId: string) {
    const [z] = await this.sql<{ haushalt: string; autor: string }[]>`
      select h.name as haushalt, m.anzeigename as autor
      from haushalte h join haushalt_mitglieder m on m.haushalt_id = h.id
      where h.id = ${haushaltId} and m.nutzer_id = ${nutzerId}
    `;
    return z;
  }

  /** Öffnet die App im richtigen Haushalt und Bereich. */
  private url(haushaltId: string, bereich: string) {
    return `/?haushalt=${haushaltId}${bereich ? `#${bereich}` : ""}`;
  }

  /** An alle Geräte der Mitglieder, die diese Art wollen – außer dem Auslöser. */
  private async senden(
    haushaltId: string,
    art: Art,
    ausserNutzer: string | null,
    nachricht: Nachricht,
  ) {
    const abos = await this.sql<Abo[]>`
      select p.endpoint, p.p256dh, p.auth from push_abos p
      join haushalt_mitglieder m on m.nutzer_id = p.nutzer_id
      where m.haushalt_id = ${haushaltId}
        and ${art} = any(p.arten)
        and p.nutzer_id is distinct from ${ausserNutzer}
    `;
    await this.zustellen(abos, nachricht);
  }

  private async zustellen(abos: Abo[], nachricht: Nachricht) {
    const ergebnisse = await Promise.allSettled(
      abos.map((a) => this.sender(a, nachricht)),
    );
    const weg = abos.filter((_, i) => {
      const e = ergebnisse[i];
      if (e?.status === "rejected") {
        console.error("Push fehlgeschlagen", e.reason);
      }
      return e?.status === "fulfilled" && e.value === "weg";
    });
    if (weg.length > 0) {
      await this
        .sql`delete from push_abos where endpoint in ${this.sql(weg.map((a) => a.endpoint))}`;
    }
  }

  private imHintergrund(arbeit: () => Promise<unknown>) {
    const p = arbeit()
      .catch((fehler) =>
        console.error("Benachrichtigung fehlgeschlagen", fehler),
      )
      .finally(() => this.laufend.delete(p));
    this.laufend.add(p);
  }
}

/**
 * VAPID-Schlüssel aus der Umgebung. Fehlen sie, gibt es in der Entwicklung Wegwerf-
 * Schlüssel (Abos gelten dann bis zum Neustart), in Produktion keine Benachrichtigungen.
 */
export function vapidAusUmgebung(produktion: boolean): Vapid | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.org";
  if (publicKey && privateKey) {
    return { publicKey, privateKey, subject };
  }
  if (produktion) {
    console.warn(
      "VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY fehlen – keine Benachrichtigungen.",
    );
    return null;
  }
  return { ...webpush.generateVAPIDKeys(), subject };
}
