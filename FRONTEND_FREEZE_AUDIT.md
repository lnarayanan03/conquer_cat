# CONQUER CAT Frontend Freeze Audit

Audit date: 2026-06-27

Scope audited:
- `src/App.jsx`
- `src/App.css` at a high level for page/layout ownership only
- `server.js` API boundaries that the frontend already calls

This audit is documentation-only. No Supabase integration, backend changes, UI rewrites, nav edits, or data model changes were made.

## Route / Page Audit

Primary sidebar nav currently exposes `today`, `mastery`, `progress`, `calendar`, and `chat`. Mobile bottom nav exposes `today`, `mastery`, `progress`, `calendar`, `chat`, and `profile`. Other routes are internal tabs opened from cards/buttons.

| Route / tab | Component | Reads | Writes | localStorage keys involved | Supabase-backed later |
|---|---|---|---|---|---|
| `today` | `TodayPage` | Selected day from `data[sel]`, totals, backlog videos/concepts, academic notes, timetable labels, mastery progress, profile/avatar/theme | Day fields through `upd()`, save action calls `/api/log/save`, auto mentor message, missed live class can add backlog video | `cat_prep_data`, `cat_sel_date`, `conquer_backlog_videos`, `conquer_backlog_concepts`, `conquer_mastery_progress_v1`, `conquer_mentor_chat_v1` | Yes: `daily_logs`, `daily_food_entries`, `mastery_progress`, `chapter_configs`, `backlog_items`, `mentor_messages` |
| `vitals` | `VitalsPage` | Selected day vitals and food fields | Sleep/wake, office, gym, water, food entries/macros, content/editing discipline | `cat_prep_data` | Yes: `daily_logs`, `daily_food_entries` |
| `daily-work` | `DailyWorkPage` | Selected day session/practice/interview fields and timetable labels | Live/application/session flags, practice counters, personal practice time, interview prep fields | `cat_prep_data` | Yes: `daily_logs` |
| `iquanta` | `IQuantaHubPage` | Backlog videos/concepts, academic notes, selected day `iq`, timetable/assessment status | Navigates to backlog/timetable/assessment/notes; `onIqChange` exists but no visible input in the current hub | `conquer_backlog_videos`, `conquer_backlog_concepts`, `conquer_academic_notes`, `conquer_timetable`, `cat_prep_data` | Yes: `backlog_items`, `academic_notes`, `class_schedule`, `daily_logs.iq_notes` |
| `error-log` | `ErrorLogPage` | Error entries, syllabus, optional mastery prefill | Add/update/delete error entries | `conquer_error_log_v1` | Yes: `error_logs` |
| `mastery` | `MasteryMapPage`, `ChapterWorkspace` | CAT syllabus, mastery progress, error log counts by chapter | Chapter pillar toggles and chapter config values | `conquer_mastery_progress_v1`, reads `conquer_error_log_v1` state | Yes: `mastery_progress`, `chapter_configs`, optional relationship to `error_logs` |
| `progress` | `ProgressPage` | All daily logs in `data`, totals, backlog videos/concepts | No data writes; can navigate to `insta` | `cat_prep_data`, `conquer_backlog_videos`, `conquer_backlog_concepts` | Yes: read aggregates from `daily_logs`; keep score definition explicit |
| `calendar` | `CalendarPage` | Daily log map, selected date, start date, total days | Selected date only | `cat_prep_data`, `cat_sel_date`, `cat_start_date` | Yes: read `daily_logs`; selected date can stay client-only |
| `profile` | `ProfilePage` | User/profile state, avatar, theme, category, degrees, work experience, target percentile | Theme, category, target percentile; navigates to profile subroutes | `conquer_theme`, `cat_*` profile keys, `conquer_user_id` | Yes: `profiles` / `user_settings` |
| `profile-edit` | `ProfileEditPage` | User id/name/start date/avatar | Avatar changes; PIN change creates new deterministic user id through `/api/user/init` | `conquer_user_id`, `cat_avatar_*` | Yes: `profiles`; PIN/user-id model needs a deliberate auth migration |
| `academic-profile` | `AcademicProfilePage` | Degree/work profile and calculated IIM profile | Primary degree, secondary degrees, work experience; saves through `/api/user/update` | `cat_primary_degree`, `cat_secondary_degrees`, `cat_work_*` | Yes: `profiles` |
| `secondary-degrees` | `SecondaryDegreesPage` | Secondary degrees | Adds/removes degree objects | `cat_secondary_degrees` | Yes: `profile_degrees` or JSONB on `profiles` |
| `chat` / mentor | `ChatPage` | Mentor messages, selected day, totals, mastery progress, error log, backlog, notes, avatar | Adds local user/AI messages using local CAT mentor reply function | `conquer_mentor_chat_v1` | Yes: `mentor_messages`; context should be rebuilt from backend data |
| Floating mentor | `FloatingMentor` | Mentor messages, today's data, totals, profile, active tab | Sends `/api/chat`; stores draggable button position | `conquer_mentor_chat_v1`, `mentor_btn_pos` | Yes: `mentor_messages`; position can stay user setting/local |
| `notes` | `NotesPage` | Academic notes | Create/update/delete notes through `/api/academic-notes`; local fallback is still written | `conquer_academic_notes`, `conquer_academic_notes_migrated_${userId}` | Already partly backed; keep `academic_notes` |
| `backlog` | `BacklogPage` | Backlog video and concept arrays | Add/toggle/delete/set watching for video/concept backlog | `conquer_backlog_videos`, `conquer_backlog_concepts`, legacy `conquer_backlog` read | Yes: `backlog_items` |
| `timetable` | `TimetablePage` | Weekly timetable | Saves timetable locally and to `/api/user/update` | `conquer_timetable` | Yes: `class_schedule` or `user_settings.weekly_timetable` |
| `assessment` | `AssessmentPage` | User id, server assessment session, questions, answers | Writes local dynamic session key and calls assessment APIs | `conquer_assessment_${userId || "local"}_${assessmentDate}_${sessionType}` | Already backend-dependent; use `assessment_sessions`, `assessment_attempts`, `daily_question_log`, `assessments` |
| `insta` | `InstaCard` | Current day, totals, user/avatar/theme, effort score | No persistent writes | Source keys only | No table needed; reads Supabase-backed source data |
| onboarding | `OnboardingScreen` | New/returning user input and `/api/user/check` | Creates local user/profile keys and calls `/api/user/init` | `cat_start_date`, `cat_user_name`, `conquer_user_id`, `cat_avatar_*`, `cat_category`, `cat_primary_degree` | Yes: auth/profiles |
| results / interview onboarding | `ResultsScreen`, `InterviewOnboarding` | Exam passed state, CAT result | CAT result, percentile, interview date, app mode | `cat_result`, `cat_percentile`, `app_mode`, `interview_date` | Yes: `profiles` / `user_settings` |

