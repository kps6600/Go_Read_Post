# GoReadPost

A modern, high-performance publishing platform and editorial CMS built with **React 19**, **Vite**, **Node.js**, **Express**, and **MongoDB**.

---

## 🌟 Key Features

### 📰 Public Publication Portal
- **Dynamic Content Feed:** Featured stories, latest news, trending articles, video shows, and category showcases.
- **Taxonomy & Discovery:** Deep dive by topics and categories with dedicated archive and landing pages.
- **Rich Media & Video Player:** Native video modals, shows section, and media embeds.
- **Reader Engagement:** Interactive comments system, reactions, and newsletter subscriptions.

### 🛠️ Editorial CMS & Admin Suite
- **Article Studio:** Powered by TipTap rich text editor (tables, code blocks, images, YouTube embeds, links, and text formatting).
- **Taxonomy Management:** Manage Categories and Topics with bulk selection, status toggling (Active / Inactive), live page previews, and unified filtering.
- **Editorial Submissions & Reviews:** Moderation queue for author submissions and reader feedback.
- **Author Profiles:** Author directory and bio management.
- **Newsletter Management:** Subscriber tracking and broadcast tools.

---

## 🏗️ Project Architecture

```
goreadpost/
├── frontend/                # Client application (React 19 + Vite)
│   ├── src/
│   │   ├── components/      # UI components, layout, and Admin CMS views
│   │   ├── services/        # API clients (Taxonomy, Articles, Auth, etc.)
│   │   ├── admin-cms.css    # Central styling for CMS suite
│   │   └── App.jsx          # Routing & application shell
│   ├── public/              # Static branding and assets
│   ├── vite.config.js       # Vite configuration with API proxying
│   └── package.json
│
├── backend/                 # REST API server (Node.js + Express + Mongoose)
│   ├── routes/              # Express API endpoints (/api/articles, /api/topics, etc.)
│   ├── models/              # Mongoose data models
│   ├── middleware/          # JWT authentication and file upload handlers
│   ├── uploads/             # Local media file storage
│   ├── server.js            # Server entry point
│   ├── db.js                # Database connection
│   ├── .env.example         # Environment template
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   Example `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/goreadpost
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`.

4. Build for production:
   ```bash
   npm run build
   ```

---

## ⚙️ Tech Stack

- **Frontend:**
  - React 19
  - Vite 8
  - TipTap Editor (`@tiptap/react`, `@tiptap/starter-kit`, extensions)
  - Lucide React (Icons)
  - Canvas Confetti
- **Backend:**
  - Node.js & Express 5
  - MongoDB & Mongoose 9
  - JWT (`jsonwebtoken`) & `bcryptjs`
  - CORS, Dotenv, Cloudinary

