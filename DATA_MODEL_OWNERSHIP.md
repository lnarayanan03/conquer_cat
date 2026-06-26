# Data Model Ownership

This document maps frontend ownership before the backend migration.

## `defaultDay()` Shape

Current default day fields from `src/App.jsx`:

```js
{
  wt: "", st: "",
  lc: false, lc_na: false,
  as: false, as_na: false,
  ap: false, ap_na: false,
  vp: false, vp_na: false, vp_count: 0,
  ph: 0, pm: 0,
  ah: 0, eh: 0,
  q: 0, v: 0, l: 0,
  sk: false, skm: 0, sks: 0, skd: "medium",
  vm: false, vmt: "",
  ca: false,
  iq: "", n: "", backlog: [],
  officeBefore10: false,
  gymDone: false, gymMinutes: 0,
  waterLiters: 0,
  contentPosted: false, editingUnder1Hr: false,
  calories: 0, protein: 0, carbs: 0, fat: 0,
  foodEntries: [],
  missionSectionId: "", missionUnitId: "", missionChapterId: "",
  effortScore: 0, effortBreakdownV2: null,
}
```

## Field Ownership

| Group | Fields | Type | UI owner | Effort Score v2 reads | Progress reads | Store in Supabase |
|---|---|---|---|---|---|---|
| Sleep | `wt`, `st` | Time strings | `VitalsPage`; Today displays snapshot | Yes | Old `effortScore()` reads both | Yes |
| Discipline habits | `officeBefore10`, `gymDone`, `gymMinutes`, `waterLiters`, `contentPosted`, `editingUnder1Hr` | Boolean/number | `VitalsPage`; Today displays subset | Yes, except `gymMinutes` only affects display | Old Progress score reads `gymDone` only indirectly? Current old score does not read these v2 fields except sleep | Yes |
| Food summary | `calories`, `protein`, `carbs`, `fat` | Numbers | `VitalsPage` | `calories` is fallback for food score | No | Yes |
| Food entries | `foodEntries` | Array `{ id, name, qty, calories, protein, carbs, fat }` | `VitalsPage` | Yes, presence and calories | No | Yes, separate table |
| Class/session flags | `lc`, `lc_na`, `as`, `as_na`, `ap`, `ap_na`, `vp`, `vp_na` | Booleans | `DailyWorkPage`; Today displays session count | No direct v2 session score | Old Progress score reads session flags and N/A flags | Yes |
| Study time | `ph`, `pm` | Numbers | `DailyWorkPage` | No | Old Progress score and study hours read both | Yes |
| Practice counts | `q`, `v`, `l`, `vp_count` | Numbers | `DailyWorkPage`; Today displays snapshot | Yes: `q`, `v`, `l` | Yes: totals, calendar, old score | Yes |
| Today mission | `missionSectionId`, `missionUnitId`, `missionChapterId` | Syllabus id strings | `TodayPage` | Yes | No | Yes |
| Effort snapshot | `effortScore`, `effortBreakdownV2` | Number/object | Today save writes snapshot | Function returns values; field is saved snapshot | Progress does not read v2 snapshot | Yes |
| Journal | `n` | String | `TodayPage` | No | No | Yes |
| iQuanta daily note | `iq` | String | Legacy Today save text; iQuanta hub has handler but no current visible editor | No | No | Yes |
| CAT application | `ca` | Boolean | `TodayPage` during application window | No in v2 currently | Calendar marks app due; old score reads it | Yes |
| Sudoku | `sk`, `skm`, `sks`, `skd` | Boolean/numbers/string | `TodayPage` | No | Old score reads `sk`; save message reads time/difficulty | Optional/legacy yes |
| Vedic math | `vm`, `vmt` | Boolean/string | `TodayPage` | No | Old score reads `vm`; save message reads topic | Optional/legacy yes |
| Backlog legacy on day | `backlog` | Array | No current primary UI owner; backlog has separate app state | No | Old score accepts `day.backlog` fallback | Prefer migrate to `backlog_items`; preserve raw field first |
| Legacy interview counters | `ah`, `eh` | Numbers | No clear current owner | No | No | Store only in `raw_day` unless usage returns |

