-- CONQUER CAT Phase 1 backend migration foundation.
-- Safe additive migration: creates missing tables, adds missing columns,
-- indexes, uniqueness constraints, and updated_at triggers.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  log_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_logs add column if not exists id uuid;
alter table public.daily_logs alter column id set default gen_random_uuid();
update public.daily_logs set id = gen_random_uuid() where id is null;

alter table public.daily_logs add column if not exists user_id text;
alter table public.daily_logs add column if not exists log_date date;
alter table public.daily_logs add column if not exists wake_time text default '';
alter table public.daily_logs add column if not exists sleep_time text default '';
alter table public.daily_logs add column if not exists live_class boolean default false;
alter table public.daily_logs add column if not exists live_class_na boolean default false;
alter table public.daily_logs add column if not exists afternoon_session boolean default false;
alter table public.daily_logs add column if not exists afternoon_session_na boolean default false;
alter table public.daily_logs add column if not exists application_class boolean default false;
alter table public.daily_logs add column if not exists application_class_na boolean default false;
alter table public.daily_logs add column if not exists varc_passage boolean default false;
alter table public.daily_logs add column if not exists varc_passage_na boolean default false;
alter table public.daily_logs add column if not exists varc_passage_count integer default 0;
alter table public.daily_logs add column if not exists practice_hrs integer default 0;
alter table public.daily_logs add column if not exists practice_mins integer default 0;
alter table public.daily_logs add column if not exists quant integer default 0;
alter table public.daily_logs add column if not exists varc integer default 0;
alter table public.daily_logs add column if not exists lrdi integer default 0;
alter table public.daily_logs add column if not exists sudoku_done boolean default false;
alter table public.daily_logs add column if not exists sudoku_mins integer default 0;
alter table public.daily_logs add column if not exists sudoku_seconds integer default 0;
alter table public.daily_logs add column if not exists sudoku_difficulty text default 'medium';
alter table public.daily_logs add column if not exists vedic_math_done boolean default false;
alter table public.daily_logs add column if not exists vedic_math_topic text default '';
alter table public.daily_logs add column if not exists cat_application_done boolean default false;
alter table public.daily_logs add column if not exists iq_notes text default '';
alter table public.daily_logs add column if not exists notes text default '';
alter table public.daily_logs add column if not exists office_before_10 boolean default false;
alter table public.daily_logs add column if not exists gym_done boolean default false;
alter table public.daily_logs add column if not exists gym_minutes integer default 0;
alter table public.daily_logs add column if not exists water_liters numeric default 0;
alter table public.daily_logs add column if not exists content_posted boolean default false;
alter table public.daily_logs add column if not exists editing_under_1hr boolean default false;
alter table public.daily_logs add column if not exists calories numeric default 0;
alter table public.daily_logs add column if not exists protein numeric default 0;
alter table public.daily_logs add column if not exists carbs numeric default 0;
alter table public.daily_logs add column if not exists fat numeric default 0;
alter table public.daily_logs add column if not exists mission_section_id text default '';
alter table public.daily_logs add column if not exists mission_unit_id text default '';
alter table public.daily_logs add column if not exists mission_chapter_id text default '';
alter table public.daily_logs add column if not exists effort_score integer default 0;
alter table public.daily_logs add column if not exists effort_breakdown_v2 jsonb;
alter table public.daily_logs add column if not exists mock_pi boolean default false;
alter table public.daily_logs add column if not exists wat_done boolean default false;
alter table public.daily_logs add column if not exists topics_revised text default '';
alter table public.daily_logs add column if not exists raw_day jsonb not null default '{}'::jsonb;
alter table public.daily_logs add column if not exists created_at timestamptz not null default now();
alter table public.daily_logs add column if not exists updated_at timestamptz not null default now();

-- Legacy compatibility columns that older server code may have used.
alter table public.daily_logs add column if not exists vp_count integer default 0;
alter table public.daily_logs add column if not exists backlog jsonb not null default '[]'::jsonb;

do $$
declare
  id_attnum smallint;
  has_id_key boolean;
begin
  select attnum into id_attnum
  from pg_attribute
  where attrelid = 'public.daily_logs'::regclass
    and attname = 'id'
    and not attisdropped;

  select exists (
    select 1
    from pg_constraint
    where conrelid = 'public.daily_logs'::regclass
      and contype in ('p', 'u')
      and conkey = array[id_attnum]
  ) into has_id_key;

  if id_attnum is not null and not has_id_key then
    alter table public.daily_logs add constraint daily_logs_id_key unique (id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.daily_logs'::regclass
      and conname = 'daily_logs_user_id_log_date_key'
  ) then
    alter table public.daily_logs
      add constraint daily_logs_user_id_log_date_key unique (user_id, log_date);
  end if;
