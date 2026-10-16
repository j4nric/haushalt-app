import { usePowerSync, useQuery } from "@powersync/react";
import {
  ArrowLeftRight,
  BookOpen,
  CalendarArrowUp,
  Check,
  ChefHat,
  Dices,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUnterseite } from "@/Ansicht";
import { PortionenWahl } from "@/components/PortionenWahl";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  type Gericht,
  heute,
  tageAb,
  tagePlus,
  tagName,
  tagText,
  wiederholungen,
  wochentag,
  zutatenSammeln,
} from "@/lib/plan";
import { cn } from "@/lib/utils";
import { zeitWert } from "@/lib/zeit";
import { RezeptBild } from "@/rezepte/RezeptBild";
import { AufDieListe } from "../rezepte/AufDieListe";
import { RezeptDetail } from "../rezepte/RezeptDetail";
import { useZutatenNachRezept } from "../rezepte/useKochbar";
import { Auswahl } from "./Auswahl";
import {
  entfernen,
  erledigtSetzen,
  portionenSetzen,
  tauschen,
  verschieben,
} from "./aktionen";
import {
  type PlanEintrag,
  planFaktor,
  usePlan,
  usePlanEintrag,
  useStandardPortionen,
} from "./daten";
import { WocheFuellen } from "./WocheFuellen";

const TAGE = 14;

/** Bereich „Plan“: Abendessen der nächsten zwei Wochen; Unterseite …/kochen. */
export function Plan({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const [pfad, gehe] = useUnterseite("plan");
  const [id, unterseite] = pfad;
  if (id && unterseite === "kochen") {
    return (
      <PlanKochen
        eintragId={id}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        zurueck={() => gehe([])}
      />
    );
  }
  return <Wochenplan haushaltId={haushaltId} nutzerId={nutzerId} />;
}

/** Kochansicht eines geplanten Rezepts – mit dessen Portionen, hakt den Eintrag ab. */
function PlanKochen({
  eintragId,
  haushaltId,
  nutzerId,
  zurueck,
}: {
  eintragId: string;
  haushaltId: string;
  nutzerId: string;
  zurueck: () => void;
}) {
  const { eintrag, isLoading } = usePlanEintrag(eintragId);
  const standard = useStandardPortionen(haushaltId);
  if (isLoading) {
    return null;
  }
  if (!eintrag?.rezept_id || !eintrag.rezept_da) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>Zu diesem Eintrag gibt es kein Rezept (mehr).</p>
        <Button variant="link" onClick={zurueck}>
          Zum Plan
        </Button>
      </div>
    );
  }
  return (
    <RezeptDetail
      id={eintrag.rezept_id}
      haushaltId={haushaltId}
      nutzerId={nutzerId}
      kochen
      gehe={(p) => {
        location.hash = ["rezepte", ...p].join("/");
      }}
      plan={{
        eintragId,
        portionen: eintrag.portionen ?? standard,
        zurueck,
      }}
    />
  );
}

type Gekocht = { id: string; rezept_id: string; gekocht_am: string };

