import { formatiereMenge } from "@haushalt/db/einheiten";
import {
  einheitAnzeige,
  formatiereZutatMenge,
  istGrundzutat,
  mengeFuerListe,
  zutatAlsText,
} from "@haushalt/db/zutaten";
import { usePowerSync, useQuery } from "@powersync/react";
import {
  ArrowLeft,
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ArtikelStand, imVorrat } from "@/lib/kochbar";
import { cn } from "@/lib/utils";
import {
  favoritUmschalten,
  type GespeicherteZutat,
  gekochtMerken,
  type ListenZutat,
  rezeptLoeschen,
  schlagwoerterAusText,
  zutatenAufListe,
} from "./aktionen";
import { Kochansicht } from "./Kochansicht";
import { ARTIKEL_STAND, RezeptBild } from "./Rezepte";

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
}: {
  id: string;
  haushaltId: string;
  nutzerId: string;
  kochen: boolean;
  gehe: (pfad: string[]) => void;
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
  const [portionen, setPortionen] = useState<number | null>(null);
  const [listeOffen, setListeOffen] = useState(false);

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

  const aktuellePortionen = portionen ?? rezept.portionen;
  const faktor =
    rezept.portionen && aktuellePortionen
      ? aktuellePortionen / rezept.portionen
      : 1;
  const schritte = rezept.schritte.split("\n").filter(Boolean);
  const gewuerze = zutaten.filter((z) => z.gewuerz);

  async function loeschen() {
    const wiederherstellen = await rezeptLoeschen(db, id);
    gehe([]);
    toast(`„${rezept?.titel}“ gelöscht`, {
      action: { label: "Rückgängig", onClick: () => wiederherstellen() },
    });
  }

  if (kochen) {
    return (
      <Kochansicht
        rezept={rezept}
        zutaten={zutaten}
        faktor={faktor}
        portionen={aktuellePortionen}
        schliessen={() => gehe([id])}
        fertigGekocht={async () => {
          const { anzahl, zuruecknehmen } = await gekochtMerken(db, {
            haushaltId,
            nutzerId,
            rezeptId: id,
          });
          gehe([id]);
          toast.success(
            anzahl === 1
              ? "Guten Appetit! 🍽️ Zum ersten Mal gekocht"
              : `Guten Appetit! 🍽️ Zum ${anzahl}. Mal gekocht`,
            { action: { label: "Rückgängig", onClick: () => zuruecknehmen() } },
          );
        }}
      />
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

      <AufDieListe
        offen={listeOffen}
        schliessen={() => setListeOffen(false)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        zutaten={zutaten}
        faktor={faktor}
        portionen={aktuellePortionen}
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

type Vorschlag = ListenZutat & {
  id: string;
  /** Warum nicht vorausgewählt; `null` = kommt auf die Liste. */
  grund: string | null;
  sperre: boolean;
};

/**
 * „Auf die Liste“: alle Zutaten zum Abhaken. Nicht vorausgewählt ist, was schon
 * auf der Liste steht, im Vorrat reicht oder man immer hat (Salz, Öl …).
 */
function AufDieListe({
  offen,
  schliessen,
  haushaltId,
  nutzerId,
  zutaten,
  faktor,
  portionen,
}: {
  offen: boolean;
  schliessen: () => void;
  haushaltId: string;
  nutzerId: string;
  zutaten: GespeicherteZutat[];
  faktor: number;
  portionen: number | null;
}) {
  const db = usePowerSync();
  const { data: artikel } = useQuery<ArtikelStand>(ARTIKEL_STAND, [haushaltId]);
  const nachName = new Map(artikel.map((a) => [a.name, a]));

  const vorschlaege: Vorschlag[] = zutaten.map((z) => {
    const { menge, einheit } = mengeFuerListe(z, faktor);
    const a = nachName.get(z.name.toLowerCase());
    let grund: string | null = a?.auf_liste
      ? "steht schon drauf"
      : imVorrat(z, a, faktor);
    if (!grund && z.gewuerz) {
      grund = "Gewürz";
    } else if (!grund && istGrundzutat(z.name)) {
      grund = "haben wir immer";
    }
    return {
      id: z.id,
      name: z.name,
      menge,
      einheit,
      grund,
      sperre: Boolean(a?.auf_liste),
    };
  });

  // Auswahl je Öffnen neu vorbelegen.
  const [abgewaehlt, setAbgewaehlt] = useState<Set<string> | null>(null);
  const aus =
    abgewaehlt ?? new Set(vorschlaege.filter((v) => v.grund).map((v) => v.id));
  const gewaehlt = vorschlaege.filter((v) => !v.sperre && !aus.has(v.id));

  function umschalten(id: string) {
    const neu = new Set(aus);
    if (neu.has(id)) {
      neu.delete(id);
    } else {
      neu.add(id);
    }
    setAbgewaehlt(neu);
  }

  async function uebernehmen() {
    const anzahl = await zutatenAufListe(db, {
      haushaltId,
      nutzerId,
      zutaten: gewaehlt,
    });
    schliessen();
    setAbgewaehlt(null);
    toast.success(
      anzahl === 1
        ? "1 Zutat auf der Liste"
        : `${anzahl} Zutaten auf der Liste`,
      {
        action: {
          label: "Zur Liste",
          onClick: () => {
            location.hash = "";
          },
        },
      },
    );
  }

  return (
    <Drawer
      open={offen}
      onOpenChange={(o) => {
        if (!o) {
          schliessen();
          setAbgewaehlt(null);
        }
      }}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Auf die Einkaufsliste</DrawerTitle>
            <DrawerDescription>
              {portionen ? `Für ${portionen} Portionen. ` : ""}Abgewählt:
              Gewürze und was im Vorrat reicht oder immer da ist.
            </DrawerDescription>
          </DrawerHeader>
          <ul className="max-h-[50dvh] space-y-1 overflow-y-auto px-4">
            {vorschlaege.map((v) => {
              const an = !v.sperre && !aus.has(v.id);
              return (
                <li key={v.id}>
                  <label
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-2 py-2",
                      v.sperre ? "opacity-60" : "active:bg-muted",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={an}
                      disabled={v.sperre}
                      onChange={() => umschalten(v.id)}
                      className="size-5 accent-[var(--primary)]"
                    />
                    <span className="flex-1">
                      {v.name}
                      {v.menge != null && v.einheit && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {formatiereMenge(v.menge, v.einheit)}
                        </span>
                      )}
                    </span>
                    {v.grund && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {v.grund}
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
          <DrawerFooter>
            <Button
              className="h-12 rounded-full text-base"
              disabled={gewaehlt.length === 0}
              onClick={uebernehmen}
            >
              <ShoppingCart />
              {gewaehlt.length === 1
                ? "1 Zutat auf die Liste"
                : `${gewaehlt.length} Zutaten auf die Liste`}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
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
