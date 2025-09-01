import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ message: string; field: string }> = [];

    // Validate body
    if (schema.body && req.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            message: detail.message,
            field: detail.path.join('.')
          });
        });
      }
    }

    // Validate query parameters
    if (schema.query && req.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            message: detail.message,
            field: `query.${detail.path.join('.')}`
          });
        });
      }
    }

    // Validate path parameters
    if (schema.params && req.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            message: detail.message,
            field: `params.${detail.path.join('.')}`
          });
        });
      }
    }

    if (errors.length > 0) {
      return res.validationError(errors);
    }

    next();
  };
};
