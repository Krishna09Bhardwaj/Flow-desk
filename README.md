# FlowDesk

**A production-grade collaborative team task manager.** Admins manage projects and members. Members execute work. Built with precision — minimal noise, maximum clarity.

**Live Demo:** _Coming soon_

---

## Overview

FlowDesk is a full-stack web application that brings structure to team workflows. It features a drag-and-drop Kanban board, role-based access control, real-time activity feeds, and a clean dashboard — designed to give both managers and individual contributors exactly what they need.

---

## Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🔐 JWT Authentication | Secure login with access tokens in memory and refresh tokens in httpOnly cookies |
| 👤 Role-Based Access | Admins manage everything; Members are scoped to their assigned projects |
| 🗂️ Project Management | Create, edit, archive projects with custom colors and member management |
| ✅ Task Management | Create tasks with priority, due date, assignee, description, and status |
| 🎯 Kanban Board | Drag-and-drop cards across TODO → IN PROGRESS → IN REVIEW → DONE |
| 💬 Comments | Threaded comment threads on every task |
| 🔔 Notifications | In-app bell with unread badge — task assignments, comments, project additions |
| 📊 Dashboards | Role-aware dashboards with charts, activity feeds, and personal task views |
| 📝 Activity Log | Every action automatically logged with user, timestamp, and context |

### Beyond-the-Requirement Features
| Feature | Description |
|---------|-------------|
| ⚡ Smart Priority Suggester | Detects keywords like "urgent", "bug", "critical" in task titles and suggests URGENT priority |
| 🏥 Project Health Score | Healthy / At Risk / Critical badge calculated from overdue %, unassigned %, and inactivity |
| 📊 Workload Heatmap | Visual bar per team member showing open task count (green / yellow / red) |
| 📋 Standup Digest | One-click modal showing overdue tasks, tasks due today, and completed yesterday |
| ⏱️ Countdown Badges | Live countdown on every task card: "3 days left", "Due tomorrow", "Overdue by 2 days" |
| 🌙 Dark Mode | Full dark/light mode toggle persisted in localStorage |
| ⌨️ Keyboard Shortcuts | `N` new task · `P` projects · `?` shortcut cheat-sheet · `Esc` close modal |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend Runtime** | Node.js |
| **Backend Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT (access + refresh tokens), bcryptjs |
| **Input Validation** | express-validator |
| **Security** | helmet, cors, rate-limiter-flexible |
| **Frontend Framework** | React 18 + Vite |
| **Styling** | TailwindCSS v4, shadcn/ui |
| **Server State** | TanStack Query v5 |
| **Global State** | Zustand |
| **Routing** | React Router v6 |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Drag & Drop** | @dnd-kit/core |
| **Notifications** | React Hot Toast |
| **Deployment** | Railway |

---

## Project Structure

```
flowdesk/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── config/             # PrismaClient singleton
│   │   ├── controllers/        # Business logic (auth, projects, tasks, ...)
│   │   ├── middleware/         # verifyToken, isAdmin, validate
│   │   ├── routes/             # Express routers
│   │   ├── utils/              # JWT, activity log, notifications
│   │   └── validators/         # express-validator rules
│   ├── .env.example
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/                # TanStack Query hooks
│   │   ├── components/
│   │   │   ├── dashboard/      # Charts, activity feed, workload heatmap
│   │   │   ├── kanban/         # KanbanBoard, TaskCard, TaskDetailModal
│   │   │   ├── layout/         # AppShell, Sidebar, TopBar
│   │   │   ├── projects/       # ProjectCard, ProjectForm
│   │   │   └── shared/         # PriorityBadge, CountdownBadge, EmptyState, Skeletons
│   │   ├── hooks/              # useAuth, useDarkMode, useKeyboardShortcuts
│   │   ├── pages/              # All route-level pages
│   │   ├── router/             # Routes, ProtectedRoute, AdminRoute
│   │   ├── store/              # Zustand auth store
│   │   └── utils/              # date utils, priority suggester, health score
│   └── .env.example
│
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (local install or [Railway](https://railway.app) free tier)

### 1. Clone the repository

```bash
git clone https://github.com/Krishna09Bhardwaj/Flow-desk.git
cd Flow-desk
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flowdesk"
JWT_ACCESS_SECRET="your-strong-random-secret"
JWT_REFRESH_SECRET="another-strong-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Backend starts at `http://localhost:5000`

