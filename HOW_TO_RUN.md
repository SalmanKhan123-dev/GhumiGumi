# ▶️ How to Run GhumiGumi in VS Code

## 🔑 FIRST — Fill in your API keys (only 4 things needed)

Open `backend/.env` and replace these 4 values:

| What | Where to get it |
|------|-----------------|
| `MONGODB_URI` | https://cloud.mongodb.com → Free Cluster → Connect → Drivers → copy URI |
| `JWT_SECRET` | Open any terminal → run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` → copy output |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID → add redirect URI: `http://localhost:3000/api/auth/google/callback` |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys → Create Key |

> Redis: if you don't have Redis installed, go to https://upstash.com, create a free DB, copy the URL and paste as `REDIS_URL=`

---

## ▶️ Run the project

### Terminal 1 — Backend
```bash
cd backend
npm install
npm run dev
```
You should see: ✅ Server running on port 3000

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
You should see: Local: http://localhost:5173

Open http://localhost:5173 in your browser.

---

## ✨ New Features Added

### 🤖 GhumiBot Chatbot
- Look for the **🌍 button** in the bottom-right corner of every page
- Click it → chat with an AI travel assistant
- Powered by Claude AI (Anthropic)

### 🔐 Sign In / Sign Up
- Email + Password signup/signin works out of the box
- Google Login works once you add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### 📝 Post a Vlog/Blog
- Sign in first
- Click **"Add Blog"** in the header
- Fill in the form → click **Post Blog**
