# S.S. Global Public School - Backend API

Production-ready Node.js & Express.js REST API for S.S. Global Public School, Daudnagar, Bihar.

## Features
- **MVC Architecture**: Models, Views/Controllers, Routes, Middleware, Services
- **Authentication**: JWT token verification + bcrypt password encryption
- **Image Storage**: Cloudinary integration with local `/uploads` fallback
- **Database**: MongoDB with Mongoose Schemas & Auto-Seeding
- **Security**: Input validation with `express-validator`, CORS protection, Cookie Parser

## Quick Start

1. Install Dependencies:
```bash
npm install
```

2. Environment Variables (.env):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ss_global_school
JWT_SECRET=ss_global_public_school_super_secret_jwt_key_2026

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

3. Run Development Server:
```bash
npm run dev
```

## Admin Default Credentials (Auto-Seeded)
- **Email**: `admin@ssglobal.edu.in`
- **Password**: `Admin@123456`
