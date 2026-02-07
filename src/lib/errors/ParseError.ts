import { AppError } from './AppError';

/**
 * Error thrown during prompt parsing
 */
export class ParseError extends AppError {
  readonly prompt?: string;
  readonly parseStage?: 'tokenize' | 'match' | 'transform' | 'validate';

  constructor(
    message: string,
    options: {
      prompt?: string;
      parseStage?: 'tokenize' | 'match' | 'transform' | 'validate';
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: 'PARSE_ERROR',
      statusCode: 400,
      isOperational: true,
      cause: options.cause,
      context: {
        ...options.context,
        prompt: options.prompt,
        parseStage: options.parseStage,
      },
    });

    this.prompt = options.prompt;
    this.parseStage = options.parseStage;
  }

  getUserMessage(): string {
    switch (this.parseStage) {
      case 'tokenize':
        return '입력을 이해할 수 없습니다. 다시 입력해주세요.';
      case 'match':
        return '적합한 템플릿을 찾을 수 없습니다.';
      case 'transform':
        return '다이어그램 변환 중 오류가 발생했습니다.';
      case 'validate':
        return '유효하지 않은 구성입니다.';
      default:
        return '프롬프트 처리 중 오류가 발생했습니다.';
    }
  }
}

/**
 * Error thrown when template matching fails
 */
export class TemplateError extends AppError {
  readonly templateId?: string;

  constructor(
    message: string,
    options: {
      templateId?: string;
      cause?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: 'TEMPLATE_ERROR',
      statusCode: 400,
      isOperational: true,
      cause: options.cause,
      context: {
        ...options.context,
        templateId: options.templateId,
      },
    });

    this.templateId = options.templateId;
  }
}
