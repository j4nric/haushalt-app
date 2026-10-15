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
import { cn } from "@/lib/utils";
import {
  type GespeicherteZutat,
  type ListenZutat,
  rezeptLoeschen,
  zutatenAufListe,
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
    "SELECT id, titel, portionen, quelle_url, bild_url, schritte FROM rezepte WHERE id = ?",
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

      <header className="space-y-1">
        <h2 className="text-2xl leading-tight font-bold">{rezept.titel}</h2>
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

type ArtikelStand = {
  name: string;
  im_vorrat: number;
  standardeinheit: "stueck" | "g" | "ml";
  bestand: number;
  auf_liste: number;
};

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
  const { data: artikel } = useQuery<ArtikelStand>(
    `SELECT lower(a.name) AS name, COALESCE(a.im_vorrat, 0) AS im_vorrat, a.standardeinheit,
            COALESCE((SELECT SUM(b.menge) FROM vorratsbuchungen b WHERE b.artikel_id = a.id), 0) AS bestand,
            EXISTS (SELECT 1 FROM listeneintraege l WHERE l.artikel_id = a.id AND l.erledigt = 0) AS auf_liste
       FROM artikel a WHERE a.haushalt_id = ?`,
    [haushaltId],
  );
  const nachName = new Map(artikel.map((a) => [a.name, a]));

  const vorschlaege: Vorschlag[] = zutaten.map((z) => {
    const { menge, einheit } = mengeFuerListe(z, faktor);
    const a = nachName.get(z.name.toLowerCase());
    let grund: string | null = null;
    if (a?.auf_liste) {
      grund = "steht schon drauf";
    } else if (a?.im_vorrat && a.bestand > 0) {
      const reicht =
        menge == null || einheit !== a.standardeinheit || a.bestand >= menge;
      if (reicht) {
        grund = `im Vorrat: ${formatiereMenge(a.bestand, a.standardeinheit)}`;
      }
    }
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
