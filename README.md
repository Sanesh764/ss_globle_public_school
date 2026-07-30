# S.S. Global Public School — Enterprise MERN Web Application & CMS

[![Node.js Version](https://img.shields.io/badge/Node.js-v18.x%20%7C%20v20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.0%2B-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-v18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.0.8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-SDK_v2.0-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](https://github.com/Sanesh764/ss_globle_public_school)
[![Production Ready](https://img.shields.io/badge/Production-Ready-orange?style=for-the-badge)](#)

> **Production-Grade School Management & Content Management System (CMS)** engineered for **S.S. Global Public School, Daudnagar, Bihar**. Featuring role-based access control (RBAC), multi-user staff administration, dynamic hero carousels, academic downloads library, photo gallery, notices, interactive facilities showcase, security-hardened RESTful APIs, and Google Analytics 4 integration.

---

## 📍 Live Demo & Endpoints

| Component | Target Environment / Endpoint |
| :--- | :--- |
| **Public Portal** | [https://www.ssglobalpublicschool.com](https://www.ssglobalpublicschool.com) |
| **AWS Amplify Deployment** | [https://main.dlzshhty32uyq.amplifyapp.com](https://main.dlzshhty32uyq.amplifyapp.com) |
| **Backend REST API** | [https://ssgloblepublicschool-production.up.railway.app/api](https://ssgloblepublicschool-production.up.railway.app/api) |
| **API Health Check** | `GET /api/health` |
| **GitHub Repository** | [https://github.com/Sanesh764/ss_globle_public_school](https://github.com/Sanesh764/ss_globle_public_school) |
| **Admin Portal** | `/admin/login` |

---

## 🎯 Project Overview

### Why This Project Exists
Educational institutions require robust, reliable, and secure digital infrastructure to publish academic announcements, manage downloadable learning materials, showcase infrastructure facilities, display leadership visions, and collect prospective parent inquiries without relying on expensive third-party CMS platforms.

### Target Audience & Persona
- **Parents & Students:** Access real-time examination schedules, downloadable book lists, fee breakdown guidelines, academic calendars, holiday notices, and interactive photo galleries.
- **School Administration (Super Admin & Staff Admins):** Maintain complete operational control over web copy, leadership messages, hero carousels, facility features, staff user accounts, and incoming contact form submissions.

---

## 🚀 System Features

### 🔑 1. Authentication & Role-Based Access Control (RBAC)
- **Multi-Role User Architecture:** Distinct permission tiers for `superadmin` / `admin` and `staff`.
- **JWT Authentication:** Dual-mode token transport supporting HTTP-Only Cookies and `Authorization: Bearer <token>` headers.
- **Staff Admin Management:** Super Admins can create staff accounts, reset staff passwords, update credentials, toggle account activation, and track last login timestamps.
- **Self-Service Profile Management:** Secure profile updates and password change workflows with current password verification.
- **Route Guards:** Client-side `<ProtectedRoute />` and `<SuperAdminRoute />` navigation guards paired with backend `verifyJWT` and `verifyAdminRole` middleware.

### 📜 2. Notice Board & Announcements CMS
- Categorized notice publication (`Academic`, `Exam`, `Holiday`, `General`, `Admission`).
- Priority pinning (`isImportant` flag) with visual highlighted styling.
- PDF attachment integration for official circulars and date sheets.

### 📁 3. Downloads & Academic Resources Management
- Centralized downloads repository for Book Lists, Syllabi, Academic Calendars, Holiday Calendars, and Annual Activity Schedules.
- Filterable cards with PDF preview lightbox and direct attachment downloading.
- Automatic image asset optimization and Cloudinary integration.

### 🖼️ 4. Dynamic Hero Slider CMS
- Fully customisable homepage carousel supporting background image uploads, badges, call-to-action (CTA) buttons, and custom target URLs.
- Admin drag-and-drop / manual reordering and active/inactive toggling.

### 🏆 5. Leadership Team & Visionaries
- CMS for Managing Director, Founder, and Principal profiles (Name, Designation, Heading, Personal Message, Location, Photo).
- Toggle options for homepage rendering (`showOnHomepage`) and display order sequence.

### 🏫 6. Facilities & Infrastructure Showcase
- Showcase for Smart Classrooms, Science Labs, Computer Labs, Library, Transport, and Sports Arena.
- Support for key feature lists, customized icons, header images, and short descriptions.

### 📸 7. Categorized Photo Gallery
- Categorized photo grid (`Campus`, `Facilities`, `Events`, `Sports`, `Academics`, `Celebrations`).
- High-performance modal lightbox viewer with smooth transitions.

### ✉️ 8. Contact & Admission Inquiries Management
- Public contact form with rate-limiting defense (`contactSubmissionLimiter`).
- Admin inbox for reviewing inquiries, marking messages as `Read` / `Replied`, appending internal notes, and tracking submitter IP addresses.

### ⚙️ 9. Centralized School Settings
- Comprehensive site configuration: School Name, Tagline, Contact Phones, Official Email, Address, Office Hours, Logo, Hero Banner, Principal Photo, Social Media Links, and Custom "About Us" Section Blocks.

### 📊 10. Analytics & SEO Hardening
- **Google Analytics 4 (`G-PF8ZK3JD48`):** Official `gtag.js` SPA route tracking (`RouteTracker.jsx`) without duplicate page views.
- **Custom Event Tracking:** Tracking for outbound links, notice downloads, contact CTA clicks, and gallery interactions.
- **SEO Optimization:** Dynamic page title tags via `react-helmet-async`, structured data schemas, semantic HTML5 structure, and mobile-first responsive layouts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React v18.2.0 + Vite v5.0.8
- **Routing:** React Router DOM v6.21.1
- **Styling:** Tailwind CSS v3.4.1 + Vanilla CSS Design System
- **Icons:** React Icons v5.0.1 (Feather `fi`, FontAwesome `fa`, Lucide)
- **HTTP Client:** Axios v1.6.5 (Configured base URL, interceptors, withCredentials)
- **SEO & Meta:** React Helmet Async v2.0.0

### Backend
- **Runtime:** Node.js (v18.x / v20.x LTS)
- **Framework:** Express.js v4.18.2 (ES Modules syntax)
- **Database ODM:** Mongoose v8.0.3 (MongoDB Atlas / Local MongoDB)
- **Authentication:** JSON Web Token (`jsonwebtoken` v9.0.2) + `bcryptjs` v2.4.3
- **File Upload:** Multer v1.4.5-lts.1 + Cloudinary SDK v2.0.0
- **Security & Utilities:** Helmet v7.1.0, Compression v1.7.4, Cookie-Parser v1.4.6, Cors v2.8.5, Express Rate Limit v7.1.5

---

## 📐 Architecture & Data Flow

```
[ Client Browser / SPA ]
       │
       ▼
[ React 18 + Vite (SPA) ] ── (React Router v6 & Axios) ──► [ Vite Dev Server / AWS Amplify ]
       │
       ▼
[ REST API Requests ] ── (JSON / Multipart Form Data) ──► [ Express.js Backend App ]
                                                                 │
                                           ┌─────────────────────┴─────────────────────┐
                                           ▼                                           ▼
                              [ Security Middleware ]                   [ File Upload Handler ]
                              - Helmet HTTP Headers                     - Multer Disk Storage
                              - CORS Origins Whitelist                  - Cloudinary SDK
                              - Express Rate Limiters                   - Asset Optimizer
                              - JWT Authentication Guard                               │
                              - RBAC Admin Role Guard                                  │
                                           │                                           │
                                           ▼                                           ▼
                              [ Controller Business Logic ] ◄────────────── [ Cloudinary Cloud Storage ]
                                           │
                                           ▼
                              [ Mongoose ODM Layer ]
                                           │
                                           ▼
                              [ MongoDB Atlas Database ]
```

### Authentication Flow
1. Admin submits credentials (`email`/`username` + `password`) to `POST /api/admin/login`.
2. Controller verifies user existence, checks `isActive: true`, and compares password using `bcrypt.compare()`.
3. Server generates signed JWT token containing `{ id, role }` payload (expires in 24 hours).
4. Token is returned in response payload AND attached as an `HttpOnly`, `SameSite=Lax` cookie.
5. Client stores user context; subsequent Axios requests include both cookie and `Authorization: Bearer <token>` header.

### File Upload & Cloud Storage Flow
1. Client submits `multipart/form-data` with image/PDF payload to admin route.
2. `upload` / `uploadDocument` Multer middleware enforces file type checks and file size limits (5MB images, 20MB PDFs).
3. `processUploadedFile` / `processUploadedDocument` streams file to Cloudinary with folder organization (`ss_global_school`, `ss_global_documents`).
4. Local temporary file is unlinked; secure Cloudinary URL (`secure_url`) and `public_id` are saved into MongoDB document.

---

## 📁 Repository Directory Structure

```
ss_globle_public_school/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB Mongoose connection handler
│   │   │   └── cloudinary.js         # Cloudinary SDK credentials & helper
│   │   ├── controllers/
│   │   │   ├── academicResourceController.js # Academic Resources CRUD
│   │   │   ├── authController.js     # Login, Logout, Profile & User Management
│   │   │   ├── contactController.js  # Contact message processing & status updates
│   │   │   ├── facilityController.js # School facilities management
│   │   │   ├── galleryController.js  # Photo gallery operations
│   │   │   ├── heroSliderController.js # Hero carousel slide management
│   │   │   ├── leadershipController.js # Leadership profiles management
│   │   │   ├── noticeController.js   # School notices & announcements CRUD
│   │   │   └── settingController.js  # Global site settings controller
│   │   ├── middleware/
│   │   │   ├── admin.middleware.js   # Admin & SuperAdmin role authorization guards
│   │   │   ├── auth.middleware.js    # JWT token verification middleware
│   │   │   ├── error.middleware.js   # Centralized 404 & global error handlers
│   │   │   ├── rateLimiter.middleware.js # Express rate limiters for auth & contact
│   │   │   ├── uploadMiddleware.js   # Multer file filter & Cloudinary upload helper
│   │   │   └── validateObjectId.js   # MongoDB ObjectId format validator
│   │   ├── models/
│   │   │   ├── AcademicResource.js   # Schema for downloads & academic resources
│   │   │   ├── Admin.js              # Schema for admin users & credentials
│   │   │   ├── ContactMessage.js     # Schema for public contact submissions
│   │   │   ├── Facility.js           # Schema for school infrastructure facilities
│   │   │   ├── Gallery.js            # Schema for photo gallery items
│   │   │   ├── HeroSlide.js          # Schema for dynamic homepage hero slides
│   │   │   ├── Leadership.js         # Schema for leadership team members
│   │   │   ├── Notice.js             # Schema for school notice board items
│   │   │   └── Setting.js            # Schema for global school site settings
│   │   ├── routes/                   # Express router definitions
│   │   ├── utils/
│   │   │   ├── ApiResponse.js        # Standardized API response formatter
│   │   │   ├── asyncHandler.js       # Higher-order async error wrapper
│   │   │   └── seedData.js           # Database seeder for admin, settings, content
│   │   ├── app.js                    # Express application setup & middleware stack
│   │   └── server.js                 # Server entry point & listener
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/                   # Static images & logos
│   │   ├── components/
│   │   │   ├── admin/                # Admin header, sidebar, user modals
│   │   │   ├── common/               # Navbar, Footer, GoogleMap, RouteTracker
│   │   │   └── home/                 # HeroSection, WelcomeMessage, Notices, etc.
│   │   ├── context/                  # AuthContext, SettingContext, ToastContext
│   │   ├── hooks/                    # useAuth, useFetch, useHeroSlider, useToast
│   │   ├── layouts/                  # MainLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── admin/                # Admin dashboard, notices, gallery, users, profile
│   │   │   └── public/               # Home, About, Facilities, Gallery, Downloads, Contact
│   │   ├── routes/                   # AppRoutes, ProtectedRoute, SuperAdminRoute
│   │   ├── services/                 # API service modules (Axios instances)
│   │   └── utils/                    # GA4 analytics, constants, formatDate, mapUtils
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 💻 Local Installation & Setup

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` LTS installed
- **MongoDB**: Local MongoDB instance or MongoDB Atlas Connection URI
- **Cloudinary Account**: Cloud Name, API Key, API Secret (Optional - falls back to local disk storage)

### Step 1: Clone Repository
```bash
git clone https://github.com/Sanesh764/ss_globle_public_school.git
cd ss_globle_public_school
```

### Step 2: Configure & Launch Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ss_global_school
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=24h

# Cloudinary Setup (Optional - leave empty for local file storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FRONTEND_URL=http://localhost:5173
```

Start backend development server:
```bash
npm run dev
```
*(The backend seeder will automatically create initial school settings, gallery items, leadership members, and default admin credentials: `admin@ssglobal.edu.in` / `Admin@123456`)*

### Step 3: Configure & Launch Frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GA_MEASUREMENT_ID=G-PF8ZK3JD48
```

Start frontend development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Endpoint Reference

### Authentication & User Management (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Public | Authenticate admin/staff credentials & set JWT |
| `GET` | `/api/admin/me` | Protected | Fetch current logged-in admin user session |
| `POST` | `/api/admin/logout` | Protected | Logout user & clear authentication cookie |
| `GET` | `/api/admin/profile` | SuperAdmin | Fetch super admin profile details |
| `PUT` | `/api/admin/profile` | SuperAdmin | Update profile name, email, username |
| `PATCH` | `/api/admin/profile/change-password` | SuperAdmin | Change password with current password check |
| `GET` | `/api/admin/users` | SuperAdmin | List all staff admin accounts |
| `POST` | `/api/admin/users` | SuperAdmin | Create new staff admin account |
| `PUT` | `/api/admin/users/:id` | SuperAdmin | Update staff admin details/role/status |
| `PATCH` | `/api/admin/users/:id/reset-password` | SuperAdmin | Reset staff admin password |
| `DELETE` | `/api/admin/users/:id` | SuperAdmin | Delete staff admin account |

### Notices & Announcements (`/api/notices`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notices` | Public | Fetch all published notices |
| `GET` | `/api/notices/:id` | Public | Fetch notice details by ID |
| `POST` | `/api/notices` | Protected | Create new notice with optional PDF/image file |
| `PUT` | `/api/notices/:id` | Protected | Update existing notice |
| `DELETE` | `/api/notices/:id` | Protected | Delete notice and associated attachments |

### Academic Resources & Downloads (`/api/academic-resources`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/academic-resources` | Public | Fetch active academic resources & publications |
| `GET` | `/api/admin/academic-resources` | Protected | Fetch all academic resources for admin management |
| `POST` | `/api/admin/academic-resources` | Protected | Upload new academic resource document/image |
| `PUT` | `/api/admin/academic-resources/:id` | Protected | Update resource metadata or replacement file |
| `DELETE` | `/api/admin/academic-resources/:id` | Protected | Delete resource and cloud assets |

### Contact Messages (`/api/contact` & `/api/admin/messages`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contact` | Public (Rate-Limited) | Submit prospective parent contact inquiry |
| `GET` | `/api/admin/messages` | Protected | Retrieve contact inquiries inbox |
| `GET` | `/api/admin/messages/:id` | Protected | View single contact inquiry message |
| `PATCH` | `/api/admin/messages/:id/read` | Protected | Mark inquiry as Read |
| `PATCH` | `/api/admin/messages/:id/replied` | Protected | Mark inquiry as Replied with internal notes |
| `DELETE` | `/api/admin/messages/:id` | Protected | Delete contact inquiry |

---

## 🗄️ Database Schemas Summary

- **Admin Collection (`admins`)**: `name`, `username`, `email`, `password` (hashed), `role` (`superadmin`/`admin`/`staff`), `avatar`, `lastLogin`, `isActive`.
- **Setting Collection (`settings`)**: `schoolName`, `tagline`, `logo`, `heroImage`, `principalPhoto`, `address`, `phone`, `altPhone`, `email`, `principalName`, `principalMessage`, `directorName`, `directorMessage`, `about`, `vision`, `mission`, `socialLinks`, `aboutSections`.
- **Notice Collection (`notices`)**: `title`, `description`, `category`, `isImportant`, `attachment`, `attachmentPublicId`, `createdBy`.
- **Gallery Collection (`galleries`)**: `title`, `category`, `image`, `public_id`, `displayOrder`.
- **Leadership Collection (`leaderships`)**: `name`, `designation`, `heading`, `message`, `location`, `image`, `public_id`, `displayOrder`, `isActive`, `showOnHomepage`.
- **HeroSlide Collection (`heroslides`)**: `backgroundImage`, `public_id`, `badge`, `title`, `highlightTitle`, `description`, `primaryButtonText`, `primaryButtonLink`, `secondaryButtonText`, `secondaryButtonLink`, `displayOrder`, `isActive`, `autoPlay`.
- **Facility Collection (`facilities`)**: `title`, `category`, `description`, `shortDescription`, `icon`, `image`, `public_id`, `features`, `displayOrder`, `isActive`.
- **AcademicResource Collection (`academicresources`)**: `title`, `category`, `description`, `image`, `public_id`, `fileUrl`, `filePublicId`, `displayOrder`, `isActive`.
- **ContactMessage Collection (`contactmessages`)**: `name`, `email`, `phone`, `subject`, `message`, `status` (`Unread`/`Read`/`Replied`), `notes`, `ipAddress`, `userAgent`.

---

## 🔒 Security & Defense Implementation

1. **Password Hashing:** `bcryptjs` algorithm with 10 salt rounds used for all user authentication.
2. **HTTP Header Hardening:** `helmet` middleware configures Secure Sockets, X-Frame-Options, X-Content-Type-Options, and Cross-Origin policies.
3. **Rate Limiting:** `express-rate-limit` attached to `/api/admin/login` (5 attempts / 15 mins) and `/api/contact` (3 submissions / hour).
4. **Input Sanitization & Injection Defense:** Custom Mongo key sanitizer strips `$`, `.`, and operators from `req.body`, `req.query`, and `req.params`.
5. **CORS Safeguards:** Origin whitelist validation supporting local development and production SSL domains.

---

## 🚢 Production Deployment Architecture

- **Frontend Hosting:** Deployed on **AWS Amplify** with automatic CI/CD builds from `main` branch. Single Page App (SPA) rewrite rules configured (`</^[^.]+$|\.(?:html|css|js|png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2)$/>` -> `/index.html`).
- **Backend Service:** Deployed on **Railway Platform** with Node.js 20 environment, environment variables secret injection, and automatic HTTP trust proxy configuration.
- **Database:** Hosted on **MongoDB Atlas** (Shared M0 Cluster) with IP Access Whitelisting and TLS 1.3 encrypted connections.
- **CDN Asset Storage:** Hosted on **Cloudinary Cloud Storage** for auto-format and auto-quality delivery.

---

## ⚡ Performance Optimizations

1. **Route Level Code-Splitting:** All React pages lazy-loaded using `React.lazy()` and `<Suspense />` wrappers.
2. **Asset Optimization:** Automatic webp transformation and dynamic scaling via Cloudinary.
3. **Payload Compression:** Gzip response compression enabled across all REST API endpoints (`compression` middleware).
4. **Google Maps Optimization:** Dynamic Map iframe loader with 5-second failure timeout and fallback contact card (`GoogleMap.jsx`).

---

## 📄 License & Attribution

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Developed for **S.S. Global Public School**, Daudnagar, Bihar.

---

## 👨‍💻 Developer & Maintainer

**Sanesh**  
- **Role:** Lead Full-Stack Software Engineer
- **GitHub:** [https://github.com/Sanesh764](https://github.com/Sanesh764)
- **Project Repo:** [https://github.com/Sanesh764/ss_globle_public_school](https://github.com/Sanesh764/ss_globle_public_school)
