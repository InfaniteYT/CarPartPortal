# CarPartPortal 🔧

A full-stack web application where users can sign up, add their cars, browse performance and OEM parts, and explore build ideas.

## Features

- **User Authentication** — Sign up and log in with JWT-secured accounts
- **My Garage** — Add and manage your cars (year, make, model, trim, engine, notes)
- **Parts Catalog** — Browse 29+ performance and normal/OEM parts with search & category filters
- **Build Ideas** — Explore 14+ curated build guides from Beginner to Expert level with community likes
- **Saved Parts** — Save parts to your account for later reference

## Tech Stack

- **Backend**: Node.js + Express + SQLite (better-sqlite3) + JWT auth
- **Frontend**: React + Vite + Tailwind CSS v4 + React Router

## Getting Started

```bash
# Install dependencies
npm run install:all

# Build the frontend
npm run build

# Start the server (serves both API and frontend)
npm start
```

Then open http://localhost:3001

### Development

```bash
# Run backend (port 3001)
npm run dev:backend

# Run frontend dev server (port 5173, proxies /api to 3001)
npm run dev:frontend
```

## Project Structure

```
CarPartPortal/
├── backend/
│   ├── db.js              # SQLite database + seed data
│   ├── server.js          # Express app entry point
│   ├── middleware/
│   │   └── authenticate.js
│   └── routes/
│       ├── auth.js        # POST /signup, POST /login, GET /me
│       ├── cars.js        # CRUD for user's cars
│       ├── parts.js       # Parts catalog + save/unsave
│       └── builds.js      # Build ideas + likes
├── frontend/
│   └── src/
│       ├── pages/         # Home, Signup, Login, Garage, Parts, Builds, SavedParts
│       ├── components/    # Navbar
│       └── context/       # AuthContext (JWT)
└── package.json
```
