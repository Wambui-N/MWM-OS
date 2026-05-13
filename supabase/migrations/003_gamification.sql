-- ============================================================
-- Made With Make OS — Gamification Layer
-- ============================================================

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text default '✓',
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  log_date date not null,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(habit_id, log_date)
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  emoji text default '🎁',
  trigger_type text check (trigger_type in (
    'xp_milestone', 'posting_streak', 'habit_streak',
    'weekly_score', 'project_closed', 'perfect_days', 'custom'
  )) not null,
  trigger_threshold numeric not null,
  trigger_habit_id uuid references habits(id),
  is_recurring boolean default false,
  recurrence text check (recurrence in ('weekly', 'monthly')),
  is_active boolean default true,
  claimed_at timestamptz,
  last_reset_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  week_start date unique not null,
  shipped text,
  biggest_win text,
  blocker text,
  next_priority text,
  xp_awarded boolean default false,
  created_at timestamptz default now()
);

create table if not exists weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  week_start date unique not null,
  challenge_text text not null,
  trigger_type text not null,
  trigger_threshold numeric not null,
  current_progress numeric default 0,
  completed boolean default false,
  xp_bonus int default 75,
  created_at timestamptz default now()
);

create table if not exists boss_battles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  label text not null,
  total_milestones int not null,
  completed_milestones int default 0,
  is_won boolean default false,
  won_at timestamptz,
  created_at timestamptz default now()
);

-- Add columns to existing tables
alter table user_prefs
  add column if not exists posting_streak int default 0,
  add column if not exists posting_streak_best int default 0,
  add column if not exists posting_streak_freeze_count int default 1,
  add column if not exists last_complete_post_week date,
  add column if not exists monthly_revenue_target numeric default 0,
  add column if not exists momentum_score numeric default 0,
  add column if not exists last_momentum_update timestamptz;

alter table daily_plans
  add column if not exists daily_score int,
  add column if not exists daily_grade text,
  add column if not exists is_perfect_day boolean default false;

alter table content_posts
  add column if not exists posted_at timestamptz;

-- RLS
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table rewards enable row level security;
alter table weekly_reviews enable row level security;
alter table weekly_challenges enable row level security;
alter table boss_battles enable row level security;

-- Indexes
create index if not exists habit_logs_habit_id_idx on habit_logs(habit_id);
create index if not exists habit_logs_log_date_idx on habit_logs(log_date);

-- increment_xp RPC (server-side XP hub)
create or replace function increment_xp(amount int)
returns void as $$
  update user_prefs set xp = xp + amount;
$$ language sql security definer;
