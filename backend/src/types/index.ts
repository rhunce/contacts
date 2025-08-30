import { Request } from 'express';
import { Session } from 'express-session';

export interface AuthenticatedRequest extends Request {
  userId?: string;
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

// Structured error types
export enum ErrorType {
  USER_LIMIT_REACHED = 'USER_LIMIT_REACHED',
  CONTACT_LIMIT_REACHED = 'CONTACT_LIMIT_REACHED',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  field?: string;
  code?: string;
}

// Note: Most request/response types have been moved to DTOs
// Only keeping Express-specific types here

export interface ContactHistoryChange {
  before: string;
  after: string;
}
