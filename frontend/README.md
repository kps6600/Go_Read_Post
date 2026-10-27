# GoReadPost — Architecture & Running Guide

This repository contains completely separated standalone directories for the frontend and backend.

## Project Structure

```
goreadpost/
├── frontend/                # React 19 + Vite frontend application
│   ├── src/                 # Components, services, styles, context
│   ├── public/              # Static assets & logos
│   ├── index.html           # Vite HTML entry
│   ├── vite.config.js       # Vite configuration with /api & /uploads proxy
│   └── package.json         # Frontend-only dependencies & scripts
│
├── backend/                 # Node.js + Express + MongoDB REST API
│   ├── routes/              # Express API routers
│   ├── models/              # Mongoose schemas & models
│   ├── middleware/          # Auth & upload middleware
│   ├── uploads/             # Local media file storage
│   ├── server.js            # Express server entry point
│   ├── db.js                # MongoDB connection handler
│   ├── .env                 # Environment configuration (PORT, MONGO_URI, etc.)
│   └── package.json         # Backend-only dependencies & scripts
│
└── package.json             # Root coordinator (convenience runner)
```

---

## How to Run

### Method 1: Separate Terminals (Standalone)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Starts backend server on http://localhost:5000 with file watching
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Starts Vite dev server on http://localhost:5173
```

---

### Method 2: Single Command from Root

From the repository root:
```bash
npm run dev
# Concurrently starts both backend (port 5000) and frontend (port 5173)
```

Individual root commands:
- `npm run dev:frontend` — runs only frontend
- `npm run dev:backend` — runs only backend
- `npm run build` — builds production bundle in `frontend/dist`
