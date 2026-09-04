# Multi-Tenant Alumni Data Intelligence & Relationship System

An enterprise-grade, multi-tenant platform designed for collegiate networks across India. Built with modern, high-density SaaS principles, robust data isolation by college, verified credential medallions, and Google Gemini AI-powered mentorship matching.

Styled with the **Institutional Heritage & Network Modernity** design system from Google Stitch.

---

## Architecture Overview

The system is decoupled into two completely independent projects ready for independent cloud deployment:
- **Backend (`/backend`)**: Node.js + Express + Prisma ORM + PostgreSQL. Deployable to **Railway** or **Render**.
- **Frontend (`/frontend`)**: React (Vite) + Tailwind CSS + Recharts + Axios. Deployable to **Vercel**.

```
Alumni-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Complete PostgreSQL multi-tenant schema
│   │   └── seed.js             # Seed data with institutions, verified alumni, events, donations
│   ├── src/
│   │   ├── config/             # DB client, Passport OAuth strategies
│   │   ├── controllers/        # College, Auth, Profile, Directory, Event, Job, Mentorship, Donation, Admin
│   │   ├── middleware/         # Auth (JWT) & Multi-tenant isolation (tenantScope.js)
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # Google Gemini AI Mentor Matching service
│   │   └── server.js           # Express app setup and middleware
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── api/                # Axios instance with JWT auto-attachment & API methods
    │   ├── context/            # AuthContext (onboarding state machine & user session)
    │   ├── components/         # Sidebar, TopNavbar, VerifiedBadge, RegisterCollegeModal
    │   ├── pages/              # Login, CollegeSelector, RoleSelection, StudentProfileForm,
    │   │                       # AlumniProfileForm, Dashboard, Directory, Mentorship, Events,
    │   │                       # Jobs, Donations, AdminPanel
    │   ├── index.css           # Tailwind + Tabular-nums rules
    │   ├── App.jsx             # Onboarding gatekeeper
    │   └── main.jsx
    ├── tailwind.config.js      # Google Stitch design system tokens
    ├── vite.config.js
    ├── .env.example
    ├── package.json
    └── README.md
```

---

## Quick Setup Instructions

### 1. Backend Setup
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
```

Configure your PostgreSQL database connection in `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/alumni_db?schema=public"
JWT_SECRET="super_secret_jwt_key_change_in_production_12345"
GEMINI_API_KEY="your_gemini_api_key_here"
```

Run database migration & populate demo seed data:
```bash
npx prisma migrate dev --name init
npm run seed
```

Start the backend API server:
```bash
npm run dev
```
Backend will run at **`http://localhost:5000`**.

---

### 2. Frontend Setup
Open a second terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at **`http://localhost:5173`**.

---

## Deployment Guide

### Deploying the Backend (Railway / Render)
1. Push the `/backend` folder to a GitHub repository or subfolder.
2. Link the repository to **Railway** or **Render**.
3. Add a PostgreSQL database service and set the `DATABASE_URL` environment variable.
4. Set `NODE_ENV=production`, `PORT=5000`, `JWT_SECRET`, and `GEMINI_API_KEY`.
5. Build command: `npm install && npx prisma generate`
6. Start command: `npm start`

### Deploying the Frontend (Vercel)
1. Import the `/frontend` directory into **Vercel**.
2. Framework preset: **Vite**.
3. Set the environment variable:
   - `VITE_API_URL`: The URL of your deployed Railway/Render backend (e.g. `https://alumni-backend.up.railway.app`).
4. Click **Deploy**.
