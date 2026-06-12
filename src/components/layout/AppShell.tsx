'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useUIStore } from '@/stores/uiStore';

const GridBackground = dynamic(
  () => import('@/components/animations/GridBackground'),
  { ssr: false }
);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mobileMenuOpen, setMobileMenuOpen, theme } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="relative flex min-h-screen flex-col bg-vc-dark-900">
      {/* Three.js Dragon Vandal Background */}
      <GridBackground variant="home" />

      <Navbar />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              />
              {/* Mobile sidebar panel */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-[280px] lg:hidden"
              >
                <div className="glass-strong h-full border-r border-white/5">
                  <Sidebar />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 relative z-[1]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

