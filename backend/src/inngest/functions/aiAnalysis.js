import { inngest } from "../client.js";
import { developerAgent } from "../../ai/agents/DeveloperAgent.js";
import axios from "axios";

export const aiAnalysis = inngest.createFunction(
  {
    id: "ai-analysis",
    name: "Background Code Analysis",
    triggers: [{ event: "code/analyze" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { code, fileId, sessionId } = event.data;
    if (!code?.trim()) return { status: "skipped", reason: "empty code" };

    const baseUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "http://127.0.0.1:3210";
    const siteUrl = baseUrl.includes(".cloud") ? baseUrl.replace(".cloud", ".site") : baseUrl;
    const finalUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;

    // 1. Bug analysis
    const bugs = await step.run("ai.detect_bugs", async () => {
      return developerAgent.invoke("bugs", code);
    });

    // 2. Code explanation  
    const explanation = await step.run("ai.explain", async () => {
      return developerAgent.invoke("explain", code);
    });

    // 3. Push results back to Convex/client  
    await step.run("convex.push_analysis", async () => {
      await axios.post(`${finalUrl}save_analysis_result`, {
        fileId,
        sessionId,
        bugs,
        explanation,
        analyzedAt: new Date().toISOString(),
      }).catch((err) => console.warn("[Analysis] Push failed:", err.message));
    });

    return { status: "done", fileId };
  }
);