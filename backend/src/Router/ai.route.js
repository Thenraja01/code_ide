import { Router } from 'express';
import aiController from '../controllers/ai.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { inngest } from '../inngest/client.js';
import { extractUrlContent } from '../services/ScraperService.js';
import { indexChunks, clearProjectIndex } from '../ai/rag/VectorStore.js';

const router = Router();

// ─── Core AI Chat & Agent (WebSocket + SSE streaming) ────────────────────────
router.post('/chat',         authMiddleware, aiController.chatWithAi);
router.post('/agent',        authMiddleware, aiController.runAgent);

// ─── Code Operations ──────────────────────────────────────────────────────────
router.post('/code',         authMiddleware, aiController.askAi);
router.post('/autocomplete', authMiddleware, aiController.autocompleteCode);
router.post('/generate',     authMiddleware, aiController.generateCode);

// ─── AI Panel Feature Endpoints ───────────────────────────────────────────────
router.post('/explain',      authMiddleware, aiController.explainCode);
router.post('/bugs',         authMiddleware, aiController.detectBugs);
router.post('/tests',        authMiddleware, aiController.generateTests);
router.post('/docs',         authMiddleware, aiController.generateDocs);

// ─── Project Generation (Inngest orchestration) ───────────────────────────────
router.post('/project.create', authMiddleware, async (req, res) => {
  const { projectId, prompt, language } = req.body;
  if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

  await inngest.send({ name: 'project.create', data: { projectId, prompt, language } });
  res.json({ status: 'Project orchestration started' });
});

// ─── Background Analysis ──────────────────────────────────────────────────────
router.post('/analyze', authMiddleware, async (req, res) => {
  const { code, fileId, sessionId } = req.body;
  await inngest.send({ name: 'code/analyze', data: { code, fileId, sessionId } });
  res.json({ status: 'Analysis started' });
});

// ─── RAG: Index project files into Chroma ────────────────────────────────────
router.post('/index-project', authMiddleware, async (req, res) => {
  const { projectId, files } = req.body;
  if (!projectId || !files?.length) {
    return res.status(400).json({ error: 'projectId and files array are required' });
  }

  try {
    // files: [{ id, name, content }]
    const chunks = files
      .filter((f) => f.content && f.content.trim())
      .map((f) => ({
        id: f.id,
        content: f.content,
        metadata: { filename: f.name, projectId },
      }));

    await indexChunks(projectId, chunks);
    res.json({ status: 'Indexed', count: chunks.length });
  } catch (err) {
    console.error('[RAG Index Error]', err.message);
    res.status(500).json({ error: 'Failed to index project', details: err.message });
  }
});

// ─── RAG: Clear project index ─────────────────────────────────────────────────
router.delete('/index-project/:projectId', authMiddleware, async (req, res) => {
  await clearProjectIndex(req.params.projectId).catch(() => {});
  res.json({ status: 'Cleared' });
});

// ─── URL Scraping for AI context ──────────────────────────────────────────────
router.post('/extract', authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  try {
    const content = await extractUrlContent(url);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Repo indexing via Inngest ────────────────────────────────────────────────
router.post('/index', authMiddleware, async (req, res) => {
  const { url } = req.body;
  await inngest.send({ name: 'repo/index', data: { url } });
  res.json({ status: 'Indexing started' });
});

// ─── Abort streaming session ──────────────────────────────────────────────────
router.post('/abort', authMiddleware, async (req, res) => {
  const { sessionId } = req.body;
  // Import clients map from server — close the WS or signal abort
  const { clients } = await import('../../server.js').catch(() => ({ clients: new Map() }));
  const ws = clients.get(sessionId);
  if (ws) {
    ws.send(JSON.stringify({ type: 'abort' }));
    res.json({ status: 'Aborted' });
  } else {
    res.json({ status: 'Not found' });
  }
});

export default router;
