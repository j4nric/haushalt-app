import { createServer, request, type Server } from "node:http";
import type { AddressInfo, Socket } from "node:net";

/**
 * Ein HTTP-Proxy pro simuliertem Gerät, dessen „Netz“ der Test kappen kann.
 *
 * Warum nicht `context.setOffline()`? PowerSync hält die Sync-Verbindung in einem
 * SharedWorker, und den erfasst Playwrights Offline-Emulation nicht. Läuft dagegen
 * der gesamte Verkehr eines Browsers über diesen Proxy, reißen beim Abschalten
 * wirklich alle Verbindungen ab, wie bei einem Funkloch.
 */
export class Netzwerk {
  private online = true;
  private readonly sockets = new Set<Socket>();
  private readonly server: Server;

  private constructor() {
    this.server = createServer((req, res) => {
      if (!this.online || !req.url) {
        req.socket.destroy();
        return;
      }
      const weiter = request(
        req.url,
        { method: req.method, headers: req.headers },
        (antwort) => {
          res.writeHead(antwort.statusCode ?? 502, antwort.headers);
          antwort.pipe(res);
        },
      );
      weiter.on("error", () => res.destroy());
      req.pipe(weiter);
    });
    this.server.on("connection", (socket) => {
      if (!this.online) {
        socket.destroy();
        return;
      }
      this.sockets.add(socket);
      socket.on("close", () => this.sockets.delete(socket));
    });
  }

  static async starten(): Promise<Netzwerk> {
    const netz = new Netzwerk();
    await new Promise<void>((fertig) =>
      netz.server.listen(0, "127.0.0.1", fertig),
    );
    return netz;
  }

  /** Für `browserType.launch({ proxy })`. `<-loopback>` leitet auch localhost über den Proxy. */
  get proxy() {
    const { port } = this.server.address() as AddressInfo;
    return { server: `http://127.0.0.1:${port}`, bypass: "<-loopback>" };
  }

  offline() {
    this.online = false;
    for (const socket of this.sockets) {
      socket.destroy();
    }
  }

  wiederOnline() {
    this.online = true;
  }

  async beenden() {
    this.offline();
    await new Promise((fertig) => this.server.close(fertig));
  }
}
