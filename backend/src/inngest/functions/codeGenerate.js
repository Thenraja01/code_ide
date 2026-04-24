import { inngest } from "../client.js";
import axios from "axios";

export const codeGenerator = inngest.createFunction(
  { 
    id: "code-generator", 
    name: "AI Code Generation", 
    triggers: [{ event: "code.generate" }],
    retries: 3
  },
  async ({ event, step }) => {
    const { prompt, fileId, sessionId, language, userId, requestId } = event.data;
    const baseUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "http://127.0.0.1:3210";
    const siteUrl = baseUrl.includes(".cloud") ? baseUrl.replace(".cloud", ".site") : baseUrl;
    const finalUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;

    console.log(`[Inngest][${requestId}] Processing code generation for ${fileId}`);

    // 1. Idempotency Check: Check if job is already done
    const status = await step.run("check.idempotency", async () => {
      // We assume the caller checks or we handle it here if possible. 
      // For now, we'll proceed but use the requestId for logging.
      return "proceed";
    });

    // 2. Update status to running
    await step.run("status.running", async () => {
      await axios.post(`${finalUrl}update_job_status`, {
        fileId,
        sessionId,
        status: "running",
        userId, // Pass userId for isolation
        requestId
      });
    });

    // 3. Call AI21
    const generatedCode = await step.run("ai.generate", async () => {
      const response = await axios.post(
        "https://api.ai21.com/studio/v1/chat/completions",
        {
          model: "jamba-mini",
          messages: [
            { 
              role: "system", 
              content: `You are an expert ${language} developer. Generate ONLY the code requested. No markdown blocks, no explanations. Just the raw code. Request ID: ${requestId}` 
            },
            { role: "user", content: prompt }
          ],
          max_tokens: 2048,
          temperature: 0.3
        },
        {
          headers: { Authorization: `Bearer ${process.env.AI21_API_KEY}` },
          timeout: 60000 
        }
      );

      return response.data.choices[0].message.content.trim();
    });

    // 4. Update File Content in Convex (Idempotent update)
    await step.run("convex.write_code", async () => {
      await axios.post(`${finalUrl}update_file_content`, {
        fileId,
        content: generatedCode,
        userId,
        requestId
      });
    });

    // 5. Update status to done
    await step.run("status.done", async () => {
      await axios.post(`${finalUrl}update_job_status`, {
        fileId,
        sessionId,
        status: "done",
        userId,
        requestId
      });
    });

    console.log(`[Inngest][${requestId}] Generation completed naturally.`);
    return { status: "success", fileId, requestId };
  }
);
