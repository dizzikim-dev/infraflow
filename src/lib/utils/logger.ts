/**
 * Logger Utility
 *
 * Centralized logging system with environment-aware log levels.
 * Provides structured logging with context for better debugging.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}

/**
 * Log level priority (lower = more verbose)
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get the minimum log level based on environment
 */
function getMinLogLevel(): LogLevel {
  // Allow explicit override via environment variable
  const explicitLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL;
  if (explicitLevel && isValidLogLevel(explicitLevel)) {
    return explicitLevel;
  }

  // Environment-based defaults
  const nodeEnv = process.env.NODE_ENV;

  switch (nodeEnv) {
    case 'development':
      return 'debug';
    case 'test':
      return 'warn';
    case 'production':
      return 'warn';
    default:
      return 'info';
  }
}

/**
 * Type guard for LogLevel
 */
function isValidLogLevel(level: string): level is LogLevel {
  return ['debug', 'info', 'warn', 'error'].includes(level);
}

/**
 * Format error for logging
 */
function formatError(error: Error): Record<string, unknown> {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error.cause ? { cause: error.cause } : {}),
  };
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context, error } = entry;
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  let output = `${prefix} ${message}`;

  if (context && Object.keys(context).length > 0) {
    output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
  }

  if (error) {
    output += `\n  Error: ${JSON.stringify(formatError(error), null, 2)}`;
  }

  return output;
}

/**
 * Create a logger instance with optional namespace
 */
export function createLogger(namespace?: string): Logger {
  const minLevel = getMinLogLevel();
  const minPriority = LOG_LEVEL_PRIORITY[minLevel];

  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVEL_PRIORITY[level] >= minPriority;
  };

  const createLogEntry = (
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry => {
    const fullMessage = namespace ? `[${namespace}] ${message}` : message;
    return {
      level,
      message: fullMessage,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
  };

  const log = (entry: LogEntry): void => {
    const formatted = formatLogEntry(entry);

    switch (entry.level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  };

  return {
    debug(message: string, context?: LogContext): void {
      if (shouldLog('debug')) {
        log(createLogEntry('debug', message, context));
      }
    },

    info(message: string, context?: LogContext): void {
      if (shouldLog('info')) {
        log(createLogEntry('info', message, context));
      }
    },

    warn(message: string, context?: LogContext): void {
      if (shouldLog('warn')) {
        log(createLogEntry('warn', message, context));
      }
    },

    error(message: string, error?: Error, context?: LogContext): void {
      if (shouldLog('error')) {
        log(createLogEntry('error', message, context, error));
      }
    },
  };
}

/**
 * Default logger instance (no namespace)
 */
export const logger = createLogger();

/**
 * Create a namespaced logger for a specific module
 *
 * @example
 * const log = createLogger('Parser');
 * log.warn('Pattern not found', { pattern: 'firewall' });
 * // Output: [2024-01-01T00:00:00.000Z] [WARN] [Parser] Pattern not found
 */
export { createLogger as getLogger };
