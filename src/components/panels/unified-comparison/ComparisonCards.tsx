'use client';

/**
 * ComparisonCards — Card-grid view of comparison items.
 *
 * Responsive grid: 2 columns for 2 items, otherwise 1 column stacked.
 * Each card shows key product/service attributes at a glance.
 */

import type { ComparisonItem } from '@/lib/comparison/types';

// ============================================================
// Types
// ============================================================

interface ComparisonCardsProps {
  items: ComparisonItem[];
}

// ============================================================
// Helpers
// ============================================================

/** Format a monthly cost as a readable USD string */
function formatCost(cost?: number): string {
  if (cost == null) return '';
  return `$${cost.toLocaleString('en-US')}/mo`;
}

/** Get the price display string — prefer estimatedMonthlyCost, fallback to pricingInfo */
function getPriceDisplay(item: ComparisonItem): string {
  if (item.estimatedMonthlyCost != null) return formatCost(item.estimatedMonthlyCost);
  if (item.pricingInfo) return item.pricingInfo;
  return 'N/A';
}

/** Get the first N entries from a Record */
function firstEntries(
  record: Record<string, string> | undefined,
  n: number,
): [string, string][] {
  if (!record) return [];
  return Object.entries(record).slice(0, n);
}

// ============================================================
// Sub-components
// ============================================================

function ComparisonCard({ item }: { item: ComparisonItem }) {
  const isVendor = item.source === 'vendor';
  const specs = firstEntries(item.specs, 3);

  return (
    <div className="bg-zinc-800/50 rounded-lg border border-white/5 p-3 space-y-3">
      {/* Header: source badge + name + vendor/provider */}
      <div className="flex items-start gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
            isVendor ? 'bg-cyan-400' : 'bg-purple-400'
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate">
            {item.name}
          </div>
          <div className="text-[10px] text-zinc-500">
            {item.vendorName ?? item.cloudProvider?.toUpperCase() ?? item.category}
          </div>
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="text-[10px] text-zinc-500 mb-0.5">가격 / Price</div>
        <div className="text-xs text-teal-400 font-medium">
          {getPriceDisplay(item)}
        </div>
      </div>

      {/* Architecture Role */}
      {item.architectureRole && (
        <div>
          <div className="text-[10px] text-zinc-500 mb-0.5">
            아키텍처 역할
          </div>
          <div className="text-xs text-zinc-300">{item.architectureRole}</div>
        </div>
      )}

      {/* Key Specs (first 3) */}
      {specs.length > 0 && (
        <div>
          <div className="text-[10px] text-zinc-500 mb-1">주요 스펙</div>
          <div className="space-y-0.5">
            {specs.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">{key}</span>
                <span className="text-zinc-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Capabilities */}
      {item.securityCapabilities && item.securityCapabilities.length > 0 && (
        <div>
          <div className="text-[10px] text-zinc-500 mb-1">보안 기능</div>
          <div className="flex flex-wrap gap-1">
            {item.securityCapabilities.map((cap) => (
              <span
                key={cap}
                className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* HA Features */}
      {item.haFeatures && item.haFeatures.length > 0 && (
        <div>
          <div className="text-[10px] text-zinc-500 mb-1">HA 기능</div>
          <div className="flex flex-wrap gap-1">
            {item.haFeatures.map((feat) => (
              <span
                key={feat}
                className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Deployment / Form Factor */}
      {(item.deploymentModel || item.formFactor) && (
        <div className="flex gap-3">
          {item.deploymentModel && (
            <div>
              <div className="text-[10px] text-zinc-500 mb-0.5">배포 모델</div>
              <div className="text-[11px] text-zinc-300">
                {item.deploymentModel}
              </div>
            </div>
          )}
          {item.formFactor && (
            <div>
              <div className="text-[10px] text-zinc-500 mb-0.5">폼 팩터</div>
              <div className="text-[11px] text-zinc-300">
                {item.formFactor}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Licensing / Pricing Model */}
      {(item.licensingModel || item.pricingModel) && (
        <div className="flex gap-3">
          {item.licensingModel && (
            <div>
              <div className="text-[10px] text-zinc-500 mb-0.5">
                라이선스
              </div>
              <div className="text-[11px] text-zinc-300">
                {item.licensingModel}
              </div>
            </div>
          )}
          {item.pricingModel && (
            <div>
              <div className="text-[10px] text-zinc-500 mb-0.5">
                과금 모델
              </div>
              <div className="text-[11px] text-zinc-300">
                {item.pricingModel}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function ComparisonCards({ items }: ComparisonCardsProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        <p className="text-sm">비교할 항목을 추가해주세요.</p>
        <p className="text-xs mt-1">Add items to compare.</p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 ${
        items.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
      }`}
    >
      {items.map((item) => (
        <ComparisonCard key={item.id} item={item} />
      ))}
    </div>
  );
}
