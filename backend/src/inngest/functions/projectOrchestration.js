import { inngest } from "../client.js";
import axios from "axios";
import * as Sentry from "@sentry/node";

export const projectOrchestrator = inngest.createFunction(
  { 
    id: "project-orchestrator", 
    name: "AI Project Generation Flow", 
    triggers: [{ event: "project.create" }],
    retries: 2
  },
  async ({ event, step }) => {
    const { projectId, prompt, language } = event.data;

    // 1. Plan (AI Orchestration Layer)
    const plan = await step.run("ai.plan", async () => {
      try {
        const response = await axios.post(
          "https://api.ai21.com/studio/v1/chat/completions",
          {
             model: "jamba-mini",
              messages: [
                { 
                  role: "system", 
                  content: `You are a high-end software architect. Generate a full production-ready project structure for a ${language} project.
                  Respond ONLY with a JSON array of objects.
                  
                  Object Schema:
                  - name: string (filename or foldername)
                  - type: "file" | "folder"
                  - content: string (Full code for files, empty string for folders)
                  - parentPath: string (e.g., "src" or "src/components")`
                },
               { role: "user", content: prompt }
             ],
             temperature: 0.4
          },
          {
            headers: { Authorization: `Bearer ${process.env.AI21_API_KEY}` },
            timeout: 60000 
          }
        );

        const content = response.data.choices[0].message.content;
        const jsonStart = content.indexOf('[');
        const jsonEnd = content.lastIndexOf(']') + 1;
        const jsonStr = content.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("AI Plan Generation Failed, using fallback:", e.message);
        return [
          { name: "package.json", type: "file", content: JSON.stringify({
            name: "codespace-app",
            private: true,
            version: "0.0.0",
            type: "module",
            scripts: { "dev": "vite", "build": "vite build", "preview": "vite preview" },
            dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0" },
            devDependencies: { "@types/react": "^18.2.0", "@types/react-dom": "^18.2.0", "@vitejs/plugin-react": "^4.0.0", "vite": "^4.3.0" }
          }, null, 2), parentPath: "" },
          { name: "index.html", type: "file", content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>CodeSphere App</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`, parentPath: "" },
          { name: "src", type: "folder", content: "", parentPath: "" },
          { name: "main.jsx", type: "file", content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);`, parentPath: "src" },
          { name: "App.jsx", type: "file", content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div style={{ padding: '20px', fontFamily: 'system-ui', backgroundColor: '#09090b', color: '#fff', minHeight: '100vh' }}>\n      <h1>Hello from CodeSphere!</h1>\n      <p>The AI is currently architecting your project. This is a basic starter template.</p>\n    </div>\n  );\n}`, parentPath: "src" },
          { name: "vite.config.js", type: "file", content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { host: '0.0.0.0', port: 3000 }\n});`, parentPath: "" }
        ];
      }
    });

    // 2. Convex Syncing (Push generated structure to Convex)
    await step.run("convex.write_files", async () => {
      let baseUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "http://127.0.0.1:3210";
      
      // If it's a cloud URL, we use the .site domain for HTTP actions
      const siteUrl = baseUrl.includes(".cloud") 
        ? baseUrl.replace(".cloud", ".site") 
        : baseUrl;
      
      // Ensure it ends with /
      const finalUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;
      
      // Sort so folders come before files to ensure parentId exists for children
      const sortedPlan = [...plan].sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;
        if (a.parentPath && !b.parentPath) return 1;
        if (!a.parentPath && b.parentPath) return -1;
        return 0;
      });
      
      for (const file of sortedPlan) {
        try {
          await axios.post(`${finalUrl}write_ghost_file`, {
              projectId,
              file
          }, { timeout: 15000 });
        } catch (err) {
          console.error(`Failed to write ghost file ${file.name}:`, err.message);
        }
        
        // Slight delay to avoid overwhelming the endpoint
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    });

    // 3. Mark Ready
    await step.run("project.ready", async () => {
       let baseUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "http://127.0.0.1:3210";
       const siteUrl = baseUrl.includes(".cloud") ? baseUrl.replace(".cloud", ".site") : baseUrl;
       const finalUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;

       await axios.post(`${finalUrl}update_build_state`, {
           projectId,
           buildState: "ready"
       }).catch(err => console.log("State push err:", err.message));
    });

    return { status: "Project Ready", projectId, fileCount: plan.length };
  }
);
