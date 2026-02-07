'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React rendering errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || '알 수 없는 오류가 발생했습니다.';
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('fetch');
      const isTimeoutError = errorMessage.toLowerCase().includes('timeout');

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-zinc-900 rounded-lg border border-red-500/30">
          <div className="text-4xl mb-3">
            {isNetworkError ? '🌐' : isTimeoutError ? '⏱️' : '⚠️'}
          </div>
          <div className="text-red-400 text-lg font-semibold mb-2">
            {isNetworkError
              ? '네트워크 연결 오류'
              : isTimeoutError
                ? '요청 시간 초과'
                : '오류가 발생했습니다'}
          </div>
          <div className="text-zinc-400 text-sm mb-4 text-center max-w-md">
            {isNetworkError
              ? '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.'
              : isTimeoutError
                ? '서버 응답이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.'
                : errorMessage}
          </div>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 w-full max-w-md">
              <summary className="text-zinc-500 text-xs cursor-pointer hover:text-zinc-400">
                개발자 정보 보기
              </summary>
              <pre className="mt-2 p-3 bg-zinc-800 rounded text-xs text-zinc-400 overflow-auto max-h-32">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error fallback component
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error?: Error;
  resetErrorBoundary?: () => void;
}): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-zinc-900 rounded-lg border border-red-500/30">
      <div className="text-red-400 text-lg font-semibold mb-2">
        오류가 발생했습니다
      </div>
      <div className="text-zinc-400 text-sm mb-4 text-center max-w-md">
        {error?.message || '컴포넌트 렌더링 중 문제가 발생했습니다.'}
      </div>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

/**
 * Hook-friendly wrapper for error boundary
 * Usage: <ErrorBoundaryWrapper><YourComponent /></ErrorBoundaryWrapper>
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}): ReactNode {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
