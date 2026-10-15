import { randomUUID } from "node:crypto";
import { erstelleDb } from "@haushalt/db";
import { erstelleApp } from "../src/app";
import { erstelleAuth } from "../src/auth";
import { Benachrichtiger, type Sender } from "../src/benachrichtigungen";
import { testDatenbankUrl } from "./umgebung";

const WEB_URL = "http://localhost:5173";
/** Dieses Konto ist in den Tests Admin. */
export const ADMIN_EMAIL = `admin-${randomUUID()}@test.local`;

export function testApp({
  push,
  ...extra
}: Pick<
  Parameters<typeof erstelleApp>[0],
  "grenzen" | "fotoSpeicher" | "produktQuelle"
> & {
  /** Statt echtem Web Push: sammelt, was verschickt würde. */
  push?: { sender: Sender; einkaufPauseMs?: number };
} = {}) {
  const { db, sql } = erstelleDb(testDatenbankUrl());
  // Gesammelt wird bis `benachrichtiger.leeren()` – Tests warten nicht 90 Sekunden.
  const benachrichtiger = push
    ? new Benachrichtiger(sql, push.sender, "test-schluessel", {
        sammelMs: 60 * 60_000,
        ...(push.einkaufPauseMs ? { einkaufPauseMs: push.einkaufPauseMs } : {}),
      })
    : null;
  const auth = erstelleAuth(db, {
    secret: "test-secret-mindestens-32-zeichen-lang!!",
    webUrl: WEB_URL,
  });
  const app = erstelleApp({
    db,
    sql,
    auth,
    importLokalErlaubt: true,
    adminEmails: [ADMIN_EMAIL],
    benachrichtiger,
    ...extra,
  });

  /** Ein angemeldeter Testnutzer, der Anfragen mit seinem Sitzungs-Cookie stellt. */
  async function nutzer(name: string, { email }: { email?: string } = {}) {
    const antwort = await app.request(`${WEB_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: WEB_URL },
      body: JSON.stringify({
        name,
        email: email ?? `${name.toLowerCase()}-${randomUUID()}@test.local`,
        password: "ein-sicheres-passwort",
      }),
    });
    if (!antwort.ok) {
      throw new Error(
        `Registrierung fehlgeschlagen: ${antwort.status} ${await antwort.text()}`,
      );
    }
    const { user } = (await antwort.json()) as { user: { id: string } };
    const cookie = antwort.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");

    const anfrage = (methode: string, pfad: string, body?: unknown) =>
      app.request(`${WEB_URL}/api${pfad}`, {
        method: methode,
        headers: {
          cookie,
          origin: WEB_URL,
          "content-type": "application/json",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });

    return {
      id: user.id,
      get: (pfad: string) => anfrage("GET", pfad),
      post: (pfad: string, body?: unknown) => anfrage("POST", pfad, body ?? {}),
      patch: (pfad: string, body: unknown) => anfrage("PATCH", pfad, body),
      put: (pfad: string, body: unknown) => anfrage("PUT", pfad, body),
      anfrage,
      loeschen: (pfad: string) => anfrage("DELETE", pfad),
      /** Legt einen Haushalt an und gibt dessen id zurück. */
      async haushaltAnlegen(haushaltName = `Haushalt von ${name}`) {
        const res = await anfrage("POST", "/haushalte", { name: haushaltName });
        if (res.status !== 201) {
          throw new Error(
            `Haushalt anlegen: ${res.status} ${await res.text()}`,
          );
        }
        return ((await res.json()) as { id: string }).id;
      },
      hochladen: (operationen: unknown[]) =>
        anfrage("POST", "/powersync/upload", { operationen }),
      /** Rohdaten senden (z. B. ein Foto). */
      senden: (pfad: string, daten: Uint8Array, typ: string) =>
        app.request(`${WEB_URL}/api${pfad}`, {
          method: "POST",
          headers: { cookie, origin: WEB_URL, "content-type": typ },
          body: daten,
        }),
    };
  }

  return {
    app,
    sql,
    nutzer,
    benachrichtiger,
    beenden: async () => {
      await benachrichtiger?.leeren();
      await sql.end();
    },
  };
}

export const neueId = () => randomUUID();
