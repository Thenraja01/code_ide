import { inngest } from "../client.js";
import FirecrawlApp from "@mendable/firecrawl-js";
import * as Sentry from "@sentry/node";

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY
});

export const repoIndex = inngest.createFunction(
  { 
    id: "repo-index", 
    name: "Index Repository", 
    retries: 2,
    triggers: [{ event: "repo/index" }]
  },
  async ({ event, step }) => {
    const { url } = event.data;

    try {
      const pages = await step.run("crawl-site", async () => {
        if (!process.env.FIRECRAWL_API_KEY) {
          throw new Error("FIRECRAWL_API_KEY is not configured.");
        }
        return await firecrawl.crawlUrl(url, { limit: 10 });
      });

      await step.run("process-pages", async () => {
        for (const page of pages) {
          // TODO: chunk + embed + store in Pinecone / Postgres
          console.log("Indexed:", page.url);
        }
      });

      return { status: "indexed", url };
    } catch (err) {
      Sentry.captureException(err, { extra: { url } });
      throw err;
    }
  }
);
