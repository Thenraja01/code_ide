import { Router } from 'express';
import { updateProfile, sendOtp, verifyOTP, changePassword, linkGithub } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// PUT    /api/user/update         — Update profile (name, bio, avatar)
router.put('/update', authMiddleware, updateProfile);

// POST   /api/user/send-otp       — Send 6-digit OTP to email
router.post('/send-otp', authMiddleware, sendOtp);

// POST   /api/user/verify-otp    — Verify OTP
router.post('/verify-otp', authMiddleware, verifyOTP);

// POST   /api/user/change-password — Change password
router.post('/change-password', authMiddleware, changePassword);

// POST   /api/user/link-github    — Link GitHub to existing account
router.post('/link-github', authMiddleware, linkGithub);

export default router;
