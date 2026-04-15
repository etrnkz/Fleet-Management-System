/**
 * Safely format a date value that might be in various formats
 * @param dateValue - Date string, Date object, or null/undefined
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or 'Invalid Date' fallback
 */
export function formatDate(
  dateValue: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateValue) return 'N/A'
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    return date.toLocaleDateString('en-US', options)
  } catch (error) {
    console.error('Date formatting error:', error, dateValue)
    return 'Invalid Date'
  }
}

/**
 * Safely format a date and time value
 */
export function formatDateTime(
  dateValue: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateValue) return 'N/A'
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    return date.toLocaleString('en-US', options)
  } catch (error) {
    console.error('DateTime formatting error:', error, dateValue)
    return 'Invalid Date'
  }
}
