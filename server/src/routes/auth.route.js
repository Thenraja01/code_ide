const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/auth.validate');
const { registerSchema, loginSchema, googleSchema } = require('../middlewares/auth.validator');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', validate(googleSchema), authController.google);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;

