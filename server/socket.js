const { WebSocketServer } = require("ws");
const Docker = require('dockerode');
const docker = new Docker();

function setupSockets(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      ws.close(1008, "Project ID required");
      return;
    }

    ws.projectId = projectId; 
    console.log(`[Socket] Connected → ${projectId}`);

    try {
      const container = docker.getContainer(`codespace-${projectId}`);
      const inspectData = await container.inspect();
      
      if (!inspectData.State.Running) {
        throw new Error("Container is not running");
      }

      const exec = await container.exec({
        Cmd: ['bash'],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        WorkingDir: '/app',
        Env: ['TERM=xterm-256color']
      });

      const stream = await exec.start({ hijack: true, stdin: true });

      stream.on('data', (chunk) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: "output", data: chunk.toString("utf8") }));
        }
      });

      ws.on("message", (message) => {
        try {
          const payload = JSON.parse(message.toString());
          if (payload.type === "input") {
            stream.write(payload.data);
          } else if (payload.type === "resize") {
            container.resize({ h: payload.rows, w: payload.cols }).catch(() => {});
          }
        } catch (err) {
          console.error("[Socket] Message error:", err.message);
        }
      });

      ws.on("close", () => {
        console.log(`[Socket] Disconnected → ${projectId}`);
        stream.end();
      });

      stream.on('end', () => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: "output", data: "\r\n[Process Exited]\r\n" }));
        }
      });

    } catch (error) {
      console.error(`[Socket] Error for ${projectId}:`, error.message);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "error", message: `Terminal error: ${error.message}` }));
      }
      ws.close();
    }
  });

  return wss;
}

module.exports = setupSockets;

