import { inngest } from "../client.js";
import axios from "axios";
import * as Sentry from "@sentry/node";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "http://127.0.0.1:3210");

export const aiAnalysis = inngest.createFunction(
  { 
    id: "ai-code-analysis",
    name: "AI Code Analysis",
    retries: 3,
    triggers: [{ event: "code/analyze" }]
  },
  async ({ event, step }) => {
    const { code, fileId, sessionId, model = "jamba-mini" } = event.data;

    Sentry.setContext("ai_job", {
      fileId,
      sessionId,
      model,
    });

    try {
      await step.run("analyze-code-stream", async () => {
        // ALWAYS update status in Convex first (Source of Truth)
        if (convex.address && fileId && sessionId) {
           await convex.mutation("jobStatus:updateStatus", { fileId, sessionId, status: "running" });
        }

        const response = await axios.post(
          "https://api.ai21.com/studio/v1/chat/completions",
          {
             model: model,
             messages: [
               { role: "system", content: "You are a professional code reviewer. Analyze the following code and suggest specific improvements or fix bugs. Be concise." },
               { role: "user", content: code }
             ],
             stream: true,
          },
          {
            headers: { Authorization: `Bearer ${process.env.AI21_API_KEY}` },
            responseType: "stream",
            timeout: 60000 
          }
        );

        return new Promise((resolve, reject) => {
            let buffer = "";
            const BATCH_SIZE = 15; // Batch characters to optimize Convex writes

            response.data.on("data", async (chunk) => {
               // Check status first - if cancelled, stop processing
               if (convex.address && fileId && sessionId) {
                  const currentStatus = await convex.query("jobStatus:getStatus", { fileId, sessionId });
                  if (currentStatus?.status === "cancelled") {
                     response.data.destroy(); // Stop the stream
                     return resolve("cancelled");
                  }
               }

               const lines = chunk.toString().split('\n');
               for (const line of lines) {
                  if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                     try {
                        const parsed = JSON.parse(line.substring(6));
                        const text = parsed.choices?.[0]?.delta?.content;
                        if (text) {
                           buffer += text;
                           if (buffer.length >= BATCH_SIZE && convex.address && fileId && sessionId) {
                               await convex.mutation("aiStreams:addChunk", { fileId, sessionId, chunk: buffer });
                               buffer = "";
                           }
                        }
                     } catch(e) {}
                  }
               }
            });
            
            response.data.on("end", async () => {
                if (buffer && convex.address && fileId && sessionId) {
                    await convex.mutation("aiStreams:addChunk", { fileId, sessionId, chunk: buffer });
                }
                if (convex.address && fileId && sessionId) {
                    await convex.mutation("jobStatus:updateStatus", { fileId, sessionId, status: "done" });
                }
                resolve("done");
            });
            
            response.data.on("error", async (err) => {
               Sentry.captureException(err);
               if (convex.address && fileId && sessionId) {
                 await convex.mutation("jobStatus:updateStatus", { fileId, sessionId, status: "error" }).catch(()=>{});
               }
               reject(err);
            });
        });
      });
      return { status: "success" };
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  }
);