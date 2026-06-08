'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment } from '@/lib/actions/comments';
import type { Comment } from '@/types';

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = queryClientHook();

  function queryClientHook() {
    try {
      return useQueryClient();
    } catch {
      return null;
    }
  }

  const qc = queryClientHook();

  return useMutation({
    mutationFn: ({ content, parentId = null }: { content: string; parentId?: string | null }) =>
      createComment(postId, content, parentId),
    onSuccess: (newComment) => {
      if (qc) {
        qc.setQueryData(['comments', postId], (old: Comment[] | undefined) => {
          if (!old) return [newComment];
          return [...old, newComment];
        });
        
        // Invalidate feed so post comments count increments in UI
        qc.invalidateQueries({ queryKey: ['feed'] });
      }
    },
  });
}
