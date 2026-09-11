-- CROWN RIFT — sauvegarde du deck + GIVE ADMIN sécurisé

alter table public.profiles
add column if not exists deck jsonb not null default '[1,2,3,4,5,6,7,8]'::jsonb;

create or replace function public.admin_give_rewards(
  p_target_id uuid,
  p_pieces integer default 0,
  p_gems integer default 0,
  p_card_id integer default null,
  p_card_qty integer default 0
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_ok boolean;
  result_row public.profiles;
  old_qty integer;
begin
  select exists(
    select 1 from public.profiles
    where id = auth.uid()
      and upper(username) = 'RUBANSU1'
  ) into admin_ok;

  if not admin_ok then
    raise exception 'Accès admin refusé';
  end if;

  if p_target_id is null then raise exception 'Joueur cible manquant'; end if;
  if p_pieces < 0 or p_gems < 0 or p_card_qty < 0 then raise exception 'Valeur invalide'; end if;

  if p_card_id is not null and p_card_qty > 0 then
    select coalesce((owned_cards ->> p_card_id::text)::integer,0)
    into old_qty
    from public.profiles
    where id = p_target_id;

    update public.profiles
    set gems = public.profiles.gems + greatest(p_gems,0),
        gold = public.profiles.gold + greatest(p_pieces,0),
        owned_cards = jsonb_set(
          coalesce(public.profiles.owned_cards,'{}'::jsonb),
          array[p_card_id::text],
          to_jsonb(coalesce(old_qty,0) + p_card_qty),
          true
        ),
        updated_at = now()
    where id = p_target_id
    returning * into result_row;
  else
    update public.profiles
    set gems = public.profiles.gems + greatest(p_gems,0),
        gold = public.profiles.gold + greatest(p_pieces,0),
        updated_at = now()
    where id = p_target_id
    returning * into result_row;
  end if;

  if result_row.id is null then raise exception 'Joueur introuvable'; end if;
  return result_row;
end;
$$;

revoke all on function public.admin_give_rewards(uuid,integer,integer,integer,integer) from public;
grant execute on function public.admin_give_rewards(uuid,integer,integer,integer,integer) to authenticated;
