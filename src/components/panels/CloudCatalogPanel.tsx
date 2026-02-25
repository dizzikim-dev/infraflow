'use client';

/**
 * Cloud Catalog Panel Component
 *
 * Displays cloud service mappings and deprecation warnings.
 * Two tabs: "Deprecation 경고" / "서비스 카탈로그"
 */

import { useState, useMemo, useEffect } from 'react';
import { Cloud, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import type { InfraSpec, InfraNodeType } from '@/types';
import { useCloudCatalog } from '@/hooks/useCloudCatalog';
import type { CloudProvider, CloudService, ServiceComparison } from '@/lib/knowledge/cloudCatalog';
import { SEVERITY_BADGE, SERVICE_STATUS_BADGE, CLOUD_PROVIDER_BADGE } from '@/lib/utils/badgeThemes';
import { PanelContainer } from './PanelContainer';
import { PanelHeader } from './PanelHeader';
import { PanelTabs } from './PanelTabs';

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

  // Pre-fetch catalog comparisons for all component types
  const [catalogMap, setCatalogMap] = useState<Record<string, ServiceComparison>>({});
  useEffect(() => {
    if (activeTab !== 'catalog' || componentTypes.length === 0) return;
    let cancelled = false;
    Promise.all(
      componentTypes.map(async (type) => {
        const comparison = await compareServicesForType(type);
        return [type, comparison] as const;
      }),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, ServiceComparison> = {};
      for (const [type, comparison] of results) {
        if (comparison) map[type] = comparison;
      }
      setCatalogMap(map);
    });
    return () => { cancelled = true; };
  }, [activeTab, componentTypes, compareServicesForType]);

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'deprecation', label: 'Deprecation 경고', count: deprecationWarnings.length },
    { key: 'catalog', label: '서비스 카탈로그' },
  ];

  return (
    <PanelContainer>
      <PanelHeader icon={Cloud} iconColor="text-blue-400" title="클라우드 서비스 카탈로그" onClose={onClose} />

      {/* Tabs */}
      <PanelTabs
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
      />

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
                const urgencyConfig = SEVERITY_BADGE[w.urgency] ?? SEVERITY_BADGE.medium;
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
              {(['all', 'aws', 'azure', 'gcp', 'ncp', 'kakao', 'kt', 'nhn'] as const).map((p) => (
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
                const comparison = catalogMap[type];
                if (!comparison) return null;
                const filteredServices = selectedProvider === 'all'
                  ? comparison.services
                  : comparison.services.filter((s: CloudService) => s.provider === selectedProvider);
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
    </PanelContainer>
  );
}

// ============================================================
// Sub-components
// ============================================================

function ServiceCard({ service }: { service: CloudService }) {
  const status = SERVICE_STATUS_BADGE[service.status] ?? SERVICE_STATUS_BADGE.active;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-white/5">
      <div className="flex items-center gap-2 flex-wrap">
        <ProviderBadge provider={service.provider} />
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${status.className}`}>
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
  const c = CLOUD_PROVIDER_BADGE[provider];
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${c.className}`}>{c.label}</span>
  );
}
