import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  githubAuth,
  getUsers,
  getMe
} from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/auth.validate.js';
import {
  registerSchema,
  loginSchema,
  googleSchema,
  githubSchema
} from '../middlewares/auth.validator.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Stricter rate-limiting specifically for authentication endpoints
const authLimiter = rateLimit({
  max: 20, 
  windowMs: 15 * 60 * 1000,
  message: { error: 'Too many authentication attempts from this IP, please try again in 15 minutes!' }
});

// POST   /api/auth/register     — Register a new user
router.post('/register', authLimiter, validate(registerSchema), register);

// POST   /api/auth/login        — Login with email & password
router.post('/login', authLimiter, validate(loginSchema), login);

// POST   /api/auth/google       — Google OAuth sign-in
router.post('/google', authLimiter, validate(googleSchema), googleAuth);

// POST   /api/auth/github       — GitHub OAuth sign-in
router.post('/github', authLimiter, validate(githubSchema), githubAuth);

// GET    /api/auth/users        — List all users (protected)
router.get('/users', authMiddleware, getUsers);

// GET    /api/auth/me           — Get current authenticated user
router.get('/me', authMiddleware, getMe);

export default router;
