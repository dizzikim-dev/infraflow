'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  DollarSign,
  Cloud,
  Server,
  Download,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  estimateCost,
  compareCosts,
  formatCost,
  exportCostToCSV,
  type CloudProvider,
  type CostBreakdown,
} from '@/lib/cost';
import type { InfraSpec } from '@/types';

interface CostEstimatorPanelProps {
  spec: InfraSpec;
  onClose: () => void;
}

export function CostEstimatorPanel({ spec, onClose }: CostEstimatorPanelProps) {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>('aws');
  const [currency, setCurrency] = useState<'USD' | 'KRW'>('USD');
  const [showComparison, setShowComparison] = useState(false);

  const breakdown = useMemo(
    () => estimateCost(spec, { provider: selectedProvider, currency }),
    [spec, selectedProvider, currency]
  );

  const comparison = useMemo(
    () => (showComparison ? compareCosts(spec) : null),
    [spec, showComparison]
  );

  const handleExportCSV = () => {
    const csv = exportCostToCSV(breakdown);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `infraflow-cost-${selectedProvider}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const providerIcons: Record<CloudProvider, React.ReactNode> = {
    aws: <Cloud className="w-4 h-4" />,
    azure: <Cloud className="w-4 h-4" />,
    gcp: <Cloud className="w-4 h-4" />,
    onprem: <Server className="w-4 h-4" />,
  };

  const providerLabels: Record<CloudProvider, string> = {
    aws: 'AWS',
    azure: 'Azure',
    gcp: 'GCP',
    onprem: 'On-Prem',
  };

  const categoryColors: Record<string, string> = {
    security: 'bg-red-500/20 text-red-400',
    network: 'bg-blue-500/20 text-blue-400',
    compute: 'bg-green-500/20 text-green-400',
    cloud: 'bg-purple-500/20 text-purple-400',
    storage: 'bg-yellow-500/20 text-yellow-400',
    auth: 'bg-cyan-500/20 text-cyan-400',
    external: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-0 right-0 h-full w-[450px] bg-zinc-900/95 backdrop-blur-sm border-l border-white/10 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">비용 산출</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-white/10 space-y-3">
        {/* Provider Selection */}
        <div className="flex gap-2">
          {(['aws', 'azure', 'gcp', 'onprem'] as CloudProvider[]).map((provider) => (
            <button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedProvider === provider
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
              }`}
            >
              {providerIcons[provider]}
              {providerLabels[provider]}
            </button>
          ))}
        </div>

        {/* Currency & Options */}
        <div className="flex items-center gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'USD' | 'KRW')}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="KRW">KRW (₩)</option>
          </select>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showComparison
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            비교
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 text-green-400 mb-3">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">예상 비용 ({providerLabels[selectedProvider]})</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">월간</p>
              <p className="text-2xl font-bold text-white">
                {formatCost(breakdown.totalMonthlyCost, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">연간</p>
              <p className="text-2xl font-bold text-white">
                {formatCost(breakdown.totalYearlyCost, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Provider Comparison */}
        {showComparison && comparison && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-medium text-gray-300 mb-3">클라우드 비용 비교 (월간)</h3>
            <div className="space-y-2">
              {(['aws', 'azure', 'gcp', 'onprem'] as CloudProvider[]).map((provider) => {
                const cost = comparison[provider].totalMonthlyCost;
                const maxCost = Math.max(...Object.values(comparison).map((c) => c.totalMonthlyCost));
                const percentage = maxCost > 0 ? (cost / maxCost) * 100 : 0;

                return (
                  <div key={provider} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{providerLabels[provider]}</span>
                      <span className={`font-medium ${
                        provider === selectedProvider ? 'text-blue-400' : 'text-white'
                      }`}>
                        {formatCost(cost, currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${
                          provider === 'aws'
                            ? 'bg-orange-500'
                            : provider === 'azure'
                            ? 'bg-blue-500'
                            : provider === 'gcp'
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">카테고리별 비용</h3>
          <div className="space-y-2">
            {Object.entries(breakdown.byCategory)
              .filter(([, cost]) => cost > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([category, cost]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                    categoryColors[category] || 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {category}
                  </span>
                  <span className="text-sm text-white font-medium">
                    {formatCost(cost, currency)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">항목별 상세</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {breakdown.items
              .filter((item) => item.monthlyCost > 0)
              .sort((a, b) => b.monthlyCost - a.monthlyCost)
              .map((item) => (
                <div
                  key={item.nodeId}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{item.label}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {item.service} • {item.tier}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm text-white font-medium">
                      {formatCost(item.monthlyCost, currency)}
                    </p>
                    <p className="text-xs text-gray-500">/월</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleExportCSV}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV 내보내기
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          * 예상 비용이며 실제 비용과 다를 수 있습니다
        </p>
      </div>
    </motion.div>
  );
}