function Wochenplan({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const start = heute();
  const tage = tageAb(start, TAGE);
  const ende = tagePlus(start, TAGE - 1);
  const wocheEnde = tagePlus(start, 6);
  // Eine Woche zurück für Bilanz und Abwechslung.
  const alle = usePlan(haushaltId, tagePlus(start, -7), ende);
  const { data: gekocht } = useQuery<Gekocht>(
    "SELECT id, rezept_id, gekocht_am FROM gekocht WHERE haushalt_id = ? AND gekocht_am >= ?",
    [haushaltId, new Date(Date.now() - 8 * 86_400_000).toISOString()],
  );
  const standard = useStandardPortionen(haushaltId);
  const zutatenNachRezept = useZutatenNachRezept(haushaltId);

  const [auswahlTag, setAuswahlTag] = useState<string | null>(null);
  const [menue, setMenue] = useState<PlanEintrag | null>(null);
  const [einkaufen, setEinkaufen] = useState(false);
  const [fuellen, setFuellen] = useState(false);

  const kommend = alle.filter((e) => e.datum >= start);
  const gekochtAlsGericht: Gericht[] = gekocht.map((g) => ({
    id: g.id,
    tag: tagText(new Date(zeitWert(g.gekocht_am))),
    rezeptId: g.rezept_id,
  }));
  const frueher: Gericht[] = alle
    .filter((e) => e.datum < start)
    .map((e) => ({ id: e.id, tag: e.datum, rezeptId: e.rezept_id }));
  const wiederholt = wiederholungen(
    kommend.map((e) => ({ id: e.id, tag: e.datum, rezeptId: e.rezept_id })),
    [...frueher, ...gekochtAlsGericht],
  );

  // Wochenbilanz: die letzten sieben Tage einschließlich heute.
  const bilanzAb = tagePlus(start, -6);
  const gekochtWoche = gekochtAlsGericht.filter(
    (g) => g.tag >= bilanzAb,
  ).length;
  const ohneRezept = new Map<string, number>();
  for (const e of alle) {
    if (!e.rezept_id && e.erledigt && e.datum >= bilanzAb && e.datum <= start) {
      ohneRezept.set(e.titel, (ohneRezept.get(e.titel) ?? 0) + 1);
    }
  }

  // „Woche einkaufen“: offene Rezepte der nächsten sieben Tage.
  const woche = kommend.filter(
    (e) => e.datum <= wocheEnde && e.rezept_id && e.rezept_da && !e.erledigt,
  );
  const posten = zutatenSammeln(
    woche.map((e) => ({
      tag: e.datum,
      faktor: planFaktor(e, standard),
      zutaten: zutatenNachRezept.get(e.rezept_id ?? "") ?? [],
    })),
  );
  const leereTage = tageAb(start, 7).filter(
    (t) => !kommend.some((e) => e.datum === t),
  );

  return (
    <div className="space-y-4 pt-2">
      {(gekochtWoche > 0 || ohneRezept.size > 0) && (
        <section
          aria-label="Wochenbilanz"
          className="flex items-center gap-3 rounded-2xl border p-3"
          style={{
            background: "color-mix(in oklab, var(--card), var(--primary) 8%)",
          }}
        >
          <span aria-hidden className="text-2xl">
            {gekochtWoche >= 5 ? "🎉" : "📅"}
          </span>
          <p className="text-sm">
            <span className="block text-xs text-muted-foreground">
              Letzte 7 Tage
            </span>
            {[
              gekochtWoche > 0 ? `${gekochtWoche}× gekocht 🍳` : null,
              ...[...ohneRezept].map(([t, n]) => `${n}× ${t}`),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          className="h-11 rounded-full"
          onClick={() => setEinkaufen(true)}
          disabled={woche.length === 0}
        >
          <ShoppingCart /> Woche einkaufen
        </Button>
        <Button
          variant="secondary"
          className="h-11 rounded-full"
          onClick={() => setFuellen(true)}
          disabled={leereTage.length === 0}
        >
          <Dices /> Woche füllen
        </Button>
      </div>

      <ol className="space-y-3">
        {tage.map((tag) => {
          const eintraege = kommend.filter((e) => e.datum === tag);
          const istHeute = tag === start;
          return (
            <li key={tag} aria-label={tagName(tag)}>
              <div className="flex items-center justify-between px-1 pb-1.5">
                <h3
                  className={cn(
                    "text-xs font-semibold tracking-wide uppercase",
                    istHeute ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {tagName(tag)}
                </h3>
                {eintraege.length > 0 && (
                  <button
                    type="button"
                    aria-label={`${tagName(tag)}: noch etwas planen`}
                    onClick={() => setAuswahlTag(tag)}
                    className="rounded-full p-1 text-muted-foreground active:bg-muted"
                  >
                    <Plus className="size-4" />
                  </button>
                )}
              </div>
              {eintraege.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setAuswahlTag(tag)}
                  aria-label={`${tagName(tag)} planen`}
                  className={cn(
                    "flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground",
                    istHeute && "border-primary/50 text-primary",
                  )}
                >
                  <Plus className="size-4" /> Planen
                </button>
              ) : (
                <ul className="space-y-2">
                  {eintraege.map((e) => (
                    <li key={e.id}>
                      <Eintrag
                        eintrag={e}
                        standard={standard}
                        schonAm={wiederholt.get(e.id)}
                        oeffnen={() => setMenue(e)}
                        abhaken={() => erledigtSetzen(db, e.id, !e.erledigt)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <Auswahl
        datum={auswahlTag}
        schliessen={() => setAuswahlTag(null)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
      />
      <EintragMenue
        eintrag={menue}
        schliessen={() => setMenue(null)}
        tage={tage}
        alle={kommend}
        standard={standard}
      />
      <AufDieListe
        offen={einkaufen}
        schliessen={() => setEinkaufen(false)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        posten={posten}
        beschreibung={`${woche.length} ${woche.length === 1 ? "Gericht" : "Gerichte"} bis ${tagName(wocheEnde)}, zusammengezählt.`}
      />
      <WocheFuellen
        offen={fuellen}
        schliessen={() => setFuellen(false)}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        leereTage={leereTage}
        geplant={alle.map((e) => ({
          id: e.id,
          tag: e.datum,
          rezeptId: e.rezept_id,
        }))}
      />
    </div>
  );
}

function Eintrag({
  eintrag: e,
  standard,
  schonAm,
  oeffnen,
  abhaken,
}: {
  eintrag: PlanEintrag;
  standard: number;
  schonAm: string | undefined;
  oeffnen: () => void;
  abhaken: () => void;
}) {
  const erledigt = Boolean(e.erledigt);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-card p-2 pr-3 shadow-xs",
        erledigt && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={oeffnen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {e.rezept_id ? (
          <RezeptBild
            url={e.bild_url}
            titel={e.titel}
            className="size-14 shrink-0 rounded-xl text-3xl"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl"
          >
            {e.titel.match(/rest/i)
              ? "♻️"
              : e.titel.match(/pizza/i)
                ? "🍕"
                : "🍽️"}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate font-semibold",
              erledigt && "line-through",
            )}
          >
            {e.titel}
          </span>
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {e.rezept_id
              ? `${e.portionen ?? standard} Portionen`
              : "ohne Rezept"}
            {erledigt && <span>✓ erledigt</span>}
            {schonAm && !erledigt && (
              <span className="rounded-full bg-amber-500/15 px-1.5 text-amber-700 dark:text-amber-300">
                🔁 schon am {wochentag(schonAm)}
              </span>
            )}
          </span>
        </span>
      </button>
      {e.rezept_id && e.rezept_da && !erledigt ? (
        <Button
          size="icon"
          variant="secondary"
          className="size-10 shrink-0 rounded-full"
          aria-label={`${e.titel} kochen`}
          onClick={() => {
            location.hash = `plan/${e.id}/kochen`;
          }}
        >
          <ChefHat />
        </Button>
      ) : (
        <Button
          size="icon"
          variant={erledigt ? "default" : "outline"}
          className="size-10 shrink-0 rounded-full"
          aria-label={
            erledigt ? `${e.titel} wieder offen` : `${e.titel} abhaken`
          }
          aria-pressed={erledigt}
          onClick={abhaken}
        >
          <Check />
        </Button>
      )}
    </div>
  );
}

/** Menü zu einem Eintrag: kochen, Rezept, Portionen, verschieben, tauschen, entfernen. */
function EintragMenue({
  eintrag,
  schliessen,
  tage,
  alle,
  standard,
}: {
  eintrag: PlanEintrag | null;
  schliessen: () => void;
  tage: string[];
  alle: PlanEintrag[];
  standard: number;
}) {
  const db = usePowerSync();
  const [modus, setModus] = useState<"aktionen" | "verschieben" | "tauschen">(
    "aktionen",
  );
  // Aktuellen Stand anzeigen (z. B. nach dem Ändern der Portionen).
  const e = eintrag ? (alle.find((a) => a.id === eintrag.id) ?? eintrag) : null;

  function zu() {
    setModus("aktionen");
    schliessen();
  }

  return (
    <Drawer open={e != null} onOpenChange={(o) => !o && zu()}>
      <DrawerContent>
        {e && (
          <div className="mx-auto w-full max-w-lg pb-6">
            <DrawerHeader>
              <DrawerTitle>{e.titel}</DrawerTitle>
              <DrawerDescription>
                {modus === "verschieben"
                  ? "Auf welchen Tag?"
                  : modus === "tauschen"
                    ? "Mit welchem Eintrag tauschen?"
                    : tagName(e.datum)}
              </DrawerDescription>
            </DrawerHeader>

            {modus === "aktionen" && (
              <div className="space-y-2 px-4">
                {e.rezept_id && e.rezept_da ? (
                  <>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-sm text-muted-foreground">
                        Portionen
                      </span>
                      <PortionenWahl
                        wert={e.portionen ?? standard}
                        aendern={(n) => portionenSetzen(db, e.id, n)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="h-11 rounded-full"
                        onClick={() => {
                          zu();
                          location.hash = `plan/${e.id}/kochen`;
                        }}
                      >
                        <ChefHat /> Kochen
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-11 rounded-full"
                        onClick={() => {
                          zu();
                          location.hash = `rezepte/${e.rezept_id}`;
                        }}
                      >
                        <BookOpen /> Rezept
                      </Button>
                    </div>
                  </>
                ) : null}
                <MenuePunkt onClick={() => setModus("verschieben")}>
                  <CalendarArrowUp /> Verschieben auf …
                </MenuePunkt>
                <MenuePunkt
                  onClick={() => setModus("tauschen")}
                  disabled={alle.length < 2}
                >
                  <ArrowLeftRight /> Tauschen mit …
                </MenuePunkt>
                <MenuePunkt
                  onClick={() => {
                    erledigtSetzen(db, e.id, !e.erledigt);
                    zu();
                  }}
                >
                  <Check />{" "}
                  {e.erledigt ? "Wieder offen" : "Als erledigt abhaken"}
                </MenuePunkt>
                <MenuePunkt
                  className="text-destructive"
                  onClick={async () => {
                    const wiederherstellen = await entfernen(db, e.id);
                    zu();
                    toast(`„${e.titel}“ aus dem Plan genommen`, {
                      action: {
                        label: "Rückgängig",
                        onClick: () => wiederherstellen(),
                      },
                    });
                  }}
                >
                  <Trash2 /> Entfernen
                </MenuePunkt>
              </div>
            )}

            {modus === "verschieben" && (
              <ul className="max-h-[55dvh] space-y-1 overflow-y-auto px-4">
                {tage
                  .filter((t) => t !== e.datum)
                  .map((t) => {
                    const dort = alle.filter((a) => a.datum === t);
                    return (
                      <li key={t}>
                        <button
                          type="button"
                          onClick={async () => {
                            await verschieben(db, e.id, t);
                            zu();
                            toast(`Verschoben auf ${tagName(t)}`);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left active:bg-muted"
                        >
                          <span className="w-24 shrink-0 font-medium">
                            {tagName(t)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                            {dort.length > 0
                              ? dort.map((a) => a.titel).join(", ")
                              : "noch frei"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}

            {modus === "tauschen" && (
              <ul className="max-h-[55dvh] space-y-1 overflow-y-auto px-4">
                {alle
                  .filter((a) => a.id !== e.id && a.datum !== e.datum)
                  .map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={async () => {
                          await tauschen(db, e, a);
                          zu();
                          toast(`Getauscht mit „${a.titel}“`);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left active:bg-muted"
                      >
                        <span className="w-24 shrink-0 font-medium">
                          {tagName(a.datum)}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {a.titel}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function MenuePunkt({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium active:bg-muted disabled:opacity-50 [&_svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}
