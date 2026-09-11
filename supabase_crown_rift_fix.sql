-- CROWN RIFT — DECK + ADMIN GIVE V3

alter table public.profiles
add column if not exists deck jsonb not null default '[1,2,3,4,5,6,7,8]'::jsonb;

drop function if exists public.admin_find_players_v3(text,text);
create or replace function public.admin_find_players_v3(
  p_admin_password text,
  p_query text default ''
)
returns table(id uuid, username text, display_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if md5(coalesce(p_admin_password,'')) <> '4f587f41af29ecdd6ccaee8213ee8a93' then
    raise exception 'Mot de passe admin incorrect';
  end if;
  return query
  select p.id,p.username,p.display_name
  from public.profiles p
  where p.username ilike '%'||coalesce(p_query,'')||'%'
     or coalesce(p.display_name,'') ilike '%'||coalesce(p_query,'')||'%'
  order by p.username
  limit 10;
end;
$$;

revoke all on function public.admin_find_players_v3(text,text) from public;
grant execute on function public.admin_find_players_v3(text,text) to authenticated;

drop function if exists public.admin_give_rewards_v3(uuid,integer,integer,integer,integer,text);
create or replace function public.admin_give_rewards_v3(
  p_target_id uuid,
  p_pieces integer default 0,
  p_gems integer default 0,
  p_card_id integer default null,
  p_card_qty integer default 0,
  p_admin_password text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  old_qty integer := 0;
  out_row public.profiles;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if md5(coalesce(p_admin_password,'')) <> '4f587f41af29ecdd6ccaee8213ee8a93' then
    raise exception 'Mot de passe admin incorrect';
  end if;
  if p_target_id is null then raise exception 'Joueur cible manquant'; end if;
  if coalesce(p_pieces,0)<0 or coalesce(p_gems,0)<0 or coalesce(p_card_qty,0)<0 then
    raise exception 'Valeur invalide';
  end if;
  if p_card_id is not null and p_card_qty>0 then
    select coalesce((owned_cards ->> p_card_id::text)::integer,0)
    into old_qty from public.profiles where id=p_target_id;
  end if;
  update public.profiles
  set gems=public.profiles.gems+coalesce(p_gems,0),
      gold=public.profiles.gold+coalesce(p_pieces,0),
      owned_cards=case when p_card_id is not null and p_card_qty>0
        then jsonb_set(coalesce(public.profiles.owned_cards,'{}'::jsonb),array[p_card_id::text],to_jsonb(old_qty+p_card_qty),true)
        else public.profiles.owned_cards end,
      updated_at=now()
  where id=p_target_id
  returning * into out_row;
  if out_row.id is null then raise exception 'Joueur introuvable'; end if;
  return jsonb_build_object('id',out_row.id,'username',out_row.username,'gems',out_row.gems,'gold',out_row.gold,'owned_cards',out_row.owned_cards);
end;
$$;

revoke all on function public.admin_give_rewards_v3(uuid,integer,integer,integer,integer,text) from public;
grant execute on function public.admin_give_rewards_v3(uuid,integer,integer,integer,integer,text) to authenticated;
