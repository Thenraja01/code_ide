import { inngest } from "../client.js";
import { developerAgent } from "../../ai/agents/DeveloperAgent.js";
import axios from "axios";
import * as Sentry from "@sentry/node";

export const projectOrchestrator = inngest.createFunction(
  {
    id: "project-orchestrator",
    name: "AI Project Generation Flow",
    triggers: [{ event: "project.create" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { projectId, prompt, language } = event.data;

    const baseUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "http://127.0.0.1:3210";
    const siteUrl = baseUrl.includes(".cloud") ? baseUrl.replace(".cloud", ".site") : baseUrl;
    const finalUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;

    // 1. AI generates a full project plan (JSON array of files)
    const plan = await step.run("ai.plan", async () => {
      try {
        const jsonPrompt = `Generate a full production-ready project structure for a ${language || "react"} project.
User request: ${prompt}

Respond ONLY with a valid JSON array. No markdown, no explanation. Each object must have:
- name: string (filename or foldername)  
- type: "file" | "folder"
- content: string (full code for files, empty string for folders)
- parentPath: string (e.g. "src" or "src/components", empty string for root)`;

        const raw = await developerAgent.invoke("generate", jsonPrompt);

        // Extract JSON array from response
        const jsonStart = raw.indexOf("[");
        const jsonEnd = raw.lastIndexOf("]") + 1;
        if (jsonStart === -1) throw new Error("No JSON array found in response");
        return JSON.parse(raw.substring(jsonStart, jsonEnd));
      } catch (e) {
        console.error("[Orchestrator] AI plan failed, using fallback:", e.message);
        // Sensible React fallback
        return [
          { name: "package.json", type: "file", parentPath: "", content: JSON.stringify({
            name: "codespace-app", private: true, version: "0.0.0", type: "module",
            scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
            dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
            devDependencies: { "@vitejs/plugin-react": "^4.3.4", vite: "^6.0.3" }
          }, null, 2) },
          { name: "index.html", type: "file", parentPath: "", content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>CodeSpace App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>\n</html>` },
          { name: "src", type: "folder", parentPath: "", content: "" },
          { name: "main.jsx", type: "file", parentPath: "src", content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);` },
          { name: "App.jsx", type: "file", parentPath: "src", content: `import React from 'react';\nexport default function App() {\n  return (\n    <div style={{ padding: '2rem', fontFamily: 'system-ui', background: '#09090b', color: '#fff', minHeight: '100vh' }}>\n      <h1>Hello from CodeSpace!</h1>\n      <p>Your AI-generated project is ready. Start editing!</p>\n    </div>\n  );\n}` },
          { name: "vite.config.js", type: "file", parentPath: "", content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()], server: { host: '0.0.0.0', port: 3000 } });` },
        ];
      }
    });

    // 2. Write all files to Convex (folders first)
    await step.run("convex.write_files", async () => {
      const sorted = [...plan].sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;
        if (a.parentPath && !b.parentPath) return 1;
        if (!a.parentPath && b.parentPath) return -1;
        return 0;
      });

      for (const file of sorted) {
        try {
          await axios.post(`${finalUrl}write_ghost_file`, { projectId, file }, { timeout: 15000 });
        } catch (err) {
          console.error(`[Orchestrator] Failed to write ${file.name}:`, err.message);
        }
        // Slight delay to avoid overwhelming Convex
        await new Promise((r) => setTimeout(r, 200));
      }
    });

    // 3. Mark project as ready
    await step.run("project.ready", async () => {
      await axios.post(`${finalUrl}update_build_state`, { projectId, buildState: "ready" })
        .catch((err) => console.warn("[Orchestrator] State update failed:", err.message));
    });

    return { status: "Project Ready", projectId, fileCount: plan.length };
  }
);
