import { Router } from 'express';
import { createRepository, pushToGithub } from '../controllers/github.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// POST   /api/github/repo         — Create a new GitHub repository
router.post('/repo', authMiddleware, createRepository);

// POST   /api/github/push         — Push project files to GitHub
router.post('/push', authMiddleware, pushToGithub);

export default router;
