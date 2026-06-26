# Supabase Migration Plan

This plan now includes the Phase 1 backend migration foundation while keeping the frontend local-first.

## Phase 1 Implemented

Implemented after the frontend freeze audit:

- Migration file: `supabase/migrations/001_expand_conquer_cat_schema.sql`
- Mapper file: `server/mappers/conquerDailyLogMapper.js`
- Validation script: `scripts/validateDailyLogMapper.mjs`
- Package script: `npm test` now runs the mapper validation script.
- `/api/log/save` now accepts the current full frontend day object and maps it to expanded `daily_logs` columns plus `daily_food_entries`.
- `/api/log/all/:userId` now returns frontend-compatible day objects shaped like `defaultDay()`, including `foodEntries`.

No frontend behavior was changed. `localStorage` remains active and the app is not backend-authoritative yet.

Phase 1 route compatibility:

- Existing sparse payloads are still accepted through `dayData`.
- The save route also accepts `day`, `data`, or direct sparse day fields as a fallback.
- If Supabase is not configured, the routes keep the previous fallback behavior.
- If the expanded migration has not been applied yet, `/api/log/save` can fall back to the legacy daily log column subset.

Manual SQL step:

Run `supabase/migrations/001_expand_conquer_cat_schema.sql` in Supabase before expecting full-field persistence in production. The migration is additive and uses `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, and safe index/constraint creation.

Still not implemented in Phase 1:

- Frontend backend-first reads.
- Mastery progress APIs.
- Error log APIs.
- Backlog item APIs.
- Mentor message persistence API changes.
- Profile/auth/RLS migration.
- Assessment route changes.

## Existing Backend Coverage

The app already has partial server-backed persistence:
- `users`: profile/avatar/category/work/timetable/backlog fields through `/api/user/*`
- `daily_logs`: older daily study fields through `/api/log/save` and `/api/log/all/:userId`
- `academic_notes`: CRUD through `/api/academic-notes`
- `chat_messages` / mentor memory path through `/api/chat` and `/api/chat/history/:userId`
- Assessment tables through `/api/assessment/*`

The frontend has moved faster than the daily log schema. The next migration should expand schema before switching local-first features to backend-first reads.

## Proposed Tables

| Table | Purpose | Primary key | User key | Important columns | Constraints / indexes | RLS notes | Migration source |
|---|---|---|---|---|---|---|---|
| `profiles` | User identity, exam state, avatar, CAT profile | `id` | `id` or `auth_user_id` | `name`, `start_date`, `app_mode`, `interview_date`, `cat_result`, `cat_percentile`, `category`, `target_percentile`, avatar fields, work fields, `primary_degree` JSONB, `secondary_degrees` JSONB | Unique `id`; index `auth_user_id` if added | User can select/update only own row | `cat_user_name`, `cat_start_date`, `conquer_user_id`, profile keys |
| `user_settings` | UI/client preferences | `id` | `user_id` | `theme`, `selected_date`, `mentor_button_position`, `weekly_timetable` JSONB | Unique `user_id` | User owns row | `conquer_theme`, `cat_sel_date`, `mentor_btn_pos`, `conquer_timetable` |
| `daily_logs` | One row per user per date | `id` | `user_id` | `log_date`, sessions, practice counts, vitals, mission ids, effort score snapshot, journal, `iq_notes`, interview fields, `raw_day` JSONB | Unique `(user_id, log_date)`; index `(user_id, log_date desc)` | User owns rows | `cat_prep_data` |
| `daily_food_entries` | Food rows per daily log | `id` | `user_id` plus `daily_log_id` | `name`, `qty`, `calories`, `protein`, `carbs`, `fat`, `entry_order` | Index `daily_log_id`; cascade delete | User owns rows via daily log | `cat_prep_data[date].foodEntries` |
| `mastery_progress` | Chapter pillar booleans | `id` | `user_id` | `section_id`, `unit_id`, `chapter_id`, `learn_done`, `practice_done`, `error_log_done` | Unique `(user_id, chapter_id)`; index `(user_id, section_id)` | User owns rows | `conquer_mastery_progress_v1.*.pillars` |
| `chapter_configs` | Manual chapter workspace numbers | `id` | `user_id` | `chapter_id`, `learn_live_concept_total`, `learn_live_concept_done`, `application_classes_total`, `application_classes_done`, `assignments_total`, `assignments_done`, `total_practice_questions`, `questions_completed`, `error_log_count` | Unique `(user_id, chapter_id)` | User owns rows | `conquer_mastery_progress_v1.*.config` |
| `error_logs` | Mistake tracker | `id` | `user_id` | `date`, `section_id`, `unit_id`, `chapter_id`, `source`, `mistake_type`, `question_ref`, `my_mistake`, `correct_approach`, `takeaway`, `retry_status`, `fixed`, timestamps | Index `(user_id, fixed)`, `(user_id, chapter_id)`, `(user_id, retry_status)` | User owns rows | `conquer_error_log_v1` |
| `backlog_items` | iQuanta video/concept backlog | `id` | `user_id` | `item_type`, `text`, `checked`, `added_date`, `checked_date`, `watching`, `watching_started_at`, `sort_order` | Index `(user_id, item_type, checked)` | User owns rows | `conquer_backlog_videos`, `conquer_backlog_concepts`, legacy `conquer_backlog` |
| `academic_notes` | Free-form notes | `id` | `user_id` | `note_text`, timestamps | Index `(user_id, updated_at desc)` | User owns rows | Existing backend plus `conquer_academic_notes` fallback |
| `mentor_messages` | Persisted Mentor chat | `id` | `user_id` | `role`, `text`, `auto`, `source`, `context_snapshot` JSONB, `created_at` | Index `(user_id, created_at)` | User owns rows | `conquer_mentor_chat_v1`, `/api/chat/history` |
| `class_schedule` | Weekly iQuanta schedule | `id` | `user_id` | `weekday`, `topic`, `subtopic`, `app_same_as_live`, `app_topic`, `app_subtopic` | Unique `(user_id, weekday)` | User owns rows | `conquer_timetable` |
| `assessment_sessions` | Daily/weekly assessment session state | `id` | `user_id` | `session_date`, `session_type`, `questions`, `answers`, `current_index`, `completed`, timestamps | Unique `(user_id, session_date, session_type)` | User owns rows | Existing assessment backend, dynamic `conquer_assessment_*` |
| `assessment_attempts` | Per-question answer history | `id` | `user_id` | `session_id`, `question_id`, `topic`, `user_answer`, `correct_answer`, `is_correct`, `answered_at` | Index `(user_id, topic, answered_at)` | User owns rows | Existing `/api/assessment/answer` |
| `assessments` | Completed weekly summaries | `id` | `user_id` | `week_number`, `score`, `questions`, `answers`, `created_at` | Index `(user_id, week_number)` | User owns rows | Existing weekly completion path |

## Daily Log Column Checklist

Minimum daily log columns before backend-first daily migration:

- Identity: `user_id`, `log_date`
- Vitals/discipline: `wake_time`, `sleep_time`, `office_before_10`, `gym_done`, `gym_minutes`, `water_liters`, `content_posted`, `editing_under_1hr`
- Food summary: `calories`, `protein`, `carbs`, `fat`
- Session flags: `live_class`, `live_class_na`, `afternoon_session`, `afternoon_session_na`, `application_class`, `application_class_na`, `varc_passage`, `varc_passage_na`
- Study time: `practice_hrs`, `practice_mins`
- Practice counts: `quant`, `varc`, `lrdi`, `vp_count`
- Mission: `mission_section_id`, `mission_unit_id`, `mission_chapter_id`
- Score snapshot: `effort_score`, `effort_breakdown_v2` JSONB
- Journal/notes: `iq_notes`, `notes`
- Legacy/enrichment: `sudoku_done`, `sudoku_mins`, `sudoku_seconds`, `sudoku_difficulty`, `vedic_math_done`, `vedic_math_topic`, `cat_application_done`, `backlog` JSONB
- Interview mode: `mock_pi`, `wat_done`, `topics_revised`
- Safety: `raw_day` JSONB for unknown local fields during migration

## Client / API Operations Needed

| Operation | Suggested API or Supabase client call | Notes |
|---|---|---|
| Fetch daily log | `select daily_logs where user_id and log_date` | Normalize with `defaultDay()` on client until migration is complete |
| Update daily log | Upsert one `daily_logs` row; replace food entries transactionally | Keep optimistic local update |
| Fetch daily range | `select daily_logs where user_id and log_date between start/end` | Used by Progress and Calendar |
| Fetch mastery progress | Select `mastery_progress` and `chapter_configs` by user | Merge into current `conquer_mastery_progress_v1` shape |
| Update mastery pillar | Upsert `mastery_progress` by `(user_id, chapter_id)` | Tiny update path |
| Update chapter config | Upsert `chapter_configs` by `(user_id, chapter_id)` | Clamp done <= total in client and DB check if practical |
| Error log CRUD | Insert/update/delete/select `error_logs` | Preserve local ids or map them to UUIDs during migration |
| Backlog CRUD | Insert/update/delete/select `backlog_items` | Single table with `item_type` is simpler than two tables |
| Academic note CRUD | Existing `/api/academic-notes` can remain | Add conflict policy and timestamp comparison |
| Mentor persistence | Insert messages into `mentor_messages`; fetch recent thread | Store context snapshot for AI auditability |
| Profile/settings | Upsert `profiles` and `user_settings` | Decide auth/user-id model before RLS hardening |
| Assessment | Keep existing session/answer/progress/complete APIs | Retire local dynamic key when backend resume is reliable |

## RLS Baseline

For every user-owned table:
- Enable RLS.
- `select`, `insert`, `update`, and `delete` policies should restrict rows to the authenticated user.
- If the current deterministic `conquer_user_id` remains temporarily, server-side routes must enforce user ownership because client-side RLS cannot trust that id.

## Migration Order

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

## Cutover Rules

- Add schema first, then dual-write for one feature at a time.
- For each feature: migrate local key -> backend, read backend, compare with local, then keep local fallback for one release.
- Never delete local keys until the app can load the same data after refresh, device switch, and offline/failed backend responses.
- Progress should not become backend-authoritative until the score version decision is made.
