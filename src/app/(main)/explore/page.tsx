'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Gamepad2,
  Star,
  Eye,
  Heart,
  Users,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { cn, formatNumber } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getExploreData, searchExplore } from '@/lib/actions/explore';
import { useToggleFollow } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';

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

function FeaturedCreatorCard({ creator }: { creator: any }) {
  const { profile: currentUser } = useAuthStore();
  const toggleFollowMutation = useToggleFollow();

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please sign in to follow creators.');
      return;
    }
    toggleFollowMutation.mutate({
      targetUserId: creator.id,
      username: creator.username,
      isCurrentlyFollowing: !!creator.is_following,
    });
  };

  const initials = creator.display_name
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="glass rounded-2xl border border-white/5 p-4 text-center cursor-pointer hover:border-vc-purple-500/20 transition-colors"
    >
      {creator.avatar_url ? (
        <img
          src={creator.avatar_url}
          alt={creator.display_name}
          className="w-14 h-14 rounded-full mx-auto mb-2 bg-vc-dark-600 object-cover"
        />
      ) : (
        <div className="w-14 h-14 rounded-full mx-auto mb-2 bg-gradient-to-br from-vc-red-500 to-vc-purple-500 flex items-center justify-center font-display text-lg font-bold text-white">
          {initials}
        </div>
      )}
      <p className="text-xs font-semibold text-gray-200 truncate">
        {creator.display_name}
      </p>
      <p className="text-[10px] text-gray-500 mb-2">{creator.main_game || 'Valorant'}</p>
      <p className="text-[10px] text-vc-cyan-400">
        {formatNumber(creator.followers_count || 0)} followers
      </p>
      
      {currentUser?.id !== creator.id && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFollowToggle}
          disabled={toggleFollowMutation.isPending}
          className={cn(
            "mt-2 w-full py-1 text-[10px] font-medium rounded-lg transition-colors border",
            creator.is_following
              ? "bg-vc-dark-600 border-white/10 text-gray-400 hover:bg-vc-red-500/10 hover:text-vc-red-400 hover:border-vc-red-500/20"
              : "bg-vc-dark-600 text-gray-400 border-white/5 hover:bg-vc-purple-500/20 hover:text-vc-purple-400 hover:border-vc-purple-500/30"
          )}
        >
          {creator.is_following ? 'Following' : 'Follow'}
        </motion.button>
      )}
    </motion.div>
  );
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Handle search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch explore default data
  const { data: exploreData, isLoading: isExploreLoading } = useQuery({
    queryKey: ['explore-default'],
    queryFn: () => getExploreData(),
    enabled: !debouncedQuery,
  });

  // Fetch search data
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['explore-search', debouncedQuery],
    queryFn: () => searchExplore(debouncedQuery),
    enabled: !!debouncedQuery,
  });

  const isSearchActive = !!debouncedQuery;
  const isLoading = isSearchActive ? isSearching : isExploreLoading;

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

        {/* Search Input */}
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
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-vc-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!isSearchActive ? (
          // Default Explore View
          <motion.div
            key="default-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Popular Games */}
            <motion.section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Gamepad2 size={18} className="text-vc-cyan-500" />
                Popular Games
              </h2>
              {isExploreLoading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="min-w-[160px] h-[100px] rounded-2xl bg-vc-dark-700/50 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {exploreData?.games.map((game, i) => (
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
                          {playerCounts[i % playerCounts.length]} playing
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Featured Creators */}
            <motion.section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Star size={18} className="text-vc-purple-500" />
                Featured Creators
              </h2>
              {isExploreLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-vc-dark-700/50 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {exploreData?.creators.map((creator) => (
                    <FeaturedCreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              )}
            </motion.section>

            {/* Top Clips */}
            <motion.section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Eye size={18} className="text-vc-red-500" />
                Top Clips
              </h2>
              {isExploreLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-video rounded-2xl bg-vc-dark-700/50 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {exploreData?.clips.map((clip) => (
                    <motion.div
                      key={clip.id}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-video rounded-2xl overflow-hidden bg-vc-dark-700 border border-white/5 group cursor-pointer"
                    >
                      {clip.thumbnail_url ? (
                        <img
                          src={clip.thumbnail_url}
                          alt={clip.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-vc-dark-700 to-vc-dark-600 flex items-center justify-center" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-xs font-medium text-white truncate">
                          {clip.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-gray-300">
                            {clip.user?.display_name || 'Gamer'}
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
                  {exploreData?.clips.length === 0 && (
                    <div className="col-span-full text-center py-6 text-gray-500 text-sm">
                      No clips available yet.
                    </div>
                  )}
                </div>
              )}
            </motion.section>

            {/* Trending Posts */}
            <motion.section>
              <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-500" />
                Trending Posts
              </h2>
              {isExploreLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-40 rounded-2xl bg-vc-dark-700/50 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {exploreData?.trendingPosts.map((post) => (
                    <motion.div key={post.id} variants={item}>
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                  {exploreData?.trendingPosts.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm">
                      No trending posts found.
                    </div>
                  )}
                </motion.div>
              )}
            </motion.section>
          </motion.div>
        ) : (
          // Search Results View
          <motion.div
            key="search-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Creators Results */}
            <section>
              <h2 className="text-md font-semibold text-gray-300 mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                <Users size={16} className="text-vc-purple-400" />
                Creators
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-vc-dark-700/50 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : searchResults?.profiles && searchResults.profiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {searchResults.profiles.map((creator) => (
                    <FeaturedCreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 pl-2">No creators match your search query.</p>
              )}
            </section>

            {/* Games Results */}
            <section>
              <h2 className="text-md font-semibold text-gray-300 mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                <Gamepad2 size={16} className="text-vc-cyan-400" />
                Games
              </h2>
              {isLoading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="min-w-[160px] h-[100px] rounded-2xl bg-vc-dark-700/50 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : searchResults?.games && searchResults.games.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {searchResults.games.map((game, i) => (
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 pl-2">No games match your search query.</p>
              )}
            </section>

            {/* Posts Results */}
            <section>
              <h2 className="text-md font-semibold text-gray-300 mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                <TrendingUp size={16} className="text-green-400" />
                Posts
              </h2>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-36 rounded-2xl bg-vc-dark-700/50 animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : searchResults?.posts && searchResults.posts.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 pl-2">No posts match your search query.</p>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
