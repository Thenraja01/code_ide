const router = require('express').Router();
const authController = require('../../authentication/layers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.google);

module.exports = router;
