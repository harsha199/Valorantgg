'use client';

import { useState, useEffect } from 'react';
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
import { useToggleLike } from '@/hooks/usePosts';
import { useAuthStore } from '@/stores/authStore';
import { useComments, useCreateComment } from '@/hooks/useComments';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { profile: currentUser } = useAuthStore();
  const toggleLikeMutation = useToggleLike();

  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked ?? false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const { data: comments, isLoading: isLoadingComments } = useComments(post.id);
  const createCommentMutation = useCreateComment(post.id);

  useEffect(() => {
    setLiked(post.is_liked ?? false);
    setLikesCount(post.likes_count);
  }, [post.is_liked, post.likes_count]);

  const author = post.author;

  const initials = author?.display_name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';

  const handleLike = () => {
    if (!currentUser) {
      alert('Please sign in to like posts.');
      return;
    }
    if (!liked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 600);
    }
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    toggleLikeMutation.mutate({ postId: post.id, isCurrentlyLiked: liked });
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
            <button 
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                showComments
                  ? "text-vc-cyan-400 bg-vc-cyan-500/10"
                  : "text-gray-500 hover:bg-vc-cyan-500/10 hover:text-vc-cyan-400"
              )}
            >
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

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t border-white/5 pt-4 space-y-4 overflow-hidden"
            >
              {/* Write Comment */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-vc-dark-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {currentUser?.display_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-grow flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (commentInput.trim() && currentUser) {
                          createCommentMutation.mutate({ content: commentInput }, {
                            onSuccess: () => setCommentInput(''),
                            onError: (err) => alert(`Failed to post comment: ${err.message}`)
                          });
                        }
                      }
                    }}
                    className="flex-grow px-3 py-1.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-vc-cyan-500/30"
                  />
                  <button 
                    onClick={() => {
                      if (commentInput.trim() && currentUser) {
                        createCommentMutation.mutate({ content: commentInput }, {
                          onSuccess: () => setCommentInput(''),
                          onError: (err) => alert(`Failed to post comment: ${err.message}`)
                        });
                      }
                    }}
                    disabled={createCommentMutation.isPending || !commentInput.trim() || !currentUser}
                    className="px-3 py-1.5 bg-vc-cyan-500 hover:bg-vc-cyan-600 disabled:bg-vc-dark-600 disabled:text-gray-500 text-white font-medium rounded-xl text-xs transition-colors shrink-0"
                  >
                    {createCommentMutation.isPending ? 'Sending...' : 'Reply'}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-vc-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5 items-start">
                      {comment.author?.avatar_url ? (
                        <img 
                          src={comment.author.avatar_url} 
                          alt="" 
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-vc-dark-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                          {comment.author?.display_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="bg-vc-dark-600/30 rounded-xl px-3 py-2 border border-white/5 flex-grow">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-200 truncate">
                            {comment.author?.display_name || 'Gamer'}
                          </span>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">No comments yet. Be the first to reply!</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
