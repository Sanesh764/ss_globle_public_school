# Environment Variables Reference

**Project:** S.S. Global Public School  
**File Location:** Root `.env` (copied from `.env.example`)

> [!WARNING]
> **CRITICAL SECURITY REQUIREMENT:** Never commit `.env` or any file containing live credentials to Git. The `.gitignore` file is strictly configured to protect `.env`. All values documented below use **placeholders only**.

---

## Environment Variables Matrix

| Variable Name | Required? | Default / Fallback | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Optional** | `development` | Dictates application execution mode (`development`, `production`, `test`). |
| `PORT` | **Optional** | `5000` | Port on which the Express.js backend server listens inside the container. |
| `FRONTEND_PORT` | **Optional** | `5173` | Port exposed by Vite development server to the host browser. |
| `MONGO_URI` | **REQUIRED** | *None (Fails startup)* | MongoDB Atlas SRV connection string with cluster credentials and database name. |
| `JWT_SECRET` | **REQUIRED** | *None (Fails startup)* | Cryptographically secure secret string used to sign and verify JSON Web Tokens. |
| `ADMIN_EMAIL` | **Optional** | `admin@ssglobalpublicschool.edu.in` | Primary SuperAdmin email identifier for system notifications and fallback lookup. |
| `ADMIN_PASSWORD` | **Optional** | *None* | Initial administrative credential (used only during explicit seeder execution). |
| `CLOUDINARY_CLOUD_NAME` | **Optional** | *Empty (Local disk fallback)* | Cloudinary cloud identifier for cloud media asset hosting. |
| `CLOUDINARY_API_KEY` | **Optional** | *Empty (Local disk fallback)* | Cloudinary API Key for authorized asset uploading. |
| `CLOUDINARY_API_SECRET` | **Optional** | *Empty (Local disk fallback)* | Cloudinary API Secret for authorized asset signing. |
| `BACKEND_PROXY_TARGET` | **Optional** | `http://127.0.0.1:5000` | Target URL used by Vite dev server to reverse-proxy `/api` and `/uploads` requests. Set to `http://backend:5000` inside Docker Compose. |
| `TEST_MONGO_URI` | **Optional** | `mongodb://127.0.0.1:27017/ss_global_test_auth_db` | Dedicated isolated database URI used only when running automated integration tests. |

---

## Detailed Variable Specifications

### 1. `MONGO_URI` (REQUIRED)
- **Purpose**: Establishes secure TLS connectivity to the MongoDB Atlas cloud database cluster. The backend driver uses this string to resolve SRV replica set topology, authenticate, and select the target database (`ss_global_school`).
- **Required**: **Yes**. Application startup terminates immediately with exit code 1 if missing or malformed.
- **Example Placeholder**:
  ```ini
  MONGO_URI=mongodb+srv://YOUR_ATLAS_USERNAME:YOUR_ATLAS_PASSWORD@your-cluster.mongodb.net/ss_global_school?retryWrites=true&w=majority
  ```
- **How to Obtain**:
  1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
  2. Select your project and cluster -> Click **Connect**.
  3. Choose **Drivers** -> Select **Node.js** (version 5.5 or later).
  4. Copy the connection string. Replace `<password>` with your database user password and specify `/ss_global_school` before the query parameters.
  5. **Network Access**: In Atlas, navigate to **Security** -> **Network Access** and ensure your current public IP address is in the IP Access List.

---

### 2. `JWT_SECRET` (REQUIRED)
- **Purpose**: Signs and verifies authentication session tokens issued to administrators and staff members upon login. Used to generate and validate HTTP-Only cookies and Bearer tokens.
- **Required**: **Yes**. `backend/server.js` validates that `JWT_SECRET` is non-empty and does not contain generic placeholder strings on boot.
- **Security Rule**: Must be a high-entropy random string of at least 32 characters.
- **Example Placeholder**:
  ```ini
  JWT_SECRET=replace_with_a_secure_random_jwt_secret_key_minimum_32_characters
  ```
- **How to Generate**:
  Run this one-liner in your terminal to generate a cryptographically strong 64-character hex secret:
  ```bash
  # Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Linux / macOS OpenSSL
  openssl rand -hex 32
  ```

---

### 3. `PORT` & `FRONTEND_PORT` (Optional)
- **Purpose**: Define port mappings between Docker containers and your host machine.
- **Required**: No (defaults to standard ports `5000` for backend and `5173` for frontend).
- **Example**:
  ```ini
  PORT=5000
  FRONTEND_PORT=5173
  ```

---

### 4. `CLOUDINARY_*` Variables (Optional)
- **Purpose**: Connects the backend media processing pipeline to Cloudinary for remote cloud asset hosting and automatic WebP transformations.
- **Required**: **No**. When omitted or left blank, the application automatically enters **Local Fallback Mode**:
  - Uploaded images are stored directly on the host in `backend/uploads/`.
  - Stored files are served via `/uploads/<filename>` through the Vite reverse proxy.
  - No external account or network dependency is required for local development.
- **Example Placeholder**:
  ```ini
  CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
  CLOUDINARY_API_KEY=your_cloudinary_api_key
  CLOUDINARY_API_SECRET=your_cloudinary_api_secret
  ```
- **How to Obtain**: Available on your [Cloudinary Dashboard](https://cloudinary.com/console) under **Account Details**.

---

### 5. `BACKEND_PROXY_TARGET` (Docker Internal)
- **Purpose**: Tells the Vite development server where to proxy client API requests (`/api/*` and `/uploads/*`).
- **Required**: No (handled automatically by `docker-compose.dev.yml`).
- **Value in Docker**: `http://backend:5000`
- **Value on Local Host**: `http://127.0.0.1:5000`

---

## Clean `.env.example` Template

The repository provides a tracked `.env.example` file with clean placeholders:

```ini
# ==============================================================================
# S.S. Global Public School - Development Environment Configuration Template
# Copy this file to .env before starting the Docker containers:
#   cp .env.example .env
# ==============================================================================

# Database Configuration (MongoDB Atlas ONLY - No local database)
# REQUIRED: Replace with your actual MongoDB Atlas connection string
MONGO_URI=mongodb+srv://YOUR_ATLAS_USERNAME:YOUR_ATLAS_PASSWORD@your-cluster.mongodb.net/ss_global_school?retryWrites=true&w=majority

# Authentication & Security
# REQUIRED: Replace with a cryptographically secure random string (minimum 32 characters)
JWT_SECRET=replace_with_a_secure_random_jwt_secret_key_minimum_32_characters

# Application Environment & Ports
NODE_ENV=development
PORT=5000
FRONTEND_PORT=5173

# Administrative Setup (Optional)
ADMIN_EMAIL=admin@ssglobalpublicschool.edu.in
ADMIN_PASSWORD=your_secure_admin_password

# Cloudinary Storage (Optional - falls back to local backend/uploads if omitted)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
