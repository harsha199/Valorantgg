'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Users } from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { TrendingTags } from '@/components/feed/TrendingTags';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { mockPosts, mockProfiles, mockCurrentProfile } from '@/data/mockData';
import { cn } from '@/lib/utils';

const suggestedUsers = mockProfiles.filter((p) => p.id !== 'user-1').slice(0, 4);

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
  const [isLoading] = useState(false);

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
              {mockCurrentProfile.display_name.charAt(0)}
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-xl bg-vc-dark-600/50 text-gray-400 hover:bg-vc-dark-600 hover:text-gray-300 transition-colors cursor-text"
            >
              What&apos;s on your mind, {mockCurrentProfile.display_name.split(' ')[0]}?
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
            {mockPosts.map((post) => (
              <motion.div key={post.id} variants={item}>
                <PostCard post={post} />
              </motion.div>
            ))}
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
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <img
                  src={user.avatar_url || ''}
                  alt={user.display_name}
                  className="w-9 h-9 rounded-full bg-vc-dark-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.main_game} · {user.rank}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 text-xs font-medium bg-vc-dark-600 hover:bg-vc-red-500/20 hover:text-vc-red-400 text-gray-400 rounded-lg transition-colors border border-white/5"
                >
                  Follow
                </motion.button>
              </div>
            ))}
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
