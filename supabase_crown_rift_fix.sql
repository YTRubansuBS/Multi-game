-- CROWN RIFT — ADMIN GIVE V4 + DECK

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
  where lower(coalesce(p.username,'')) like '%'||lower(coalesce(p_query,''))||'%'
     or lower(coalesce(p.display_name,'')) like '%'||lower(coalesce(p_query,''))||'%'
  order by coalesce(nullif(p.display_name,''),p.username),p.username
  limit 20;
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
  out_id uuid;
  out_username text;
  out_display_name text;
  out_gems integer;
  out_gold integer;
  out_owned jsonb;
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
      into old_qty
    from public.profiles
    where id=p_target_id;
  end if;

  update public.profiles
     set gems = coalesce(public.profiles.gems,0) + coalesce(p_gems,0),
         gold = coalesce(public.profiles.gold,0) + coalesce(p_pieces,0),
         owned_cards = case
           when p_card_id is not null and p_card_qty>0 then
             jsonb_set(
               coalesce(public.profiles.owned_cards,'{}'::jsonb),
               array[p_card_id::text],
               to_jsonb(old_qty+p_card_qty),
               true
             )
           else public.profiles.owned_cards
         end
   where id=p_target_id
   returning id,username,display_name,gems,gold,owned_cards
    into out_id,out_username,out_display_name,out_gems,out_gold,out_owned;

  if out_id is null then raise exception 'Joueur introuvable'; end if;

  return jsonb_build_object(
    'id',out_id,
    'username',out_username,
    'display_name',out_display_name,
    'gems',out_gems,
    'gold',out_gold,
    'owned_cards',out_owned
  );
end;
$$;

revoke all on function public.admin_give_rewards_v3(uuid,integer,integer,integer,integer,text) from public;
grant execute on function public.admin_give_rewards_v3(uuid,integer,integer,integer,integer,text) to authenticated;
