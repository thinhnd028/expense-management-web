import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency ────────────────────────────────────────────────────────────────

/** Simple VND formatter — use formatAmount() from useCurrency() for multi-currency support */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + 'đ'
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export const WALLET_COLORS = [
  '#3f6653', '#0e1c2b', '#6366f1', '#f59e0b',
  '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899',
  '#10b981', '#f97316', '#64748b', '#a855f7',
]

// ─── Date re-exports (convenience) ──────────────────────────────────────────

export {
  toDate,
  isToday,
  isYesterday,
  isThisYear,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatDateTimeFull,
  formatMonth,
  formatDateVerbose,
  formatDateLabel,
  formatDateTimeRelative,
  formatRelative,
  formatDateInput,
  formatDayOfWeekShort,
  formatMonthShort,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  groupByDate,
} from '@/lib/date'
