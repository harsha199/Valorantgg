import { cn } from '@/lib/utils';

interface GameBadgeProps {
  rank: string;
  game?: string;
}

const rankTierColors: Record<string, string> = {
  iron: 'border-gray-500 text-gray-400 bg-gray-500/10',
  bronze: 'border-amber-700 text-amber-600 bg-amber-700/10',
  silver: 'border-slate-400 text-slate-300 bg-slate-400/10',
  gold: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
  platinum: 'border-vc-cyan-500 text-vc-cyan-400 bg-vc-cyan-500/10',
  diamond: 'border-blue-500 text-blue-400 bg-blue-500/10',
  ascendant: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
  immortal: 'border-vc-red-500 text-vc-red-400 bg-vc-red-500/10',
  radiant: 'border-yellow-400 text-yellow-300 bg-yellow-400/10 shadow-[0_0_8px_rgba(250,204,21,0.2)]',
};

function getRankTier(rank: string): string {
  const lower = rank.toLowerCase();
  for (const tier of Object.keys(rankTierColors)) {
    if (lower.includes(tier)) return tier;
  }
  return 'silver';
}

export function GameBadge({ rank, game }: GameBadgeProps) {
  const tier = getRankTier(rank);
  const colorClasses = rankTierColors[tier] ?? rankTierColors.silver;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider',
        colorClasses
      )}
    >
      {rank}
    </span>
  );
}
