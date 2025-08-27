import { Request, Response, NextFunction } from 'express';
import { ResponseFormatter } from '../utils/responseFormatter';

// Extend Response interface to add custom methods
declare global {
  namespace Express {
    interface Response {
      success: (data: any, status?: number) => void;
      error: (message: string, status?: number, field?: string, code?: string) => void;
      validationError: (errors: Array<{ message: string; field?: string; code?: string }>) => void;
      notFound: (message?: string) => void;
      unauthorized: (message?: string) => void;
      forbidden: (message?: string) => void;
      conflict: (message: string, field?: string) => void;
      paginated: (items: any[], pagination: any, status?: number) => void;
    }
  }
}

export const responseInterceptor = (req: Request, res: Response, next: NextFunction) => {
  // Add custom response methods
  res.success = (data: any, status: number = 200) => {
    const response = ResponseFormatter.success(data, status);
    res.status(response.status).json(response);
  };

  res.error = (message: string, status: number = 500, field?: string, code?: string) => {
    const response = ResponseFormatter.error(message, status, field, code);
    res.status(response.status).json(response);
  };

  res.validationError = (errors: Array<{ message: string; field?: string; code?: string }>) => {
    const response = ResponseFormatter.validationError(errors);
    res.status(response.status).json(response);
  };

  res.notFound = (message: string = 'Resource not found') => {
    const response = ResponseFormatter.notFound(message);
    res.status(response.status).json(response);
  };

  res.unauthorized = (message: string = 'Authentication required') => {
    const response = ResponseFormatter.unauthorized(message);
    res.status(response.status).json(response);
  };

  res.forbidden = (message: string = 'Access denied') => {
    const response = ResponseFormatter.forbidden(message);
    res.status(response.status).json(response);
  };

  res.conflict = (message: string, field?: string) => {
    const response = ResponseFormatter.conflict(message, field);
    res.status(response.status).json(response);
  };

  res.paginated = (items: any[], pagination: any, status: number = 200) => {
    const response = ResponseFormatter.paginated(items, pagination, status);
    res.status(response.status).json(response);
  };

  next();
};
