import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

/**
 * ProviderFactory — Returns the appropriate LangChain chat model
 * based on the ACTIVE_AI_PROVIDER env variable.
 *
 * Supported providers: anthropic | openai | gemini | ollama
 * Default: anthropic (Claude)
 */
export async function getProvider(options = {}) {
  const provider = (process.env.ACTIVE_AI_PROVIDER || 'anthropic').toLowerCase();
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? 4096;

  switch (provider) {
    case 'openai':
      return new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL || 'gpt-4o',
        temperature,
        maxTokens,
        apiKey: process.env.OPENAI_API_KEY,
      });

    case 'gemini':
      return new ChatGoogleGenerativeAI({
        modelName: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        temperature,
        maxOutputTokens: maxTokens,
        apiKey: process.env.GOOGLE_AI_API_KEY,
      });

    case 'ollama': {
      // Dynamic import to avoid hard dep when not used
      const { ChatOllama } = await import('@langchain/ollama').catch(() => ({ ChatOllama: null }));
      if (!ChatOllama) throw new Error('Install @langchain/ollama to use Ollama provider');
      return new ChatOllama({
        model: process.env.OLLAMA_MODEL || 'llama3',
        temperature,
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      });
    }

    case 'anthropic':
    default:
      return new ChatAnthropic({
        modelName: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        temperature,
        maxTokens,
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
  }
}
