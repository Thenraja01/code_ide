require('dotenv').config();
const http = require('http');
const app = require('./main.js');
const setupSockets = require('./socket.js');
const WatcherService = require('./src/services/WatcherService.js');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize WebSocket system and File Watcher
const wss = setupSockets(server);
WatcherService.init(wss);

server.listen(PORT, () => {
  console.log(`[Server] Online IDE running on port ${PORT}`);
});

