# AI Customer Support Agent

A full-stack AI support chat app using React, Express, MongoDB, JWT and OpenRouter.

## Features
- JWT signup/login and bcrypt password hashing
- Protected API routes and user-scoped conversations
- Persistent MongoDB chat history
- OpenRouter chat completion integration (API key remains backend-only)
- Responsive React chat UI, suggestions, typing indicator and conversation deletion
- Helmet security headers, rate limiting and health endpoint
- Local development without Docker; optional Docker Compose
- GitHub Actions CI for backend syntax and frontend build

## Local setup (no Docker)
Requirements: Node.js 20+, local MongoDB Community Server, and an OpenRouter API key.

1. Start local MongoDB.
2. Backend terminal: `cd server`, then `npm install`.
3. Copy `server/.env.example` to `server/.env`; set a unique JWT_SECRET (at least 32 characters) and OPENROUTER_API_KEY.
4. From `server`, run `npm run dev`.
5. Frontend terminal: `cd client`, then `npm install`.
6. Copy `client/.env.example` to `client/.env`.
7. From `client`, run `npm run dev`; open http://localhost:5173.
8. API health: http://localhost:5000/api/health.

## Docker Compose (optional)
Docker is not required for local development. Create `server/.env` from its example and set JWT_SECRET and OPENROUTER_API_KEY. From the repository root run:

```bash
docker compose up --build
```

Open http://localhost:5173. API health is http://localhost:5000/api/health. Stop with `docker compose down`. Use `docker compose down -v` only when intentionally deleting MongoDB's persistent data volume. Compose uses Mongo service name `mongo`; local development uses `127.0.0.1`.

## Environment
See `server/.env.example` and `client/.env.example`. Do not commit real `.env` files or secrets.

Server variables: PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_ORIGIN, OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_SITE_URL, OPENROUTER_APP_NAME. Client variable: VITE_API_URL.

## API (all routes prefixed `/api`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Sign in |
| GET | `/auth/me` | JWT | Current user |
| POST | `/auth/logout` | JWT | Logout acknowledgement |
| GET | `/chat/conversations` | JWT | List conversations |
| POST | `/chat/conversations` | JWT | Create conversation |
| GET | `/chat/conversations/:id` | JWT | Read conversation |
| DELETE | `/chat/conversations/:id` | JWT | Delete conversation |
| POST | `/chat/send` | JWT | Save a message and return AI reply |

## Repository layout
- `client/`: React + Vite application
- `server/`: Express API, MongoDB models and OpenRouter service
- `docker-compose.yml`: optional MongoDB + API + frontend containers
- `.github/workflows/ci.yml`: CI checks

## Security notes
Passwords are bcrypt-hashed. Protected routes validate JWTs; database conversation access is scoped by authenticated user ID; OpenRouter credentials stay server-side. Use HTTPS, a strong secret, backups, monitoring and an appropriate production token storage strategy before deploying publicly.

## Troubleshooting
- MongoDB connection refused: start the local service and check MONGODB_URI.
- OpenRouter 401: replace the API key and restart backend.
- Model unavailable / payment required: select a model enabled for the OpenRouter account.
- Browser cannot reach API: check the API port and CLIENT_ORIGIN; restart Vite after env edits.
