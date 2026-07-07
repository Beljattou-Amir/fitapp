-- FitApp Premium Initial Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Trigger to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Exercises Table
CREATE TABLE IF NOT EXISTS public.exercises (
  id text not null primary key,
  user_id uuid references public.profiles(id) on delete cascade, -- NULL means global exercise
  name text not null,
  logging_type text not null,
  is_bodyweight boolean default false,
  default_rest integer default 60,
  directives text,
  updated_at bigint,
  deleted_at bigint
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Global exercises viewable by everyone" ON public.exercises
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can manage own exercises" ON public.exercises
  FOR ALL USING (user_id = auth.uid());

-- 4. Routines Table
CREATE TABLE IF NOT EXISTS public.routines (
  id text not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text,
  description text,
  blocks jsonb default '[]'::jsonb,
  updated_at bigint,
  deleted_at bigint
);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own routines" ON public.routines
  FOR ALL USING (user_id = auth.uid());

-- 5. Workout Logs Table
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id text not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  routine_id text references public.routines(id) on delete set null,
  duration integer,
  logged_at text not null,
  payload jsonb default '{}'::jsonb,
  updated_at bigint,
  deleted_at bigint
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout logs" ON public.workout_logs
  FOR ALL USING (user_id = auth.uid());

-- 6. Schedules Table
CREATE TABLE IF NOT EXISTS public.schedules (
  id text not null primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date text not null,
  routine_id text references public.routines(id) on delete cascade not null,
  updated_at bigint,
  deleted_at bigint
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own schedules" ON public.schedules
  FOR ALL USING (user_id = auth.uid());
