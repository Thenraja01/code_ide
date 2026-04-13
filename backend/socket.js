const { WebSocketServer } = require("ws");
const Docker = require("dockerode");
const path = require("path");
const fs = require("fs");

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

    let container;

    try {
      const workspacePath = path.join(process.cwd(), "workspace", projectId);

      /* ------------------- CREATE WORKSPACE ------------------- */
      if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
      }

      /* ------------------- GET OR CREATE CONTAINER ------------------- */
      try {
        container = docker.getContainer(`codespace-${projectId}`);
        await container.inspect();
      } catch {
        console.log(`[Docker] Creating container → ${projectId}`);

        container = await docker.createContainer({
          Image: "node:18",
          name: `codespace-${projectId}`,
          Tty: true,
          OpenStdin: true,
          WorkingDir: "/workspace",
          Cmd: ["bash"],
          Env: ["TERM=xterm-256color"],

          HostConfig: {
            Binds: [
              `${workspacePath}:/workspace` // 🔥 mount workspace
            ],
            Memory: 200 * 1024 * 1024, // 200MB
            CpuShares: 512,
            NetworkMode: "none" // 🔒 no internet
          }
        });

        await container.start();
      }

      /* ------------------- START TERMINAL ------------------- */
      const exec = await container.exec({
        Cmd: ["bash"],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        WorkingDir: "/workspace"
      });

      const stream = await exec.start({
        hijack: true,
        stdin: true
      });

      /* ------------------- OUTPUT ------------------- */
      stream.on("data", (chunk) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: "output",
            data: chunk.toString("utf8")
          }));
        }
      });

      /* ------------------- INPUT ------------------- */
      ws.on("message", (message) => {
        try {
          const payload = JSON.parse(message.toString());

          if (payload.type === "input") {
            if (payload.data.length > 1000) return; // 🔒 limit input
            stream.write(payload.data);
          }

          if (payload.type === "resize") {
            container.resize({
              h: payload.rows,
              w: payload.cols
            }).catch(() => {});
          }

        } catch (err) {
          console.error("[Socket] Message error:", err.message);
        }
      });

      /* ------------------- CLEANUP ------------------- */
      ws.on("close", () => {
        console.log(`[Socket] Disconnected → ${projectId}`);
        stream.end();

        // Auto remove after 10 mins
        setTimeout(async () => {
          try {
            await container.stop();
            await container.remove();
            console.log(`[Docker] Removed → ${projectId}`);
          } catch {}
        }, 10 * 60 * 1000);
      });

      /* ------------------- EXIT EVENT ------------------- */
      stream.on("end", () => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: "output",
            data: "\r\n[Process Exited]\r\n"
          }));
        }
      });

    } catch (error) {
      console.error(`[Socket] Error for ${projectId}:`, error.message);

      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: "error",
          message: `Terminal error: ${error.message}`
        }));
      }

      ws.close();
    }
  });

  return wss;
}

module.exports = setupSockets;
