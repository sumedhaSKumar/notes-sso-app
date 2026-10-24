# Notes-sso-app

A notes application: password sign-in and Single Sign-On (Microsoft Entra ID, OpenID Connect). Built with Node.js and Express.

## outline on a high-level for the app to get running

1. Backend: Node.js + Express
2. Frontend: plain HTML, CSS, JavaScript.
3. Database: Neon.
4. Password login: bcrypt hashing, with a JWT in an httpOnly, Secure, SameSite cookie
5. SSO: Microsoft Entra ID via OpenID Connect (Authorization Code + PKCE).
6. Tests: Jest + Supertest
7. CI/CD: GitHub Actions (lint + test), Vercel auto-deploys.

> Status: in development. Currently implemented: Express server, health endpoint, linting, formatting, tests and CI.

## Prerequisites

- Node.js 22 or later (check with `node --version`)
- Git

## Setup

```bash
git clone https://github.com/sumedhaSKumar/notes-sso-app.git
cd notes-sso-app
npm install
cp .env.example .env
```

Then open `.env` and fill in the values. Never commit `.env`.

## Running the app

**Development mode** (restarts automatically when you save a file):

```bash
npm run dev
```

**Normal mode** (how it runs in production):

```bash
npm start
```

The server listens on `http://localhost:3000` by default. Check it works:

```bash
curl http://localhost:3000/health
```

Expected response: `{"status":"ok"}`

## Running tests and checks

| Command                | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `npm test`             | Runs the automated tests (Jest + Supertest)    |
| `npm run lint`         | Checks code for bugs and bad patterns (ESLint) |
| `npm run format`       | Reformats all files (Prettier)                 |
| `npm run format:check` | Checks formatting without changing files       |

## Contributing workflow

1. Create a branch for each change: `git checkout -b feat/short-description`
2. Make small commits using the Conventional Commits style, for example `feat: add notes endpoint` or `fix: handle empty search`.
3. Before pushing, make sure checks pass locally:

   ```bash
   npm run lint && npm run format:check && npm test
   ```

Git hooks (Husky) run automatically:

- **pre-commit:** lints and formats the staged files.
- **pre-push:** runs lint, format check and tests.

## Project structure

```
src/
  config/
  routes/
  controllers/
  middleware/
  services/
  db/
  app.js        Builds the Express app (no listening, so it's testable)
  server.js
public/
tests/
```

## Environment variables

See `.env.example` for the full list. Real values go in `.env`.
