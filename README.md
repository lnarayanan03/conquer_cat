# CONQUER CAT

A personal CAT 2026 discipline tracker + AI mentor built for serious aspirants.

CONQUER CAT is not just a to-do list. It is a daily accountability system for CAT prep. You log what you did, see whether you are actually moving, and talk to Vikram, a strict AI mentor who calls out your discipline with no sugarcoating.

## What Is This?

CONQUER CAT helps you track:

- Daily Quant, VARC, and LRDI work
- Wake time and sleep discipline
- iQuanta backlog videos and concepts
- Progress calendar and consistency
- Profile, category, education, work experience, and IIM targets
- AI mentor Vikram
- Weekly CAT-style assessment / quiz
- Daily Instagram-style share card

Think of it as your private CAT command center.

## Who Is This For?

This is for:

- CAT aspirants
- iQuanta students
- Students preparing seriously for IIMs
- People who want strict daily accountability
- People who want to track effort, not just feel motivated

If you want a soft motivational app, this is not that.

If you want a mirror that shows whether your day was IIM-level or not, this is for you.

## Why There Is No One Common App For Everyone

I cannot give one public app link to every student and let everyone use the same backend.

Simple reason: this app uses paid or limited services.

It uses:

- AI model APIs
- Database storage
- Chat memory
- Vector memory
- Search tools
- User sync

If thousands of students use one shared app, it will hit:

- LLM limits
- Database limits
- Storage limits
- Cost issues
- Privacy issues

Your study data should also stay private.

So the best way is:

**Each student creates their own copy and runs it with their own accounts/API keys.**

Think of this like making your own private notebook, not writing in someone else's notebook.

## Setup Words In Plain English

You will see a few technical words. Here is what they mean:

- **GitHub**: the place where the app code lives.
- **Repository**: the folder of code on GitHub.
- **Clone / download**: taking a copy of the app to your laptop.
- **npm install**: installing the parts the app needs to run.
- **.env file**: a private file where your API keys are kept.
- **API key**: a password that lets the app use services like AI, database, or search.
- **Deploy**: putting the app online so you can open it from your phone.

You do not need to become a software engineer. But you do need to follow the steps carefully.

## Quick Start

Use this if you already know the basics of terminal commands.

```bash
git clone https://github.com/lnarayanan03/conquer_cat.git
cd conquer_cat
cd cat-tracker
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

The app code is inside the `cat-tracker` folder. That is why you enter `conquer_cat/cat-tracker` before running npm commands.

## Step-By-Step Setup For Non-Tech Users

### Step 1: Create Or Login To GitHub

Go to:

```text
https://github.com
```

Create an account or login.

### Step 2: Open The App Code

Open this link:

```text
https://github.com/lnarayanan03/conquer_cat.git
```

This is where the CONQUER CAT code lives.

### Step 3: Fork Or Clone The App

You have two options:

- **Fork**: make your own GitHub copy.
- **Clone**: download the app to your laptop.

For local setup, clone it:

```bash
git clone https://github.com/lnarayanan03/conquer_cat.git
```

### Step 4: Install Node.js

Install Node.js 20 or newer:

```text
https://nodejs.org
```

After installing, open a terminal and check:

```bash
node -v
npm -v
```

If both commands show version numbers, you are good.

### Step 5: Open Terminal In The App Folder

Go inside the cloned app:

```bash
cd conquer_cat
cd cat-tracker
```

### Step 6: Install App Parts

Run:

```bash
npm install
```

This may take a few minutes. Let it finish.

### Step 7: Create The Private Key File

Inside `conquer_cat/cat-tracker`, create a file named:

```text
.env
```

This file stores private keys. It should never be posted online.

### Step 8: Add API Keys

Paste your keys into `.env`.

You can start with fewer keys, but full features need AI, Supabase, Redis, Qdrant, and Tavily.

### Step 9: Start The App

Run:

```bash
npm run dev
```

### Step 10: Open The Browser Link

Open:

```text
http://localhost:5173
```

You should see CONQUER CAT.

## Environment Variables

Create `.env` inside:

```text
conquer_cat/cat-tracker/.env
```

Use this format. Do not paste real keys into GitHub.

```env
GROQ_API_KEY=
GROQ_API_KEY_2=
GROQ_API_KEY_3=

