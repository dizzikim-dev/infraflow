'use client';

/**
 * 벤더 카탈로그 상세 페이지
 *
 * 벤더의 제품 트리를 계층적으로 표시하며,
 * 검색, 접기/펼치기, 카테고리 요약을 제공합니다.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createLogger } from '@/lib/utils/logger';
import type { InfraNodeType } from '@/types/infra';

const log = createLogger('VendorCatalogDetailPage');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductNode {
  nodeId: string;
  depth: number;
  depthLabel: string;
  depthLabelKo: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  sourceUrl: string;
  infraNodeTypes?: InfraNodeType[];
  specs?: Record<string, string>;
  datasheetUrl?: string;
  pricingInfo?: string;
  lifecycle?: 'active' | 'end-of-sale' | 'end-of-life';
  children: ProductNode[];
}

interface CatalogStats {
  totalProducts: number;
  maxDepth: number;
  categoriesCount: number;
}

interface VendorCatalog {
  vendorId: string;
  vendorName: string;
  vendorNameKo: string;
  headquarters: string;
  website: string;
  productPageUrl: string;
  depthStructure: string[];
  depthStructureKo: string[];
  products: ProductNode[];
  stats: CatalogStats;
  lastCrawled: string;
  crawlSource: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten all nodes in the tree */
function flattenNodes(nodes: ProductNode[]): ProductNode[] {
  const result: ProductNode[] = [];
  for (const node of nodes) {
    result.push(node);
    result.push(...flattenNodes(node.children));
  }
  return result;
}

/** Check if a node or any of its descendants match the search query */
function nodeMatchesSearch(node: ProductNode, query: string): boolean {
  const lower = query.toLowerCase();
  if (
    node.name.toLowerCase().includes(lower) ||
    node.nameKo.toLowerCase().includes(lower) ||
    node.nodeId.toLowerCase().includes(lower) ||
    node.description.toLowerCase().includes(lower) ||
    node.descriptionKo.toLowerCase().includes(lower)
  ) {
    return true;
  }
  return node.children.some((child) => nodeMatchesSearch(child, query));
}

/** Check if this specific node directly matches (not via children) */
function nodeDirectlyMatches(node: ProductNode, query: string): boolean {
  const lower = query.toLowerCase();
  return (
    node.name.toLowerCase().includes(lower) ||
    node.nameKo.toLowerCase().includes(lower) ||
    node.nodeId.toLowerCase().includes(lower) ||
    node.description.toLowerCase().includes(lower) ||
    node.descriptionKo.toLowerCase().includes(lower)
  );
}

/** Count direct + nested products under a category */
function countDescendants(node: ProductNode): number {
  let count = 0;
  for (const child of node.children) {
    count += 1;
    count += countDescendants(child);
  }
  return count;
}

// ---------------------------------------------------------------------------
// Lifecycle Badge
// ---------------------------------------------------------------------------

const lifecycleBadge: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  'end-of-sale': { label: 'End of Sale', className: 'bg-yellow-100 text-yellow-700' },
  'end-of-life': { label: 'End of Life', className: 'bg-red-100 text-red-700' },
};

// ---------------------------------------------------------------------------
// ProductTreeNode Component
// ---------------------------------------------------------------------------

interface TreeNodeProps {
  node: ProductNode;
  expandedIds: Set<string>;
  onToggle: (nodeId: string) => void;
  searchQuery: string;
  depthStructureKo: string[];
}

