'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  MessageSquare,
  UserPlus,
  AtSign,
  Swords,
  Users,
  Send,
  Video,
  Trophy,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { NotificationType, Notification } from '@/types';
import { useNotifications, useMarkAllRead, useMarkAsRead } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';

const notifIcons: Record<NotificationType, { icon: typeof Heart; color: string }> = {
  like: { icon: Heart, color: 'text-vc-red-400 bg-vc-red-500/10' },
  comment: { icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10' },
  follow: { icon: UserPlus, color: 'text-vc-purple-400 bg-vc-purple-500/10' },
  mention: { icon: AtSign, color: 'text-amber-400 bg-amber-500/10' },
  lfg_invite: { icon: Swords, color: 'text-vc-cyan-400 bg-vc-cyan-500/10' },
  lfg_join: { icon: Users, color: 'text-green-400 bg-green-500/10' },
  message: { icon: Send, color: 'text-indigo-400 bg-indigo-500/10' },
  clip_ready: { icon: Video, color: 'text-pink-400 bg-pink-500/10' },
  achievement: { icon: Trophy, color: 'text-yellow-400 bg-yellow-500/10' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export default function NotificationsPage() {
  const { profile: currentUser } = useAuthStore();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAllReadMutation = useMarkAllRead();
  const markAsReadMutation = useMarkAsRead();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleMarkRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(id);
    }
  };

  const today = notifications.filter((n) => {
    const date = new Date(n.created_at);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  });

  const earlier = notifications.filter((n) => {
    const date = new Date(n.created_at);
    const now = new Date();
    return date.toDateString() !== now.toDateString();
  });

  const renderNotification = (notif: Notification) => {
    const config = notifIcons[notif.type] || { icon: Bell, color: 'text-gray-400 bg-gray-500/10' };
    const Icon = config.icon;

    return (
      <motion.div
        key={notif.id}
        variants={item}
        onClick={() => handleMarkRead(notif.id, notif.is_read)}
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer',
          notif.is_read
            ? 'hover:bg-vc-dark-600/30'
            : 'bg-vc-dark-700/50 hover:bg-vc-dark-700/80 border border-white/5'
        )}
      >
        {/* Actor Avatar */}
        <div className="relative shrink-0">
          {notif.actor?.avatar_url ? (
            <img
              src={notif.actor.avatar_url}
              alt={notif.actor.display_name}
              className="w-10 h-10 rounded-full bg-vc-dark-600 object-cover"
            />
          ) : (
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white',
                config.color
              )}
            >
              {notif.actor?.display_name?.charAt(0) || <Icon size={18} />}
            </div>
          )}
          {/* Type Icon Badge */}
          {notif.actor && (
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-vc-dark-800',
                config.color
              )}
            >
              <Icon size={10} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-gray-100">
              {notif.actor?.display_name || 'System'}
            </span>{' '}
            {notif.message.replace(notif.actor?.display_name || '', '').trim()}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDistanceToNow(new Date(notif.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>

        {/* Unread indicator */}
        {!notif.is_read && (
          <div className="w-2 h-2 rounded-full bg-vc-red-500 shrink-0 mt-2" />
        )}
      </motion.div>
    );
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p className="text-gray-500">Please sign in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient-brand">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="px-3 py-1.5 bg-vc-dark-600/50 border border-white/5 rounded-xl text-xs font-medium text-gray-400 hover:text-vc-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <CheckCheck size={14} />
            Mark all as read
          </motion.button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-vc-dark-700/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Today */}
          {today.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Today
              </p>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="glass rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden"
              >
                {today.map(renderNotification)}
              </motion.div>
            </div>
          )}

          {/* Earlier */}
          {earlier.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Earlier
              </p>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="glass rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden"
              >
                {earlier.map(renderNotification)}
              </motion.div>
            </div>
          )}

          {notifications.length === 0 && (
            <div className="text-center py-16">
              <Bell size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-1">
                When someone interacts with you, you&apos;ll see it here
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
