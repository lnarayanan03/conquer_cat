# CONQUER CAT — CAT 2026 Prep Tracker

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

A personal daily tracker for CAT 2026 preparation built with React + Vite + Express. Features an AI mentor (Vikram Anand) powered by a multi-provider LLM pool (Groq, Gemini, Anthropic), long-term memory via Qdrant + Redis, persistent logs via Supabase, web search via Tavily, and semantic embeddings via HuggingFace.

---

## Table of Contents

- [Updating Your App](#updating-your-app)
1. [What This App Does](#1-what-this-app-does)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Prerequisites](#4-prerequisites)
5. [Step 1 — Clone & Install](#step-1--clone--install)
6. [Step 2 — Set Up Supabase (Database)](#step-2--set-up-supabase-database)
7. [Step 3 — Set Up Qdrant (Vector Memory)](#step-3--set-up-qdrant-vector-memory)
8. [Step 4 — Set Up Upstash Redis (Chat Cache)](#step-4--set-up-upstash-redis-chat-cache)
9. [Step 5 — Get Your LLM API Keys](#step-5--get-your-llm-api-keys)
10. [Step 6 — Get Tavily & HuggingFace Keys](#step-6--get-tavily--huggingface-keys)
11. [Step 7 — Create the .env File](#step-7--create-the-env-file)
12. [Step 8 — Run in Development](#step-8--run-in-development)
13. [Step 9 — Production Build](#step-9--production-build)
14. [Features](#features)
15. [Project Structure](#project-structure)
16. [API Routes](#api-routes)
17. [Effort Score Formula](#effort-score-formula)
18. [localStorage Keys](#localstorage-keys)
19. [Reset the App](#reset-the-app)
20. [Troubleshooting](#troubleshooting)

---

## Updating Your App

If you set up CONQUER before May 2026, follow these steps to get the latest features.

### Step 1 — Pull the latest code

```bash
cd cat-tracker
git pull origin main
npm install
```

### Step 2 — Run these SQL commands in Supabase

Go to your Supabase project → SQL Editor and run:

```sql
-- Add backlog columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS backlog_videos jsonb DEFAULT '[]';
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS backlog_concepts jsonb DEFAULT '[]';

-- Fix daily_logs column names if you set up before May 2026
-- (safe to run even if columns already exist)
ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS backlog jsonb DEFAULT '[]';
```

### Step 3 — Sync your existing local data to Supabase

If you have been logging daily data on your phone or browser, it is stored locally. To sync it to Supabase:

1. Open the app
2. Go to the Calendar tab
3. Tap each day you have logged
4. Tap "Save Day" on each one

This pushes your local data to Supabase with the correct column mapping.

### Step 4 — Redeploy to Render (if using Render)

If you deployed to Render, it auto-deploys on git push. Just run:

```bash
git add .
git commit -m "Update to latest"
git push origin main
```

Render will pick it up automatically.

---

## 1. What This App Does

CONQUER CAT is a CAT exam prep tracker built for serious aspirants. Every day you log your study sessions, and your AI mentor Vikram Anand (modeled after a 99.99%ile, IIM-A alumnus) reviews your performance and pushes you harder. The app tracks your Quant, VARC, LRDI, sleep, and backlog progress against targets calculated from your actual start date, then transitions into interview prep mode after CAT results.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Recharts |
| Backend | Express 5, Node.js (ESM) |
| AI / LLM | LangChain + Groq (primary), Gemini (fallback), Anthropic Claude (final fallback) |
| Vector DB | Qdrant Cloud (long-term mentor memories) |
| Chat Cache | Upstash Redis (today's conversation history) |
| Database | Supabase (Postgres — users, daily logs) |
| Embeddings | HuggingFace / Xenova `all-MiniLM-L6-v2` (runs locally) |
| Web Search | Tavily (mentor can search the web) |
| Styling | CSS + inline styles (no UI library) |

---

## 3. Architecture Overview

```
Browser (React)
    │
    │  /api/*  (proxied by Vite in dev)
    ▼
Express Server (server.js)
    │
    ├── /api/chat ──────────► mentor/chain.js
    │                              │
    │                    LangChain multi-provider pool
    │                    (Groq → Gemini → Anthropic)
    │                              │
    │                    ┌─────────┴──────────┐
    │                    │                    │
    │               Qdrant Cloud          Upstash Redis
    │           (long-term memories)   (today's chat log)
    │
    ├── /api/mentor/greet ──► direct Anthropic API call
    │
    ├── /api/user/* ──────────► Supabase (users table)
    └── /api/log/* ─────────── Supabase (daily_logs table)
```

**Key design decisions:**
- Groq is the default LLM (fast, free tier). Gemini and Anthropic are fallbacks.
- You can add multiple Groq/Gemini API keys — the pool rotates through them automatically when rate-limited.
- Chat history is stored in Redis with a 24-hour TTL, keyed by `userId + IST date`.
- Long-term memories (past prep summaries) are stored as vectors in Qdrant and retrieved semantically.
- All user data also syncs to Supabase so you don't lose progress if localStorage is cleared.

---

## 4. Prerequisites

Before you start, make sure you have:

- **Node.js 18+** — [Download here](https://nodejs.org). Run `node -v` to confirm.
- **npm** — comes with Node.js
- **A terminal / command line** — bash, zsh, PowerShell, etc.
- Accounts on the following free-tier services (all have free tiers, no credit card required unless stated):
  - Supabase
  - Qdrant Cloud
  - Upstash
  - Groq
  - Google AI Studio (Gemini) — optional but recommended
  - Anthropic — optional (fallback only)
  - Tavily
  - HuggingFace

---

## Step 1 — Clone & Install

```bash
# Clone the repo (replace with your actual repo URL)
git clone https://github.com/your-username/daily-tracker.git
cd daily-tracker/cat-tracker

# Install all dependencies
npm install
```

This installs React, Express, LangChain, Qdrant client, Redis client, Xenova transformers, and everything else listed in `package.json`.

> **Note:** The first `npm install` may take 2–3 minutes because `@xenova/transformers` is large. The HuggingFace embedding model itself (~22 MB) downloads at server startup, not at install time.

---

## Step 2 — Set Up Supabase (Database)

Supabase is a free Postgres database with a REST API. It stores user profiles and daily logs.

### 2a. Create a project

1. Go to [supabase.com](https://supabase.com) and sign up.
2. Click **New Project**.
3. Give it a name (e.g., `conquer`), set a strong database password, choose a region close to you.
4. Wait ~1 minute for the project to spin up.

### 2b. Create the tables

Go to **SQL Editor** in your Supabase project and run these two queries one at a time:

**Users table:**
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  avatar_gender text default 'male',
  avatar_skin text default 'medium',
  avatar_hair text default 'wavy',
  avatar_hair_color text default 'black',
  avatar_shirt text default 'blue',
  avatar_glasses boolean default false,
  avatar_beard boolean default false,
  app_mode text default 'prep',
  interview_date date,
  cat_result text,
  cat_percentile text,
  backlog_videos jsonb default '[]',
  backlog_concepts jsonb default '[]',
  created_at timestamp with time zone default now()
);
```

**Daily logs table:**
```sql
create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  log_date date not null,
  quant int default 0,
  varc int default 0,
  lrdi int default 0,
  vp_count int default 0,
  wake_time text default '',
  sleep_time text default '',
  live_class boolean default false,
  afternoon_hrs float default 0,
  evening_hrs float default 0,
  varc_passage boolean default false,
  iq_notes text default '',
  notes text default '',
  backlog jsonb default '[]',
  updated_at timestamp with time zone default now(),
  unique(user_id, log_date)
);
```

### 2c. Get your credentials

In your Supabase project, go to **Settings → API**. Copy:
- **Project URL** → this is your `SUPABASE_URL`
- **service_role** key (under "Project API keys") → this is your `SUPABASE_SERVICE_KEY`
- **anon** key → this is your `SUPABASE_ANON_KEY`

> Keep the `service_role` key secret — it bypasses Row Level Security.

---

## Step 3 — Set Up Qdrant (Vector Memory)

Qdrant stores semantic memories of the user's past prep sessions so the mentor can recall them contextually.

### 3a. Create a cluster

1. Go to [cloud.qdrant.io](https://cloud.qdrant.io) and sign up.
2. Click **Create Cluster** → choose the **Free tier** (1 GB, no credit card).
3. Select a region and click **Create**.
4. Wait ~30 seconds for the cluster to start.

### 3b. Get your credentials

On the cluster dashboard:
- **Cluster URL** → something like `https://abc123.us-east4-0.gcp.cloud.qdrant.io` → this is your `QDRANT_URL`
- Click **API Keys → Create** → this is your `QDRANT_API_KEY`

> The app auto-creates the `conquer_mentor_memory` collection and its index when the server starts for the first time.

---

## Step 4 — Set Up Upstash Redis (Chat Cache)

Redis stores today's conversation with the mentor. Upstash offers a free serverless Redis instance.

### 4a. Create a database

1. Go to [upstash.com](https://upstash.com) and sign up.
2. Click **Create Database**.
3. Name it `conquer`, choose a region, select **TLS** (enabled by default).
4. Click **Create**.

### 4b. Get your credentials

On the database details page, find **REST API** or **Connection** section:
- Copy the **Redis URL** — it looks like `rediss://default:PASSWORD@HOST.upstash.io:6379`
- This is your `REDIS_URL`

---

## Step 5 — Get Your LLM API Keys

The app uses a provider pool — Groq first, then Gemini, then Anthropic. You need **at least one** of these. Having all three gives maximum reliability and rate-limit tolerance.

### Groq (Primary — Recommended, Free)

1. Go to [console.groq.com](https://console.groq.com) and sign up.
2. Go to **API Keys → Create API Key**.
3. Copy the key — this is your `GROQ_API_KEY`.

**Pro tip:** Create 2–3 separate API keys for `GROQ_API_KEY_2`, `GROQ_API_KEY_3`, etc. The app rotates through all of them when one hits the rate limit, giving you ~3× the free throughput.

### Google Gemini (Fallback — Free)

1. Go to [aistudio.google.com](https://aistudio.google.com) and sign in with your Google account.
2. Click **Get API Key → Create API Key**.
3. Copy the key — this is your `GEMINI_API_KEY_1`.

Same as Groq — create multiple keys (`GEMINI_API_KEY_2` through `GEMINI_API_KEY_8`) for more fallback options.

### Anthropic Claude (Final Fallback — Paid)

1. Go to [console.anthropic.com](https://console.anthropic.com) and sign up.
2. Go to **API Keys → Create Key**.
3. Copy the key — this is your `ANTHROPIC_API_KEY`.

> Anthropic requires adding credits ($5 minimum) before your key works. Groq and Gemini are free, so Anthropic is only hit when everything else is rate-limited.

---

## Step 6 — Get Tavily & HuggingFace Keys

### Tavily (Web Search for the Mentor)

Tavily lets the mentor search the web for real CAT toppers, IIM placement stats, etc.

1. Go to [app.tavily.com](https://app.tavily.com) and sign up.
2. Your API key is shown on the dashboard — this is your `TAVILY_API_KEY`.

### HuggingFace (Embeddings)

HuggingFace is used for generating text embeddings. The model runs **locally via Xenova** — no API calls are made. The key is only needed if you use HuggingFace's hosted inference for other features.

1. Go to [huggingface.co](https://huggingface.co) and sign up.
2. Go to **Settings → Access Tokens → New token**.
3. Copy the token — this is your `HF_API_KEY`.

> The embedding model (`all-MiniLM-L6-v2`) downloads automatically the first time the server starts. It runs locally after that.

### LangSmith (Optional — Tracing)

LangSmith lets you inspect every LLM call, tool invocation, and chain execution. Useful for debugging. Skip if you don't need it.

1. Go to [smith.langchain.com](https://smith.langchain.com) and sign up.
2. Create a project named `conquer-mentor`.
3. Go to **Settings → API Keys** and copy your key.

---

## Step 7 — Create the .env File

Inside the `cat-tracker/` directory, create a file named `.env` (copy from `.env.example` to start):

```bash
cp .env.example .env
```

Now open `.env` and fill in all your keys:

```env
# ── LLM Providers ──────────────────────────────────────────────────────────

# Groq (primary — fastest, free)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY_2=gsk_xxxxxxxxxxxxxxxxxxxx   # optional: more keys = more rate limit
GROQ_API_KEY_3=gsk_xxxxxxxxxxxxxxxxxxxx   # optional

# Google Gemini (fallback — free)
GEMINI_API_KEY_1=AIzaxxxxxxxxxxxxxxxx
GEMINI_API_KEY_2=AIzaxxxxxxxxxxxxxxxx     # optional
GEMINI_API_KEY_3=AIzaxxxxxxxxxxxxxxxx     # optional

# Anthropic Claude (final fallback — requires credits)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx

# ── Database ────────────────────────────────────────────────────────────────

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ── Memory ──────────────────────────────────────────────────────────────────

# Qdrant Cloud (vector DB for long-term memories)
QDRANT_URL=https://your-cluster-id.us-east4-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Upstash Redis (chat cache — 24h TTL)
REDIS_URL=rediss://default:your-password@your-host.upstash.io:6379

# ── Tools ───────────────────────────────────────────────────────────────────

# Tavily (web search for mentor)
TAVILY_API_KEY=tvly-dev-xxxxxxxxxxxxxxxxxxxx

# HuggingFace (embeddings)
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx

# ── Tracing (optional) ──────────────────────────────────────────────────────

LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_xxxxxxxxxxxxxxxxxxxx
LANGCHAIN_PROJECT=conquer-mentor

# ── Server ──────────────────────────────────────────────────────────────────

PORT=3001
```

**Minimum required keys to run:**
- At least one of: `GROQ_API_KEY`, `GEMINI_API_KEY_1`, or `ANTHROPIC_API_KEY`
- `ANTHROPIC_API_KEY` (also used for daily greeting via `/api/mentor/greet`)
- `QDRANT_URL` + `QDRANT_API_KEY`
- `REDIS_URL`
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (the app works without it but won't persist logs across devices)

---

## Step 8 — Run in Development

Make sure you're inside the `cat-tracker/` directory:

```bash
cd cat-tracker
npm run dev
```

This starts both servers together using `concurrently`:

| Server | URL | What it does |
|---|---|---|
| Vite (frontend) | `http://localhost:5173` | React app with hot reload |
| Express (backend) | `http://localhost:3001` | API server |

Open `http://localhost:5173` in your browser. Vite automatically proxies all `/api/*` requests to Express on port 3001.

**First launch:**
- The Xenova embedding model downloads (~22 MB) — this takes 20–60 seconds.
- Qdrant initializes the `conquer_mentor_memory` collection automatically.
- You'll see the onboarding screen asking for your name, start date, and avatar.

**To run servers separately:**
```bash
npm run dev:client   # Vite only (port 5173)
npm run dev:server   # Express only (port 3001)
```

### Localhost Testing Checklist

Use this when you clone the repo and want to verify everything locally before deploying.

**Terminal 1 — backend/API server:**
```bash
npm run dev:server
```

**Terminal 2 — frontend/client:**
```bash
npm run dev:client
```

Then open:
- Frontend app: `http://localhost:5173`
- Backend health/API base: `http://localhost:3001`

Vite proxies frontend `/api/*` requests to the Express server, so keep both terminals running during local testing.

**Restart both servers:**
1. Press `Ctrl+C` in both terminals.
2. Run `npm run dev:server` again in the backend terminal.
3. Run `npm run dev:client` again in the frontend terminal.

**If a port is stuck on macOS/Linux:**
```bash
lsof -ti :5173 | xargs kill -9   # kill Vite client
lsof -ti :3001 | xargs kill -9   # kill Express server
```

**If a port is stuck on Windows PowerShell:**
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID_FROM_PREVIOUS_COMMAND> /F

netstat -ano | findstr :3001
taskkill /PID <PID_FROM_PREVIOUS_COMMAND> /F
```

After killing stuck ports, start again:
```bash
npm run dev:server
npm run dev:client
```

---

## Step 9 — Production Build

```bash
# Inside cat-tracker/
npm run build    # Compiles React into the dist/ folder
npm start        # Starts Express, which serves dist/ + the API
```

Open `http://localhost:3001` — Express serves both the frontend and the API from a single port.

To deploy to a cloud server (e.g., a $5/month DigitalOcean droplet or Railway):
1. Upload the project (without `node_modules`).
2. Run `npm install && npm run build` on the server.
3. Set all your `.env` variables as environment variables in your hosting dashboard.
4. Run `npm start`. Use a process manager like `pm2` to keep it alive:
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name conquer
   pm2 save && pm2 startup
   ```

---

## Features

### Onboarding
- Enter your name and prep start date on first launch.
- Build a custom pixel avatar: gender, skin tone, hair style, hair color, outfit color, glasses, beard.
- All data saved to `localStorage` — no login required.

### Today Tab
- Log wake time and sleep time with fixed dropdowns, not free text.
- Toggle live class attendance and VARC passage reading.
- Log study hours (afternoon + evening sessions separately).
- Counter inputs for Quant / VARC / LRDI sets completed.
- Navigate to the global iQuanta Backlog checklist from a compact row.
- iQuanta notes + daily journal textarea.
- Effort score auto-computed from all inputs (0–100), including sleep and backlog coverage.

### Progress Tab
- Days remaining to CAT 2026 (November 29, 2026).
- Calendar grid and scoreboard targets are calculated from your actual start date.
- Scoreboard targets scale with actual total days: Quant = days × 10, VARC = days × 5, LRDI = days × 5.
- Progress bars with "X per day needed to stay on track".
- Journey Score chart: actual avg effort vs. linear target over your actual prep window.
- Total study hours and total problems solved.

### Calendar Tab
- Dynamic journey grid, one cell per day from your start date to CAT.
- If you start with 190 days left, you see a 190-cell calendar, not 200.
- Orange = all daily targets met, dim orange = partial effort, empty = no log.
- Tap any cell to view or edit that day's log.

### Dynamic Calendar and Progress
- Calendar length is calculated from the user's actual start date to November 29, 2026.
- Progress targets and chart trajectory use the actual prep window, not a hardcoded 200 days.
- User starting with 190 days sees a 190-cell calendar, not hardcoded 200.
- Scoreboard targets scale automatically with total days: Quant = days × 10, VARC = days × 5, LRDI = days × 5.

### Sleep Tracking
- Wake time dropdown: 4:00 AM to 8:00 AM in 30-minute intervals.
- Sleep time dropdown: 9:00 PM to 2:00 AM in 30-minute intervals.
- Sleep duration calculated live (target: 4–6 hours).
- Green indicator when 4–6h achieved, red otherwise.
- Warning shown if outside valid range.

### iQuanta Backlog (Global, Two Sections)
- Persistent global checklist across all days — not per-day.
- Two independent sections: Videos and Concepts.
- Videos: orange checkboxes for iQuanta backlog videos.
- Concepts: blue checkboxes for missing concepts to revise.
- Type a topic and press Enter to instantly add as checklist item.
- Coverage % shown at top combining both sections.
- Stored in `localStorage` and synced to Supabase `users` table.
- Existing backlog data auto-migrated to Videos section on first load.

### Effort Score (0–100)
| Component | Target | Max Points |
|---|---|---|
| Quant | 10/day | 20 |
| VARC | 5/day | 12 |
| LRDI | 5/day | 12 |
| VARC Para | 1/day | 8 |
| Study hours | 5h/day | 16 |
| Live class | — | 8 |
| VARC passage toggle | — | 4 |
| Sleep (4–6h) | 4–6 hrs | 10 |
| Backlog coverage | % done | 10 |
| **Total** | | **100** |

### Mentor Tab (Vikram Anand)
- Full-page chat with Claude as Vikram Anand — 99.99%ile, IIM-A alumnus, 4× CAT.
- Vikram is tough, demanding, and has zero tolerance for excuses (Yujiro Hanma persona).
- Knows your exact stats: days left, cumulative totals, today's effort score, backlog coverage, and consistency signals.
- Quick-action buttons: Mock Interview, WAT Topic, Doubt.
- The mentor can search the web (Tavily) for real CAT facts and success stories.

### Vikram Personalisation
- After day 3, Vikram references actual study patterns instead of treating every student the same.
- Consistency score, trajectory, and willpower assessment shape his tone.
- Backlog coverage is mentioned naturally when relevant.
- Response length is calibrated to the message: short for casual, deep for strategy.
- After day 30, he starts calling out the endurance window where most aspirants quit.
- Story variety: 7+ stories, never repeats the same story in one session.

### AI Provider Pool
- Provider cascade: Groq (`llama-3.3-70b`, 3 keys) → Gemini 2.5 Flash (8 keys) → Gemini 2.5 Flash Lite (8 keys) → Gemini 2.0 Flash (8 keys) → Anthropic `claude-sonnet-4-5`.
- Total: 28 slots.
- 60-second cooldown per slot on rate limit.
- Multiple API keys per provider rotate automatically when one hits rate limits.

### Long-Term Memory
- The mentor remembers past prep sessions using Qdrant vector search.
- Daily summaries are embedded using `all-MiniLM-L6-v2` (384-dimensional vectors).
- Semantically relevant memories are retrieved per conversation.

### Floating Mentor Button
- Draggable button that snaps to the nearest screen edge (AssistiveTouch style).
- Opens a compact chat panel — same Vikram, smaller window.
- Green dot appears when there are unread messages.

### Daily Greeting
- On first open each day, Vikram sends a personalized greeting.
- Uses Anthropic `claude-haiku-4-5` for speed.
- Personalized with your current stats, day number, and a motivational insight.

### CAT Results Screen
- After November 29, 2026, the app prompts you to enter your percentile.
- Color-coded feedback: green for 99.5+, orange for 95+, red below 95.

### Interview Mode
- Activated after entering your CAT result (if you cracked it).
- Set your IIM interview date.
- Today tab shows Mock PI and WAT practice instead of problem counters.
- Vikram shifts entirely to interview coaching (WAT structure, PI drills, mock interviews).
- Days counter switches to days until your interview.

---

## Project Structure

```
cat-tracker/
├── src/
│   ├── App.jsx              # Root component, routing, onboarding, FloatingMentor
│   ├── App.css              # Design tokens, layout, component styles
│   ├── index.css            # Body reset
│   ├── main.jsx             # React entry point
│   ├── mentor/
│   │   ├── chain.js         # LangChain multi-provider pool (Groq/Gemini/Anthropic)
│   │   ├── memory.js        # Redis (chat cache) + Qdrant (vector memory) + Xenova (embeddings)
│   │   ├── pipeline.js      # Background pipeline: summarize daily sessions → store to Qdrant
│   │   ├── prompt.js        # Builds Vikram's system prompt from tracker data + memories
│   │   └── tools.js         # LangChain tool definitions (Tavily web search, etc.)
│   ├── pages/
│   │   ├── Today.jsx        # Today's log form
│   │   ├── Today.css
│   │   ├── Progress.jsx     # Charts and scoreboards
│   │   ├── Progress.css
│   │   ├── InstaCard.jsx    # Shareable progress card
│   │   └── InstaCard.css
│   └── utils/
│       └── storage.js       # localStorage helpers
├── server.js                # Express server: API routes + direct Anthropic calls
├── index.html               # Vite entry HTML
├── vite.config.js           # Vite config + /api proxy to :3001
├── .env                     # Your secrets (never commit this)
├── .env.example             # Template for .env
└── .gitignore
```

---

## API Routes

### `POST /api/chat`
Mentor chat via LangChain pool. Request body:
```json
{
  "userId": "user-uuid",
  "message": "I want to do a mock interview",
  "trackerData": {
    "daysLeft": 200,
    "totals": { "quant": 0, "varc": 0, "lrdi": 0 },
    "dayNum": 1,
    "todayData": { "q": 0, "v": 0, "l": 0, "ah": 0, "eh": 0, "lc": false, "vp": false, "vp_count": 0 },
    "mode": "prep",
    "userName": "Ranga",
    "startDate": "2026-01-01"
  },
  "daysLeft": 200
}
```

### `GET /api/chat/history/:userId`
Returns today's chat history for a user (from Redis).

### `POST /api/mentor/greet`
Daily greeting (direct Anthropic call, not the pool). Body:
```json
{
  "daysLeft": 200,
  "totals": { "quant": 0, "varc": 0, "lrdi": 0 },
  "dayNum": 1,
  "todayData": {},
  "mode": "prep",
  "userName": "Ranga",
  "startDate": "2026-01-01"
}
```

### `POST /api/user/check`
Check if a user exists in Supabase. Body: `{ "userId": "..." }`

### `POST /api/user/init`
Create or update a user profile. Body: `{ "userId": "...", "name": "...", "startDate": "...", ...avatar fields }`

### `POST /api/user/update`
Update any user fields. Body: `{ "userId": "...", ...fields }`

### `POST /api/log/save`
Save a daily log. Body: `{ "userId": "...", "date": "YYYY-MM-DD", "dayData": { ...log fields } }`

### `GET /api/log/all/:userId`
Returns all daily logs for a user, keyed by date.

---

## Effort Score Formula

The score is calculated server-side and in the frontend:

| Component | Target | Max Points |
|---|---|---|
| Quant | 10/day | 20 |
| VARC | 5/day | 12 |
| LRDI | 5/day | 12 |
| VARC Para | 1/day | 8 |
| Study hours | 5h/day | 16 |
| Live class | — | 8 |
| VARC passage toggle | — | 4 |
| Sleep (4-6h) | 4-6 hrs | 10 |
| Backlog coverage | % done | 10 |
| **Total** | | **100** |

Each component is capped at its max even if you exceed the target.

---

## localStorage Keys

All app state is persisted here so the app works without logging in:

| Key | Value |
|---|---|
| `cat_start_date` | `YYYY-MM-DD` prep start date |
| `cat_user_name` | User's name |
| `cat_user_id` | UUID identifying the user |
| `cat_prep_data` | JSON object keyed by date → daily log |
| `conquer_backlog_videos` | JSON array of global video backlog items |
| `conquer_backlog_concepts` | JSON array of global concept backlog items |
| `conquer_backlog` | Legacy JSON array, auto-migrated to Videos on first load |
| `cat_sel_date` | Currently selected calendar date |
| `app_mode` | `"prep"` or `"interview"` |
| `interview_date` | `YYYY-MM-DD` IIM interview date |
| `cat_result` | `"cracked"` or `"missed"` |
| `cat_percentile` | Percentile string e.g. `"99.94"` |
| `mentor_btn_pos` | `{ x, y }` floating button position |
| `mentor_greeted_today` | ISO date string, prevents double greeting |
| `cat_avatar_gender` | `"male"` / `"female"` |
| `cat_avatar_skin` | `"light"` / `"medium"` / `"dark"` |
| `cat_avatar_hair` | `"short"` / `"wavy"` / `"curly"` / `"long"` / `"bun"` |
| `cat_avatar_hair_color` | `"black"` / `"brown"` / `"blonde"` / `"grey"` |
| `cat_avatar_shirt` | `"orange"` / `"blue"` / `"green"` / `"purple"` / `"red"` / `"white"` |
| `cat_avatar_glasses` | `"true"` / `"false"` |
| `cat_avatar_beard` | `"true"` / `"false"` |

---

## Reset the App

To start fresh (wipe all progress and re-run onboarding):

**Option 1 — In the app:**
- Click "reset start date" in the sidebar.

**Option 2 — Browser DevTools:**
- Open DevTools → Application → Local Storage → select `localhost:5173` → clear all `cat_*`, `conquer_backlog`, `conquer_backlog_videos`, and `conquer_backlog_concepts` keys.

**Option 3 — Supabase:**
- Go to your Supabase project → Table Editor → `daily_logs` → delete rows for your user ID.

---

## Troubleshooting

**Server won't start — missing environment variable**

The server logs which env variable is missing. Make sure your `.env` file is inside the `cat-tracker/` directory (not the repo root).

**"All provider slots failed" in mentor chat**

All your LLM keys are rate-limited at the same time. Add more Groq/Gemini keys to your `.env` (you can create multiple free keys per account). The slots have a 60-second cooldown, so waiting a minute also works.

**Qdrant init failed**

Check that `QDRANT_URL` doesn't have a trailing slash and that your `QDRANT_API_KEY` is correct. The URL should look like `https://xyz.cloud.qdrant.io` with no path.

**Redis connection error**

Make sure your `REDIS_URL` starts with `rediss://` (double s — TLS). Upstash requires TLS.

**Xenova model download is slow**

The `all-MiniLM-L6-v2` model downloads from HuggingFace on the first server start. If you're on a slow connection, just wait. It only downloads once and is cached in `node_modules/.cache`.

**Supabase "relation does not exist"**

You didn't run the SQL to create the tables. Go back to [Step 2b](#2b-create-the-tables) and run both `CREATE TABLE` statements in the Supabase SQL Editor.

**Vite proxy not working (API calls failing in dev)**

Make sure both servers are running (`npm run dev` starts both). If you only ran `npm run dev:client`, Express isn't running and `/api/*` calls will fail.

**The mentor greeting fires twice**

Clear the `mentor_greeted_today` key from localStorage (DevTools → Application → Local Storage).

---

## Mentor Calibre System

Vikram's calibre system gives the student a quantitative read of their academic and performance profile — not as a prediction, but as a starting point that can rise or fall based on behaviour.

### Baseline Calibre (from education and profile)

Computed in `src/mentor/prompt.js` via `computeBaselineCalibre(profile)`.

Starts at 45 and adjusts based on:
- UG GPA/score: +10 (≥85%), +6 (≥75%), +3 (≥65%), −4 (<60%)
- PG/Masters/professional qualification detected: +8
- Strong institution detected (IIM, IIT, NIT, BITS, TISS, XLRI, FMS, DU, JNU, SRCC, LSR, etc.): +5
- Field coherence for MBA/PI story (law, economics, finance, engineering, etc.): +4
- Work experience: +10 (3+ yrs), +9 (2+), +6 (1+), +3 (6 mo+), 0 (fresher with risk noted)

**Score → Band:**
| Score | Band |
|---|---|
| 85–100 | Elite potential |
| 70–84 | Strong |
| 55–69 | Competitive |
| 40–54 | Developing |
| 0–39 | Raw |

### UG and PG Extraction

`formatDegree(degreeObj)` handles both legacy string and structured object formats for secondary degrees:

```js
// structured object example
{
  degree: "M.A.",
  field: "Public Policy and Law",
  college: "TISS",
  gpa: "8.47",
  gpaScale: "10",
  year: "2027"
}
// → "M.A., Public Policy and Law, TISS, GPA: 8.47/10 CGPA, Year: 2027"
```

`isPostgraduateDegree()` detects: MBA, PGDM, M.Tech, M.E., MS, M.Sc, MA, M.A., M.Com, M.Phil, LLM, MCA, CA, CS, CFA.

The system prompt always shows UG and PG sections separately. If PG is from a strong institution like TISS or IIT, Vikram references it naturally as a profile signal — not as flattery, but as evidence.

### Dynamic Calibre (from live performance)

Computed via `computeDynamicCalibre({ baselineCalibre, trackerData })`.

Adjustments:
- Consistency ≥0.8: +8 | ≥0.6: +4 | <0.35 after day 7: −8
- Backlog coverage ≥70%: +4 | <30% with backlog >5: −4
- Today's effort ≥80: +2 | <30: −2
- Practice momentum on track vs target: +6 | significantly behind after day 14: −6

Returns `{ score, band, trend: "rising"|"stable"|"falling", adjustment, reasons, warning }`.

Vikram uses the live calibre score (not the baseline) when the student asks about their chances, profile strength, or whether they are improving.

### Chat Entry Points Send Full Profile

Both `ChatPage` and `FloatingMentor` send the complete profile object to `/api/chat`:

```json
{
  "profile": {
    "category": "General",
    "gender": "male",
    "primaryDegree": { "type": "B.Tech", "college": "NIT Trichy", "gpa": "8.5", "gpaScale": "10" },
    "secondaryDegrees": [{ "degree": "M.A.", "field": "Public Policy and Law", "college": "TISS", "gpa": "8.47", "gpaScale": "10", "year": "2027" }],
    "workExpYears": 2,
    "workExpMonths": 6,
    "workCompany": "Deloitte",
    "workRole": "Analyst",
    "profileScore": 72,
    "hasMasters": true,
    "adjustedCutoffs": { "ABC": 98.5, "KLIS": 96.0, "newIIM": 93.0 }
  }
}
```

### Weekly CAT Assessment Tool

`catAssessmentTool` in `src/mentor/tools.js` supports three actions:

| Action | Purpose |
|---|---|
| `generate_question` | Returns a question from the curated internal bank |
| `validate_question` | Checks quality and structure of a question |
| `check_answer` | Validates the question, then compares user answer to correct answer |

**Question validation rules:**
- Question text must be non-empty and contain no placeholder text ("undefined", "null", "lorem")
- Must have exactly 4 options, all non-empty and unique
- `correctAnswer` must exactly match one option
- Explanation must be non-empty
- Quant questions must contain numeric information
- LRDI questions must contain a clear condition or data set

**Assessment session flow (triggered by "test me", "assess me", "quiz me"):**
1. Vikram generates 1 Quant + 1 VARC + 1 LRDI question using `catAssessmentTool`
2. Presents one question at a time; waits for the student's answer
3. Uses `check_answer` after each response
4. After 3 answers, delivers calibre verdict:
   - 3/3 correct → calibre rising
   - 2/3 correct → calibre stable but not safe
   - 1/3 correct → calibre falling
   - 0/3 correct → serious gap

### How to Test

1. Add UG and PG degrees in the Academic & Work Profile tab.
2. Open the Mentor tab and ask: `"Assess my calibre based on my education profile."`
   - Vikram should mention UG and PG separately.
   - Vikram should state a baseline calibre score and band.
   - Vikram should say education is the starting point — performance changes the live estimate.
3. Ask: `"Test me this week."`
   - Vikram should ask 3 CAT-level questions (1 per section).
   - Questions should have 4 valid, distinct options.
   - Vikram should check each answer and explain the correct reasoning.
   - After 3 answers, Vikram should give a calibre verdict.
4. Confirm Vikram never ignores the PG degree when you ask about your academic profile.
5. Confirm calibre trend changes after a few days of high vs low effort scores.
