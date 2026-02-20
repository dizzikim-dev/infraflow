'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfraNodeType } from '@/types';
import { InfraComponent, PolicyRecommendation } from '@/lib/data';
import { useInfraComponent } from '@/hooks/useInfrastructureData';
import { getProductsByNodeType } from '@/lib/knowledge/vendorCatalog';

interface NodeDetailPanelProps {
  nodeId: string;
  nodeName: string;
  nodeType: InfraNodeType;
  tier: string;
  zone?: string;
  description?: string;
  onClose: () => void;
}

// Tab types
type TabType = 'overview' | 'functions' | 'policies' | 'technical' | 'products';

// Category colors
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  security: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  network: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  compute: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  cloud: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  storage: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  auth: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  telecom: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400' },
  wan: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  external: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', text: 'text-zinc-400' },
};

// Priority colors for policies
const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

// Tier labels
const tierLabels: Record<string, string> = {
  external: '외부 (External)',
  dmz: 'DMZ',
  internal: '내부망 (Internal)',
  data: '데이터 (Data)',
};

export function NodeDetailPanel({
  nodeId,
  nodeName,
  nodeType,
  tier,
  zone,
  description,
  onClose,
}: NodeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedPolicy, setExpandedPolicy] = useState<number | null>(null);

  // Get infrastructure info from DB (with SWR caching and static fallback)
  const { component: infraInfo, isLoading } = useInfraComponent(nodeType);
  const colors = categoryColors[infraInfo?.category || 'external'];

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: '개요', icon: '📋' },
    { id: 'functions', label: '기능', icon: '⚙️' },
    { id: 'policies', label: '정책', icon: '🔐' },
    { id: 'technical', label: '기술정보', icon: '🔧' },
    { id: 'products', label: '제품', icon: '🏭' },
  ];

  const vendorResults = useMemo(
    () => getProductsByNodeType(nodeType),
    [nodeType]
  );

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Description */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase text-zinc-500 tracking-wider">설명</h4>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {infraInfo?.descriptionKo || description || '상세 설명이 없습니다.'}
        </p>
      </div>

      {/* Features */}
      {infraInfo?.featuresKo && infraInfo.featuresKo.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">주요 특징</h4>
          <div className="flex flex-wrap gap-2">
            {infraInfo.featuresKo.map((feature, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded-lg text-xs ${colors.bg} ${colors.border} ${colors.text} border`}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tier & Zone */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
          <div className="text-xs text-zinc-500 mb-1">계층 (Tier)</div>
          <div className="text-sm text-white font-medium">{tierLabels[tier] || tier}</div>
        </div>
        {zone && (
          <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <div className="text-xs text-zinc-500 mb-1">영역 (Zone)</div>
            <div className="text-sm text-white font-medium">{zone}</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFunctions = () => (
    <div className="space-y-3">
      {infraInfo?.functionsKo && infraInfo.functionsKo.length > 0 ? (
        infraInfo.functionsKo.map((func, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${colors.bg} ${colors.text}`}>
              {idx + 1}
            </div>
            <span className="text-sm text-zinc-300 flex-1">{func}</span>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8 text-zinc-500">
          기능 정보가 없습니다.
        </div>
      )}
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-2">
      {infraInfo?.recommendedPolicies && infraInfo.recommendedPolicies.length > 0 ? (
        infraInfo.recommendedPolicies.map((policy: PolicyRecommendation, idx: number) => (
          <motion.div
            key={idx}
            layout
            className={`
              rounded-lg border p-3 cursor-pointer transition-all
              ${priorityColors[policy.priority]}
              hover:bg-opacity-30
            `}
            onClick={() => setExpandedPolicy(expandedPolicy === idx ? null : idx)}
          >
            {/* Policy Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-current/20 uppercase">
                  {policy.priority}
                </span>
                <span className="font-medium text-sm">{policy.nameKo}</span>
              </div>
              <span className="text-xs opacity-70 capitalize">{policy.category}</span>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedPolicy === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-current/20 text-xs">
                    <p className="opacity-80">{policy.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="opacity-60">English:</span>
                      <span className="opacity-80">{policy.name}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8 text-zinc-500">
          권장 정책 정보가 없습니다.
        </div>
      )}
    </div>
  );

  const renderTechnical = () => (
    <div className="space-y-4">
      {/* Ports */}
      {infraInfo?.ports && infraInfo.ports.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">사용 포트</h4>
          <div className="flex flex-wrap gap-2">
            {infraInfo.ports.map((port, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-mono"
              >
                {port}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Protocols */}
      {infraInfo?.protocols && infraInfo.protocols.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">프로토콜</h4>
          <div className="flex flex-wrap gap-2">
            {infraInfo.protocols.map((protocol, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400"
              >
                {protocol}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Vendors */}
      {infraInfo?.vendors && infraInfo.vendors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">주요 벤더/제품</h4>
          <div className="grid grid-cols-2 gap-2">
            {infraInfo.vendors.map((vendor, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-300"
              >
                {vendor}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No technical info */}
      {(!infraInfo?.ports?.length && !infraInfo?.protocols?.length && !infraInfo?.vendors?.length) && (
        <div className="text-center py-8 text-zinc-500">
          기술 정보가 없습니다.
        </div>
      )}
    </div>
  );

  const renderProducts = () => {
    if (vendorResults.length === 0) {
      return (
        <div className="text-center py-8 text-zinc-500">
          이 컴포넌트 유형에 매칭되는 벤더 제품이 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {vendorResults.map(({ vendorId, vendorName, products }) => (
          <div key={vendorId} className="space-y-2">
            {/* Vendor header */}
            <h4 className="text-xs uppercase text-zinc-500 tracking-wider flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold">
                {vendorName}
              </span>
              <span>{products.length} products</span>
            </h4>

            {/* Product cards */}
            <div className="space-y-1.5">
              {products.slice(0, 8).map((product) => (
                <div
                  key={product.nodeId}
                  className="p-2.5 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {product.nameKo}
                      </div>
                    </div>
                    {product.lifecycle && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        product.lifecycle === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : product.lifecycle === 'end-of-sale'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.lifecycle}
                      </span>
                    )}
                  </div>

                  {/* Architecture role */}
                  {product.architectureRoleKo && (
                    <div className="mt-1 text-xs text-zinc-500">
                      역할: {product.architectureRoleKo}
                    </div>
                  )}

                  {/* Recommended for tags */}
                  {product.recommendedForKo && product.recommendedForKo.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {product.recommendedForKo.slice(0, 3).map((useCase, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Source link */}
                  {product.sourceUrl && (
                    <a
                      href={product.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-[10px] text-zinc-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                    >
                      제품 페이지 →
                    </a>
                  )}
                </div>
              ))}

              {products.length > 8 && (
                <div className="text-center text-xs text-zinc-500 py-1">
                  + {products.length - 8}개 더...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'functions' && renderFunctions()}
              {activeTab === 'policies' && renderPolicies()}
              {activeTab === 'technical' && renderTechnical()}
              {activeTab === 'products' && renderProducts()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>ID: {nodeId}</span>
            <span>Type: {nodeType}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
