'use client';

import { useState } from 'react';
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
import { mockCurrentProfile } from '@/data/mockData';
import { cn } from '@/lib/utils';

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
  const [displayName, setDisplayName] = useState(
    mockCurrentProfile.display_name
  );
  const [bio, setBio] = useState(mockCurrentProfile.bio || '');
  const [username, setUsername] = useState(mockCurrentProfile.username);
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
    riot: true,
  });

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

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={mockCurrentProfile.avatar_url || ''}
                      alt=""
                      className="w-20 h-20 rounded-full bg-vc-dark-600"
                    />
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-vc-red-500 rounded-full flex items-center justify-center hover:bg-vc-red-600 transition-colors">
                      <Camera size={12} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      Profile Picture
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or GIF. Max 2MB
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
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
                  className="px-6 py-2.5 bg-gradient-to-r from-vc-red-500 to-vc-red-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-vc-red-500/20"
                >
                  <Save size={14} /> Save Changes
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
                  {[
                    {
                      name: 'Discord',
                      key: 'discord' as const,
                      color: 'bg-indigo-500',
                      desc: 'Login + server import',
                    },
                    {
                      name: 'Riot Games',
                      key: 'riot' as const,
                      color: 'bg-vc-red-500',
                      desc: 'Valorant stats + rank',
                    },
                    {
                      name: 'Steam',
                      key: 'steam' as const,
                      color: 'bg-gray-600',
                      desc: 'Game library + achievements',
                    },
                  ].map((account) => (
                    <div
                      key={account.key}
                      className="flex items-center justify-between p-4 bg-vc-dark-600/30 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            account.color
                          )}
                        >
                          <Link2 size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">
                            {account.name}
                          </p>
                          <p className="text-xs text-gray-500">{account.desc}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          'px-4 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          connectedAccounts[account.key]
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                            : 'bg-vc-dark-500 text-gray-400 hover:bg-vc-cyan-500/10 hover:text-vc-cyan-400'
                        )}
                        onClick={() =>
                          setConnectedAccounts((prev) => ({
                            ...prev,
                            [account.key]: !prev[account.key],
                          }))
                        }
                      >
                        {connectedAccounts[account.key]
                          ? 'Connected'
                          : 'Connect'}
                      </motion.button>
                    </div>
                  ))}
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
