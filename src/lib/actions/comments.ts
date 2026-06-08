'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Comment } from '@/types';

export async function getComments(postId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error.message);
    throw new Error(error.message);
  }

  return data as Comment[];
}

export async function createComment(postId: string, content: string, parentId: string | null = null) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      parent_id: parentId,
      content: content,
    })
    .select(`
      *,
      author:profiles(*)
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error.message);
    throw new Error(error.message);
  }

  // Update comments count on the post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('comments_count')
    .eq('id', postId)
    .single();

  if (!postError && post) {
    await supabase
      .from('posts')
      .update({ comments_count: (post.comments_count || 0) + 1 })
      .eq('id', postId);
  }

  revalidatePath('/');
  return data as Comment;
}
