import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  initializeProject,
  toggleStarProject
} from '../controllers/project.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// GET    /api/projects              — List all projects (supports ?limit &page)
router.get('/', authMiddleware, getProjects);

// GET    /api/projects/:id          — Get a single project by ID
router.get('/:id', authMiddleware, getProjectById);

// POST   /api/projects              — Create a new project
router.post('/', authMiddleware, createProject);

// DELETE /api/projects/:id          — Delete a project
router.delete('/:id', authMiddleware, deleteProject);

// POST   /api/projects/:id/initialize — Initialize project scaffolding
router.post('/:id/initialize', authMiddleware, initializeProject);

// PATCH  /api/projects/:id/star     — Toggle star on a project
router.patch('/:id/star', authMiddleware, toggleStarProject);

export default router;