end;
$$;

create index if not exists daily_logs_user_log_date_desc_idx
  on public.daily_logs (user_id, log_date desc);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_daily_logs_updated_at'
  ) then
    create trigger set_daily_logs_updated_at
    before update on public.daily_logs
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.daily_food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  entry_id text,
  name text default '',
  qty text default '',
  calories numeric default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  entry_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_food_entries_daily_log_id_idx
  on public.daily_food_entries (daily_log_id);
create index if not exists daily_food_entries_user_id_idx
  on public.daily_food_entries (user_id);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_daily_food_entries_updated_at'
  ) then
    create trigger set_daily_food_entries_updated_at
    before update on public.daily_food_entries
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.mastery_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  section_id text default '',
  unit_id text default '',
  chapter_id text not null,
  learn_done boolean not null default false,
  practice_done boolean not null default false,
  error_log_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.mastery_progress'::regclass
      and conname = 'mastery_progress_user_chapter_key'
  ) then
    alter table public.mastery_progress
      add constraint mastery_progress_user_chapter_key unique (user_id, chapter_id);
  end if;
end;
$$;

create index if not exists mastery_progress_user_section_idx
  on public.mastery_progress (user_id, section_id);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_mastery_progress_updated_at'
  ) then
    create trigger set_mastery_progress_updated_at
    before update on public.mastery_progress
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.chapter_configs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  chapter_id text not null,
  learn_live_concept_total integer not null default 0,
  learn_live_concept_done integer not null default 0,
  application_classes_total integer not null default 0,
  application_classes_done integer not null default 0,
  assignments_total integer not null default 0,
  assignments_done integer not null default 0,
  total_practice_questions integer not null default 0,
  questions_completed integer not null default 0,
  error_log_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.chapter_configs'::regclass
      and conname = 'chapter_configs_user_chapter_key'
  ) then
    alter table public.chapter_configs
      add constraint chapter_configs_user_chapter_key unique (user_id, chapter_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_chapter_configs_updated_at'
  ) then
    create trigger set_chapter_configs_updated_at
    before update on public.chapter_configs
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  client_id text,
  date date,
  section_id text default '',
  unit_id text default '',
  chapter_id text default '',
  source text default '',
  mistake_type text default '',
  question_ref text default '',
  my_mistake text default '',
  correct_approach text default '',
  takeaway text default '',
  retry_status text default 'Not retried',
  fixed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists error_logs_user_fixed_idx
  on public.error_logs (user_id, fixed);
create index if not exists error_logs_user_chapter_idx
  on public.error_logs (user_id, chapter_id);
create index if not exists error_logs_user_retry_status_idx
  on public.error_logs (user_id, retry_status);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_error_logs_updated_at'
  ) then
    create trigger set_error_logs_updated_at
    before update on public.error_logs
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

create table if not exists public.backlog_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  client_id text,
  item_type text not null,
  text text not null default '',
  checked boolean not null default false,
  added_date date,
  checked_date date,
  watching boolean not null default false,
  watching_started_at timestamptz,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists backlog_items_user_type_checked_idx
  on public.backlog_items (user_id, item_type, checked);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_backlog_items_updated_at'
  ) then
    create trigger set_backlog_items_updated_at
    before update on public.backlog_items
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.chat_messages') is not null then
    execute 'alter table public.chat_messages add column if not exists user_id text';
    execute 'alter table public.chat_messages add column if not exists role text';
    execute 'alter table public.chat_messages add column if not exists text text';
    execute 'alter table public.chat_messages add column if not exists content text';
    execute 'alter table public.chat_messages add column if not exists auto boolean not null default false';
    execute 'alter table public.chat_messages add column if not exists source text default ''mentor''';
    execute 'alter table public.chat_messages add column if not exists context_snapshot jsonb';
    execute 'alter table public.chat_messages add column if not exists created_at timestamptz not null default now()';
    execute 'create index if not exists chat_messages_user_created_idx on public.chat_messages (user_id, created_at)';
  else
    create table if not exists public.mentor_messages (
      id uuid primary key default gen_random_uuid(),
      user_id text not null,
      role text not null,
      text text,
      content text,
      auto boolean not null default false,
      source text default 'mentor',
      context_snapshot jsonb,
      created_at timestamptz not null default now()
    );

    create index if not exists mentor_messages_user_created_idx
      on public.mentor_messages (user_id, created_at);
  end if;
end;
$$;

