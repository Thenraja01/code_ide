import { Router } from 'express';
import {
  createFile,
  getFiles,
  updateFile,
  deleteFile,
  moveFile
} from '../controllers/file.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, createFile);

router.get('/', authMiddleware, getFiles);

router.put('/:id', authMiddleware, updateFile);

router.delete('/:id', authMiddleware, deleteFile);

router.put('/move/:id', authMiddleware, moveFile);

export default router;
