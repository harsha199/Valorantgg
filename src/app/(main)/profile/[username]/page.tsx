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
  Upload,
  X,
  Play,
} from 'lucide-react';
import { PostCard } from '@/components/feed/PostCard';
import { StatCard } from '@/components/profile/StatCard';
import { GameBadge } from '@/components/profile/GameBadge';
import { cn, formatNumber } from '@/lib/utils';
import { useProfile, useToggleFollow } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { useUserClips, useCreateClip } from '@/hooks/useClips';

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

  const { data: userClips, isLoading: isClipsLoading } = useUserClips(profile?.id);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createClipMutation = useCreateClip();

  const handleClipUpload = async () => {
    if (!uploadFile || !uploadTitle.trim() || !profile) return;
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      setUploadProgress(20);

      const fileExt = uploadFile.name.split('.').pop() || 'mp4';
      const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadProgress(40);
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 80 ? prev + 10 : prev));
      }, 500);

      const { error: uploadError } = await supabase.storage
        .from('clips')
        .upload(filePath, uploadFile, { upsert: true });

      clearInterval(interval);
      if (uploadError) throw uploadError;

      setUploadProgress(85);
      const { data: { publicUrl } } = supabase.storage
        .from('clips')
        .getPublicUrl(filePath);

      setUploadProgress(95);

      await createClipMutation.mutateAsync({
        title: uploadTitle.trim(),
        description: uploadDescription.trim(),
        video_url: publicUrl,
        thumbnail_url: '/placeholders/clip-thumb.jpg',
      });

      setUploadProgress(100);
      alert('Gameplay clip published successfully!');
      
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      setIsUploadModalOpen(false);
    } catch (err: any) {
      console.error('Failed to upload clip:', err);
      alert(`Failed to upload clip: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
          className="space-y-4"
        >
          {isOwnProfile && (
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-vc-red-500 to-vc-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:shadow-lg hover:shadow-vc-red-500/15"
              >
                <Upload size={14} />
                Upload Clip
              </motion.button>
            </div>
          )}

          {isClipsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="aspect-video rounded-xl bg-vc-dark-700/50 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : userClips && userClips.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {userClips.map((clip) => (
                <motion.div
                  key={clip.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedVideoUrl(clip.video_url || null)}
                  className="relative aspect-video rounded-xl overflow-hidden bg-vc-dark-700 border border-white/5 group cursor-pointer"
                >
                  <img
                    src={clip.thumbnail_url || '/placeholders/clip-thumb.jpg'}
                    alt={clip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                      <Play size={16} fill="white" className="ml-0.5" />
                    </div>
                  </div>
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
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Gamepad2 className="mx-auto mb-2 opacity-40" size={32} />
              No gameplay clips yet
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'Stats' && (
        profile.riot_stats ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard
              icon={<Target size={20} />}
              label="K/D Ratio"
              value={profile.riot_stats.kd_ratio.toString()}
              color="text-vc-red-400"
            />
            <StatCard
              icon={<Trophy size={20} />}
              label="Win Rate"
              value={profile.riot_stats.win_rate}
              color="text-vc-cyan-400"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="Hours Played"
              value={formatNumber(profile.riot_stats.hours_played)}
              color="text-vc-purple-400"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Matches"
              value={formatNumber(profile.riot_stats.matches_played)}
              color="text-green-400"
            />
          </motion.div>
        ) : (
          <div className="text-center py-12 glass rounded-2xl border border-white/5 p-6">
            <Gamepad2 className="mx-auto mb-3 text-gray-500" size={36} />
            <h3 className="text-sm font-semibold text-gray-300">Riot Account Not Linked</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Live competitive stats (rank, KD, win rate, hours) are not available.
              {isOwnProfile && " Connect your Riot account in settings to import them."}
            </p>
            {isOwnProfile && (
              <a
                href="/settings"
                className="inline-block mt-4 px-4 py-2 bg-vc-dark-600 hover:bg-vc-dark-500 border border-white/10 text-xs font-semibold rounded-lg text-gray-300 transition-colors"
              >
                Go to Settings
              </a>
            )}
          </div>
        )
      )}

      {/* Video Player Overlay */}
      {selectedVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-4xl w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10"
          >
            <button
              onClick={() => setSelectedVideoUrl(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/10"
            >
              <X size={16} />
            </button>
            <video
              src={selectedVideoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          </motion.div>
        </div>
      )}

      {/* Upload Clip Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-vc-dark-800 border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-semibold text-gray-200 text-sm">Upload Gameplay Clip</h3>
              <button
                onClick={() => {
                  if (!isUploading) setIsUploadModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Amazing 4K clutch!"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 bg-vc-dark-700 border border-white/5 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-vc-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Briefly describe your highlight play..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  disabled={isUploading}
                  rows={2}
                  className="w-full px-3 py-2 bg-vc-dark-700 border border-white/5 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-vc-cyan-500/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Video File (.mp4)</label>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  disabled={isUploading}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-vc-dark-600 file:text-gray-300 hover:file:bg-vc-dark-500 file:cursor-pointer"
                />
              </div>

              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Uploading gameplay clip...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-vc-dark-600 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-vc-red-500 to-vc-purple-500 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
              <button
                disabled={isUploading}
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-vc-dark-600 hover:bg-vc-dark-500 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isUploading || !uploadTitle.trim() || !uploadFile}
                onClick={handleClipUpload}
                className="px-4 py-2 bg-gradient-to-r from-vc-red-500 to-vc-purple-500 hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all"
              >
                {isUploading ? 'Uploading...' : 'Publish Clip'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
