-- ==============================================================================
-- VALORANTCLUTCH CLIPS DATABASE SCHEMA
-- ==============================================================================

-- Add riot_stats column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS riot_stats JSONB DEFAULT '{}'::jsonb;

-- Create clips table
CREATE TABLE IF NOT EXISTS public.clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    mux_asset_id TEXT,
    mux_playback_id TEXT,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clips are viewable by everyone" ON public.clips
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own clips" ON public.clips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clips" ON public.clips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clips" ON public.clips
    FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket access policies for clips bucket (run if needed, though programmatically configured)
-- Enable public read on clips storage bucket
CREATE POLICY "Public Read Access on Clips" ON storage.objects
    FOR SELECT USING (bucket_id = 'clips');

-- Enable authenticated users to insert/update/delete clips in storage
CREATE POLICY "Auth Upload Access on Clips" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'clips');

CREATE POLICY "Auth Update Access on Clips" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'clips');

CREATE POLICY "Auth Delete Access on Clips" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'clips');
