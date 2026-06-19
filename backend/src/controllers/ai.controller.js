import { developerAgent } from '../ai/agents/DeveloperAgent.js';
import { inngest } from '../inngest/client.js';
import { searchChunks, buildRagContext } from '../ai/rag/VectorStore.js';
import { clients } from '../../server.js';
import crypto from 'crypto';

// ─── Simple in-memory autocomplete cache ─────────────────────────────────────
const autocompleteCache = new Map();

// ─── Helper: push tokens to the WebSocket client if connected ─────────────────
function wsStream(sessionId, type, payload) {
  const ws = clients?.get(sessionId);
  if (ws && ws.readyState === 1 /* OPEN */) {
    ws.send(JSON.stringify({ type, ...payload }));
    return true;
  }
  return false;
}

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
export const chatWithAi = async (req, res) => {
  const { messages, sessionId, projectId } = req.body;

  if (!messages?.length) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const sid = sessionId || crypto.randomUUID();
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) return res.status(400).json({ error: 'No user message found' });

  // Build RAG context from project if projectId is provided
  let ragContext = '';
  if (projectId) {
    const chunks = await searchChunks(projectId, lastUser.content, 5).catch(() => []);
    ragContext = buildRagContext(chunks);
  }

  const history = messages.slice(0, -1);

  // Attempt WebSocket delivery first (preferred — low latency)
  const wsConnected = wsStream(sid, 'stream_start', { sessionId: sid });

  if (wsConnected) {
    // Stream via WebSocket
    res.json({ sessionId: sid, streaming: 'websocket' });

    try {
      await developerAgent.stream('chat', lastUser.content, (token) => {
        wsStream(sid, 'token', { token });
      }, history, ragContext);
      wsStream(sid, 'stream_end', {});
    } catch (err) {
      console.error('[AI Chat WS Error]', err.message);
      wsStream(sid, 'error', { message: err.message });
    }
  } else {
    // Fallback: SSE streaming over HTTP
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      await developerAgent.stream('chat', lastUser.content, (token) => {
        const chunk = JSON.stringify({ choices: [{ delta: { content: token } }] });
        res.write(`data: ${chunk}\n\n`);
      }, history, ragContext);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      console.error('[AI Chat SSE Error]', err.message);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
};

// ─── POST /api/ai/agent ───────────────────────────────────────────────────────
export const runAgent = async (req, res) => {
  const { prompt, sessionId, context, projectId } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const sid = sessionId || crypto.randomUUID();

  let ragContext = context || '';
  if (projectId && !ragContext) {
    const chunks = await searchChunks(projectId, prompt, 5).catch(() => []);
    ragContext = buildRagContext(chunks);
  }

  const wsConnected = wsStream(sid, 'stream_start', { sessionId: sid });

  if (wsConnected) {
    res.json({ sessionId: sid, streaming: 'websocket' });
    try {
      await developerAgent.stream('agent', prompt, (token) => {
        wsStream(sid, 'token', { token });
      }, [], ragContext);
      wsStream(sid, 'stream_end', {});
    } catch (err) {
      wsStream(sid, 'error', { message: err.message });
    }
  } else {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      await developerAgent.stream('agent', prompt, (token) => {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: token } }] })}\n\n`);
      }, [], ragContext);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
};

// ─── POST /api/ai/code ────────────────────────────────────────────────────────
export const askAi = async (req, res) => {
  const { action, code, mode } = req.body;
  if (!action || !code) return res.status(400).json({ error: 'Action and Code are required' });

  try {
    const aiMode = mode || 'code';
    const response = await developerAgent.invoke(aiMode, `${action}\n\n${code}`);
    res.json({ response });
  } catch (err) {
    console.error('[AI Code Error]', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/ai/explain ─────────────────────────────────────────────────────
export const explainCode = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code is required' });
  try {
    const response = await developerAgent.invoke('explain', code);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/ai/bugs ────────────────────────────────────────────────────────
export const detectBugs = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code is required' });
  try {
    const response = await developerAgent.invoke('bugs', code);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/ai/tests ───────────────────────────────────────────────────────
export const generateTests = async (req, res) => {
  const { code, language } = req.body;
  if (!code) return res.status(400).json({ error: 'code is required' });
  try {
    const response = await developerAgent.invoke('tests', `Language: ${language || 'javascript'}\n\n${code}`);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/ai/docs ────────────────────────────────────────────────────────
export const generateDocs = async (req, res) => {
  const { code, language } = req.body;
  if (!code) return res.status(400).json({ error: 'code is required' });
  try {
    const response = await developerAgent.invoke('docs', `Language: ${language || 'javascript'}\n\n${code}`);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/ai/autocomplete ────────────────────────────────────────────────
export const autocompleteCode = async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const cacheKey = `${language}:${prompt.slice(-100)}`;
  if (autocompleteCache.has(cacheKey)) {
    return res.json({ suggestion: autocompleteCache.get(cacheKey), cached: true });
  }

  try {
    const suggestion = await developerAgent.invoke(
      'code',
      `Autocomplete the following ${language || 'javascript'} code. Return ONLY the continuation snippet, no explanation.\n\n${prompt}`
    );

    if (suggestion) {
      autocompleteCache.set(cacheKey, suggestion);
      setTimeout(() => autocompleteCache.delete(cacheKey), 60000);
    }
    res.json({ suggestion });
  } catch (err) {
    console.error('[Autocomplete Error]', err.message);
    res.status(500).json({ error: 'Autocomplete failed' });
  }
};

// ─── POST /api/ai/generate ────────────────────────────────────────────────────
export const generateCode = async (req, res) => {
  const { prompt, fileId, sessionId, language } = req.body;
  if (!prompt || !fileId || !sessionId) {
    return res.status(400).json({ error: 'Prompt, fileId, and sessionId are required' });
  }

  const requestId = crypto.randomUUID();

  await inngest.send({
    name: 'code.generate',
    data: { prompt, fileId, sessionId, language: language || 'javascript', userId: req.user.uid, requestId },
  });

  res.json({ message: 'Code generation started', sessionId, requestId });
};

export default {
  chatWithAi, runAgent, askAi, explainCode, detectBugs,
  generateTests, generateDocs, autocompleteCode, generateCode,
};
