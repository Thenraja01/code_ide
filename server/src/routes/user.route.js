const express = require('express');
const router = express.Router();
const { updateProfile, verifyOTP, changePassword } = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.put('/update', authMiddleware, updateProfile);
router.post('/verify-otp', authMiddleware, verifyOTP);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
