/**
 * Error classes for LLM Diagram Modification
 */

export enum ModifyErrorCode {
  // API errors
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_TIMEOUT = 'API_TIMEOUT',
  API_ERROR = 'API_ERROR',

  // Parsing errors
  INVALID_JSON = 'INVALID_JSON',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  INVALID_OPERATION = 'INVALID_OPERATION',

  // Application errors
  NODE_NOT_FOUND = 'NODE_NOT_FOUND',
  INVALID_NODE_TYPE = 'INVALID_NODE_TYPE',
  EMPTY_DIAGRAM = 'EMPTY_DIAGRAM',
  OPERATION_FAILED = 'OPERATION_FAILED',

  // Unknown
  UNKNOWN = 'UNKNOWN',
}

export interface ModifyErrorDetails {
  code: ModifyErrorCode;
  userMessage: string;
  technicalMessage?: string;
  retryAfter?: number;
  recoverable: boolean;
}

/**
 * Base error class for LLM modification errors
 */
export class LLMModifyError extends Error {
  public readonly code: ModifyErrorCode;
  public readonly userMessage: string;
  public readonly recoverable: boolean;
  public readonly retryAfter?: number;

  constructor(
    message: string,
    code: ModifyErrorCode,
    userMessage: string,
    recoverable = true,
    retryAfter?: number
  ) {
    super(message);
    this.name = 'LLMModifyError';
    this.code = code;
    this.userMessage = userMessage;
    this.recoverable = recoverable;
    this.retryAfter = retryAfter;
  }

  toJSON(): ModifyErrorDetails {
    return {
      code: this.code,
      userMessage: this.userMessage,
      technicalMessage: this.message,
      retryAfter: this.retryAfter,
      recoverable: this.recoverable,
    };
  }

  /**
   * Factory methods for common errors
   */
  static apiKeyMissing(): LLMModifyError {
    return new LLMModifyError(
      'ANTHROPIC_API_KEY is not configured',
      ModifyErrorCode.API_KEY_MISSING,
      'AI 기능을 사용하려면 API 키 설정이 필요합니다.',
      false
    );
  }

  static rateLimit(retryAfter = 60): LLMModifyError {
    return new LLMModifyError(
      'Rate limit exceeded',
      ModifyErrorCode.API_RATE_LIMIT,
      `요청이 너무 많습니다. ${retryAfter}초 후에 다시 시도해주세요.`,
      true,
      retryAfter
    );
  }

  static timeout(): LLMModifyError {
    return new LLMModifyError(
      'API request timed out',
      ModifyErrorCode.API_TIMEOUT,
      'AI 응답 시간이 초과되었습니다. 다시 시도해주세요.',
      true
    );
  }

  static invalidJson(details?: string): LLMModifyError {
    return new LLMModifyError(
      `Failed to parse JSON: ${details || 'unknown error'}`,
      ModifyErrorCode.INVALID_JSON,
      'AI 응답을 처리할 수 없습니다. 다시 시도해주세요.',
      true
    );
  }

  static invalidResponse(details?: string): LLMModifyError {
    return new LLMModifyError(
      `Invalid LLM response: ${details || 'unknown error'}`,
      ModifyErrorCode.INVALID_RESPONSE,
      'AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.',
      true
    );
  }

  static nodeNotFound(nodeId: string): LLMModifyError {
    return new LLMModifyError(
      `Node not found: ${nodeId}`,
      ModifyErrorCode.NODE_NOT_FOUND,
      `"${nodeId}" 노드를 찾을 수 없습니다. 노드 이름을 확인해주세요.`,
      true
    );
  }

  static invalidNodeType(nodeType: string): LLMModifyError {
    return new LLMModifyError(
      `Invalid node type: ${nodeType}`,
      ModifyErrorCode.INVALID_NODE_TYPE,
      `"${nodeType}"은(는) 유효하지 않은 노드 타입입니다.`,
      true
    );
  }

  static emptyDiagram(): LLMModifyError {
    return new LLMModifyError(
      'Cannot modify empty diagram',
      ModifyErrorCode.EMPTY_DIAGRAM,
      '수정할 다이어그램이 없습니다. 먼저 다이어그램을 생성해주세요.',
      true
    );
  }

  static operationFailed(details?: string): LLMModifyError {
    return new LLMModifyError(
      `Operation failed: ${details || 'unknown error'}`,
      ModifyErrorCode.OPERATION_FAILED,
      '변경 사항을 적용할 수 없습니다. 다시 시도해주세요.',
      true
    );
  }

  static apiError(status: number, message?: string): LLMModifyError {
    return new LLMModifyError(
      `API error: ${status} - ${message || 'unknown'}`,
      ModifyErrorCode.API_ERROR,
      'AI 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      true
    );
  }

  static unknown(error: unknown): LLMModifyError {
    const message = error instanceof Error ? error.message : String(error);
    return new LLMModifyError(
      message,
      ModifyErrorCode.UNKNOWN,
      '알 수 없는 오류가 발생했습니다.',
      true
    );
  }
}

/**
 * Check if error is a LLMModifyError
 */
export function isLLMModifyError(error: unknown): error is LLMModifyError {
  return error instanceof LLMModifyError;
}

/**
 * Convert any error to LLMModifyError
 */
export function toLLMModifyError(error: unknown): LLMModifyError {
  if (isLLMModifyError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Check for known error patterns
    if (error.message.includes('API key')) {
      return LLMModifyError.apiKeyMissing();
    }
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return LLMModifyError.rateLimit();
    }
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return LLMModifyError.timeout();
    }
  }

  return LLMModifyError.unknown(error);
}
