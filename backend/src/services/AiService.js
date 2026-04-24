import axios from 'axios';
import crypto from 'crypto';

const AI21_API_KEY = process.env.AI21_API_KEY;
const BASE_URL = "https://api.ai21.com/studio/v1";

// Mapping to track active AI jobs for cancellation
const abortControllers = new Map();

const getPromptHash = (prompt, code) => {
  return crypto.createHash('sha256').update(prompt + (code || "")).digest('hex');
};

const trimContext = (code, maxLines = 50) => {
  if (!code) return "";
  const lines = code.split("\n");
  if (lines.length <= maxLines) return code;
  return lines.slice(-maxLines).join("\n");
};

const CODE_SYSTEM_PROMPT = `You are a senior software engineer and expert code assistant.
Your responsibilities:
- Understand and analyze code.
- Fix bugs and security issues.
- Refactor and optimize code.
- Generate clean, production-ready code.
- Explain code clearly when asked.
Rules:
- Be concise but accurate.
- If code is provided, always reference it.
- Return code in properly formatted markdown blocks.`;

const CODE_SYSTEM_PROMPT_MODELCREATE = `
You are an expert senior software architect and AI code generator like Cursor AI.

Your job is to generate FULL PROJECT STRUCTURE + CODE when the user requests an app, feature, or system.

You MUST:

1. Understand the user requirement completely.
2. Design a proper scalable folder structure (like production apps).
3. Generate all necessary files with correct paths.
4. Write clean, production-ready, maintainable code.
5. Ensure all files work together without missing imports.
6. Follow modern best practices for the given stack.

PROJECT RULES:
- Always create a proper folder structure first.
- Then generate file-by-file code.
- Each file must be clearly labeled with its path.
- Do NOT skip important configuration files.
- Include backend + frontend structure if needed.
- Include API layer, services, utils if required.
- Use modern standards (React, Express, Convex, etc. if applicable).

OUTPUT FORMAT:
Always output in this format:

1. Folder Structure (tree format)
2. Then each file like:

// file: path/to/file
\`\`\`code
...code here
\`\`\`

BEHAVIOR RULES:
- Output ONLY code + structure (no extra explanation)
- Be strict and consistent
- If something is missing, intelligently assume best industry practice
- Build like a real production-grade Cursor-like system
- Prefer scalability over simplicity

IMPORTANT:
- Do NOT give partial implementations
- Do NOT skip files
- Do NOT add unnecessary commentary
`;
class AiService {
  static async askCodeAssistant(action, code, sessionId) {
    if (!action || !code) throw new Error("Action and Code are required");

    const userPrompt = `Action:\n${action}\n\nCode Context (Trimmed):\n${trimContext(code)}`;
    
    let cancelToken;
    let controller;
    if (sessionId) {
      if (abortControllers.has(sessionId)) {
        abortControllers.get(sessionId).abort();
      }
      controller = new AbortController();
      abortControllers.set(sessionId, controller);
      cancelToken = controller.signal;
    }

    const data = {
      model: "jamba-mini",
      messages: [
        { role: "system", content: CODE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1024,
      temperature: 0.2
    };

    try {
      const response = await axios.post(`${BASE_URL}/chat/completions`, data, {
        headers: { 
          'Authorization': `Bearer ${AI21_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        signal: cancelToken
      });
      if (!response.data?.choices?.length) throw new Error("No response from AI model");
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      if (axios.isCancel(error) || error.name === 'AbortError') {
        console.log(`AI Job ${sessionId} cancelled.`);
        return null;
      }
      console.error("AI21 Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "AI assistant service is currently unavailable");
    } finally {
      if (sessionId && abortControllers.get(sessionId) === controller) {
        abortControllers.delete(sessionId);
      }
    }
  }
}

const AGENT_SYSTEM_PROMPT = `
You are an AI Agent integrated into a modern IDE (CodeSphere).
Your job is to help the user build, edit, and refactor code.

You have access to the file system via these markers:

1. CREATE_FILE: path/to/file
\`\`\`language
code here
\`\`\`

2. EDIT_FILE: path/to/file
<<<<<<< SEARCH
old code
=======
new code
>>>>>>>

3. REFACTOR_CODE: path/to/file
(Explain refactor and provide full or partial code)

RULES:
- Always use the markers for file changes.
- Provide clear explanations for your changes.
- Ensure paths are relative to project root.
- If creating multiple files, use CREATE_FILE for each.
- Be concise.
`;

class AiModelcreate {
  static async askCodeAssistant(action, prompt, sessionId, context) {
    if (!action || !prompt) throw new Error("Prompt required");

    const userPrompt = `Action:\n${action}\n\nPrompt:\n${prompt}`;
    
    let cancelToken;
    if (sessionId) {
      const controller = new AbortController();
      abortControllers.set(sessionId, controller);
      cancelToken = controller.signal;
    }

    const data = {
      model: "jamba-mini",
      messages: [
        { role: "system", content: action === "AGENT" ? AGENT_SYSTEM_PROMPT : CODE_SYSTEM_PROMPT_MODELCREATE },
        { 
          role: "user", 
          content: context 
            ? `Documentation Context:\n${context}\n\nUser Question:\n${prompt}` 
            : prompt 
        }
      ],
      max_tokens: 4096,
      temperature: 0.2,
      stream: true
    };

    try {
      const response = await axios.post(`${BASE_URL}/chat/completions`, data, {
        headers: { 'Authorization': `Bearer ${AI21_API_KEY}`, 'Content-Type': 'application/json' },
        responseType: "stream",
        signal: cancelToken
      });
      return response;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log(`AI Stream ${sessionId} cancelled.`);
        return null;
      }
      console.error("AI21 Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "AI assistant service is currently unavailable");
    }
  }
}

const abortJob = (sessionId) => {
  const controller = abortControllers.get(sessionId);
  if (controller) {
    controller.abort();
    abortControllers.delete(sessionId);
    return true;
  }
  return false;
};

export { AiService, AiModelcreate, abortJob, getPromptHash, abortControllers };
export default AiService;
