'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserClips, createClip } from '@/lib/actions/clips';
import type { Clip } from '@/types';

export function useUserClips(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-clips', userId],
    queryFn: () => getUserClips(userId!),
    enabled: !!userId,
  });
}

export function useCreateClip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      description?: string;
      video_url: string;
      thumbnail_url?: string;
      game_id?: string;
    }) => createClip(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-clips', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
