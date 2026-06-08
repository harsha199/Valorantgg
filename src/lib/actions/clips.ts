'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Clip } from '@/types';

export async function createClip(input: {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  game_id?: string;
}) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: game } = await supabase
    .from('games')
    .select('id')
    .eq('name', 'Valorant')
    .single();

  const gameId = input.game_id || game?.id || null;

  // Insert clip record
  const { data: clip, error } = await supabase
    .from('clips')
    .insert({
      user_id: user.id,
      game_id: gameId,
      title: input.title,
      description: input.description || '',
      video_url: input.video_url,
      thumbnail_url: input.thumbnail_url || '/placeholders/clip-thumb.jpg',
      status: 'ready', // Immediately ready for simplicity in simulation
      views_count: Math.floor(Math.random() * 50) + 10,
      likes_count: 0
    })
    .select('*, user:profiles(*)')
    .single();

  if (error) {
    console.error('Error inserting clip in DB:', error.message);
    throw new Error(error.message);
  }

  // Double check and insert a post of type 'clip' so it shows up in explore / home feeds!
  const postContent = `🎥 New Clip: ${input.title}\n\n${input.description || ''}`;
  const { error: postError } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: postContent,
      media_urls: [input.video_url],
      post_type: 'clip',
      visibility: 'public'
    });

  if (postError) {
    console.error('Error auto-creating clip post:', postError.message);
  }

  revalidatePath('/profile/[username]', 'page');
  revalidatePath('/explore');
  return clip as Clip;
}

export async function getUserClips(userId: string) {
  const supabase = await createServerClient();

  const { data: clips, error } = await supabase
    .from('clips')
    .select('*, user:profiles(*), game:games(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading user clips:', error.message);
    throw new Error(error.message);
  }

  return clips as Clip[];
}

export async function getTopClips(limit = 6) {
  const supabase = await createServerClient();

  const { data: clips, error } = await supabase
    .from('clips')
    .select('*, user:profiles(*), game:games(*)')
    .order('views_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error loading top clips:', error.message);
    throw new Error(error.message);
  }

  return clips as Clip[];
}
