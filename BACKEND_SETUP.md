# GhumiGumi — Backend Setup Guide

## What Was Added


### 1. 🔐 Sign In / Sign Up (Email + Google OAuth)
- Already built. Just needs `.env` configured correctly.

### 2. 📝 Post a Vlog/Blog
- Already built. Users must be signed in. Use the **"Add Blog"** button.

---

## Step-by-Step Setup

### Step 1 — Create Backend `.env`

```
cd backend
cp .env.example .env
```

Now open `backend/.env` and fill in each value:

---

#### 🍃 MongoDB URI
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Click **Connect → Drivers**
4. Copy the connection string
5. Replace `<username>` and `<password>` with your DB user credentials
6. Paste as `MONGODB_URI=mongodb+srv://...`

---

#### 🔴 Redis URL
**Option A (Local):** Install Redis locally → `REDIS_URL=redis://localhost:6379`

**Option B (Free Cloud):**
1. Go to [https://upstash.com](https://upstash.com)
2. Create a free Redis database
3. Copy the **Redis URL** → paste as `REDIS_URL=rediss://...`

---

#### 🔑 JWT Secret
Run this in terminal to generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Paste the output as `JWT_SECRET=<output>`

---

#### 🌐 Google OAuth (for "Continue with Google")
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services → OAuth consent screen** → fill in app info
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add Authorized Redirect URI:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-backend.com/api/auth/google/callback`
7. Copy **Client ID** → paste as `GOOGLE_CLIENT_ID=...`
8. Copy **Client Secret** → paste as `GOOGLE_CLIENT_SECRET=...`

---


> ⚠️ This key is **backend-only**. It never goes in the frontend `.env`.

---

### Step 2 — Create Frontend `.env`

```
cd frontend
cp .env.example .env
```

The only thing to fill in:
```
VITE_API_PATH=http://localhost:3000
```
(Change to your deployed backend URL in production)

---

### Step 3 — Install & Run

```bash
# From project root
npm install

# Start backend (in one terminal)
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

---

## How Features Work

### Sign In / Sign Up
- **Email/Password:** POST `/api/auth/email-password/signin` and `/signup`
- **Google:** Clicking "Continue with Google" redirects to `/api/auth/google` → Google → callback → sets cookie → redirects to frontend
- Tokens are stored in **httpOnly cookies** (secure)

### Posting a Vlog/Blog
1. Sign in to your account
2. Click **"Add Blog"** in the navigation
3. Fill in: Title, Content, Author Name, Image URL, Categories
4. Click **"Post Blog"**
- Requires authentication (JWT cookie)


---

## File Changes Summary

| File | Change |
|------|--------|
| `backend/.env.example` | ✅ NEW — all env variables with instructions |
| `frontend/src/components/ghumibot.tsx` | ✅ NEW — floating chat widget |
| `frontend/src/App.tsx` | ✅ UPDATED — GhumiBot added to all pages |
| `frontend/.env.example` | ✅ NEW — frontend env template |