function ProductTreeNode({ node, expandedIds, onToggle, searchQuery, depthStructureKo }: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.nodeId);
  const isLeaf = !hasChildren;
  const isHighlighted = searchQuery && nodeDirectlyMatches(node, searchQuery);

  // If searching and this node doesn't match (nor its descendants), hide it
  if (searchQuery && !nodeMatchesSearch(node, searchQuery)) {
    return null;
  }

  const depthLabel = depthStructureKo[node.depth] || node.depthLabelKo;

  return (
    <div style={{ paddingLeft: `${node.depth * 24}px` }}>
      {/* Node row */}
      <div
        className={`flex items-start gap-2 py-2 px-3 rounded-lg transition group ${
          isHighlighted ? 'bg-cyan-50 ring-1 ring-cyan-200' : 'hover:bg-gray-50'
        }`}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.nodeId)}
            className="mt-0.5 p-0.5 rounded hover:bg-gray-200 transition flex-shrink-0"
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="mt-0.5 w-5 flex-shrink-0 flex justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5" />
          </span>
        )}

        {/* Node content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Name */}
            <span className="font-medium text-gray-900 text-sm">
              {node.nameKo}
            </span>
            <span className="text-xs text-gray-400">
              {node.name}
            </span>

            {/* Depth label badge */}
            <span className="inline-flex px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-500">
              {depthLabel}
            </span>

            {/* Children count */}
            {hasChildren && (
              <span className="text-xs text-gray-400">
                ({node.children.length})
              </span>
            )}

            {/* Lifecycle badge */}
            {node.lifecycle && (
              <span className={`inline-flex px-1.5 py-0.5 text-xs rounded-full font-medium ${lifecycleBadge[node.lifecycle]?.className || 'bg-gray-100 text-gray-600'}`}>
                {lifecycleBadge[node.lifecycle]?.label || node.lifecycle}
              </span>
            )}
          </div>

          {/* Leaf-only details */}
          {isLeaf && (
            <div className="mt-1 space-y-1">
              {/* InfraNodeTypes badges */}
              {node.infraNodeTypes && node.infraNodeTypes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {node.infraNodeTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex px-1.5 py-0.5 text-xs rounded bg-cyan-100 text-cyan-700 font-mono"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}

              {/* Specs */}
              {node.specs && Object.keys(node.specs).length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                  {Object.entries(node.specs).map(([key, value]) => (
                    <span key={key}>
                      <span className="font-medium text-gray-600">{key}:</span> {value}
                    </span>
                  ))}
                </div>
              )}

              {/* Source URL */}
              {node.sourceUrl && (
                <a
                  href={node.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-800 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  제품 페이지
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Children (if expanded) */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <ProductTreeNode
              key={child.nodeId}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              searchQuery={searchQuery}
              depthStructureKo={depthStructureKo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function VendorCatalogDetailPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [vendor, setVendor] = useState<VendorCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Fetch vendor data
  useEffect(() => {
    async function fetchVendor() {
      try {
        const response = await fetch(`/api/knowledge/vendor-catalog/${vendorId}`);
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? '벤더를 찾을 수 없습니다'
              : '데이터를 가져오는데 실패했습니다',
          );
        }
        const json = await response.json();
        if (!json.success) {
          throw new Error(json.error || '데이터를 가져오는데 실패했습니다');
        }
        setVendor(json.data);
        // Auto-expand top-level categories
        const topLevelIds = new Set(
          (json.data as VendorCatalog).products.map((p: ProductNode) => p.nodeId),
        );
        setExpandedIds(topLevelIds);
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다';
        setError(message);
        log.error('벤더 카탈로그 상세 조회 실패');
      } finally {
        setIsLoading(false);
      }
    }
    fetchVendor();
  }, [vendorId]);

  // Toggle expand/collapse
  const handleToggle = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Expand all / Collapse all
  const handleExpandAll = useCallback(() => {
    if (!vendor) return;
    const allIds = flattenNodes(vendor.products)
      .filter((n) => n.children.length > 0)
      .map((n) => n.nodeId);
    setExpandedIds(new Set(allIds));
  }, [vendor]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // When searching, auto-expand matching paths
  useEffect(() => {
    if (!vendor || !searchQuery) return;

    const matchingIds = new Set<string>();

    function collectExpandedIds(nodes: ProductNode[]) {
      for (const node of nodes) {
        if (node.children.length > 0 && nodeMatchesSearch(node, searchQuery)) {
          matchingIds.add(node.nodeId);
          collectExpandedIds(node.children);
        }
      }
    }

    collectExpandedIds(vendor.products);
    setExpandedIds(matchingIds);
  }, [vendor, searchQuery]);

  // Category summary for top-level nodes
  const categorySummary = useMemo(() => {
    if (!vendor) return [];
    return vendor.products.map((cat) => ({
      name: cat.name,
      nameKo: cat.nameKo,
      totalDescendants: countDescendants(cat),
      directChildren: cat.children.length,
    }));
  }, [vendor]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="animate-spin h-8 w-8 mx-auto text-cyan-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // Error state
  if (error || !vendor) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/admin/knowledge/vendor-catalog"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            벤더 카탈로그 목록
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-sm text-red-700">{error || '데이터를 찾을 수 없습니다'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 뒤로 가기 + 헤더 */}
      <div className="mb-6">
        <Link
          href="/admin/knowledge/vendor-catalog"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          벤더 카탈로그 목록
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.vendorNameKo}</h1>
            <p className="text-sm text-gray-500">{vendor.vendorName}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              웹사이트
            </a>
          </div>
        </div>
      </div>

      {/* 벤더 정보 카드 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs font-medium text-gray-500">본사</dt>
            <dd className="mt-1 text-sm text-gray-900">{vendor.headquarters}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">최근 크롤링</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(vendor.lastCrawled).toLocaleDateString('ko-KR')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">총 제품 수</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{vendor.stats.totalProducts}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">카테고리 수</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{vendor.stats.categoriesCount}</dd>
          </div>
        </div>
      </div>

      {/* 깊이 구조 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">깊이 구조 (Depth Structure)</h2>
        <div className="flex items-center gap-1 text-sm">
          {vendor.depthStructureKo.map((label, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <span className="inline-flex px-2 py-1 rounded bg-cyan-50 text-cyan-700 font-medium">
                {label}
              </span>
              <span className="text-gray-400 text-xs">
                ({vendor.depthStructure[idx]})
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 제품 트리 (main) */}
        <div className="lg:col-span-3">
          {/* 검색 + 접기/펼치기 */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="제품명, 카테고리, 설명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={handleExpandAll}
                className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition whitespace-nowrap"
              >
                모두 펼치기
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition whitespace-nowrap"
              >
                모두 접기
              </button>
            </div>
          </div>

          {/* 제품 트리 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              제품 트리
              {searchQuery && (
                <span className="ml-2 text-cyan-600">
                  &quot;{searchQuery}&quot; 검색 결과
                </span>
              )}
            </h2>
            <div className="space-y-0.5">
              {vendor.products.map((product) => (
                <ProductTreeNode
                  key={product.nodeId}
                  node={product}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  searchQuery={searchQuery}
                  depthStructureKo={vendor.depthStructureKo}
                />
              ))}
            </div>
            {searchQuery && vendor.products.every((p) => !nodeMatchesSearch(p, searchQuery)) && (
              <div className="text-center py-8 text-gray-400 text-sm">
                &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 사이드바: 카테고리 요약 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">카테고리 요약</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-xs font-medium text-gray-500">카테고리</th>
                    <th className="text-right py-2 text-xs font-medium text-gray-500">제품</th>
                  </tr>
                </thead>
                <tbody>
                  {categorySummary.map((cat) => (
                    <tr key={cat.name} className="border-b border-gray-50 last:border-0">
                      <td className="py-2">
                        <div className="font-medium text-gray-900 text-xs">{cat.nameKo}</div>
                        <div className="text-xs text-gray-400">{cat.name}</div>
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-700">
                          {cat.totalDescendants}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td className="py-2 text-xs font-medium text-gray-700">합계</td>
                    <td className="py-2 text-right">
                      <span className="inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-800">
                        {categorySummary.reduce((sum, cat) => sum + cat.totalDescendants, 0)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 크롤링 정보 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">크롤링 정보</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-500">최근 크롤링</dt>
                <dd className="mt-0.5 text-sm text-gray-900">
                  {new Date(vendor.lastCrawled).toLocaleDateString('ko-KR')}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">크롤링 소스</dt>
                <dd className="mt-0.5">
                  <a
                    href={vendor.crawlSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-600 hover:text-cyan-800 transition break-all"
                  >
                    {vendor.crawlSource}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">제품 페이지</dt>
                <dd className="mt-0.5">
                  <a
                    href={vendor.productPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-600 hover:text-cyan-800 transition break-all"
                  >
                    {vendor.productPageUrl}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">최대 트리 깊이</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{vendor.stats.maxDepth}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
