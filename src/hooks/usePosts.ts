'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed, createPost, toggleLike } from '@/lib/actions/posts';
import type { CreatePostInput } from '@/types';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 1 }) => {
      return getFeed(pageParam as number, 10);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isCurrentlyLiked }: { postId: string; isCurrentlyLiked: boolean }) => 
      toggleLike(postId, isCurrentlyLiked),
    onMutate: async ({ postId, isCurrentlyLiked }) => {
      // Optimistic update for feed
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData(['feed']);

      queryClient.setQueryData(['feed'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) => {
              if (post.id === postId) {
                return {
                  ...post,
                  is_liked: !isCurrentlyLiked,
                  likes_count: isCurrentlyLiked ? post.likes_count - 1 : post.likes_count + 1,
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousFeed };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
