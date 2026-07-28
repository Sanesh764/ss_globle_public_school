# 🏫 S.S. Global Public School Management System

> A modern, production-ready, full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application engineered for **S.S. Global Public School** (Daudnagar, Bihar, India). Features a high-performance public website alongside a secure, role-based administrative control panel.

---

## 🌟 Features

### 🌐 Public School Website
- **Responsive Layout**: Designed for seamless browsing across mobile (320px+), tablet, laptop, and 4K desktop screens.
- **Hero & School Overview**: Dynamic hero section with campus highlights, principal leadership address, and school motto.
- **Facilities Showcase**: Smart Classrooms, Computer & IT Laboratories, Science Workstations, Sports Arena, and Campus Safety.
- **Photo & Event Gallery**: Interactive gallery categorized by Campus, Facilities, Academics, Celebrations, and Sports with Lightbox view.
- **Official Notice Board**: Real-time circulars, exam date sheets, holiday announcements, and admissions notices with search and category filtering.
- **Contact & Inquiry Form**: Online inquiry submission with server-side validation and interactive Google Maps location embed.

### 🛡️ Administrative Portal (`/admin`)
- **Secure Authentication**: JWT (JSON Web Token) authentication with HTTP-only cookies and Bearer token headers.
- **Role-Based Access Control (RBAC)**: Enforced backend & frontend route protection. Direct URL access attempts without valid admin rights are blocked automatically.
- **Dashboard Analytics**: Overview cards displaying total notice count, gallery image count, inbox messages, and quick management shortcuts.
- **Notice Management**: Full CRUD operations to create, edit, delete, and publish notices with priority tagging.
- **Gallery Management**: Upload images with automatic Cloudinary cloud compression and delete photos on demand.
- **Website Settings Manager**: Real-time management of school name, tagline, address, phone numbers, email, leadership messages, and school logo.
- **Contact Message Inbox**: View, mark as read, and delete public contact form inquiries with quick mailto reply actions.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React.js (v19 with Vite)
- **Styling**: Vanilla CSS3 + Tailwind CSS
- **Routing**: React Router DOM (v7 with `React.lazy` code-splitting)
- **HTTP Client**: Axios with request/response interceptors
- **Icons**: React Icons (`fi` Feather icons)

### Backend
- **Runtime**: Node.js (v20 / v22 / v24)
- **Framework**: Express.js (v5)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs` password hashing
- **File Upload**: Multer disk storage & Cloudinary V2 SDK
- **Security**: Helmet, Express Rate Limit, Express Mongo Sanitize, Compression, Cookie Parser

### Infrastructure & Deployment
- **Frontend Hosting**: AWS Amplify / Vercel
- **Backend Hosting**: Render / Railway
- **Database Service**: MongoDB Atlas Cloud
- **Asset CDN**: Cloudinary Media Engine

---

## 📁 Folder Structure

```text
ss-global/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary configurations
│   │   ├── controllers/     # Auth, Notice, Gallery, Setting, Contact controllers
│   │   ├── middleware/      # Auth, Admin, Error, Upload, ObjectId validation middlewares
│   │   ├── models/          # Admin, Notice, Gallery, Setting, ContactMessage Mongoose models
│   │   ├── routes/          # REST API route handlers
│   │   ├── utils/           # ApiError, ApiResponse, asyncHandler, Logger utilities
│   │   ├── validators/      # Express-validator input rules
│   │   └── app.js           # Express app, Helmet, CORS, RateLimiter & Middlewares
│   ├── uploads/             # Static file storage fallback
│   ├── .env.example         # Environment template
│   ├── package.json         # Backend dependencies
│   └── server.js            # Node HTTP server listener
│
└── frontend/
    ├── public/              # Favicon, robots.txt, sitemap.xml, static school images
    ├── src/
    │   ├── components/      # Common, Home, Error, and Admin UI components
    │   ├── context/         # AuthContext, SettingContext, ToastContext
    │   ├── hooks/           # useAuth, useToast, useFetch custom hooks
    │   ├── layouts/         # MainLayout, AdminLayout
    │   ├── pages/           # Public & Admin pages (Home, About, Facilities, Gallery, etc.)
    │   ├── routes/          # AppRoutes (React.lazy) & ProtectedRoute guard
    │   ├── services/        # Axios API instances & Service modules
    │   └── utils/           # Constants, date formatters, image URL resolvers
    ├── index.html           # HTML template with Open Graph SEO meta tags
    ├── package.json         # Frontend dependencies
    └── vite.config.js       # Vite configuration with proxy rules
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- MongoDB (Local instance or MongoDB Atlas account)
- Cloudinary Account (Optional, falls back to local storage)

### Step 1: Clone Repository
```bash
git clone https://github.com/Sanesh764/ss_globle_public_school.git
cd ss_globle_public_school
```

### Step 2: Set Up Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see Environment Variables section below).

Start the backend server:
```bash
npm start
```
*Backend runs on `http://localhost:5000`*

### Step 3: Set Up Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔐 Environment Variables

### Backend `.env.example` (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ss_global_school?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=https://main.dlzshhty32uyq.amplifyapp.com

# Cloudinary Credentials (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env.example` (`frontend/.env`)
```env
VITE_API_URL=https://ss-globle-public-school.onrender.com/api
```

---

## 📡 API Endpoints Summary

