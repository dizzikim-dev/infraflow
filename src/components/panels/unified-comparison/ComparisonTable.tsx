'use client';

/**
 * ComparisonTable — Vertical comparison table for side-by-side analysis.
 *
 * First column is the row label; subsequent columns are items.
 * Cells highlight the "best" value per row with a green background.
 */

import type { ComparisonItem } from '@/lib/comparison/types';

// ============================================================
// Types
// ============================================================

interface ComparisonTableProps {
  items: ComparisonItem[];
}

// ============================================================
// Row definitions
// ============================================================

interface RowDef {
  key: string;
  label: string;
  labelKo: string;
  getValue: (item: ComparisonItem) => string;
  /** Return the index of the "best" item, or -1 if no highlight */
  getBestIndex?: (items: ComparisonItem[]) => number;
}

/** Complexity ranking: lower is better */
const COMPLEXITY_RANK: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/** Maturity labels for display */
const MATURITY_LABELS: Record<string, string> = {
  emerging: 'Emerging',
  growing: 'Growing',
  established: 'Established',
  dominant: 'Dominant',
};

/** Complexity display styling */
const COMPLEXITY_STYLES: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
};

function formatCost(cost?: number): string {
  if (cost == null) return 'N/A';
  return `$${cost.toLocaleString('en-US')}/mo`;
}

function parseSlaPercent(sla?: string): number {
  if (!sla) return -1;
  const match = sla.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) : -1;
}

const ROWS: RowDef[] = [
  {
    key: 'source',
    label: 'Source',
    labelKo: '소스',
    getValue: (item) => item.source,
  },
  {
    key: 'price',
    label: 'Price',
    labelKo: '가격',
    getValue: (item) =>
      item.estimatedMonthlyCost != null
        ? formatCost(item.estimatedMonthlyCost)
        : item.pricingInfo ?? 'N/A',
    getBestIndex: (items) => {
      const costs = items.map((i) => i.estimatedMonthlyCost ?? Infinity);
      const min = Math.min(...costs);
      if (min === Infinity) return -1;
      return costs.indexOf(min);
    },
  },
  {
    key: 'sla',
    label: 'SLA',
    labelKo: 'SLA',
    getValue: (item) => item.sla ?? 'N/A',
    getBestIndex: (items) => {
      const slas = items.map((i) => parseSlaPercent(i.sla));
      const max = Math.max(...slas);
      if (max <= 0) return -1;
      return slas.indexOf(max);
    },
  },
  {
    key: 'architectureRole',
    label: 'Architecture Role',
    labelKo: '아키텍처 역할',
    getValue: (item) => item.architectureRole ?? 'N/A',
  },
  {
    key: 'throughput',
    label: 'Throughput / Capacity',
    labelKo: '처리량 / 용량',
    getValue: (item) => item.maxThroughput ?? item.maxCapacity ?? 'N/A',
  },
  {
    key: 'haFeatures',
    label: 'HA Features',
    labelKo: 'HA 기능',
    getValue: (item) =>
      item.haFeatures && item.haFeatures.length > 0
        ? item.haFeatures.join(', ')
        : 'N/A',
    getBestIndex: (items) => {
      const counts = items.map((i) => i.haFeatures?.length ?? 0);
      const max = Math.max(...counts);
      if (max === 0) return -1;
      return counts.indexOf(max);
    },
  },
  {
    key: 'securityCapabilities',
    label: 'Security Capabilities',
    labelKo: '보안 기능',
    getValue: (item) =>
      item.securityCapabilities && item.securityCapabilities.length > 0
        ? item.securityCapabilities.join(', ')
        : 'N/A',
    getBestIndex: (items) => {
      const counts = items.map((i) => i.securityCapabilities?.length ?? 0);
      const max = Math.max(...counts);
      if (max === 0) return -1;
      return counts.indexOf(max);
    },
  },
  {
    key: 'protocols',
    label: 'Protocols',
    labelKo: '프로토콜',
    getValue: (item) =>
      item.supportedProtocols && item.supportedProtocols.length > 0
        ? item.supportedProtocols.join(', ')
        : 'N/A',
  },
  {
    key: 'compliance',
    label: 'Compliance',
    labelKo: '컴플라이언스',
    getValue: (item) =>
      item.complianceCertifications && item.complianceCertifications.length > 0
        ? item.complianceCertifications.join(', ')
        : 'N/A',
  },
  {
    key: 'deployment',
    label: 'Deployment',
    labelKo: '배포 모델',
    getValue: (item) => {
      const parts: string[] = [];
      if (item.deploymentModel) parts.push(item.deploymentModel);
      if (item.formFactor) parts.push(item.formFactor);
      return parts.length > 0 ? parts.join(' / ') : 'N/A';
    },
  },
  {
    key: 'operationalComplexity',
    label: 'Operational Complexity',
    labelKo: '운영 복잡도',
    getValue: (item) => item.operationalComplexity ?? 'N/A',
    getBestIndex: (items) => {
      const ranks = items.map(
        (i) => COMPLEXITY_RANK[i.operationalComplexity ?? ''] ?? Infinity,
      );
      const min = Math.min(...ranks);
      if (min === Infinity) return -1;
      return ranks.indexOf(min);
    },
  },
  {
    key: 'ecosystemMaturity',
    label: 'Ecosystem Maturity',
    labelKo: '에코시스템 성숙도',
    getValue: (item) =>
      item.ecosystemMaturity
        ? (MATURITY_LABELS[item.ecosystemMaturity] ?? item.ecosystemMaturity)
        : 'N/A',
  },
];

