'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { LFGListing, LFGFilters } from '@/types';

export async function getLFGListings(filters?: LFGFilters) {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('lfg_listings')
    .select(`
      *,
      creator:profiles(*),
      game:games(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.game_id) {
    query = query.eq('game_id', filters.game_id);
  }
  if (filters?.region) {
    query = query.eq('region', filters.region);
  }
  if (filters?.play_style) {
    query = query.eq('play_style', filters.play_style);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data as LFGListing[];
}

export async function createLFG(input: Partial<LFGListing>) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('lfg_listings')
    .insert({
      creator_id: user.id,
      game_id: input.game_id,
      title: input.title,
      description: input.description,
      rank_required: input.rank_required,
      region: input.region,
      play_style: input.play_style,
      slots_total: input.slots_total,
      slots_filled: 1, // Creator occupies 1 slot
      status: 'open'
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Add creator as a member
  await supabase.from('lfg_members').insert({
    listing_id: data.id,
    user_id: user.id,
    status: 'accepted'
  });

  revalidatePath('/lfg');
  return data as LFGListing;
}

export async function joinLFG(listingId: string) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('lfg_members')
    .insert({
      listing_id: listingId,
      user_id: user.id,
      status: 'pending'
    });

  if (error && error.code !== '23505') throw new Error(error.message);

  revalidatePath('/lfg');
  return true;
}
