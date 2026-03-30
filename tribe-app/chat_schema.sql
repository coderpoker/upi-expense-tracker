-- ==========================================
-- Tribe App: Chat/Messages Schema Update
-- ==========================================

-- Create Messages table for Ephemeral Event Chat
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone logged in can read messages for any event (in a real app, you'd restrict to event_members)
CREATE POLICY "Messages are viewable by authenticated users" 
ON public.messages FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policy: Anyone logged in can insert messages
CREATE POLICY "Authenticated users can insert messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Explicitly enable Realtime on the messages table so clients can subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
