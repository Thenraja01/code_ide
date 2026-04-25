import axios from 'axios';
import crypto from 'crypto';

// API Keys are looked up inside methods to ensure they are available after dotenv loads.
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
      model: "jamba-1.5-mini",
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
          'Authorization': `Bearer ${process.env.AI21_API_KEY}`, 
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
      
      // FALLBACK TO HUGGING FACE IF AI21 FAILS (set HF_TOKEN in .env)
      const HF_TOKEN = process.env.HF_TOKEN;
      if (HF_TOKEN) {
        console.warn("AI21 Failed, attempting HuggingFace fallback...");
        try {
          const hfResponse = await axios.post(
            'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
            { 
              inputs: `<|system|>\n${CODE_SYSTEM_PROMPT}\n<|user|>\n${userPrompt}\n<|assistant|>\n`,
              parameters: { max_new_tokens: 1024, temperature: 0.2 }
            },
            { headers: { 'Authorization': `Bearer ${HF_TOKEN}` } }
          );
          
          if (Array.isArray(hfResponse.data) && hfResponse.data[0]?.generated_text) {
             const text = hfResponse.data[0].generated_text;
             return text.split('<|assistant|>').pop().trim();
          }
        } catch (hfError) {
          console.error("HuggingFace Fallback also failed:", hfError.message);
        }
      }

      console.error(`AI21 ${error.response?.status} Error:`, error.response?.data);
      throw new Error(error.response?.data?.message || "AI assistant service is currently unavailable");
    } finally {
      if (sessionId && abortControllers.get(sessionId) === controller) {
        abortControllers.delete(sessionId);
      }
    }
  }
}

const AGENT_SYSTEM_PROMPT = `
You are an advanced AI Software Engineer integrated into CodeSphere IDE. 
Your goal is to assist the user in building, refactoring, and fixing code autonomously.

CORE CAPABILITIES:
You can perform file operations by including specific markers in your response. The system will parse these and execute them on the user's behalf.

1. CREATE_FILE (For new files):
CREATE_FILE: path/to/filename
\`\`\`language
// file content
\`\`\`

2. EDIT_FILE (For modifying existing files - PREFERRED for refactoring/fixes):
Use a diff-style search and replace block. The search block MUST match the original code exactly, including indentation.
EDIT_FILE: path/to/filename
<<<<<<< SEARCH
[exact code block to find]
=======
[new code block to replace it with]
>>>>>>>

3. DELETE_FILE (For removing files):
DELETE_FILE: path/to/filename

GUIDELINES:
- When asked to "Add a feature" or "Fix a bug", prefer EDIT_FILE unless the file doesn't exist.
- Be precise with indentation in SEARCH blocks. 
- Always provide a brief explanation of what you are doing before or after the code blocks.
- If the user provides documentation context (URL context), follow the principles in that documentation strictly.
- For full-stack apps, ensure you generate both backend and frontend components if necessary.
`;

const CHAT_SYSTEM_PROMPT = `You are CodeSphere AI, an expert AI assistant built into CodeSphere IDE.
Help developers with coding questions, architecture decisions, debugging, and general knowledge.
Be concise, accurate, and friendly. Use markdown formatting and wrap code in fenced code blocks with the language name.
Never refuse to help with legitimate programming topics.`;

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
      model: "jamba-1.5-mini",
      messages: [
        {
          role: "system",
          content: action === "AGENT"
            ? AGENT_SYSTEM_PROMPT
            : action === "CHAT"
              ? CHAT_SYSTEM_PROMPT
              : CODE_SYSTEM_PROMPT_MODELCREATE
        },
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
        headers: { 'Authorization': `Bearer ${process.env.AI21_API_KEY}`, 'Content-Type': 'application/json' },
        responseType: "stream",
        signal: cancelToken
      });
      return response;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log(`AI Stream ${sessionId} cancelled.`);
        return null;
      }
      
      console.error(`AI21 Stream ${error.response?.status} Error:`, error.response?.data);

      // FALLBACK TO HUGGING FACE (Non-streaming) (set HF_TOKEN in .env)
      const HF_TOKEN = process.env.HF_TOKEN;
      if (HF_TOKEN) {
        console.warn("AI21 Stream Failed, attempting HuggingFace non-streaming fallback...");
        try {
          const hfResponse = await axios.post(
            'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
            { 
              inputs: `<|system|>\n${action === "AGENT" ? AGENT_SYSTEM_PROMPT : CODE_SYSTEM_PROMPT_MODELCREATE}\n<|user|>\n${prompt}\n<|assistant|>\n`,
              parameters: { max_new_tokens: 1024, temperature: 0.2 }
            },
            { headers: { 'Authorization': `Bearer ${HF_TOKEN}` } }
          );
          
          if (Array.isArray(hfResponse.data) && hfResponse.data[0]?.generated_text) {
             const text = hfResponse.data[0].generated_text;
             const content = text.split('<|assistant|>').pop().trim();
             
             // Wrap in a fake stream-like response for the controller
             return {
                 data: {
                     on: (event, callback) => {
                         if (event === 'data') {
                             const chunk = JSON.stringify({
                                 choices: [{ delta: { content } }]
                             });
                             callback(`data: ${chunk}\n\n`);
                             callback(`data: [DONE]\n\n`);
                         }
                         if (event === 'end') {
                             // Trigger end after data has been sent
                             setTimeout(callback, 0);
                         }
                     }
                 }
             };
          }
        } catch (hfError) {
          console.error("HuggingFace Fallback also failed:", hfError.message);
        }
      }

      throw new Error(error.response?.data?.message || "AI agent service is currently unavailable");
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
