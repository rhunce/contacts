import { ErrorType, AppError } from '../types';

export class AppErrorClass extends Error {
  public type: ErrorType;
  public field?: string;
  public code?: string;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'AppError';
    this.type = error.type;
    this.field = error.field;
    this.code = error.code;
  }

  static userLimitReached(maxUsers: number = 50): AppErrorClass {
    return new AppErrorClass({
      type: ErrorType.USER_LIMIT_REACHED,
      message: `Maximum number of users reached (${maxUsers}). Registration is temporarily disabled.`
    });
  }

  static contactLimitReached(maxContacts: number = 50): AppErrorClass {
    return new AppErrorClass({
      type: ErrorType.CONTACT_LIMIT_REACHED,
      message: `Maximum number of contacts reached (${maxContacts}). Please delete some contacts before adding new ones.`
    });
  }

  static duplicateEmail(field: string = 'email'): AppErrorClass {
    return new AppErrorClass({
      type: ErrorType.DUPLICATE_EMAIL,
      message: 'You already have a contact with this email address',
      field
    });
  }

  static validationError(message: string, field?: string): AppErrorClass {
    return new AppErrorClass({
      type: ErrorType.VALIDATION_ERROR,
      message,
      field
    });
  }

  static timeoutError(): AppErrorClass {
    return new AppErrorClass({
      type: ErrorType.TIMEOUT_ERROR,
      message: 'Request timed out. The server is processing your request, but it may take longer than expected. Please try again.'
    });
  }

  static notFound(message: string = 'Resource not found'): AppErrorClass {
    return new AppErrorClass({
      type: ErrorType.NOT_FOUND,
      message
    });
  }
}
