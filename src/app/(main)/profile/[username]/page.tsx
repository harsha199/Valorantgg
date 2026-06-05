'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Edit3,
  MessageSquare,
  UserPlus,
  Trophy,
  Target,
  Clock,
  Gamepad2,
  TrendingUp,
  Eye,
  Heart,
} from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { StatCard } from '@/components/profile/StatCard';
import { GameBadge } from '@/components/profile/GameBadge';
import { mockClips } from '@/data/mockData';
import { cn, formatNumber } from '@/lib/utils';
import { useProfile, useToggleFollow } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';

const tabs = ['Posts', 'Clips', 'Stats'] as const;

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Posts');
  const { profile: currentUserProfile } = useAuthStore();

  const { data: profile, isLoading: isProfileLoading, isError } = useProfile(username);

  // Fetch only this user's posts
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { data: [] };
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(*), likes!left(id, user_id)')
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return {
        data: (data || []).map((post: any) => ({
          ...post,
          is_liked: currentUserProfile ? post.likes.some((l: any) => l.user_id === currentUserProfile.id) : false,
        }))
      };
    },
    enabled: !!profile?.id,
  });

  const toggleFollowMutation = useToggleFollow();

  if (isProfileLoading) {
    return (
      <div className="max-w-4xl mx-auto w-full py-12">
        <FeedSkeleton />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-4xl mx-auto w-full text-center py-12">
        <h2 className="text-xl font-bold text-red-500">Profile Not Found</h2>
        <p className="text-gray-400 mt-2">The user @{username} does not exist.</p>
      </div>
    );
  }

  const isOwnProfile = currentUserProfile?.id === profile.id;
  const userPosts = postsData?.data || [];
  const userClips = mockClips.filter((c) => c.user_id === profile.id);

  const handleFollowToggle = () => {
    toggleFollowMutation.mutate({
      targetUserId: profile.id,
      username: profile.username,
      isCurrentlyFollowing: !!profile.is_following,
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/5 overflow-hidden mb-6"
      >
        {/* Banner */}
        <div className="h-48 bg-gradient-to-br from-vc-red-500/30 via-vc-purple-500/20 to-vc-cyan-500/30 relative">
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt="Banner"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,70,85,0.3),transparent_70%)]" />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4 flex items-end justify-between">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-28 h-28 rounded-full border-4 border-vc-dark-800 bg-vc-dark-600 object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-vc-dark-800 bg-gradient-to-br from-vc-red-500 to-vc-purple-500 flex items-center justify-center font-display text-2xl font-bold text-white">
                  {profile.display_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              {profile.is_online && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-vc-dark-800" />
              )}
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 bg-vc-dark-600 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-vc-dark-500 transition-colors flex items-center gap-2"
                >
                  <Edit3 size={14} /> Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleFollowToggle}
                    disabled={toggleFollowMutation.isPending}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                      profile.is_following
                        ? "bg-vc-dark-600 border border-white/10 text-gray-300 hover:bg-vc-dark-500"
                        : "bg-gradient-to-r from-vc-red-500 to-vc-red-600 text-white hover:shadow-lg hover:shadow-vc-red-500/20"
                    )}
                  >
                    <UserPlus size={14} /> {profile.is_following ? 'Following' : 'Follow'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 bg-vc-dark-600 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-vc-dark-500 transition-colors"
                  >
                    <MessageSquare size={14} />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Name & Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-100">
                {profile.display_name}
              </h1>
              {profile.is_verified && (
                <div className="w-5 h-5 rounded-full bg-vc-cyan-500 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              )}
              <GameBadge rank={profile.rank || ''} />
            </div>
            <p className="text-sm text-gray-500 mb-2">@{profile.username}</p>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              {profile.bio}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {profile.main_game && (
                <span className="flex items-center gap-1">
                  <Gamepad2 size={12} className="text-vc-red-400" />
                  {profile.main_game}
                </span>
              )}
              {profile.region && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {profile.region}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Joined{' '}
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(profile.posts_count || 0)}
              </p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(profile.followers_count || 0)}
              </p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(profile.following_count || 0)}
              </p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-vc-dark-700/50 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-vc-dark-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Posts' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {isPostsLoading ? (
            <FeedSkeleton />
          ) : userPosts.length > 0 ? (
            userPosts.map((post: any) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-12 text-gray-500">No posts yet</div>
          )}
        </motion.div>
      )}

      {activeTab === 'Clips' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
        >
          {userClips.map((clip) => (
            <motion.div
              key={clip.id}
              whileHover={{ scale: 1.03 }}
              className="relative aspect-video rounded-xl overflow-hidden bg-vc-dark-700 border border-white/5 group cursor-pointer"
            >
              <img
                src={clip.thumbnail_url || ''}
                alt={clip.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-medium text-white truncate">
                  {clip.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-300">
                  <span className="flex items-center gap-1">
                    <Eye size={10} /> {formatNumber(clip.views_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={10} /> {formatNumber(clip.likes_count)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'Stats' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<Target size={20} />}
            label="K/D Ratio"
            value="1.42"
            color="text-vc-red-400"
          />
          <StatCard
            icon={<Trophy size={20} />}
            label="Win Rate"
            value="58%"
            color="text-vc-cyan-400"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Hours Played"
            value="2,847"
            color="text-vc-purple-400"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Matches"
            value="4,156"
            color="text-green-400"
          />
        </motion.div>
      )}
    </div>
  );
}
