-- =========SCHEMA INITIALIZATION=========
-- This script merges all migrations from 001 to 010 into a single initial schema file.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========TABLES=========

-- Create profiles table
create table public.profiles (
  id uuid references auth.users primary key,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);
comment on table public.profiles is 'User profile information, extending auth.users.';

-- Create decks table
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default false,
  created_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);
comment on table public.decks is 'Container for a set of flashcards.';

-- Create cards table
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references public.decks(id) on delete cascade not null,
  front_content text not null,
  back_content text not null,
  position integer not null,
  created_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);
comment on table public.cards is 'Individual flashcards with a front and back.';

-- Create study_records table (enhanced)
create table public.study_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete cascade not null,
  easiness_factor float default 2.5,
  interval integer default 1,
  repetitions integer default 0,
  next_review_date timestamp with time zone default now(),
  last_reviewed_at timestamp with time zone,
  total_reviews integer default 0,
  correct_reviews integer default 0,
  last_quality integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, card_id)
);
comment on table public.study_records is 'Tracks user learning progress for each card using SM-2 algorithm.';
comment on column public.study_records.total_reviews is 'Total number of times this card has been reviewed by the user';
comment on column public.study_records.correct_reviews is 'Number of times this card was answered correctly (quality >= 3)';
comment on column public.study_records.last_quality is 'The quality rating (0-5) from the most recent review';

-- Create study_sessions table
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  deck_id uuid references public.decks(id) on delete cascade not null,
  study_mode text not null check (study_mode in ('spaced-repetition', 'simple-review')),
  cards_studied integer default 0,
  duration_seconds integer,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);
comment on table public.study_sessions is 'Tracks individual study sessions including mode, duration, and cards studied';

-- Create tags table
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  color text not null default '#3B82F6',
  created_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);
comment on table public.tags is 'User-created custom tags for cards.';
comment on column public.tags.color is 'Tag color in hex format.';

