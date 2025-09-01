import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import './responseInterceptor'; // Import to extend Response type

/**
 * Middleware factory for validating request data using Joi schemas
 * @param schema - Joi validation schema
 * @param target - What to validate ('body', 'query', 'params')
 * @returns Express middleware function
 */
export const validateSchema = (schema: Joi.Schema, target: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[target];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all validation errors, not just the first one
      stripUnknown: true // Remove properties not in the schema
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        message: detail.message,
        field: detail.path.join('.'),
        code: detail.type
      }));
      
      return res.validationError(validationErrors);
    }

    // Replace the original data with validated data
    req[target] = value;
    next();
  };
};

/**
 * Middleware for validating request body
 */
export const validateBody = (schema: Joi.Schema) => validateSchema(schema, 'body');

/**
 * Middleware for validating query parameters
 */
export const validateQuery = (schema: Joi.Schema) => validateSchema(schema, 'query');

/**
 * Middleware for validating URL parameters
 */
export const validateParams = (schema: Joi.Schema) => validateSchema(schema, 'params');
