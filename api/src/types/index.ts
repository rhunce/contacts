import { Request } from 'express';
import { Session } from 'express-session';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CustomSession extends Session {
  userId?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Note: Most request/response types have been moved to DTOs
// Only keeping Express-specific types here

export interface ContactHistoryChange {
  before: string;
  after: string;
}
