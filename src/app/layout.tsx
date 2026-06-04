import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import { QueryProvider } from '@/providers/QueryProvider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Valorantclutch — Social for Gamers',
  description:
    'Connect with gamers, share clips, find your squad, and level up your social game.',
  keywords: ['gaming', 'social media', 'valorant', 'esports', 'LFG', 'clips'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-vc-dark-900 font-body text-gray-200">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
