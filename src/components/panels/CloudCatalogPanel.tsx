'use client';

/**
 * Cloud Catalog Panel Component
 *
 * Displays cloud service mappings and deprecation warnings.
 * Two tabs: "Deprecation 경고" / "서비스 카탈로그"
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Cloud, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import type { InfraSpec, InfraNodeType } from '@/types';
import { useCloudCatalog } from '@/hooks/useCloudCatalog';
import type { CloudProvider, CloudService } from '@/lib/knowledge/cloudCatalog';

// ============================================================
// Types
// ============================================================

interface CloudCatalogPanelProps {
  spec: InfraSpec | null;
  onClose: () => void;
}

type TabType = 'deprecation' | 'catalog';

// ============================================================
// Component
// ============================================================

export function CloudCatalogPanel({ spec, onClose }: CloudCatalogPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('deprecation');
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | 'all'>('all');
  const { deprecationWarnings, compareServicesForType } = useCloudCatalog(spec);

  // Unique component types in spec for catalog browsing
  const componentTypes = useMemo(() => {
    if (!spec) return [];
    return [...new Set(spec.nodes.map((n) => n.type))];
  }, [spec]);

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'deprecation', label: 'Deprecation 경고', count: deprecationWarnings.length },
    { key: 'catalog', label: '서비스 카탈로그' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-0 right-0 h-full w-[480px] bg-zinc-900/95 backdrop-blur-sm border-l border-white/10 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">클라우드 서비스 카탈로그</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-zinc-400'
                }`}>
                  {count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!spec && (
          <div className="text-center text-zinc-500 py-12">
            <Cloud className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>다이어그램을 먼저 생성해주세요.</p>
          </div>
        )}

        {spec && activeTab === 'deprecation' && (
          <>
            {deprecationWarnings.length === 0 ? (
              <div className="text-center text-zinc-500 py-12">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500/50" />
                <p>Deprecated 서비스가 감지되지 않았습니다.</p>
              </div>
            ) : (
              deprecationWarnings.map((w) => {
                const urgencyConfig = w.urgency === 'critical'
                  ? { icon: '🔴', badgeClass: 'bg-red-500/20 text-red-300' }
                  : w.urgency === 'high'
                    ? { icon: '🟠', badgeClass: 'bg-orange-500/20 text-orange-300' }
                    : { icon: '🟡', badgeClass: 'bg-yellow-500/20 text-yellow-300' };
                return (
                  <div key={w.service.id} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">{urgencyConfig.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${urgencyConfig.badgeClass}`}>
                            {w.urgency.toUpperCase()}
                          </span>
                          <ProviderBadge provider={w.service.provider} />
                        </div>
                        <p className="text-sm font-medium text-white mt-1.5">{w.service.serviceNameKo}</p>
                        <p className="text-xs text-zinc-400 mt-1">{w.messageKo}</p>
                        {w.service.successor && (
                          <div className="mt-2 p-2 rounded bg-green-500/5 border border-green-500/10">
                            <p className="text-xs text-green-300">
                              <span className="text-zinc-500">후속 서비스:</span> {w.service.successorKo}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {spec && activeTab === 'catalog' && (
          <>
            {/* Provider filter */}
            <div className="flex gap-1.5 mb-3">
              {(['all', 'aws', 'azure', 'gcp'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProvider(p)}
                  className={`text-xs px-2.5 py-1.5 rounded transition-colors ${
                    selectedProvider === p
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-white/5 hover:bg-zinc-700'
                  }`}
                >
                  {p === 'all' ? '전체' : p.toUpperCase()}
                </button>
              ))}
            </div>

            {componentTypes.length === 0 ? (
              <div className="text-center text-zinc-500 py-12">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>컴포넌트가 없습니다.</p>
              </div>
            ) : (
              componentTypes.map((type) => {
                const comparison = compareServicesForType(type);
                const filteredServices = selectedProvider === 'all'
                  ? comparison.services
                  : comparison.services.filter((s) => s.provider === selectedProvider);
                if (filteredServices.length === 0) return null;
                return (
                  <div key={type} className="mb-4">
                    <h3 className="text-xs font-mono text-zinc-500 mb-2 uppercase">{type}</h3>
                    <div className="space-y-2">
                      {filteredServices.map((svc) => (
                        <ServiceCard key={svc.id} service={svc} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {spec && (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
          <span>출처: AWS, Azure, GCP 공식 서비스 카탈로그</span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function ServiceCard({ service }: { service: CloudService }) {
  const statusConfig: Record<string, { label: string; class: string }> = {
    active: { label: 'Active', class: 'bg-green-500/20 text-green-300' },
    deprecated: { label: 'Deprecated', class: 'bg-orange-500/20 text-orange-300' },
    preview: { label: 'Preview', class: 'bg-blue-500/20 text-blue-300' },
    'end-of-life': { label: 'EOL', class: 'bg-red-500/20 text-red-300' },
  };

  const status = statusConfig[service.status];

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
      <div className="flex items-center gap-2 flex-wrap">
        <ProviderBadge provider={service.provider} />
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${status.class}`}>
          {status.label}
        </span>
        <span className="text-xs text-zinc-500 ml-auto">{service.pricingTier}</span>
      </div>
      <p className="text-sm font-medium text-white mt-1.5">{service.serviceNameKo}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {service.featuresKo.map((f, i) => (
          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProviderBadge({ provider }: { provider: CloudProvider }) {
  const config: Record<CloudProvider, { label: string; class: string }> = {
    aws: { label: 'AWS', class: 'bg-orange-500/10 text-orange-300 border-orange-500/20' },
    azure: { label: 'Azure', class: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
    gcp: { label: 'GCP', class: 'bg-green-500/10 text-green-300 border-green-500/20' },
  };
  const c = config[provider];
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${c.class}`}>{c.label}</span>
  );
}