GEMINI_API_KEY_1=
ANTHROPIC_API_KEY=
TAVILY_API_KEY=

REDIS_URL=
QDRANT_URL=
QDRANT_API_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_KEY=

LANGCHAIN_TRACING_V2=
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=
```

Optional extra Gemini keys are also supported by the code:

```env
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=
GEMINI_API_KEY_4=
GEMINI_API_KEY_5=
GEMINI_API_KEY_6=
GEMINI_API_KEY_7=
GEMINI_API_KEY_8=
```

Safety rules:

- Never share your `.env` file.
- Never post API keys on GitHub.
- Never send API keys in screenshots.
- Treat `SUPABASE_SERVICE_KEY` like a password.

What the keys do:

- **Groq / Gemini / Anthropic**: AI mentor replies.
- **Tavily**: web search for real CAT/IIM facts.
- **Redis**: short-term chat memory.
- **Qdrant**: long-term mentor memory.
- **Supabase**: user data, daily logs, backlog, and cross-device sync.
- **LangSmith / LangChain tracing**: optional debugging for advanced users.

## How To Use The App

### Today

Use this every day.

Log:

- Wake time
- Sleep time
- Live class
- Afternoon session
- Application class
- VARC passage
- Personal practice time
- Quant, VARC, LRDI counts
- Notes

Then tap **Save Day**.

### Progress

See overall growth:

- Total problems solved
- Days left
- Progress against targets
- Backlog status
- Journey trend

### Calendar

Check consistency.

Every day becomes a cell. Missed days are visible. There is nowhere to hide.

### Mentor

Talk to Vikram, the strict AI mentor.

Ask him:

- What went wrong today?
- Am I on track?
- Test me.
- Assess my profile.
- Start mock PI.
- Give me a WAT topic.

### Profile

Add:

- Category
- Target percentile
- Education
- PG / Masters
- Work experience
- Company and role

This helps Vikram and the IIM target calculator understand your real profile.

### Backlog

Track:

- iQuanta backlog videos
- Concepts you still need to revise

Backlog is separate from daily logs, so it stays with you across days.

### Share Card

Create a daily Instagram-style card showing:

- Day number
- Date
- Quant / VARC / LRDI work
- Study sessions
- Days left
- Vikram one-liner
- iQuanta branding

Use it if public accountability helps you.

## Use CONQUER CAT Like A Mobile App

CONQUER CAT is a web app, but you can add it to your phone home screen and use it like an app.

The app manifest name is **CONQUER — CAT 2026**, with short name **CONQUER**.

### On iPhone / iOS

Use Safari for best home screen installation.

1. Open your app link in Safari.
2. Tap the Share button.
3. Scroll and tap **Add to Home Screen**.
4. Tap **Add**.
5. Open CONQUER CAT from your home screen like an app.

### On Android

Use Chrome.

1. Open your app link in Chrome.
2. Tap the three-dot menu.
3. Tap **Add to Home screen** or **Install app**.
4. Tap **Add** or **Install**.
5. Open it from your home screen.

The app works best when used daily from the home screen.

## Daily Usage Routine

### Morning

- Open the app.
- Set wake time.
- Check day count.
- See what kind of day you need.

### During The Day

- Log live class or sessions.
- Add personal practice time.
- Update backlog as you finish videos or concepts.

### Night

- Enter Quant / VARC / LRDI count.
- Add notes.
- Save Day.
- Ask Vikram for a reality check.
- Share the card if you want accountability.

## Mentor: Vikram Anand

Vikram is not a soft motivation bot.

He is strict.

He checks:

- Your discipline
- Your daily effort
- Your education profile
- Your category and target
- Your work experience
- Your consistency
- Your weekly quiz performance

He is designed to push you, not comfort you.

## Calibre System

Your education creates your starting calibre.

Your daily work raises or lowers it.

A strong PG or good college can help your profile, especially for interviews. But it does not replace execution.

Simple truth:

> Your profile opens the door. Your daily work decides whether you walk through it.

Vikram uses calibre to judge whether you are rising, stable, or falling.

## Weekly Assessment

Vikram can test you weekly with CAT-level questions.

The assessment can include:

- Quant
- VARC
- LRDI

Questions are checked for quality before being used. Your performance helps Vikram judge whether your calibre is rising, stable, or falling.

Ask:

```text
Test me this week.
```

## Instagram / Share Card

The share card lets you export your daily progress.

It can show:

- Day number
- Date
- Quant / VARC / LRDI count
- Study time
- Sessions completed
- Days left
- Vikram one-liner
- iQuanta brand mark

Use it as a scoreboard, not decoration.

## Troubleshooting For Non-Tech Users

### `npm install` fails

Try:

- Check Node.js version with `node -v`.
- Use Node.js 20 or newer.
- Run `npm install` again.
- Make sure you are inside `conquer_cat/cat-tracker`.

### App does not start

Check:

- You created `.env`.
- You are in the `cat-tracker` folder.
- You ran `npm install`.
- You ran `npm run dev`.

### Mentor does not reply

Check:

- API keys are added.
- Internet is working.
- LLM quota is not exhausted.
- Groq / Gemini / Anthropic keys are valid.

### Search does not work

Check:

- `TAVILY_API_KEY` is set.

### Data is not saving across devices

Check:

- `SUPABASE_URL` is set.
- `SUPABASE_SERVICE_KEY` is set.
- Supabase tables exist.

### Memory does not work

Check:

- `REDIS_URL` is set.
- `QDRANT_URL` is set.
- `QDRANT_API_KEY` is set if your Qdrant cluster requires it.

### Mobile home screen option does not show

Try:

- Safari on iPhone.
- Chrome on Android.
- Open the deployed app link, not `localhost`.

## Developer Notes

This section is for people who want to modify or deploy the app.

### Tech Stack

- React 19
- Vite 8
- Express 5
- Supabase
- Redis via `ioredis`
- Qdrant
- LangChain
- Groq
- Gemini
- Anthropic
- Tavily
- html2canvas for share cards

### Real Scripts

These are the actual scripts in `cat-tracker/package.json`:

| Command | Meaning |
|---|---|
| `npm run dev` | Runs frontend and backend together |
| `npm run dev:client` | Runs only Vite frontend |
| `npm run dev:server` | Runs only Express backend |
| `npm run build` | Builds frontend into `dist/` |
| `npm start` | Starts Express server |

### Local Development

```bash
cd conquer_cat
cd cat-tracker
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

### Build

```bash
npm run build
```

### Start Built App

```bash
npm start
```

Open:

```text
http://localhost:3001
```

### Folder Structure

```text
conquer_cat/
└── cat-tracker/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   ├── index.css
    │   ├── mentor/
    │   │   ├── chain.js
    │   │   ├── memory.js
    │   │   ├── pipeline.js
    │   │   ├── prompt.js
    │   │   └── tools.js
    │   └── pages/
    │       ├── InstaCard.jsx
    │       └── InstaCard.css
    ├── public/
    │   └── manifest.json
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── index.html
    └── README.md
```

## Deployment Note

Advanced users can deploy this to Render or similar Node hosting platforms.

Basic Render idea:

```text
Build Command: npm install && npm run build
Start Command: npm start
```

Important:

- Add environment variables in the hosting dashboard.
- Do not upload `.env`.
- Make sure the service runs from the `cat-tracker` app folder.
- One Express service can serve both frontend and backend after build.

Vercel is possible for frontend-only apps, but this project has an Express backend, so Render-style Node hosting is simpler.

## Final Note

CONQUER CAT will not study for you.

It will show you clearly whether you are becoming the person who can crack CAT.
