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
PORT=*********************
NODE_ENV=**********************
MONGO_URI=**********************************
JWT_SECRET=**********************

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=*******************
CLOUDINARY_API_KEY=**************
CLOUDINARY_API_SECRET=***************
```

3. Run Development Server:
```bash
npm run dev
```

