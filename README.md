# CONQUER CAT

A private CAT 2026 discipline tracker + AI mentor.

CONQUER CAT is a personal web app for serious CAT aspirants. It tracks daily discipline, stores progress, calculates IIM targets, and gives access to Vikram, a strict AI mentor built to challenge the student every day.

This app uses:

- **Supabase** for users, daily logs, profile data, and cross-device sync
- **Redis** for short-term mentor chat memory
- **Qdrant** for long-term mentor memory
- **Groq / Gemini / Anthropic** for AI replies
- **Tavily** for web search
- **Render** or similar Node hosting for deployment

This is not a shared public SaaS app. Each student should run a private copy with their own keys and accounts.

Why?

- AI APIs have rate limits and costs.
- Databases and memory services have storage limits.
- One shared app would hit limits quickly.
- Your study data should stay private.
- Your API keys should belong to you.

Think of this like making your own private notebook, not writing in someone else's notebook.

---

## What The App Does

CONQUER CAT helps track:

- Quant, VARC, and LRDI daily work
- Wake time and sleep discipline
- Live classes, sessions, and personal practice
- iQuanta backlog videos and concepts
- Calendar consistency
- Profile, category, PG, work experience, and IIM targets
- Mentor chat with Vikram
- Weekly CAT-style assessment
- Daily Instagram-style share card

---

## Prerequisites

Before setup, create or install these:

- GitHub account
- Git installed on your laptop
- Node.js 20 or newer
- npm, installed automatically with Node.js
- Supabase account
- Upstash Redis or Redis Cloud account
- Qdrant Cloud account
- Groq account
- Gemini API key or Anthropic API key
- Tavily account
- Render account for deployment

At least one working LLM provider is required. Groq is the easiest first choice. Gemini and Anthropic can be added as fallbacks.

---

## Project Path In This Repository

In this workspace, the runnable app is inside:

```text
conquer_cat/cat-tracker
```

That folder contains the real app files:

- `package.json`
- `server.js`
- `src/`
- `public/`
- `index.html`
- `render.yaml`
- `README.md`

Run npm commands from `cat-tracker`, not from the parent folder.

---

## 1. Clone The Repository

Open Terminal.

Run:

```bash
git clone https://github.com/lnarayanan03/conquer_cat.git
cd conquer_cat
cd cat-tracker
npm install
```

If the repository is private:

- The owner must add you as a collaborator, or
- You must fork it to your own GitHub account with permission.

After `npm install`, the app's required packages are installed.

---

## 2. Create The `.env` File

Create a file named `.env` inside:

```text
conquer_cat/cat-tracker
```

On macOS/Linux:

```bash
touch .env
```

On Windows, create a new file named `.env` in the `cat-tracker` folder.

Paste this template:

```env
GROQ_API_KEY=
GROQ_API_KEY_2=
GROQ_API_KEY_3=

GEMINI_API_KEY_1=
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=
GEMINI_API_KEY_4=
GEMINI_API_KEY_5=
GEMINI_API_KEY_6=
GEMINI_API_KEY_7=
GEMINI_API_KEY_8=

ANTHROPIC_API_KEY=
TAVILY_API_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_KEY=

REDIS_URL=

QDRANT_URL=
QDRANT_API_KEY=

LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=conquer-cat

PORT=3001
```

### What Each Variable Means

