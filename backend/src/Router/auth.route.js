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

const router = Router();

// POST   /api/auth/register     — Register a new user
router.post('/register', register);

// POST   /api/auth/login        — Login with email & password
router.post('/login', login);

// POST   /api/auth/google       — Google OAuth sign-in
router.post('/google', googleAuth);

// POST   /api/auth/github       — GitHub OAuth sign-in
router.post('/github', githubAuth);

// GET    /api/auth/users        — List all users (protected)
router.get('/users', authMiddleware, getUsers);

// GET    /api/auth/me           — Get current authenticated user
router.get('/me', authMiddleware, getMe);

export default router;
