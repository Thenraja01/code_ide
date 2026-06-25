import axios from 'axios';

/**
 * ScraperService — Fetches and extracts readable text content from a URL.
 * Used to give the AI context from documentation pages, articles, etc.
 */

/**
 * Extract readable text content from a URL.
 * Returns plain text stripped of HTML, scripts, and boilerplate.
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function extractUrlContent(url) {
  if (!url?.startsWith('http')) throw new Error('Invalid URL');

  const response = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'CodeSpace/1.0 (AI context scraper)' },
    responseType: 'text',
  });

  const html = response.data;

  // Strip script/style blocks
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')        // remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{3,}/g, '\n\n')      // collapse excess whitespace
    .trim();

  // Trim to a reasonable context window size (~12k chars ≈ ~3k tokens)
  const MAX_CHARS = 12000;
  if (text.length > MAX_CHARS) {
    text = text.substring(0, MAX_CHARS) + '\n\n[Content truncated for AI context window]';
  }

  return text;
}
