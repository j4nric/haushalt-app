import {
  einheitAnzeige,
  formatiereZutatMenge,
  istGewuerz,
  type Zutat,
  zerlegeZutat,
} from "@haushalt/db/zutaten";
import { usePowerSync, useQuery } from "@powersync/react";
import { ArrowLeft, Link2, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type GespeicherteZutat,
  type RezeptDaten,
  rezeptSpeichern,
  zutatenAlsText,
  zutatenAusText,
} from "./aktionen";

type Import = {
  titel: string;
  portionen: number | null;
  bild_url: string | null;
  quelle_url: string;
  zutaten: string[];
  schritte: string[];
};

const LEER: RezeptDaten = {
  titel: "",
  portionen: 2,
  quelle_url: null,
  bild_url: null,
  schritte: "",
  zutatenText: "",
  gewuerzeText: "",
};

/** Neues Rezept (mit Link-Import) oder ein bestehendes bearbeiten. */
export function RezeptEditor({
  haushaltId,
  nutzerId,
  rezeptId,
  fertig,
}: {
  haushaltId: string;
  nutzerId: string;
  rezeptId: string | null;
  fertig: (id: string | null) => void;
}) {
  const db = usePowerSync();
  const [daten, setDaten] = useState<RezeptDaten>(LEER);
  const [geladen, setGeladen] = useState(rezeptId == null);

  const { data: bestehend } = useQuery<
    Omit<RezeptDaten, "zutatenText" | "gewuerzeText">
  >(
    "SELECT titel, portionen, quelle_url, bild_url, schritte FROM rezepte WHERE id = ?",
    [rezeptId ?? ""],
  );
  const { data: zutaten, isLoading: zutatenLaden } =
    useQuery<GespeicherteZutat>(
      "SELECT * FROM rezept_zutaten WHERE rezept_id = ? ORDER BY position",
      [rezeptId ?? ""],
    );
  // Beim Bearbeiten einmalig mit dem gespeicherten Stand füllen – erst, wenn auch
  // die Zutaten da sind (beide Abfragen laufen getrennt).
  const rezept = bestehend[0];
  useEffect(() => {
    if (!geladen && rezept && !zutatenLaden) {
      setDaten({
        ...rezept,
        zutatenText: zutatenAlsText(zutaten.filter((z) => !z.gewuerz)),
        gewuerzeText: zutatenAlsText(zutaten.filter((z) => z.gewuerz)),
      });
      setGeladen(true);
    }
  }, [geladen, rezept, zutaten, zutatenLaden]);

  const aendern = (teil: Partial<RezeptDaten>) =>
    setDaten((d) => ({ ...d, ...teil }));
  const erkannt = zutatenAusText(daten.zutatenText);
  const erkannteGewuerze = zutatenAusText(daten.gewuerzeText);

  async function speichern(e: React.FormEvent) {
    e.preventDefault();
    if (!daten.titel.trim()) {
      return;
    }
    const id = await rezeptSpeichern(db, {
      id: rezeptId,
      haushaltId,
      nutzerId,
      daten,
    });
    fertig(id);
  }

  return (
    <form onSubmit={speichern} className="space-y-5 pt-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Zurück"
          onClick={() => fertig(rezeptId)}
        >
          <ArrowLeft />
        </Button>
        <h2 className="text-lg font-semibold">
          {rezeptId ? "Rezept bearbeiten" : "Neues Rezept"}
        </h2>
      </div>

      {!rezeptId && (
        <LinkImport
          uebernehmen={(r) => {
            // Rezeptseiten kennen nur eine Zutatenliste – Gewürze dort heraussortieren.
            const gewuerz = (zeile: string) => istGewuerz(zerlegeZutat(zeile));
            setDaten({
              titel: r.titel,
              portionen: r.portionen,
              quelle_url: r.quelle_url,
              bild_url: r.bild_url,
              schritte: r.schritte.join("\n"),
              zutatenText: r.zutaten.filter((z) => !gewuerz(z)).join("\n"),
              gewuerzeText: r.zutaten.filter(gewuerz).join("\n"),
            });
          }}
        />
      )}

      {daten.bild_url && (
        <div className="relative">
          <img
            src={daten.bild_url}
            alt=""
            referrerPolicy="no-referrer"
            className="aspect-[16/9] w-full rounded-2xl bg-muted object-cover"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Bild entfernen"
            className="absolute top-2 right-2 rounded-full"
            onClick={() => aendern({ bild_url: null })}
          >
            <X />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rezept-titel">Titel</Label>
          <Input
            id="rezept-titel"
            required
            value={daten.titel}
            onChange={(e) => aendern({ titel: e.target.value })}
            placeholder="Spaghetti mit Tomatensauce"
            className="h-11 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rezept-portionen">Portionen</Label>
          <Input
            id="rezept-portionen"
            type="number"
            inputMode="numeric"
            min={1}
            value={daten.portionen ?? ""}
            onChange={(e) =>
              aendern({
                portionen: e.target.value
                  ? Math.max(1, Math.round(Number(e.target.value)))
                  : null,
              })
            }
            className="h-11 text-base"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rezept-zutaten">Zutaten</Label>
        <Textarea
          id="rezept-zutaten"
          rows={6}
          value={daten.zutatenText}
          onChange={(e) => aendern({ zutatenText: e.target.value })}
          placeholder={"400 g Spaghetti\n1 Dose Tomaten\n2 EL Olivenöl\nSalz"}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          Eine Zutat pro Zeile – Menge und Einheit werden erkannt.
        </p>
        <Vorschau label="Erkannte Zutaten" zutaten={erkannt} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rezept-gewuerze">Gewürze</Label>
        <Textarea
          id="rezept-gewuerze"
          rows={3}
          value={daten.gewuerzeText}
          onChange={(e) => aendern({ gewuerzeText: e.target.value })}
          placeholder={"Salz\nPfeffer\n1 TL Paprikapulver"}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          Eins pro Zeile – Mengen sind hier optional.
        </p>
        <Vorschau label="Erkannte Gewürze" zutaten={erkannteGewuerze} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rezept-schritte">Zubereitung</Label>
        <Textarea
          id="rezept-schritte"
          rows={6}
          value={daten.schritte}
          onChange={(e) => aendern({ schritte: e.target.value })}
          placeholder={
            "Nudeln in Salzwasser 10 Minuten kochen.\nTomaten mit Öl 15 Minuten köcheln."
          }
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          Ein Schritt pro Zeile. Zeitangaben wie „15 Minuten“ werden beim Kochen
          zu Timern.
        </p>
      </div>

      {daten.quelle_url && (
        <p className="truncate text-xs text-muted-foreground">
          Quelle: {daten.quelle_url}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full"
          onClick={() => fertig(rezeptId)}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          className="h-11 rounded-full"
          disabled={!daten.titel.trim()}
        >
          Speichern
        </Button>
      </div>
    </form>
  );
}

/** Link einfügen → der Server liest das Rezept aus (geht nur mit Netz). */
function LinkImport({ uebernehmen }: { uebernehmen: (r: Import) => void }) {
  const [url, setUrl] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const aktualisieren = () => setOnline(navigator.onLine);
    window.addEventListener("online", aktualisieren);
    window.addEventListener("offline", aktualisieren);
    return () => {
      window.removeEventListener("online", aktualisieren);
      window.removeEventListener("offline", aktualisieren);
    };
  }, []);

  async function importieren() {
    setLaeuft(true);
    const antwort = await fetch("/api/rezepte/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => null);
    setLaeuft(false);
    const inhalt = await antwort?.json().catch(() => ({}));
    if (!antwort?.ok) {
      toast.error(inhalt?.fehler ?? "Import fehlgeschlagen – bist du online?");
      return;
    }
    uebernehmen(inhalt as Import);
    setUrl("");
    toast.success(`„${(inhalt as Import).titel}“ übernommen – kurz prüfen`);
  }

  return (
    <section
      aria-label="Aus Link importieren"
      className="space-y-2 rounded-2xl border bg-card p-3"
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <Link2 className="size-4 text-primary" /> Aus Link importieren
      </p>
      <div className="flex gap-2">
        <Input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          aria-label="Link zum Rezept"
          className="h-10 rounded-full px-4 text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (url.trim() && online) {
                importieren();
              }
            }
          }}
        />
        <Button
          type="button"
          className="h-10 shrink-0 rounded-full"
          disabled={!url.trim() || laeuft || !online}
          onClick={importieren}
        >
          {laeuft ? <LoaderCircle className="animate-spin" /> : "Holen"}
        </Button>
      </div>
      {!online && (
        <p className="text-xs text-muted-foreground">
          Import braucht Internet – von Hand eintragen geht auch offline.
        </p>
      )}
    </section>
  );
}

/** Zeigt, was aus den Zeilen erkannt wurde: Menge fett, Einheit farbig. */
function Vorschau({ label, zutaten }: { label: string; zutaten: Zutat[] }) {
  if (zutaten.length === 0) {
    return null;
  }
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5 pt-1">
      {zutaten.map((z, i) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: Vorschau ohne eigene IDs, Zeilen dürfen gleich sein.
          key={i}
          className="rounded-full border bg-card px-2.5 py-0.5 text-xs"
        >
          {z.menge != null && (
            <span className="font-semibold">
              {formatiereZutatMenge(z.menge)}{" "}
            </span>
          )}
          {z.einheit && (
            <span className="font-semibold text-primary">
              {einheitAnzeige(z.einheit, z.menge)}{" "}
            </span>
          )}
          {z.name}
        </li>
      ))}
    </ul>
  );
}
