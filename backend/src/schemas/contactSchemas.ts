import Joi from 'joi';

export const createContactSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'First name must be at least 1 character long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Last name must be at least 1 character long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().optional()
});

export const updateContactSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional().messages({
    'string.min': 'First name must be at least 1 character long',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().min(1).max(50).optional().messages({
    'string.min': 'Last name must be at least 1 character long',
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  phone: Joi.string().optional()
});

export const getContactsSchema = Joi.object({
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
  }),
  filter: Joi.string().optional()
});

export const contactIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Contact ID is required'
  })
});
