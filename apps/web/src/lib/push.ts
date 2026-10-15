/**
 * Push-Benachrichtigungen für dieses Gerät: Erlaubnis holen, beim Push-Dienst des
 * Browsers abonnieren und das Abo samt gewählten Arten beim Server speichern.
 */

export const PUSH_ARTEN = [
  {
    id: "liste",
    name: "Neues auf der Liste",
    beispiel: "„Anna: Milch, Brot und 3 weitere“",
  },
  {
    id: "einkauf",
    name: "Jemand kauft ein",
    beispiel: "„Anna kauft gerade ein“ – noch schnell was ergänzen",
  },
  {
    id: "plan_heute",
    name: "Heute im Plan",
    beispiel: "Um 16 Uhr: was es gibt und was dafür noch fehlt",
  },
  {
    id: "rezept",
    name: "Neue Rezepte",
    beispiel: "Wenn jemand anderes ein Rezept anlegt",
  },
  {
    id: "mitglied",
    name: "Neue Mitglieder",
    beispiel: "Wenn jemand dem Haushalt beitritt",
  },
  {
    id: "plan",
    name: "Änderungen am Wochenplan",
    beispiel: "Wenn jemand ein Gericht einplant",
  },
] as const;
export type PushArt = (typeof PUSH_ARTEN)[number]["id"];

export type PushZustand =
  /** Browser kann es nicht (oder iPhone ohne Home-Bildschirm). */
  | { art: "nicht-moeglich"; ios: boolean }
  /** Benachrichtigungen für die App im Browser blockiert. */
  | { art: "blockiert" }
  | { art: "aus" }
  | { art: "an"; arten: PushArt[] };

export function istIos(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

function kannPush(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Service Worker – fehlt in der Entwicklung (`vite dev`), dann nach kurzer Zeit `null`. */
async function registrierung(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((fertig) => setTimeout(() => fertig(null), 3000)),
  ]);
}

async function antwort<T>(a: Response): Promise<T> {
  if (!a.ok) {
    const { fehler } = (await a.json().catch(() => ({}))) as {
      fehler?: string;
    };
    throw new Error(fehler ?? `Fehler ${a.status}`);
  }
  return (await a.json()) as T;
}

const json = (methode: string, body: unknown): RequestInit => ({
  method: methode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export async function pushZustand(): Promise<PushZustand> {
  if (!kannPush()) {
    return { art: "nicht-moeglich", ios: istIos() };
  }
  if (Notification.permission === "denied") {
    return { art: "blockiert" };
  }
  const reg = await registrierung();
  if (!reg) {
    return { art: "nicht-moeglich", ios: false };
  }
  const abo = await reg.pushManager.getSubscription();
  if (!abo || Notification.permission !== "granted") {
    return { art: "aus" };
  }
  const a = await fetch(
    `/api/push/abo?endpoint=${encodeURIComponent(abo.endpoint)}`,
  );
  if (a.status === 404) {
    return { art: "aus" };
  }
  const { arten } = await antwort<{ arten: PushArt[] }>(a);
  return { art: "an", arten };
}

function schluesselBytes(base64: string): Uint8Array<ArrayBuffer> {
  const roh = atob(
    (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
      .replace(/-/g, "+")
      .replace(/_/g, "/"),
  );
  return Uint8Array.from(roh, (z) => z.charCodeAt(0));
}

/** Fragt (beim ersten Mal) um Erlaubnis und meldet dieses Gerät an. */
export async function einschalten(): Promise<PushArt[]> {
  const erlaubnis = await Notification.requestPermission();
  if (erlaubnis !== "granted") {
    throw new Error(
      erlaubnis === "denied"
        ? "Benachrichtigungen sind blockiert – in den Einstellungen des Browsers erlauben."
        : "Ohne Erlaubnis keine Benachrichtigungen.",
    );
  }
  const reg = await registrierung();
  if (!reg) {
    throw new Error(
      "Geht nur in der installierten App bzw. mit Service Worker.",
    );
  }
  const { schluessel, standard } = await antwort<{
    schluessel: string;
    standard: PushArt[];
  }>(await fetch("/api/push/schluessel"));
  const applicationServerKey = schluesselBytes(schluessel);
  let abo = await reg.pushManager.getSubscription();
  // Hat der Server neue Schlüssel, passt das alte Abo nicht mehr.
  const alt = abo?.options.applicationServerKey;
  if (
    abo &&
    alt &&
    new Uint8Array(alt).join() !== applicationServerKey.join()
  ) {
    await abo.unsubscribe();
    abo = null;
  }
  abo ??= await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
  await speichern(abo, standard);
  return standard;
}

async function speichern(abo: PushSubscription, arten: PushArt[]) {
  const { endpoint, keys } = abo.toJSON();
  await antwort(
    await fetch("/api/push/abo", json("PUT", { endpoint, keys, arten })),
  );
}

export async function artenSpeichern(arten: PushArt[]) {
  const abo = await (await registrierung())?.pushManager.getSubscription();
  if (abo) {
    await speichern(abo, arten);
  }
}

export async function ausschalten() {
  const abo = await (await registrierung())?.pushManager.getSubscription();
  if (!abo) {
    return;
  }
  await fetch("/api/push/abo", json("DELETE", { endpoint: abo.endpoint }));
  await abo.unsubscribe();
}

export async function testSenden() {
  const abo = await (await registrierung())?.pushManager.getSubscription();
  if (!abo) {
    throw new Error("Dieses Gerät ist nicht angemeldet.");
  }
  await antwort(
    await fetch("/api/push/test", json("POST", { endpoint: abo.endpoint })),
  );
}
