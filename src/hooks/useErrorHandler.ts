'use client';

import { useCallback, useState } from 'react';
import { AppError } from '@/lib/errors/AppError';
import { NetworkError } from '@/lib/errors/NetworkError';
import { ParseError } from '@/lib/errors/ParseError';
import { ValidationError } from '@/lib/errors/ValidationError';

/**
 * Error state for UI display
 */
export interface ErrorState {
  message: string;
  code: string;
  isVisible: boolean;
  severity: 'error' | 'warning' | 'info';
  details?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Options for error handling
 */
export interface ErrorHandlerOptions {
  /** Show error in UI (default: true) */
  showError?: boolean;
  /** Log to console (default: true) */
  logError?: boolean;
  /** Auto-dismiss after ms (0 = never) */
  autoDismissMs?: number;
  /** Custom error message override */
  customMessage?: string;
  /** Callback when error is handled */
  onError?: (error: Error, state: ErrorState) => void;
}

const DEFAULT_OPTIONS: ErrorHandlerOptions = {
  showError: true,
  logError: true,
  autoDismissMs: 5000,
};

/**
 * Return type for useErrorHandler hook
 */
export interface UseErrorHandlerReturn {
  /** Current error state */
  error: ErrorState | null;
  /** Handle an error */
  handleError: (error: unknown, options?: ErrorHandlerOptions) => void;
  /** Clear current error */
  clearError: () => void;
  /** Check if there's an active error */
  hasError: boolean;
  /** Wrap an async function with error handling */
  withErrorHandling: <T>(
    fn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ) => Promise<T | undefined>;
}

/**
 * Convert unknown error to AppError
 */
function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, {
      code: 'UNKNOWN_ERROR',
      cause: error,
    });
  }

  return new AppError(String(error), {
    code: 'UNKNOWN_ERROR',
  });
}

/**
 * Determine error severity based on error type
 */
function getErrorSeverity(error: AppError): 'error' | 'warning' | 'info' {
  if (error instanceof NetworkError) {
    // Rate limit or timeout are warnings
    if (error.responseStatus === 429 || error.responseStatus === 408) {
      return 'warning';
    }
  }

  if (error instanceof ValidationError) {
    return 'warning';
  }

  if (error instanceof ParseError) {
    return 'warning';
  }

  // Server errors are critical
  if (error.statusCode >= 500) {
    return 'error';
  }

  // Client errors are warnings
  if (error.statusCode >= 400) {
    return 'warning';
  }

  return 'error';
}

/**
 * Hook for consistent error handling across the application
 *
 * @example
 * ```tsx
 * const { error, handleError, clearError, withErrorHandling } = useErrorHandler();
 *
 * // Direct error handling
 * try {
 *   await riskyOperation();
 * } catch (e) {
 *   handleError(e, { customMessage: '작업 실패' });
 * }
 *
 * // Wrapped async function
 * const result = await withErrorHandling(async () => {
 *   return await fetchData();
 * });
 * ```
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<ErrorState | null>(null);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle an error with options
   */
  const handleError = useCallback(
    (rawError: unknown, options: ErrorHandlerOptions = {}) => {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const appError = normalizeError(rawError);

      // Log error if enabled
      if (opts.logError) {
        console.error('[ErrorHandler]', appError.toJSON());
      }

      // Build error state
      const errorState: ErrorState = {
        message: opts.customMessage || appError.getUserMessage(),
        code: appError.code,
        isVisible: opts.showError ?? true,
        severity: getErrorSeverity(appError),
        details: appError.message !== appError.getUserMessage() ? appError.message : undefined,
      };

      // Add field errors for validation errors
      if (appError instanceof ValidationError) {
        errorState.fieldErrors = appError.getFieldErrors();
      }

      // Update state if showing
      if (opts.showError) {
        setError(errorState);

        // Auto-dismiss if configured
        if (opts.autoDismissMs && opts.autoDismissMs > 0) {
          setTimeout(() => {
            setError((current) => {
              // Only clear if it's the same error
              if (current?.code === errorState.code && current?.message === errorState.message) {
                return null;
              }
              return current;
            });
          }, opts.autoDismissMs);
        }
      }

      // Call custom handler if provided
      opts.onError?.(appError, errorState);
    },
    []
  );

  /**
   * Wrap an async function with error handling
   */
  const withErrorHandling = useCallback(
    async <T>(
      fn: () => Promise<T>,
      options?: ErrorHandlerOptions
    ): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (e) {
        handleError(e, options);
        return undefined;
      }
    },
    [handleError]
  );

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null && error.isVisible,
    withErrorHandling,
  };
}
