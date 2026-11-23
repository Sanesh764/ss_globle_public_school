# Docker Setup Guide

Follow these steps to run the application using Docker:

### Step 1: Copy Environment Template
Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

*(On Windows PowerShell, run: `Copy-Item .env.example .env`)*

### Step 2: Fill in the Values
Open `.env` and configure your credentials:
- Set `JWT_SECRET` to a strong random secret.
- Fill in your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for image uploads.
- (Optional) Adjust `ADMIN_EMAIL` and `ADMIN_PASSWORD` if seeding users.

### Step 3: Build and Run Containers
Start all services (MongoDB, Backend, and Frontend) with:

```bash
docker compose up --build -d
```

*(Note for Windows users with OneDrive/ReparsePoints: if BuildKit encounters a file permission warning during context transfer, run: `set DOCKER_BUILDKIT=0 && docker compose up --build -d` or in PowerShell `$env:DOCKER_BUILDKIT=0; docker compose up --build -d`)*

### Step 4: Seed Initial Data (Admin User & Default Content)
To seed initial school data and create the default superadmin (`admin@ssglobalpublicschool.edu.in`) and staff accounts in MongoDB, run:

```bash
docker compose exec backend node -e "import('./src/config/db.js').then(async m => { await m.default(); const s = await import('./src/utils/seedData.js'); await s.seedDatabase(); process.exit(0); })"
```

### Accessing the Services
- **Frontend (Website & Admin UI)**: [http://localhost](http://localhost) (or port configured in `FRONTEND_PORT`)
- **Backend (API)**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB**: `localhost:27017`

### Stopping the Containers
To stop the containers:

```bash
docker compose down
```

To stop and remove database volumes:

```bash
docker compose down -v
```
