import { inngest } from "../client.js";
import { developerAgent } from "../../ai/agents/DeveloperAgent.js";
import axios from "axios";

export const codeGenerator = inngest.createFunction(
  {
    id: "code-generator",
    name: "AI Code Generation",
    triggers: [{ event: "code.generate" }],
    retries: 3,
  },
  async ({ event, step }) => {
    const { prompt, fileId, sessionId, language, userId, requestId } = event.data;

    const baseUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "http://127.0.0.1:3210";
    const siteUrl = baseUrl.includes(".cloud") ? baseUrl.replace(".cloud", ".site") : baseUrl;
    const finalUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;

    console.log(`[Inngest][${requestId}] Code generation started for file ${fileId}`);

    // 1. Mark as running
    await step.run("status.running", async () => {
      await axios.post(`${finalUrl}update_job_status`, { fileId, sessionId, status: "running", userId, requestId });
    });

    // 2. Generate code using DeveloperAgent (Claude by default)
    const generatedCode = await step.run("ai.generate", async () => {
      return await developerAgent.invoke(
        "generate",
        `Language: ${language || "javascript"}\n\nGenerate ONLY raw code, no markdown fences, no explanations:\n${prompt}`
      );
    });

    // 3. Write code to Convex file
    await step.run("convex.write_code", async () => {
      await axios.post(`${finalUrl}update_file_content`, { fileId, content: generatedCode, userId, requestId });
    });

    // 4. Mark as done
    await step.run("status.done", async () => {
      await axios.post(`${finalUrl}update_job_status`, { fileId, sessionId, status: "done", userId, requestId });
    });

    console.log(`[Inngest][${requestId}] Generation completed.`);
    return { status: "success", fileId, requestId };
  }
);
