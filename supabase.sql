-- CROWN RIFT / SUPABASE
-- Execute this whole file in Supabase SQL Editor.
-- Then enable Authentication > Sign-In > Anonymous Sign-Ins.
-- NEVER put a secret/service_role key in the browser.

create table if not exists public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Joueur',
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;

drop policy if exists "game_saves_select_own" on public.game_saves;
create policy "game_saves_select_own" on public.game_saves for select to authenticated using (auth.uid()=user_id);

drop policy if exists "game_saves_insert_own" on public.game_saves;
create policy "game_saves_insert_own" on public.game_saves for insert to authenticated with check (auth.uid()=user_id);

drop policy if exists "game_saves_update_own" on public.game_saves;
create policy "game_saves_update_own" on public.game_saves for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

grant select,insert,update on public.game_saves to authenticated;
