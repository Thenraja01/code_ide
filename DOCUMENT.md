# CodeSpace IDE — Project Documentation

> A cloud-based, VS Code-like Online IDE with real-time Docker container execution, WebSocket terminal, file system management, GitHub integration, and AI code assistance.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Backend API Reference](#6-backend-api-reference)
7. [WebSocket Terminal Protocol](#7-websocket-terminal-protocol)
8. [Frontend Component Map](#8-frontend-component-map)
9. [Services Reference](#9-services-reference)
10. [Environment Variables](#10-environment-variables)
11. [Setup & Installation](#11-setup--installation)
12. [Project Initialization Flow](#12-project-initialization-flow)
13. [Docker Integration](#13-docker-integration)
14. [Known Issues & Fixes Applied](#14-known-issues--fixes-applied)
15. [Security Considerations](#15-security-considerations)

---

## 1. Project Overview

**CodeSpace IDE** is a full-stack MERN (MongoDB, Express, React, Node.js) application that provides a browser-based code editor and execution environment. Each project runs inside an isolated Docker container, giving users a safe, sandboxed environment to write, run, and preview code in real time.

### Key Features

| Feature | Description |
|---------|-------------|
| 🗂️ File Explorer | Hierarchical file/folder tree stored in MongoDB |
| ✏️ Monaco Editor | VS Code's editor engine with syntax highlighting |
| 🐳 Docker Isolation | Every project gets a dedicated Docker container |
| 📡 WebSocket Terminal | Real-time interactive bash shell via xterm.js |
| 🔐 Auth System | JWT + Google OAuth (Firebase) + Email OTP verification |
| 🤖 AI Assistant | Integrated AI code help panel |
| 🐙 GitHub Sync | Create and push repositories from the IDE |
| 👁️ Live Preview | Expose container ports and view running apps |
| 📊 Dashboard | Stats, recent projects, settings |

---

## 2. Tech Stack

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.2.1 | HTTP server & routing |
| `@prisma/client` | ^5.22.0 | MongoDB ORM |
| `dockerode` | ^4.0.10 | Docker daemon API client |
| `ws` | ^8.20.0 | WebSocket server |
| `jsonwebtoken` | ^9.0.3 | JWT authentication |
| `bcryptjs` | ^3.0.2 | Password hashing |
| `firebase-admin` | ^13.7.0 | Google OAuth verification |
| `helmet` | ^8.1.0 | HTTP security headers |
| `cors` | ^2.8.6 | Cross-origin resource sharing |
| `express-rate-limit` | ^8.3.2 | API rate limiting |
| `nodemon` | ^3.1.14 | Dev auto-restart |

### Frontend
| Package | Purpose |
|---------|---------|
| React + TypeScript | UI framework |
| Vite | Build tool |
| TanStack Query | Server-state management & caching |
| Zustand | Client-side state management |
| Monaco Editor | Code editing engine |
| xterm.js + FitAddon | Terminal emulator |
| Framer Motion | Animations |
| Lucide React | Icons |
| Axios | HTTP client |
| shadcn/ui | UI component library |
| React Router DOM | Client routing |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │
│  │ Dashboard│  │Monaco    │  │ Terminal  │  │  AI Panel   │  │
│  │ (React)  │  │ Editor   │  │ (xterm.js)│  │             │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬──────┘  │
│       │              │              │                │         │
│       └──────────────┴──────────────┴────────────────┘         │
│                     Axios / WebSocket                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP (port 5000)
                    WS  (port 5000)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     EXPRESS SERVER                              │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐│
│  │/api/auth │ │/api/files│ │/api/proj-│ │  WebSocket Server  ││
│  │          │ │          │ │ects      │ │  (socket.js)       ││
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘│
│                                                                 │
│  Services: FileService │ ContainerService │ PreviewService      │
└────────────────────────┬─────────────────────────────┬──────────┘
                         │                             │
              ┌──────────▼──────────┐      ┌──────────▼──────────┐
              │   MongoDB Atlas     │      │   Docker Engine      │
              │   (via Prisma)      │      │                      │
              │                     │      │  codespace-<id>      │
              │  User, Project,     │      │  ├── /app (mounted)  │
              │  File, Execution    │      │  └── bash shell      │
              └─────────────────────┘      └─────────────────────┘
                                                      ▲
                                           server/workspaces/<id>/
```

---

## 4. Project Structure

```
code_ide/
├── client/
│   └── code_ide/
│       └── src/
│           ├── api/                    # Axios API call functions
│           │   ├── axios.ts            # Axios instance + auth interceptor
│           │   ├── auth.api.ts
│           │   ├── file.api.ts
│           │   ├── project.api.ts
│           │   ├── github.api.ts
│           │   ├── stats.api.ts
│           │   └── user.api.ts
│           ├── hooks/                  # TanStack Query hooks
│           │   ├── useAuth.hooks.ts
│           │   ├── useFile.hooks.ts
│           │   ├── useProject.hooks.ts
│           │   ├── useExecution.hooks.ts
│           │   ├── useGithub.hooks.ts
│           │   ├── useStats.hooks.ts
│           │   └── useAI.ts
│           ├── store/
│           │   └── useEditorStore.ts   # Zustand: open tabs state
│           ├── components/
│           │   ├── Editor/
│           │   │   ├── CodeEditor.tsx  # Main IDE layout
│           │   │   └── parts/
│           │   │       ├── ActivityBar.tsx
│           │   │       ├── Sidebar.tsx      # File explorer
│           │   │       ├── EditorTabs.tsx
│           │   │       ├── MonacoEditor.tsx
│           │   │       ├── TopBar.tsx
│           │   │       ├── StatusBar.tsx
│           │   │       ├── AIPanel.tsx
│           │   │       └── NewFileDialog.tsx
│           │   ├── Terminal/
│           │   │   └── TerminalPanel.tsx   # xterm.js WebSocket terminal
│           │   └── Preview/
│           │       └── PreviewPanel.tsx
│           └── layers_UI/
│               └── Section/
│                   └── Dashboard/          # Dashboard pages
│                       ├── Home.tsx
│                       ├── Settings.tsx
│                       ├── Starred.tsx
│                       └── components/
│                           ├── ProjectTable/
│                           └── RecentActivity.tsx
│
└── server/
    ├── server.js           # HTTP server + WebSocket setup entry
    ├── main.js             # Express app, middleware, route mounting
    ├── socket.js           # WebSocket terminal handler
    ├── prisma/
    │   └── schema.prisma   # MongoDB data models
    ├── src/
    │   ├── routes/         # Express routers
    │   │   ├── auth.route.js
    │   │   ├── file.route.js
    │   │   ├── project.route.js
    │   │   ├── execution.route.js
    │   │   ├── github.route.js
    │   │   ├── stats.route.js
    │   │   └── user.route.js
    │   ├── middlewares/
    │   │   └── auth.middleware.js   # JWT verification
    │   └── utils/
    │       ├── hash.js
    │       └── generateToken.js
    ├── service/
    │   ├── ContainerService.js  # Docker lifecycle management
    │   ├── FileService.js       # DB → Disk file sync
    │   ├── PreviewService.js    # Live preview port management
    │   ├── TerminalService.js   # (Legacy — replaced by socket.js)
    │   └── github.service.js   # GitHub API operations
    └── workspaces/              # Host-side project files (mounted to Docker)
        └── <projectId>/
```

---

## 5. Database Schema

### User
```prisma
model User {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  name            String?
  email           String    @unique
  password        String?         // null for OAuth users
  avatar          String?
  provider        String    @default("local")   // "local" | "google"
  otpCode         String?
  otpExpiresAt    DateTime?
  isEmailVerified Boolean   @default(false)
  projects        Project[]
  aiPrompts       AIPrompt[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### Project
```prisma
model Project {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  language    String              // "react" | "express" | "vanilla" | "fastapi"
  isPublic    Boolean   @default(false)
  userId      String    @db.ObjectId
  files       File[]
  executions  Execution[]
  versions    Version[]
  aiPrompts   AIPrompt[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### File
```prisma
model File {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  content   String?
  type      FileType            // FILE | FOLDER
  projectId String    @db.ObjectId
  parentId  String?   @db.ObjectId    // null = root level
  children  File[]    @relation("FolderStructure")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

### Execution
```prisma
model Execution {
  id        String          @id
  code      String
  output    String?
  error     String?
  status    ExecutionStatus  // PENDING | RUNNING | SUCCESS | FAILED
  projectId String
  createdAt DateTime
}
```

---

## 6. Backend API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register with email/password |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `POST` | `/api/auth/google` | ❌ | Google OAuth login (Firebase token) |
| `POST` | `/api/auth/verify-otp` | ✅ | Verify email OTP |

### Projects — `/api/projects`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/projects` | ✅ | List all projects for current user |
| `POST` | `/api/projects` | ✅ | Create project + seed files + start container |
| `DELETE` | `/api/projects/:id` | ✅ | Delete project and stop container |
| `POST` | `/api/projects/:id/initialize` | ✅ | Re-sync files + restart container |

**POST `/api/projects` body:**
```json
{
  "title": "My App",
  "description": "Optional",
  "language": "react"
}
```

**Response:**
```json
{
  "id": "<projectId>",
  "title": "My App",
  "language": "react",
  "containerStatus": "started"
}
```

### Files — `/api/files`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/files?projectId=&parentId=` | ✅ | List files (all or by parent) |
| `POST` | `/api/files` | ✅ | Create file or folder |
| `PUT` | `/api/files/:id` | ✅ | Update file content |
| `DELETE` | `/api/files/:id` | ✅ | Delete file or folder |
| `PUT` | `/api/files/move/:id` | ✅ | Move file to new parent |

### Execution — `/api/execute`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/execute/command` | ✅ | Run command in container (non-streaming) |
| `POST` | `/api/execute/preview/start` | ✅ | Start live preview server |
| `POST` | `/api/execute/preview/stop` | ✅ | Stop live preview server |

### Users — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/api/user/profile` | ✅ | Update name/email |
| `POST` | `/api/user/verify-otp` | ✅ | Confirm email change via OTP |
| `PUT` | `/api/user/password` | ✅ | Change password |

### GitHub — `/api/github`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/github/create-repo` | ✅ | Create GitHub repository |
| `POST` | `/api/github/push` | ✅ | Push workspace files to GitHub |

---

## 7. WebSocket Terminal Protocol

### Connection
```
ws://localhost:5000?projectId=<projectId>
```

The server looks up the Docker container named `codespace-<projectId>`, verifies it is running, then opens an interactive `bash` exec session inside it.

### Messages: Frontend → Backend

**Send keystroke input:**
```json
{ "type": "input", "data": "ls -la\n" }
```

**Send terminal resize:**
```json
{ "type": "resize", "rows": 24, "cols": 80 }
```

### Messages: Backend → Frontend

**Normal output:**
```json
{ "type": "output", "data": "total 8\ndrwxr-xr-x ..." }
```

**Shell exited:**
```json
{ "type": "output", "data": "\r\n[Process Exited]\r\n" }
```

**Error (container not found etc.):**
```json
{ "type": "error", "message": "Terminal error: Container is not running" }
```

### How it works (socket.js)
```
Browser xterm.js
     │
     │  WS message { type: "input", data: "ls\n" }
     ▼
socket.js
     │  stream.write(payload.data)
     ▼
Docker exec (bash) running in codespace-<id>
     │  stdout/stderr
     ▼
socket.js stream.on("data")
     │  ws.send({ type: "output", data: "..." })
     ▼
Browser xterm.js renders output
```

---

## 8. Frontend Component Map

### CodeEditor.tsx (Main IDE)
Orchestrates all IDE sub-components. On mount:
1. Calls `initializeProject(projectId)` → ensures container is running
2. Fetches all project files via `useFilesQuery`
3. Maps files to Monaco editor tabs
4. Auto-saves file edits with 1.5s debounce via `useUpdateFileMutation`

### TerminalPanel.tsx
- Initializes `xterm.js` Terminal
- Connects to `ws://localhost:5000?projectId=...`
- Sends every keystroke as `{ type: "input", data }` over WebSocket
- Writes all received `output` payloads directly to xterm

### Sidebar.tsx (File Explorer)
- Renders all files and folders from the files array
- Folder icon for `type === "FOLDER"`, colored file icon based on extension
- Buttons to create new FILE or FOLDER

### ProjectTable.tsx (Dashboard)
- Lists all user projects
- "New Project" dialog: sets title, language, optional GitHub sync
- On create → navigates to `/dashboard/editor/:projectId`

---

## 9. Services Reference

### FileService (`service/FileService.js`)
```js
FileService.syncToDisk(projectId)
```
- Queries all files for the project from MongoDB
- Builds the full relative path for each file by traversing `parentId` chain
- Creates directories recursively before writing files
- Writes file content to `server/workspaces/<projectId>/...`
- Path is normalized to forward slashes for Docker compatibility

```js
FileService.updateFileContent(fileId, content)
```
- Updates content field in MongoDB

### ContainerService (`service/ContainerService.js`)
```js
ContainerService.createContainer(projectId, language)
```
- Checks for existing container (by name) and recovers it if already running
- Pulls Docker image if not cached
- Creates container with:
  - Volume: `server/workspaces/<projectId>` → `/app`
  - WorkingDir: `/app`
  - Memory: 512MB | CPU: 0.5 core
  - Auto `npm install` for Node projects
- Starts container and stores reference in memory Map

```js
ContainerService.getOrRecoverContainer(projectId)
```
- First checks in-memory Map
- Falls back to querying Docker daemon by container name
- Handles backend restarts gracefully (re-adopts orphan containers)

```js
ContainerService.stopContainer(projectId)
```
- Stops and removes the container
- Removes from memory Map

---

## 10. Environment Variables

### Server (`server/.env`)
```env
PORT=5000
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>/code_ide
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### Client (`client/code_ide/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

---

## 11. Setup & Installation

### Prerequisites
- Node.js ≥ 18
- Docker Desktop (running)
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone <repo-url>
cd code_ide
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `server/.env` (see [Environment Variables](#10-environment-variables))

```bash
# Generate Prisma client
npx prisma generate

# Start backend in development mode
npm run dev
```

### 3. Frontend Setup
```bash
cd client/code_ide
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Start Docker Desktop
Open Docker Desktop and wait for the whale icon to stop animating.

Verify:
```bash
docker info
```

---

## 12. Project Initialization Flow

When a user clicks **"Create Workspace"**:

```
1. POST /api/projects
   │
   ├── Insert Project into MongoDB
   │
   ├── Create file structure in MongoDB:
   │   ├── root/ (FOLDER)
   │   ├── root/package.json (FILE) ← template based on language
   │   ├── src/ (FOLDER)
   │   └── src/App.js (FILE)
   │
   ├── FileService.syncToDisk(projectId)
   │   └── Writes files to server/workspaces/<projectId>/
   │
   ├── ContainerService.createContainer(projectId, language)
   │   ├── docker pull node:18
   │   ├── docker create --name codespace-<id> -v <workspace>:/app ...
   │   └── docker start codespace-<id>
   │
   └── HTTP 200 → { ...project, containerStatus: "started" }

2. Frontend navigates to /dashboard/editor/<projectId>

3. CodeEditor mounts:
   ├── initializeProject(projectId) → POST /api/projects/:id/initialize
   ├── useFilesQuery(projectId) → GET /api/files?projectId=
   └── TerminalPanel connects: ws://localhost:5000?projectId=<id>
```

---

## 13. Docker Integration

### Container Naming
Each project container is named: `codespace-<projectId>`

### Image Selection by Language
| Language | Docker Image | Auto-run |
|----------|-------------|----------|
| `react` | `node:18` | `npm install` on start |
| `express` | `node:18` | `npm install` on start |
| `vanilla` | `node:18` | `npm install` on start |
| `fastapi` | `python:3.10` | — |

### Volume Mount
```
Host: server/workspaces/<projectId>/
  ↕ (bind mount)
Container: /app/
```

### Resource Limits
- Memory: **512 MB**
- CPU: **0.5 cores** (CpuQuota: 50000 / CpuPeriod: 100000)

### Port Bindings (Dynamic)
| Container Port | Use |
|---------------|-----|
| 3000 | Express / Node servers |
| 5173 | Vite dev server (React) |
| 8000 | FastAPI server |

---

## 14. Known Issues & Fixes Applied

| Issue | Root Cause | Fix Applied |
|-------|-----------|-------------|
| `argument handler must be a function` | `project.controller.js` had no exports | Rewrote controller with proper `exports.fn` syntax |
| Files not showing in frontend | `getFiles` always filtered `parentId: null` | Made parentId filter optional — returns all project files when omitted |
| Folders not visible in sidebar | Frontend filtered out `type === 'FOLDER'` | Removed filter; all entries passed to Sidebar |
| Terminal silent (no output) | `startShell` returned `{ stdin, stdout }` object but dockerode Tty stream needs direct `.on("data")` on root stream | Moved exec + stream directly into `socket.js` using dockerode |
| Docker `ENOENT pipe` crash | Backend crashed on 500 when Docker was offline | Wrapped container creation in try/catch; project saves to DB even if Docker offline |
| Container lost after nodemon restart | Server RAM Map cleared on restart | `getOrRecoverContainer()` queries Docker daemon by name to re-adopt orphan containers |
| Windows path Docker volume failure | `path.resolve()` returns `C:\...` backslashes | Normalized all workspace paths with `.replace(/\\/g, '/')` |
| Duplicate container on re-init | Every `initializeProject` call tried to create a new container | Recovery check by container name before creating |

---

## 15. Security Considerations

| Area | Measure |
|------|---------|
| Authentication | All `/api/*` routes (except `/auth`) protected by JWT middleware |
| Rate Limiting | 100 requests / 15 min per IP via `express-rate-limit` |
| HTTP Headers | `helmet` adds security headers (XSS, HSTS, etc.) |
| Container Isolation | Each project runs in its own Docker container (no shared filesystem) |
| Resource Limits | CPU and RAM capped per container to prevent abuse |
| Input Validation | `joi` used for request body validation |
| Password Storage | bcryptjs hash (no plaintext passwords stored) |
| OTP Expiry | Email verification OTPs expire after 10 minutes |
| XSS Cleaning | `xss-clean` middleware sanitizes request body |
| CORS | Configured to allow only expected origins |

---

*Generated: April 2026 | CodeSpace IDE Final Year Project*
