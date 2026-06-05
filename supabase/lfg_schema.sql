-- 1. LFG Listings
CREATE TABLE public.lfg_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rank_required TEXT,
    region TEXT NOT NULL,
    play_style TEXT NOT NULL,
    slots_total INT NOT NULL CHECK (slots_total > 1),
    slots_filled INT NOT NULL DEFAULT 1,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LFG Members
CREATE TABLE public.lfg_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.lfg_listings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, user_id)
);

-- 3. RLS Policies
ALTER TABLE public.lfg_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lfg_members ENABLE ROW LEVEL SECURITY;

-- Listings: Anyone can read, creators can insert/update/delete
CREATE POLICY "LFG listings are viewable by everyone" ON public.lfg_listings FOR SELECT USING (true);
CREATE POLICY "Users can create LFG listings" ON public.lfg_listings FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their LFG listings" ON public.lfg_listings FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their LFG listings" ON public.lfg_listings FOR DELETE USING (auth.uid() = creator_id);

-- Members: Anyone can read, users can join/leave, creators can manage
CREATE POLICY "LFG members are viewable by everyone" ON public.lfg_members FOR SELECT USING (true);
CREATE POLICY "Users can request to join" ON public.lfg_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave or creators can remove" ON public.lfg_members FOR DELETE USING (auth.uid() = user_id OR auth.uid() IN (SELECT creator_id FROM public.lfg_listings WHERE id = listing_id));
CREATE POLICY "Creators can update member status" ON public.lfg_members FOR UPDATE USING (auth.uid() IN (SELECT creator_id FROM public.lfg_listings WHERE id = listing_id));
