import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Login, Registrierung und Sitzung. Läuft über den Vite-Proxy an /api/auth. */
export const authClient = createAuthClient({
  plugins: [jwtClient()],
});
