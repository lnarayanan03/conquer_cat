# CONQUER — CAT 2026 Prep Tracker

A personal daily tracker for CAT 2026 preparation, built with React + Vite + Express. Includes an AI mentor (Vikram Anand) powered by Claude, daily logging, progress charts, a 200-day calendar, and a post-exam interview prep mode.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8 |
| Backend | Express 5, Node.js |
| AI | Anthropic Claude API (claude-sonnet-4-5 / claude-haiku-4-5) |
| Charts | Recharts |
| Styling | Inline styles + CSS (no UI library) |

---

## Prerequisites

- Node.js 18+
- An Anthropic API key

---

## Setup

**1. Install dependencies**
```bash
cd cat-tracker
npm install
```

**2. Create a `.env` file in the `cat-tracker/` root**
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

---

## Running

### Development (client + server together)
```bash
npm run dev
```
- Vite dev server: `http://localhost:5173`
- Express API server: `http://localhost:3001`
- Vite proxies `/api/*` to Express automatically

### Run servers separately
```bash
npm run dev:client   # Vite only
npm run dev:server   # Express only
```

### Production build
```bash
npm run build        # builds React into dist/
npm start            # serves dist/ + API on PORT (default 3001)
```
Open `http://localhost:3001` in production.

---

## Features

### Onboarding
- Enter your name and prep start date on first launch
- Build a custom avatar: choose gender, skin tone, hair style, hair color, outfit color, glasses, beard
- All preferences saved to `localStorage` — no account needed

### Today Tab
- Log wake time and sleep time (color-coded: green = on target)
- Toggle live class attendance, VARC passage reading
- Log study hours (afternoon + evening sessions)
- Counter inputs for Quant / VARC / LRDI sets completed
- iQuanta notes + daily journal textarea
- Effort score computed from all inputs (0–100)

### Progress Tab
- Days remaining counter
- Scoreboard: Quant (target 2000), VARC (target 1000), LRDI (target 1000)
- Progress bars with "X/day to stay on track"
- Journey Score chart: actual avg effort vs linear target over 200 days
- Total study hours and total problems solved

### Calendar Tab
- 200-cell grid — one cell per day
- Orange = all targets met, dim orange = partial, empty = no entry
- Tap any cell to jump to that day's log

### Mentor Tab (Vikram Anand)
- Full-page chat with Claude as Vikram Anand — 99.99%ile, IIM-A, 4× CAT
- Vikram persona: tough, demanding, zero tolerance for excuses
- Knows your exact stats (days left, totals, today's effort score)
- Quick actions: Mock Interview, WAT Topic, Doubt
- Prompt caching enabled (saves API cost on repeated context)

### Floating Mentor Button
- Draggable, snaps to nearest screen edge (AssistiveTouch style)
- Opens a compact chat panel — same Vikram, smaller window
- Green dot appears when there are unread messages
- Panel position is smart: opens on whichever side has more space

### Daily Greeting
- On first open each day, Vikram sends an auto-generated greeting
- Uses `claude-haiku-4-5` for speed and cost efficiency
- Greeting is personalized with your current stats and day number

### CAT Results Screen
- After Nov 29 2026, app prompts you to enter your percentile
- Live feedback: green for 99.5+ (IIM-A range), orange for 95+, red below 95
- If you cracked CAT (≥99%ile), app transitions to Interview Mode

### Interview Mode
- Activated after entering your CAT result
- Set your IIM interview date
- Today tab shows Mock PI and WAT practice toggles instead of problem counters
- Vikram's system prompt shifts entirely to interview coaching
- Days counter shows days to interview instead of days to CAT

---

## Project Structure

```
cat-tracker/
├── src/
│   ├── App.jsx          # All components: avatars, pages, FloatingMentor, onboarding
│   ├── App.css          # Design tokens, layout, component styles
│   ├── index.css        # Body reset only
│   └── pages/
│       └── InstaCard.css
├── server.js            # Express API: /api/chat, /api/mentor/greet
├── index.html
├── vite.config.js       # Proxies /api → :3001 in dev
└── .env                 # ANTHROPIC_API_KEY, PORT (not committed)
```

---

## API Routes

### `POST /api/chat`
Full mentor chat. Request body:
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "daysLeft": 200,
  "totals": { "quant": 0, "varc": 0, "lrdi": 0 },
  "dayNum": 1,
  "todayData": { "q": 0, "v": 0, "l": 0, "ah": 0, "eh": 0, "lc": false, "vp": false, "vp_count": 0 },
  "mode": "prep",
  "userName": "...",
  "startDate": "2026-01-01",
  "interviewDate": "",
  "catResult": "",
  "catPercentile": ""
}
```
Model: `claude-sonnet-4-5`, max tokens: 400.

### `POST /api/mentor/greet`
Daily greeting. Same body shape, no `messages` field needed.
Model: `claude-haiku-4-5-20251001`, max tokens: 250.

Both routes use **prompt caching** (`anthropic-beta: prompt-caching-2024-07-31`) on the system prompt.

---

## localStorage Keys

| Key | Value |
|---|---|
| `cat_start_date` | `YYYY-MM-DD` prep start date |
| `cat_user_name` | User's full name |
| `cat_prep_data` | JSON object keyed by date, contains all daily logs |
| `cat_sel_date` | Currently selected calendar date |
| `app_mode` | `"prep"` or `"interview"` |
| `interview_date` | `YYYY-MM-DD` IIM interview date |
| `cat_result` | `"cracked"` or `"missed"` |
| `cat_percentile` | Percentile string e.g. `"99.94"` |
| `mentor_btn_pos` | `{ x, y }` floating button position |
| `mentor_greeted_today` | ISO date string, prevents double greet |
| `cat_avatar_gender` | `"male"` / `"female"` |
| `cat_avatar_skin` | `"light"` / `"medium"` / `"dark"` |
| `cat_avatar_hair` | `"short"` / `"wavy"` / `"curly"` / `"long"` / `"bun"` |
| `cat_avatar_hair_color` | `"black"` / `"brown"` / `"blonde"` / `"grey"` |
| `cat_avatar_shirt` | `"orange"` / `"blue"` / `"green"` / `"purple"` / `"red"` / `"white"` |
| `cat_avatar_glasses` | `"true"` / `"false"` |
| `cat_avatar_beard` | `"true"` / `"false"` |

---

## Reset

To reset the app completely (start fresh onboarding):
- Click "reset start date" in the sidebar, or
- Open DevTools → Application → Local Storage → clear all `cat_*` keys

---

## Effort Score Formula

| Component | Max points |
|---|---|
| Quant problems (target 10) | 25 |
| VARC sets (target 5) | 15 |
| LRDI sets (target 5) | 15 |
| VARC passage (target 1) | 10 |
| Study hours (target 5h) | 20 |
| Live class attended | 10 |
| VARC passage reading toggle | 5 |
| **Total** | **100** |
