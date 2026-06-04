'use client';

import { create } from 'zustand';
import type { User, Profile } from '@/types';

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  login: (user: User, profile: Profile) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  login: (user, profile) =>
    set({ user, profile, isAuthenticated: true, isLoading: false }),
  logout: () =>
    set({ user: null, profile: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
