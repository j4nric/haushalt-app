/**
 * Erzeugt ein kleines PDF im Stil eines REWE-eBons (Name links, Preis rechts) –
 * für Tests, ohne echten Bon. Standardschrift Helvetica, eine Seite.
 */
export function bonPdf(zeilen: [string, string?][]): Buffer {
  const maskieren = (t: string) => t.replace(/[\\()]/g, (z) => `\\${z}`);
  const inhalt = zeilen
    .map(([links, rechts], i) => {
      const y = 800 - i * 14;
      return [
        `BT /F1 9 Tf 20 ${y} Td (${maskieren(links)}) Tj ET`,
        rechts ? `BT /F1 9 Tf 218 ${y} Td (${maskieren(rechts)}) Tj ET` : "",
      ].join("\n");
    })
    .join("\n");
  const objekte = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(inhalt, "latin1")} >>\nstream\n${inhalt}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const versatz: number[] = [];
  objekte.forEach((o, i) => {
    versatz.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objekte.length + 1}\n0000000000 65535 f \n`;
  for (const v of versatz) {
    pdf += `${String(v).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objekte.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}
