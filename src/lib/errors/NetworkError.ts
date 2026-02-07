import { AppError } from './AppError';

/**
 * Error thrown during network/API operations
 */
export class NetworkError extends AppError {
  readonly url?: string;
  readonly method?: string;
  readonly responseStatus?: number;

  constructor(
    message: string,
    options: {
      url?: string;
      method?: string;
      responseStatus?: number;
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    const statusCode = options.responseStatus || 500;

    super(message, {
      code: 'NETWORK_ERROR',
      statusCode,
      isOperational: statusCode < 500,
      cause: options.cause,
      context: {
        ...options.context,
        url: options.url,
        method: options.method,
        responseStatus: options.responseStatus,
      },
    });

    this.url = options.url;
    this.method = options.method;
    this.responseStatus = options.responseStatus;
  }

  getUserMessage(): string {
    if (this.responseStatus) {
      switch (this.responseStatus) {
        case 401:
          return '인증이 필요합니다.';
        case 403:
          return '접근 권한이 없습니다.';
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.';
        case 429:
          return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        case 500:
        case 502:
        case 503:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          if (this.responseStatus >= 400 && this.responseStatus < 500) {
            return '요청을 처리할 수 없습니다.';
          }
          return '네트워크 오류가 발생했습니다.';
      }
    }
    return '네트워크 연결을 확인해주세요.';
  }
}

/**
 * Error thrown when API rate limit is exceeded
 */
export class RateLimitError extends NetworkError {
  readonly retryAfter?: number;

  constructor(
    message: string = '요청 한도를 초과했습니다',
    options: {
      retryAfter?: number;
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      responseStatus: 429,
      cause: options.cause,
      context: {
        ...options.context,
        retryAfter: options.retryAfter,
      },
    });

    this.retryAfter = options.retryAfter;
  }

  getUserMessage(): string {
    if (this.retryAfter) {
      return `요청 한도를 초과했습니다. ${this.retryAfter}초 후 다시 시도해주세요.`;
    }
    return '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
  }
}

/**
 * Error thrown when network request times out
 */
export class TimeoutError extends NetworkError {
  readonly timeoutMs?: number;

  constructor(
    message: string = '요청 시간이 초과되었습니다',
    options: {
      url?: string;
      timeoutMs?: number;
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      url: options.url,
      responseStatus: 408,
      cause: options.cause,
      context: {
        ...options.context,
        timeoutMs: options.timeoutMs,
      },
    });

    this.timeoutMs = options.timeoutMs;
  }
}
