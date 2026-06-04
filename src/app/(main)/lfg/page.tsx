'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Gamepad2,
  Users,
  MapPin,
  Clock,
  Swords,
  Filter,
} from 'lucide-react';
import { mockLFGListings, mockGames } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { LFGListing, PlayStyle, Region } from '@/types';

const playStyleColors: Record<PlayStyle, string> = {
  competitive: 'bg-vc-red-500/20 text-vc-red-400',
  casual: 'bg-green-500/20 text-green-400',
  practice: 'bg-vc-cyan-500/20 text-vc-cyan-400',
  tournament: 'bg-vc-purple-500/20 text-vc-purple-400',
};

const statusColors: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400 border-green-500/30',
  full: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  in_progress: 'bg-vc-cyan-500/20 text-vc-cyan-400 border-vc-cyan-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function LFGCard({ listing }: { listing: LFGListing }) {
  const progress = (listing.slots_filled / listing.slots_total) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className="glass rounded-2xl border border-white/5 p-5 hover:border-vc-cyan-500/20 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vc-dark-600 to-vc-dark-500 flex items-center justify-center">
            <Gamepad2 size={18} className="text-vc-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 text-sm group-hover:text-vc-cyan-400 transition-colors">
              {listing.title}
            </h3>
            <p className="text-xs text-gray-500">{listing.game?.name}</p>
          </div>
        </div>
        <span
          className={cn(
            'text-[10px] font-medium px-2 py-0.5 rounded-full border',
            statusColors[listing.status]
          )}
        >
          {listing.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {listing.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-vc-dark-600/80 text-gray-400">
          <MapPin size={10} /> {listing.region}
        </span>
        <span
          className={cn(
            'flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg',
            playStyleColors[listing.play_style]
          )}
        >
          <Swords size={10} /> {listing.play_style}
        </span>
        {listing.rank_required && (
          <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400">
            {listing.rank_required}
          </span>
        )}
        {listing.scheduled_at && (
          <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-vc-dark-600/80 text-gray-400">
            <Clock size={10} />{' '}
            {formatDistanceToNow(new Date(listing.scheduled_at), {
              addSuffix: true,
            })}
          </span>
        )}
      </div>

      {/* Slots Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-400 flex items-center gap-1">
            <Users size={12} />
            {listing.slots_filled}/{listing.slots_total} players
          </span>
          <span className="text-vc-cyan-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-vc-dark-600 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-vc-cyan-500 to-vc-cyan-400 rounded-full"
          />
        </div>
      </div>

      {/* Creator & Join */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={listing.creator?.avatar_url || ''}
            alt={listing.creator?.display_name}
            className="w-6 h-6 rounded-full bg-vc-dark-600"
          />
          <span className="text-xs text-gray-500">
            {listing.creator?.display_name}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={listing.status !== 'open'}
          className={cn(
            'px-4 py-1.5 text-xs font-medium rounded-lg transition-all',
            listing.status === 'open'
              ? 'bg-gradient-to-r from-vc-cyan-500 to-vc-cyan-600 text-white hover:shadow-lg hover:shadow-vc-cyan-500/20'
              : 'bg-vc-dark-600 text-gray-500 cursor-not-allowed'
          )}
        >
          {listing.slots_filled >= listing.slots_total ? 'Full' : 'Join'}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function LFGPage() {
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredListings = useMemo(() => {
    return mockLFGListings.filter((listing) => {
      if (search && !listing.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (selectedGame !== 'all' && listing.game_id !== selectedGame) return false;
      if (selectedRegion !== 'all' && listing.region !== selectedRegion) return false;
      if (selectedStyle !== 'all' && listing.play_style !== selectedStyle)
        return false;
      return true;
    });
  }, [search, selectedGame, selectedRegion, selectedStyle]);

  const regions: Region[] = ['NA', 'EU', 'APAC', 'KR', 'BR', 'LATAM', 'OCE'];
  const styles: PlayStyle[] = ['competitive', 'casual', 'practice', 'tournament'];

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-display font-bold text-gradient-brand mb-1">
          Find Your Squad
        </h1>
        <p className="text-sm text-gray-400">
          Browse LFG listings or create your own to find teammates
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl border border-white/5 p-4 mb-6"
      >
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-vc-cyan-500/30"
            />
          </div>

          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="px-3 py-2 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-vc-cyan-500/30 cursor-pointer"
          >
            <option value="all">All Games</option>
            {mockGames.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-vc-cyan-500/30 cursor-pointer"
          >
            <option value="all">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="px-3 py-2 bg-vc-dark-600/50 border border-white/5 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-vc-cyan-500/30 cursor-pointer"
          >
            <option value="all">All Styles</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Listings Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredListings.map((listing) => (
            <motion.div
              key={listing.id}
              layout
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <LFGCard listing={listing} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredListings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Filter size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 font-medium">No listings match your filters</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search or create a new listing
          </p>
        </motion.div>
      )}

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-vc-cyan-500 to-vc-cyan-600 rounded-full shadow-lg shadow-vc-cyan-500/30 flex items-center justify-center text-white z-40 hover:shadow-xl hover:shadow-vc-cyan-500/40 transition-shadow"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}
