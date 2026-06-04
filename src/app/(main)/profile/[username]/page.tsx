'use client';

import { useState } from 'react';
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
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatCard } from '@/components/profile/StatCard';
import { GameBadge } from '@/components/profile/GameBadge';
import { mockProfiles, mockPosts, mockClips, mockCurrentProfile } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

const tabs = ['Posts', 'Clips', 'Stats'] as const;

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Posts');

  // For demo, always show user-1 profile
  const profile = mockCurrentProfile;
  const isOwnProfile = true;
  const userPosts = mockPosts.filter((p) => p.author_id === profile.id);
  const userClips = mockClips.filter((c) => c.user_id === profile.id);

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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,70,85,0.3),transparent_70%)]" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4 flex items-end justify-between">
            <div className="relative">
              <img
                src={profile.avatar_url || ''}
                alt={profile.display_name}
                className="w-28 h-28 rounded-full border-4 border-vc-dark-800 bg-vc-dark-600"
              />
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
                    className="px-4 py-2 bg-gradient-to-r from-vc-red-500 to-vc-red-600 rounded-xl text-sm font-medium text-white flex items-center gap-2 hover:shadow-lg hover:shadow-vc-red-500/20"
                  >
                    <UserPlus size={14} /> Follow
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
          {userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
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
