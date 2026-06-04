'use client';

import { motion } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Gamepad2,
  Star,
  Eye,
  Heart,
  Users,
} from 'lucide-react';
import { mockPosts, mockProfiles, mockGames, mockClips, mockCurrentProfile } from '@/data/mockData';
import { PostCard } from '@/components/feed/PostCard';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { useState } from 'react';

const gameColors = [
  'from-red-500/30 to-red-900/20',
  'from-blue-500/30 to-blue-900/20',
  'from-purple-500/30 to-purple-900/20',
  'from-green-500/30 to-green-900/20',
  'from-amber-500/30 to-amber-900/20',
  'from-cyan-500/30 to-cyan-900/20',
  'from-pink-500/30 to-pink-900/20',
  'from-indigo-500/30 to-indigo-900/20',
  'from-teal-500/30 to-teal-900/20',
  'from-orange-500/30 to-orange-900/20',
  'from-rose-500/30 to-rose-900/20',
  'from-emerald-500/30 to-emerald-900/20',
];

const playerCounts = [
  '125.4K',
  '98.2K',
  '87.5K',
  '76.1K',
  '45.3K',
  '62.8K',
  '34.2K',
  '28.9K',
  '41.7K',
  '22.3K',
  '51.4K',
  '19.8K',
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const trendingPosts = [...mockPosts]
    .sort((a, b) => b.trending_score - a.trending_score)
    .slice(0, 6);
  const featuredCreators = mockProfiles
    .filter((p) => p.id !== mockCurrentProfile.id)
    .slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-display font-bold text-gradient-brand mb-2">
          Explore
        </h1>
        <p className="text-sm text-gray-400 mb-4">
          Discover trending content, popular games, and top creators
        </p>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search posts, games, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 glass rounded-2xl border border-white/5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-vc-cyan-500/30"
          />
        </div>
      </motion.div>

      {/* Popular Games */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Gamepad2 size={18} className="text-vc-cyan-500" />
          Popular Games
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {mockGames.map((game, i) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.05, y: -4 }}
              className={cn(
                'min-w-[160px] h-[100px] rounded-2xl bg-gradient-to-br flex flex-col justify-end p-3 border border-white/5 cursor-pointer group relative overflow-hidden',
                gameColors[i % gameColors.length]
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="relative z-10">
                <p className="text-sm font-semibold text-white truncate">
                  {game.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-300">
                  <Users size={10} />
                  {playerCounts[i]} playing
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Creators */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Star size={18} className="text-vc-purple-500" />
          Featured Creators
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {featuredCreators.map((creator) => (
            <motion.div
              key={creator.id}
              whileHover={{ scale: 1.03, y: -2 }}
              className="glass rounded-2xl border border-white/5 p-4 text-center cursor-pointer hover:border-vc-purple-500/20 transition-colors"
            >
              <img
                src={creator.avatar_url || ''}
                alt={creator.display_name}
                className="w-14 h-14 rounded-full mx-auto mb-2 bg-vc-dark-600"
              />
              <p className="text-xs font-semibold text-gray-200 truncate">
                {creator.display_name}
              </p>
              <p className="text-[10px] text-gray-500 mb-2">{creator.main_game}</p>
              <p className="text-[10px] text-vc-cyan-400">
                {formatNumber(creator.followers_count || 0)} followers
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-2 w-full py-1 text-[10px] font-medium bg-vc-dark-600 hover:bg-vc-red-500/20 hover:text-vc-red-400 text-gray-400 rounded-lg transition-colors border border-white/5"
              >
                Follow
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Top Clips */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Eye size={18} className="text-vc-red-500" />
          Top Clips
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mockClips.map((clip) => (
            <motion.div
              key={clip.id}
              whileHover={{ scale: 1.02 }}
              className="relative aspect-video rounded-2xl overflow-hidden bg-vc-dark-700 border border-white/5 group cursor-pointer"
            >
              <img
                src={clip.thumbnail_url || ''}
                alt={clip.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-medium text-white truncate">
                  {clip.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-gray-300">
                    {clip.user?.display_name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-300">
                    <span className="flex items-center gap-1">
                      <Eye size={10} /> {formatNumber(clip.views_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={10} /> {formatNumber(clip.likes_count)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Trending Posts */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-green-500" />
          Trending Posts
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {trendingPosts.map((post) => (
            <motion.div key={post.id} variants={item}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}
