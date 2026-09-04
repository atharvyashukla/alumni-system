# Alumni Data Intelligence & Management System - Backend

Enterprise-grade, multi-tenant backend built with **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**.

---

## Prerequisites
- **Node.js** (v18.0.0 or later recommended)
- **PostgreSQL** database (Local instance, or cloud-hosted on Supabase, Neon, Railway, or Render)

---

## Quick Start Guide

### 1. Install Dependencies
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
```

### 2. Configure Database Connection & Gemini API
Open `.env` in the `backend` folder:
```env
# Database connection:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/alumni_db?schema=public"

# Google Gemini API Key (for AI Mentorship Matching):
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Run Prisma Migration & Seed
Create tables in PostgreSQL and load starter demo data (colleges, verified alumni at Google/Microsoft/Tata Motors, events, jobs, donations):
```bash
npx prisma migrate dev --name init
npm run seed
```

### 4. Start the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

---

## Step 4 Endpoints & Testing

### 1. AI Mentor Matching (`POST /mentorship/suggest`)
Takes a student's inquiry and branch, pulls verified alumni from that college, calls Gemini (`GEMINI_API_KEY`), and returns the top 3 best-matched mentors with personalized rationale:

**PowerShell:**
```powershell
# Authenticate as student
$auth = Invoke-RestMethod -Uri "http://localhost:5000/auth/dev-login" -Method Post -Body (@{ email = "student1@csjmu.ac.in"; fullName = "Aarav Gupta" } | ConvertTo-Json) -ContentType "application/json"
$token = $auth.token

# Attach college
$colleges = Invoke-RestMethod -Uri "http://localhost:5000/colleges" -Method Get
$csjmuId = ($colleges.data | Where-Object { $_.name -like "*CSJMU*" }).id
Invoke-RestMethod -Uri "http://localhost:5000/users/me/college" -Method Post -Body (@{ collegeId = $csjmuId } | ConvertTo-Json) -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }

# Ask AI for Mentorship Suggestions
$aiBody = @{
    branch = "Computer Science and Engineering"
    message = "I want to break into large-scale distributed systems and cloud infrastructure engineering at top tech firms."
} | ConvertTo-Json

$suggestions = Invoke-RestMethod -Uri "http://localhost:5000/mentorship/suggest" -Method Post -Body $aiBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
$suggestions.suggestions | Format-Table name, matchScore, highlight
```

### 2. Submit & Manage Mentorship Requests
```powershell
# Pick an alumni ID from the suggestions
$alumniId = $suggestions.suggestions[0].alumniId

# Submit request
$reqBody = @{
    alumniId = $alumniId
    message = "Hello! I am a 3rd-year CS student and would love guidance on preparing for system design interviews."
} | ConvertTo-Json

$createdReq = Invoke-RestMethod -Uri "http://localhost:5000/mentorship-requests" -Method Post -Body $reqBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }

# View student's requests
Invoke-RestMethod -Uri "http://localhost:5000/mentorship-requests?asStudent=true" -Method Get -Headers @{ Authorization = "Bearer $token" }

# Target alumni or Admin can Accept or Decline:
$reqId = $createdReq.data.id
$updateBody = @{ status = "accepted" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/mentorship-requests/$reqId" -Method Patch -Body $updateBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
```

### 3. Donations & Leaderboard (`POST /donations`, `GET /donations/summary`)
```powershell
# View donations summary and top 10 leaderboard
Invoke-RestMethod -Uri "http://localhost:5000/donations/summary?collegeId=$csjmuId" -Method Get

# Make a new donation
$donationBody = @{
    collegeId = $csjmuId
    donorName = "Aarav Gupta"
    donorEmail = "student1@csjmu.ac.in"
    amount = 5000
    purpose = "Student Hackathon Prize Pool"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/donations" -Method Post -Body $donationBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
```

### 4. Admin Management (`GET /admin/users`, `PATCH /alumni/:id/verify`)
```powershell
# Dev login as an Admin
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/auth/dev-login" -Method Post -Body (@{ email = "admin@csjmu.ac.in"; fullName = "CSJMU Admin"; role = "admin"; collegeId = $csjmuId } | ConvertTo-Json) -ContentType "application/json"
$adminToken = $adminAuth.token

# List all users under CSJMU with their roles and profiles
Invoke-RestMethod -Uri "http://localhost:5000/admin/users?collegeId=$csjmuId" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }

# Toggle Alumni Verification Status (Medallion badge)
$alumniList = Invoke-RestMethod -Uri "http://localhost:5000/alumni" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
$targetAlumniId = $alumniList.data[0].id

# Toggle isVerified
$verifyBody = @{ isVerified = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/alumni/$targetAlumniId/verify" -Method Patch -Body $verifyBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" }
```
