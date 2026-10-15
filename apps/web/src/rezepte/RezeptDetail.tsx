import {
  einheitAnzeige,
  formatiereZutatMenge,
  zutatAlsText,
} from "@haushalt/db/zutaten";
import { usePowerSync, useQuery } from "@powersync/react";
import {
  ArrowLeft,
  CalendarPlus,
  ChefHat,
  ExternalLink,
  Minus,
  MoreVertical,
  Pencil,
  Plus,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { alsPosten } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { Einplanen } from "../plan/Einplanen";
import { Abbuchen, type Abbuchung, useAbbuchbar } from "./Abbuchen";
import { AufDieListe } from "./AufDieListe";
import {
  favoritUmschalten,
  type GespeicherteZutat,
  kochenAbschliessen,
  rezeptLoeschen,
  schlagwoerterAusText,
} from "./aktionen";
import { Kochansicht } from "./Kochansicht";
import { RezeptBild } from "./Rezepte";

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

export function RezeptDetail({
  id,
  haushaltId,
  nutzerId,
  kochen,
  gehe,
  plan,
}: {
  id: string;
  haushaltId: string;
  nutzerId: string;
  kochen: boolean;
  gehe: (pfad: string[]) => void;
  /** Aus dem Wochenplan gekocht: dessen Portionen, abhaken und dorthin zurück. */
  plan?: { eintragId: string; portionen: number | null; zurueck: () => void };
}) {
  const db = usePowerSync();
  const { data: rezepte, isLoading } = useQuery<Rezept>(
    `SELECT r.id, r.titel, r.portionen, r.quelle_url, r.bild_url, r.schritte, r.favorit, r.schlagwoerter,
            (SELECT COUNT(*) FROM gekocht g WHERE g.rezept_id = r.id) AS gekocht_anzahl,
            (SELECT MAX(g.gekocht_am) FROM gekocht g WHERE g.rezept_id = r.id) AS zuletzt_gekocht
       FROM rezepte r WHERE r.id = ?`,
    [id],
  );
  const { data: zutaten } = useQuery<GespeicherteZutat>(
    "SELECT * FROM rezept_zutaten WHERE rezept_id = ? ORDER BY position",
    [id],
  );
  const rezept = rezepte[0];
  // Portionen gelten für Anzeige, Kochansicht und Einkaufsliste.
  const [portionen, setPortionen] = useState<number | null>(
    plan?.portionen ?? null,
  );
  const [listeOffen, setListeOffen] = useState(false);
  const [einplanenOffen, setEinplanenOffen] = useState(false);
  const [abbuchenOffen, setAbbuchenOffen] = useState(false);
  const aktuellePortionen = portionen ?? rezept?.portionen ?? null;
  const faktor =
    rezept?.portionen && aktuellePortionen
      ? aktuellePortionen / rezept.portionen
      : 1;
  const abbuchbar = useAbbuchbar(haushaltId, zutaten, faktor);

  if (!rezept) {
    return isLoading ? null : (
      <div className="py-16 text-center text-muted-foreground">
        <p>Dieses Rezept gibt es nicht mehr.</p>
        <Button variant="link" onClick={() => gehe([])}>
          Zu den Rezepten
        </Button>
      </div>
    );
  }

  const schritte = rezept.schritte.split("\n").filter(Boolean);
  const gewuerze = zutaten.filter((z) => z.gewuerz);

  async function loeschen() {
    const wiederherstellen = await rezeptLoeschen(db, id);
    gehe([]);
    toast(`„${rezept?.titel}“ gelöscht`, {
      action: { label: "Rückgängig", onClick: () => wiederherstellen() },
    });
  }

  const zurueck = () => (plan ? plan.zurueck() : gehe([id]));

  async function abschliessen(abbuchen: Abbuchung[]) {
    setAbbuchenOffen(false);
    const { anzahl, zuruecknehmen } = await kochenAbschliessen(db, {
      haushaltId,
      nutzerId,
      rezeptId: id,
      planEintragId: plan?.eintragId ?? null,
      abbuchen,
    });
    zurueck();
    toast.success(
      (anzahl === 1
        ? "Guten Appetit! 🍽️ Zum ersten Mal gekocht"
        : `Guten Appetit! 🍽️ Zum ${anzahl}. Mal gekocht`) +
        (abbuchen.length > 0
          ? ` · ${abbuchen.length} aus dem Vorrat abgebucht`
          : ""),
      { action: { label: "Rückgängig", onClick: () => zuruecknehmen() } },
    );
  }

  if (kochen) {
    return (
      <>
        <Kochansicht
          rezept={rezept}
          zutaten={zutaten}
          faktor={faktor}
          portionen={aktuellePortionen}
          schliessen={zurueck}
          fertigGekocht={() =>
            abbuchbar.length > 0 ? setAbbuchenOffen(true) : abschliessen([])
          }
        />
        <Abbuchen
          offen={abbuchenOffen}
          zeilen={abbuchbar}
          schliessen={() => setAbbuchenOffen(false)}
          bestaetigen={abschliessen}
        />
      </>
    );
  }

  return (
    <article className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="-ml-2 gap-1 px-2"
          onClick={() => gehe([])}
        >
          <ArrowLeft /> Rezepte
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Weitere Aktionen">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => gehe([id, "bearbeiten"])}>
              <Pencil /> Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={loeschen}>
              <Trash2 /> Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RezeptBild
        url={rezept.bild_url}
        titel={rezept.titel}
        className="aspect-[16/9] rounded-2xl"
      />

      <header className="space-y-1.5">
        <div className="flex items-start gap-2">
          <h2 className="flex-1 text-2xl leading-tight font-bold">
            {rezept.titel}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 size-10 rounded-full"
            aria-label={
              rezept.favorit ? "Kein Favorit mehr" : "Als Favorit merken"
            }
            aria-pressed={Boolean(rezept.favorit)}
            onClick={() => favoritUmschalten(db, id, !rezept.favorit)}
          >
            <Star
              className={cn(
                "size-6 transition-transform active:scale-125",
                rezept.favorit
                  ? "fill-amber-400 text-amber-500"
                  : "text-muted-foreground",
              )}
            />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {kochstatistik(rezept.gekocht_anzahl, rezept.zuletzt_gekocht)}
        </p>
        {schlagwoerterAusText(rezept.schlagwoerter).length > 0 && (
          <ul aria-label="Schlagwörter" className="flex flex-wrap gap-1.5">
            {schlagwoerterAusText(rezept.schlagwoerter).map((w) => (
              <li
                key={w}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
              >
                #{w}
              </li>
            ))}
          </ul>
        )}
        {rezept.quelle_url?.match(/^https?:\/\//) && (
          <a
            href={rezept.quelle_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            {new URL(rezept.quelle_url).hostname.replace(/^www\./, "")}
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Button
          className="h-12 rounded-full text-base"
          onClick={() => setListeOffen(true)}
          disabled={zutaten.length === 0}
        >
          <ShoppingCart /> Auf die Liste
        </Button>
        <Button
          variant="secondary"
          className="h-12 rounded-full text-base"
          onClick={() => gehe([id, "kochen"])}
        >
          <ChefHat /> Kochen
        </Button>
        <Button
          variant="outline"
          className="col-span-2 h-11 rounded-full"
          onClick={() => setEinplanenOffen(true)}
        >
          <CalendarPlus /> Einplanen
        </Button>
      </div>

      <section aria-labelledby="zutaten-titel" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 id="zutaten-titel" className="text-lg font-semibold">
            Zutaten
          </h3>
          {aktuellePortionen != null && (
            <PortionenWahl wert={aktuellePortionen} aendern={setPortionen} />
          )}
        </div>
        <ul className="divide-y rounded-2xl border bg-card">
          {zutaten
            .filter((z) => !z.gewuerz)
            .map((z) => (
              <li key={z.id} className="flex gap-3 px-4 py-2.5">
                <span className="w-20 shrink-0 text-right font-semibold tabular-nums">
                  {z.menge != null && formatiereZutatMenge(z.menge * faktor)}{" "}
                  {z.einheit &&
                    einheitAnzeige(
                      z.einheit,
                      z.menge != null ? z.menge * faktor : null,
                    )}
                </span>
                <span>
                  {z.name}
                  {z.zusatz && (
                    <span className="text-muted-foreground">, {z.zusatz}</span>
                  )}
                </span>
              </li>
            ))}
        </ul>
        {gewuerze.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Gewürze
            </h4>
            <ul aria-label="Gewürze" className="flex flex-wrap gap-2">
              {gewuerze.map((z) => (
                <li
                  key={z.id}
                  className="rounded-full border bg-card px-3 py-1 text-sm"
                >
                  {zutatAlsText(z, faktor)}
                  {z.zusatz && (
                    <span className="text-muted-foreground">, {z.zusatz}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {schritte.length > 0 && (
        <section aria-labelledby="schritte-titel" className="space-y-3">
          <h3 id="schritte-titel" className="text-lg font-semibold">
            Zubereitung
          </h3>
          <ol className="space-y-3">
            {schritte.map((s, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Schritte sind Textzeilen ohne eigene IDs.
              <li key={i} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="pt-0.5 leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Einplanen
        offen={einplanenOffen}
        schliessen={() => setEinplanenOffen(false)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        rezept={{ id, titel: rezept.titel }}
      />
      <AufDieListe
        offen={listeOffen}
        schliessen={() => setListeOffen(false)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        posten={zutaten.map((z) => alsPosten(z, faktor))}
        beschreibung={
          aktuellePortionen ? `Für ${aktuellePortionen} Portionen.` : ""
        }
      />
    </article>
  );
}

export function PortionenWahl({
  wert,
  aendern,
}: {
  wert: number;
  aendern: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border bg-card p-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-full"
        aria-label="Weniger Portionen"
        disabled={wert <= 1}
        onClick={() => aendern(wert - 1)}
      >
        <Minus />
      </Button>
      <span
        className="min-w-20 text-center text-sm font-medium"
        aria-live="polite"
      >
        {wert} {wert === 1 ? "Portion" : "Portionen"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-full"
        aria-label="Mehr Portionen"
        onClick={() => aendern(wert + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}

/** „3× gekocht · zuletzt vor 5 Tagen“ bzw. „Noch nie gekocht“. */
export function kochstatistik(anzahl: number, zuletzt: string | null): string {
  if (!anzahl || !zuletzt) {
    return "Noch nie gekocht";
  }
  return `${anzahl}× gekocht · zuletzt ${vorWann(zuletzt)}`;
}

export function vorWann(zeitpunkt: string): string {
  const tage = Math.floor(
    (new Date().setHours(0, 0, 0, 0) -
      new Date(zeitpunkt).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  if (tage <= 0) {
    return "heute";
  }
  if (tage === 1) {
    return "gestern";
  }
  if (tage < 14) {
    return `vor ${tage} Tagen`;
  }
  if (tage < 60) {
    return `vor ${Math.round(tage / 7)} Wochen`;
  }
  return `vor ${Math.round(tage / 30)} Monaten`;
}