### 3. Set up the frontend

```bash
cd ../frontend
cp .env.example .env
```

The default `VITE_API_URL` in `.env.example` points to `/api`, which Vite proxies to `localhost:5000` in development — no changes needed.

```bash
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | Secret key for access tokens (15 min expiry) |
| `JWT_REFRESH_SECRET` | ✅ | Secret key for refresh tokens (7 day expiry) |
| `PORT` | ✅ | HTTP port (default: `5000`) |
| `CLIENT_URL` | ✅ | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `NODE_ENV` | ✅ | `development` or `production` |

### Frontend — `frontend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g. `https://your-api.railway.app/api`) |

---

## Railway Deployment

### Step 1 — Create a Railway project

Sign in at [railway.app](https://railway.app) and create a new project.

### Step 2 — Provision PostgreSQL

Inside your project: **+ New → Database → PostgreSQL**. Copy the `DATABASE_URL` from the Variables tab.

### Step 3 — Deploy the backend

1. **+ New → GitHub Repo** → select this repo
2. Set **Root Directory** to `backend`
3. Add environment variables:
   - `DATABASE_URL` — from Step 2
   - `JWT_ACCESS_SECRET` — generate a strong random string
   - `JWT_REFRESH_SECRET` — generate a different strong random string
   - `CLIENT_URL` — your frontend Railway domain (add after Step 4)
   - `NODE_ENV=production`
4. After first deploy, open a Railway shell and run: `npx prisma migrate deploy`

### Step 4 — Deploy the frontend

1. **+ New → GitHub Repo** → select this repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.railway.app/api`

### Step 5 — Connect frontend ↔ backend

Go back to the backend service and update `CLIENT_URL` to your frontend Railway domain. Redeploy.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Register new user |
| POST | `/api/auth/login` | — | Login, receive access token + refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Silently refresh access token |
| POST | `/api/auth/logout` | JWT | Invalidate refresh token |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/projects` | JWT | List projects (role-scoped) |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | JWT | Get project detail |
| PATCH | `/api/projects/:id` | Admin | Update project |
| PATCH | `/api/projects/:id/archive` | Admin | Archive project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member to project |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/api/tasks/my` | JWT | My assigned tasks |
| GET | `/api/tasks/project/:id` | JWT | Tasks in a project (filterable) |
| POST | `/api/tasks/project/:id` | JWT | Create task |
| PATCH | `/api/tasks/:id` | JWT | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/comments/task/:id` | JWT | List comments |
| POST | `/api/comments/task/:id` | JWT | Add comment |
| DELETE | `/api/comments/:id` | JWT | Delete own comment |
| GET | `/api/notifications` | JWT | List notifications |
| PATCH | `/api/notifications/read-all` | JWT | Mark all read |
| GET | `/api/dashboard/admin` | Admin | Admin stats + charts data |
| GET | `/api/dashboard/member` | JWT | Personal stats |
| GET | `/api/members` | Admin | List all users |
| GET | `/api/activity` | Admin | Global activity feed |

---

## Security

- Passwords hashed with bcryptjs (10 salt rounds)
- Access tokens never stored in localStorage (XSS protection)
- Refresh tokens stored in httpOnly cookies (XSS protection) and in the database (supports revocation)
- Rate limiting on `/api/auth/login` and `/api/auth/signup` (10 req/min per IP)
- HTTP security headers via helmet
- CORS restricted to configured `CLIENT_URL`
- All inputs validated via express-validator before reaching the database
- Role-based middleware enforced at the router level, not inside controllers
- Members cannot access other projects or tasks via direct ID manipulation

---

## Screenshots

> Screenshots will be added after deployment.

| Page | Description |
|------|-------------|
| Login / Signup | Clean auth forms with role selection |
| Admin Dashboard | Stats cards, completion donut chart, priority bar chart, workload heatmap |
| Projects Grid | Project cards with health badges |
| Kanban Board | Drag-and-drop columns with live countdown badges |
| Task Detail | Inline editing, comment thread, smart priority alert |
| Member Dashboard | Personal task view, due today, overdue list |
| Dark Mode | Full dark theme across all pages |

---

## Author

**Krishna Bhardwaj**  
[GitHub](https://github.com/Krishna09Bhardwaj) · krishna09bhardwaj@gmail.com
