import Firecrawl from '@mendable/firecrawl-js';

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

/**
 * Extracts content from a URL using Firecrawl.
 */
export const extractUrlContent = async (url) => {
  try {
    const scrapeResult = await app.scrape(url, {
      formats: ['markdown'],
      onlyMainContent: true
    });
    
    // Note: scrapeResult for v2 might have a different structure
    return scrapeResult.markdown || scrapeResult.data?.markdown || '';
  } catch (err) {
    console.error('Firecrawl Error:', err.message);
    throw err;
  }
};
