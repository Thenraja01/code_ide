import 'dotenv/config';
import http from 'http';
import { WebSocketServer } from 'ws';
import { parse } from 'url';
import app from './main.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ─── WebSocket Server for real-time AI streaming ──────────────────────────────
const wss = new WebSocketServer({ server });

// Map of sessionId → WebSocket client for targeted message delivery
const clients = new Map();

wss.on('connection', (ws, req) => {
  const { query } = parse(req.url, true);
  const sessionId = query.sessionId;

  if (sessionId) {
    clients.set(sessionId, ws);
    console.log(`[WS] Client connected — sessionId: ${sessionId}`);
  }

  ws.on('close', () => {
    if (sessionId) {
      clients.delete(sessionId);
      console.log(`[WS] Client disconnected — sessionId: ${sessionId}`);
    }
  });

  ws.on('error', (err) => {
    console.error(`[WS] Error for session ${sessionId}:`, err.message);
  });
});

// Export so AI controllers can push tokens directly to the right client
export { clients };

process.on("uncaughtException", (err) => {
  console.error("[Fatal Error]", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[Promise Error]", err);
});

server.listen(PORT, () => {
  console.log(`🚀 Online IDE Server running on port ${PORT}`);
  console.log(`🔌 WebSocket Server ready on ws://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Fatal Error] Port ${PORT} already in use.`);
    process.exit(1);
  } else {
    throw err;
  }
});
