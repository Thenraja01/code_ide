import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const googleSchema = Joi.object({
  idToken: Joi.string().required()
});

export const githubSchema = Joi.object({
  idToken: Joi.string().required()
});
