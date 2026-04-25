import { Router } from 'express';
import { runCode, getRuntimes } from '../controllers/execute.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/run', authMiddleware, runCode);
router.get('/runtimes', getRuntimes);

export default router;
