import { Router } from 'express';
import aiController from '../controllers/ai.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { inngest } from '../inngest/client.js';
import { extractUrlContent } from '../services/ScraperService.js';
import { abortJob } from '../services/AiService.js';

const router = Router();

router.post('/code', authMiddleware, aiController.askAi);
router.post('/generate', authMiddleware, aiController.generateCode);
router.post('/autocomplete', authMiddleware, aiController.autocompleteCode);
router.post('/agent', authMiddleware, aiController.runAgent);

router.post('/extract', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    const content = await extractUrlContent(url);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/project.create', authMiddleware, async (req, res) => {
  try {
    const { projectId, prompt, language } = req.body;
    await inngest.send({ name: "project.create", data: { projectId, prompt, language } });
    res.json({ status: "Project Orchestration started" });
  } catch (err) {
    console.error("Inngest Send Error:", err.message);
    res.status(500).json({ error: "Failed to start project orchestration. Ensure Inngest dev server is running." });
  }
});

router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { code, fileId, sessionId } = req.body;
    await inngest.send({ name: "code/analyze", data: { code, fileId, sessionId } });
    res.json({ status: "Analysis started" });
  } catch (err) {
    console.error("Inngest Analyze Error:", err.message);
    res.status(500).json({ error: "Failed to start analysis. Ensure Inngest dev server is running." });
  }
});

router.post('/index', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    await inngest.send({ name: "repo/index", data: { url } });
    res.json({ status: "Indexing started" });
  } catch (err) {
    console.error("Inngest Index Error:", err.message);
    res.status(500).json({ error: "Failed to start indexing. Ensure Inngest dev server is running." });
  }
});

router.post('/abort', authMiddleware, async (req, res) => {
  const { sessionId } = req.body;
  const aborted = abortJob(sessionId);
  res.json({ status: aborted ? "Aborted" : "Not found" });
});

export default router;
