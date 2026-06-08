'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  Film,
  Smile,
  Globe,
  Users,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Visibility } from '@/types';
import { useCreatePost } from '@/hooks/usePosts';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_CHARS = 500;

const visibilityOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'public', label: 'Public', icon: <Globe size={14} /> },
  { value: 'followers', label: 'Followers', icon: <Users size={14} /> },
  { value: 'private', label: 'Private', icon: <Lock size={14} /> },
];

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [showVisibility, setShowVisibility] = useState(false);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canPost = content.trim().length > 0 && !isOverLimit;

  const { mutate: createPost, isPending } = useCreatePost();

  const selectedVisibility = visibilityOptions.find((v) => v.value === visibility)!;

  const handlePost = () => {
    if (!canPost || isPending) return;
    createPost(
      { content, visibility, post_type: 'text' },
      {
        onSuccess: () => {
          setContent('');
          setVisibility('public');
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-20"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/5 bg-vc-dark-700/90 backdrop-blur-xl shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Create Post
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-vc-dark-600 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in your game?"
                rows={5}
                className="w-full resize-none rounded-xl border border-white/5 bg-vc-dark-800/50 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-vc-red-500/30 focus:outline-none focus:ring-1 focus:ring-vc-red-500/20"
                autoFocus
              />

              {/* Character count */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Visibility dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowVisibility(!showVisibility)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-vc-dark-600 hover:text-gray-300"
                    >
                      {selectedVisibility.icon}
                      <span>{selectedVisibility.label}</span>
                      <ChevronDown size={12} />
                    </button>

                    <AnimatePresence>
                      {showVisibility && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute left-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-white/5 bg-vc-dark-600 shadow-xl"
                        >
                          {visibilityOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setVisibility(opt.value);
                                setShowVisibility(false);
                              }}
                              className={cn(
                                'flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors',
                                visibility === opt.value
                                  ? 'bg-vc-red-500/10 text-vc-red-400'
                                  : 'text-gray-400 hover:bg-vc-dark-500 hover:text-white'
                              )}
                            >
                              {opt.icon}
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <span
                  className={cn(
                    'text-xs font-medium',
                    isOverLimit ? 'text-vc-red-500' : 'text-gray-600'
                  )}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>

              {/* Media Buttons */}
              <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-vc-cyan-500/10 hover:text-vc-cyan-400">
                  <ImageIcon size={16} />
                  Image
                </button>
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-vc-purple-500/10 hover:text-vc-purple-400">
                  <Film size={16} />
                  Clip
                </button>
                <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-amber-500/10 hover:text-amber-400">
                  <Smile size={16} />
                  GIF
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-white/5 px-5 py-4">
              <button
                onClick={handlePost}
                disabled={!canPost || isPending}
                className={cn(
                  'rounded-xl px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white transition-all',
                  canPost && !isPending
                    ? 'bg-gradient-to-r from-vc-red-500 to-vc-purple-500 shadow-lg shadow-vc-red-500/25 hover:shadow-vc-red-500/40'
                    : 'cursor-not-allowed bg-vc-dark-600 text-gray-600'
                )}
              >
                {isPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
