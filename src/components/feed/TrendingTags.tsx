'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Hash } from 'lucide-react';

const trendingTags = [
  { tag: 'ValorantClips', count: 12500 },
  { tag: 'RadiantGrind', count: 8300 },
  { tag: 'JettDiff', count: 6700 },
  { tag: 'AceClutch', count: 5200 },
  { tag: 'ProPlay', count: 4800 },
  { tag: 'NewAgentMeta', count: 3900 },
  { tag: 'OpFlicks', count: 3100 },
];

function formatCount(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function TrendingTags() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="overflow-hidden rounded-2xl border border-white/5 bg-vc-dark-700/50 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
        <TrendingUp size={16} className="text-vc-cyan-500" />
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-white">
          Trending
        </h3>
      </div>

      <div className="divide-y divide-white/5">
        {trendingTags.map((item, idx) => (
          <motion.button
            key={item.tag}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + idx * 0.05, duration: 0.3 }}
            className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-vc-dark-600/50"
          >
            <div className="flex items-center gap-2.5">
              <Hash size={14} className="text-vc-cyan-400" />
              <span className="text-sm font-medium text-gray-200">{item.tag}</span>
            </div>
            <span className="text-xs text-gray-500">{formatCount(item.count)} posts</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
