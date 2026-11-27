# S.S. Global Public School — Enterprise MERN Web Application & CMS

[![Docker Development](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](DOCKER_SETUP.md)
[![Node.js Version](https://img.shields.io/badge/Node.js-v22.x%20LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-v18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.0.8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-53%2F53%20Passed-brightgreen?style=for-the-badge)](TESTING.md)

> **Production-Ready School Management & Content Management System (CMS)** engineered for **S.S. Global Public School, Daudnagar, Bihar**.  
> Features full Docker development support, exclusive MongoDB Atlas cloud persistence, resilient client-side fallback architecture, dual-method authentication (email/username), role-based access control (RBAC), and comprehensive automated testing.

---

## ⚡ Quickstart (Clone & Run with Docker)

The fastest and most consistent way to run this application is with **Docker Compose**:

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Version 4.25+) installed and running.
- An active [MongoDB Atlas](https://www.mongodb.com/atlas) cluster with your current public IP added to the **Network Access** IP Access List.

### 2. Setup & Start
```bash
# Clone the repository
git clone https://github.com/Sanesh764/ss_globle_public_school.git
cd ss_globle_public_school

# Copy environment template
cp .env.example .env

# Configure your Atlas MONGO_URI and JWT_SECRET in .env
# Start the development containers
docker compose -f docker-compose.dev.yml up --build
```

### 3. Access the Application
- **Frontend Portal**: [http://localhost:5173](http://localhost:5173)
- **Backend API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Admin Control Panel**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

For comprehensive container documentation, architecture diagrams, and commands, see [DOCKER_SETUP.md](DOCKER_SETUP.md).

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Project Directory Structure](#-project-directory-structure)
4. [Architecture & Key Features](#-architecture--key-features)
5. [Environment Configuration](#-environment-configuration)
6. [Testing & Quality Assurance](#-testing--quality-assurance)
7. [Documentation Sitemap](#-documentation-sitemap)
8. [License](#-license)

---

## 🎯 Project Overview

S.S. Global Public School is a comprehensive web portal and administrative CMS designed to serve:
- **Prospective Parents & Students**: Academic calendar, notices, fee guidelines, photo galleries, video tours, faculty leadership messages, and online inquiries.
- **School Administrators & Staff**: Role-based content management system to manage notices, gallery photos, infrastructure facility cards, leadership profiles, academic syllabus downloads, hero slides, and parent messages.
- **Fail-Safe Operation**: Built-in automatic frontend fallback ensures that all public web pages remain completely readable and functional with pre-bundled school data even if the backend or database is temporarily unreachable.

---

## 🛠 Technology Stack

### Container & Infrastructure
- **Docker & Docker Compose**: Pinned Node.js 22 LTS Alpine runtime (`node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a`).
- **Database**: **MongoDB Atlas Only** (dedicated cloud replica set cluster; zero local database containers).

### Backend
- **Runtime**: Node.js `v22.23.5` LTS
- **Framework**: Express.js `v4.18.2`
- **ODM**: Mongoose `v8.0.3` (with SRV DNS resolution and auto-reconnect listeners)
- **Security**: Helmet, Express Rate Limit, Bcrypt.js, CORS, HTTP-Only Cookie parser
- **Uploads**: Multer disk storage (development mode fallback into `backend/uploads/`) with Cloudinary SDK support
- **Testing**: Native Node.js Test Runner (`node:test`, `node:assert/strict`)

### Frontend
- **Framework**: React `v18.2.0` (Vite `v5.0.8`)
- **Styling**: Tailwind CSS `v3.4.1`, Lucide & React Icons
- **HTTP Client**: Axios with request/response interceptors & Vite reverse proxy (`/api`, `/uploads`)
- **Routing**: React Router DOM `v6.21.1` (with `<ProtectedRoute />` and `<SuperAdminRoute />` guards)
- **Linting & Bundling**: Oxlint (0 errors) & Vite Rollup bundler

---

## 📂 Project Directory Structure

```text
ss-global/
├── .env.example                 # Clean environment template (placeholders only)
├── .gitignore                   # Root ignore rules (protects .env and build assets)
├── docker-compose.dev.yml       # Development Docker Compose specification
├── DOCKER_SETUP.md              # Container architecture & Docker instructions
├── ENVIRONMENT.md               # Complete environment variable reference
├── TESTING.md                   # Automated & manual testing guide
├── TROUBLESHOOTING.md           # Solutions for common developer problems
├── FINAL_PROJECT_HANDOVER.md    # Handover report & architectural summary
├── backend/
│   ├── Dockerfile.dev           # Pinned Node 22 development Dockerfile
│   ├── .dockerignore            # Build context exclusions
│   ├── package.json             # Backend dependencies & test scripts
│   ├── server.js                # Server entry point & security startup check
│   ├── uploads/                 # Local media storage (preserved across restarts)
│   ├── tests/                   # Backend automated test suite (40 tests)
│   └── src/
│       ├── config/              # MongoDB Atlas & Cloudinary configs
│       ├── controllers/         # REST API business logic
│       ├── middleware/          # JWT auth, RBAC, rate limiter, uploads
│       ├── models/              # Mongoose data schemas
│       ├── routes/              # Express API routers
│       ├── utils/               # Token generator, error handlers, seeders
│       └── validators/          # Dual identifier validator (email/username)
└── frontend/
    ├── Dockerfile.dev           # Pinned Node 22 development Dockerfile
    ├── .dockerignore            # Build context exclusions
    ├── package.json             # Frontend dependencies & test scripts
    ├── vite.config.js           # Vite dev server & backend proxy configuration
    ├── tests/                   # Frontend automated test suite (13 tests)
    ├── public/                  # Public static assets & favicon
    └── src/
        ├── components/          # Reusable UI components & layouts
        ├── config/              # Fallback datasets (SCHOOL_DETAILS_FALLBACK, etc.)
        ├── context/             # AuthContext, SettingContext
        ├── hooks/               # Custom React hooks (useFetch, useToast)
        ├── pages/               # Public and Admin view pages
        ├── routes/              # Route definitions and security guards
        └── services/            # Axios API service integrations
```

---

## 🔒 Security & Architecture Highlights

1. **MongoDB Atlas as Single Database**: The project exclusively connects to MongoDB Atlas. No local MongoDB daemon or container is run.
2. **Mandatory Configuration Validation**: `backend/server.js` and `backend/src/config/db.js` enforce that `MONGO_URI` and `JWT_SECRET` are provided at startup. Hardcoded insecure fallbacks have been eliminated.
3. **Dual-Identifier Authentication**: Administrators and staff can sign in using either their registered email address or username. The validator accepts valid email formats and clean username strings without throwing 400 Bad Request errors.
4. **Resilient Automatic Frontend Fallback**: In the event of backend maintenance or database unavailability, the frontend automatically falls back to bundled institutional datasets, ensuring parents and students can always read school information.
5. **Upload Persistence**: Uploaded assets are bound to `backend/uploads/` on the host, preventing file loss during container restarts or rebuilds.

---

## 🧪 Testing & Verification

Run tests directly or inside Docker:

```bash
# Backend Test Suite (40 tests: validation, integration, security, regression)
npm --prefix backend test

# Frontend Test Suite (13 tests: auth state, route guards, fallback resilience)
npm --prefix frontend test

# Frontend Linting
npm --prefix frontend run lint

# Production Bundle Build
npm --prefix frontend run build
```
See [TESTING.md](TESTING.md) for full testing documentation.

---

## 📚 Documentation Sitemap

- [DOCKER_SETUP.md](DOCKER_SETUP.md) — Docker architecture, compose commands, and container verification.
- [ENVIRONMENT.md](ENVIRONMENT.md) — Complete environment variable specification.
- [TESTING.md](TESTING.md) — Full test documentation and reproduction steps.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — Diagnosis and resolution guide for common developer issues.
- [FINAL_PROJECT_HANDOVER.md](FINAL_PROJECT_HANDOVER.md) — Comprehensive technical handover and architectural audit report.

---

## 📄 License
This project is proprietary software engineered for **S.S. Global Public School, Daudnagar, Bihar**. All rights reserved.
