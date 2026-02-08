/**
 * Logger Utility Tests
 *
 * Tests for the centralized logging system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLogger, logger } from '@/lib/utils/logger';

describe('Logger', () => {
  const originalLogLevel = process.env.LOG_LEVEL;
  const originalNextPublicLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;

  // Spy on console methods
  const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars
    delete process.env.LOG_LEVEL;
    delete process.env.NEXT_PUBLIC_LOG_LEVEL;
  });

  afterEach(() => {
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    }
    if (originalNextPublicLogLevel) {
      process.env.NEXT_PUBLIC_LOG_LEVEL = originalNextPublicLogLevel;
    }
  });

  describe('createLogger', () => {
    it('should create a logger instance', () => {
      const log = createLogger();
      expect(log).toBeDefined();
      expect(typeof log.debug).toBe('function');
      expect(typeof log.info).toBe('function');
      expect(typeof log.warn).toBe('function');
      expect(typeof log.error).toBe('function');
    });

    it('should create a namespaced logger', () => {
      // Use LOG_LEVEL to control behavior instead of NODE_ENV
      process.env.LOG_LEVEL = 'debug';
      const log = createLogger('TestModule');
      log.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('[TestModule]');
      expect(logOutput).toContain('Test message');
    });
  });

  describe('log levels', () => {
    it('should log all levels when LOG_LEVEL is debug', () => {
      process.env.LOG_LEVEL = 'debug';
      const log = createLogger();

      log.debug('debug message');
      log.info('info message');
      log.warn('warn message');
      log.error('error message');

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should only log warn and error when LOG_LEVEL is warn', () => {
      process.env.LOG_LEVEL = 'warn';
      const log = createLogger();

      log.debug('debug message');
      log.info('info message');
      log.warn('warn message');
      log.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should respect explicit LOG_LEVEL environment variable', () => {
      process.env.LOG_LEVEL = 'info';
      const log = createLogger();

      log.debug('debug message');
      log.info('info message');
      log.warn('warn message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should respect NEXT_PUBLIC_LOG_LEVEL environment variable', () => {
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'error';
      const log = createLogger();

      log.debug('debug message');
      log.info('info message');
      log.warn('warn message');
      log.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('log formatting', () => {
    beforeEach(() => {
      // Use LOG_LEVEL instead of NODE_ENV for controlling log level
      process.env.LOG_LEVEL = 'debug';
    });

    it('should include timestamp in log output', () => {
      const log = createLogger();
      log.info('Test message');

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      // ISO timestamp format check
      expect(logOutput).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include log level in output', () => {
      const log = createLogger();
      log.warn('Warning message');

      const logOutput = consoleWarnSpy.mock.calls[0][0];
      expect(logOutput).toContain('[WARN]');
    });

    it('should include context in log output', () => {
      const log = createLogger();
      log.info('Test with context', { userId: 123, action: 'test' });

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).toContain('Context:');
      expect(logOutput).toContain('userId');
      expect(logOutput).toContain('123');
      expect(logOutput).toContain('action');
      expect(logOutput).toContain('test');
    });

    it('should include error details in error log', () => {
      const log = createLogger();
      const testError = new Error('Test error message');
      log.error('An error occurred', testError);

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('Error:');
      expect(logOutput).toContain('Test error message');
    });

    it('should include both error and context', () => {
      const log = createLogger();
      const testError = new Error('Test error');
      log.error('Failed operation', testError, { operation: 'parse' });

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('Error:');
      expect(logOutput).toContain('Context:');
      expect(logOutput).toContain('operation');
    });
  });

  describe('default logger instance', () => {
    it('should export a default logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      // Use LOG_LEVEL instead of NODE_ENV for controlling log level
      process.env.LOG_LEVEL = 'debug';
    });

    it('should handle undefined context gracefully', () => {
      const log = createLogger();
      expect(() => log.info('Test message', undefined)).not.toThrow();
    });

    it('should handle empty context object', () => {
      const log = createLogger();
      log.info('Test message', {});

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(logOutput).not.toContain('Context:');
    });

    it('should handle error without context', () => {
      const log = createLogger();
      const testError = new Error('Test');
      expect(() => log.error('Error occurred', testError)).not.toThrow();
    });

    it('should handle error with cause', () => {
      const log = createLogger();
      const causeError = new Error('Root cause');
      const testError = new Error('Wrapper error', { cause: causeError });
      log.error('Error with cause', testError);

      const logOutput = consoleErrorSpy.mock.calls[0][0];
      expect(logOutput).toContain('cause');
    });

    it('should handle invalid LOG_LEVEL gracefully', () => {
      process.env.LOG_LEVEL = 'invalid_level';
      const log = createLogger();
      // Should fall back to environment-based default
      expect(() => log.info('Test')).not.toThrow();
    });
  });
});
