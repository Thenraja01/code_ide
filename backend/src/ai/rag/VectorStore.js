import { ChromaClient } from 'chromadb';
import { embedText, embedTexts } from '../embeddings/EmbeddingService.js';

/**
 * VectorStore — Chroma-backed semantic search for project files.
 * 
 * Each project gets its own Chroma collection (namespaced by projectId).
 * Provides: index (upsert chunks), search (nearest-neighbor query), clear (drop collection).
 */

const chroma = new ChromaClient({
  path: process.env.CHROMA_URL || 'http://localhost:8000',
});

const COLLECTION_PREFIX = 'codespace_project_';

function collectionName(projectId) {
  // Sanitise to alphanumeric + underscores (Chroma requirement)
  return `${COLLECTION_PREFIX}${projectId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
}

/**
 * Index an array of code/text chunks into Chroma for a project.
 * @param {string} projectId
 * @param {Array<{id: string, content: string, metadata?: object}>} chunks
 */
export async function indexChunks(projectId, chunks) {
  if (!chunks.length) return;

  const collection = await chroma.getOrCreateCollection({
    name: collectionName(projectId),
    metadata: { projectId },
  });

  const ids = chunks.map((c) => c.id);
  const documents = chunks.map((c) => c.content);
  const metadatas = chunks.map((c) => c.metadata || {});
  const embeddings = await embedTexts(documents);

  await collection.upsert({ ids, documents, metadatas, embeddings });

  console.log(`[VectorStore] Indexed ${chunks.length} chunks for project ${projectId}`);
}

/**
 * Semantic search — returns top-k most relevant chunks for a query.
 * @param {string} projectId
 * @param {string} query
 * @param {number} topK
 * @returns {Array<{content: string, metadata: object, distance: number}>}
 */
export async function searchChunks(projectId, query, topK = 5) {
  try {
    const collection = await chroma.getCollection({
      name: collectionName(projectId),
    });

    const queryEmbedding = await embedText(query);

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      include: ['documents', 'metadatas', 'distances'],
    });

    const docs = results.documents[0] || [];
    const metas = results.metadatas[0] || [];
    const distances = results.distances[0] || [];

    return docs.map((content, i) => ({
      content,
      metadata: metas[i],
      distance: distances[i],
    }));
  } catch (err) {
    // Collection doesn't exist yet — return empty
    if (err.message?.includes('does not exist')) return [];
    console.error('[VectorStore] Search error:', err.message);
    return [];
  }
}

/**
 * Remove all indexed chunks for a project (e.g. on project deletion).
 */
export async function clearProjectIndex(projectId) {
  try {
    await chroma.deleteCollection({ name: collectionName(projectId) });
    console.log(`[VectorStore] Cleared index for project ${projectId}`);
  } catch (err) {
    console.warn('[VectorStore] Clear failed (may not exist):', err.message);
  }
}

/**
 * Build a RAG context string from semantic search results.
 * Prepends each chunk with its filename for better grounding.
 */
export function buildRagContext(chunks) {
  if (!chunks.length) return '';
  return chunks
    .map((c) => `// ${c.metadata?.filename || 'unknown'}\n${c.content}`)
    .join('\n\n---\n\n');
}
