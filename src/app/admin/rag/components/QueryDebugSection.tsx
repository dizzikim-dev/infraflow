'use client';

/**
 * QueryDebugSection — 쿼리 디버그: 트레이스 목록 + 5-step TraceViewer
 */

import { useState, useCallback } from 'react';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('QueryDebugSection');

// ---------------------------------------------------------------------------
// Trace Types (for admin UI)
// ---------------------------------------------------------------------------

interface TraceListItem {
  id: string;
  traceId: string;
  query: string;
  durationMs: number;
  maxScore: number;
  provider: string;
  success: boolean;
  nodeTypes: string[];
  createdAt: string;
}

interface TraceDetail {
  id: string;
  query: string;
  timestamp: number;
  durationMs: number;
  extractedNodeTypes: string[];
  ragSearch: {
    method: string;
    queryTimeMs: number;
    totalResults: number;
    documents: { id: string; collection: string; score: number; title: string; category: string }[];
    maxScore: number;
    threshold: number;
  };
  liveAugment: {
    triggered: boolean;
    reason: string;
    result?: { success: boolean; documentsIndexed: number; durationMs: number; sourceUrl?: string };
  };
  enrichment: {
    relationshipsMatched: { id: string; source: string; target: string; type: string; confidence: number; reasonKo: string }[];
    relationshipsExcluded: number;
    suggestionsCount: number;
    violationsCount: number;
    risksCount: number;
    piDocumentsInjected: number;
    cacheHit: boolean;
    promptSectionLength: number;
  };
  llm: {
    provider: string;
    model?: string;
    attempts: number;
    success: boolean;
  };
  graphGuidance?: {
    enabled: boolean;
    seedTypes: string[];
    expandedTypes: string[];
    expansionMs: number;
  };
  postVerification?: {
    satisfied: { relationshipId: string; source: string; target: string; type: string; reasonKo: string; status: string }[];
    missingRequired: { relationshipId: string; source: string; target: string; type: string; reasonKo: string; status: string }[];
    missingRecommended: { relationshipId: string; source: string; target: string; type: string; reasonKo: string; status: string }[];
    conflicts: { relationshipId: string; source: string; target: string; type: string; reasonKo: string; status: string }[];
    unusedKnowledge: { id: string; title: string; score: number }[];
    verificationScore: number;
  };
}

// ---------------------------------------------------------------------------
// Score Bar (reusable)
// ---------------------------------------------------------------------------

