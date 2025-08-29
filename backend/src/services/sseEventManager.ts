import { Response } from 'express';
import { CustomSession } from '../types';

interface SSEClient {
  userId: string;
  response: Response;
}

export class SSEEventManager {
  private static instance: SSEEventManager;
  private clients: Map<string, SSEClient[]> = new Map();

  private constructor() {}

  static getInstance(): SSEEventManager {
    if (!SSEEventManager.instance) {
      SSEEventManager.instance = new SSEEventManager();
    }
    return SSEEventManager.instance;
  }

  addClient(userId: string, response: Response): void {
    // Set SSE headers
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3001',
      'Access-Control-Allow-Credentials': 'true',
    });

    // Send initial connection message
    response.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

    // Store client
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push({ userId, response });

    // Handle client disconnect
    response.on('close', () => {
      this.removeClient(userId, response);
    });

    response.on('error', () => {
      this.removeClient(userId, response);
    });
  }

  removeClient(userId: string, response: Response): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.findIndex(client => client.response === response);
      if (index > -1) {
        userClients.splice(index, 1);
        if (userClients.length === 0) {
          this.clients.delete(userId);
        }
      }
    }
  }

  emitToUser(userId: string, eventType: string, data: any): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify({ type: eventType, data });
      userClients.forEach(client => {
        try {
          client.response.write(`data: ${message}\n\n`);
        } catch (error) {
          // Remove disconnected client
          this.removeClient(userId, client.response);
        }
      });
    }
  }

  emitContactCreated(userId: string, contact: any): void {
    this.emitToUser(userId, 'contact:created', contact);
  }

  emitContactUpdated(userId: string, contact: any): void {
    this.emitToUser(userId, 'contact:updated', contact);
  }

  emitContactDeleted(userId: string, contactId: string): void {
    this.emitToUser(userId, 'contact:deleted', { id: contactId });
  }

  getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  getClientCount(userId: string): number {
    return this.clients.get(userId)?.length || 0;
  }
}
