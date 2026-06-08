'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Palette,
  Link2,
  Camera,
  Save,
  Moon,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile } from '@/hooks/useProfile';
import { syncRiotStats } from '@/lib/actions/riot';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'accounts', label: 'Connected Accounts', icon: Link2 },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type SectionId = (typeof settingsSections)[number]['id'];

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors',
        enabled ? 'bg-vc-red-500' : 'bg-vc-dark-500'
      )}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full"
      />
    </button>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  
  const { profile, setProfile } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [mainGame, setMainGame] = useState('');
  const [region, setRegion] = useState('');
  const [rank, setRank] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setUsername(profile.username || '');
      setMainGame(profile.main_game || '');
      setRegion(profile.region || '');
      setRank(profile.rank || '');
      setAvatarUrl(profile.avatar_url || '');
      setBannerUrl(profile.banner_url || '');
    }
  }, [profile]);

  const [theme, setTheme] = useState<'dark' | 'midnight' | 'amoled'>('dark');
  const [notifSettings, setNotifSettings] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    lfg: true,
    clips: false,
  });
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showOnlineStatus: true,
    showGameStats: true,
    allowDMs: true,
  });
  const [connectedAccounts, setConnectedAccounts] = useState({
    discord: true,
    steam: false,
  });
  const [riotIdInput, setRiotIdInput] = useState('');
  const [isSyncingRiot, setIsSyncingRiot] = useState(false);
  const [showRiotForm, setShowRiotForm] = useState(false);

  const handleUploadImage = async (file: File, bucket: 'avatars' | 'banners') => {
    if (!profile) throw new Error('Not logged in');
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, bucket: 'avatars' | 'banners') => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (bucket === 'avatars') setUploadingAvatar(true);
    else setUploadingBanner(true);

    try {
      const publicUrl = await handleUploadImage(file, bucket);
      if (bucket === 'avatars') setAvatarUrl(publicUrl);
      else setBannerUrl(publicUrl);
    } catch (err) {
      alert(`Failed to upload image to ${bucket}`);
    } finally {
      if (bucket === 'avatars') setUploadingAvatar(false);
      else setUploadingBanner(false);
    }
  };

  const triggerAvatarUpload = () => avatarInputRef.current?.click();
  const triggerBannerUpload = () => bannerInputRef.current?.click();

  const handleSave = () => {
    if (!profile) return;
    updateProfileMutation.mutate({
      display_name: displayName,
      username,
      bio,
      main_game: mainGame,
      region,
      rank,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
    }, {
      onSuccess: (updatedProfile) => {
        setProfile(updatedProfile);
        alert('Profile updated successfully!');
      },
      onError: (err) => {
        alert(`Failed to update profile: ${err.message}`);
      }
    });
  };

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto w-full text-center py-12">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-display font-bold text-gradient-brand">
          Settings
        </h1>
      </motion.div>

      <div className="flex gap-6">
        {/* Settings Nav */}
        <div className="hidden md:block w-56 shrink-0">
          <div className="glass rounded-2xl border border-white/5 p-2 space-y-1 sticky top-24">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left',
                    activeSection === section.id
                      ? 'bg-vc-red-500/10 text-vc-red-400 font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-vc-dark-600/50'
                  )}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Nav */}
          <div className="md:hidden flex gap-1 mb-4 overflow-x-auto pb-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all',
                    activeSection === section.id
                      ? 'bg-vc-red-500/10 text-vc-red-400 font-medium'
                      : 'bg-vc-dark-700/50 text-gray-400'
                  )}
                >
                  <Icon size={12} />
                  {section.label}
                </button>
              );
            })}
          </div>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl border border-white/5 p-6"
          >
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-200">
                  Edit Profile
                </h2>

                {/* Banner & Avatar Row */}
                <div className="space-y-4">
                  {/* Banner */}
                  <div className="relative h-36 rounded-xl overflow-hidden bg-vc-dark-600/50 border border-white/5">
                    {bannerUrl ? (
                      <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-vc-red-500/10 via-vc-purple-500/15 to-vc-cyan-500/10" />
                    )}
                    <button 
                      onClick={triggerBannerUpload}
                      disabled={uploadingBanner}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Camera size={12} />
                      {uploadingBanner ? 'Uploading...' : 'Change Cover'}
                    </button>
                    <input 
                      type="file" 
                      ref={bannerInputRef} 
                      onChange={(e) => handleFileChange(e, 'banners')} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-20 h-20 rounded-full bg-vc-dark-600 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-vc-red-500 to-vc-purple-500 flex items-center justify-center text-xl font-bold">
                          {displayName.charAt(0) || 'U'}
                        </div>
                      )}
                      <button 
                        onClick={triggerAvatarUpload}
                        disabled={uploadingAvatar}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-vc-red-500 rounded-full flex items-center justify-center hover:bg-vc-red-600 transition-colors"
                      >
                        <Camera size={12} className="text-white" />
                      </button>
                      <input 
                        type="file" 
                        ref={avatarInputRef} 
                        onChange={(e) => handleFileChange(e, 'avatars')} 
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        Profile Picture
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadingAvatar ? 'Uploading picture...' : 'JPG, PNG or GIF. Max 2MB'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-vc-cyan-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-vc-cyan-500/30"
                      />
                    </div>
                  </div>
                  
                  {/* Game Stats & Profile Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Main Game
                      </label>
                      <select
                        value={mainGame}
                        onChange={(e) => setMainGame(e.target.value)}
                        className="w-full px-4 py-2.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-vc-cyan-500/30 cursor-pointer"
                      >
                        <option value="">None</option>
                        <option value="Valorant">Valorant</option>
                        <option value="CS2">CS2</option>
                        <option value="League of Legends">League of Legends</option>
                        <option value="Apex Legends">Apex Legends</option>
                        <option value="Overwatch 2">Overwatch 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Region
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-4 py-2.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-vc-cyan-500/30 cursor-pointer"
                      >
                        <option value="">None</option>
                        <option value="NA">NA</option>
                        <option value="EU">EU</option>
                        <option value="APAC">APAC</option>
                        <option value="KR">KR</option>
                        <option value="BR">BR</option>
                        <option value="LATAM">LATAM</option>
                        <option value="OCE">OCE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Rank
                      </label>
                      <input
                        type="text"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        placeholder="e.g. Diamond 2"
                        className="w-full px-4 py-2.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-vc-cyan-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-vc-cyan-500/30 resize-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      {bio.length}/280 characters
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2.5 bg-gradient-to-r from-vc-red-500 to-vc-red-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-vc-red-500/20"
                >
                  <Save size={14} /> {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            )}

            {/* Connected Accounts */}
            {activeSection === 'accounts' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-200">
                  Connected Accounts
                </h2>
                <div className="space-y-3">
                  {/* Discord Account */}
                  <div className="flex items-center justify-between p-4 bg-vc-dark-600/30 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500">
                        <Link2 size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          Discord
                        </p>
                        <p className="text-xs text-gray-500">Login + server import</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'px-4 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        connectedAccounts.discord
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                          : 'bg-vc-dark-500 text-gray-400 hover:bg-vc-cyan-500/10 hover:text-vc-cyan-400'
                      )}
                      onClick={() =>
                        setConnectedAccounts((prev) => ({
                          ...prev,
                          discord: !prev.discord,
                        }))
                      }
                    >
                      {connectedAccounts.discord ? 'Connected' : 'Connect'}
                    </motion.button>
                  </div>

                  {/* Riot Games Account */}
                  <div className="bg-vc-dark-600/30 rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-vc-red-500">
                          <Link2 size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">
                            Riot Games
                          </p>
                          <p className="text-xs text-gray-500">
                            {profile.riot_stats?.riot_id ? `Connected as ${profile.riot_stats.riot_id}` : 'Valorant stats + rank'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.riot_stats && (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={isSyncingRiot}
                            onClick={async () => {
                              setIsSyncingRiot(true);
                              try {
                                const updated = await syncRiotStats(profile.riot_stats!.riot_id);
                                setProfile(updated);
                                alert('Stats synced successfully!');
                              } catch (err: any) {
                                alert(`Failed to sync stats: ${err.message}`);
                              } finally {
                                setIsSyncingRiot(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-vc-cyan-500/10 text-vc-cyan-400 hover:bg-vc-cyan-500/20 transition-colors"
                          >
                            {isSyncingRiot ? 'Syncing...' : 'Sync Stats'}
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            'px-4 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            profile.riot_stats
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                              : 'bg-vc-dark-500 text-gray-400 hover:bg-vc-cyan-500/10 hover:text-vc-cyan-400'
                          )}
                          onClick={() => {
                            if (profile.riot_stats) {
                              if (confirm('Are you sure you want to disconnect your Riot Games account?')) {
                                updateProfileMutation.mutate({
                                  riot_stats: null,
                                  rank: null
                                }, {
                                  onSuccess: (updated) => {
                                    setProfile(updated);
                                    setRiotIdInput('');
                                    alert('Riot account disconnected.');
                                  }
                                });
                              }
                            } else {
                              setShowRiotForm(!showRiotForm);
                            }
                          }}
                        >
                          {profile.riot_stats ? 'Connected' : showRiotForm ? 'Cancel' : 'Connect'}
                        </motion.button>
                      </div>
                    </div>

                    {profile.riot_stats && (
                      <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-vc-dark-800/20 text-xs text-gray-400 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">Rank</span>
                          <span className="font-semibold text-gray-200">{profile.rank || 'Unranked'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">KD Ratio</span>
                          <span className="font-semibold text-gray-200">{profile.riot_stats.kd_ratio}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">Win Rate</span>
                          <span className="font-semibold text-gray-200">{profile.riot_stats.win_rate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">Matches Played</span>
                          <span className="font-semibold text-gray-200">{profile.riot_stats.matches_played} ({profile.riot_stats.hours_played}h)</span>
                        </div>
                      </div>
                    )}

                    {!profile.riot_stats && showRiotForm && (
                      <div className="p-4 border-t border-white/5 bg-vc-dark-800/20 space-y-3">
                        <p className="text-xs text-gray-400">
                          Connecting your Riot ID will fetch your competitive rank, KD ratio, and win rate to display on your profile.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Name#Tag (e.g. TenZ#NA1)"
                            value={riotIdInput}
                            onChange={(e) => setRiotIdInput(e.target.value)}
                            className="flex-1 px-3 py-2 bg-vc-dark-600/50 border border-white/5 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-vc-cyan-500/30"
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSyncingRiot || !riotIdInput.includes('#')}
                            onClick={async () => {
                              if (!riotIdInput.trim() || !riotIdInput.includes('#')) {
                                alert('Please enter a valid Riot ID in the format Name#Tag');
                                return;
                              }
                              setIsSyncingRiot(true);
                              try {
                                const updated = await syncRiotStats(riotIdInput.trim());
                                setProfile(updated);
                                setShowRiotForm(false);
                                alert('Riot account connected successfully!');
                              } catch (err: any) {
                                alert(`Failed to connect Riot account: ${err.message}`);
                              } finally {
                                setIsSyncingRiot(false);
                              }
                            }}
                            className="px-4 py-2 bg-vc-red-500 hover:bg-vc-red-600 disabled:bg-vc-dark-500 disabled:text-gray-500 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            {isSyncingRiot ? 'Connecting...' : 'Link & Sync'}
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Steam Account */}
                  <div className="flex items-center justify-between p-4 bg-vc-dark-600/30 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-600">
                        <Link2 size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          Steam
                        </p>
                        <p className="text-xs text-gray-500">Game library + achievements</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        'px-4 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        connectedAccounts.steam
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                          : 'bg-vc-dark-500 text-gray-400 hover:bg-vc-cyan-500/10 hover:text-vc-cyan-400'
                      )}
                      onClick={() =>
                        setConnectedAccounts((prev) => ({
                          ...prev,
                          steam: !prev.steam,
                        }))
                      }
                    >
                      {connectedAccounts.steam ? 'Connected' : 'Connect'}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-200">
                  Privacy Settings
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      key: 'publicProfile' as const,
                      label: 'Public Profile',
                      desc: 'Anyone can view your profile',
                    },
                    {
                      key: 'showOnlineStatus' as const,
                      label: 'Online Status',
                      desc: 'Show when you are online',
                    },
                    {
                      key: 'showGameStats' as const,
                      label: 'Game Statistics',
                      desc: 'Display your game stats publicly',
                    },
                    {
                      key: 'allowDMs' as const,
                      label: 'Allow Direct Messages',
                      desc: 'Let anyone send you messages',
                    },
                  ].map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {setting.label}
                        </p>
                        <p className="text-xs text-gray-500">{setting.desc}</p>
                      </div>
                      <ToggleSwitch
                        enabled={privacySettings[setting.key]}
                        onChange={() =>
                          setPrivacySettings((prev) => ({
                            ...prev,
                            [setting.key]: !prev[setting.key],
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-200">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      key: 'likes' as const,
                      label: 'Likes',
                      desc: 'When someone likes your post',
                    },
                    {
                      key: 'comments' as const,
                      label: 'Comments',
                      desc: 'When someone comments on your post',
                    },
                    {
                      key: 'follows' as const,
                      label: 'New Followers',
                      desc: 'When someone follows you',
                    },
                    {
                      key: 'messages' as const,
                      label: 'Messages',
                      desc: 'When you receive a new message',
                    },
                    {
                      key: 'lfg' as const,
                      label: 'LFG Updates',
                      desc: 'When someone joins your LFG listing',
                    },
                    {
                      key: 'clips' as const,
                      label: 'Clip Processing',
                      desc: 'When your clip is ready to view',
                    },
                  ].map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {setting.label}
                        </p>
                        <p className="text-xs text-gray-500">{setting.desc}</p>
                      </div>
                      <ToggleSwitch
                        enabled={notifSettings[setting.key]}
                        onChange={() =>
                          setNotifSettings((prev) => ({
                            ...prev,
                            [setting.key]: !prev[setting.key],
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-200">
                  Appearance
                </h2>
                <div>
                  <p className="text-sm text-gray-400 mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        id: 'dark' as const,
                        label: 'Dark',
                        icon: Moon,
                        bg: 'bg-vc-dark-700',
                      },
                      {
                        id: 'midnight' as const,
                        label: 'Midnight',
                        icon: Monitor,
                        bg: 'bg-[#0D1117]',
                      },
                      {
                        id: 'amoled' as const,
                        label: 'AMOLED',
                        icon: Smartphone,
                        bg: 'bg-black',
                      },
                    ].map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={cn(
                            'p-4 rounded-xl border transition-all text-center',
                            theme === t.id
                              ? 'border-vc-red-500/50 bg-vc-red-500/5'
                              : 'border-white/5 hover:border-white/10'
                          )}
                        >
                          <div
                            className={cn(
                              'w-12 h-8 rounded-lg mx-auto mb-2 border border-white/10',
                              t.bg
                            )}
                          />
                          <p className="text-xs font-medium text-gray-300">
                            {t.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
