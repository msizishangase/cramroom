-- CramRoom starter schema — first draft, revisit RLS policies before real users touch this.

create type education_stage as enum ('high_school', 'tertiary');
create type group_role as enum ('host', 'member');
create type friendship_status as enum ('pending', 'accepted');

-- gender deliberately omitted — open question from earlier, add back if you decide you want it
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,
  education_stage education_stage,
  grade smallint,
  subjects text[],
  institution text,
  course text,
  created_at timestamptz not null default now()
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_or_module text,
  invite_code text not null unique,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create table group_members (
  group_id uuid not null references groups (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role group_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table friendships (
  user_id uuid not null references profiles (id) on delete cascade,
  friend_id uuid not null references profiles (id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  created_by uuid not null references profiles (id),
  title text not null,
  created_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges (id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_index smallint not null,
  position smallint not null
);

create table challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  score smallint not null,
  total smallint not null,
  time_ms integer not null,
  completed_at timestamptz not null default now()
);

-- Row Level Security ---------------------------------------------------

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table friendships enable row level security;
alter table challenges enable row level security;
alter table questions enable row level security;
alter table challenge_attempts enable row level security;

create policy "profiles are viewable by everyone"
  on profiles for select using (true);
create policy "users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "members can view their groups"
  on groups for select using (
    exists (select 1 from group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
  );
create policy "authenticated users can create groups"
  on groups for insert with check (auth.uid() = created_by);

create policy "members can view their group's roster"
  on group_members for select using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );
create policy "users can join a group"
  on group_members for insert with check (auth.uid() = user_id);

create policy "users can view their own friendships"
  on friendships for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "users can send friend requests"
  on friendships for insert with check (auth.uid() = user_id);

create policy "members can view group challenges"
  on challenges for select using (
    exists (select 1 from group_members gm where gm.group_id = challenges.group_id and gm.user_id = auth.uid())
  );
create policy "members can create challenges"
  on challenges for insert with check (
    exists (select 1 from group_members gm where gm.group_id = challenges.group_id and gm.user_id = auth.uid())
  );

create policy "members can view questions"
  on questions for select using (
    exists (
      select 1 from challenges c
      join group_members gm on gm.group_id = c.group_id
      where c.id = questions.challenge_id and gm.user_id = auth.uid()
    )
  );

create policy "members can view attempts"
  on challenge_attempts for select using (
    exists (
      select 1 from challenges c
      join group_members gm on gm.group_id = c.group_id
      where c.id = challenge_attempts.challenge_id and gm.user_id = auth.uid()
    )
  );
create policy "users can record their own attempt"
  on challenge_attempts for insert with check (auth.uid() = user_id);
