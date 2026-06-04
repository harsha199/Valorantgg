'use client';

import { create } from 'zustand';
import type { Region, PlayStyle, LFGStatus } from '@/types';

interface LFGFilterState {
  game_id: string;
  region: string;
  play_style: string;
  rank: string;
  status: string;
  search: string;

  setGameId: (id: string) => void;
  setRegion: (region: string) => void;
  setPlayStyle: (style: string) => void;
  setRank: (rank: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
}

const initialState = {
  game_id: '',
  region: '',
  play_style: '',
  rank: '',
  status: '',
  search: '',
};

export const useLFGStore = create<LFGFilterState>((set) => ({
  ...initialState,

  setGameId: (game_id) => set({ game_id }),
  setRegion: (region) => set({ region }),
  setPlayStyle: (play_style) => set({ play_style }),
  setRank: (rank) => set({ rank }),
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  resetFilters: () => set(initialState),
}));
