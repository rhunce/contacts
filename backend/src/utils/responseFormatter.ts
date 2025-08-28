export interface ApiResponse<T = any> {
  status: number;
  data: T | null;
  errors: Array<{
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

  static error(message: string, status: number = 500, field?: string, code?: string): ApiResponse<null> {
    return {
      status,
      data: null,
      errors: [{
        message,
        field,
        code
      }]
    };
  }

  static validationError(errors: Array<{ message: string; field?: string; code?: string }>): ApiResponse<null> {
    return {
      status: 400,
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
