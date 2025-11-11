// src/common/sales.utils.ts
export const EXCLUDED_STATUSES = new Set(['canceled', 'cancelled']);

export function isActiveItemStatus(status?: string | null): boolean {
  const st = (status || '').toLowerCase().trim();
  return !EXCLUDED_STATUSES.has(st);
}