// ============================================================
// Component
// ============================================================

export function ComparisonTable({ items }: ComparisonTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <p className="text-sm">비교할 항목을 추가해주세요.</p>
        <p className="text-xs mt-1">Add items to compare.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        {/* Sticky header with item names */}
        <thead>
          <tr className="sticky top-0 z-10 bg-zinc-900">
            <th className="text-left py-2 px-2 text-zinc-500 font-medium w-36 min-w-[144px]">
              항목 / Field
            </th>
            {items.map((item) => {
              const isVendor = item.source === 'vendor';
              return (
                <th
                  key={item.id}
                  className="text-left py-2 px-2 font-medium min-w-[120px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isVendor ? 'bg-cyan-400' : 'bg-purple-400'
                      }`}
                    />
                    <span className="text-white truncate max-w-[100px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 ml-3.5">
                    {item.vendorName ?? item.cloudProvider?.toUpperCase() ?? ''}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {ROWS.map((row, rowIdx) => {
            const bestIdx = row.getBestIndex ? row.getBestIndex(items) : -1;
            const isEven = rowIdx % 2 === 0;

            return (
              <tr
                key={row.key}
                className={isEven ? 'bg-zinc-800/20' : ''}
              >
                {/* Row label */}
                <td className="py-2 px-2 text-zinc-400 font-medium align-top">
                  <div>{row.label}</div>
                  <div className="text-[10px] text-zinc-600">{row.labelKo}</div>
                </td>

                {/* Item values */}
                {items.map((item, itemIdx) => {
                  const value = row.getValue(item);
                  const isBest = bestIdx === itemIdx;
                  const isNA = value === 'N/A';

                  // Special styling for source row
                  if (row.key === 'source') {
                    const isVendor = item.source === 'vendor';
                    return (
                      <td key={item.id} className="py-2 px-2 align-top">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            isVendor
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'bg-purple-500/10 text-purple-400'
                          }`}
                        >
                          {isVendor ? 'Vendor' : 'Cloud'}
                        </span>
                      </td>
                    );
                  }

                  // Special styling for operational complexity
                  if (row.key === 'operationalComplexity' && !isNA) {
                    const complexityColor =
                      COMPLEXITY_STYLES[item.operationalComplexity ?? ''] ??
                      'text-zinc-300';
                    return (
                      <td
                        key={item.id}
                        className={`py-2 px-2 align-top ${
                          isBest ? 'bg-green-500/10' : ''
                        }`}
                      >
                        <span className={complexityColor}>{value}</span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={item.id}
                      className={`py-2 px-2 align-top ${
                        isBest ? 'bg-green-500/10' : ''
                      }`}
                    >
                      <span
                        className={isNA ? 'text-zinc-600' : 'text-zinc-300'}
                      >
                        {value}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
