import { useEffect, useState } from "react";

export type Ansicht = "liste" | "vorrat";

function lesen(): Ansicht {
  return location.hash === "#vorrat" ? "vorrat" : "liste";
}

/** Aktuelle Ansicht, gespiegelt in der Adresse (#vorrat), damit Zurück und Neuladen funktionieren. */
export function useAnsicht(): [Ansicht, (a: Ansicht) => void] {
  const [ansicht, setAnsicht] = useState<Ansicht>(lesen);

  useEffect(() => {
    const aktualisieren = () => setAnsicht(lesen());
    window.addEventListener("hashchange", aktualisieren);
    return () => window.removeEventListener("hashchange", aktualisieren);
  }, []);

  return [
    ansicht,
    (a) => {
      location.hash = a === "vorrat" ? "vorrat" : "";
    },
  ];
}

export function Navigation({
  ansicht,
  wechseln,
}: {
  ansicht: Ansicht;
  wechseln: (a: Ansicht) => void;
}) {
  return (
    <nav className="tabs" aria-label="Bereiche">
      <button
        type="button"
        aria-current={ansicht === "liste" ? "page" : undefined}
        onClick={() => wechseln("liste")}
      >
        Einkaufsliste
      </button>
      <button
        type="button"
        aria-current={ansicht === "vorrat" ? "page" : undefined}
        onClick={() => wechseln("vorrat")}
      >
        Vorrat
      </button>
    </nav>
  );
}
