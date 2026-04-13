require('dotenv').config();
const http = require('http');
const app = require('./main.js');
const setupSockets = require('./socket.js');
const WatcherService = require('./src/services/WatcherService.js');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const wss = setupSockets(server);

try {
  WatcherService.init(wss);
  console.log("[Watcher] Initialized");
} catch (err) {
  console.error("[Watcher] Failed:", err.message);
}

process.on("uncaughtException", (err) => {
  console.error("[Fatal Error]", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[Promise Error]", err);
});
server.listen(PORT, () => {
  console.log(`🚀 Online IDE Server running on port ${PORT}`);
});
