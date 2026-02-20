'use client';

/**
 * CostComparisonPanel — Vendor cost comparison side panel.
 *
 * Displays a multi-vendor cost comparison for the current InfraSpec.
 * Three tabs: Compare (bar chart), Breakdown (per-vendor details),
 * Summary (key metrics). Amber/yellow theme.
 */

import { useState, useMemo } from 'react';
import { DollarSign, ChevronDown, ChevronRight } from 'lucide-react';
import type { InfraSpec } from '@/types';
import type { VendorCostEstimate } from '@/lib/consulting/types';
import { compareVendorCosts } from '@/lib/consulting/costComparator';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import { PanelTabs } from './PanelTabs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CostComparisonPanelProps {
  show: boolean;
  onClose: () => void;
  spec: InfraSpec;
}

type TabKey = 'compare' | 'breakdown' | 'summary';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS: { key: TabKey; label: string }[] = [
  { key: 'compare', label: 'Compare / \uBE44\uAD50' },
  { key: 'breakdown', label: 'Breakdown / \uC138\uBD80\uB0B4\uC5ED' },
  { key: 'summary', label: 'Summary / \uC694\uC57D' },
];

const AMBER_TAB_ACTIVE =
  'text-amber-400 border-b-2 border-amber-400 bg-amber-500/10';
