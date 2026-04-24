import 'dotenv/config';
import http from 'http';
import app from './main.js';

console.log("DEBUG: process.env.FIREBASE_PROJECT_ID =", process.env.FIREBASE_PROJECT_ID);
console.log("DEBUG: process.env.PORT =", process.env.PORT);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

process.on("uncaughtException", (err) => {
  console.error("[Fatal Error]", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[Promise Error]", err);
});

server.listen(PORT, () => {
  console.log(`🚀 Online IDE Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Fatal Error] Port ${PORT} already in use. Try killing any node process holding port 5000.`);
    process.exit(1);
  } else {
    throw err;
  }
});
