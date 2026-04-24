import { AiService, AiModelcreate } from '../services/AiService.js';
import { inngest } from '../inngest/client.js';
import crypto from 'crypto';

// Simple in-memory cache for autocomplete requests (low-budget caching)
const autocompleteCache = new Map();

const generateCode = async (req, res) => {
  try {
    const { prompt, fileId, sessionId, language } = req.body;
    const userId = req.user.uid;
    const requestId = crypto.randomUUID();

    if (!prompt || !fileId || !sessionId) {
      return res.status(400).json({ error: "Prompt, fileId, and sessionId are required" });
    }

    console.log(`[AI][${requestId}] Generation started for User ${userId}`);

    await inngest.send({ 
      name: "code.generate", 
      data: { 
        prompt, 
        fileId, 
        sessionId, 
        language: language || "javascript",
        userId,
        requestId
      } 
    });

    res.json({ message: "Code generation started", sessionId, requestId });
  } catch (error) {
    console.error("GenerateCode Error:", error.message);
    res.status(500).json({ error: "Failed to start code generation" });
  }
};

const autocompleteCode = async (req, res) => {
  try {
    const { prompt, language } = req.body;
    const userId = req.user.uid;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Cache key based on prompt and language
    const cacheKey = `${language}:${prompt.slice(-100)}`; // Check last 100 chars
    if (autocompleteCache.has(cacheKey)) {
        return res.json({ suggestion: autocompleteCache.get(cacheKey), cached: true });
    }

    const response = await AiService.askCodeAssistant(
      `Autocomplete the following code in ${language || "javascript"}. Return ONLY the suggested code snippet, no explanation.`,
      prompt
    );

    if (response) {
        autocompleteCache.set(cacheKey, response);
        // Evict cache after 1 minute to keep it fresh
        setTimeout(() => autocompleteCache.delete(cacheKey), 60000);
    }

    res.json({ suggestion: response });
  } catch (error) {
    console.error("Autocomplete Error:", error.message);
    res.status(500).json({ error: "Autocomplete failed" });
  }
};

const askAi = async (req, res) => {
  try {
    const { action, code } = req.body;
    if (!action || !code) return res.status(400).json({ error: "Action and Code are required" });
    const response = await AiService.askCodeAssistant(action, code);
    res.json({ response });
  } catch (error) {
    console.error("AiController Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const Aimodelcreater = async (req, res) => {
  try {
    const { action, message } = req.body;
    if (!action || !message) return res.status(400).json({ error: "Action and message are required" });
    const response = await AiService.askCodeAssistant(action, message);
    res.json({ response });
  } catch (error) {
    console.error("AiController Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const runAgent = async (req, res) => {
  try {
    const { prompt, sessionId, context } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const response = await AiModelcreate.askCodeAssistant("AGENT", prompt, sessionId, context);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.data.on('data', chunk => {
        res.write(chunk);
    });

    response.data.on('end', () => {
        res.end();
    });

  } catch (error) {
    console.error("Agent Error:", error.message);
    res.status(500).json({ error: "Agent execution failed" });
  }
};

export default { askAi, Aimodelcreater, generateCode, autocompleteCode, runAgent };