All backend responses strictly adhere to the standardized JSON format:
`{ "success": boolean, "statusCode": number, "message": "string", "data": { ... } }`

| Category | Method | Endpoint | Access | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Health** | `GET` | `/api/health` | Public | System status and service health check |
| **Auth** | `POST` | `/api/admin/login` | Public | Authenticate admin credentials and generate JWT |
| **Auth** | `GET` | `/api/admin/me` | Admin | Retrieve current authenticated admin profile |
| **Auth** | `POST` | `/api/admin/logout` | Admin | Invalidate session and clear HTTP-only cookie |
| **Notices** | `GET` | `/api/notices` | Public | Fetch published notices with pagination & filters |
| **Notices** | `POST` | `/api/notices` | Admin | Create and publish a new school notice |
| **Notices** | `PUT` | `/api/notices/:id` | Admin | Update an existing notice by ID |
| **Notices** | `DELETE` | `/api/notices/:id` | Admin | Delete a notice by ID |
| **Gallery** | `GET` | `/api/gallery` | Public | Fetch gallery photos filtered by category |
| **Gallery** | `POST` | `/api/gallery` | Admin | Upload new photo to Cloudinary / storage |
| **Gallery** | `DELETE` | `/api/gallery/:id` | Admin | Delete a photo from Cloudinary & database |
| **Settings** | `GET` | `/api/settings` | Public | Retrieve website identity and leadership info |
| **Settings** | `PUT` | `/api/settings` | Admin | Update school settings and upload logo |
| **Contact** | `POST` | `/api/contact` | Public | Submit a new public contact inquiry |
| **Contact** | `GET` | `/api/contact` | Admin | Retrieve all submitted contact messages |
| **Contact** | `DELETE` | `/api/contact/:id` | Admin | Delete a contact message |

---

## 🛡️ Security Features

- **JWT Authentication**: Token-based security stored in secure HTTP-only cookies (`sameSite: 'none'`, `secure: true` in production) and Bearer authorization headers.
- **Role-Based Access Control**: Backend middleware (`admin.middleware.js`) verifies admin permissions before controller execution.
- **Input Sanitization**: Safe in-place MongoDB operator injection defense prevents `$where` and SQL/NoSQL exploits.
- **Password Hashing**: Passwords stored using `bcryptjs` salt rounds with `select: false` on the Mongoose schema.
- **Rate Limiting**: `express-rate-limit` caps API requests (300 requests / 15 minutes per IP) to prevent brute-force attacks.
- **HTTP Security Headers**: `helmet()` secures HTTP headers against clickjacking, MIME sniffing, and cross-site scripting.

---

## 🖼️ Screenshots

| Page / Interface | Preview |
| :--- | :--- |
| **Home Page** | *Hero Section, Leadership Message, Facilities Grid & Recent Bulletins* |
| **Notice Board** | *Interactive Notice Circulars with Search & Category Filters* |
| **Photo Gallery** | *High-Res Campus Image Grid with Category Filter Tabs* |
| **Admin Login** | *Clean Portal Sign-In without Hardcoded Credentials* |
| **Admin Dashboard** | *Summary Analytics Cards & Quick Shortcuts* |
| **Settings Manager** | *Website Settings Form for Branding, Address & Leadership Text* |

---

## 🔮 Future Roadmap

- [ ] **Student & Parent Portal**: Student attendance records, homework assignments, and academic performance tracking.
- [ ] **Teacher Management**: Staff directory, class scheduling, and lesson plan management.
- [ ] **Online Admission Portal**: Digital application submission, document upload, and status tracking.
- [ ] **Fee Management**: Integrated payment gateway for tuition fee collection and digital receipts.
- [ ] **Results & Report Cards**: Online examination marksheet publishing portal.
- [ ] **SMS & Email Alerts**: Automatic parent notifications for important school notices.

---

## 🚀 Deployment Guide

### Frontend Deployment (AWS Amplify / Vercel)
1. Push your repository to GitHub.
2. Log in to **AWS Amplify Console** -> Create New App from Git repository.
3. Set Environment Variable: `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Set Build Settings (Vite defaults to `dist` output folder).
5. Deploy.

### Backend Deployment (Render / Railway)
1. Log in to **Render Dashboard** -> Create New Web Service from Git repository.
2. Set Root Directory to `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Configure Environment Variables in Render:
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://...`
   - `JWT_SECRET` = `your_jwt_secret`
   - `FRONTEND_URL` = `https://main.dlzshhty32uyq.amplifyapp.com`
   - `CLOUDINARY_CLOUD_NAME` = `your_cloud_name`
   - `CLOUDINARY_API_KEY` = `your_api_key`
   - `CLOUDINARY_API_SECRET` = `your_api_secret`

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Sanesh Singh**
- **GitHub**: [@Sanesh764](https://github.com/Sanesh764)
- **Project Repository**: [ss_globle_public_school](https://github.com/Sanesh764/ss_globle_public_school)
- **School Location**: Daudnagar, Bihar, India

---

## 💬 Support & Acknowledgements

For bug reports, feature requests, or support, please open an issue on the [GitHub Issues](https://github.com/Sanesh764/ss_globle_public_school/issues) page.

Special thanks to the open-source community and maintainers of React, Express, Node.js, MongoDB, Tailwind CSS, Vite, Cloudinary, and React Icons.
