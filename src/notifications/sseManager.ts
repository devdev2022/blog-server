import { Response } from "express";

class SseManager {
  private clients = new Set<Response>();

  addClient(res: Response) {
    this.clients.add(res);
  }

  removeClient(res: Response) {
    this.clients.delete(res);
  }

  broadcast(event: string, data: unknown) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => client.write(payload));
  }
}

export const sseManager = new SseManager();
