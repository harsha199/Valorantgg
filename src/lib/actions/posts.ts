'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Post, CreatePostInput } from '@/types';

export async function getFeed(page = 1, limit = 10) {
  const supabase = await createServerClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*),
      likes!left(id, user_id)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  // Get current user to determine if they liked the post
  const { data: { user } } = await supabase.auth.getUser();

  const formattedData = data.map((post: any) => ({
    ...post,
    is_liked: user ? post.likes.some((l: any) => l.user_id === user.id) : false,
  }));

  return {
    data: formattedData as Post[],
    hasMore: count ? from + data.length < count : false,
  };
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: input.content,
      media_urls: input.media_urls || [],
      post_type: input.post_type || 'text',
      visibility: input.visibility || 'public',
    })
    .select('*, author:profiles(*)')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/');
  return data;
}

export async function toggleLike(postId: string, isCurrentlyLiked: boolean) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (isCurrentlyLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ post_id: postId, user_id: user.id });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: user.id });
    // Ignore duplicate key errors if they accidentally multi-click
    if (error && error.code !== '23505') throw new Error(error.message);
  }

  revalidatePath('/');
  return !isCurrentlyLiked;
}