Additional fields are created by interview mode UI but are not in `defaultDay()`:

| Field | Type | UI owner | Notes |
|---|---|---|---|
| `mockPI` | Boolean | `DailyWorkPage` in interview mode | Add to backend schema if interview mode remains active |
| `watDone` | Boolean | `DailyWorkPage` in interview mode | Add to backend schema if interview mode remains active |
| `topicsRevised` | String | `DailyWorkPage` in interview mode | Add to backend schema if interview mode remains active |

## Feature Ownership Map

| Feature | Owner | Should display | Should write | Notes |
|---|---|---|---|---|
| Today dashboard | `TodayPage` | Snapshot cards, mission selector, quick launch cards, journal, save | Selected day quick fields it directly owns: mission, journal, sudoku, vedic math, CAT application | Today should not become the full editor for every model |
| Vitals | `VitalsPage` | Full discipline/vitals editor | Sleep, habits, water, food | Backend daily migration must prioritize this because v2 depends on it |
| Daily Work | `DailyWorkPage` | Sessions, practice, study time, interview prep | Session flags, N/A flags, practice counts, time, interview fields | Progress and Calendar read this heavily |
| iQuanta Hub | `IQuantaHubPage` | Hub dashboard and links | Currently no direct visible editor except navigation | Backlog, notes, timetable remain separate subpages |
| Backlog | `BacklogPage` | Video/concept backlog list | Backlog CRUD and watching status | Do not mix with daily `backlog` array except migration fallback |
| Academic Notes | `NotesPage` | Notes list/editor | Notes CRUD | Already partly backend-backed |
| Timetable | `TimetablePage` | Weekly class schedule | Weekly timetable | Used by Today labels and missed-live-class backlog behavior |
| Error Log | `ErrorLogPage` | Mistake tracker | Error CRUD | Mastery and Mentor read this |
| Mastery Map | `MasteryMapPage` and `ChapterWorkspace` | Syllabus, pillars, chapter config | Pillar toggles and config numbers | Chapter progress remains based on 3 pillars |
| Mentor | `ChatPage`, `FloatingMentor` | Coaching and chat | Mentor messages only | Should read context, not own prep data |
| Progress | `ProgressPage` | Aggregates and trend | No prep data writes | Still uses old effort score |
| Profile | `ProfilePage`, `ProfileEditPage`, `AcademicProfilePage`, `SecondaryDegreesPage` | Identity, avatar, settings, target/IIM calculator | Profile/settings fields | Auth migration needed before strict RLS |

## Duplicate / Repeated Ownership Risks

- Today and Vitals both show discipline; Vitals is the editor and Today should remain a snapshot/launcher.
- Today and Daily Work both show work progress; Daily Work is the editor.
- Today Mission and Mastery Map both display chapter pillars; Mastery Map owns pillar/config writes, while Today owns selecting the daily mission.
- Error count appears in Mastery config and separate Error Log tracker. v2 currently reads `chapter_configs.errorLogCount`, not the tracker count.
- Backlog exists both as separate backlog state and legacy `day.backlog`. The separate backlog arrays are current owner.
- Mentor exists in two implementations: full-page local contextual mentor and floating `/api/chat` mentor.
- Progress uses old effort score, while Today and full Mentor use v2.

## Mastery Data Model

Current local shape under `conquer_mastery_progress_v1`:

```js
{
  [chapterId]: {
    pillars: {
      learn: boolean,
      practice: boolean,
      errorLog: boolean
    },
    config: {
      learnLiveConceptTotal: number,
      learnLiveConceptDone: number,
      applicationClassesTotal: number,
      applicationClassesDone: number,
      assignmentsTotal: number,
      assignmentsDone: number,
      totalPracticeQuestions: number,
      questionsCompleted: number,
      errorLogCount: number
    }
  }
}
```

Chapter progress is still:

```text
completed pillars / 3
```

Config counts are displayed and used by Effort Score v2, but they do not directly change the chapter progress percent.