const AMBER_BADGE_ACTIVE = 'bg-amber-500/20 text-amber-300';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Compare tab: horizontal bar chart of vendor total costs. */
function CompareTab({
  estimates,
  cheapestVendor,
}: {
  estimates: VendorCostEstimate[];
  cheapestVendor: string | null;
}) {
  const maxCost = Math.max(...estimates.map((v) => v.totalMonthlyCost), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-zinc-400 mb-1">
        Monthly Cost by Vendor / \uBCA4\uB354\uBCC4 \uC6D4 \uBE44\uC6A9
      </h3>
      {estimates.map((est) => {
        const isCheapest = est.vendorId === cheapestVendor;
        const widthPct = maxCost > 0 ? (est.totalMonthlyCost / maxCost) * 100 : 0;
        return (
          <div key={est.vendorId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-medium">
                {est.vendorName}
                {isCheapest && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                    Cheapest / \uCD5C\uC800\uAC00
                  </span>
                )}
              </span>
              <span className={isCheapest ? 'text-green-400 font-semibold' : 'text-zinc-300'}>
                {formatUsd(est.totalMonthlyCost)}/mo
              </span>
            </div>
            {/* Bar */}
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCheapest ? 'bg-green-500/70' : 'bg-amber-500/50'
                }`}
                style={{ width: `${Math.max(widthPct, 2)}%` }}
              />
            </div>
            {/* Coverage badge */}
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <span>
                Coverage / \uCEE4\uBC84\uB9AC\uC9C0: {est.coveragePercentage}%
              </span>
              <span>
                {est.products.length} product(s) / \uC81C\uD488
              </span>
            </div>
          </div>
        );
      })}

      {estimates.every((e) => e.coveragePercentage === 0) && (
        <div className="text-center text-zinc-500 py-8">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">
            No vendor products matched the current spec.
          </p>
          <p className="text-xs text-zinc-600">
            \uD604\uC7AC \uC2A4\uD399\uACFC \uC77C\uCE58\uD558\uB294 \uBCA4\uB354 \uC81C\uD488\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.
          </p>
        </div>
      )}
    </div>
  );
}

/** Breakdown tab: expandable per-vendor product lists. */
function BreakdownTab({ estimates }: { estimates: VendorCostEstimate[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (vendorId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {estimates.map((est) => {
        const isOpen = expanded.has(est.vendorId);
        return (
          <div
            key={est.vendorId}
            className="bg-zinc-800/50 rounded-lg border border-white/5 overflow-hidden"
          >
            {/* Vendor header (clickable) */}
            <button
              onClick={() => toggle(est.vendorId)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
                <span className="text-sm font-medium text-white">{est.vendorName}</span>
                <span className="text-[10px] text-zinc-500">
                  {est.products.length} items
                </span>
              </div>
              <span className="text-sm text-amber-400 font-medium">
                {formatUsd(est.totalMonthlyCost)}/mo
              </span>
            </button>

            {/* Expanded product list */}
            {isOpen && (
              <div className="border-t border-white/5 px-3 py-2 space-y-1.5">
                {est.products.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2">
                    No matching products / \uC77C\uCE58\uD558\uB294 \uC81C\uD488 \uC5C6\uC74C
                  </p>
                ) : (
                  est.products.map((item) => (
                    <div
                      key={`${item.vendorId}-${item.nodeType}`}
                      className="flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-zinc-300">{item.productName}</span>
                        <span className="text-zinc-600 ml-1.5">({item.nodeType})</span>
                        {item.quantity > 1 && (
                          <span className="text-amber-500/80 ml-1">x{item.quantity}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400">
                          {item.tier}
                        </span>
                        <span className="text-zinc-300 font-medium tabular-nums">
                          {formatUsd(item.monthlyCost * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {/* Uncovered types */}
                {est.uncoveredNodeTypes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-[10px] text-zinc-600 mb-1">
                      Uncovered / \uBBF8\uCEE4\uBC84:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {est.uncoveredNodeTypes.map((nt) => (
                        <span
                          key={nt}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400/70"
                        >
                          {nt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Summary tab: key metrics overview. */
function SummaryTab({
  cheapestVendor,
  bestCoverageVendor,
  recommendedVendor,
  recommendedReason,
  recommendedReasonKo,
  savingsPercentage,
  estimates,
}: {
  cheapestVendor: string | null;
  bestCoverageVendor: string | null;
  recommendedVendor: string | null;
  recommendedReason: string;
  recommendedReasonKo: string;
  savingsPercentage: number;
  estimates: VendorCostEstimate[];
}) {
  const findName = (id: string | null) =>
    estimates.find((e) => e.vendorId === id)?.vendorName ?? '-';

  const metrics: {
    label: string;
    labelKo: string;
    value: string;
    color: string;
  }[] = [
    {
      label: 'Cheapest Vendor',
      labelKo: '\uCD5C\uC800\uAC00 \uBCA4\uB354',
      value: findName(cheapestVendor),
      color: 'text-green-400',
    },
    {
      label: 'Best Coverage',
      labelKo: '\uCD5C\uACE0 \uCEE4\uBC84\uB9AC\uC9C0',
      value: findName(bestCoverageVendor),
      color: 'text-blue-400',
    },
    {
      label: 'Recommended',
      labelKo: '\uCD94\uCC9C',
      value: findName(recommendedVendor),
      color: 'text-amber-400',
    },
    {
      label: 'Potential Savings',
      labelKo: '\uC808\uAC10 \uAC00\uB2A5\uC561',
      value: `${savingsPercentage}%`,
      color: savingsPercentage > 0 ? 'text-green-400' : 'text-zinc-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-zinc-800/50 rounded-lg p-3 border border-white/5"
          >
            <div className="text-[10px] text-zinc-500">
              {m.label} / {m.labelKo}
            </div>
            <div className={`text-sm font-semibold mt-1 ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Recommendation reason */}
      {recommendedVendor && (
        <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/20">
          <h4 className="text-xs font-medium text-amber-400 mb-1">
            Recommendation / \uCD94\uCC9C \uC0AC\uC720
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">{recommendedReason}</p>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1">{recommendedReasonKo}</p>
        </div>
      )}

      {/* Per-vendor summary table */}
      <div>
        <h4 className="text-xs font-medium text-zinc-400 mb-2">
          Vendor Overview / \uBCA4\uB354 \uAC1C\uC694
        </h4>
        <div className="space-y-1.5">
          {estimates.map((est) => (
            <div
              key={est.vendorId}
              className="flex items-center justify-between bg-zinc-800/30 rounded-lg px-3 py-2 border border-white/5"
            >
              <div>
                <span className="text-sm text-white">{est.vendorName}</span>
                <span className="text-[10px] text-zinc-500 ml-2">
                  {est.coveragePercentage}% coverage
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-zinc-300 tabular-nums">
                  {formatUsd(est.totalMonthlyCost)}/mo
                </div>
                <div className="text-[10px] text-zinc-500 tabular-nums">
                  {formatUsd(est.totalAnnualCost)}/yr
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export function CostComparisonPanel({ show, onClose, spec }: CostComparisonPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('compare');

  const result = useMemo(() => compareVendorCosts(spec), [spec]);

  if (!show) return null;

  return (
    <PanelContainer widthClass="w-[600px]">
      <PanelHeader
        icon={DollarSign}
        iconColor="text-amber-400"
        title="Cost Comparison / \uBE44\uC6A9 \uBE44\uAD50"
        onClose={onClose}
      />

      <PanelTabs<TabKey>
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        activeClassName={AMBER_TAB_ACTIVE}
        activeBadgeClassName={AMBER_BADGE_ACTIVE}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {spec.nodes.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Create a diagram first to compare vendor costs.</p>
            <p className="text-xs text-zinc-600 mt-1">
              \uBCA4\uB354 \uBE44\uC6A9\uC744 \uBE44\uAD50\uD558\uB824\uBA74 \uBA3C\uC800 \uB2E4\uC774\uC5B4\uADF8\uB7A8\uC744 \uC0DD\uC131\uD574\uC8FC\uC138\uC694.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'compare' && (
              <CompareTab
                estimates={result.vendorEstimates}
                cheapestVendor={result.cheapestVendor}
              />
            )}
            {activeTab === 'breakdown' && (
              <BreakdownTab estimates={result.vendorEstimates} />
            )}
            {activeTab === 'summary' && (
              <SummaryTab
                cheapestVendor={result.cheapestVendor}
                bestCoverageVendor={result.bestCoverageVendor}
                recommendedVendor={result.recommendedVendor}
                recommendedReason={result.recommendedReason}
                recommendedReasonKo={result.recommendedReasonKo}
                savingsPercentage={result.savingsPercentage}
                estimates={result.vendorEstimates}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3 text-[10px] text-zinc-500">
        <span>
          Cost estimates are approximate and based on product tier classification.
          Actual vendor pricing may vary.
        </span>
        <br />
        <span>
          \uBE44\uC6A9 \uCD94\uC815\uCE58\uB294 \uC81C\uD488 \uD2F0\uC5B4 \uBD84\uB958 \uAE30\uBC18\uC758 \uADFC\uC0AC\uCE58\uC774\uBA70, \uC2E4\uC81C \uBCA4\uB354 \uAC00\uACA9\uACFC \uB2E4\uB97C \uC218 \uC788\uC2B5\uB2C8\uB2E4.
        </span>
      </div>
    </PanelContainer>
  );
}
