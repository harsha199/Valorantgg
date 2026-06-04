'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon, label, value, color = 'vc-cyan' }: StatCardProps) {
  const glowMap: Record<string, string> = {
    'vc-red': 'neon-glow-red',
    'vc-cyan': 'neon-glow-cyan',
    'vc-purple': 'neon-glow-purple',
  };

  const borderMap: Record<string, string> = {
    'vc-red': 'hover:border-vc-red-500/20',
    'vc-cyan': 'hover:border-vc-cyan-500/20',
    'vc-purple': 'hover:border-vc-purple-500/20',
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group overflow-hidden rounded-2xl border border-white/5 bg-vc-dark-700/50 p-5 backdrop-blur-xl transition-all',
        borderMap[color] ?? 'hover:border-vc-cyan-500/20'
      )}
    >
      <div className={cn(
        'transition-shadow duration-300 group-hover:shadow-lg',
        glowMap[color] && `group-hover:${glowMap[color]}`
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vc-dark-600/50">
            {icon}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              {label}
            </p>
            <p className="font-display text-xl font-bold text-white">{value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
