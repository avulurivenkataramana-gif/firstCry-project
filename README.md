# 🎓 FirstCry Intellitots — Curriculum Planner Dashboard

A full-stack MERN application for managing early childhood education curriculum planning, teacher assignments, student management, and AI-powered lesson generation.

## 📁 Project Structure

```
├── backend/          # Node.js + Express API server
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, rate limiting
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Email, mock database
│   │   ├── config/         # Database connection
│   │   └── app.js          # Entry point
│   └── package.json
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── components/    # Sidebar, Navbar, Layout
│   │   ├── context/       # Auth, Theme providers
│   │   ├── pages/         # Dashboard, Curriculum, etc.
│   │   └── services/      # API client
│   ├── vercel.json        # SPA rewrite rules
│   └── package.json
├── render.yaml       # Render deployment blueprint
└── package.json      # Root workspace scripts
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB (optional — falls back to in-memory mock DB)

### 1. Clone & Install

```bash
git clone https://github.com/avulurivenkataramana-gif/firstCry-project.git
cd firstCry-project
npm run install-all
```

### 2. Configure Environment

**Backend** — Copy and edit:
```bash
cp backend/.env.example backend/.env
```

Required variables:
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5002` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/curriculum_planner` |
| `JWT_SECRET` | **Required** — Strong random secret | Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CORS_ORIGIN` | Allowed frontend URLs (comma-separated) | `http://localhost:5173` |

**Frontend** — Copy and edit:
```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5002/api` |

### 3. Start Development Servers

```bash
# Terminal 1 — Backend
npm run backend-dev

# Terminal 2 — Frontend
npm run frontend
```

### 4. Default Login Credentials (Mock DB)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@firstcry.com` | `venky123` |
| Teacher | `anita.sharma@firstcry.com` | `Teach@123` |
| Coordinator | `karan.malhotra@firstcry.com` | `Coord@123` |
| Parent | `rajesh.patel@firstcry.com` | `Parent@123` |

---

## 🌐 Deployment

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → Import from GitHub
2. Set **Root Directory** = `frontend`
3. Set **Environment Variable**: `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy ✅

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Root Directory** = `backend`
4. Set **Build Command** = `npm install`
5. Set **Start Command** = `npm start`
6. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_SECRET` | *(generate a strong random string)* |
| `MONGODB_URI` | *(your MongoDB Atlas connection string)* |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |

7. Deploy ✅

### Database → MongoDB Atlas (Free Tier)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Add a database user
4. Whitelist `0.0.0.0/0` for access from Render
5. Copy the connection string → paste as `MONGODB_URI` on Render

---

## 🔒 Security Features

- **Helmet** — Secure HTTP headers
- **CORS** — Origin-restricted API access
- **Rate Limiting** — 30 requests/15min on auth endpoints
- **NoSQL Sanitization** — Prevents injection attacks
- **JWT Authentication** — Token-based with expiry
- **Password Hashing** — bcrypt with salt rounds
- **Environment Variables** — No secrets in code

---

## 📄 License

MIT
