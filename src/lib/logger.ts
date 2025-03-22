
/**
 * A simple logging utility for the application
 * Supports multiple log levels and formats
 */

// Log levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

// Get current environment from env variables
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';

// Default to show all logs in development, only errors and warnings in production
const DEFAULT_LOG_LEVEL = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

// Enable saving logs to localStorage for frontend debugging
const SAVE_LOGS = true;
const MAX_LOGS = 100;

// Format the current time for log entries
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Save log to localStorage (frontend only)
const saveLog = (level: LogLevel, message: string, data?: any): void => {
  if (typeof window === 'undefined' || !SAVE_LOGS) return;
  
  try {
    const logs = JSON.parse(localStorage.getItem('application_logs') || '[]');
    logs.push({
      timestamp: getTimestamp(),
      level,
      message,
      data: data ? JSON.stringify(data) : undefined
    });
    
    // Keep log size manageable by removing oldest entries
    while (logs.length > MAX_LOGS) {
      logs.shift();
    }
    
    localStorage.setItem('application_logs', JSON.stringify(logs));
  } catch (e) {
    // If there's an error saving to localStorage, just continue
    console.error('Error saving log to localStorage:', e);
  }
};

/**
 * Log an error message
 * @param message - The error message
 * @param error - Optional error object
 */
export const logError = (message: string, error?: any): void => {
  const timestamp = getTimestamp();
  console.error(`[${timestamp}] [ERROR] ${message}`, error || '');
  saveLog(LogLevel.ERROR, message, error);
};

/**
 * Log a warning message
 * @param message - The warning message
 * @param data - Optional data to include
 */
export const logWarning = (message: string, data?: any): void => {
  // Changed from == to !== to fix type error
  if (DEFAULT_LOG_LEVEL === LogLevel.ERROR) return;
  
  const timestamp = getTimestamp();
  console.warn(`[${timestamp}] [WARN] ${message}`, data || '');
  saveLog(LogLevel.WARN, message, data);
};

/**
 * Log an info message
 * @param message - The info message
 * @param data - Optional data to include
 */
export const logInfo = (message: string, data?: any): void => {
  // Changed comparison logic to avoid type errors
  if (DEFAULT_LOG_LEVEL === LogLevel.ERROR || DEFAULT_LOG_LEVEL === LogLevel.WARN) return;
  
  const timestamp = getTimestamp();
  console.info(`[${timestamp}] [INFO] ${message}`, data || '');
  saveLog(LogLevel.INFO, message, data);
};

/**
 * Log a debug message - only displays in development
 * @param message - The debug message
 * @param data - Optional data to include
 */
export const logDebug = (message: string, data?: any): void => {
  if (DEFAULT_LOG_LEVEL !== LogLevel.DEBUG) return;
  
  const timestamp = getTimestamp();
  console.debug(`[${timestamp}] [DEBUG] ${message}`, data || '');
  saveLog(LogLevel.DEBUG, message, data);
};

/**
 * Get all logs stored in localStorage (frontend only)
 * @returns Array of log entries or empty array if none exist
 */
export const getLogs = (): any[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('application_logs') || '[]');
  } catch (e) {
    console.error('Error parsing logs from localStorage:', e);
    return [];
  }
};

/**
 * Clear all logs from localStorage (frontend only)
 */
export const clearLogs = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('application_logs');
};

// Default logger instance
export default {
  error: logError,
  warn: logWarning,
  info: logInfo,
  debug: logDebug,
  getLogs,
  clearLogs
};
