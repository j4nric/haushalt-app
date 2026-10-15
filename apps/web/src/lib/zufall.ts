/** Gewichteter Zufall – für Glücksrad und „Woche füllen“. */

/** Ein Element, je höher `gewicht`, desto wahrscheinlicher. */
export function gewichtetZiehen<T extends { gewicht: number }>(
  liste: T[],
  zufall: () => number = Math.random,
): T | undefined {
  const summe = liste.reduce((s, k) => s + k.gewicht, 0);
  let wurf = zufall() * summe;
  for (const k of liste) {
    wurf -= k.gewicht;
    if (wurf < 0) {
      return k;
    }
  }
  return liste.at(-1);
}

/** Bis zu `anzahl` verschiedene Elemente, gewichtet, ohne Zurücklegen. */
export function ziehenOhneZuruecklegen<T extends { gewicht: number }>(
  liste: T[],
  anzahl: number,
  zufall: () => number = Math.random,
): T[] {
  const rest = [...liste];
  const gezogen: T[] = [];
  while (gezogen.length < anzahl && rest.length > 0) {
    const k = gewichtetZiehen(rest, zufall);
    if (!k) {
      break;
    }
    gezogen.push(k);
    rest.splice(rest.indexOf(k), 1);
  }
  return gezogen;
}
