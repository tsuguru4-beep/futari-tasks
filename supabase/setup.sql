-- ふたりのタスク：Supabase の SQL Editor に貼り付けて1回だけ実行する

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '',
  color text not null default '#5B7FA6',
  sort double precision not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  assignee text not null default 'both' check (assignee in ('husband', 'wife', 'both')),
  due_date date,
  memo text not null default '',
  done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_project_id_idx on public.tasks (project_id);

-- ログインした人（＝合言葉を知っている2人）だけが読み書きできる
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "signed in users" on public.projects;
create policy "signed in users" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "signed in users" on public.tasks;
create policy "signed in users" on public.tasks
  for all to authenticated using (true) with check (true);

-- 相手の変更をリアルタイムで受け取る
alter publication supabase_realtime add table public.projects, public.tasks;
