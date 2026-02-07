/**
 * Rate Limit Error
 *
 * Custom error for rate limiting scenarios
 */

import { AppError } from './AppError';

export interface RateLimitErrorDetails {
  /** Maximum allowed requests */
  limit: number;
  /** Time until reset in seconds */
  retryAfter: number;
  /** Daily usage count */
  dailyUsage?: number;
  /** Daily limit */
  dailyLimit?: number;
}

export class RateLimitError extends AppError {
  public readonly limit: number;
  public readonly retryAfter: number;
  public readonly dailyUsage?: number;
  public readonly dailyLimit?: number;

  constructor(
    message: string = 'Too many requests. Please try again later.',
    details: RateLimitErrorDetails
  ) {
    super(message, {
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      isOperational: true,
      context: {
        limit: details.limit,
        retryAfter: details.retryAfter,
        dailyUsage: details.dailyUsage,
        dailyLimit: details.dailyLimit,
      },
    });

    this.limit = details.limit;
    this.retryAfter = details.retryAfter;
    this.dailyUsage = details.dailyUsage;
    this.dailyLimit = details.dailyLimit;

    this.name = 'RateLimitError';
  }

  /**
   * Create a user-friendly message
   */
  getUserMessage(): string {
    if (this.dailyLimit && this.dailyUsage && this.dailyUsage >= this.dailyLimit) {
      return `일일 사용량 한도(${this.dailyLimit}회)에 도달했습니다. 내일 다시 시도해주세요.`;
    }
    return `요청이 너무 많습니다. ${this.retryAfter}초 후에 다시 시도해주세요.`;
  }

  /**
   * Get retry-after header value
   */
  getRetryAfterHeader(): string {
    return this.retryAfter.toString();
  }

  /**
   * Create from rate limit info
   */
  static fromLimitExceeded(
    limit: number,
    retryAfter: number,
    dailyUsage?: number,
    dailyLimit?: number
  ): RateLimitError {
    return new RateLimitError(undefined, {
      limit,
      retryAfter,
      dailyUsage,
      dailyLimit,
    });
  }
}
