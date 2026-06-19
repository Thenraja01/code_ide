import { getProvider } from '../providers/ProviderFactory.js';
import { PROMPTS } from '../prompts/SystemPrompts.js';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

/**
 * DeveloperAgent — Handles all AI interactions in CodeSpace IDE.
 * 
 * Modes: chat | explain | bugs | tests | docs | agent | generate
 * Supports streaming via callback for WebSocket delivery.
 */
export class DeveloperAgent {
  constructor(options = {}) {
    this._options = options;
    this._model = null;
  }

  async _getModel() {
    if (!this._model) this._model = await getProvider(this._options);
    return this._model;
  }

  /**
   * Build a LangChain messages array from a history + system prompt.
   */
  _buildMessages(systemPrompt, userPrompt, history = []) {
    const messages = [new SystemMessage(systemPrompt)];

    for (const h of history) {
      if (h.role === 'user') messages.push(new HumanMessage(h.content));
      else if (h.role === 'assistant') messages.push(new AIMessage(h.content));
    }

    messages.push(new HumanMessage(userPrompt));
    return messages;
  }

  /**
   * Stream a response token-by-token, calling onToken for each chunk.
   * @param {string} mode - One of: chat | explain | bugs | tests | docs | agent | generate
   * @param {string} userPrompt - The user's input
   * @param {Function} onToken - Called with each text chunk as it arrives
   * @param {Array}  history - Previous messages for multi-turn context
   * @param {string} context - Optional injected context (e.g. file contents, docs URL content)
   */
  async stream(mode, userPrompt, onToken, history = [], context = '') {
    const systemPromptMap = {
      chat: PROMPTS.CHAT,
      explain: PROMPTS.CODE_EXPLAINER,
      bugs: PROMPTS.BUG_DETECTOR,
      tests: PROMPTS.TEST_GENERATOR,
      docs: PROMPTS.DOC_GENERATOR,
      agent: PROMPTS.AGENT,
      generate: PROMPTS.CODE_GENERATOR,
      code: PROMPTS.CODE_ASSISTANT,
    };

    const systemPrompt = systemPromptMap[mode] || PROMPTS.CHAT;

    const fullPrompt = context
      ? `Context:\n${context}\n\n---\n\n${userPrompt}`
      : userPrompt;

    const messages = this._buildMessages(systemPrompt, fullPrompt, history);

    const model = await this._getModel();
    const stream = await model.stream(messages);

    let fullResponse = '';
    for await (const chunk of stream) {
      const token = chunk.content ?? '';
      if (token) {
        fullResponse += token;
        onToken(token);
      }
    }

    return fullResponse;
  }

  /**
   * Non-streaming invoke — returns the full response string.
   */
  async invoke(mode, userPrompt, history = [], context = '') {
    let fullResponse = '';
    await this.stream(mode, userPrompt, (token) => { fullResponse += token; }, history, context);
    return fullResponse;
  }
}

// Singleton instance used across controllers
export const developerAgent = new DeveloperAgent();
