'use client';

import GridBackground from '@/components/animations/GridBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-vc-dark-900">
      {/* Animated grid overlay */}
      <div className="grid-pattern-auth pointer-events-none fixed inset-0" />

      {/* GSAP Canvas background */}
      <GridBackground />

      {/* Gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-vc-red-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-vc-cyan-500/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-vc-purple-500/5 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
