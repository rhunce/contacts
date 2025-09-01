import Joi from 'joi';

export const contactSchemas = {
  getContacts: {
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
      filter: Joi.string().optional().allow('').max(100).messages({
        'string.max': 'Filter must be less than 100 characters'
      })
    })
  },
  getContact: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.guid': 'Contact ID must be a valid UUID',
        'any.required': 'Contact ID is required'
      })
    })
  },
  createContact: {
    body: Joi.object({
      firstName: Joi.string().min(1).max(50).required().messages({
        'string.min': 'First name is required',
        'string.max': 'First name must be less than 50 characters',
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().min(1).max(50).required().messages({
        'string.min': 'Last name is required',
        'string.max': 'Last name must be less than 50 characters',
        'any.required': 'Last name is required'
      }),
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      phone: Joi.string().min(1).max(20).required().messages({
        'string.min': 'Phone number is required',
        'string.max': 'Phone number must be less than 20 characters',
        'any.required': 'Phone number is required'
      })
    })
  },
  updateContact: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.guid': 'Contact ID must be a valid UUID',
        'any.required': 'Contact ID is required'
      })
    }),
    body: Joi.object({
      firstName: Joi.string().min(1).max(50).optional().messages({
        'string.min': 'First name must not be empty',
        'string.max': 'First name must be less than 50 characters'
      }),
      lastName: Joi.string().min(1).max(50).optional().messages({
        'string.min': 'Last name must not be empty',
        'string.max': 'Last name must be less than 50 characters'
      }),
      email: Joi.string().email().optional().messages({
        'string.email': 'Please provide a valid email address'
      }),
      phone: Joi.string().min(1).max(20).optional().messages({
        'string.min': 'Phone number must not be empty',
        'string.max': 'Phone number must be less than 20 characters'
      })
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    })
  },
  deleteContact: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.guid': 'Contact ID must be a valid UUID',
        'any.required': 'Contact ID is required'
      })
    })
  }
};
