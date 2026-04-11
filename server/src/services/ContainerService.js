const Docker = require('dockerode');
const path = require('path');
const fs = require('fs');

class ContainerService {
  constructor() {
    this.docker = new Docker();
    this.containers = new Map();
    this.portCounter = 30000;
  }

  getAvailablePort() {
    this.portCounter += 1;
    return this.portCounter.toString();
  }

  async createContainer(projectId, language) {
    const rawPath = path.resolve(__dirname, '../../workspaces', projectId);
    const workspacePath = rawPath.replace(/\\/g, '/');
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    try {
      const existing = await this.getOrRecoverContainer(projectId);
      if (existing) {
        let inspectData = await existing.inspect();
        if (!inspectData.State.Running) {
           await existing.start();
           inspectData = await existing.inspect(); // Refresh post-start
        }
        
        let existingHostPort = null;
        if (inspectData.NetworkSettings && inspectData.NetworkSettings.Ports) {
           for (const [key, mapping] of Object.entries(inspectData.NetworkSettings.Ports)) {
              if (mapping && mapping[0] && mapping[0].HostPort) {
                 existingHostPort = mapping[0].HostPort;
                 break;
              }
           }
        }
        
        return { 
           id: existing.id, 
           status: 'running', 
           ports: inspectData.NetworkSettings.Ports, 
           previewUrl: existingHostPort ? `http://localhost:${existingHostPort}` : null 
        };
      }
    } catch (e) {
      // Ignored
    }

    let Image = '';
    let Cmd = ['bash', '-c', 'while sleep 3600; do :; done'];
    let exposedPort = "3000";

    switch (language?.toLowerCase()) {
      case 'react':
        Image = 'node:18-slim';
        exposedPort = "5173";
        break;
      case 'next':
      case 'node':
      case 'express':
      case 'vanilla':
      case 'javascript':
        Image = 'node:18-slim';
        exposedPort = "3000";
        break;
      case 'flask':
      case 'fastapi':
      case 'python':
        Image = 'python:3.10-slim';
        exposedPort = "5000";
        break;
      default:
        Image = 'node:18-slim';
    }

    const hostPort = this.getAvailablePort();

    try {
      console.log(`[Docker] Pulling/Checking image: ${Image}`);
      const stream = await this.docker.pull(Image);
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
      });

      const container = await this.docker.createContainer({
        Image,
        Cmd,
        name: `codespace-${projectId}`,
        ExposedPorts: {
           [`${exposedPort}/tcp`]: {}
        },
        HostConfig: {
          Binds: [`${workspacePath}:/app`],
          PortBindings: {
            [`${exposedPort}/tcp`]: [{ HostPort: hostPort }]
          },
          Memory: 512 * 1024 * 1024,
          MemorySwap: 512 * 1024 * 1024,
          CpuPeriod: 100000,
          CpuQuota: 50000,
          NetworkMode: 'bridge', 
          AutoRemove: true,
        },
        WorkingDir: '/app',
        Tty: true,
        OpenStdin: true
      });

      await container.start();
      this.containers.set(projectId, container);
      
      const inspectData = await container.inspect();
      return { 
        id: container.id, 
        status: 'running', 
        ports: inspectData.NetworkSettings.Ports,
        previewUrl: `http://localhost:${hostPort}`
      };
    } catch (error) {
      console.error('Docker Error:', error);
      throw error;
    }
  }

  async getOrRecoverContainer(projectId) {
    if (this.containers.has(projectId)) {
      return this.containers.get(projectId);
    }
    try {
      const container = this.docker.getContainer(`codespace-${projectId}`);
      const inspectData = await container.inspect(); // Reaching here means it physically exists
      this.containers.set(projectId, container);
      return container;
    } catch (e) {
      return null;
    }
  }

  async executeInContainer(projectId, command) {
    const container = await this.getOrRecoverContainer(projectId);
    if (!container) throw new Error('Container not found or not running');

    const exec = await container.exec({
      Cmd: ['bash', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true
    });

    const stream = await exec.start({ hijack: true });
    return stream;
  }

  async stopContainer(projectId) {
    try {
      const container = this.docker.getContainer(`codespace-${projectId}`);
      await container.stop();
      this.containers.delete(projectId);
    } catch(e) {}
  }
}

module.exports = new ContainerService();
