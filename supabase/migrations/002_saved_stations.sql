-- ============================================================
-- MWM OS — Saved music stations
-- ============================================================

create table if not exists saved_stations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  source        text check (source in ('spotify', 'youtube')) not null,
  url           text not null,
  thumbnail_url text,
  is_default    boolean default false,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

alter table saved_stations enable row level security;

create index if not exists idx_saved_stations_sort on saved_stations(sort_order, created_at);
