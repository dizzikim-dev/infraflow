/**
 * GraphNodeDetail — Detail panel for the Knowledge Graph admin page.
 *
 * Shows detailed information about a selected node: metadata, stats,
 * patterns, failures, performance profile, vendor products, and antipatterns.
 */

import Link from 'next/link';
import {
  type NodeDetailData,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  TIER_LABELS,
} from './types';
import { ImpactBadge, LikelihoodBadge, SeverityBadge } from './GraphStatsPanel';

// ---------------------------------------------------------------------------
// Detail Panel Component
// ---------------------------------------------------------------------------

interface DetailPanelProps {
  detail: NodeDetailData | null;
  isLoading: boolean;
  onClose: () => void;
}

export function GraphNodeDetailPanel({ detail, isLoading, onClose }: DetailPanelProps) {
  if (!detail && !isLoading) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">노드 상세</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 transition text-gray-400"
          title="닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isLoading && (
        <div className="p-4 space-y-3 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      )}

      {detail && !isLoading && (
        <div className="flex-1 overflow-y-auto">
          {/* Node header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-base font-bold text-gray-900">{detail.node.labelKo}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{detail.node.label}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[detail.node.category]?.badge || 'bg-gray-100 text-gray-700'}`}>
                {CATEGORY_LABELS[detail.node.category] || detail.node.category}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                {TIER_LABELS[detail.node.tier] || detail.node.tier}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              통계
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-900">{detail.node.patternCount}</p>
                <p className="text-[10px] text-gray-500">패턴</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-900">{detail.node.antipatternCount}</p>
                <p className="text-[10px] text-gray-500">안티패턴</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-900">{detail.node.failureCount}</p>
                <p className="text-[10px] text-gray-500">장애</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-900">
                  {detail.node.hasPerformanceProfile ? 'O' : '-'}
                </p>
                <p className="text-[10px] text-gray-500">성능 프로파일</p>
              </div>
            </div>
          </div>

          {/* Patterns */}
          {detail.patterns.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                관련 패턴
              </h5>
              <div className="space-y-1.5">
                {detail.patterns.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{p.nameKo}</span>
                    <span className="text-[10px] text-amber-600">
                      {'*'.repeat(p.complexity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failures */}
          {detail.failures.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                장애 시나리오
              </h5>
              <div className="space-y-1.5">
                {detail.failures.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-700 truncate flex-1">{f.titleKo}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <ImpactBadge impact={f.impact} />
                      <LikelihoodBadge likelihood={f.likelihood} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Profile */}
          {detail.performanceProfile && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                성능 프로파일
              </h5>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">지연</span>
                  <span>{detail.performanceProfile.latencyRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">처리량</span>
                  <span className="text-right max-w-[160px] truncate">{detail.performanceProfile.throughputRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">스케일링</span>
                  <span>{detail.performanceProfile.scalingStrategy}</span>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Products */}
          {detail.vendorProducts.length > 0 && (
            <div className="px-4 py-3">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                벤더 제품
              </h5>
              <div className="space-y-3">
                {detail.vendorProducts.map((vp) => (
                  <div key={vp.vendorId}>
                    <Link
                      href={`/admin/knowledge/vendor-catalog/${vp.vendorId}`}
                      className="text-xs font-medium text-cyan-600 hover:text-cyan-800 hover:underline transition"
                    >
                      {vp.vendorName}
                    </Link>
                    <ul className="mt-1 space-y-0.5">
                      {vp.products.map((prod) => (
                        <li key={prod.nodeId} className="text-[11px] text-gray-600 pl-2 border-l border-gray-200">
                          {prod.nameKo}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Antipatterns */}
          {detail.antipatterns.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                안티패턴
              </h5>
              <div className="space-y-1.5">
                {detail.antipatterns.map((ap) => (
                  <div key={ap.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-700 truncate flex-1">{ap.nameKo}</span>
                    <SeverityBadge severity={ap.severity} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
