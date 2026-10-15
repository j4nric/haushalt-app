/**
 * Text eines PDF-Kassenbons auslesen – im Browser, der Bon verlässt das Gerät nicht.
 * pdf.js wird erst hier geladen (groß). eBons sind oft „verschlüsselt“ (nur gegen
 * Bearbeiten, ohne Passwort zum Lesen) – das kann pdf.js.
 * Ergebnis: eine Zeile je Textzeile, Textstücke von links nach rechts mit Tab getrennt.
 */
export async function bonZeilen(datei: Blob): Promise<string[]> {
  const [pdfjs, { default: worker }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const aufgabe = pdfjs.getDocument({
    data: new Uint8Array(await datei.arrayBuffer()),
  });
  const pdf = await aufgabe.promise;
  const zeilen: string[] = [];
  for (let s = 1; s <= pdf.numPages; s++) {
    const seite = await pdf.getPage(s);
    const { items } = await seite.getTextContent();
    const nachY = new Map<number, { x: number; text: string }[]>();
    for (const it of items) {
      if (!("str" in it) || !it.str.trim()) {
        continue;
      }
      // Leicht versetzte Stücke derselben Zeile zusammenfassen.
      const y = Math.round((it.transform[5] ?? 0) / 2) * 2;
      nachY.set(y, [
        ...(nachY.get(y) ?? []),
        { x: it.transform[4] ?? 0, text: it.str.trim() },
      ]);
    }
    for (const [, teile] of [...nachY].sort((a, b) => b[0] - a[0])) {
      zeilen.push(
        teile
          .sort((a, b) => a.x - b.x)
          .map((t) => t.text)
          .join("\t"),
      );
    }
  }
  await aufgabe.destroy();
  return zeilen;
}
