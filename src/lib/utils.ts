import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateInput(date: string | Date): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function getMonthRange(date = new Date()): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export const WALLET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#10b981', '#14b8a6',
  '#3b82f6', '#06b6d4', '#6b7280', '#1f2937',
]

export const WALLET_TYPE_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank: 'Bank',
  'e-wallet': 'E-Wallet',
}

// Lucide icon names for wallet types
export const WALLET_TYPE_ICONS: Record<string, string> = {
  cash: 'Banknote',
  bank: 'Building2',
  'e-wallet': 'Smartphone',
}

export const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  income: 'text-emerald-500',
  expense: 'text-red-500',
  transfer: 'text-blue-500',
}

export const TRANSACTION_TYPE_BG: Record<string, string> = {
  income: 'bg-emerald-50 text-emerald-700',
  expense: 'bg-red-50 text-red-700',
  transfer: 'bg-blue-50 text-blue-700',
}
