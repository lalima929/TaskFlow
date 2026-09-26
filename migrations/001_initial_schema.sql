-- TaskFlow initial database schema

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text,
    avatar_url text,
    created_at timestamptz not null default now()
);

create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    created_by uuid not null references public.profiles(id) on delete cascade,
    assigned_to uuid references public.profiles(id) on delete set null,
    status text not null default 'pending'
        check (status in ('pending', 'completed')),
    created_at timestamptz not null default now(),
    completed_at timestamptz
);

-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        email,
        full_name,
        avatar_url
    )
    values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'avatar_url'
    );

    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute procedure public.handle_new_user();

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- Profile policies
create policy "Authenticated users can view profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Task policies
create policy "Users can view their tasks"
on public.tasks
for select
to authenticated
using (
    auth.uid() = created_by
    or auth.uid() = assigned_to
);

create policy "Users can create tasks"
on public.tasks
for insert
to authenticated
with check (
    auth.uid() = created_by
);

create policy "Creators can update tasks"
on public.tasks
for update
to authenticated
using (
    auth.uid() = created_by
)
with check (
    auth.uid() = created_by
);

create policy "Assigned users can complete tasks"
on public.tasks
for update
to authenticated
using (
    auth.uid() = assigned_to
)
with check (
    auth.uid() = assigned_to
);

create policy "Creators can delete tasks"
on public.tasks
for delete
to authenticated
using (
    auth.uid() = created_by
);