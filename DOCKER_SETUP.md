# Docker Development Setup Guide

**Project:** S.S. Global Public School  
**Environment:** Development (`docker-compose.dev.yml`)  
**Database:** MongoDB Atlas (Only database; zero local MongoDB containers)

---

## 1. Architecture Overview

The development environment runs as an isolated two-tier containerized stack orchestrated via Docker Compose:

```text
       Developer Browser (Host)
        │                 │
        │ :5173           │ :5000 (direct)
        ▼                 ▼
 ┌─────────────────┐   ┌──────────────────┐
 │ frontend        │   │ backend          │
 │ (Vite Dev)      │──>│ (Node.js/Express)│
 └─────────────────┘   └──────────────────┘
       │                        │
       │ Vite Proxy             │ Mongoose Driver (TLS/SRV)
       │ (/api, /uploads)       │ (Docker Default DNS: 127.0.0.11)
       └───────────────────────>▼
                         ┌──────────────────┐
                         │  MongoDB Atlas   │
                         │  Cloud Cluster   │
                         └──────────────────┘
```

### Components
1. **Frontend Container (`ss-global-frontend-1`)**:
   - Runtime: Node.js `v22.23.5` on Alpine Linux (`node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a`).
   - Port Mapping: `5173:5173` (bound to host `0.0.0.0`).
   - Reverse Proxy: Built-in Vite dev proxy automatically routes all `/api/*` and `/uploads/*` requests internally to `http://backend:5000`.
   - File Sync: Bind mount `./frontend:/app` with anonymous volume `/app/node_modules` for instant HMR.

2. **Backend Container (`ss-global-backend-1`)**:
   - Runtime: Node.js `v22.23.5` on Alpine Linux (`node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a`).
   - Port Mapping: `5000:5000` (direct access for API health checks and testing).
   - Hot-Reload: `nodemon server.js` automatically reloads on host file edits.
   - Database Connection: Direct TLS/SRV connection to MongoDB Atlas cloud cluster.
   - Storage: Direct host bind mount `./backend:/app` preserving all existing uploaded media in `backend/uploads/`.

3. **Database (MongoDB Atlas ONLY)**:
   - **No local MongoDB container exists.**
   - No local database volume is created.
   - No localhost port 27017 mapping exists.
   - Connection is governed strictly by the `MONGO_URI` environment variable.

---

## 2. Prerequisites

1. **Docker Desktop**: Version 4.25+ installed and running.
   - Ensure Docker Engine is running Linux containers.
   - Allocate at least 2 GB RAM and 2 CPUs in Docker Desktop Settings.
2. **Git**: Installed on your host machine.
3. **MongoDB Atlas Account & Cluster**:
   - An active MongoDB Atlas cluster (M0 free tier or dedicated).
   - Database user with read/write permissions on the target database (`ss_global_school`).
   - **Network Access Whitelist**: Ensure your current public IP address is added to the Atlas Network Access list (or `0.0.0.0/0` during initial development).

---

## 3. First-Time Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/Sanesh764/ss_globle_public_school.git
cd ss_globle_public_school
```

### Step 2: Configure Environment Variables
Copy the template configuration file:
```bash
# On Linux / macOS / Git Bash
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` and configure your credentials:
```ini
# REQUIRED: MongoDB Atlas SRV URI
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ss_global_school?retryWrites=true&w=majority

# REQUIRED: Cryptographically secure JWT secret key (minimum 32 characters)
JWT_SECRET=your_secure_random_jwt_secret_key_minimum_32_characters

# OPTIONAL: Development server ports (defaults to 5000 and 5173)
PORT=5000
FRONTEND_PORT=5173
```
> [!IMPORTANT]
> Never commit `.env` to Git. The root `.gitignore` is pre-configured to ignore `.env` files.

### Step 3: Build and Start Containers
```bash
docker compose -f docker-compose.dev.yml up --build
```
Or in detached mode (background):
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### Step 4: Verify Running Services
1. **Frontend Application**: Open [http://localhost:5173](http://localhost:5173) in your browser.
2. **Backend Health Check**: Open [http://localhost:5000/api/health](http://localhost:5000/api/health). Expected response:
   ```json
   { "status": "OK", "uptime": 12.5, "timestamp": "..." }
   ```
3. **Vite Proxy Verification**: Open [http://localhost:5173/api/health](http://localhost:5173/api/health). Should mirror the backend response.

---

## 4. How Key Features Work

### MongoDB Atlas SRV Resolution
Docker's internal DNS resolver (`127.0.0.11`) automatically queries public DNS root resolvers to resolve Atlas `mongodb+srv://` records and seed lists. No manual DNS configuration (`8.8.8.8` / `1.1.1.1`) is needed.