-- Create card_tags table
create table public.card_tags (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.cards(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  constraint card_tags_unique unique (card_id, tag_id)
);
comment on table public.card_tags is 'Many-to-many relationship between cards and tags.';

-- Create marketplace_decks table (enhanced)
create table public.marketplace_decks (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references public.decks(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price decimal(10,2) default 0,
  download_count integer default 0,
  rating float default 0,
  rating_count integer default 0,
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);
comment on table public.marketplace_decks is 'Decks published by users for others to download.';

-- Create marketplace_ratings table
create table public.marketplace_ratings (
  id uuid primary key default gen_random_uuid(),
  marketplace_deck_id uuid references public.marketplace_decks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_user_rating unique (marketplace_deck_id, user_id)
);
comment on table public.marketplace_ratings is 'User ratings for marketplace decks.';

-- Create purchases table
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  marketplace_deck_id uuid references public.marketplace_decks(id) on delete cascade not null,
  amount decimal(10,2) not null,
  purchased_at timestamp with time zone default now()
);
comment on table public.purchases is 'Records of marketplace deck purchases.';

-- =========ROW LEVEL SECURITY (RLS)=========

-- RLS for profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (deleted_at is null);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- RLS for decks
alter table public.decks enable row level security;
create policy "Users can view own or public decks" on public.decks for select using ((auth.uid() = user_id or is_public = true) and deleted_at is null);
create policy "Users can create own decks" on public.decks for insert with check (auth.uid() = user_id);
create policy "Users can update own decks" on public.decks for update using (auth.uid() = user_id);

-- RLS for cards
alter table public.cards enable row level security;
create policy "Users can view own deck cards" on public.cards for select using (exists (select 1 from decks where decks.id = cards.deck_id and decks.user_id = auth.uid() and decks.deleted_at is null) and cards.deleted_at is null);
create policy "Users can insert cards in own decks" on public.cards for insert with check (exists (select 1 from decks where decks.id = cards.deck_id and decks.user_id = auth.uid()));
create policy "Users can update cards in own decks" on public.cards for update using (exists (select 1 from decks where decks.id = cards.deck_id and decks.user_id = auth.uid()));

-- RLS for study_records
alter table public.study_records enable row level security;
create policy "Users can view own study records" on public.study_records for select using (auth.uid() = user_id);
create policy "Users can insert own study records" on public.study_records for insert with check (auth.uid() = user_id);
create policy "Users can update own study records" on public.study_records for update using (auth.uid() = user_id);

-- RLS for study_sessions
alter table public.study_sessions enable row level security;
create policy "Users can view own study sessions" on public.study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own study sessions" on public.study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own study sessions" on public.study_sessions for update using (auth.uid() = user_id);

-- RLS for tags
alter table public.tags enable row level security;
create policy "Users can view own tags" on public.tags for select using (auth.uid() = user_id and deleted_at is null);
create policy "Users can create own tags" on public.tags for insert with check (auth.uid() = user_id);
create policy "Users can update own tags" on public.tags for update using (auth.uid() = user_id);

-- RLS for card_tags
alter table public.card_tags enable row level security;
create policy "Users can view card tags" on public.card_tags for select using (exists (select 1 from cards c join decks d on d.id = c.deck_id where c.id = card_tags.card_id and d.user_id = auth.uid() and c.deleted_at is null and d.deleted_at is null));
create policy "Users can add card tags" on public.card_tags for insert with check (exists (select 1 from cards c join decks d on d.id = c.deck_id where c.id = card_tags.card_id and d.user_id = auth.uid()));
create policy "Users can delete card tags" on public.card_tags for delete using (exists (select 1 from cards c join decks d on d.id = c.deck_id where c.id = card_tags.card_id and d.user_id = auth.uid()));

-- RLS for marketplace_decks
alter table public.marketplace_decks enable row level security;
create policy "Anyone can view published marketplace decks" on public.marketplace_decks for select using (is_published = true and deleted_at is null);
create policy "Authors can insert their marketplace decks" on public.marketplace_decks for insert with check (auth.uid() = author_id);
create policy "Authors can update own marketplace decks" on public.marketplace_decks for update using (auth.uid() = author_id);

-- RLS for marketplace_ratings
alter table public.marketplace_ratings enable row level security;
create policy "Anyone can view ratings" on public.marketplace_ratings for select using (true);
create policy "Users can insert own ratings" on public.marketplace_ratings for insert with check (auth.uid() = user_id);
create policy "Users can update own ratings" on public.marketplace_ratings for update using (auth.uid() = user_id);
create policy "Users can delete own ratings" on public.marketplace_ratings for delete using (auth.uid() = user_id);

-- RLS for purchases
alter table public.purchases enable row level security;
create policy "Users can view own purchases" on public.purchases for select using (auth.uid() = user_id);
create policy "Users can create own purchases" on public.purchases for insert with check (auth.uid() = user_id);

-- =========INDEXES=========
create index if not exists idx_decks_user_id on public.decks(user_id);
create index if not exists idx_decks_deleted_at on public.decks(deleted_at);
create index if not exists idx_cards_deck_id on public.cards(deck_id);
create index if not exists idx_cards_deleted_at on public.cards(deleted_at);
create index if not exists idx_study_records_user_card on public.study_records(user_id, card_id);
create index if not exists idx_study_records_next_review on public.study_records(user_id, next_review_date);
create index if not exists idx_marketplace_decks_published on public.marketplace_decks(is_published, deleted_at);
create index if not exists idx_purchases_user_id on public.purchases(user_id);
create index if not exists idx_study_sessions_user_deck on public.study_sessions(user_id, deck_id);
create index if not exists idx_study_sessions_completed on public.study_sessions(user_id, completed_at);
create unique index if not exists tags_user_name_unique_idx on public.tags(user_id, name) where deleted_at is null;
create index if not exists tags_user_id_idx on public.tags(user_id);
create index if not exists tags_deleted_at_idx on public.tags(deleted_at);
create index if not exists card_tags_card_id_idx on public.card_tags(card_id);
create index if not exists card_tags_tag_id_idx on public.card_tags(tag_id);
create index if not exists idx_marketplace_ratings_deck on public.marketplace_ratings(marketplace_deck_id);
create index if not exists idx_marketplace_ratings_user on public.marketplace_ratings(user_id);


-- =========FUNCTIONS & TRIGGERS=========

-- Function to create profile on user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile automatically
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to handle soft deleting cards
create or replace function public.soft_delete_card(card_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  deck_owner uuid;
  card_deck_id uuid;
begin
  select c.deck_id, d.user_id
  into card_deck_id, deck_owner
  from public.cards c
  join public.decks d on d.id = c.deck_id
  where c.id = card_id
  and c.deleted_at is null
  and d.deleted_at is null;

  if card_deck_id is null then
    raise exception 'Card not found or already deleted';
  end if;

  if deck_owner != auth.uid() then
    raise exception 'Permission denied';
  end if;

  update public.cards
  set deleted_at = now()
  where id = card_id;
end;
$$;
comment on function public.soft_delete_card(uuid) is 'Soft delete a card. Bypasses RLS.';
grant execute on function public.soft_delete_card(uuid) to authenticated;

-- Function to handle soft deleting decks (and their cards)
create or replace function public.soft_delete_deck(deck_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  deck_owner uuid;
begin
  select user_id
  into deck_owner
  from public.decks
  where id = deck_id
  and deleted_at is null;

  if deck_owner is null then
    raise exception 'Deck not found or already deleted';
  end if;

  if deck_owner != auth.uid() then
    raise exception 'Permission denied';
  end if;

  update public.cards
  set deleted_at = now()
  where cards.deck_id = soft_delete_deck.deck_id
  and deleted_at is null;

  update public.decks
  set deleted_at = now()
  where id = deck_id;
end;
$$;
comment on function public.soft_delete_deck(uuid) is 'Soft delete a deck and all its cards. Bypasses RLS.';
grant execute on function public.soft_delete_deck(uuid) to authenticated;

-- Function to auto-update updated_at timestamp on study_records
create or replace function public.update_study_record_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for study_records updated_at
drop trigger if exists study_records_updated_at on public.study_records;
create trigger study_records_updated_at
  before update on public.study_records
  for each row
  execute function public.update_study_record_updated_at();

-- Function to update marketplace_deck rating
create or replace function public.update_marketplace_deck_rating()
returns trigger as $$
begin
  update public.marketplace_decks
  set 
    rating = (
      select avg(rating)::float
      from public.marketplace_ratings
      where marketplace_deck_id = coalesce(new.marketplace_deck_id, old.marketplace_deck_id)
    ),
    rating_count = (
      select count(*)
      from public.marketplace_ratings
      where marketplace_deck_id = coalesce(new.marketplace_deck_id, old.marketplace_deck_id)
    )
  where id = coalesce(new.marketplace_deck_id, old.marketplace_deck_id);
  
  return coalesce(new, old);
end;
$$ language plpgsql;

-- Trigger for marketplace_ratings
drop trigger if exists marketplace_ratings_update_rating on public.marketplace_ratings;
create trigger marketplace_ratings_update_rating
  after insert or update or delete on public.marketplace_ratings
  for each row
  execute function public.update_marketplace_deck_rating();
