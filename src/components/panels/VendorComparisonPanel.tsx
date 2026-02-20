'use client';

/**
 * Vendor Comparison Panel Component
 *
 * Side-by-side comparison of vendor products for the same InfraNodeType.
 *
 * Tabs:
 * - Compare: Side-by-side product comparison for a selected node type
 * - Coverage: Matrix showing which vendors cover which node types
 * - Stats: Aggregate vendor statistics
 */

import { useState, useMemo } from 'react';
import { Scale, BarChart3, Grid3X3, CheckCircle2 } from 'lucide-react';
import type { InfraNodeType, NodeCategory } from '@/types/infra';
import {
  getProductsByNodeType,
  allVendorCatalogs,
  getCatalogStats,
} from '@/lib/knowledge/vendorCatalog';
import { getAllNodes } from '@/lib/knowledge/vendorCatalog/queryHelpers';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog';
import { getCategoryForType, getLabelForType, infrastructureDB } from '@/lib/data/infrastructureDB';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import { PanelTabs } from './PanelTabs';

// ============================================================
// Types
// ============================================================

interface VendorComparisonPanelProps {
  /** Currently selected node type to compare products for */
  nodeType?: InfraNodeType;
  onClose: () => void;
}

type TabKey = 'compare' | 'coverage' | 'stats';

// ============================================================
// Constants
// ============================================================

