import Joi from 'joi';

export const authSchemas = {
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().min(4).required().messages({
        'string.min': 'Password must be at least 4 characters long',
        'any.required': 'Password is required'
      }),
      firstName: Joi.string().min(1).max(50).required().messages({
        'string.min': 'First name is required',
        'string.max': 'First name must be less than 50 characters',
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().min(1).max(50).required().messages({
        'string.min': 'Last name is required',
        'string.max': 'Last name must be less than 50 characters',
        'any.required': 'Last name is required'
      })
    })
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().required().messages({
        'any.required': 'Password is required'
      })
    })
  }
};
