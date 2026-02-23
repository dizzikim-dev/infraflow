'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck2 } from 'lucide-react';
import { useInfraComponent } from '@/hooks/useInfrastructureData';
import type { NodeDetailPanelProps, TabType } from './types';
import { categoryColors, tabs } from './constants';
import { OverviewTab } from './OverviewTab';
import { TechnicalTab } from './TechnicalTab';
import { ProductsTab } from './ProductsTab';

export function NodeDetailPanel({
  nodeId,
  nodeName,
  nodeType,
  tier,
  zone,
  description,
  onClose,
  onOpenEvidence,
  onProductSelect,
}: NodeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { component: infraInfo } = useInfraComponent(nodeType);
  const colors = categoryColors[infraInfo?.category || 'external'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-20 bottom-20 w-96 z-40 pointer-events-auto"
    >
      <div className="h-full bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`px-5 py-4 border-b border-zinc-800 ${colors.bg}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.border} ${colors.text} border`}>
                  {infraInfo?.category?.toUpperCase() || nodeType}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{nodeName}</h2>
              <p className="text-sm text-zinc-400">{infraInfo?.nameKo || nodeType}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-3 py-3 text-xs font-medium transition-all
                ${activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-500 bg-blue-500/5'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }
              `}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <OverviewTab infraInfo={infraInfo} colors={colors} tier={tier} zone={zone} description={description} />
              )}
              {activeTab === 'technical' && (
                <TechnicalTab infraInfo={infraInfo} colors={colors} />
              )}
              {activeTab === 'products' && (
                <ProductsTab nodeType={nodeType} onProductSelect={onProductSelect} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>ID: {nodeId}</span>
            {onOpenEvidence && (
              <button
                onClick={onOpenEvidence}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors text-xs font-medium"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                Evidence
              </button>
            )}
            <span>Type: {nodeType}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