/** Node type groups for the Compare tab dropdown and Coverage matrix */
const NODE_TYPE_GROUPS: { category: NodeCategory; label: string; labelKo: string; types: InfraNodeType[] }[] = [
  {
    category: 'security',
    label: 'Security',
    labelKo: '보안',
    types: ['firewall', 'waf', 'ids-ips', 'vpn-gateway', 'nac', 'dlp', 'sase-gateway', 'ztna-broker', 'casb', 'siem', 'soar'],
  },
  {
    category: 'network',
    label: 'Network',
    labelKo: '네트워크',
    types: ['router', 'switch-l2', 'switch-l3', 'load-balancer', 'sd-wan', 'dns', 'cdn'],
  },
  {
    category: 'compute',
    label: 'Compute',
    labelKo: '컴퓨팅',
    types: ['web-server', 'app-server', 'db-server', 'container', 'vm', 'kubernetes'],
  },
  {
    category: 'cloud',
    label: 'Cloud',
    labelKo: '클라우드',
    types: ['aws-vpc', 'azure-vnet', 'gcp-network', 'private-cloud'],
  },
  {
    category: 'storage',
    label: 'Storage',
    labelKo: '스토리지',
    types: ['san-nas', 'object-storage', 'backup', 'cache', 'storage'],
  },
  {
    category: 'auth',
    label: 'Auth',
    labelKo: '인증',
    types: ['ldap-ad', 'sso', 'mfa', 'iam'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  security: 'text-red-400',
  network: 'text-blue-400',
  compute: 'text-emerald-400',
  cloud: 'text-purple-400',
  storage: 'text-amber-400',
  auth: 'text-pink-400',
};

const CATEGORY_BG: Record<string, string> = {
  security: 'bg-red-500/10',
  network: 'bg-blue-500/10',
  compute: 'bg-emerald-500/10',
  cloud: 'bg-purple-500/10',
  storage: 'bg-amber-500/10',
  auth: 'bg-pink-500/10',
};

// ============================================================
// Helpers
// ============================================================

/** Get unique architecture roles from a list of products */
function getArchitectureRoles(products: ProductNode[]): string[] {
  const roles = new Set<string>();
  for (const p of products) {
    if (p.architectureRole) roles.add(p.architectureRole);
  }
  return Array.from(roles);
}

/** Get unique HA features from a list of products */
function getHaFeatures(products: ProductNode[]): string[] {
  const features = new Set<string>();
  for (const p of products) {
    if (p.haFeatures) {
      for (const f of p.haFeatures) features.add(f);
    }
  }
  return Array.from(features).slice(0, 5);
}

/** Get unique security capabilities from a list of products */
function getSecurityCapabilities(products: ProductNode[]): string[] {
  const caps = new Set<string>();
  for (const p of products) {
    if (p.securityCapabilities) {
      for (const c of p.securityCapabilities) caps.add(c);
    }
  }
  return Array.from(caps).slice(0, 5);
}

// ============================================================
// Sub-Components
// ============================================================

/** Compare Tab: Side-by-side product comparison */
function CompareTab({ selectedType }: { selectedType: InfraNodeType }) {
  const vendorData = useMemo(() => getProductsByNodeType(selectedType), [selectedType]);

  if (vendorData.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <Scale className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">이 노드 유형에 매칭되는 벤더 제품이 없습니다.</p>
        <p className="text-xs mt-1">No vendor products mapped to this node type.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span>{vendorData.length}개 벤더에서 제품을 제공합니다</span>
      </div>

      {/* Vendor columns */}
      <div className={`grid gap-3 ${vendorData.length === 1 ? 'grid-cols-1' : vendorData.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {vendorData.map(({ vendorId, vendorName, products }) => {
          const roles = getArchitectureRoles(products);
          const haFeats = getHaFeatures(products);
          const secCaps = getSecurityCapabilities(products);
          const topProducts = products.slice(0, 3);

          return (
            <div
              key={vendorId}
              className="bg-zinc-800/50 rounded-lg border border-white/5 p-3 space-y-3"
            >
              {/* Vendor header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                  {vendorName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{vendorName}</div>
                  <div className="text-[10px] text-zinc-500">{products.length}개 제품</div>
                </div>
              </div>

              {/* Top products */}
              <div>
                <div className="text-[10px] text-zinc-500 mb-1.5">주요 제품</div>
                <div className="space-y-1">
                  {topProducts.map((p) => (
                    <div key={p.nodeId} className="text-xs text-zinc-300 bg-zinc-700/30 rounded px-2 py-1">
                      {p.name}
                    </div>
                  ))}
                  {products.length > 3 && (
                    <div className="text-[10px] text-zinc-500 px-2">
                      +{products.length - 3}개 더...
                    </div>
                  )}
                </div>
              </div>

              {/* Architecture roles */}
              {roles.length > 0 && (
                <div>
                  <div className="text-[10px] text-zinc-500 mb-1">아키텍처 역할</div>
                  <div className="flex flex-wrap gap-1">
                    {roles.map((role) => (
                      <span key={role} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* HA features */}
              {haFeats.length > 0 && (
                <div>
                  <div className="text-[10px] text-zinc-500 mb-1">HA 기능</div>
                  <div className="flex flex-wrap gap-1">
                    {haFeats.map((feat) => (
                      <span key={feat} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Security capabilities */}
              {secCaps.length > 0 && (
                <div>
                  <div className="text-[10px] text-zinc-500 mb-1">보안 기능</div>
                  <div className="flex flex-wrap gap-1">
                    {secCaps.map((cap) => (
                      <span key={cap} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Coverage Tab: Matrix showing vendor coverage by node type */
function CoverageTab() {
  const vendors = allVendorCatalogs;

  const coverageData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    for (const vendor of vendors) {
      const allNodes = getAllNodes(vendor.products);
      const vendorCoverage: Record<string, number> = {};

      for (const group of NODE_TYPE_GROUPS) {
        for (const nodeType of group.types) {
          const count = allNodes.filter(
            (node) => node.infraNodeTypes?.includes(nodeType),
          ).length;
          vendorCoverage[nodeType] = count;
        }
      }
      data[vendor.vendorId] = vendorCoverage;
    }
    return data;
  }, [vendors]);

  if (vendors.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <Grid3X3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">등록된 벤더가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vendor header row */}
      <div className="flex items-center gap-2">
        <div className="w-32 shrink-0" />
        {vendors.map((v) => (
          <div key={v.vendorId} className="flex-1 text-center text-[10px] text-zinc-400 font-medium truncate min-w-[60px]">
            {v.vendorName}
          </div>
        ))}
      </div>

      {/* Category groups */}
      {NODE_TYPE_GROUPS.map((group) => {
        const hasAnyProducts = group.types.some((t) =>
          vendors.some((v) => (coverageData[v.vendorId]?.[t] ?? 0) > 0),
        );

        return (
          <div key={group.category}>
            {/* Category label */}
            <div className={`text-xs font-medium mb-1.5 ${CATEGORY_COLORS[group.category] ?? 'text-zinc-400'}`}>
              {group.label} / {group.labelKo}
            </div>

            {/* Node type rows */}
            <div className="space-y-0.5">
              {group.types.map((nodeType) => (
                <div key={nodeType} className="flex items-center gap-2">
                  <div className="w-32 shrink-0 text-[11px] text-zinc-400 truncate">
                    {getLabelForType(nodeType)}
                  </div>
                  {vendors.map((v) => {
                    const count = coverageData[v.vendorId]?.[nodeType] ?? 0;
                    return (
                      <div
                        key={v.vendorId}
                        className={`flex-1 text-center text-[10px] py-1 rounded min-w-[60px] ${
                          count > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800/30 text-zinc-600'
                        }`}
                      >
                        {count > 0 ? count : '-'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {!hasAnyProducts && (
              <div className="text-[10px] text-zinc-600 pl-2 mt-0.5">매핑된 제품 없음</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Stats Tab: Aggregate vendor statistics */
function StatsTab() {
  const stats = useMemo(() => getCatalogStats(), []);
  const vendors = allVendorCatalogs;

  // Category coverage per vendor
  const categoryCoverage = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    for (const vendor of vendors) {
      const vendorResult: Record<string, number> = {};
      const allNodes = getAllNodes(vendor.products);

      for (const group of NODE_TYPE_GROUPS) {
        let count = 0;
        for (const nodeType of group.types) {
          const hasProducts = allNodes.some(
            (node) => node.infraNodeTypes?.includes(nodeType),
          );
          if (hasProducts) count++;
        }
        vendorResult[group.category] = count;
      }
      result[vendor.vendorId] = vendorResult;
    }
    return result;
  }, [vendors]);

  // Average products per node type per vendor
  const avgPerNodeType = useMemo(() => {
    const result: Record<string, number> = {};
    const totalNodeTypes = NODE_TYPE_GROUPS.reduce((sum, g) => sum + g.types.length, 0);

    for (const vendor of vendors) {
      const allNodes = getAllNodes(vendor.products);
      const typesWithProducts = new Set<string>();
      for (const node of allNodes) {
        if (node.infraNodeTypes) {
          for (const t of node.infraNodeTypes) typesWithProducts.add(t);
        }
      }
      result[vendor.vendorId] = typesWithProducts.size > 0
        ? Number((allNodes.filter((n) => n.infraNodeTypes && n.infraNodeTypes.length > 0).length / typesWithProducts.size).toFixed(1))
        : 0;
    }
    return result;
  }, [vendors]);

  if (vendors.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">등록된 벤더가 없습니다.</p>
      </div>
    );
  }

  // Find max product count for bar chart scaling
  const maxProducts = Math.max(...Object.values(stats.byVendor), 1);

  return (
    <div className="space-y-5">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5 text-center">
          <div className="text-2xl font-bold text-white">{stats.vendors}</div>
          <div className="text-[10px] text-zinc-500">벤더 수</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
          <div className="text-[10px] text-zinc-500">전체 제품 수</div>
        </div>
      </div>

      {/* Products per vendor (bar chart) */}
      <div>
        <h3 className="text-xs font-medium text-zinc-300 mb-2">벤더별 전체 제품 수</h3>
        <div className="space-y-2">
          {vendors.map((v) => {
            const count = stats.byVendor[v.vendorId] ?? 0;
            const pct = (count / maxProducts) * 100;
            return (
              <div key={v.vendorId}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">{v.vendorName}</span>
                  <span className="text-cyan-400 font-medium">{count}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500/60 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category coverage per vendor */}
      <div>
        <h3 className="text-xs font-medium text-zinc-300 mb-2">벤더별 카테고리 커버리지</h3>
        <div className="space-y-3">
          {vendors.map((v) => (
            <div key={v.vendorId} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
              <div className="text-xs font-medium text-white mb-2">{v.vendorName}</div>
              <div className="grid grid-cols-3 gap-1.5">
                {NODE_TYPE_GROUPS.map((group) => {
                  const covered = categoryCoverage[v.vendorId]?.[group.category] ?? 0;
                  const total = group.types.length;
                  const hasCoverage = covered > 0;
                  return (
                    <div
                      key={group.category}
                      className={`text-center p-1.5 rounded text-[10px] ${
                        hasCoverage
                          ? `${CATEGORY_BG[group.category] ?? 'bg-zinc-700/30'} ${CATEGORY_COLORS[group.category] ?? 'text-zinc-400'}`
                          : 'bg-zinc-800/30 text-zinc-600'
                      }`}
                    >
                      <div className="font-medium">{group.labelKo}</div>
                      <div>{covered}/{total}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Average products per node type */}
      <div>
        <h3 className="text-xs font-medium text-zinc-300 mb-2">노드 유형 당 평균 제품 수</h3>
        <div className="space-y-1.5">
          {vendors.map((v) => (
            <div key={v.vendorId} className="flex items-center justify-between bg-zinc-800/50 rounded px-3 py-2 border border-white/5">
              <span className="text-xs text-zinc-300">{v.vendorName}</span>
              <span className="text-xs text-cyan-400 font-medium">{avgPerNodeType[v.vendorId] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function VendorComparisonPanel({ nodeType, onClose }: VendorComparisonPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('compare');
  const [selectedType, setSelectedType] = useState<InfraNodeType>(nodeType ?? 'firewall');

  const vendorCount = allVendorCatalogs.length;
  const stats = useMemo(() => getCatalogStats(), []);

  const tabs: { key: TabKey; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { key: 'compare', label: '비교', icon: Scale },
    { key: 'coverage', label: '커버리지', icon: Grid3X3 },
    { key: 'stats', label: '통계', icon: BarChart3 },
  ];

  return (
    <PanelContainer widthClass="w-[600px]">
      <PanelHeader
        icon={Scale}
        iconColor="text-cyan-400"
        title="벤더 비교"
        onClose={onClose}
      />

      <PanelTabs
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
        activeClassName="text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10"
        activeBadgeClassName="bg-cyan-500/20 text-cyan-300"
      />

      {/* Node type selector (Compare tab only) */}
      {activeTab === 'compare' && (
        <div className="p-4 border-b border-white/10">
          <label className="text-xs text-zinc-400 mb-2 block">비교할 노드 유형 선택</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as InfraNodeType)}
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
          >
            {NODE_TYPE_GROUPS.map((group) => (
              <optgroup key={group.category} label={`${group.label} / ${group.labelKo}`}>
                {group.types.map((t) => (
                  <option key={t} value={t}>
                    {getLabelForType(t)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'compare' && <CompareTab selectedType={selectedType} />}
        {activeTab === 'coverage' && <CoverageTab />}
        {activeTab === 'stats' && <StatsTab />}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400 flex items-center justify-between">
        <span>{vendorCount}개 벤더 / {stats.totalProducts}개 제품 등록됨</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
      </div>
    </PanelContainer>
  );
}
