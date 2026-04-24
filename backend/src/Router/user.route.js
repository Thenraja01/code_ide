import { Router } from 'express';
import { updateProfile, verifyOTP, changePassword } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// PUT    /api/user/update         — Update user profile
router.put('/update', authMiddleware, updateProfile);

// POST   /api/user/change-password — Change password
router.post('/change-password', authMiddleware, changePassword);

// POST   /api/user/verify-otp    — Verify OTP
router.post('/verify-otp', authMiddleware, verifyOTP);

export default router;
