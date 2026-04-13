const Joi = require('joi');
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match'
    })
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
const googleSchema = Joi.object({
  idToken: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  googleSchema
};
