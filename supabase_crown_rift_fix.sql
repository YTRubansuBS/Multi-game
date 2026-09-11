-- CROWN RIFT — sauvegarde du deck + GIVE ADMIN sécurisé

alter table public.profiles
add column if not exists deck jsonb not null default '[1,2,3,4,5,6,7,8]'::jsonb;

-- Fonction sécurisée : seul le compte dont le pseudo est RUBANSU1 peut donner.
create or replace function public.admin_give_rewards(
  target_id uuid,
  pieces integer default 0,
  gems integer default 0,
  card_id integer default null,
  card_qty integer default 0
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

  if target_id is null then
    raise exception 'Joueur cible manquant';
  end if;

  if pieces < 0 or gems < 0 or card_qty < 0 then
    raise exception 'Valeur invalide';
  end if;

  if card_id is not null and card_qty > 0 then
    select coalesce((owned_cards ->> card_id::text)::integer,0)
    into old_qty
    from public.profiles
    where id = target_id;

    update public.profiles
    set gems = gems + greatest(gems,0),
        gold = gold + greatest(pieces,0),
        owned_cards = jsonb_set(
          coalesce(owned_cards,'{}'::jsonb),
          array[card_id::text],
          to_jsonb(coalesce(old_qty,0) + card_qty),
          true
        ),
        updated_at = now()
    where id = target_id
    returning * into result_row;
  else
    update public.profiles
    set gems = gems + greatest(gems,0),
        gold = gold + greatest(pieces,0),
        updated_at = now()
    where id = target_id
    returning * into result_row;
  end if;

  if result_row.id is null then
    raise exception 'Joueur introuvable';
  end if;

  return result_row;
end;
$$;

revoke all on function public.admin_give_rewards(uuid,integer,integer,integer,integer) from public;
grant execute on function public.admin_give_rewards(uuid,integer,integer,integer,integer) to authenticated;

-- Vérification rapide :
-- select username, deck from public.profiles limit 5;
