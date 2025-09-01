import Joi from 'joi';

export const apiKeySchemas = {
  getUserApiKeys: {
    // No validation needed for GET request
  },
  
  createApiKey: {
    body: Joi.object({
      name: Joi.string().min(1).max(100).required().messages({
        'string.min': 'API key name is required',
        'string.max': 'API key name must be less than 100 characters',
        'any.required': 'API key name is required'
      }),
      expiresAt: Joi.date().optional().greater('now').messages({
        'date.greater': 'Expiration date must be in the future'
      })
    })
  },
  
  revokeApiKey: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.guid': 'API key ID must be a valid UUID',
        'any.required': 'API key ID is required'
      })
    })
  },
  
  restoreApiKey: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.guid': 'API key ID must be a valid UUID',
        'any.required': 'API key ID is required'
      })
    })
  },
  
  deleteApiKey: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.guid': 'API key ID must be a valid UUID',
        'any.required': 'API key ID is required'
      })
    })
  }
};
