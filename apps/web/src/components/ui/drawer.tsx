import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

/**
 * vaul zieht nur am Griff (`handleOnly`): Auf dem iPhone hielt es Scrollen im Inhalt
 * sonst mitunter für „nach unten wegwischen“ – der Drawer schloss sich mitten im
 * Lesen. Im übrigen Fenster schließt eine eigene, strengere Geste (siehe
 * `useWegwischen`): nur nach unten, nur wenn der Inhalt ganz oben steht.
 */
function Drawer({
  handleOnly = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      handleOnly={handleOnly}
      {...props}
    />
  );
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

/** Ab dieser Strecke (px) oder mit Schwung schließt das Fenster beim Loslassen. */
const SCHLIESSEN_AB = 120;
const SCHWUNG = 0.6; // px/ms
const ENTSCHEIDEN_AB = 8;

/** Liegt alles zwischen Finger und Fenster ganz oben (nichts nach oben zu scrollen)? */
function ganzOben(ziel: EventTarget | null, fenster: HTMLElement): boolean {
  for (
    let el = ziel instanceof Element ? ziel : null;
    el && fenster.contains(el);
    el = el.parentElement
  ) {
    if (el.scrollTop > 0) {
      return false;
    }
  }
  return true;
}

/**
 * Nach unten wischen schließt das Fenster – an jeder Stelle, nicht nur am Griff.
 * Die Geste gehört dem Scrollen, sobald der Inhalt nicht ganz oben steht, der Finger
 * zuerst nach oben oder seitwärts geht (Wischzeilen, Chips) oder ein Schieberegler
 * berührt wird. Erst wenn klar nach unten gezogen wird, folgt das Fenster dem Finger.
 */
function useWegwischen(
  el: HTMLElement | null,
  schliessen: React.RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!el) {
      return;
    }
    let start: { x: number; y: number; zeit: number; oben: boolean } | null =
      null;
    let zustand: "offen" | "ziehen" | "aus" = "aus";
    let strecke = 0;

    const zuruecksetzen = () => {
      el.style.transition = "transform 0.2s cubic-bezier(0.32, 0.72, 0, 1)";
      el.style.transform = "translate3d(0, 0, 0)";
      setTimeout(() => {
        el.style.transition = "";
        el.style.transform = "";
      }, 220);
    };

    const beginn = (e: TouchEvent) => {
      const finger = e.touches[0];
      const ziel = e.target as Element | null;
      if (
        e.touches.length !== 1 ||
        !finger ||
        ziel?.closest(
          '[data-vaul-handle], input[type="range"], [data-kein-wegwischen]',
        )
      ) {
        zustand = "aus";
        return;
      }
      start = {
        x: finger.clientX,
        y: finger.clientY,
        zeit: performance.now(),
        oben: ganzOben(ziel, el),
      };
      zustand = "offen";
      strecke = 0;
    };

    const bewegen = (e: TouchEvent) => {
      const finger = e.touches[0];
      if (!start || !finger || zustand === "aus") {
        return;
      }
      const dx = finger.clientX - start.x;
      const dy = finger.clientY - start.y;
      if (zustand === "offen") {
        if (Math.abs(dx) > ENTSCHEIDEN_AB && Math.abs(dx) > Math.abs(dy)) {
          zustand = "aus";
        } else if (dy < -ENTSCHEIDEN_AB / 2 || (dy > 0 && !start.oben)) {
          zustand = "aus";
        } else if (dy > ENTSCHEIDEN_AB) {
          zustand = "ziehen";
          start = { ...start, y: finger.clientY };
        }
        return;
      }
      e.preventDefault();
      strecke = Math.max(0, dy);
      el.style.transition = "none";
      el.style.transform = `translate3d(0, ${strecke}px, 0)`;
    };

    const ende = () => {
      if (zustand === "ziehen" && start) {
        const schwung = strecke / Math.max(1, performance.now() - start.zeit);
        if (strecke > SCHLIESSEN_AB || (schwung > SCHWUNG && strecke > 40)) {
          // vaul fährt das Fenster von hier aus weiter nach unten.
          el.style.transition = "";
          schliessen.current?.click();
        } else {
          zuruecksetzen();
        }
      }
      zustand = "aus";
      start = null;
    };

    el.addEventListener("touchstart", beginn, { passive: true });
    el.addEventListener("touchmove", bewegen, { passive: false });
    el.addEventListener("touchend", ende);
    el.addEventListener("touchcancel", ende);
    return () => {
      el.removeEventListener("touchstart", beginn);
      el.removeEventListener("touchmove", bewegen);
      el.removeEventListener("touchend", ende);
      el.removeEventListener("touchcancel", ende);
    };
  }, [el, schliessen]);
}

function DrawerContent({
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  // Der Inhalt wird erst beim Öffnen eingehängt – deshalb als State, nicht als Ref.
  const [fenster, setFenster] = useState<HTMLDivElement | null>(null);
  const schliessen = useRef<HTMLButtonElement | null>(null);
  useWegwischen(fenster, schliessen);
  // Stabil halten: Eine neue Ref-Funktion je Render hängte das Element jedes Mal neu ein.
  const refSetzen = useCallback(
    (knoten: HTMLDivElement | null) => {
      setFenster(knoten);
      if (typeof ref === "function") {
        ref(knoten);
      } else if (ref) {
        ref.current = knoten;
      }
    },
    [ref],
  );
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        ref={refSetzen}
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-background",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        <DrawerPrimitive.Handle
          preventCycle
          aria-label="Zum Schließen nach unten ziehen"
          className="mx-auto mt-4 hidden !h-2 !w-[100px] shrink-0 !rounded-full !bg-muted !opacity-100 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
        />
        <DrawerPrimitive.Close
          ref={schliessen}
          tabIndex={-1}
          aria-hidden
          className="hidden"
        />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
