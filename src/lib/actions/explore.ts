'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { Post, Profile, Game, Clip } from '@/types';

export async function getExploreData() {
  const supabase = await createServerClient();

  // Get current user to exclude from featured creators
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch popular games
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .order('name', { ascending: true })
    .limit(12);

  if (gamesError) console.error('Error fetching games for explore:', gamesError.message);

  // 2. Fetch featured creators (profiles ordered by follower count, excluding current user)
  let creatorsQuery = supabase
    .from('profiles')
    .select('*')
    .order('followers_count', { ascending: false })
    .limit(6);

  if (user) {
    creatorsQuery = creatorsQuery.neq('id', user.id);
  }

  const { data: creators, error: creatorsError } = await creatorsQuery;
  if (creatorsError) console.error('Error fetching creators for explore:', creatorsError.message);

  // Check follow status for each creator
  let creatorsWithFollowStatus: Profile[] = [];
  if (creators) {
    creatorsWithFollowStatus = await Promise.all(
      creators.map(async (creator) => {
        let is_following = false;
        if (user) {
          const { data: follow } = await supabase
            .from('follows')
            .select('id')
            .match({ follower_id: user.id, following_id: creator.id })
            .single();
          is_following = !!follow;
        }
        return {
          ...creator,
          is_following,
        };
      })
    );
  }

  // 3. Fetch top clips (posts where post_type = 'clip')
  const { data: clips, error: clipsError } = await supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('post_type', 'clip')
    .order('likes_count', { ascending: false })
    .limit(6);

  if (clipsError) console.error('Error fetching clips for explore:', clipsError.message);

  // 4. Fetch trending posts (posts ordered by trending_score)
  const { data: trendingPosts, error: postsError } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*),
      likes!left(id, user_id)
    `)
    .order('trending_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  if (postsError) console.error('Error fetching trending posts for explore:', postsError.message);

  const formattedTrending = trendingPosts ? trendingPosts.map((post: any) => ({
    ...post,
    is_liked: user ? post.likes.some((l: any) => l.user_id === user.id) : false,
  })) : [];

  return {
    games: (games || []) as Game[],
    creators: creatorsWithFollowStatus,
    clips: (clips || []).map((clip) => ({
      id: clip.id,
      user_id: clip.author_id,
      game_id: null,
      title: clip.content.split('\n')[0].slice(0, 50) || 'Epic Clip',
      description: clip.content,
      video_url: clip.media_urls?.[0] || null,
      thumbnail_url: clip.media_urls?.[0] || '/placeholders/clip-thumb.jpg',
      views_count: clip.shares_count * 12 + clip.likes_count * 4 + 10,
      likes_count: clip.likes_count,
      status: 'ready',
      created_at: clip.created_at,
      user: clip.author,
    })) as Clip[],
    trendingPosts: formattedTrending as Post[],
  };
}

export async function searchExplore(query: string) {
  const supabase = await createServerClient();
  const searchPattern = `%${query}%`;

  const { data: { user } } = await supabase.auth.getUser();

  // Search profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.${searchPattern},display_name.ilike.${searchPattern}`)
    .limit(10);

  if (profilesError) console.error('Search profiles error:', profilesError.message);

  // Search games
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .ilike('name', searchPattern)
    .limit(10);

  if (gamesError) console.error('Search games error:', gamesError.message);

  // Search posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*),
      likes!left(id, user_id)
    `)
    .ilike('content', searchPattern)
    .limit(10);

  if (postsError) console.error('Search posts error:', postsError.message);

  const formattedPosts = posts ? posts.map((post: any) => ({
    ...post,
    is_liked: user ? post.likes.some((l: any) => l.user_id === user.id) : false,
  })) : [];

  // Check follow status for searched profiles
  let profilesWithFollowStatus: Profile[] = [];
  if (profiles) {
    profilesWithFollowStatus = await Promise.all(
      profiles.map(async (p) => {
        let is_following = false;
        if (user && p.id !== user.id) {
          const { data: follow } = await supabase
            .from('follows')
            .select('id')
            .match({ follower_id: user.id, following_id: p.id })
            .single();
          is_following = !!follow;
        }
        return {
          ...p,
          is_following,
        };
      })
    );
  }

  return {
    profiles: profilesWithFollowStatus,
    games: (games || []) as Game[],
    posts: formattedPosts as Post[],
  };
}
