import { inngest } from "../client.js";
import { ConvexHttpClient } from "convex/browser";
import * as Sentry from "@sentry/node";

const convex = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "http://127.0.0.1:3210");

export const cleanupSession = inngest.createFunction(
  {
    id: "cleanup-session", 
    name: "Cleanup Session",
    triggers: [{ event: "session/cleanup" }]
  },
  async ({ event, step }) => {
    const { fileId, sessionId } = event.data;

    try {
      await step.run("delete-convex-session-data", async () => {
        if (convex.address && fileId && sessionId) {
          await convex.mutation("cleanup:deleteSessionData", {
            fileId,
            sessionId
          });
        } else {
          console.warn("Cleanup skipped. Missing Convex URL or session variables.");
        }
      });

      return { status: "cleaned", fileId, sessionId };
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  }
);