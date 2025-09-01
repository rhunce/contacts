import Joi from 'joi';

export const createApiKeySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'API key name must be at least 1 character long',
    'string.max': 'API key name cannot exceed 100 characters',
    'any.required': 'API key name is required'
  }),
  permissions: Joi.object({
    read: Joi.boolean().default(true),
    write: Joi.boolean().default(false),
    delete: Joi.boolean().default(false)
  }).optional()
});

export const getApiKeysSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const apiKeyIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'API key ID is required'
  })
});
