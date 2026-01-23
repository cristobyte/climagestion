# HVAC Service Delivery App

A monorepo containing a React frontend and NestJS backend for managing HVAC service tasks (installations, maintenance, repairs) with role-based access for admins and technicians.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Backend | NestJS + TypeScript |
| Database | Turso (SQLite-compatible) |
| ORM | Drizzle ORM |
| Auth | Custom JWT (access + refresh tokens) |
| Monorepo | npm workspaces |

## Project Structure

```
hvac-service-app/
├── packages/
│   ├── frontend/     # React app
│   ├── backend/      # NestJS app
│   └── shared/       # Shared types/constants
├── .github/workflows/  # CI/CD
└── package.json      # Root workspace config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies
npm install

# Build shared package
npm run build:shared
```

### Development

```bash
# Start backend (http://localhost:3000)
npm run dev:backend

# Start frontend (http://localhost:5173)
npm run dev:frontend
```

### Database Setup

1. Create a Turso database at https://turso.tech
2. Copy `.env.example` to `.env` in `packages/backend/`
3. Add your Turso credentials

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Default Credentials

After seeding:
- Admin: `admin@hvac.com` / `admin123`
- Technician: `tech1@hvac.com` / `tech123`
- Technician: `tech2@hvac.com` / `tech123`

## Features

### Admin Features
- Dashboard with task statistics
- Create, edit, delete tasks
- Assign tasks to technicians
- Manage users (create, edit, delete)
- View all tasks

### Technician Features
- Dashboard with assigned task statistics
- View assigned tasks
- Update task status through workflow:
  - Assigned -> On the Way -> In Progress -> Completed
- Add completion notes

## API Endpoints

### Auth
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Users (Admin only)
- `GET /users` - List users
- `GET /users/:id` - Get user
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Tasks
- `GET /tasks` - List tasks
- `GET /tasks/:id` - Get task
- `POST /tasks` - Create task (admin)
- `PATCH /tasks/:id` - Update task (admin)
- `PATCH /tasks/:id/status` - Update status
- `DELETE /tasks/:id` - Delete task (admin)
- `GET /tasks/dashboard/stats` - Dashboard stats

## Environment Variables

### Backend
```env
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=your-turso-token
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
```

## Deployment

### Backend (Railway)
1. Connect your GitHub repo to Railway
2. Set environment variables
3. Deploy

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set root directory to `packages/frontend`
3. Set environment variables
4. Deploy

## License

MIT
