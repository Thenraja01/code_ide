const prisma = require('../config/db');
const FileService = require('../services/FileService');
const ContainerService = require('../services/ContainerService');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);

exports.getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user?.userId },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects", details: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, title, description, language, framework } = req.body;
    const userId = req.user?.userId;
    const lang = framework || language || "react";
    const projTitle = title || name || "Untitled Project";

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = await prisma.project.create({
      data: {
        title: projTitle,
        description: description || "",
        language: lang,
        userId
      }
    });

    const rootPath = path.resolve(__dirname, '../../workspaces', project.id);
    const workspacePath = rootPath.replace(/\\/g, '/');
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    if (lang === "react") {
      await execPromise(`npx create-vite@latest . --template react --yes`, { cwd: workspacePath });
    } else if (lang === "node") {
      await execPromise(`npm init -y`, { cwd: workspacePath });
      fs.writeFileSync(path.join(workspacePath, 'index.js'), "console.log('Hello World');");
      const pkgPath = path.join(workspacePath, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkg.scripts = { start: "node index.js", dev: "nodemon index.js" };
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    } else if (lang === "flask" || lang === "python") {
      fs.writeFileSync(path.join(workspacePath, 'app.py'), "from flask import Flask\napp = Flask(__name__)\n\n@app.route('/')\ndef hello():\n    return 'Hello, Flask!'\n\nif __name__ == '__main__':\n    app.run(host='0.0.0.0', port=5000)\n");
      fs.writeFileSync(path.join(workspacePath, 'requirements.txt'), "flask\nwerkzeug\n");
    } else if (lang === "next") {
      await execPromise(`npx create-next-app@latest . --use-npm --no-tailwind --no-eslint --app --src-dir --import-alias "@/*" --yes`, { cwd: workspacePath });
    }

    // Sync generated files back to DB
    await FileService.syncToDb(project.id);

    // Start container
    let containerStatus = "failed";
    let previewUrl = null;
    try {
      const containerData = await ContainerService.createContainer(project.id, lang);
      containerStatus = "started";
      previewUrl = containerData.previewUrl;
      
      // Auto-install
      await ContainerService.executeInContainer(project.id, "npm install || pip install -r requirements.txt || true");
    } catch (dockerError) {
      console.warn(`Docker failed: ${dockerError.message}`);
    }

    res.json({ ...project, containerStatus, previewUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project", details: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Stop and remove docker container first
    try {
      await ContainerService.stopContainer(id);
    } catch (e) {}

    // Physically delete directory
    const rootPath = path.resolve(__dirname, '../../workspaces', id);
    if (fs.existsSync(rootPath)) {
      fs.rmSync(rootPath, { recursive: true, force: true });
    }

    await prisma.file.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    res.json({ message: "Project permanently deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project", details: error.message });
  }
};

exports.initializeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    await FileService.syncToDisk(id);
    let containerStatus = "failed";
    let previewUrl = null;
    try {
      const containerData = await ContainerService.createContainer(project.id, project.language);
      containerStatus = "running";
      previewUrl = containerData.previewUrl;
    } catch(dockerErr) {}
    
    res.json({ message: "Project initialized successfully", containerStatus, previewUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize project", details: error.message });
  }
};
