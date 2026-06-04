'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, BadgeCheck, MessageCircle, UserPlus, Edit3 } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { GameBadge } from './GameBadge';
import type { Profile } from '@/types';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
}

export function ProfileHeader({ profile, isOwnProfile = false }: ProfileHeaderProps) {
  const initials = profile.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-2xl border border-white/5 bg-vc-dark-700/50 backdrop-blur-xl"
    >
      {/* Banner */}
      <div className="relative h-40 sm:h-52">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-vc-red-500/30 via-vc-purple-500/20 to-vc-cyan-500/30" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-vc-dark-700/90 via-transparent to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative px-5 pb-5 sm:px-6">
        {/* Avatar */}
        <div className="-mt-14 mb-4 flex items-end justify-between sm:-mt-16">
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="h-24 w-24 rounded-2xl border-4 border-vc-dark-700 object-cover shadow-xl sm:h-28 sm:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-vc-dark-700 bg-gradient-to-br from-vc-red-500 to-vc-purple-500 font-display text-2xl font-bold text-white shadow-xl sm:h-28 sm:w-28 sm:text-3xl">
                {initials}
              </div>
            )}
            {/* Online indicator */}
            {profile.is_online && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-3 border-vc-dark-700 bg-emerald-500" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-vc-dark-600/50 px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white"
              >
                <Edit3 size={14} />
                Edit Profile
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-vc-dark-600/50 px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white"
                >
                  <MessageCircle size={14} />
                  Message
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
                    profile.is_following
                      ? 'border border-vc-red-500/30 bg-vc-red-500/10 text-vc-red-400 hover:bg-vc-red-500/20'
                      : 'bg-gradient-to-r from-vc-red-500 to-vc-purple-500 text-white shadow-lg shadow-vc-red-500/25'
                  )}
                >
                  <UserPlus size={14} />
                  {profile.is_following ? 'Following' : 'Follow'}
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Name & Badge */}
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl">
            {profile.display_name}
          </h1>
          {profile.is_verified && (
            <BadgeCheck size={18} className="text-vc-cyan-500" />
          )}
          {profile.rank && <GameBadge rank={profile.rank} game={profile.main_game ?? undefined} />}
        </div>

        <p className="mt-0.5 text-sm text-gray-500">@{profile.username}</p>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {profile.bio}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          {profile.region && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {profile.region}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Stats Row */}
        <div className="mt-5 flex items-center gap-6">
          <div className="text-center">
            <span className="font-display text-lg font-bold text-white">
              {formatNumber(profile.posts_count ?? 0)}
            </span>
            <span className="ml-1.5 text-xs text-gray-500">Posts</span>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-bold text-white">
              {formatNumber(profile.followers_count ?? 0)}
            </span>
            <span className="ml-1.5 text-xs text-gray-500">Followers</span>
          </div>
          <div className="text-center">
            <span className="font-display text-lg font-bold text-white">
              {formatNumber(profile.following_count ?? 0)}
            </span>
            <span className="ml-1.5 text-xs text-gray-500">Following</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
