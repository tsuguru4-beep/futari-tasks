-- 「やめた」を記録する列を追加（setup.sql を実行済みのプロジェクト向け）
alter table public.tasks add column if not exists canceled boolean not null default false;
