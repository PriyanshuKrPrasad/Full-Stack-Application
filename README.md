# ⚡ AuthKit — Full-Stack JWT Authentication

> **Node.js + Express + MySQL + Prisma ORM + Next.js 14**  
> Complete, production-ready auth system with JWT, protected routes, and a polished dashboard.

---

## Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js 18+, Express 4              |
| Database   | MySQL 8 via Prisma ORM              |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Frontend   | Next.js 14 App Router               |
| HTTP       | Axios with interceptors             |
| Cookies    | js-cookie (7-day JWT storage)       |

---

## Features

- **Register** — name, email, password with server + client validation
- **Login** — JWT returned and stored in a secure cookie
- **Dashboard** — protected by Next.js edge middleware
- **Profile** — view and edit name/email, live data from API
- **Security tab** — session info, password placeholder
- **Account tab** — account ID, plan, danger zone
- **Password strength meter** on register
- **Auto-redirect** — logged-in users → dashboard; guests → login
- **401 handling** — expired/invalid tokens auto-redirect to login
- **CORS** configured for ports 3000 ↔ 3001
- **Prisma singleton** to prevent connection exhaustion in dev

---

## Quick Start

### Prerequisites

| Tool     | Version       |
|----------|---------------|
| Node.js  | 18 or higher  |
| npm      | 9 or higher   |
| MySQL    | 8.0 or higher |

### Option A — Automated setup

```bash
cd authkit
chmod +x setup.sh
./setup.sh
```

### Option B — Manual setup

#### 1. Create the MySQL database

```bash
mysql -u root -p
```
```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 2. Configure backend

```bash
cd auth-api
cp .env.example .env
```

Edit `auth-api/.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/auth_db"
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
```

#### 3. Install and migrate

```bash
# Backend
cd auth-api
npm install
npx prisma migrate dev --name init
npx prisma generate

# Frontend (new terminal)
cd auth-frontend
npm install
```

#### 4. Run both servers

```bash
# Terminal 1 — Backend (port 3000)
cd auth-api
npm run dev

# Terminal 2 — Frontend (port 3001)
cd auth-frontend
npm run dev
```

Open **http://localhost:3001** in your browser.

---

## Project Structure

```
authkit/
├── setup.sh                          ← automated setup script
│
├── auth-api/                         ← Express backend
│   ├── prisma/
│   │   └── schema.prisma             ← User model + Role enum
│   ├── src/
│   │   ├── app.js                    ← Express app + CORS + global errors
│   │   ├── lib/
│   │   │   └── prisma.js             ← Prisma singleton
│   │   ├── controllers/
│   │   │   └── authController.js     ← register, login, getProfile, updateProfile
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     ← protect + restrictTo
│   │   └── routes/
│   │       └── authRoutes.js         ← /api/auth/* routes
│   ├── .env                          ← DATABASE_URL, JWT_SECRET, PORT
│   └── package.json
│
└── auth-frontend/                    ← Next.js 14 frontend
    ├── src/
    │   ├── app/
    │   │   ├── layout.jsx            ← global CSS vars, fonts, AuthProvider
    │   │   ├── page.jsx              ← redirect → /login
    │   │   ├── (auth)/
    │   │   │   ├── login/page.jsx    ← login form
    │   │   │   └── register/page.jsx ← register form + password strength
    │   │   └── dashboard/page.jsx    ← protected dashboard (4 tabs)
    │   ├── components/
    │   │   ├── Alert.jsx             ← error/success/info banners
    │   │   ├── FormField.jsx         ← input with label, error, pw toggle
    │   │   ├── Logo.jsx              ← brand mark
    │   │   ├── PasswordStrength.jsx  ← 4-bar strength meter
    │   │   └── Spinner.jsx           ← SVG loading spinner
    │   ├── hooks/
    │   │   └── useAuth.js            ← AuthContext + register/login/logout/update
    │   ├── services/
    │   │   └── api.js                ← Axios instance + token helpers + authAPI
    │   └── middleware.js             ← Next.js edge route protection
    ├── .env.local                    ← NEXT_PUBLIC_API_URL
    ├── jsconfig.json                 ← @/* path alias
    └── package.json
```

---

## API Reference

| Method  | Endpoint              | Auth | Description                  |
|---------|-----------------------|------|------------------------------|
| GET     | /health               | —    | Health check                 |
| POST    | /api/auth/register    | —    | Register new user, get JWT   |
| POST    | /api/auth/login       | —    | Login, get JWT               |
| GET     | /api/auth/profile     | JWT  | Get current user profile     |
| PATCH   | /api/auth/profile     | JWT  | Update name / email          |

### Request bodies

**POST /api/auth/register**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret123" }
```

**POST /api/auth/login**
```json
{ "email": "alice@example.com", "password": "secret123" }
```

**PATCH /api/auth/profile** _(Bearer token required)_
```json
{ "name": "Alice Updated" }
```

### Response format

```json
{
  "success": true,
  "token": "eyJhbGci...",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| CORS error in browser | Frontend/backend on different ports | CORS is already configured in app.js for ports 3000 + 3001 |
| `ER_NOT_SUPPORTED_AUTH_MODE` | MySQL 8 auth plugin | `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pass';` |
| `P1001: DB unreachable` | MySQL not running or wrong creds | Check `DATABASE_URL` in `.env`; run `brew services start mysql` |
| Prisma generate error | Schema changed without generate | `npx prisma generate` |
| 401 on protected routes | Token expired or missing | Clear cookies and log in again |
| `Module not found '@/*'` | Path alias missing | Verify `jsconfig.json` has `"paths": { "@/*": ["./src/*"] }` |
| Port 3000 in use | Another process | `lsof -ti:3000 \| xargs kill` or change `PORT` in `.env` |
| Next.js hydration error | Missing `'use client'` | Add `'use client'` as first line of any component using hooks |

---

## Environment Variables

### `auth-api/.env`

| Variable      | Example                              | Description               |
|---------------|--------------------------------------|---------------------------|
| PORT          | 3000                                 | Express server port       |
| NODE_ENV      | development                          | Environment name          |
| DATABASE_URL  | mysql://root:pass@localhost:3306/... | Prisma connection string  |
| JWT_SECRET    | (64-char random hex)                 | JWT signing secret        |
| JWT_EXPIRES_IN| 7d                                   | Token expiry duration     |

### `auth-frontend/.env.local`

| Variable               | Example                        | Description        |
|------------------------|--------------------------------|--------------------|
| NEXT_PUBLIC_API_URL    | http://localhost:3000/api      | Backend base URL   |

---

## Useful Commands

```bash
# View DB in browser
cd auth-api && npx prisma studio

# Reset DB (caution: wipes all data)
cd auth-api && npm run db:reset

# Test API with curl
curl http://localhost:3000/health

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"secret123"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret123"}'

# Use the token from login:
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
