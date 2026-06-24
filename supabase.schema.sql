-- ============================================================
-- BIOMap — Supabase SQL Schema (To'liq versiya)
-- ============================================================

-- ─── 1. UPDATED_AT TRIGGER FUNKSIYASI ────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── 2. JADVALLAR YARATISH ────────────────────────────────────

create table if not exists public.biomap_observations (
  id          text        primary key,
  data        jsonb       not null,
  is_approved boolean     not null default false,
  user_id     text,
  sana        date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.biomap_users (
  id          text        primary key,
  data        jsonb       not null,
  email       text,
  fullname    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.biomap_documents (
  id          text        primary key,
  data        jsonb       not null,
  user_id     text,
  category    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── 3. MAVJUD JADVALGA KOLONNALAR QO'SHISH (Migration) ───────
-- Eski jadval bo'lsa ham xato bermaydi
alter table public.biomap_observations
  add column if not exists is_approved boolean not null default false;

alter table public.biomap_observations
  add column if not exists user_id text;

alter table public.biomap_observations
  add column if not exists sana date;

alter table public.biomap_users
  add column if not exists email text;

alter table public.biomap_users
  add column if not exists fullname text;

alter table public.biomap_documents
  add column if not exists user_id text;

alter table public.biomap_documents
  add column if not exists category text;

alter table public.biomap_documents
  add column if not exists is_approved boolean not null default false;

-- ─── 4. TRIGGERLAR ───────────────────────────────────────────
drop trigger if exists biomap_observations_updated_at on public.biomap_observations;
create trigger biomap_observations_updated_at
  before update on public.biomap_observations
  for each row execute function public.set_updated_at();

drop trigger if exists biomap_users_updated_at on public.biomap_users;
create trigger biomap_users_updated_at
  before update on public.biomap_users
  for each row execute function public.set_updated_at();

drop trigger if exists biomap_documents_updated_at on public.biomap_documents;
create trigger biomap_documents_updated_at
  before update on public.biomap_documents
  for each row execute function public.set_updated_at();

-- ─── 5. INDEKSLAR ────────────────────────────────────────────
create index if not exists idx_biomap_obs_is_approved
  on public.biomap_observations(is_approved);

create index if not exists idx_biomap_obs_user_id
  on public.biomap_observations(user_id);

create index if not exists idx_biomap_obs_sana
  on public.biomap_observations(sana desc);

-- ─── 6. ROW LEVEL SECURITY ───────────────────────────────────
alter table public.biomap_observations enable row level security;
alter table public.biomap_users        enable row level security;
alter table public.biomap_documents    enable row level security;

-- Eski policylarni o'chirish (qayta ishga tushirilsa xato bermasin)
drop policy if exists "Public read approved observations"    on public.biomap_observations;
drop policy if exists "Public read all observations"        on public.biomap_observations;
drop policy if exists "Public read biomap observations"     on public.biomap_observations;
drop policy if exists "Public write biomap observations"    on public.biomap_observations;
drop policy if exists "Public insert observations"          on public.biomap_observations;
drop policy if exists "Owner update observations"           on public.biomap_observations;
drop policy if exists "Owner delete observations"           on public.biomap_observations;
drop policy if exists "Public read biomap users"            on public.biomap_users;
drop policy if exists "Public write biomap users"           on public.biomap_users;
drop policy if exists "Public read biomap documents"        on public.biomap_documents;
drop policy if exists "Public read approved documents"      on public.biomap_documents;
drop policy if exists "Public read all documents"           on public.biomap_documents;
drop policy if exists "Public write biomap documents"       on public.biomap_documents;

-- Observations policylar
-- Barcha yozuvlarni o'qish mumkin (tasdiqlash filtri app qatlamida amalga oshiriladi)
-- Bu admin panelda tasdiqlanmagan kuzatuvlarni ham ko'rish uchun zarur
create policy "Public read all observations"
  on public.biomap_observations for select
  using (true);

create policy "Public insert observations"
  on public.biomap_observations for insert
  with check (true);

create policy "Owner update observations"
  on public.biomap_observations for update
  using (true)
  with check (true);

create policy "Owner delete observations"
  on public.biomap_observations for delete
  using (true);

-- Users policylar
create policy "Public read biomap users"
  on public.biomap_users for select
  using (true);

create policy "Public write biomap users"
  on public.biomap_users for all
  using (true)
  with check (true);

-- Documents policylar
drop policy if exists "Public read biomap documents" on public.biomap_documents;
drop policy if exists "Public read approved documents" on public.biomap_documents;
-- Barcha hujjatlarni o'qish (filtrlash app qatlamida)
create policy "Public read all documents"
  on public.biomap_documents for select
  using (true);

create policy "Public write biomap documents"
  on public.biomap_documents for all
  using (true)
  with check (true);

-- ─── 7. ADMIN VIEW ───────────────────────────────────────────
-- Admin view: barcha yozuvlar (tasdiqlangan va tasdiqlanmagan)
create or replace view public.biomap_observations_admin as
  select * from public.biomap_observations;

-- ─── 8. BIOMAP_NEWS JADVALI ─────────────────────────────────────
create table if not exists public.biomap_news (
  id          text        primary key,
  data        jsonb       not null,
  user_id     text,
  is_approved boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists biomap_news_updated_at on public.biomap_news;
create trigger biomap_news_updated_at
  before update on public.biomap_news
  for each row execute function public.set_updated_at();

alter table public.biomap_news enable row level security;

drop policy if exists "Public read approved news" on public.biomap_news;
create policy "Public read approved news"
  on public.biomap_news for select
  using (is_approved = true);

drop policy if exists "Public write biomap news" on public.biomap_news;
create policy "Public write biomap news"
  on public.biomap_news for all
  using (true)
  with check (true);
