/**
 * Utility functions for formatting dates to Indian Standard Time (IST)
 * IST is UTC+5:30
 */

/**
 * Convert a date to Indian Standard Time (IST)
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date in IST
 */
export const toIST = (date) => {
  const d = new Date(date);
  // Get UTC time and add IST offset (UTC+5:30 = 5.5 hours)
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (5.5 * 3600000));
  return ist;
};

/**
 * Format date to Indian Standard Time string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string in IST
 */
export const formatIST = (date, options = {}) => {
  if (!date) return 'Unavailable';
  
  const defaultOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...options,
  };

  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date to Indian Standard Time string (date only)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export const formatISTDate = (date) => {
  return formatIST(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: undefined,
    minute: undefined,
    second: undefined,
    hour12: undefined,
  });
};

/**
 * Format date to Indian Standard Time string (time only)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string (HH:MM:SS AM/PM)
 */
export const formatISTTime = (date) => {
  return formatIST(date, {
    year: undefined,
    month: undefined,
    day: undefined,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

/**
 * Get current Indian Standard Time
 * @returns {Date} Current date/time in IST
 */
export const getCurrentIST = () => {
  return toIST(new Date());
};

/**
 * Format date to full Indian Standard Time string with date and time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatISTDateTime = (date) => {
  return formatIST(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