function TraceScoreBar({ score, label }: { score: number; label?: string }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-500 w-12">{label}</span>}
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-600 w-10 text-right">{score.toFixed(2)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trace Viewer — 5-step display
// ---------------------------------------------------------------------------

function TraceViewer({ trace }: { trace: TraceDetail }) {
  const steps = [
    { num: 1, title: '키워드 추출', titleEn: 'Extraction' },
    { num: 2, title: 'RAG 검색', titleEn: 'RAG Search' },
    { num: 3, title: 'Live Augment', titleEn: 'Live Augment' },
    { num: 4, title: '지식 Enrichment', titleEn: 'Enrichment' },
    { num: 5, title: 'LLM 호출', titleEn: 'LLM Call' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-mono text-xs text-gray-400">{trace.id}</span>
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
          trace.llm.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trace.llm.success ? 'Success' : 'Failed'}
        </span>
        <span className="text-gray-500">{trace.durationMs}ms</span>
        <span className="text-gray-400 text-xs">{trace.llm.provider}</span>
      </div>

      {/* Step 1: Extraction */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</span>
          <h4 className="text-sm font-medium text-gray-900">{steps[0].title}</h4>
        </div>
        {trace.extractedNodeTypes.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {trace.extractedNodeTypes.map((t) => (
              <span key={t} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-mono">{t}</span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">추출된 노드 타입 없음</p>
        )}
      </div>

      {/* Step 2: RAG Search */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">2</span>
          <h4 className="text-sm font-medium text-gray-900">{steps[1].title}</h4>
          <span className="text-xs text-gray-400 ml-auto">
            {trace.ragSearch.method} · {trace.ragSearch.queryTimeMs}ms · {trace.ragSearch.totalResults}건
          </span>
        </div>
        {trace.ragSearch.documents.length > 0 ? (
          <div className="space-y-1.5">
            {trace.ragSearch.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2">
                <TraceScoreBar score={doc.score} />
                <span className="text-xs text-gray-700 truncate max-w-[200px]">{doc.title}</span>
                <span className="text-[10px] text-gray-400 font-mono">{doc.collection}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">검색 결과 없음</p>
        )}
      </div>

      {/* Step 3: Live Augment */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">3</span>
          <h4 className="text-sm font-medium text-gray-900">{steps[2].title}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
            trace.liveAugment.triggered ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {trace.liveAugment.triggered ? 'Triggered' : 'Not triggered'}
          </span>
        </div>
        <p className="text-xs text-gray-500">{trace.liveAugment.reason}</p>
        {trace.liveAugment.result && (
          <div className="mt-1 text-xs text-gray-600">
            {trace.liveAugment.result.success ? '✅' : '❌'} {trace.liveAugment.result.documentsIndexed}건 인덱싱 ({trace.liveAugment.result.durationMs}ms)
            {trace.liveAugment.result.sourceUrl && (
              <span className="ml-1 text-gray-400 font-mono">{trace.liveAugment.result.sourceUrl}</span>
            )}
          </div>
        )}
      </div>

      {/* Step 4: Enrichment */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">4</span>
          <h4 className="text-sm font-medium text-gray-900">{steps[3].title}</h4>
          {trace.enrichment.cacheHit && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">Cache Hit</span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-2 bg-white rounded border border-gray-100">
            <p className="text-lg font-bold text-gray-900">{trace.enrichment.relationshipsMatched.length}</p>
            <p className="text-[10px] text-gray-500">관계 매칭</p>
          </div>
          <div className="p-2 bg-white rounded border border-gray-100">
            <p className="text-lg font-bold text-gray-900">{trace.enrichment.suggestionsCount}</p>
            <p className="text-[10px] text-gray-500">제안</p>
          </div>
          <div className="p-2 bg-white rounded border border-gray-100">
            <p className="text-lg font-bold text-gray-900">{trace.enrichment.violationsCount}</p>
            <p className="text-[10px] text-gray-500">위반</p>
          </div>
          <div className="p-2 bg-white rounded border border-gray-100">
            <p className="text-lg font-bold text-gray-900">{trace.enrichment.piDocumentsInjected}</p>
            <p className="text-[10px] text-gray-500">PI 문서</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          제외: {trace.enrichment.relationshipsExcluded} · 리스크: {trace.enrichment.risksCount} · 프롬프트: {trace.enrichment.promptSectionLength}자
        </p>
      </div>

      {/* Step 5: LLM */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold">5</span>
          <h4 className="text-sm font-medium text-gray-900">{steps[4].title}</h4>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">Provider: <span className="font-medium">{trace.llm.provider}</span></span>
          {trace.llm.model && <span className="text-gray-400 text-xs font-mono">{trace.llm.model}</span>}
          <span className="text-gray-600">시도: {trace.llm.attempts}회</span>
          <span className={trace.llm.success ? 'text-green-600' : 'text-red-600'}>
            {trace.llm.success ? '성공' : '실패'}
          </span>
        </div>
      </div>

      {/* Post-verification (Phase 2) */}
      {trace.postVerification && (
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-amber-400">
          <h4 className="text-sm font-medium text-gray-900 mb-2">사후 검증 (Score: {trace.postVerification.verificationScore})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-2 bg-green-50 rounded">
              <p className="text-lg font-bold text-green-600">{trace.postVerification.satisfied.length}</p>
              <p className="text-[10px] text-gray-500">충족</p>
            </div>
            <div className="p-2 bg-red-50 rounded">
              <p className="text-lg font-bold text-red-600">{trace.postVerification.missingRequired.length}</p>
              <p className="text-[10px] text-gray-500">필수 누락</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded">
              <p className="text-lg font-bold text-yellow-600">{trace.postVerification.missingRecommended.length}</p>
              <p className="text-[10px] text-gray-500">권장 누락</p>
            </div>
            <div className="p-2 bg-orange-50 rounded">
              <p className="text-lg font-bold text-orange-600">{trace.postVerification.conflicts.length}</p>
              <p className="text-[10px] text-gray-500">충돌</p>
            </div>
          </div>
        </div>
      )}

      {/* Graph Guidance (Phase 3) */}
      {trace.graphGuidance?.enabled && (
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-400">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Graph Guidance ({trace.graphGuidance.expansionMs}ms)</h4>
          <div className="text-xs text-gray-600">
            <span className="text-gray-500">Seed:</span> {trace.graphGuidance.seedTypes.join(', ')} →{' '}
            <span className="text-gray-500">Expanded:</span> {trace.graphGuidance.expandedTypes.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Query Debug Section
// ---------------------------------------------------------------------------

export function QueryDebugSection() {
  const [traces, setTraces] = useState<TraceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedTrace, setSelectedTrace] = useState<TraceDetail | null>(null);
  const [tracesLoading, setTracesLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const fetchTraces = useCallback(async (newOffset = 0) => {
    setTracesLoading(true);
    try {
      const res = await fetch(`/api/admin/rag/traces?limit=${limit}&offset=${newOffset}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTraces(json.data.traces);
        setTotal(json.data.total);
        setOffset(newOffset);
      }
    } catch {
      log.error('Trace list fetch failed');
    } finally {
      setTracesLoading(false);
    }
  }, []);

  async function loadTraceDetail(traceId: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/rag/traces/${traceId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedTrace(json.data);
      }
    } catch {
      log.error('Trace detail fetch failed');
    } finally {
      setDetailLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">쿼리 디버그</h2>
        <button
          onClick={() => fetchTraces(0)}
          className="text-sm text-blue-600 hover:text-blue-800 transition"
        >
          {traces.length > 0 ? '새로고침' : '트레이스 불러오기'}
        </button>
      </div>

      {tracesLoading && traces.length === 0 && (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
        </div>
      )}

      {!tracesLoading && traces.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          저장된 트레이스가 없습니다. &ldquo;트레이스 불러오기&rdquo;를 클릭하세요.
        </p>
      )}

      {traces.length > 0 && (
        <div className="space-y-4">
          {/* Trace list */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-500">쿼리</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">상태</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">점수</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">시간</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">일시</th>
                </tr>
              </thead>
              <tbody>
                {traces.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => loadTraceDetail(t.traceId)}
                    className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition ${
                      selectedTrace?.id === t.traceId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-2 px-2">
                      <div className="font-medium text-gray-900 truncate max-w-[300px]">{t.query}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{t.traceId}</div>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        t.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.success ? '성공' : '실패'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="w-20">
                        <TraceScoreBar score={t.maxScore} />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-gray-600 text-xs">{t.durationMs}ms</td>
                    <td className="py-2 px-2 text-gray-600 text-xs">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {offset + 1}~{Math.min(offset + limit, total)} / {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTraces(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  이전
                </button>
                <button
                  onClick={() => fetchTraces(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Selected trace detail */}
          {detailLoading && (
            <div className="animate-pulse space-y-3 mt-4 pt-4 border-t border-gray-200">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
            </div>
          )}

          {selectedTrace && !detailLoading && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                트레이스 상세 — <span className="text-gray-400 font-mono">{selectedTrace.id}</span>
              </h3>
              <TraceViewer trace={selectedTrace} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
