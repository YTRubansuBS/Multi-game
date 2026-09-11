-- CROWN RIFT — DECK + GIVE ADMIN V2 sécurisé

alter table public.profiles
add column if not exists deck jsonb not null default '[1,2,3,4,5,6,7,8]'::jsonb;

drop function if exists public.admin_give_rewards_v2(uuid,integer,integer,integer,integer);
create or replace function public.admin_give_rewards_v2(
  target_id uuid,
  pieces integer default 0,
  gems integer default 0,
  card_id integer default null,
  card_qty integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_ok boolean;
  old_qty integer := 0;
  out_row public.profiles;
begin
  select exists(select 1 from public.profiles where id=auth.uid() and upper(trim(username))='RUBANSU1') into admin_ok;
  if not admin_ok then raise exception 'Accès admin refusé'; end if;
  if target_id is null then raise exception 'Joueur cible manquant'; end if;
  if coalesce(pieces,0)<0 or coalesce(gems,0)<0 or coalesce(card_qty,0)<0 then raise exception 'Valeur invalide'; end if;
  if card_id is not null and card_qty>0 then
    select coalesce((owned_cards ->> card_id::text)::integer,0) into old_qty from public.profiles where id=target_id;
  end if;
  update public.profiles
  set gems=public.profiles.gems+coalesce(gems,0),
      gold=public.profiles.gold+coalesce(pieces,0),
      owned_cards=case when card_id is not null and card_qty>0 then jsonb_set(coalesce(public.profiles.owned_cards,'{}'::jsonb),array[card_id::text],to_jsonb(old_qty+card_qty),true) else public.profiles.owned_cards end,
      updated_at=now()
  where id=target_id
  returning * into out_row;
  if out_row.id is null then raise exception 'Joueur introuvable'; end if;
  return jsonb_build_object('id',out_row.id,'username',out_row.username,'gems',out_row.gems,'gold',out_row.gold,'owned_cards',out_row.owned_cards);
end;
$$;

revoke all on function public.admin_give_rewards_v2(uuid,integer,integer,integer,integer) from public;
grant execute on function public.admin_give_rewards_v2(uuid,integer,integer,integer,integer) to authenticated;

-- Compatibilité avec l'ancien bouton GIVE
