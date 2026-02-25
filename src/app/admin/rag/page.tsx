'use client';

/**
 * Admin RAG 관제 대시보드
 *
 * ChromaDB 연결 상태, 컬렉션별 문서 수 확인,
 * URL 크롤, 직접 인덱싱, 외부 콘텐츠 목록/삭제, 시스템 설정 조회
 */

import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '@/lib/utils/logger';
import type { HealthData, ExternalContentData } from './types';
import { SkeletonCard } from './components/SkeletonCard';
import { HealthCard, SystemConfigCard } from './components/HealthStatus';
import { CrawlForm, IndexForm } from './components/IndexingForms';
import { ExternalContentTable } from './components/ExternalContentTable';
import { QueryDebugSection } from './components/QueryDebugSection';

const log = createLogger('AdminRAGPage');

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function AdminRAGPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [externalContent, setExternalContent] = useState<ExternalContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/rag/health');
      const json = await res.json();
      if (json.success && json.data) {
        setHealth(json.data);
      } else {
        setError(json.error || '상태 조회 실패');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류 발생');
      log.error('Health fetch failed');
    }
  }, []);

  const fetchExternalContent = useCallback(async (offset = 0) => {
    setContentLoading(true);
    try {
      const res = await fetch(`/api/admin/rag/external-content?limit=20&offset=${offset}`);
      const json = await res.json();
      if (json.success && json.data) {
        setExternalContent(json.data);
      }
    } catch {
      log.error('External content fetch failed');
    } finally {
      setContentLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await Promise.all([fetchHealth(), fetchExternalContent()]);
      setIsLoading(false);
    }
    init();
  }, [fetchHealth, fetchExternalContent]);

  async function handleDelete(ids: string[]) {
    try {
      const res = await fetch('/api/admin/rag/external-content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchHealth(), fetchExternalContent()]);
      }
    } catch {
      log.error('Delete failed');
    }
  }

  function handleOperationSuccess() {
    Promise.all([fetchHealth(), fetchExternalContent()]);
  }

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !health) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">RAG 관리</h1>
          <p className="mt-1 text-sm text-gray-500">RAG 시스템 모니터링 및 관리</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">RAG 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          RAG 시스템 모니터링 및 관리 — ChromaDB 상태, 크롤, 인덱싱, 외부 콘텐츠 관리
        </p>
      </div>

      {/* Top: Health + System Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <HealthCard health={health} onRefresh={fetchHealth} />
        <SystemConfigCard config={health?.config ?? null} />
      </div>

      {/* Middle: Crawl + Index Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CrawlForm onSuccess={handleOperationSuccess} />
        <IndexForm onSuccess={handleOperationSuccess} />
      </div>

      {/* Query Debug: Reasoning Trace Viewer */}
      <div className="mb-6">
        <QueryDebugSection />
      </div>

      {/* Bottom: External Content Table */}
      <ExternalContentTable
        data={externalContent}
        loading={contentLoading && !externalContent}
        onDelete={handleDelete}
        onPageChange={(offset) => fetchExternalContent(offset)}
      />
    </div>
  );
}
