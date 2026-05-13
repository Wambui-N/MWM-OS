-- ============================================================
-- Made With Make OS — Initial Schema
-- Run this in your Supabase SQL editor in order.
-- ============================================================

-- ── User preferences ────────────────────────────────────────
create table if not exists user_prefs (
  id               uuid primary key default gen_random_uuid(),
  user_email       text unique not null,
  work_start_time  text default '09:00',
  pomodoro_work_mins int default 25,
  pomodoro_break_mins int default 5,
  xp               int default 0,
  level            int default 1,
  streak_days      int default 0,
  last_active_date date,
  created_at       timestamptz default now()
);

-- ── Clients / Pipeline ──────────────────────────────────────
create table if not exists clients (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  company        text,
  email          text,
  service_type   text check (service_type in ('automation','web','both')),
  stage          text check (stage in ('lead','discovery','proposal_sent','negotiation','active','completed','lost')) default 'lead',
  value_ksh      numeric,
  source         text,
  last_contact   date,
  next_action    text,
  next_followup  date,
  notes          text,
  drive_folder_url text,
  created_at     timestamptz default now()
);

-- ── Projects ────────────────────────────────────────────────
create table if not exists projects (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid references clients(id) on delete set null,
  name             text not null,
  status           text check (status in ('active','paused','completed')) default 'active',
  start_date       date,
  due_date         date,
  milestones       jsonb default '[]',
  drive_folder_url text,
  notes            text,
  created_at       timestamptz default now()
);

-- ── Daily planning ──────────────────────────────────────────
create table if not exists daily_plans (
  id               uuid primary key default gen_random_uuid(),
  plan_date        date unique not null,
  ticks            jsonb default '[]',
  tasks            jsonb default '[]',
  projects         jsonb default '[]',
  schedule_sent_at timestamptz,
  gcal_synced      boolean default false,
  created_at       timestamptz default now()
);

-- ── Daily intentions ────────────────────────────────────────
create table if not exists daily_intentions (
  id              uuid primary key default gen_random_uuid(),
  intention_date  date unique not null,
  top_win         text,
  energy_level    int check (energy_level between 1 and 5),
  notes           text,
  created_at      timestamptz default now()
);

-- ── Content posts ────────────────────────────────────────────
create table if not exists content_posts (
  id             uuid primary key default gen_random_uuid(),
  platform       text default 'linkedin',
  hook           text,
  body           text,
  pillar         text,
  status         text check (status in ('draft','scheduled','posted')) default 'draft',
  scheduled_date date,
  gcal_event_id  text,
  created_at     timestamptz default now()
);

-- ── Pomodoro sessions ────────────────────────────────────────
create table if not exists pomodoro_sessions (
  id            uuid primary key default gen_random_uuid(),
  session_date  date not null,
  label         text,
  client_id     uuid references clients(id) on delete set null,
  duration_mins int not null,
  completed     boolean default true,
  created_at    timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- All tables use service-role access from server routes only.
-- The anon key cannot access these tables.
-- ============================================================

alter table user_prefs      enable row level security;
alter table clients         enable row level security;
alter table projects        enable row level security;
alter table daily_plans     enable row level security;
alter table daily_intentions enable row level security;
alter table content_posts   enable row level security;
alter table pomodoro_sessions enable row level security;

-- No policies needed for anon/authenticated — all access
-- is through the service role key on the server side.
-- If you want to add Supabase Auth in the future, add policies here.

-- ============================================================
-- Indexes for common query patterns
-- ============================================================

create index if not exists idx_clients_stage            on clients(stage);
create index if not exists idx_clients_last_contact     on clients(last_contact);
create index if not exists idx_clients_next_followup    on clients(next_followup);
create index if not exists idx_daily_plans_date         on daily_plans(plan_date);
create index if not exists idx_daily_intentions_date    on daily_intentions(intention_date);
create index if not exists idx_content_posts_status     on content_posts(status);
create index if not exists idx_content_posts_sched_date on content_posts(scheduled_date);
create index if not exists idx_pomodoro_date            on pomodoro_sessions(session_date);
create index if not exists idx_projects_status          on projects(status);
create index if not exists idx_projects_client_id       on projects(client_id);
