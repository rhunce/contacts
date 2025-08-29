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

export interface ApiErrorResponse {
  status: number;
  data: {
    type?: ErrorType;
    message: string;
    field?: string;
    code?: string;
  };
}