| Variable | Required? | Where To Get It | Used For |
|---|---:|---|---|
| `GROQ_API_KEY` | Recommended | Groq Console | Fast mentor replies |
| `GROQ_API_KEY_2` | Optional | Groq Console | Extra Groq fallback key |
| `GROQ_API_KEY_3` | Optional | Groq Console | Extra Groq fallback key |
| `GEMINI_API_KEY_1` | Optional but useful | Google AI Studio | Gemini fallback replies |
| `GEMINI_API_KEY_2` to `GEMINI_API_KEY_8` | Optional | Google AI Studio | Extra Gemini fallback keys |
| `ANTHROPIC_API_KEY` | Recommended | Anthropic Console | Claude fallback, greeting, share-card line |
| `TAVILY_API_KEY` | Recommended | Tavily | Web search for CAT/IIM facts |
| `SUPABASE_URL` | Required for sync | Supabase Project Settings | Database URL |
| `SUPABASE_SERVICE_KEY` | Required for sync | Supabase Project Settings | Server-side database access |
| `REDIS_URL` | Required for memory | Upstash / Redis Cloud | Same-day mentor chat memory |
| `QDRANT_URL` | Required for memory | Qdrant Cloud | Long-term vector memory |
| `QDRANT_API_KEY` | Usually required | Qdrant Cloud | Qdrant authentication |
| `LANGCHAIN_TRACING_V2` | Optional | LangSmith | Debug LLM calls |
| `LANGCHAIN_API_KEY` | Optional | LangSmith | Debug LLM calls |
| `LANGCHAIN_PROJECT` | Optional | LangSmith | Trace project name |
| `PORT` | Optional | Local/Render | Express server port |

Safety rules:

- Never commit `.env`.
- Never paste API keys in GitHub.
- Never send screenshots that show keys.
- `SUPABASE_SERVICE_KEY` is sensitive. Keep it server-side only.

---

## 3. Supabase Setup

Supabase stores:

- User profile
- Avatar settings
- Category and IIM profile data
- Daily logs
- Backlog videos and concepts
- Cross-device sync

### Create A Supabase Project

1. Go to `https://supabase.com`.
2. Sign in or create an account.
3. Click **New Project**.
4. Choose your organization.
5. Project name: `conquer-cat`.
6. Set a strong database password.
7. Choose a region close to you or close to your Render region.
8. Click **Create new project**.
9. Wait until the project is ready.

### Get Supabase URL And Service Key

1. Open your Supabase project.
2. Click **Project Settings**.
3. Click **API**.
4. Copy **Project URL**.
5. Paste it into `.env`:

```env
SUPABASE_URL=
```

6. Copy the **service_role** key.
7. Paste it into `.env`:

```env
SUPABASE_SERVICE_KEY=
```

Important:

- Use the `service_role` key only in the backend/server.
- Do not expose it in frontend code.
- Do not paste it into public GitHub files.

### Create Supabase Tables

The backend uses two Supabase tables:

- `users`
- `daily_logs`

Copy this SQL exactly.

```sql
-- CONQUER CAT Supabase schema
-- Run this in Supabase SQL Editor.

create table if not exists public.users (
  id uuid primary key,
  name text,
  start_date date,

  avatar_gender text default 'male',
  avatar_skin text default 'medium',
  avatar_hair text default 'wavy',
  avatar_hair_color text default 'black',
  avatar_shirt text default 'blue',
  avatar_glasses boolean default false,
  avatar_beard boolean default false,
  avatar_mustache boolean default false,

  app_mode text default 'prep',
  interview_date date,
  cat_result text,
  cat_percentile text,

  backlog_videos jsonb default '[]'::jsonb,
  backlog_concepts jsonb default '[]'::jsonb,

  category text default 'General',
  primary_degree jsonb default '{}'::jsonb,
  secondary_degrees jsonb default '[]'::jsonb,
  work_experience_years integer default 0,
  work_experience_months integer default 0,
  work_company text default '',
  work_role text default '',

  target_percentile numeric,
  min_percentile jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  log_date date not null,

  quant integer default 0,
  varc integer default 0,
  lrdi integer default 0,
  vp_count integer default 0,

  wake_time text default '',
  sleep_time text default '',

  live_class boolean default false,
  afternoon_session boolean default false,
  application_class boolean default false,
  practice_hrs integer default 0,
  practice_mins integer default 0,
  varc_passage boolean default false,

  iq_notes text default '',
  notes text default '',
  backlog jsonb default '[]'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id, log_date)
);

create index if not exists daily_logs_user_id_idx
  on public.daily_logs(user_id);

create index if not exists daily_logs_user_date_idx
  on public.daily_logs(user_id, log_date);

create index if not exists users_category_idx
  on public.users(category);
```

