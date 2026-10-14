import { useStatus } from "@powersync/react";
import { cn } from "@/lib/utils";

/** Kleiner Hinweis oben rechts: online/offline und ob gerade hochgeladen wird. */
export function SyncStatus() {
  const status = useStatus();
  const online = status.connected;
  const text = online
    ? status.dataFlowStatus.uploading
      ? "Online · lädt hoch …"
      : "Online · synchron"
    : "Offline · Änderungen werden lokal gespeichert";
  return (
    <p
      data-testid="sync-status"
      title={text}
      className={cn(
        "flex max-w-[55%] items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-xs font-medium",
        online
          ? "bg-secondary text-secondary-foreground"
          : "bg-warning/20 text-warning-foreground",
      )}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          online ? "bg-primary" : "bg-warning",
        )}
      />
      <span className="truncate">{text}</span>
    </p>
  );
}
