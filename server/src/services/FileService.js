const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');

class FileService {
  async syncToDisk(projectId) {
    const rawPath = path.resolve(__dirname, '../../workspaces', projectId);
    const workspacePath = rawPath.replace(/\\/g, '/');

    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    const files = await prisma.file.findMany({
      where: { projectId }
    });

    const fileMap = new Map();
    files.forEach(f => fileMap.set(f.id, f));

    const buildPath = (file) => {
      let parts = [];
      let current = file;
      while (current && current.name !== 'root') {
        parts.unshift(current.name);
        current = fileMap.get(current.parentId);
      }
      return path.join(workspacePath, ...parts);
    };

    // 1. Create all folders first
    for (const file of files) {
      if (file.type === 'FOLDER') {
        const folderPath = buildPath(file);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
      }
    }

    // 2. Create all files
    for (const file of files) {
      if (file.type === 'FILE') {
        const filePath = buildPath(file);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, file.content || '');
      }
    }

    console.log(`[FileService] Project ${projectId} synced to disk at ${workspacePath}`);
  }

  async syncToDb(projectId) {
    const rawPath = path.resolve(__dirname, '../../workspaces', projectId);
    const workspacePath = rawPath.replace(/\\/g, '/');
    
    if (!fs.existsSync(workspacePath)) return;

    // Clear existing
    await prisma.file.deleteMany({ where: { projectId } });

    const rootFolder = await prisma.file.create({
      data: { name: 'root', type: 'FOLDER', projectId }
    });

    const walk = async (dir, parentId) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') continue;
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const folder = await prisma.file.create({
            data: { name: entry.name, type: 'FOLDER', projectId, parentId }
          });
          await walk(fullPath, folder.id);
        } else {
          // It's a file
          const content = fs.readFileSync(fullPath, 'utf8');
          await prisma.file.create({
            data: { name: entry.name, type: 'FILE', projectId, parentId, content }
          });
        }
      }
    };

    await walk(workspacePath, rootFolder.id);
    console.log(`[FileService] Project ${projectId} synced to DB from disk`);
  }

  async updateFileContent(fileId, content) {
    const file = await prisma.file.update({
      where: { id: fileId },
      data: { content }
    });
    // Auto sync on specific update
    await this.syncToDisk(file.projectId);
    return file;
  }
}

module.exports = new FileService();
