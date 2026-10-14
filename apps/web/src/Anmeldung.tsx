import { type FormEvent, useState } from "react";
import { authClient } from "./auth";

export function Anmeldung() {
  const [modus, setModus] = useState<"anmelden" | "registrieren">("anmelden");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function absenden(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const daten = new FormData(event.currentTarget);
    const email = String(daten.get("email"));
    const password = String(daten.get("passwort"));
    setFehler(null);
    setLaeuft(true);
    const { error } =
      modus === "anmelden"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({
            email,
            password,
            name: String(daten.get("name")).trim(),
          });
    setLaeuft(false);
    if (error) {
      setFehler(fehlertext(error.code));
    }
  }

  return (
    <main className="schmal">
      <h1>Haushalt</h1>
      <form className="stapel" onSubmit={absenden}>
        {modus === "registrieren" && (
          <label>
            Dein Name
            <input name="name" required autoComplete="given-name" />
          </label>
        )}
        <label>
          E-Mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Passwort
          <input
            name="passwort"
            type="password"
            required
            minLength={10}
            autoComplete={
              modus === "anmelden" ? "current-password" : "new-password"
            }
          />
        </label>
        {fehler && (
          <p className="fehler" role="alert">
            {fehler}
          </p>
        )}
        <button type="submit" disabled={laeuft}>
          {modus === "anmelden" ? "Anmelden" : "Konto anlegen"}
        </button>
      </form>
      <button
        type="button"
        className="leise"
        onClick={() => {
          setModus(modus === "anmelden" ? "registrieren" : "anmelden");
          setFehler(null);
        }}
      >
        {modus === "anmelden"
          ? "Noch kein Konto? Registrieren"
          : "Schon ein Konto? Anmelden"}
      </button>
    </main>
  );
}

function fehlertext(code: string | undefined) {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "E-Mail oder Passwort stimmt nicht.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Für diese E-Mail gibt es schon ein Konto.";
    case "PASSWORD_TOO_SHORT":
      return "Das Passwort braucht mindestens 10 Zeichen.";
    default:
      return "Das hat nicht geklappt. Bitte später noch einmal versuchen.";
  }
}
