import { AppError } from './AppError';

/**
 * Validation error field detail
 */
export interface ValidationFieldError {
  field: string;
  message: string;
  value?: unknown;
  rule?: string;
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AppError {
  readonly field?: string;
  readonly fieldErrors: ValidationFieldError[];

  constructor(
    message: string,
    options: {
      field?: string;
      fieldErrors?: ValidationFieldError[];
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      isOperational: true,
      cause: options.cause,
      context: {
        ...options.context,
        field: options.field,
        fieldErrors: options.fieldErrors,
      },
    });

    this.field = options.field;
    this.fieldErrors = options.fieldErrors || [];
  }

  getUserMessage(): string {
    if (this.fieldErrors.length > 0) {
      const firstError = this.fieldErrors[0];
      return firstError.message;
    }
    if (this.field) {
      return `${this.field} 필드가 유효하지 않습니다.`;
    }
    return '입력값이 유효하지 않습니다.';
  }

  /**
   * Get all field error messages as a map
   */
  getFieldErrors(): Record<string, string> {
    return this.fieldErrors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Check if a specific field has an error
   */
  hasFieldError(field: string): boolean {
    return this.fieldErrors.some((e) => e.field === field);
  }

  /**
   * Get error message for a specific field
   */
  getFieldErrorMessage(field: string): string | undefined {
    return this.fieldErrors.find((e) => e.field === field)?.message;
  }
}

/**
 * Error thrown when a required field is missing
 */
export class RequiredFieldError extends ValidationError {
  constructor(
    field: string,
    options: {
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(`${field} 필드는 필수입니다.`, {
      field,
      fieldErrors: [{ field, message: `${field} 필드는 필수입니다.`, rule: 'required' }],
      cause: options.cause,
      context: options.context,
    });
  }
}

/**
 * Error thrown when a value exceeds limits
 */
export class LimitExceededError extends ValidationError {
  readonly limit: number;
  readonly actual: number;

  constructor(
    message: string,
    options: {
      field?: string;
      limit: number;
      actual: number;
      cause?: Error;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, {
      field: options.field,
      fieldErrors: options.field
        ? [
            {
              field: options.field,
              message,
              value: options.actual,
              rule: 'limit',
            },
          ]
        : [],
      cause: options.cause,
      context: {
        ...options.context,
        limit: options.limit,
        actual: options.actual,
      },
    });

    this.limit = options.limit;
    this.actual = options.actual;
  }

  getUserMessage(): string {
    return this.message;
  }
}

/**
 * Error thrown when input format is invalid
 */
export class FormatError extends ValidationError {
  readonly expectedFormat?: string;

  constructor(
    message: string,
    options: {
      field?: string;
      expectedFormat?: string;
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      field: options.field,
      fieldErrors: options.field
        ? [
            {
              field: options.field,
              message,
              rule: 'format',
            },
          ]
        : [],
      cause: options.cause,
      context: {
        ...options.context,
        expectedFormat: options.expectedFormat,
      },
    });

    this.expectedFormat = options.expectedFormat;
  }
}
