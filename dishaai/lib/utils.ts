import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function scoreColor(score: number): string {
  if (score >= 75) return 'var(--ui-success, #059669)';
  if (score >= 55) return 'var(--ui-accent, #d97706)';
  return 'var(--ui-red, #e11d48)';
}

export function scoreBg(score: number): string {
  if (score >= 75) return 'var(--ui-surface-2, #ecfdf5)';
  if (score >= 55) return 'var(--ui-surface-2, #fffbeb)';
  return 'var(--ui-surface-2, #fff1f2)';
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
