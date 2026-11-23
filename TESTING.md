# Automated & Manual Testing Guide

**Project:** S.S. Global Public School  
**Scope:** Complete test suite execution, coverage breakdown, manual API verification, fallback resilience, and upload persistence testing.

---

## 1. Automated Test Suite Summary

The application includes **53 automated tests** across 6 test suites, providing 100% pass rates across backend validation, authentication security, RBAC routing, and client fallback resilience.

| Category | Suite File | Total Tests | Passed | Framework |
| :--- | :--- | :---: | :---: | :--- |
| **Backend Validation** | `backend/tests/auth/login-validation.test.js` | 15 | 15 | Node.js Test Runner (`node:test`) |
| **Backend Integration** | `backend/tests/auth/login.test.js` | 10 | 10 | Node.js Test Runner (`node:test`) |
| **Auth Security** | `backend/tests/auth/login-security.test.js` | 9 | 9 | Node.js Test Runner (`node:test`) |
| **Auth Regression** | `backend/tests/auth/auth-regression.test.js` | 6 | 6 | Node.js Test Runner (`node:test`) |
| **Frontend Auth & State**| `frontend/tests/login-auth.test.js` | 8 | 8 | Node.js Test Runner (`node:test`) |
| **Frontend Fallback** | `frontend/tests/fallback.test.js` | 5 | 5 | Node.js Test Runner (`node:test`) |
| **TOTAL** | | **53** | **53** | **Zero Failures** |

---

## 2. Running Automated Tests

### 2.1 Backend Test Suite (40 Tests)
Runs validation, integration, security, and regression tests in isolated concurrency:
```bash
# From workspace root
npm --prefix backend test

# Or directly from backend directory
cd backend
npm test
```
**Expected Output:**
```text
# tests 40
# suites 4
# pass 40
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

### 2.2 Frontend Test Suite (13 Tests)
Runs auth state management, route guard authorization, and automatic fallback resilience tests:
```bash
# From workspace root
npm --prefix frontend test

# Or directly from frontend directory
cd frontend
npm test
```
**Expected Output:**
```text
# tests 13
# suites 2
# pass 13
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

### 2.3 Running Both Suites in One Command
```bash
npm --prefix backend test && npm --prefix frontend test
```

---

## 3. Linting and Production Build Verification

### Frontend Linting (`oxlint`)
```bash
npm --prefix frontend run lint
```
- **Exit Code**: `0`
- **Result**: `0 errors` (43 non-fatal static warnings in untouched components).

### Frontend Production Build (`vite build`)
```bash
npm --prefix frontend run build
```
- **Exit Code**: `0`
- **Result**: Complete client bundle compiled in <1 second; 45 production assets generated with optimized vendor chunk splitting.

---

## 4. Manual API & Route Verification

### 4.1 Direct Backend Health Check
```bash
curl -i http://localhost:5000/api/health
```
- **Expected Status**: `HTTP/1.1 200 OK`
- **Expected Body**:
  ```json
  { "status": "OK", "uptime": 45.2, "timestamp": "..." }
  ```

### 4.2 Frontend Proxy API Verification
Query the backend through the Vite reverse proxy:
```bash
curl -i http://localhost:5173/api/health
```
- **Expected Status**: `HTTP/1.1 200 OK`

### 4.3 Public CMS Endpoints
Verify that all public content feeds are operational:
```bash
# Public Notices
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/notices

# Public Photo Gallery
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/gallery

# Infrastructure Facilities
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/facilities

# Leadership Profiles
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/leadership

# Hero Carousel Slides
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/hero-slider

# Academic Resources / Downloads
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/academic-resources

# School Settings
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/settings

# Video Gallery
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/videos
```
*All endpoints must return `200`.*

---

## 5. Authentication & RBAC Verification

### 5.1 Dual-Identifier Validation
```bash
# 1. Empty credentials (Must return HTTP 400)
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5173/api/admin/login \
  -H "Content-Type: application/json" -d "{}"

# 2. Invalid credentials (Must return HTTP 401 Unauthorized, NOT 400 Bad Request)
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5173/api/admin/login \
  -H "Content-Type: application/json" -d '{"email":"invalid_admin_username","password":"WrongPassword123"}'

# 3. Protected endpoint without token (Must return HTTP 401 Unauthorized)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/admin/me
```

### 5.2 SuperAdmin & Staff Role Separation
1. Log in with SuperAdmin credentials -> obtain JWT token.
2. Query `/api/admin/users` with token -> returns `HTTP 200 OK` (User management allowed).
3. Log in with Staff credentials -> obtain Staff JWT token.
4. Query `/api/admin/users` with Staff token -> returns `HTTP 403 Forbidden` ("Access Denied - Super Admin permissions required").

---

## 6. Automatic Frontend Fallback Testing

Verify that public pages remain readable and write operations fail safely when the backend is unavailable:

```bash
# Step 1: Stop the backend container
docker compose -f docker-compose.dev.yml stop backend

# Step 2: Request public frontend page (Must return 200 OK)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/about

# Step 3: Attempt write operation (Must fail safely with 502 Bad Gateway)
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5173/api/contact \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","phone":"123","message":"msg"}'

# Step 4: Restart backend container
docker compose -f docker-compose.dev.yml start backend

# Step 5: Verify automatic recovery (Must return 200 OK)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/health
```

---

## 7. Upload Persistence Verification

Verify that media uploaded via the CMS survives container and compose stack restarts:

1. **Upload Test Image**:
   ```bash
   # Upload via API using authenticated admin token
   curl -X POST http://localhost:5173/api/gallery \
     -H "Authorization: Bearer <TOKEN>" \
     -F "image=@your_test_image.png;type=image/png" \
     -F "title=Persistence Test" \
     -F "category=Campus"
   ```
2. **Verify Immediate Accessibility**:
   `curl -I http://localhost:5173/uploads/<filename>` -> `HTTP 200 OK`.
3. **Restart Backend**:
   `docker compose -f docker-compose.dev.yml restart backend`
4. **Re-verify Accessibility**:
   `curl -I http://localhost:5173/uploads/<filename>` -> `HTTP 200 OK`.
5. **Restart Complete Stack**:
   `docker compose -f docker-compose.dev.yml restart`
6. **Final Persistence Check**:
   `curl -I http://localhost:5173/uploads/<filename>` -> `HTTP 200 OK`.
7. **Clean Up**: Delete the test entry via `DELETE /api/gallery/:id`.
