'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Profile } from '@/types';

export async function syncRiotStats(riotId: string) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const parts = riotId.split('#');
  const name = parts[0]?.trim();
  const tag = parts[1]?.trim() || 'NA1';

  if (!name) {
    throw new Error('Riot ID must be in the format Name#Tag (e.g., TenZ#NA1)');
  }

  console.log(`Syncing Riot account: ${name}#${tag}`);

  // In production, we would call Riot API endpoint here:
  // e.g. fetch(`https://api.riotgames.com/val/content/v1/contents?api_key=${process.env.RIOT_API_KEY}`)
  // For now, we will perform a high-quality simulation mapping custom tags or tags to stats.
  let rank = 'Diamond 2';
  let kdRatio = 1.15;
  let winRate = 52;
  let matches = 145;
  let hours = 210;

  const lowerName = name.toLowerCase();
  if (lowerName === 'tenz' || lowerName === 'shroud' || lowerName === 'XXXXX') {
    rank = 'Radiant';
    kdRatio = 1.48;
    winRate = 64;
    matches = 422;
    hours = 650;
  } else if (lowerName.startsWith('smurf')) {
    rank = 'Immortal 3';
    kdRatio = 1.62;
    winRate = 72;
    matches = 88;
    hours = 120;
  } else {
    // Generate randomized but realistic stats based on tag hash
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ranks = ['Gold 3', 'Platinum 2', 'Platinum 3', 'Diamond 1', 'Diamond 3', 'Ascendant 1', 'Ascendant 3', 'Immortal 1'];
    rank = ranks[hash % ranks.length];
    kdRatio = parseFloat((0.95 + (hash % 50) / 100).toFixed(2));
    winRate = 48 + (hash % 15);
    matches = 50 + (hash % 200);
    hours = Math.round(matches * 1.4);
  }

  const riotStats = {
    riot_id: `${name}#${tag}`,
    kd_ratio: kdRatio,
    win_rate: `${winRate}%`,
    matches_played: matches,
    hours_played: hours,
    synced_at: new Date().toISOString()
  };

  // Update profiles row
  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      rank,
      main_game: 'Valorant',
      riot_stats: riotStats
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile with Riot stats:', error.message);
    throw new Error(error.message);
  }

  revalidatePath('/profile/[username]', 'page');
  revalidatePath('/settings');
  return profile as Profile;
}
