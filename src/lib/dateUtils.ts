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
  // Create Taiwan date at start of day (00:00:00)
  const startOfDayTaiwan = new Date(`${taiwanDate}T00:00:00`)
  // Subtract 8 hours to convert Taiwan time to UTC (Taiwan is UTC+8)
  const startOfDayUtc = new Date(startOfDayTaiwan.getTime() - (8 * 60 * 60 * 1000))
  
  // Create Taiwan date at end of day (23:59:59.999)
  const endOfDayTaiwan = new Date(`${taiwanDate}T23:59:59.999`)
  // Subtract 8 hours to convert Taiwan time to UTC
  const endOfDayUtc = new Date(endOfDayTaiwan.getTime() - (8 * 60 * 60 * 1000))
  
  return {
    startOfDay: startOfDayUtc.toISOString(),
    endOfDay: endOfDayUtc.toISOString()
  }
}