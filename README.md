# CarPartPortal 🔧

A full-stack web application where users can sign up, add their cars, browse performance and OEM parts, and explore build ideas.

## Features

- **User Authentication** — Sign up and log in with JWT-secured accounts
- **My Garage** — Add and manage your cars (year, make, model, trim, engine, notes)
- **Parts Catalog** — Browse 76+ performance and normal/OEM parts with search & category filters
- **Build Ideas** — Explore 26+ curated build guides from Beginner to Expert level with community likes
- **Saved Parts** — Save parts to your account for later reference

## Tech Stack

- **API**: Netlify Serverless Function (in-memory store — data resets on cold starts; suitable for demo)
- **Frontend**: React + Vite + Tailwind CSS v4 + React Router
- **Auth**: JWT (signed with `JWT_SECRET` environment variable)

## Deploying to Netlify

1. Push this repository to GitHub (or GitLab / Bitbucket).
2. In [Netlify](https://app.netlify.com), click **Add new site → Import an existing project** and connect your repo.
3. Netlify auto-detects the settings from `netlify.toml`:
   - **Build command**: `npm install && npm install --prefix frontend && npm run build --prefix frontend`
   - **Publish directory**: `frontend/dist`
   - **Functions directory**: `netlify/functions`
4. *(Recommended)* Set a secret in **Site configuration → Environment variables**:
   - Key: `JWT_SECRET`
   - Value: any long random string (e.g. output of `openssl rand -hex 32`)
5. Click **Deploy site**. Once the build finishes, your site is live.

> **Note — Netlify free tier**: Netlify Functions use in-memory storage, which resets whenever the function cold-starts (roughly every few minutes of inactivity). This means registered accounts will be lost between sessions. This is fine for a demo. The parts catalog and build ideas (seed data) are always available since they are embedded in the function code itself.

## Local Development

```bash
# Install all dependencies
npm run install:all

# Run backend Express server (port 3001)
npm run dev:backend

# Run frontend dev server (port 5173, proxies /api to 3001)
npm run dev:frontend
```

Or build & serve the production bundle via the backend:

```bash
npm run build
npm start
```

Then open http://localhost:3001

## Project Structure

```
CarPartPortal/
├── netlify/
│   └── functions/
│       └── api.js         # Serverless function — all /api/* routes (auth, parts, builds, cars)
├── backend/               # Express + SQLite backend (local dev only)
│   ├── db.js
│   ├── server.js
│   ├── middleware/
│   └── routes/
├── frontend/
│   └── src/
│       ├── pages/         # Home, Signup, Login, Garage, Parts, Builds, SavedParts
│       ├── components/    # Navbar, ErrorBoundary
│       └── context/       # AuthContext (JWT), ToastContext
├── netlify.toml           # Netlify build + redirect + function config
└── package.json           # Root package — bcryptjs & jsonwebtoken for the serverless function
```
