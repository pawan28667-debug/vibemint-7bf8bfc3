-- ============ enums ============
create type public.chain_type as enum ('discussion','challenge','collaboration','remix','question','project','idea','open');
create type public.chain_visibility as enum ('public','followers','invite','private');
create type public.chain_status as enum ('active','voting','building','complete','archived');
create type public.contribution_type as enum ('response','remix','idea','improvement','question','design','collaboration','result');
create type public.chain_role as enum ('owner','moderator','editor','contributor');

-- ============ chains ============
create table public.vibe_chains (
  id uuid primary key default gen_random_uuid(),
  starter_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  type public.chain_type not null default 'open',
  category text not null default 'General',
  tags text[] not null default '{}',
  visibility public.chain_visibility not null default 'public',
  status public.chain_status not null default 'active',
  voting_open boolean not null default false,
  deadline timestamptz,
  rules text not null default '',
  result_summary text not null default '',
  root_post_id uuid references public.posts(id) on delete set null,
  node_count integer not null default 0,
  participant_count integer not null default 1,
  vote_count integer not null default 0,
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vibe_chains add constraint vibe_chains_starter_profile_fkey
  foreign key (starter_id) references public.profiles(id) on delete cascade;

create table public.vibe_chain_participants (
  chain_id uuid not null references public.vibe_chains(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.chain_role not null default 'contributor',
  joined_at timestamptz not null default now(),
  primary key (chain_id, user_id)
);
alter table public.vibe_chain_participants add constraint vcp_user_profile_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

create table public.vibe_chain_nodes (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid not null references public.vibe_chains(id) on delete cascade,
  parent_id uuid references public.vibe_chain_nodes(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  contribution public.contribution_type not null default 'response',
  body text not null default '',
  post_id uuid references public.posts(id) on delete set null,
  link_url text,
  remix_of_node_id uuid references public.vibe_chain_nodes(id) on delete set null,
  original_author_id uuid references public.profiles(id) on delete set null,
  merged_from_node_id uuid references public.vibe_chain_nodes(id) on delete set null,
  is_pinned boolean not null default false,
  moderation_status text not null default 'ok',
  vote_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vibe_chain_nodes add constraint vcn_author_profile_fkey
  foreign key (author_id) references public.profiles(id) on delete cascade;

create table public.vibe_chain_votes (
  chain_id uuid not null references public.vibe_chains(id) on delete cascade,
  node_id uuid not null references public.vibe_chain_nodes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (node_id, user_id)
);

create table public.vibe_chain_tasks (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid not null references public.vibe_chains(id) on delete cascade,
  title text not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  done boolean not null default false,
  due_date date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.vibe_chain_messages (
  id uuid primary key default gen_random_uuid(),
  chain_id uuid not null references public.vibe_chains(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.vibe_chain_messages add constraint vcm_user_profile_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- link posts to chains (optional)
alter table public.posts add column if not exists chain_id uuid references public.vibe_chains(id) on delete set null;

-- ============ indexes ============
create index idx_chains_visibility_activity on public.vibe_chains (visibility, last_activity_at desc);
create index idx_chains_status on public.vibe_chains (status);
create index idx_chains_starter on public.vibe_chains (starter_id);
create index idx_chains_category on public.vibe_chains (category);
create index idx_nodes_chain_created on public.vibe_chain_nodes (chain_id, created_at);
create index idx_nodes_parent on public.vibe_chain_nodes (parent_id);
create index idx_nodes_author on public.vibe_chain_nodes (author_id);
create index idx_votes_chain on public.vibe_chain_votes (chain_id);
create index idx_participants_user on public.vibe_chain_participants (user_id);
create index idx_room_msgs_chain on public.vibe_chain_messages (chain_id, created_at desc);
create index idx_tasks_chain on public.vibe_chain_tasks (chain_id);
create index idx_posts_chain on public.posts (chain_id);

-- ============ grants ============
grant select on public.vibe_chains to anon;
grant select, insert, update, delete on public.vibe_chains to authenticated;
grant all on public.vibe_chains to service_role;

grant select on public.vibe_chain_nodes to anon;
grant select, insert, update, delete on public.vibe_chain_nodes to authenticated;
grant all on public.vibe_chain_nodes to service_role;

grant select on public.vibe_chain_participants to anon;
grant select, insert, update, delete on public.vibe_chain_participants to authenticated;
grant all on public.vibe_chain_participants to service_role;

grant select on public.vibe_chain_votes to anon;
grant select, insert, delete on public.vibe_chain_votes to authenticated;
grant all on public.vibe_chain_votes to service_role;

grant select on public.vibe_chain_tasks to anon;
grant select, insert, update, delete on public.vibe_chain_tasks to authenticated;
grant all on public.vibe_chain_tasks to service_role;

grant select on public.vibe_chain_messages to anon;
grant select, insert, delete on public.vibe_chain_messages to authenticated;
grant all on public.vibe_chain_messages to service_role;

-- ============ helper functions ============
create or replace function public.is_chain_participant(_chain_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vibe_chain_participants p where p.chain_id = _chain_id and p.user_id = _user_id);
$$;

create or replace function public.chain_role_of(_chain_id uuid, _user_id uuid)
returns public.chain_role language sql stable security definer set search_path = public as $$
  select p.role from public.vibe_chain_participants p where p.chain_id = _chain_id and p.user_id = _user_id;
$$;

create or replace function public.can_view_chain(_chain_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.vibe_chains c
    where c.id = _chain_id
      and (
        c.visibility = 'public'
        or (_user_id is not null and (
             c.starter_id = _user_id
             or public.is_chain_participant(c.id, _user_id)
             or (c.visibility = 'followers' and exists (
                   select 1 from public.subscriptions s
                   where s.creator_id = c.starter_id and s.subscriber_id = _user_id))
           ))
      )
  );
$$;

create or replace function public.can_contribute_chain(_chain_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.vibe_chains c
    where c.id = _chain_id
      and c.status not in ('complete','archived')
      and _user_id is not null
      and (
        (c.visibility in ('public','followers') and public.can_view_chain(c.id, _user_id))
        or c.starter_id = _user_id
        or public.is_chain_participant(c.id, _user_id)
      )
  );
$$;

-- ============ RLS ============
alter table public.vibe_chains enable row level security;
alter table public.vibe_chain_nodes enable row level security;
alter table public.vibe_chain_participants enable row level security;
alter table public.vibe_chain_votes enable row level security;
alter table public.vibe_chain_tasks enable row level security;
alter table public.vibe_chain_messages enable row level security;

create policy chains_public_read on public.vibe_chains for select to anon using (visibility = 'public');
create policy chains_member_read on public.vibe_chains for select to authenticated using (public.can_view_chain(id, auth.uid()));
create policy chains_insert_own on public.vibe_chains for insert to authenticated with check (auth.uid() = starter_id);
create policy chains_owner_update on public.vibe_chains for update to authenticated
  using (auth.uid() = starter_id or public.chain_role_of(id, auth.uid()) in ('owner','moderator'))
  with check (auth.uid() = starter_id or public.chain_role_of(id, auth.uid()) in ('owner','moderator'));
create policy chains_owner_delete on public.vibe_chains for delete to authenticated using (auth.uid() = starter_id);

create policy nodes_public_read on public.vibe_chain_nodes for select to anon
  using (exists (select 1 from public.vibe_chains c where c.id = chain_id and c.visibility = 'public'));
create policy nodes_member_read on public.vibe_chain_nodes for select to authenticated using (public.can_view_chain(chain_id, auth.uid()));
create policy nodes_insert on public.vibe_chain_nodes for insert to authenticated
  with check (auth.uid() = author_id and public.can_contribute_chain(chain_id, auth.uid()));
create policy nodes_update_own on public.vibe_chain_nodes for update to authenticated
  using (auth.uid() = author_id or public.chain_role_of(chain_id, auth.uid()) in ('owner','moderator'))
  with check (auth.uid() = author_id or public.chain_role_of(chain_id, auth.uid()) in ('owner','moderator'));
create policy nodes_delete_own on public.vibe_chain_nodes for delete to authenticated
  using (auth.uid() = author_id or public.chain_role_of(chain_id, auth.uid()) in ('owner','moderator'));

create policy parts_public_read on public.vibe_chain_participants for select to anon
  using (exists (select 1 from public.vibe_chains c where c.id = chain_id and c.visibility = 'public'));
create policy parts_member_read on public.vibe_chain_participants for select to authenticated using (public.can_view_chain(chain_id, auth.uid()));
create policy parts_join on public.vibe_chain_participants for insert to authenticated
  with check ((auth.uid() = user_id and public.can_contribute_chain(chain_id, auth.uid()))
              or public.chain_role_of(chain_id, auth.uid()) in ('owner','moderator'));
create policy parts_owner_update on public.vibe_chain_participants for update to authenticated
  using (public.chain_role_of(chain_id, auth.uid()) = 'owner') with check (public.chain_role_of(chain_id, auth.uid()) = 'owner');
create policy parts_leave on public.vibe_chain_participants for delete to authenticated
  using (auth.uid() = user_id or public.chain_role_of(chain_id, auth.uid()) = 'owner');

create policy votes_public_read on public.vibe_chain_votes for select to anon
  using (exists (select 1 from public.vibe_chains c where c.id = chain_id and c.visibility = 'public'));
create policy votes_member_read on public.vibe_chain_votes for select to authenticated using (public.can_view_chain(chain_id, auth.uid()));
create policy votes_insert_own on public.vibe_chain_votes for insert to authenticated
  with check (auth.uid() = user_id and public.can_view_chain(chain_id, auth.uid()));
create policy votes_delete_own on public.vibe_chain_votes for delete to authenticated using (auth.uid() = user_id);

create policy tasks_public_read on public.vibe_chain_tasks for select to anon
  using (exists (select 1 from public.vibe_chains c where c.id = chain_id and c.visibility = 'public'));
create policy tasks_member_read on public.vibe_chain_tasks for select to authenticated using (public.can_view_chain(chain_id, auth.uid()));
create policy tasks_write on public.vibe_chain_tasks for insert to authenticated
  with check (auth.uid() = created_by and public.can_contribute_chain(chain_id, auth.uid()));
create policy tasks_update on public.vibe_chain_tasks for update to authenticated
  using (public.can_contribute_chain(chain_id, auth.uid())) with check (public.can_contribute_chain(chain_id, auth.uid()));
create policy tasks_delete on public.vibe_chain_tasks for delete to authenticated
  using (auth.uid() = created_by or public.chain_role_of(chain_id, auth.uid()) in ('owner','moderator'));

create policy room_member_read on public.vibe_chain_messages for select to authenticated using (public.can_view_chain(chain_id, auth.uid()));
create policy room_insert on public.vibe_chain_messages for insert to authenticated
  with check (auth.uid() = user_id and public.can_contribute_chain(chain_id, auth.uid()));
create policy room_delete_own on public.vibe_chain_messages for delete to authenticated
  using (auth.uid() = user_id or public.chain_role_of(chain_id, auth.uid()) in ('owner','moderator'));

-- ============ triggers ============
create or replace function public.on_chain_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.vibe_chain_participants (chain_id, user_id, role)
  values (NEW.id, NEW.starter_id, 'owner')
  on conflict do nothing;
  return NEW;
end; $$;
create trigger chains_seed_owner after insert on public.vibe_chains
  for each row execute function public.on_chain_created();

create or replace function public.on_chain_node()
returns trigger language plpgsql security definer set search_path = public as $$
declare starter uuid; remix_author uuid;
begin
  if TG_OP = 'INSERT' then
    update public.vibe_chains
      set node_count = node_count + 1, last_activity_at = now(), updated_at = now()
      where id = NEW.chain_id;
    insert into public.vibe_chain_participants (chain_id, user_id, role)
      values (NEW.chain_id, NEW.author_id, 'contributor') on conflict do nothing;
    update public.vibe_chains c set participant_count = (
      select count(*) from public.vibe_chain_participants p where p.chain_id = c.id
    ) where c.id = NEW.chain_id;
    select starter_id into starter from public.vibe_chains where id = NEW.chain_id;
    perform public.notify(starter, 'comment', NEW.author_id, NEW.post_id, null);
    if NEW.remix_of_node_id is not null then
      select author_id into remix_author from public.vibe_chain_nodes where id = NEW.remix_of_node_id;
      perform public.notify(remix_author, 'comment', NEW.author_id, NEW.post_id, null);
    end if;
    return NEW;
  else
    update public.vibe_chains set node_count = greatest(node_count - 1, 0) where id = OLD.chain_id;
    return OLD;
  end if;
end; $$;
create trigger chain_nodes_activity after insert or delete on public.vibe_chain_nodes
  for each row execute function public.on_chain_node();

create or replace function public.on_chain_vote()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.vibe_chain_nodes set vote_count = vote_count + 1 where id = NEW.node_id;
    update public.vibe_chains set vote_count = vote_count + 1, last_activity_at = now() where id = NEW.chain_id;
    return NEW;
  else
    update public.vibe_chain_nodes set vote_count = greatest(vote_count - 1, 0) where id = OLD.node_id;
    update public.vibe_chains set vote_count = greatest(vote_count - 1, 0) where id = OLD.chain_id;
    return OLD;
  end if;
end; $$;
create trigger chain_votes_count after insert or delete on public.vibe_chain_votes
  for each row execute function public.on_chain_vote();

create or replace function public.on_room_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.vibe_chains set last_activity_at = now() where id = NEW.chain_id;
  return NEW;
end; $$;
create trigger chain_room_activity after insert on public.vibe_chain_messages
  for each row execute function public.on_room_message();