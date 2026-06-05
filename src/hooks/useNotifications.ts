'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllRead } from '@/lib/actions/notifications';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types';

export function useNotifications() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  useEffect(() => {
    // Realtime subscription for new notifications
    const channel = supabase
      .channel('live-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          // Fetch actor profile details to attach to notification
          let actorProfile = null;
          if (payload.new.actor_id) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.actor_id)
              .single();
            actorProfile = data;
          }

          const newNotification = {
            ...payload.new,
            actor: actorProfile,
          } as Notification;

          queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
            if (!old) return [newNotification];
            if (old.some(n => n.id === newNotification.id)) return old;
            return [newNotification, ...old];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);

  return query;
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
