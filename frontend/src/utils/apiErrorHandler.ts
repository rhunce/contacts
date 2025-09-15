import { ErrorType } from '@/types/errors';

export interface ApiError {
  status: number;
  message: string;
  field?: string;
  code?: string;
  type?: ErrorType;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Array<{
    message: string;
    field?: string;
    code?: string;
    type?: ErrorType;
  }>;
}

/**
 * Centralized error handler for API responses
 * Provides consistent error handling across all services
 */
export class ApiErrorHandler {
  /**
   * Extract the most meaningful error message from an API error response
   */
  static extractErrorMessage(error: any): string {
    // Handle network/timeout errors
    if (error?.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }

    // Handle structured API errors
    if (error?.response?.data) {
      const response = error.response.data as ApiErrorResponse;
      
      // Check for structured errors array first (our backend format)
      if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
        const errorMessages = response.errors.map(err => err.message);
        return errorMessages.length === 1 ? errorMessages[0] : errorMessages.join(', ');
      }
      
      // Fall back to direct message
      if (response.message) {
        return response.message;
      }
    }

    // Handle generic errors
    if (error?.message) {
      return error.message;
    }

    // Ultimate fallback
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Handle specific HTTP status codes with custom messages
   */
  static handleStatusSpecificErrors(error: any, customMessages: Record<number, string> = {}): string {
    const status = error?.response?.status;
    
    if (status && customMessages[status]) {
      return customMessages[status];
    }

    // Default status-specific messages
    const defaultMessages: Record<number, string> = {
      400: 'Bad request. Please check your input and try again.',
      401: 'Authentication required. Please log in again.',
      403: 'Access denied. You do not have permission to perform this action.',
      404: 'Resource not found.',
      409: 'A conflict occurred. Please check your input and try again.',
      422: 'Validation error. Please check your input and try again.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
      504: 'Request timeout. Please try again later.',
    };

    return defaultMessages[status] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Create a standardized error object
   */
  static createError(error: any, customMessages: Record<number, string> = {}): Error {
    const message = this.extractErrorMessage(error) || this.handleStatusSpecificErrors(error, customMessages);
    return new Error(message);
  }
}