### Vite Reverse Proxy
In `frontend/vite.config.js`:
```javascript
server: {
  host: '0.0.0.0',
  port: 5173,
  proxy: {
    '/api': {
      target: process.env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:5000',
      changeOrigin: true,
    },
    '/uploads': {
      target: process.env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:5000',
      changeOrigin: true,
    },
  },
}
```
Inside the container, `docker-compose.dev.yml` passes `BACKEND_PROXY_TARGET: http://backend:5000`. This allows the browser to make simple relative requests to `/api/*` and `/uploads/*` on port `5173`, avoiding CORS configuration issues entirely.

### Uploads Storage & Media Persistence
In development without Cloudinary credentials:
- Uploads are saved directly to `backend/uploads/` on the host through the `./backend:/app` bind mount.
- Existing files (like `school.webp`, `logo.webp`) remain completely intact.
- We deliberately avoid using a named volume for `/app/uploads` so host files are never masked or hidden.

### Hot Reload (HMR)
- **Frontend**: Vite watches `frontend/src/` via file-event polling inside the container and pushes updates via WebSockets instantly.
- **Backend**: `nodemon` watches `backend/src/` and restarts `server.js` when files are changed on the host.

---

## 5. Development Commands Reference

| Action | Command |
| :--- | :--- |
| **Start Stack (detached)** | `docker compose -f docker-compose.dev.yml up -d` |
| **Stop Stack** | `docker compose -f docker-compose.dev.yml down` |
| **View Live Logs** | `docker compose -f docker-compose.dev.yml logs -f` |
| **View Backend Logs Only** | `docker compose -f docker-compose.dev.yml logs -f backend` |
| **View Frontend Logs Only** | `docker compose -f docker-compose.dev.yml logs -f frontend` |
| **Restart Stack** | `docker compose -f docker-compose.dev.yml restart` |
| **Restart Backend Only** | `docker compose -f docker-compose.dev.yml restart backend` |
| **Rebuild Images** | `docker compose -f docker-compose.dev.yml build --no-cache` |
| **Execute Shell in Backend** | `docker compose -f docker-compose.dev.yml exec backend sh` |
| **Execute Shell in Frontend** | `docker compose -f docker-compose.dev.yml exec frontend sh` |

---

## 6. Common Docker Errors & Quick Fixes

### 1. `MongoDB connection failed: querySrv ENOTFOUND`
- **Cause**: Network cannot resolve Atlas cluster hostname, or host is offline.
- **Fix**: Verify Internet connection. Test DNS from host: `nslookup <cluster>.mongodb.net`.

### 2. `MongoDB connection failed: MongooseServerSelectionError`
- **Cause**: Your current IP address is not whitelisted in MongoDB Atlas.
- **Fix**: Log into MongoDB Atlas -> **Network Access** -> **Add IP Address** -> Add your current public IP address (or allow `0.0.0.0/0` for development).

### 3. `listen tcp 0.0.0.0:5000: bind: address already in use`
- **Cause**: A leftover Node.js process is running on your host machine.
- **Fix**:
  - Windows: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force`
  - macOS/Linux: `lsof -ti:5000 | xargs kill -9`

### 4. `[SECURITY ERROR] Insecure or missing JWT_SECRET environment variable`
- **Cause**: `.env` is missing `JWT_SECRET` or still contains the template placeholder text.
- **Fix**: Open `.env` and set `JWT_SECRET` to a unique 32+ character random string.

### 5. Windows Docker Desktop: `invalid file request` during build
- **Cause**: Docker BuildKit Windows file-system reparse issue.
- **Fix**: Run `$env:DOCKER_BUILDKIT=0; docker compose -f docker-compose.dev.yml build`.
