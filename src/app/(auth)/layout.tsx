'use client';

import dynamic from 'next/dynamic';

// Dynamically import Three.js canvas to avoid SSR issues
const GridBackground = dynamic(
  () => import('@/components/animations/GridBackground'),
  { ssr: false }
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-vc-dark-900 overflow-hidden">
      {/* Three.js Dragon Vandal Background */}
      <GridBackground />

      {/* Subtle vignette overlay for depth */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,15,0.7) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}

