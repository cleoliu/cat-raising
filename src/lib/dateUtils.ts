/**
 * Date and time utility functions for Taiwan timezone (UTC+8)
 */

/**
 * Convert UTC date string to Taiwan timezone and format as date
 */
export const formatTaiwanDate = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString)
  // Taiwan is UTC+8
  const taiwanTime = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000))
  return taiwanTime.toLocaleDateString('zh-TW', {
    timeZone: 'UTC' // Since we already adjusted for Taiwan time
  })
}

/**
 * Convert UTC date string to Taiwan timezone and format as time
 */
export const formatTaiwanTime = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString)
  // Taiwan is UTC+8
  const taiwanTime = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000))
  return taiwanTime.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC' // Since we already adjusted for Taiwan time
  })
}

/**
 * Convert UTC date string to Taiwan timezone and format as datetime
 */
export const formatTaiwanDateTime = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString)
  // Taiwan is UTC+8
  const taiwanTime = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000))
  return taiwanTime.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC' // Since we already adjusted for Taiwan time
  })
}

/**
 * Get current Taiwan time in YYYY-MM-DDTHH:MM format for datetime-local input
 */
export const getCurrentTaiwanDateTime = (): string => {
  const now = new Date()
  // Taiwan is UTC+8
  const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000))
  return taiwanTime.toISOString().slice(0, 16)
}

/**
 * Convert UTC date string to Taiwan datetime-local format for editing
 */
export const utcToTaiwanDateTime = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString)
  const taiwanTime = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000))
  return taiwanTime.toISOString().slice(0, 16)
}

/**
 * Convert Taiwan datetime-local to UTC for storage
 */
export const taiwanDateTimeToUtc = (taiwanDateTime: string): string => {
  const localDate = new Date(taiwanDateTime)
  // Subtract 8 hours to convert Taiwan time to UTC
  const utcDate = new Date(localDate.getTime() - (8 * 60 * 60 * 1000))
  return utcDate.toISOString()
}

/**
 * Get current Taiwan date string (YYYY-MM-DD)
 */
export const getCurrentTaiwanDateString = (): string => {
  const now = new Date()
  // Taiwan is UTC+8
  const taiwanTime = new Date(now.getTime() + (8 * 60 * 60 * 1000))
  const year = taiwanTime.getUTCFullYear()
  const month = String(taiwanTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(taiwanTime.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}