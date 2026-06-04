'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  Users,
  MessageSquare,
  UserCircle,
  Settings,
  Gamepad2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { mockGames as trendingGames } from '@/data/mockData';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/lfg', label: 'LFG', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/profile/phantomace', label: 'Profile', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const gameColors = [
  'from-vc-red-500 to-vc-red-600',
  'from-vc-cyan-500 to-vc-cyan-600',
  'from-vc-purple-500 to-vc-purple-600',
  'from-amber-500 to-orange-600',
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 72 },
  };

  return (
    <motion.aside
      initial={false}
      animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="glass-strong relative hidden h-[calc(100vh-4rem)] flex-col border-r border-white/5 lg:flex"
    >
      {/* Nav Items */}
      <nav className="flex flex-1 flex-col gap-1 p-3 pt-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon size={20} />}
              isActive={isActive}
              collapsed={sidebarCollapsed}
            />
          );
        })}
      </nav>

      {/* Trending Games */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5 p-3"
          >
            <div className="mb-3 flex items-center gap-2 px-2">
              <TrendingUp size={14} className="text-vc-cyan-500" />
              <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Trending Games
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {trendingGames.slice(0, 4).map((game, i) => (
                <Link
                  key={game.id}
                  href={`/explore?game=${game.slug}`}
                  className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-vc-dark-600"
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br font-display text-[10px] font-bold text-white',
                      gameColors[i % gameColors.length]
                    )}
                  >
                    {game.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                      {game.name}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {game.genre}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed: game icons only */}
      <AnimatePresence>
        {sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5 p-3"
          >
            <div className="mb-2 flex justify-center">
              <Gamepad2 size={14} className="text-gray-600" />
            </div>
            <div className="flex flex-col items-center gap-2">
              {trendingGames.slice(0, 4).map((game, i) => (
                <Link
                  key={game.id}
                  href={`/explore?game=${game.slug}`}
                  className="group relative"
                  title={game.name}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br font-display text-[10px] font-bold text-white transition-transform group-hover:scale-110',
                      gameColors[i % gameColors.length]
                    )}
                  >
                    {game.name.slice(0, 2).toUpperCase()}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-vc-dark-700 text-gray-400 shadow-lg transition-colors hover:bg-vc-dark-600 hover:text-white"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight size={12} />
        ) : (
          <ChevronLeft size={12} />
        )}
      </motion.button>
    </motion.aside>
  );
}

function NavItem({
  href,
  label,
  icon,
  isActive,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link href={href} className="group relative block">
      <motion.div
        whileHover={{ x: collapsed ? 0 : 4 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-vc-red-500/10 text-vc-red-500'
            : 'text-gray-400 hover:bg-vc-dark-600 hover:text-white'
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-vc-red-500"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}

        <span className="shrink-0">{icon}</span>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap text-sm font-medium"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tooltip on collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-lg bg-vc-dark-600 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          {label}
          <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-vc-dark-600" />
        </div>
      )}
    </Link>
  );
}
