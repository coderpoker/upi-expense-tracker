-- ==========================================
-- Tribe App: Initial Supabase Schema
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create custom enums
CREATE TYPE vibe_category AS ENUM ('social', 'active', 'creative', 'gaming', 'food', 'learning');
CREATE TYPE event_source AS ENUM ('partner', 'user', 'external');

-- 2. Create Users table (Extends Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    city TEXT DEFAULT 'Bangalore',
    vibe_type TEXT,
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Create Events table
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    emoji TEXT DEFAULT '📍',
    description TEXT,
    category vibe_category NOT NULL,
    location_name TEXT NOT NULL,
    area TEXT NOT NULL,
    date_time TIMESTAMPTZ NOT NULL,
    max_capacity INTEGER DEFAULT 6,
    active_members INTEGER DEFAULT 1,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    price INTEGER DEFAULT 0,
    upi_id TEXT, -- For peer-to-peer MVP payments
    source event_source DEFAULT 'user',
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Hosts can update their own events" ON public.events FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete their own events" ON public.events FOR DELETE USING (auth.uid() = host_id);

-- 4. Create Event Members (RSVPs) table
CREATE TABLE public.event_members (
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

-- Enable RLS on event_members
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event members are viewable by everyone" ON public.event_members FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON public.event_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON public.event_members FOR DELETE USING (auth.uid() = user_id);

-- 5. Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Optional: Insert a few mock events so the app isn't empty on launch
INSERT INTO public.profiles (id, name, city) VALUES 
('00000000-0000-0000-0000-000000000001'::uuid, 'Tribe Admin', 'Bangalore'); -- Ghost admin for mock events

-- Note: Because '00000000-0000-0000-0000-000000000001' doesn't exist in auth.users, 
-- running this mock insert above will fail due to the foreign key constraint unless you bypass it. 
-- For MVP, create a real user first via Auth, then create events!
