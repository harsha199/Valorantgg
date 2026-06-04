'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  BadgeCheck,
} from 'lucide-react';
import { cn, getRelativeTime as formatRelativeTime, formatNumber } from '@/lib/utils';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked ?? false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const author = post.author;

  const initials = author?.display_name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';

  const handleLike = () => {
    if (!liked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 600);
    }
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-vc-dark-700/50 backdrop-blur-xl"
    >
      {/* Top edge glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-vc-red-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="p-5">
        {/* Author Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {author?.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.display_name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-vc-dark-600"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-vc-red-500 to-vc-purple-500 font-display text-xs font-bold text-white ring-2 ring-vc-dark-600">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-white">
                  {author?.display_name ?? 'Unknown'}
                </span>
                {author?.is_verified && (
                  <BadgeCheck size={14} className="shrink-0 text-vc-cyan-500" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>@{author?.username ?? 'unknown'}</span>
                <span>·</span>
                <span>{formatRelativeTime(post.created_at)}</span>
              </div>
            </div>
          </div>

          <button className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-vc-dark-600 hover:text-gray-300">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
            {post.content}
          </p>
        </div>

        {/* Media */}
        {post.media_urls.length > 0 && (
          <div
            className={cn(
              'mt-4 grid gap-2 overflow-hidden rounded-xl',
              post.media_urls.length === 1 && 'grid-cols-1',
              post.media_urls.length === 2 && 'grid-cols-2',
              post.media_urls.length >= 3 && 'grid-cols-2'
            )}
          >
            {post.media_urls.map((url, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-vc-dark-600 to-vc-dark-700',
                  post.media_urls.length === 3 && idx === 0 && 'row-span-2 aspect-auto h-full',
                  post.media_urls.length === 1 && 'aspect-video'
                )}
              >
                <div className="flex h-full min-h-[200px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-vc-dark-500">
                      <Share2 size={20} className="text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-500">Media content</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-1">
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleLike}
              className={cn(
                'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                liked
                  ? 'text-vc-red-500'
                  : 'text-gray-500 hover:bg-vc-red-500/10 hover:text-vc-red-400'
              )}
            >
              <AnimatePresence>
                {showHeartBurst && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Heart size={14} className="fill-vc-red-500 text-vc-red-500" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Heart
                size={16}
                className={cn(liked && 'fill-vc-red-500')}
              />
              <span>{formatNumber(likesCount)}</span>
            </motion.button>

            {/* Comment */}
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-vc-cyan-500/10 hover:text-vc-cyan-400">
              <MessageCircle size={16} />
              <span>{formatNumber(post.comments_count)}</span>
            </button>

            {/* Share */}
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-vc-purple-500/10 hover:text-vc-purple-400">
              <Share2 size={16} />
              <span>{formatNumber(post.shares_count)}</span>
            </button>
          </div>

          {/* Bookmark */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleBookmark}
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              bookmarked
                ? 'text-vc-purple-500'
                : 'text-gray-500 hover:bg-vc-purple-500/10 hover:text-vc-purple-400'
            )}
          >
            <Bookmark size={16} className={cn(bookmarked && 'fill-vc-purple-500')} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