### How To Run SQL In Supabase

1. Open your Supabase project.
2. Click **SQL Editor**.
3. Click **New Query**.
4. Paste the SQL above.
5. Click **Run**.
6. Go to **Table Editor**.
7. Confirm `users` and `daily_logs` exist.

### RLS Note

Supabase has Row Level Security, also called RLS.

This app uses `SUPABASE_SERVICE_KEY` on the Express backend. The service role key bypasses RLS server-side.

Do not use the service role key in frontend code.

### Supabase Verification

After setup:

1. Start the app.
2. Complete onboarding.
3. Save one day.
4. Refresh the page.
5. Check that the data is still there.
6. Open Supabase **Table Editor**.
7. Check that a row exists in `users`.
8. Check that a row exists in `daily_logs` after saving a day.

---

## 4. Redis Setup

Redis stores short-term mentor chat memory for the current day.

Recommended simple option: **Upstash Redis**.

### Create Upstash Redis

1. Go to `https://upstash.com`.
2. Create an account or sign in.
3. Click **Create Database**.
4. Name it `conquer-cat`.
5. Choose a region close to you or close to Render.
6. Choose the free tier if available.
7. Click **Create**.

### Get `REDIS_URL`

1. Open the Upstash database.
2. Find **Connect** or **Connection String**.
3. Copy the Redis URL.
4. It usually starts with:

```text
rediss://
```

5. Paste it into `.env`:

```env
REDIS_URL=
```

Use the TLS URL if Upstash gives one. That usually means `rediss://`.

### Redis Troubleshooting

If Redis is missing or wrong:

- Mentor history may fail.
- Daily memory pipeline may fail.
- Server logs may mention `REDIS_URL`.

Check:

- The URL is copied fully.
- The URL starts with `rediss://` for Upstash.
- The same value is added to Render environment variables later.

---

## 5. Qdrant Setup

Qdrant stores long-term mentor memory as vectors.

In simple words: it helps Vikram remember important patterns from your past preparation.

### Create Qdrant Cloud Cluster

1. Go to `https://cloud.qdrant.io`.
2. Create an account or sign in.
3. Click **Create Cluster**.
4. Choose the free tier if available.
5. Select a region close to your app server.
6. Wait for the cluster to start.

### Get `QDRANT_URL` And `QDRANT_API_KEY`

1. Open the Qdrant cluster dashboard.
2. Copy the cluster URL.
3. Paste it into `.env`:

```env
QDRANT_URL=
```

4. Open **API Keys**.
5. Create or copy an API key.
6. Paste it into `.env`:

```env
QDRANT_API_KEY=
```

### Do You Need To Create A Collection Manually?

Usually, no.

The app auto-creates this collection on server startup:

```text
conquer_mentor_memory
```

This is done by `src/mentor/memory.js`.

### Qdrant Verification

1. Start the server.
2. Open Qdrant dashboard.
3. Check collections.
4. After the app runs, `conquer_mentor_memory` should appear.

If it does not:

- Check `QDRANT_URL`.
- Check `QDRANT_API_KEY`.
- Check server logs.

---

## 6. AI Provider Keys

The mentor needs an AI model to reply.

The app supports multiple providers:

- Groq
- Gemini
- Anthropic

You do not need every key on day one. But more keys improve reliability.

### Groq

Groq is fast and a good first choice.

1. Go to `https://console.groq.com`.
2. Sign in.
3. Open **API Keys**.
4. Click **Create API Key**.
5. Copy the key.
6. Paste it into:

```env
GROQ_API_KEY=
```

Optional extra keys:

```env
GROQ_API_KEY_2=
GROQ_API_KEY_3=
GROQ_API_KEY_4=
```

### Gemini

