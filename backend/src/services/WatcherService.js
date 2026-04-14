const chokidar = require('chokidar');
const path = require('path');
const FileService = require('./FileService');

class WatcherService {
  init(wss) {
    const workspacesPath = path.resolve(process.cwd(), 'workspaces');

  console.log(`[Watcher] Watching: ${workspacesPath}`);

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

    if (!projectId || !/^[a-zA-Z0-9_-]+$/.test(projectId)) return;

    if (syncDebounce.has(projectId)) {
      clearTimeout(syncDebounce.get(projectId));
    }

    syncDebounce.set(projectId, setTimeout(async () => {
      try {
        console.log(`[Watcher] Sync → ${projectId}`);

        await FileService.syncToDb(projectId);

        wss.clients.forEach(client => {
          if (client.projectId === projectId && client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'filesChanged',
              file: relative,
              event
            }));
          }
        });

      } catch (err) {
        console.error(`[Watcher] Sync failed:`, err.message);
      } finally {
        syncDebounce.delete(projectId);
      }
    }, 500));
  });

  process.on("SIGINT", () => {
    this.watcher.close();
    console.log("[Watcher] Closed");
    process.exit();
  });
}

}

module.exports = new WatcherService();
