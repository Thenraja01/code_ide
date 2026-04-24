import { Inngest } from "inngest";

// Initialize Inngest client
export const inngest = new Inngest({
  id: "ai-code-assistant",
  eventKey: process.env.INNGEST_EVENT_KEY || process.env.INNGEST_SIGNING_KEY || "local",
});
