import { useStatus } from "@powersync/react";

export function SyncStatus() {
  const status = useStatus();
  const text = status.connected
    ? status.dataFlowStatus.uploading
      ? "Online · lädt hoch …"
      : "Online · synchron"
    : "Offline · Änderungen werden lokal gespeichert";
  return (
    <p
      className={`status ${status.connected ? "online" : "offline"}`}
      data-testid="sync-status"
    >
      {text}
    </p>
  );
}
