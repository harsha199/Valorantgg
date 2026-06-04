'use client';

import { create } from 'zustand';

interface ChatStore {
  activeConversation: string | null;
  typingUsers: Record<string, string[]>;
  unreadCounts: Record<string, number>;
  setActiveConversation: (id: string | null) => void;
  setTyping: (conversationId: string, users: string[]) => void;
  markAsRead: (conversationId: string) => void;
  incrementUnread: (conversationId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversation: null,
  typingUsers: {},
  unreadCounts: {},
  setActiveConversation: (id) => set({ activeConversation: id }),
  setTyping: (conversationId, users) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: users },
    })),
  markAsRead: (conversationId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    })),
  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
      },
    })),
}));