1. Go to `https://aistudio.google.com/app/apikey`.
2. Sign in with Google.
3. Click **Create API Key**.
4. Copy the key.
5. Paste it into:

```env
GEMINI_API_KEY_1=
```

Optional extra keys:

```env
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=
GEMINI_API_KEY_4=
GEMINI_API_KEY_5=
GEMINI_API_KEY_6=
GEMINI_API_KEY_7=
GEMINI_API_KEY_8=
```

### Anthropic

Anthropic is used as a fallback and for some direct mentor calls.

1. Go to `https://console.anthropic.com`.
2. Sign in.
3. Open **API Keys**.
4. Create a key.
5. Paste it into:

```env
ANTHROPIC_API_KEY=
```

Some Anthropic accounts require billing credits before the key works.

---

## 7. Tavily Search Setup

Tavily lets Vikram search for real-world CAT/IIM information.

1. Go to `https://tavily.com`.
2. Create an account.
3. Open the API key section.
4. Create or copy your key.
5. Paste it into:

```env
TAVILY_API_KEY=
```

If Tavily is missing, mentor search tools will fail when Vikram needs current or real-world information.

---

## 8. LangSmith / LangChain Tracing Optional

This is optional.

Use it only if you want to debug LLM calls.

1. Go to `https://smith.langchain.com`.
2. Create an account.
3. Create an API key.
4. Set:

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=conquer-cat
```

If you do not use it:

```env
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=conquer-cat
```

---

## 9. Run Locally

Make sure you are inside:

```text
conquer_cat/cat-tracker
```

Run:

```bash
npm run dev
```

This starts:

- Vite frontend
- Express backend

Open:

```text
http://localhost:5173
```

### Run Frontend And Backend Separately

These scripts exist in `package.json`.

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:client
```

### Build

```bash
npm run build
```

### Start Production Server Locally

First build:

```bash
npm run build
```

Then start:

```bash
npm start
```

Open:

```text
http://localhost:3001
```

---

## 10. Deploy On Render

Render can host this app as a Node web service.

### Before Deploying

Make sure:

- Code is pushed to GitHub.
- `.env` is not pushed.
- Supabase is ready.
- Redis is ready.
- Qdrant is ready.
- AI keys are ready.

### Create Render Web Service

1. Go to `https://render.com`.
2. Sign in.
3. Click **New +**.
4. Click **Web Service**.
5. Connect GitHub.
6. Select `lnarayanan03/conquer_cat` or your fork.
7. Configure the service.

Use:

```text
Name: conquer-cat
Runtime: Node
Branch: main
Root Directory: cat-tracker
Build Command: npm install && npm run build
Start Command: npm start
```

Why root directory is `cat-tracker`:

In this repository, the actual app package is inside the `cat-tracker` folder.

### About `render.yaml`

This project includes `cat-tracker/render.yaml`.

Render may auto-detect it if the service is configured from the correct folder. Still verify:

- Build command is `npm install && npm run build`
- Start command is `npm start`
- Node version is 20

### Add Environment Variables In Render

Go to:

```text
Render Dashboard → Your Service → Environment
```

Add these values one by one:

```text
GROQ_API_KEY
GROQ_API_KEY_2
GROQ_API_KEY_3
GEMINI_API_KEY_1
GEMINI_API_KEY_2
GEMINI_API_KEY_3
GEMINI_API_KEY_4
GEMINI_API_KEY_5
GEMINI_API_KEY_6
GEMINI_API_KEY_7
GEMINI_API_KEY_8
ANTHROPIC_API_KEY
TAVILY_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_KEY
REDIS_URL
QDRANT_URL
QDRANT_API_KEY
LANGCHAIN_TRACING_V2
LANGCHAIN_API_KEY
LANGCHAIN_PROJECT
```

Also add:

```text
NODE_VERSION=20
```

Render environment variables replace your local `.env` in production.

Do not upload `.env` to GitHub.

### Deploy

