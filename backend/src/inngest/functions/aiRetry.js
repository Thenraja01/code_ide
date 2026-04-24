import { inngest } from "../client.js";
import axios from "axios";
import * as Sentry from "@sentry/node";

export const aiRetry = inngest.createFunction(
  {
    id: "ai-retry-call",
    name: "AI Retry Call",
    retries: 3,
    triggers: [{ event: "ai/call" }]
  },
  async ({ event, step }) => {
    const { prompt } = event.data;

    try {
      const result = await step.run("call-ai", async () => {
        const res = await axios.post(
          "https://api.ai21.com/studio/v1/chat/completions",
          {
            model: "jamba-mini",
            messages: [{ role: "user", content: prompt }]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.AI21_API_KEY}`
            }
          }
        );

        return res.data.choices?.[0]?.message?.content;
      });

      return result;
    } catch (err) {
      Sentry.captureException(err, { extra: { prompt } });
      throw err;
    }
  }
);
