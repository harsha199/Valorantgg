'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  X,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { mockCurrentProfile as currentUser } from '@/data/mockData';

const mockNotificationCount = 5;

export default function Navbar() {
  const { mobileMenuOpen, setMobileMenuOpen, toggleSidebar } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const initials = currentUser.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/5">
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vc-red-500/40 to-transparent" />

      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* ── Left: Mobile toggle + Logo ── */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              toggleSidebar();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-vc-dark-700 hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-gradient-brand font-display text-lg font-bold tracking-wider lg:text-xl">
              VALORANTCLUTCH
            </span>
          </Link>
        </div>

        {/* ── Center: Search Bar ── */}
        <div className="relative mx-auto hidden max-w-md flex-1 md:block">
          <div
            className={cn(
              'glass flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300',
              searchFocused && 'ring-1 ring-vc-red-500/50 neon-glow-red'
            )}
          >
            <Search size={16} className="shrink-0 text-gray-500" />
            <input
              type="text"
              placeholder="Search gamers, posts, games..."
              className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-vc-dark-600 px-1.5 py-0.5 font-body text-[10px] text-gray-500 lg:inline-block">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1">
          {/* Mobile search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-vc-dark-700 hover:text-white md:hidden"
            aria-label="Search"
          >
            <Search size={18} />
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-vc-dark-700 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {mockNotificationCount > 0 && (
              <span className="absolute -top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-vc-red-500 px-1 font-body text-[10px] font-bold text-white">
                {mockNotificationCount}
              </span>
            )}
          </motion.button>

          {/* Messages */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-vc-dark-700 hover:text-white"
            aria-label="Messages"
          >
            <MessageSquare size={18} />
          </motion.button>

          {/* Divider */}
          <div className="mx-2 hidden h-6 w-px bg-white/10 sm:block" />

          {/* User Avatar Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-vc-dark-700"
            >
              {/* Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-vc-red-500 to-vc-purple-500 font-display text-xs font-bold text-white">
                {initials}
              </div>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium text-gray-200">
                  {currentUser.display_name}
                </span>
                <span className="text-[11px] text-vc-cyan-500">
                  {currentUser.rank}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  'hidden text-gray-500 transition-transform duration-200 sm:block',
                  userMenuOpen && 'rotate-180'
                )}
              />
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="glass-strong absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl shadow-2xl shadow-black/40"
                >
                  <div className="border-b border-white/5 p-3">
                    <p className="text-sm font-medium text-white">
                      {currentUser.display_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{currentUser.username}
                    </p>
                  </div>
                  <div className="p-1">
                    <DropdownItem
                      href={`/profile/${currentUser.username}`}
                      icon={<User size={16} />}
                      label="Profile"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <DropdownItem
                      href="/settings"
                      icon={<Settings size={16} />}
                      label="Settings"
                      onClick={() => setUserMenuOpen(false)}
                    />
                  </div>
                  <div className="border-t border-white/5 p-1">
                    <DropdownItem
                      href="/login"
                      icon={<LogOut size={16} />}
                      label="Sign out"
                      variant="danger"
                      onClick={() => setUserMenuOpen(false)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  href,
  icon,
  label,
  variant = 'default',
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        variant === 'default' &&
          'text-gray-300 hover:bg-vc-dark-600 hover:text-white',
        variant === 'danger' &&
          'text-vc-red-400 hover:bg-vc-red-500/10 hover:text-vc-red-500'
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