1. Click **Create Web Service**.
2. Wait for Render to install, build, and start.
3. Open the generated Render URL.
4. Complete onboarding.
5. Save one day.
6. Check Supabase to confirm rows are inserted.

---

## 11. Save Changes To GitHub

Use this when you edit README, code, or settings and want to upload changes.

Check changed files:

```bash
git status
```

Stage files:

```bash
git add .
```

Commit:

```bash
git commit -m "Update setup documentation"
```

Push to GitHub:

```bash
git push origin main
```

What these mean:

- `git status` shows changed files.
- `git add .` prepares changes.
- `git commit` saves a snapshot.
- `git push` uploads to GitHub.

If push fails because GitHub has newer changes:

```bash
git pull origin main --rebase
git push origin main
```

If Render is connected to GitHub, pushing to `main` usually triggers a new deploy.

---

## 12. Daily Usage

### Today

Log:

- Wake time
- Sleep time
- Live class
- Afternoon session
- Application class
- VARC passage
- Personal practice
- Quant count
- VARC count
- LRDI count
- Notes

Then tap **Save Day**.

### Progress

Use this to see:

- Overall growth
- Days left
- Total sets solved
- Backlog summary
- Journey trend

### Calendar

Use this to check consistency across days.

Missed days are visible. That is the point.

### Mentor

Talk to Vikram.

Ask:

```text
Am I on track?
Test me this week.
Assess my profile.
Start mock PI.
Give me a WAT topic.
```

### Profile

Add:

- Category
- Target percentile
- UG degree
- PG / Masters
- Work experience
- Company and role

This helps the IIM calculator and Vikram's calibre assessment.

### Backlog

Track:

- iQuanta backlog videos
- Concepts you need to revise

### Share Card

Use the daily card to export your progress.

It can show:

- Day number
- Date
- Quant / VARC / LRDI work
- Sessions
- Days left
- Vikram one-liner
- iQuanta mark

---

## 13. Use It Like A Mobile App

CONQUER CAT is a web app, but you can add it to your phone home screen.

### iPhone / iOS

Use Safari.

1. Open the deployed app link in Safari.
2. Tap the Share button.
3. Scroll and tap **Add to Home Screen**.
4. Tap **Add**.
5. Open CONQUER CAT from your home screen.

### Android

Use Chrome.

1. Open the deployed app link in Chrome.
2. Tap the three-dot menu.
3. Tap **Add to Home screen** or **Install app**.
4. Tap **Add** or **Install**.
5. Open it from your home screen.

Use it daily from the home screen. Discipline improves when the tracker is one tap away.

---

## Mentor Calibre System

Vikram does not judge only today's mood.

He uses your profile and performance.

Baseline calibre can consider:

- UG degree
- UG score/GPA
- PG or Masters degree
- College signal, such as TISS, IIT, NIT, IIM, and similar strong institutions
- Work experience
- Field and career story

Live calibre can move based on:

- Daily effort
- Consistency
- Backlog coverage
- Weekly quiz performance
- Whether practice is rising or falling

A strong PG helps. A strong college helps. Work experience helps.

But none of them replace execution.

> Your profile opens the door. Your daily work decides whether you walk through it.

---

## Weekly CAT Assessment

Vikram can test you with CAT-level questions.

Sections:

- Quant
- VARC
- LRDI

Daily assessment uses 2 questions per section, for 6 total.

Weekly assessment uses 10 questions per section, for 30 total.

### Question Bank Flow

Questions are stored in Supabase in the `questions` table.

The bank is filled in two ways:

- Manual seed: `/api/internal/seed` tops each topic up to 50 active questions.
- Nightly pipeline: every midnight IST it adds fresh questions from Tavily.

Nightly replenish rules:

- Monday to Saturday midnight: 2 Quant, 2 VARC, and 2 LRDI questions.
- Sunday 00:00 IST: 10 Quant, 10 VARC, and 10 LRDI questions for weekly assessment readiness.

The ingest pipeline validates every question before insert:

