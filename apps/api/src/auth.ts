import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { type Db, schema } from "@haushalt/db";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export function erstelleAuth(
  db: Db,
  optionen: { secret: string; webUrl: string; weitereOrigins?: string[] },
) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    secret: optionen.secret,
    baseURL: optionen.webUrl,
    trustedOrigins: [optionen.webUrl, ...(optionen.weitereOrigins ?? [])],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
    },
    plugins: [
      // Stellt kurzlebige JWTs für PowerSync aus (GET /api/auth/token) und
      // veröffentlicht die öffentlichen Schlüssel unter /api/auth/jwks.
      jwt({
        jwt: {
          audience: "powersync",
          expirationTime: "15m",
          // Nur die Nutzer-ID (sub) – keine E-Mail o. Ä. im Token.
          definePayload: () => ({}),
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof erstelleAuth>;
