/** Treat the repository's example placeholders as absent configuration. */
export function hasUsableSecret(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  const normalized = value.trim().toLowerCase();
  return !normalized.startsWith('your_') && !normalized.includes('_here') && normalized !== 'changeme';
}
