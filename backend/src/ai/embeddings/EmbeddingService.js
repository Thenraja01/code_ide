import { getProvider } from '../providers/ProviderFactory.js';

/**
 * EmbeddingService — Generates vector embeddings for code/text chunks.
 * Uses Google Generative AI embeddings by default, falls back to OpenAI.
 */

let _embedder = null;

async function getEmbedder() {
  if (_embedder) return _embedder;

  const provider = (process.env.ACTIVE_AI_PROVIDER || 'anthropic').toLowerCase();

  // Anthropic doesn't have embeddings — use Gemini or OpenAI
  if (provider === 'gemini') {
    const { GoogleGenerativeAIEmbeddings } = await import('@langchain/google-genai');
    _embedder = new GoogleGenerativeAIEmbeddings({
      modelName: 'text-embedding-004',
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });
  } else {
    // Default: OpenAI embeddings (also works as fallback for Anthropic/Claude setups)
    const { OpenAIEmbeddings } = await import('@langchain/openai');
    _embedder = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
    });
  }

  return _embedder;
}

/**
 * Embed a single string and return the vector.
 */
export async function embedText(text) {
  const embedder = await getEmbedder();
  return embedder.embedQuery(text);
}

/**
 * Embed multiple strings and return an array of vectors.
 */
export async function embedTexts(texts) {
  const embedder = await getEmbedder();
  return embedder.embedDocuments(texts);
}
