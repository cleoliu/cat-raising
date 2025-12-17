/**
 * Date and time utility functions for Taiwan timezone (UTC+8)
 */

/**
 * Convert UTC date string to Taiwan timezone and format as date
 */
export const formatTaiwanDate = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString)
  return utcDate.toLocaleDateString('zh-TW', {
    timeZone: 'Asia/Taipei'
  })
}

/**
 * Convert UTC date string to Taiwan timezone and format as time
 */
export const formatTaiwanTime = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString)
  return utcDate.toLocaleTimeString('zh-TW', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Asia/Taipei'
  })
}

/**
 * Convert UTC date string to Taiwan timezone and format as datetime
 */
export const formatTaiwanDateTime = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString)
  return utcDate.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Taipei'
  })
}

/**
 * Get current Taiwan time in YYYY-MM-DDTHH:MM format for datetime-local input
 */
export const getCurrentTaiwanDateTime = (): string => {
  const now = new Date()
  // Convert to Taiwan timezone and format for datetime-local input
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  return formatter.format(now).replace(' ', 'T')
}

/**
 * Convert UTC date string to Taiwan datetime-local format for editing
 */
export const utcToTaiwanDateTime = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString)
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  return formatter.format(utcDate).replace(' ', 'T')
}

/**
 * Convert Taiwan datetime-local to UTC for storage
 * Correctly handles timezone conversion by treating input as UTC+8
 */
export const taiwanDateTimeToUtc = (taiwanDateTime: string): string => {
  const [datePart, timePart] = taiwanDateTime.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute, second = 0] = timePart.split(':').map(Number)
  
  const taiwanDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
  taiwanDate.setUTCHours(taiwanDate.getUTCHours() - 8)
  
  return taiwanDate.toISOString()
}

/**
 * Get current Taiwan date string (YYYY-MM-DD)
 */
export const getCurrentTaiwanDateString = (): string => {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(now)
}

/**
 * Convert Taiwan date to UTC date range for database queries
 * Takes a Taiwan date (YYYY-MM-DD) and returns UTC start/end timestamps
 */
export const taiwanDateToUtcRange = (taiwanDate: string): { startOfDay: string, endOfDay: string } => {
  const [year, month, day] = taiwanDate.split('-').map(Number)
  
  const startOfDayUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  startOfDayUtc.setUTCHours(startOfDayUtc.getUTCHours() - 8)
  
  const endOfDayUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
  endOfDayUtc.setUTCHours(endOfDayUtc.getUTCHours() - 8)
  
  return {
    startOfDay: startOfDayUtc.toISOString(),
    endOfDay: endOfDayUtc.toISOString()
  }
}