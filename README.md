# AI Customer Support Agent

A full-stack AI-powered support chat application built with React, Express, MongoDB, JWT sessions and OpenRouter.

## Features
- Signup, login and logout using JWT in an HttpOnly cookie
- Password hashing with bcrypt
- Protected chat APIs and per-user conversation ownership
- Persistent chat messages and `/api/chat/history`
- OpenRouter chat completions; API key remains server-side only
- Responsive React chat UI, conversation list, delete, typing indicator and suggested prompts
- Helmet security headers, credentialed CORS and API rate limits
- Local development without Docker; optional Docker Compose
- GitHub Actions syntax checks, backend unit tests and frontend production build

## Local setup (no Docker)
Requirements: Node.js 20 or newer, MongoDB Community Server, and an OpenRouter API key.

1. Start local MongoDB.
2. In a terminal, run `cd server && npm install`.
3. Copy `server/.env.example` to `server/.env`. Set a unique `JWT_SECRET` (at least 32 characters) and your `OPENROUTER_API_KEY`.
4. From `server`, run `npm run dev`.
5. In a second terminal, run `cd client && npm install`.
6. Copy `client/.env.example` to `client/.env`.
7. From `client`, run `npm run dev` and open http://localhost:5173.
8. API health check: http://localhost:5000/api/health.

## Docker Compose (optional)
Docker is not required for local development. Create `server/.env` from the example and set `JWT_SECRET` and `OPENROUTER_API_KEY`. From the repository root run:

```bash
docker compose up --build
```

Open http://localhost:5173. The API is on http://localhost:5000. Stop with `docker compose down`. Use `docker compose down -v` only when intentionally deleting MongoDB persistent data.

## Environment variables
See `server/.env.example` and `client/.env.example`. Never commit real `.env` files.

| Variable | Purpose |
|---|---|
| `PORT` | Local Express port (default 5000) |
| `NODE_ENV` | development or production |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Private JWT signing secret; 32+ characters |
| `JWT_EXPIRES_IN` | JWT lifetime (default 7d) |
| `CLIENT_ORIGIN` | Exact browser origin allowed by CORS |
| `OPENROUTER_API_KEY` | Server-only OpenRouter key |
| `OPENROUTER_MODEL` | OpenRouter model identifier |
| `OPENROUTER_SITE_URL` | OpenRouter HTTP-Referer metadata |
| `OPENROUTER_APP_NAME` | OpenRouter X-Title metadata |
| `VITE_API_URL` | Optional frontend API base; production defaults to same-origin `/api` |

## API routes
All paths below are prefixed with `/api`. Authentication uses an HttpOnly, SameSite=Lax cookie; clients send credentialed requests.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Database-backed health check |
| POST | `/auth/signup` | No | Create account and session (201) |
| POST | `/auth/login` | No | Authenticate and create session |
| GET | `/auth/me` | Cookie | Return current user |
| POST | `/auth/logout` | Cookie | Clear the session cookie |
| POST | `/chat/send` | Cookie | Store a message and return AI reply |
| GET | `/chat/history` | Cookie | Return current user previous chats |
| GET | `/chat/conversations` | Cookie | List current user conversations |
| POST | `/chat/conversations` | Cookie | Create a conversation |
| GET | `/chat/conversations/:id` | Cookie | Read a conversation owned by the user |
| DELETE | `/chat/conversations/:id` | Cookie | Delete a conversation owned by the user |

## Repository layout
- `client/`: React + Vite frontend
- `server/`: Express API, MongoDB models and OpenRouter integration
- `api/`: Vercel serverless entry points forwarding to the shared Express app
- `docker-compose.yml`: optional MongoDB + API + frontend containers
- `.github/workflows/ci.yml`: backend/API checks and frontend build

## Security notes
- Passwords are bcrypt-hashed.
- JWTs are set in HttpOnly cookies, not localStorage.
- Protected conversation queries include the authenticated user ID.
- OpenRouter keys remain on the server.
- Use HTTPS, a strong secret, a restricted Atlas IP access list, backups and monitoring for production.
- The app uses a SameSite=Lax cookie; retain same-origin frontend/API hosting or deliberately configure and test cross-origin cookie and CSRF protections before changing deployment topology.

## Troubleshooting
- MongoDB connection error: check Atlas Network Access and verify `MONGODB_URI`.
- OpenRouter 401 or 402: rotate the key or choose a model enabled for the account.
- 401 responses: sign in again; JWT sessions are HttpOnly cookies.
- Browser cannot reach the API locally: check port 5000 and `CLIENT_ORIGIN`, then restart the backend.
