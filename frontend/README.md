# 🌍 GhumiGumi — AI-Powered Travel Blog Platform

GhumiGumi is a full-stack travel blog platform where users can read, write, and share travel experiences — supercharged with AI features to plan trips, generate blog content, and discover destinations.

---

## 🖥️ Screenshots

### Homepage
> Browse featured posts, explore categories, and access all AI features from the header.

![Homepage](./screenshots/homepage.png)

### 🗺️ AI Trip Planner
> Enter a destination and number of days — AI generates a complete day-by-day itinerary.

![Trip Planner](./screenshots/trip-planner.png)

### ✍️ AI Blog Writer
> Give a topic and writing style — AI writes a full travel blog post with title suggestions.

![Blog Writer](./screenshots/blog-writer.png)

### 📝 Create Blog
> Write and publish your own travel vlog with categories, cover image, and featured post option.

![Create Blog](./screenshots/create-blog.png)

### 🌍 Destination Finder
> Answer 3 quick questions about budget, weather, and trip type — AI recommends your perfect destinations.

![Destination Finder](./screenshots/destination-finder.png)

---

## ✨ Features

- **📖 Travel Blog Feed** — Browse and read travel blogs posted by the community
- **✍️ Create & Edit Blogs** — Write your own travel vlogs with images and categories
- **🗺️ AI Trip Planner** — Get a full day-by-day itinerary for any destination
- **🌍 AI Destination Finder** — Find perfect destinations based on your budget, weather preference, and trip type
- **✍️ AI Blog Writer** — AI generates complete blog content with title suggestions
- **🔐 Authentication** — Email/password signup & Google OAuth login
- **🌙 Dark Mode** — Full dark/light theme support
- **👑 Admin Dashboard** — Manage users and blogs

---

## 🛠️ Tech Stack

### Frontend
| Tech | Usage |
|------|-------|
| React + TypeScript | UI Framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router | Navigation |
| React Hook Form + Zod | Form validation |
| Axios | API calls |

### Backend
| Tech | Usage |
|------|-------|
| Node.js + Express | Server |
| TypeScript | Language |
| MongoDB + Mongoose | Database |
| Redis | Session/Cache |
| Passport.js | Google OAuth |
| JWT | Authentication |
| Groq API (LLaMA 3) | AI Features |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm
- MongoDB Atlas account (free)
- Redis (Upstash free tier)
- Groq API key (free)
- Google OAuth credentials

### 1. Clone the repository
```bash
git clone https://github.com/SalmanKhan123-dev/GhumiGumi-WebDev-Project.git
cd GhumiGumi-WebDev-Project
```

### 2. Setup Backend environment
```bash
cd backend
cp .env.example .env
```

Fill in `backend/.env`:

```env
PORT=3000
NODE_ENV=development

# MongoDB → https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ghumigumi

# Redis → https://upstash.com (free)
REDIS_URL=rediss://default:password@your-db.upstash.io:6379

# JWT Secret → run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_long_random_secret

ACCESS_TOKEN_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
ACCESS_COOKIE_MAXAGE=3600000
REFRESH_COOKIE_MAXAGE=604800000

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Google OAuth → https://console.cloud.google.com
# Redirect URI: http://localhost:3000/api/auth/google/callback
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Groq API (free) → https://console.groq.com
GROQ_API_KEY=your_groq_api_key
```

### 3. Setup Frontend environment
```bash
cd frontend
```

Create `frontend/.env`:
```env
VITE_API_PATH=http://localhost:3000
```

### 4. Install & Run

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser ✅

---

## 📁 Project Structure

```
GhumiGumi/
├── backend/
│   ├── controllers/
│   │   ├── ai-controller.ts       # AI features (Trip Planner, Blog Writer, Destination Finder)
│   │   ├── auth-controller.ts     # Sign in / Sign up / Google OAuth
│   │   ├── posts-controller.ts    # Blog CRUD
│   │   └── user-controller.ts     # User management
│   ├── routes/
│   │   ├── ai.ts                  # /api/ai/*
│   │   ├── auth.ts                # /api/auth/*
│   │   ├── posts.ts               # /api/posts/*
│   │   └── user.ts                # /api/user/*
│   ├── models/                    # Mongoose schemas
│   ├── middlewares/               # Auth, error handling
│   ├── config/                    # Passport, DB, utils
│   └── .env                       # Environment variables (not committed)
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── home-page.tsx
│       │   ├── trip-planner.tsx          # 🗺️ AI Trip Planner
│       │   ├── blog-generator.tsx        # ✍️ AI Blog Writer
│       │   ├── destination-recommender.tsx # 🌍 Destination Finder
│       │   ├── add-blog.tsx
│       │   ├── signin-page.tsx
│       │   └── signup-page.tsx
│       ├── components/            # Reusable UI components
│       ├── layouts/               # Header, Footer
│       └── helpers/               # Axios instance, utilities
│
└── README.md
```

---

## 🔑 Getting API Keys

| Service | Link | Cost |
|---------|------|------|
| MongoDB Atlas | https://cloud.mongodb.com | Free |
| Upstash Redis | https://upstash.com | Free |
| Google OAuth | https://console.cloud.google.com | Free |
| Groq API | https://console.groq.com | Free |

---

## 🤖 AI Features Details

### 🗺️ AI Trip Planner (`/trip-planner`)
- Input: Destination, days, budget, number of travelers
- Output: Full day-by-day itinerary with morning/afternoon/evening activities, food recommendations, tips, and estimated costs

### 🌍 Destination Finder (`/destination-recommender`)
- Input: Budget range, weather preference, trip type (via clickable buttons)
- Output: Top 5 personalized destination recommendations with attractions, best time to visit, and travel tips

### ✍️ AI Blog Writer (`/blog-generator`) *(requires login)*
- Input: Blog topic, destination, writing style
- Output: 3 title suggestions + full blog post (intro, body, tips, conclusion) — can be directly posted to GhumiGumi

---

## 👤 Author

**Salman Khan**
- GitHub: [@SalmanKhan123-dev](https://github.com/SalmanKhan123-dev)

---

## 📄 License

This project is licensed under the MIT License.