import Joi from 'joi';

export const externalContactSchemas = {
  getContactByExternalId: {
    params: Joi.object({
      externalId: Joi.string().min(1).max(100).required().messages({
        'string.min': 'External ID must not be empty',
        'string.max': 'External ID must be less than 100 characters',
        'any.required': 'External ID is required'
      })
    })
  },

  updateContactByExternalId: {
    params: Joi.object({
      externalId: Joi.string().min(1).max(100).required().messages({
        'string.min': 'External ID must not be empty',
        'string.max': 'External ID must be less than 100 characters',
        'any.required': 'External ID is required'
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

  createContactWithExternalId: {
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
      }),
      externalId: Joi.string().min(1).max(100).required().messages({
        'string.min': 'External ID must not be empty',
        'string.max': 'External ID must be less than 100 characters',
        'any.required': 'External ID is required for external contact creation'
      })
    })
  },

  deleteContactByExternalId: {
    params: Joi.object({
      externalId: Joi.string().min(1).max(100).required().messages({
        'string.min': 'External ID must not be empty',
        'string.max': 'External ID must be less than 100 characters',
        'any.required': 'External ID is required'
      })
    })
  }
};
