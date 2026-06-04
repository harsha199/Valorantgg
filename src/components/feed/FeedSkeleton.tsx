'use client';

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-white/5 bg-vc-dark-700/50 backdrop-blur-xl"
        >
          <div className="p-5">
            {/* Author skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-shimmer rounded-full" />
              <div className="space-y-2">
                <div className="h-3 w-28 animate-shimmer rounded-md" />
                <div className="h-2.5 w-20 animate-shimmer rounded-md" />
              </div>
            </div>

            {/* Content skeleton */}
            <div className="mt-4 space-y-2.5">
              <div className="h-3 w-full animate-shimmer rounded-md" />
              <div className="h-3 w-5/6 animate-shimmer rounded-md" />
              <div className="h-3 w-2/3 animate-shimmer rounded-md" />
            </div>

            {/* Media skeleton (only on first card) */}
            {i === 1 && (
              <div className="mt-4 h-48 w-full animate-shimmer rounded-xl" />
            )}

            {/* Action bar skeleton */}
            <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3">
              <div className="h-7 w-16 animate-shimmer rounded-lg" />
              <div className="h-7 w-16 animate-shimmer rounded-lg" />
              <div className="h-7 w-16 animate-shimmer rounded-lg" />
              <div className="ml-auto h-7 w-7 animate-shimmer rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
