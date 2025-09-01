import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middleware/validation';
import { createMockRequest, createMockResponse } from '../utils/testUtils';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = jest.fn();
  });

  describe('validateRequest', () => {
    it('should call next() when validation passes', () => {
      // Arrange
      const schema = {
        body: {
          validate: jest.fn().mockReturnValue({ error: null }),
        },
      };

      // Act
      validateRequest(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return validation error when body validation fails', () => {
      // Arrange
      const validationError = {
        details: [
          { message: 'Email is required', path: ['email'] },
          { message: 'Password is required', path: ['password'] },
        ],
      };

      const schema = {
        body: {
          validate: jest.fn().mockReturnValue({ error: validationError }),
        },
      };

      // Act
      validateRequest(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.validationError).toHaveBeenCalledWith([
        { message: 'Email is required', field: 'email' },
        { message: 'Password is required', field: 'password' },
      ]);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return validation error when query validation fails', () => {
      // Arrange
      const validationError = {
        details: [
          { message: 'Page must be a number', path: ['page'] },
        ],
      };

      const schema = {
        query: {
          validate: jest.fn().mockReturnValue({ error: validationError }),
        },
      };

      mockRequest.query = { page: 'invalid' };

      // Act
      validateRequest(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.validationError).toHaveBeenCalledWith([
        { message: 'Page must be a number', field: 'query.page' },
      ]);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return validation error when params validation fails', () => {
      // Arrange
      const validationError = {
        details: [
          { message: 'Contact ID must be a valid UUID', path: ['id'] },
        ],
      };

      const schema = {
        params: {
          validate: jest.fn().mockReturnValue({ error: validationError }),
        },
      };

      mockRequest.params = { id: 'invalid-uuid' };

      // Act
      validateRequest(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.validationError).toHaveBeenCalledWith([
        { message: 'Contact ID must be a valid UUID', field: 'params.id' },
      ]);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle multiple validation errors across different schemas', () => {
      // Arrange
      const bodyError = {
        details: [
          { message: 'Email is required', path: ['email'] },
        ],
      };

      const queryError = {
        details: [
          { message: 'Page size must be a number', path: ['pageSize'] },
        ],
      };

      const schema = {
        body: {
          validate: jest.fn().mockReturnValue({ error: bodyError }),
        },
        query: {
          validate: jest.fn().mockReturnValue({ error: queryError }),
        },
      };

      mockRequest.body = { email: '' };
      mockRequest.query = { pageSize: 'invalid' };

      // Act
      validateRequest(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.validationError).toHaveBeenCalledWith([
        { message: 'Email is required', field: 'email' },
        { message: 'Page size must be a number', field: 'query.pageSize' },
      ]);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() when no validation schemas provided', () => {
      // Arrange
      const schema = {};

      // Act
      validateRequest(schema as any)(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
