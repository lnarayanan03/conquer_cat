# Local Storage Map

This map covers every `localStorage.getItem`, `setItem`, and `removeItem` found in `src/App.jsx`.

## Keys

| Key | Shape | Read in | Written in | Migration priority | Proposed Supabase target |
|---|---|---|---|---|---|
| `cat_prep_data` | Object keyed by `YYYY-MM-DD`; value is a day log similar to `defaultDay()` | App state init, Today/Progress/Calendar through `data` | `useEffect` on `data` | High | `daily_logs`, `daily_food_entries` |
| `cat_sel_date` | Date string `YYYY-MM-DD` | App selected date init | `useEffect` on `sel` | Low | Client preference or no table |
| `cat_start_date` | Date string `YYYY-MM-DD` | App bootstrap, onboarding/session checks | Onboarding; removed on reset/logout-like paths | High | `profiles.start_date` |
| `cat_user_name` | String | App bootstrap | Onboarding; removed on reset/logout-like paths | High | `profiles.name` |
| `conquer_user_id` | Deterministic UUID-like string from name + PIN | App bootstrap, onboarding/profile | Onboarding, return flow, PIN change; removed when invalid | High | `profiles.id` now; later auth user id |
| `app_mode` | `"prep"` or `"interview"` | App bootstrap | Interview onboarding/results | Medium | `user_settings.app_mode` |
| `interview_date` | Date string | App bootstrap | Interview onboarding | Medium | `profiles.interview_date` |
| `cat_result` | `"cracked"` or `"missed"` | App bootstrap | Results screen | Medium | `profiles.cat_result` |
| `cat_percentile` | String/number-like percentile | App bootstrap | Results screen | Medium | `profiles.cat_percentile` |
| `conquer_theme` | `"dark"` or `"light"` | App theme init | Theme effect/Profile | Low | `user_settings.theme` |
| `mentor_btn_pos` | Object `{ x, y }` | `FloatingMentor` init | `FloatingMentor` drag end | Low | `user_settings.mentor_button_position` or local only |
| `mentor_greeted_today` | Date string `YYYY-MM-DD` | App greeting state | Mentor history/greeting/reminder flows; removed when no history or reset | Low | `mentor_messages` can replace; otherwise local only |
| `conquer_mentor_chat_v1` | Array of messages `{ r, t, auto?, loading? }` | App mentor state init | `useEffect` on `mentorMessages` | High | `mentor_messages` |
| `conquer_mastery_progress_v1` | Object keyed by `chapterId`; value `{ pillars, config }` | `readMasteryProgress()` | `useEffect` on `masteryProgress` | High | `mastery_progress`, `chapter_configs` |
| `conquer_error_log_v1` | Array of error entries | App error log state init | `useEffect` on `errorLog` | High | `error_logs` |
| `conquer_backlog` | Legacy array of video backlog items | Backlog video init only, as fallback if new key absent | Not written currently | Medium | One-time migration to `backlog_items` |
| `conquer_backlog_videos` | Array of backlog items `{ id, text, checked, addedDate, checkedDate, watching, watchingStartedAt }` | Backlog video init and backend refresh | Backlog effect, backend load | High | `backlog_items` with `item_type = 'video'` |
| `conquer_backlog_concepts` | Same backlog item shape | Backlog concept init and backend refresh | Backlog effect, backend load | High | `backlog_items` with `item_type = 'concept'` |
| `conquer_academic_notes` | Array of notes `{ id, user_id?, note_text, created_at, updated_at }`; older `{ text, createdAt }` normalized | Notes init and fallback migration | Notes effect | Medium | `academic_notes` |
| `conquer_academic_notes_migrated_${userId}` | String flag `"1"` | Academic notes migration guard | Set after local notes are copied to backend | Low | Migration metadata or retire after migration |
| `conquer_timetable` | Object keyed by weekday; value `{ topic, subtopic, appSameAsLive, appTopic, appSubtopic }` | Timetable init and backend load | Timetable effect and backend load | Medium | `class_schedule` or `user_settings.weekly_timetable` |
| `conquer_reminder_${YYYY-MM-DD}` | String flag `"1"` | Reminder effect | Reminder effect | Low | Local only or `user_reminders` |
| `conquer_assessment_${userId || "local"}_${assessmentDate}_${sessionType}` | Assessment progress object `{ date, type, currentIdx, answers, completed, ... }` | Not read by current code | `AssessmentPage.persistProgress()` | Medium | `assessment_sessions`, `assessment_attempts`; retire local key if backend remains required |
| `cat_avatar_gender` | String | App/profile/onboarding | Avatar effects, onboarding, backend load | Medium | `profiles.avatar_gender` |
| `cat_avatar_skin` | String | App/profile/onboarding | Avatar effects, onboarding, backend load | Medium | `profiles.avatar_skin` |
| `cat_avatar_hair` | String | App/profile/onboarding | Avatar effects, onboarding, backend load | Medium | `profiles.avatar_hair` |
| `cat_avatar_hair_color` | String | App/profile/onboarding | Avatar effects, onboarding, backend load | Medium | `profiles.avatar_hair_color` |
| `cat_avatar_shirt` | String | App/profile/onboarding | Avatar effects, onboarding, backend load | Medium | `profiles.avatar_shirt` |
| `cat_avatar_glasses` | Boolean string `"true"` / `"false"` | App/profile/onboarding | Avatar effects, onboarding, backend load | Medium | `profiles.avatar_glasses` |
| `cat_avatar_beard` | Boolean string | App/profile/onboarding | Avatar effects, onboarding, backend load | Medium | `profiles.avatar_beard` |
| `cat_avatar_mustache` | Boolean string | App/profile/onboarding | Avatar effects, onboarding, backend load | Medium | `profiles.avatar_mustache` |
| `cat_category` | String category | App/profile/onboarding | Category effect/onboarding/backend load | Medium | `profiles.category` |
| `cat_primary_degree` | Object `{ type, field, college, gpa, year, gpaScale }` | App/profile/onboarding | Profile effect/onboarding/backend load | Medium | `profiles.primary_degree` JSONB or `profile_degrees` |
| `cat_secondary_degrees` | Array of degree objects | App/profile | Profile effect | Medium | `profile_degrees` or JSONB |
| `cat_work_years` | Number string | App/profile | Profile effect | Medium | `profiles.work_experience_years` |
| `cat_work_months` | Number string | App/profile | Profile effect | Medium | `profiles.work_experience_months` |
| `cat_work_company` | String | App/profile | Profile effect | Medium | `profiles.work_company` |
| `cat_work_role` | String | App/profile | Profile effect | Medium | `profiles.work_role` |
| `cat_target_pct` | Number string | App/profile | Target percentile effect and backend load | Medium | `profiles.target_percentile` |

## Key Groups

High priority for backend migration:
- `cat_prep_data`
- `conquer_mastery_progress_v1`
- `conquer_error_log_v1`
- `conquer_backlog_videos`
- `conquer_backlog_concepts`
- `conquer_mentor_chat_v1`
- `conquer_user_id`, `cat_start_date`, `cat_user_name`

Medium priority:
- Academic notes because they are already partly backend-backed but still have fallback conflict risk.
- Profile, avatar, target percentile, timetable, assessment local progress.

Low priority:
- UI-only preferences and one-day flags: `cat_sel_date`, `conquer_theme`, `mentor_btn_pos`, `mentor_greeted_today`, reminder flags.

## Migration Notes

- Keep a local fallback until each table has read-after-write verification.
- For `cat_prep_data`, migrate by date and preserve unknown fields in a JSONB `raw_day` column during the first pass.
- For `conquer_mastery_progress_v1`, split pillar booleans and numeric config into separate tables or one table with clear columns.
- For `conquer_error_log_v1`, keep `chapterId` as a stable syllabus id, not a display label.
- For `conquer_assessment_*`, decide whether local fallback still matters. Current code writes the key but does not read it.

