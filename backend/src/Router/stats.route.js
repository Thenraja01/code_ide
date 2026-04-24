import { Router } from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/stats.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// GET    /api/stats               — Get dashboard statistics
router.get('/', authMiddleware, getDashboardStats);

// GET    /api/stats/activity      — Get recent activity feed
router.get('/activity', authMiddleware, getRecentActivity);

export default router;
