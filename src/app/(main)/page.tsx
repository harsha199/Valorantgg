'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Users } from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { TrendingTags } from '@/components/feed/TrendingTags';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { cn } from '@/lib/utils';
import { useFeed } from '@/hooks/usePosts';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { useToggleFollow } from '@/hooks/useProfile';

function SuggestedUserItem({ user }: { user: any }) {
  const { profile: currentUser } = useAuthStore();
  const toggleFollowMutation = useToggleFollow();

  const handleFollowToggle = () => {
    if (!currentUser) {
      alert('Please sign in to follow.');
      return;
    }
    toggleFollowMutation.mutate({
      targetUserId: user.id,
      username: user.username,
      isCurrentlyFollowing: !!user.is_following,
    });
  };

  const initials = user.display_name
    ?.split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-3">
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.display_name}
          className="w-9 h-9 rounded-full bg-vc-dark-600 object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vc-red-500 to-vc-purple-500 flex items-center justify-center font-display text-[10px] font-bold text-white shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">
          {user.display_name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user.main_game || 'Valorant'} · {user.rank || 'Bronze'}
        </p>
      </div>
      {currentUser?.id !== user.id && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFollowToggle}
          disabled={toggleFollowMutation.isPending}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-lg transition-colors border",
            user.is_following
              ? "bg-vc-dark-600 border-white/10 text-gray-400 hover:bg-vc-red-500/10 hover:text-vc-red-400 hover:border-vc-red-500/20"
              : "bg-vc-dark-600 text-gray-400 border-white/5 hover:bg-vc-purple-500/10 hover:text-vc-purple-400 hover:border-vc-purple-500/20"
          )}
        >
          {user.is_following ? 'Following' : 'Follow'}
        </motion.button>
      )}
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { profile, isLoading: isAuthLoading } = useAuthStore();
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed();
  
  const posts = data?.pages.flatMap((page) => page.data) || [];

  const { data: suggestedProfiles = [], isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['suggested-creators', profile?.id],
    queryFn: async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      let q = supabase
        .from('profiles')
        .select('*')
        .order('followers_count', { ascending: false })
        .limit(5);
        
      if (profile?.id) {
        q = q.neq('id', profile.id);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      
      const list = await Promise.all(
        (data || []).map(async (u) => {
          let is_following = false;
          if (profile?.id) {
            const { data: follow } = await supabase
              .from('follows')
              .select('id')
              .match({ follower_id: profile.id, following_id: u.id })
              .single();
            is_following = !!follow;
          }
          return { ...u, is_following };
        })
      );
      
      return list;
    },
    enabled: !isAuthLoading,
  });

  return (
    <div className="flex gap-6 max-w-7xl mx-auto w-full">
      {/* Main Feed */}
      <div className="flex-1 min-w-0">
        {/* Create Post Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-white/5 p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vc-red-500 to-vc-purple-500 flex items-center justify-center text-sm font-bold shrink-0">
              {profile?.display_name?.charAt(0) || 'U'}
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-xl bg-vc-dark-600/50 text-gray-400 hover:bg-vc-dark-600 hover:text-gray-300 transition-colors cursor-text"
            >
              What&apos;s on your mind, {profile?.display_name?.split(' ')[0] || 'Gamer'}?
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreatePost(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-vc-red-500 to-vc-red-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-vc-red-500/20 transition-shadow"
            >
              <Plus size={16} />
              Post
            </motion.button>
          </div>
        </motion.div>

        {/* Feed */}
        {isLoading ? (
          <FeedSkeleton />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {posts.map((post) => (
              <motion.div key={post.id} variants={item}>
                <PostCard post={post as any} />
              </motion.div>
            ))}
            
            {posts.length === 0 && !isLoading && (
              <div className="text-center py-10 text-gray-500">
                No posts yet. Be the first to share!
              </div>
            )}
            
            {hasNextPage && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-4 py-2 text-sm text-vc-red-400 hover:text-vc-red-300 transition-colors"
                >
                  {isFetchingNextPage ? 'Loading more...' : 'Load more'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 shrink-0 space-y-4">
        <TrendingTags />

        {/* Who to Follow */}
        <div className="glass rounded-2xl border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Users size={14} className="text-vc-cyan-500" />
            Who to Follow
          </h3>
          <div className="space-y-3">
            {isLoadingSuggestions ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-vc-dark-600/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : suggestedProfiles.length > 0 ? (
              suggestedProfiles.map((user) => (
                <SuggestedUserItem key={user.id} user={user} />
              ))
            ) : (
              <p className="text-xs text-gray-500">No suggestions available.</p>
            )}
          </div>
        </div>

        {/* Active Games */}
        <div className="glass rounded-2xl border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-vc-purple-500" />
            Your Stats Today
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Posts', value: '3', color: 'text-vc-red-400' },
              { label: 'Likes', value: '47', color: 'text-vc-cyan-400' },
              { label: 'Comments', value: '12', color: 'text-vc-purple-400' },
              { label: 'New Followers', value: '8', color: 'text-green-400' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-vc-dark-600/50 rounded-xl p-3 text-center"
              >
                <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
    </div>
  );
}
