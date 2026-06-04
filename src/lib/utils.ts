import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  differenceInSeconds,
} from 'date-fns';

/**
 * Merge Tailwind CSS classes with clsx + tailwind-merge.
 * Handles conditional classes, duplicates, and conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string into a human-readable form.
 * Adapts output based on how recent the date is.
 */
export function formatDate(dateString: string, style: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(dateString);

  if (style === 'relative') {
    return getRelativeTime(dateString);
  }

  if (style === 'long') {
    return format(date, 'MMMM d, yyyy \'at\' h:mm a');
  }

  // short style — contextual
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE'); // Day name
  }
  return format(date, 'MMM d, yyyy');
}

/**
 * Get a relative time string like "2 hours ago", "just now", etc.
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const seconds = differenceInSeconds(new Date(), date);

  if (seconds < 30) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a number for display (e.g., 1500 → "1.5K", 2300000 → "2.3M").
 */
export function formatNumber(num: number): string {
  if (num < 0) return `-${formatNumber(-num)}`;
  if (num < 1_000) return num.toString();
  if (num < 10_000) {
    const formatted = (num / 1_000).toFixed(1);
    return `${formatted.replace(/\.0$/, '')}K`;
  }
  if (num < 1_000_000) {
    return `${Math.floor(num / 1_000)}K`;
  }
  if (num < 10_000_000) {
    const formatted = (num / 1_000_000).toFixed(1);
    return `${formatted.replace(/\.0$/, '')}M`;
  }
  return `${Math.floor(num / 1_000_000)}M`;
}

/**
 * Get initials from a display name (up to 2 characters).
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Truncate a string to a given length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1).trimEnd() + '…';
}

/**
 * Generate a deterministic color from a string (for avatars, tags, etc.).
 */
export function stringToColor(str: string): string {
  const colors = [
    '#FF4655', '#0FF0FC', '#A855F7', '#22C55E',
    '#F59E0B', '#3B82F6', '#EF4444', '#EC4899',
    '#8B5CF6', '#06B6D4', '#10B981', '#F97316',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Generate a placeholder avatar URL (for demo purposes).
 */
export function getAvatarUrl(username: string, size = 128): string {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}&size=${size}`;
}

/**
 * Sleep helper (useful for simulating loading states).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
