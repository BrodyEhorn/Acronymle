# Acronymle Monorepo

This repository is now organized into two directories:

- `frontend/` — the Create React App frontend (original React app)
- `backend/` — a small Express backend that serves a solutions API and can serve the frontend build in production

Quick commands:

- Install frontend dependencies: `cd frontend && npm install`
- Start frontend dev server: `npm --prefix frontend start`
- Install backend deps: `cd backend && npm install`
- Start backend: `npm --prefix backend start`
- Install both: `npm run install:all` (from repository root)

For development you can run frontend and backend in separate shells.