## Current Backend Touchpoints

The frontend already calls these server routes:
- User/profile: `/api/user/check`, `/api/user/init`, `/api/user/update`
- Daily logs: `/api/log/save`, `/api/log/all/:userId`
- Academic notes: `/api/academic-notes` CRUD
- Mentor: `/api/chat`, `/api/chat/history/:userId`, `/api/mentor/greet`
- Assessment: `/api/assessment/session/:userId`, `/api/assessment/answer`, `/api/assessment/progress`, `/api/assessment/complete`

Backend coverage is partial. Daily log sync currently stores the older study fields but not the full current `defaultDay()` model.

## Effort Score v2 Dependency Audit

`calculateEffortScoreV2({ dayData, masteryProgress, date })` reads:

| Score block | Max | Reads | Logic |
|---|---:|---|---|
| Learn | 30 | `missionChapterId`, `masteryProgress[missionChapterId].pillars.learn`, `config.learnLiveConceptTotal`, `config.learnLiveConceptDone` | 5 points for selecting a mission, 15 for Learn pillar, up to 10 from learn class completion. If no learn total exists, a completed Learn pillar gives fallback points. |
| Practice | 25 | `missionSectionId`, `q`, `v`, `l` | Mission section gets main target weight. Main target is 10; other targets are 5 each. If no mission section is selected, uses a fallback mix. |
| Error Log | 15 | `missionChapterId`, `masteryProgress[missionChapterId].config.errorLogCount`, `pillars.errorLog` | Error count gives 2 points each capped at 10; Error Log pillar gives 5. It does not read the separate error-log tracker array. |
| Discipline | 30 | `st`, `wt`, `officeBefore10`, `gymDone`, `waterLiters`, `foodEntries`, `calories`, `contentPosted`, `editingUnder1Hr` | Sleep gives 6 if duration meets target; weekday target is 5h, weekend target is 8h. Office 5, gym 5, water up to 4, food 4, content 3, editing 3. |

Important: v2 uses `getSleepDuration(day.st, day.wt)`. The Today dashboard display uses previous day's sleep time when available. That difference should be resolved before backend score snapshots become authoritative.

## Risks Found

| Risk | Impact | Recommendation |
|---|---|---|
| Daily Supabase sync is incomplete for the current frontend model | Fields like mission, discipline v2, water, food, gym, content/editing, N/A flags, and v2 score snapshots are local-only | Expand `daily_logs` schema before making backend authoritative |
| `ProgressPage` still uses the old `effortScore()` | Progress chart can disagree with Today/Mentor v2 score | Decide whether Progress intentionally remains legacy or migrate after daily schema is complete |
| `ChatPage` and `FloatingMentor` use different mentor paths | Full Mentor uses local v2 context; floating mentor calls `/api/chat` with older context | Unify context contract before persisting mentor messages as authoritative |
| `buildMentorContext()` uses `sec.name`, `unit.name`, and `ch.name`, but syllabus objects use `label` | Mission names and incomplete chapter names can become undefined in Mentor context | Fix in a small frontend patch before backend migration or include in freeze bug list |
| `conquer_assessment_*` is written but not read by current assessment loading | Stale local assessment state may confuse migration | Either remove after backend is stable or formally support local fallback |
| Academic notes have local fallback plus backend sync | Backend empty/local non-empty migration is handled once, but conflict policy is simple | Use timestamps and server ids during migration |
| Backlog has legacy `conquer_backlog` read path | Old users can still be migrated, but it is not written anymore | Keep one migration pass, then retire the legacy key |
| `cat_prep_data` may contain old and new day shapes | Backend merge can overwrite rich local fields with older sparse server rows | Normalize per-day objects during migration and on backend load |
| Profile identity is derived from name + 4 digit PIN | Not a durable auth model for Supabase RLS | Keep a separate auth/user identity plan before strict RLS |

## Recommended Backend Migration Order

1. Schema only
2. Daily logs
3. Mastery progress
4. Error logs
5. Backlog
6. Academic notes
7. Mentor messages
8. Profile/settings
9. Assessments
10. Cleanup localStorage fallback

