const chokidar = require('chokidar');
const path = require('path');
const FileService = require('./FileService');

class WatcherService {
  init(wss) {
    const workspacesPath = path.resolve(__dirname, '../../workspaces').replace(/\\/g, '/');
    
    console.log(`[Watcher] Initializing file watcher for: ${workspacesPath}`);

    this.watcher = chokidar.watch(workspacesPath, {
      ignored: [/node_modules/, /\.next/, /\.git/],
      persistent: true,
      ignoreInitial: true,
      depth: 10,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      }
    });

    const syncDebounce = new Map();

    this.watcher.on('all', (event, filePath) => {
      const normalizedPath = filePath.replace(/\\/g, '/');
      const relative = path.relative(workspacesPath, normalizedPath);
      const projectId = relative.split('/')[0];

      if (!projectId || projectId.length < 5) return;

      if (syncDebounce.has(projectId)) {
        clearTimeout(syncDebounce.get(projectId));
      }

      syncDebounce.set(projectId, setTimeout(async () => {
        try {
          console.log(`[Watcher] Triggering sync for ${projectId} due to changes`);
          await FileService.syncToDb(projectId);
          
          // Notify connected clients for this project
          wss.clients.forEach(client => {
            if (client.projectId === projectId && client.readyState === 1) {
              client.send(JSON.stringify({ type: 'filesChanged' }));
            }
          });
        } catch (err) {
          console.error(`[Watcher] Sync failed for ${projectId}:`, err.message);
        } finally {
          syncDebounce.delete(projectId);
        }
      }, 500));
    });
  }
}

module.exports = new WatcherService();
