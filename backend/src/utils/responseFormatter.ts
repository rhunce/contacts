import { ErrorType } from '../types';

export interface ApiResponse<T = any> {
  status: number;
  data: T | null;
  errors: Array<{
    type?: ErrorType;
    message: string;
    field?: string;
    code?: string;
  }>;
}

export interface PaginatedApiResponse<T = any> {
  status: number;
  data: {
    items: T[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  } | null;
  errors: Array<{
    type?: ErrorType;
    message: string;
    field?: string;
    code?: string;
  }>;
}

export class ResponseFormatter {
  static success<T>(data: T, status: number = 200): ApiResponse<T> {
    return {
      status,
      data,
      errors: []
    };
  }

  static error(message: string, status: number = 500, field?: string, code?: string, type?: ErrorType): ApiResponse<null> {
    return {
      status,
      data: null,
      errors: [{
        type,
        message,
        field,
        code
      }]
    };
  }

  static validationError(errors: Array<{ type?: ErrorType; message: string; field?: string; code?: string }>): ApiResponse<null> {
    return {
      status: 422,
      data: null,
      errors
    };
  }

  static notFound(message: string = 'Resource not found'): ApiResponse<null> {
    return this.error(message, 404, undefined, 'NOT_FOUND');
  }

  static unauthorized(message: string = 'Authentication required'): ApiResponse<null> {
    return this.error(message, 401, undefined, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Access denied'): ApiResponse<null> {
    return this.error(message, 403, undefined, 'FORBIDDEN');
  }

  static conflict(message: string, field?: string): ApiResponse<null> {
    return this.error(message, 409, field, 'CONFLICT');
  }

  static appError(error: any): ApiResponse<null> {
    // Handle AppError instances
    if (error?.type && error?.message) {
      const status = this.getStatusForErrorType(error.type);
      return this.error(error.message, status, error.field, error.code, error.type);
    }
    
    // Fallback for regular errors
    return this.error(error?.message || 'An unexpected error occurred', 500);
  }

  private static getStatusForErrorType(type: ErrorType): number {
    switch (type) {
      case ErrorType.USER_LIMIT_REACHED:
      case ErrorType.CONTACT_LIMIT_REACHED:
        return 429; // Too Many Requests
      case ErrorType.DUPLICATE_EMAIL:
        return 409; // Conflict
      case ErrorType.VALIDATION_ERROR:
        return 400; // Bad Request
      case ErrorType.UNAUTHORIZED:
        return 401; // Unauthorized
      case ErrorType.NOT_FOUND:
        return 404; // Not Found
      case ErrorType.TIMEOUT_ERROR:
        return 408; // Request Timeout
      default:
        return 500; // Internal Server Error
    }
  }

  static paginated<T>(
    items: T[],
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    },
    status: number = 200
  ): PaginatedApiResponse<T> {
    return {
      status,
      data: {
        items,
        pagination
      },
      errors: []
    };
  }
}
