'use client';

import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight } from 'lucide-react';
import { useInfrastructureData } from '@/hooks/useInfrastructureData';
import type { ComponentData } from '@/hooks/useNodes';
import type { InfraNodeType } from '@/types';

interface ComponentPickerProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onSelect: (componentType: InfraNodeType, componentData: ComponentData) => void;
  onClose: () => void;
}

// Category display configuration
const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  security: { label: '보안', icon: '🔒', color: 'text-red-400' },
  network: { label: '네트워크', icon: '🌐', color: 'text-blue-400' },
  compute: { label: '컴퓨팅', icon: '💻', color: 'text-green-400' },
  cloud: { label: '클라우드', icon: '☁️', color: 'text-purple-400' },
  storage: { label: '스토리지', icon: '💾', color: 'text-amber-400' },
  auth: { label: '인증/접근', icon: '🔐', color: 'text-pink-400' },
  external: { label: '외부', icon: '👤', color: 'text-gray-400' },
};

// Map component IDs to node types (using kebab-case as per type definitions)
const componentTypeMap: Record<string, InfraNodeType> = {
  firewall: 'firewall',
  waf: 'waf',
  'ids-ips': 'ids-ips',
  'vpn-gateway': 'vpn-gateway',
  nac: 'nac',
  dlp: 'dlp',
  router: 'router',
  'switch-l2': 'switch-l2',
  'switch-l3': 'switch-l3',
  'load-balancer': 'load-balancer',
  'sd-wan': 'sd-wan',
  dns: 'dns',
  cdn: 'cdn',
  'web-server': 'web-server',
  'app-server': 'app-server',
  'db-server': 'db-server',
  container: 'container',
  vm: 'vm',
  kubernetes: 'kubernetes',
  'aws-vpc': 'aws-vpc',
  'azure-vnet': 'azure-vnet',
  'gcp-network': 'gcp-network',
  'private-cloud': 'private-cloud',
  'san-nas': 'san-nas',
  'object-storage': 'object-storage',
  backup: 'backup',
  cache: 'cache',
  storage: 'storage',
  'ldap-ad': 'ldap-ad',
  sso: 'sso',
  mfa: 'mfa',
  iam: 'iam',
  user: 'user',
  internet: 'internet',
};

/**
 * Component picker for adding new nodes
 * Fetches components from database and displays by category
 */
export const ComponentPicker = memo(function ComponentPicker({
  isOpen,
  position,
  onSelect,
  onClose,
}: ComponentPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch components from database using SWR
  const { infrastructureDB, isLoading, error } = useInfrastructureData();

  // Filter and group components
  const filteredComponents = useMemo(() => {
    if (!infrastructureDB) return {};

    const query = searchQuery.toLowerCase();
    const componentsArray = Object.values(infrastructureDB);

    const filtered = componentsArray.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      c.nameKo.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );

    // Group by category
    const grouped: Record<string, typeof filtered> = {};
    filtered.forEach((component) => {
      const category = component.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(component);
    });

    return grouped;
  }, [infrastructureDB, searchQuery]);

  const handleSelect = (component: ComponentData) => {
    const nodeType = componentTypeMap[component.id] || 'vm';
    onSelect(nodeType, component);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        data-context-menu
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[100] w-[320px] max-h-[400px] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden flex flex-col"
        style={{
          left: Math.min(position.x, window.innerWidth - 340),
          top: Math.min(position.y, window.innerHeight - 420),
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-zinc-700 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="컴포넌트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-sm bg-zinc-900 border border-zinc-700 rounded-md text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-zinc-500 text-sm">
              로딩 중...
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-red-400 text-sm">
              오류가 발생했습니다
            </div>
          ) : Object.keys(filteredComponents).length === 0 ? (
            <div className="px-4 py-8 text-center text-zinc-500 text-sm">
              검색 결과가 없습니다
            </div>
          ) : (
            Object.entries(filteredComponents).map(([category, items]) => {
              const config = categoryConfig[category] || {
                label: category,
                icon: '📦',
                color: 'text-zinc-400',
              };
              const isExpanded = expandedCategory === category || searchQuery.length > 0;

              return (
                <div key={category} className="mb-1">
                  {/* Category header */}
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded && !searchQuery ? null : category)
                    }
                    className="w-full px-3 py-2 flex items-center gap-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                  >
                    <span>{config.icon}</span>
                    <span className={config.color}>{config.label}</span>
                    <span className="text-zinc-500 text-xs">({items.length})</span>
                    <ChevronRight
                      size={14}
                      className={`ml-auto text-zinc-500 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Category items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        {items.map((component) => (
                          <button
                            key={component.id}
                            onClick={() => handleSelect(component)}
                            className="w-full px-3 py-1.5 pl-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                          >
                            <span className="flex-1 text-left truncate">
                              {component.nameKo}
                            </span>
                            <span className="text-xs text-zinc-600">
                              {component.name}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-zinc-700 text-xs text-zinc-500">
          컴포넌트를 선택하면 캔버스에 추가됩니다
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default ComponentPicker;
