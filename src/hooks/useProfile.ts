'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, toggleFollow } from '@/lib/actions/profiles';
import type { Profile } from '@/types';

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfile(username),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Profile>) => updateProfile(updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.username], data);
    },
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, username, isCurrentlyFollowing }: { targetUserId: string; username: string; isCurrentlyFollowing: boolean }) =>
      toggleFollow(targetUserId, isCurrentlyFollowing),
    onMutate: async ({ username, isCurrentlyFollowing }) => {
      await queryClient.cancelQueries({ queryKey: ['profile', username] });
      const previousProfile = queryClient.getQueryData(['profile', username]);

      queryClient.setQueryData(['profile', username], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_following: !isCurrentlyFollowing,
          followers_count: isCurrentlyFollowing ? old.followers_count - 1 : old.followers_count + 1,
        };
      });

      return { previousProfile };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', variables.username], context.previousProfile);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.username] });
    },
  });
}
