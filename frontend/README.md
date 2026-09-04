# Alumni Data Intelligence & Relationship System - Frontend

Modern, high-density collegiate alumni web application built with **React (Vite)**, **Tailwind CSS**, **Recharts**, and **Axios**, styled with Google Stitch design system tokens (**Institutional Heritage & Network Modernity**).

---

## Prerequisites
- **Node.js** (v18+ recommended)
- The backend server running at `http://localhost:5000`

---

## Getting Started

### 1. Install Dependencies
Open a new terminal window in the `frontend` folder:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Verify `.env` in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Step 5 Testing: Onboarding & Identity Flow

The application implements a smart onboarding gatekeeper based on `GET /users/me`:

1. **Login Screen (`/`)**:
   - Offers Google & LinkedIn sign-in buttons.
   - Includes instant **Development Personas**:
     - *Demo Student* (Aarav Gupta)
     - *Verified Alumni* (Priya Sharma)
     - *College Administrator* (CSJMU Registrar)
     - *Test Fresh User Onboarding Flow from Scratch* (creates a new account to test every step)

2. **Step 1: College Selection**:
   - If a user has no college assigned (`needs_college`), they see the search bar and institution grid.
   - Click "Select" on any institution (e.g. *CSJMU*), or click **Register College** to create a new one.

3. **Step 2: Role Selection**:
   - After selecting an institution, choose between **Current Student** and **Alumni / Graduate**.
   - Your choice permanently locks your identity role.

4. **Step 3: Profile Setup**:
   - If you chose **Student**, complete the academic record (Branch, Year, Roll Number, Graduation Window).
   - If you chose **Alumni**, provide career details (Batch, Branch, Company, Designation, Sector, LinkedIn).

5. **Portal Entry**:
   - Once completed, the session unlocks and displays your authenticated institutional profile with the verified badge medallion!
