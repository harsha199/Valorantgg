'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLFGListings, createLFG, joinLFG } from '@/lib/actions/lfg';
import type { LFGListing, LFGFilters } from '@/types';

export function useLFGListings(filters?: LFGFilters) {
  return useQuery({
    queryKey: ['lfg-listings', filters],
    queryFn: () => getLFGListings(filters),
  });
}

export function useCreateLFG() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<LFGListing>) => createLFG(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lfg-listings'] });
    },
  });
}

export function useJoinLFG() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => joinLFG(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lfg-listings'] });
    },
  });
}
