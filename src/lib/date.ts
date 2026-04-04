/**
 * Date formatting utilities — Vietnamese-first, all functions accept
 * Date | string | number (epoch ms). Strings are parsed as local time
 * unless they contain a timezone offset.
 */

// ─── Normalise input ────────────────────────────────────────────────────────

export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  // "2024-04-01" (date-only ISO) → treat as local midnight, not UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(value)
}

// ─── Basic helpers ──────────────────────────────────────────────────────────

export function isToday(value: Date | string | number): boolean {
  const d = toDate(value)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function isYesterday(value: Date | string | number): boolean {
  const d = toDate(value)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  )
}

export function isThisYear(value: Date | string | number): boolean {
  return toDate(value).getFullYear() === new Date().getFullYear()
}

// ─── Formatters ─────────────────────────────────────────────────────────────

/**
 * "01/04/2026"
 */
export function formatDate(value: Date | string | number): string {
  const d = toDate(value)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * "01/04/26" – compact for tight spaces
 */
export function formatDateShort(value: Date | string | number): string {
  const d = toDate(value)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(2)
  return `${dd}/${mm}/${yy}`
}

/**
 * "01/04/2026 14:30"
 */
export function formatDateTime(value: Date | string | number): string {
  const d = toDate(value)
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)} ${hh}:${min}`
}

/**
 * "01/04/2026 14:30:05"
 */
export function formatDateTimeFull(value: Date | string | number): string {
  const d = toDate(value)
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${formatDate(d)} ${hh}:${min}:${ss}`
}

/**
 * "Tháng 4, 2026" – month + year label used in headers
 */
export function formatMonth(value: Date | string | number): string {
  return toDate(value).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
}

/**
 * "Thứ Hai, 01 tháng 4 năm 2026" – full verbose Vietnamese date
 */
export function formatDateVerbose(value: Date | string | number): string {
  return toDate(value).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * "Hôm nay", "Hôm qua", "Thứ Hai", "01/04/2026"
 * – smart label for transaction list date headings
 */
export function formatDateLabel(value: Date | string | number): string {
  const d = toDate(value)
  if (isToday(d)) return 'Hôm nay'
  if (isYesterday(d)) return 'Hôm qua'
  // Within the same year: show weekday + date, no year
  if (isThisYear(d)) {
    return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
  }
  return formatDate(d)
}

/**
 * "Hôm nay lúc 14:30", "Hôm qua lúc 09:05", "01/04/2026 lúc 14:30"
 */
export function formatDateTimeRelative(value: Date | string | number): string {
  const d = toDate(value)
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const time = `${hh}:${min}`

  if (isToday(d)) return `Hôm nay lúc ${time}`
  if (isYesterday(d)) return `Hôm qua lúc ${time}`
  return `${formatDate(d)} lúc ${time}`
}

/**
 * "3 phút trước", "2 giờ trước", "Hôm qua", "3 ngày trước", "01/04/2026"
 */
export function formatRelative(value: Date | string | number): string {
  const d = toDate(value)
  const diffMs = Date.now() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHour < 24) return `${diffHour} giờ trước`
  if (diffDay === 1) return 'Hôm qua'
  if (diffDay < 7) return `${diffDay} ngày trước`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} tuần trước`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} tháng trước`
  return `${Math.floor(diffDay / 365)} năm trước`
}

/**
 * "2026-04-01" – for <input type="date"> value prop
 */
export function formatDateInput(value: Date | string | number): string {
  const d = toDate(value)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * "T4" (1=CN, 2=T2 … 7=T7) – ultra-short day label for chart axes
 */
export function formatDayOfWeekShort(value: Date | string | number): string {
  const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  return labels[toDate(value).getDay()]
}

/**
 * "Th4" (Jan=Th1 … Dec=Th12) – short month label for chart axes
 */
export function formatMonthShort(value: Date | string | number): string {
  const m = toDate(value).getMonth() + 1
  return `Th${m}`
}

// ─── Range helpers ───────────────────────────────────────────────────────────

/** First moment of the day (00:00:00.000) */
export function startOfDay(value: Date | string | number): Date {
  const d = toDate(value)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

/** Last moment of the day (23:59:59.999) */
export function endOfDay(value: Date | string | number): Date {
  const d = toDate(value)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

/** First day of the month at 00:00:00 */
export function startOfMonth(value: Date | string | number): Date {
  const d = toDate(value)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** Last day of the month at 23:59:59.999 */
export function endOfMonth(value: Date | string | number): Date {
  const d = toDate(value)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

// ─── Grouping helper ─────────────────────────────────────────────────────────

/**
 * Groups an array of items by calendar date.
 * Returns entries sorted newest-first.
 *
 * @example
 * const groups = groupByDate(transactions, tx => tx.date)
 * // [{ label: 'Hôm nay', key: '2026-04-02', items: [...] }, ...]
 */
export function groupByDate<T>(
  items: T[],
  getDate: (item: T) => Date | string | number,
): Array<{ label: string; key: string; items: T[] }> {
  const map = new Map<string, T[]>()

  for (const item of items) {
    const key = formatDateInput(getDate(item))
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }

  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, grouped]) => ({
      key,
      label: formatDateLabel(key),
      items: grouped,
    }))
}
