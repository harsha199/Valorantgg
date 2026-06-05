'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessages, sendMessage, createConversation } from '@/lib/actions/messages';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/types';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
  });
}

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;

    // Realtime subscription for new messages in this conversation
    const channel = supabase
      .channel(`room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch sender profile details to attach to message
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessageWithSender = {
            ...payload.new,
            sender: senderProfile,
          } as Message;

          queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
            if (!old) return [newMessageWithSender];
            // Prevent duplicates
            if (old.some(m => m.id === newMessageWithSender.id)) return old;
            return [...old, newMessageWithSender];
          });

          // Invalidate conversations to update last message snippet
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, supabase]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      sendMessage(conversationId, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.setQueryData(['messages', data.conversation_id], (old: Message[] | undefined) => {
        if (!old) return [data];
        if (old.some(m => m.id === data.id)) return old;
        return [...old, data];
      });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, name, type }: { targetUserId: string; name?: string; type?: 'direct' | 'group' }) =>
      createConversation(targetUserId, name, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
