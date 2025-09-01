import Joi from 'joi';

export const contactHistorySchemas = {
  getContactHistory: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.guid': 'Contact ID must be a valid UUID',
        'any.required': 'Contact ID is required'
      })
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
      pageSize: Joi.number().integer().min(1).max(100).default(20).messages({
        'number.base': 'Page size must be a number',
        'number.integer': 'Page size must be an integer',
        'number.min': 'Page size must be at least 1',
        'number.max': 'Page size must be at most 100'
      }),
      order: Joi.string().valid('asc', 'desc').default('desc').messages({
        'string.valid': 'Order must be either "asc" or "desc"'
      })
    })
  }
};