- Valid topic
- Valid difficulty
- Question text present
- Exactly 4 options
- Correct answer exactly matches one option
- Explanation present
- Duplicate question text filtered before insert

Ingest logs show the funnel:

```text
parsed -> valid -> deduped -> inserted
```

Already ingested questions should normally stay in the bank. The app avoids questions already seen by the user when possible, and new nightly questions keep expanding the pool.

### Solved and Unsolved Tracking

When the student submits an answer, the app saves it to `user_question_attempts`.

- Correct answers are saved as solved.
- Wrong answers are saved as incorrect/unsolved.
- Recent wrong answers can reappear for retry practice.
- Daily topic performance is updated in `daily_question_log`.
- Completed sessions are marked in `assessment_sessions`.

The tool checks that:

- Question is not garbage
- Options are valid
- Correct answer exists
- Explanation exists

Ask:

```text
Test me this week.
```

After the test, Vikram can tell whether your calibre is rising, stable, or falling.

---

## Troubleshooting

### `npm install` Fails

Try:

```bash
node -v
npm -v
```

Use Node.js 20 or newer.

Make sure you are inside:

```text
conquer_cat/cat-tracker
```

Then run again:

```bash
npm install
```

If it still fails, delete `node_modules` and reinstall. Delete `package-lock.json` only if you know why you are doing it.

### App Is Blank

Check:

- Terminal errors
- Browser console errors
- `.env` exists
- `npm run build` works

Run:

```bash
npm run build
```

### App Does Not Start

Check:

- You are in `cat-tracker`
- You ran `npm install`
- Port `5173` or `3001` is not already occupied
- `.env` exists

### Mentor Does Not Reply

Check:

- `GROQ_API_KEY`
- `GEMINI_API_KEY_1`
- `ANTHROPIC_API_KEY`
- Provider quotas
- Internet connection
- Render logs if deployed

### Data Is Not Saving

Check:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- SQL tables exist
- `users` table has a row
- `daily_logs` table gets a row after Save Day
- Browser Network tab for failed `/api/log/save`

### Redis Memory Not Working

Check:

- `REDIS_URL`
- Upstash URL starts with `rediss://`
- Render environment variable has the same value
- Server logs for Redis errors

### Qdrant Memory Not Working

Check:

- `QDRANT_URL`
- `QDRANT_API_KEY`
- Qdrant cluster is running
- Collection `conquer_mentor_memory` appears after server start

### Render Deploy Fails

Check:

- Root Directory is `cat-tracker`
- Build Command is `npm install && npm run build`
- Start Command is `npm start`
- `NODE_VERSION=20` is set
- Environment variables are added
- Build logs show the exact error

### Supabase RLS Issue

This app uses the Supabase service role key on the backend.

- Service role bypasses RLS server-side.
- Do not expose service role key in frontend.
- If you switch to anon keys, you must create RLS policies yourself.

### Mobile Home Screen Does Not Show

Use:

- Safari on iPhone
- Chrome on Android
- The deployed Render URL, not `localhost`

---

## Developer Notes

### Tech Stack

- React
- Vite
- Express
- Supabase
- Redis
- Qdrant
- LangChain
- Groq
- Gemini
- Anthropic
- Tavily
- html2canvas

### Real Scripts

These are the actual scripts in `cat-tracker/package.json`:

| Command | Purpose |
|---|---|
| `npm run dev` | Run frontend and backend together |
| `npm run dev:client` | Run Vite frontend only |
| `npm run dev:server` | Run Express backend only |
| `npm run build` | Build frontend into `dist/` |
| `npm start` | Start Express server |

### Folder Structure

```text
conquer_cat/
└── cat-tracker/
    ├── public/
    ├── src/
    │   ├── mentor/
    │   └── pages/
    ├── server.js
    ├── package.json
    ├── render.yaml
    ├── vite.config.js
    └── README.md
```

---

## Final Note

CONQUER CAT will not study for you.

It will show you clearly whether you are becoming the person who can crack CAT.
