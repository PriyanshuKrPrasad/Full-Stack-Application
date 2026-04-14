# ⚡ AuthKit — Full-Stack JWT Auth

**Node.js + Express + MySQL + Prisma + Next.js 14**

A production-ready authentication system with JWT, protected routes, and a dashboard.

---

## 🚀 Tech Stack

- Backend: Node.js, Express  
- Database: MySQL + Prisma ORM  
- Auth: JWT + bcryptjs  
- Frontend: Next.js 14 (App Router)  
- HTTP: Axios  
- Cookies: js-cookie  

---

## ✨ Features

- Register & login with JWT
- Protected dashboard (middleware)
- Profile view & update
- Password strength meter
- Auto redirect for auth users/guests
- Auto logout on token expiry
- Prisma singleton (dev-safe DB handling)

---

## 📁 Project Structure
authkit/
├── auth-api/ → Backend (Express + Prisma)
├── auth-frontend/ → Frontend (Next.js 14)
└── setup.sh → Setup script
