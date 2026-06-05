'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Profile } from '@/types';

export async function getProfile(username: string) {
  const supabase = await createServerClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) throw new Error(error.message);

  // Check if current user is following this profile
  const { data: { user } } = await supabase.auth.getUser();
  let is_following = false;

  if (user) {
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .match({ follower_id: user.id, following_id: profile.id })
      .single();
    
    is_following = !!follow;
  }

  return {
    ...profile,
    is_following
  } as Profile;
}

export async function toggleFollow(targetUserId: string, isCurrentlyFollowing: boolean) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  if (user.id === targetUserId) throw new Error('Cannot follow yourself');

  if (isCurrentlyFollowing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ follower_id: user.id, following_id: targetUserId });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId });
    if (error && error.code !== '23505') throw new Error(error.message);
  }

  revalidatePath('/profile/[username]', 'page');
  return !isCurrentlyFollowing;
}

export async function updateProfile(updates: Partial<Profile>) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Prevent updating sensitive fields
  delete updates.id;
  delete updates.created_at;
  delete updates.followers_count;
  delete updates.following_count;
  delete updates.posts_count;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/profile/[username]', 'page');
  return data as Profile;
}
