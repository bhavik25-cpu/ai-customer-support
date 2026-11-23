# AI Customer Support Agent

A full-stack AI-powered customer support application built with React, Vite, Node.js, Express, MongoDB, JWT authentication and OpenRouter. Users can create an account, chat with an AI assistant, and revisit their saved conversations.

## Contents
- [Features](#features)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Local installation without Docker](#local-installation-without-docker)
- [Environment variable reference](#environment-variable-reference)
- [Run with Docker Compose](#run-with-docker-compose)
- [Verify the installation](#verify-the-installation)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Tests and production build](#tests-and-production-build)
- [Troubleshooting](#troubleshooting)
- [Security notes](#security-notes)

## Features
- User signup, login and logout using JWT in an HttpOnly cookie
- Password hashing with bcrypt
- Protected API routes and user-scoped conversation access
- Persistent conversations and chat messages in MongoDB
- OpenRouter chat completions with the API key kept on the backend
- Conversation history, conversation deletion and suggested prompts
- Responsive React chat interface with typing indicator
- Helmet security headers, credentialed CORS and API rate limiting
- Optional Docker Compose setup
- GitHub Actions checks for backend syntax, backend tests, dependency audit and frontend build

## Technology stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Axios, CSS |
| Backend | Node.js 22, Express 4 |
| Database | MongoDB with Mongoose |
| Authentication | JWT, bcryptjs, HttpOnly cookies |
| AI | OpenRouter Chat Completions API |
| Deployment | Vercel (frontend and serverless API) |
| Optional local infrastructure | Docker Compose, MongoDB container |

## Prerequisites
Install the following before starting:
1. **Node.js 22 or newer** and npm. Check with `node --version` and `npm --version`.
2. **MongoDB**, either a local MongoDB Community Server instance or a MongoDB Atlas cluster.
3. **An OpenRouter account and API key**. Create a key in the OpenRouter dashboard and keep it private.
4. **Git**, to clone the repository.
5. A code editor such as Visual Studio Code.

Docker Desktop with Docker Compose is only required for the optional Docker setup; it is not required for normal local development.

## Local installation without Docker

### 1. Clone the repository
Open a terminal and run:
```bash
git clone https://github.com/bhavik25-cpu/ai-customer-support.git
cd ai-customer-support
```

### 2. Prepare MongoDB

**Option A — Local MongoDB**
- Install and start MongoDB Community Server.
- Make sure MongoDB is listening on its default local address, `mongodb://127.0.0.1:27017`.
- The provided server environment example already uses the database `ai_customer_support` on this local MongoDB instance.

**Option B — MongoDB Atlas**
- Create or select an Atlas cluster.
- Create a database user with read/write access to the application database.
- Add the IP address of your development machine to the Atlas IP Access List.
- Copy the application connection string from Atlas. Use the database name `ai_customer_support` in the URI path, and replace the username/password placeholders.
- If the database password contains special characters, URL-encode the password before placing it in the URI.

### 3. Configure the backend

Open **Terminal 1** at the repository root.

**Windows PowerShell:**
```powershell
cd server
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

**macOS / Linux:**
```bash
cd server
npm install
cp -n .env.example .env
```

Open `server/.env` and set the values for your environment:

```dotenv
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai_customer_support
JWT_SECRET=replace_with_a_random_secret_of_at_least_32_characters
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=AI Customer Support
```

For Atlas, replace only `MONGODB_URI` with your Atlas connection string. Do not commit `server/.env` or share its contents.

Start the backend from the `server` directory:
```bash
npm run dev
```

The API starts at `http://localhost:5000`. Keep this terminal running.

### 4. Configure and start the frontend

Open **Terminal 2** at the repository root.

**Windows PowerShell:**
```powershell
cd client
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

**macOS / Linux:**
```bash
cd client
npm install
cp -n .env.example .env
npm run dev
```

The default `client/.env` value is:
```dotenv
VITE_API_URL=http://localhost:5000/api
```

Open **http://localhost:5173** in your browser. Keep both terminals running while using the application.

### 5. Create an account and use the application
1. Open the frontend URL shown above.
2. Choose **Create an account** and register with your name, email and a password of at least 8 characters.
3. After signing in, start a new conversation or select a suggested prompt.
4. Send a message and wait for the OpenRouter response.
5. Refresh the page and confirm that your conversation remains in the conversation list.
6. Sign out and sign back in to verify the session and saved history.

## Environment variable reference

Backend variables are read from `server/.env`. The checked-in `server/.env.example` provides the local defaults.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Local Express port. Defaults to `5000`. |
| `NODE_ENV` | No | Runtime environment, usually `development` locally and `production` when deployed. |
| `MONGODB_URI` | Yes | MongoDB connection string. Defaults in the example to local database `ai_customer_support`. |
| `JWT_SECRET` | Yes | Private JWT signing secret. Use a unique random value of at least 32 characters. |
| `JWT_EXPIRES_IN` | No | JWT lifetime, for example `7d`. |
| `CLIENT_ORIGIN` | Yes | Exact browser origin allowed by CORS, for example `http://localhost:5173`. |
| `OPENROUTER_API_KEY` | Yes for AI chat | Private OpenRouter API key. Keep it on the backend only. |
| `OPENROUTER_MODEL` | No | OpenRouter model ID. Example: `openai/gpt-4o-mini`. |
| `OPENROUTER_SITE_URL` | No | Site URL sent as OpenRouter `HTTP-Referer` metadata. |
| `OPENROUTER_APP_NAME` | No | App name sent as OpenRouter `X-Title` metadata. |

Frontend variables are read from `client/.env`:

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL. For local development, use `http://localhost:5000/api`. In the Vercel deployment, the frontend defaults to same-origin `/api`. |

Restart the relevant development server after changing environment files. Never put `OPENROUTER_API_KEY`, `JWT_SECRET`, or `MONGODB_URI` in a `VITE_` variable because Vite exposes `VITE_` values in browser code.

## Run with Docker Compose

Docker is optional. Install Docker Desktop and make sure Docker Compose is available. From the repository root, first create `server/.env` from `server/.env.example` and set at least `JWT_SECRET` and `OPENROUTER_API_KEY`.

**Windows PowerShell:**
```powershell
if (-not (Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
docker compose up --build
```

**macOS / Linux:**
```bash
cp -n server/.env.example server/.env
docker compose up --build
```

Compose starts MongoDB, the Express API and the frontend. It configures the backend to connect to the Compose MongoDB service named `mongo` and maps the frontend/API to the local machine.

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health

Stop the containers with `docker compose down`. This preserves the MongoDB data volume. Use `docker compose down -v` only if you intentionally want to delete the persisted database data.

## Verify the installation

With MongoDB and the backend running, open:

```text
http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "ai-customer-support"
}
```

Then verify the application in the browser:
- Signup creates a user and signs the user in.
- Login with the same email/password succeeds.
- Chat sends a message and displays an AI answer.
- Past conversations appear in the sidebar after refresh.
- A user can only access their own conversations.
- Logout ends the browser session.

If signup/login works but AI replies fail, check the OpenRouter API key, account access to the selected model, and the backend terminal logs.

## API reference

All endpoints are prefixed with `/api`. The session is stored in an HttpOnly, SameSite=Lax cookie.

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| GET | `/health` | No | Health check (backend connects to MongoDB before serving requests). |
| POST | `/auth/signup` | No | Create an account and session. |
| POST | `/auth/login` | No | Authenticate and create a session. |
| GET | `/auth/me` | Cookie | Return the current user. |
| POST | `/auth/logout` | Cookie | Clear the session cookie. |
| POST | `/chat/send` | Cookie | Save a chat turn and return the AI reply. |
| GET | `/chat/history` | Cookie | Return the signed-in user's chat history. |
| GET | `/chat/conversations` | Cookie | List the signed-in user's conversations. |
| POST | `/chat/conversations` | Cookie | Create a conversation. |
| GET | `/chat/conversations/:id` | Cookie | Read a conversation owned by the signed-in user. |
| DELETE | `/chat/conversations/:id` | Cookie | Delete a conversation owned by the signed-in user. |

## Project structure

```text
ai-customer-support/
├── api/                    # Vercel serverless API entry points
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── context/        # Authentication context
│   │   ├── lib/            # Axios API client
│   │   └── pages/          # Signup/login and chat screens
│   ├── .env.example
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── middleware/     # Authentication middleware
│   │   ├── models/         # User and Conversation models
│   │   ├── routes/         # Auth and chat routes
│   │   └── services/       # OpenRouter integration
│   ├── test/               # Backend unit tests
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
├── vercel.json
└── README.md
```

## Tests and production build

Run backend tests from the `server` directory:
```bash
npm test
```

Create a frontend production build from the `client` directory:
```bash
npm run build
```

GitHub Actions runs backend/API syntax checks, backend unit tests, an npm dependency audit, and the frontend production build on pushes and pull requests to `main`.

## Troubleshooting

| Problem | What to check |
|---|---|
| Backend exits while starting | Confirm MongoDB is running/reachable and `MONGODB_URI` is correct. The server connects to MongoDB before listening on port 5000. |
| `JWT_SECRET` configuration error | Set a unique secret of at least 32 characters in `server/.env`, then restart the backend. |
| Browser cannot reach the API | Confirm the backend is running on port 5000, `VITE_API_URL` points to `http://localhost:5000/api`, and `CLIENT_ORIGIN` exactly matches `http://localhost:5173`. |
| Signup says email already registered | Sign in using that email, or use a different email for a new account. |
| Chat returns an OpenRouter error | Check `OPENROUTER_API_KEY`, model availability/permissions and backend logs. |
| Atlas connection times out | Check the Atlas cluster status, database user credentials and IP Access List. |
| Environment changes do not take effect | Restart the backend or frontend development server after editing `.env`. |

## Security notes
- Passwords are stored as bcrypt hashes; plain-text passwords are not stored.
- JWTs are issued in HttpOnly cookies rather than being exposed to JavaScript in `localStorage`.
- Conversation queries are scoped to the authenticated user's ID.
- The OpenRouter API key is used only by the backend.
- Real `.env` files are ignored by Git. Commit only `.env.example` templates with placeholder values.
- For production, use HTTPS, rotate exposed credentials, restrict Atlas network access, and configure backups and monitoring.
- Keep the frontend and API on the same site when using the default SameSite=Lax cookie setup. If you change to cross-site hosting, configure and test cookie, CORS and CSRF protections deliberately.

## Deployment

The application is deployed on Vercel. Production environment variables must be configured in the Vercel project settings; do not copy local development secrets into GitHub.

- Live application: https://ai-customer-support-eight-rose.vercel.app
- GitHub repository: https://github.com/bhavik25-cpu/ai-customer-support
- Vercel builds the React frontend and deploys the Express API through the serverless handlers in `api/`.

---

Contributions and issue reports are welcome through the GitHub repository.
