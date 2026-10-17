-- Run once in the Smart Collage Supabase project. No service-role key is needed by the app.
create table public.sc_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.sc_admins enable row level security;
create policy "read own admin membership" on public.sc_admins for select to authenticated using (user_id=auth.uid());
grant select on public.sc_admins to authenticated;
create function public.sc_is_admin() returns boolean language sql stable security invoker set search_path='' as $$ select exists(select 1 from public.sc_admins where user_id=auth.uid()) $$;
revoke all on function public.sc_is_admin() from public;
grant execute on function public.sc_is_admin() to authenticated;
-- Public catalogue only: never store student data, passwords or private video URLs here.
create table public.sc_content (id text primary key check(id='school'), payload jsonb not null, revision integer not null default 1, updated_at timestamptz not null default now());
alter table public.sc_content enable row level security;
create policy "public catalogue" on public.sc_content for select to anon,authenticated using(true);
create policy "admin content" on public.sc_content for all to authenticated using(public.sc_is_admin()) with check(public.sc_is_admin());
grant select on public.sc_content to anon,authenticated;
grant insert,update on public.sc_content to authenticated;
insert into public.sc_content(id,payload) values('school','{"teachers":[],"videos":[],"lessons":[],"courses":[],"quizzes":[],"welcome":{"title":"Ku soo dhawoow Smart Collage","message":"Baro maanta. Horumar berri.","url":""}}');
create table public.sc_videos (id uuid primary key, title text not null, created_by uuid not null references auth.users(id), created_at timestamptz not null default now());
alter table public.sc_videos enable row level security;
create policy "admin video registry" on public.sc_videos for all to authenticated using(public.sc_is_admin()) with check(public.sc_is_admin() and created_by=auth.uid());
grant select,insert,delete on public.sc_videos to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('teacher-photos','teacher-photos',true,2097152,array['image/jpeg','image/png','image/webp']);
create policy "admin teacher photo upload" on storage.objects for insert to authenticated with check(bucket_id='teacher-photos' and public.sc_is_admin());
create policy "admin teacher photo management" on storage.objects for delete to authenticated using(bucket_id='teacher-photos' and public.sc_is_admin());
-- After creating your administrator under Authentication > Users, grant its UUID:
-- insert into public.sc_admins(user_id) values ('YOUR_ADMIN_USER_UUID');
-- Entitlements are server-verified. Demo purchases never insert access records.
create table public.sc_enrollments (
 user_id uuid not null references auth.users(id) on delete cascade,
 class_id text not null check(class_id in ('class-7','class-8','class-9','class-10','class-11','class-12')),
 purchased_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '1 year'),
 primary key(user_id,class_id), check(expires_at>purchased_at)
);
alter table public.sc_enrollments enable row level security;
create policy "own class access" on public.sc_enrollments for select to authenticated using(user_id=(select auth.uid()) or public.sc_is_admin());
create policy "admin grants access" on public.sc_enrollments for all to authenticated using(public.sc_is_admin()) with check(public.sc_is_admin());
grant select,insert,update,delete on public.sc_enrollments to authenticated;
