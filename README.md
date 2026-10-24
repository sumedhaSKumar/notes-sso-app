# notes-sso-app

A notes application

## outline on a high-level for the app to get running

1. Backend: Node.js + Express
2. Frontend: plain HTML, CSS, JavaScript.
3. Database: Neon.
4. Password login: bcrypt hashing, with a JWT in an httpOnly, Secure, SameSite cookie
5. SSO: Microsoft Entra ID via OpenID Connect (Authorization Code + PKCE).
6. Tests: Jest + Supertest
7. CI/CD: GitHub Actions (lint + test), Vercel auto-deploys.
