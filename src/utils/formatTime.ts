/**
 * Utility for formatting relative time for posts, comments, and notifications
 * Supports both Vietnamese and English relative time strings
 */

export function formatRelativeTime(
  dateInput?: string | number | Date | null,
  fallbackTime?: string,
): string {
  if (!dateInput) {
    return fallbackTime || 'Vừa xong'
  }

  const date = typeof dateInput === 'object' ? dateInput : new Date(dateInput)
  const timeMs = date.getTime()

  // If invalid date, return fallback
  if (isNaN(timeMs)) {
    return fallbackTime || 'Vừa xong'
  }

  const diffSeconds = Math.floor((Date.now() - timeMs) / 1000)

  // Future or negative difference
  if (diffSeconds < 45) {
    return 'Vừa xong'
  }

  // Minutes
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`
  }

  // Hours
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} giờ trước`
  }

  // Days
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} ngày trước`
  }

  // Weeks
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) {
    return `${diffWeeks} tuần trước`
  }

  // Older than a month: format as Date e.g. "15 Th10" or "15 Th10, 2025"
  const currentYear = new Date().getFullYear()
  const postYear = date.getFullYear()

  const day = date.getDate()
  const month = date.getMonth() + 1

  if (postYear === currentYear) {
    return `${day} Th${month}`
  }

  return `${day} Th${month}, ${postYear}`
}

/**
 * Short relative time format like Instagram (e.g., 2m, 3h, 1d, 2w)
 */
export function formatShortRelativeTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'Vừa xong'

  const date = typeof dateInput === 'object' ? dateInput : new Date(dateInput)
  const timeMs = date.getTime()
  if (isNaN(timeMs)) return 'Vừa xong'

  const diffSeconds = Math.floor((Date.now() - timeMs) / 1000)
  if (diffSeconds < 45) return 'Vừa xong'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `${diffWeeks}w`

  return `${date.getDate()} Th${date.getMonth() + 1}`
}
