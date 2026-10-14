import { ShoppingBasket } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ShoppingBasket className="size-9" />
        </div>
        <h1 className="text-2xl font-semibold">Haushalt</h1>
        <p className="text-sm text-muted-foreground">
          Gemeinsame Einkaufsliste und Vorrat, auch ohne Netz.
        </p>
      </div>

      <form className="space-y-4" onSubmit={absenden}>
        {modus === "registrieren" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Dein Name</Label>
            <Input
              id="name"
              name="name"
              required
              autoComplete="given-name"
              className="h-11 text-base"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-11 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="passwort">Passwort</Label>
          <Input
            id="passwort"
            name="passwort"
            type="password"
            required
            minLength={10}
            autoComplete={
              modus === "anmelden" ? "current-password" : "new-password"
            }
            className="h-11 text-base"
          />
        </div>
        {fehler && (
          <p className="text-sm text-destructive" role="alert">
            {fehler}
          </p>
        )}
        <Button
          type="submit"
          disabled={laeuft}
          className="h-11 w-full text-base"
        >
          {modus === "anmelden" ? "Anmelden" : "Konto anlegen"}
        </Button>
      </form>
      <Button
        variant="link"
        className="mt-4"
        onClick={() => {
          setModus(modus === "anmelden" ? "registrieren" : "anmelden");
          setFehler(null);
        }}
      >
        {modus === "anmelden"
          ? "Noch kein Konto? Registrieren"
          : "Schon ein Konto? Anmelden"}
      </Button>
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
