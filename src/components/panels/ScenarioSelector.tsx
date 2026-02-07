'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, AlertTriangle, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { getAvailableScenarios, ScenarioType } from '@/lib/animation';

interface ScenarioSelectorProps {
  onSelect: (type: ScenarioType) => void;
  onClose: () => void;
  currentScenario?: ScenarioType;
}

type CategoryKey = 'basic' | 'failure' | 'performance';

const categoryInfo: Record<CategoryKey, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  basic: {
    label: '기본 흐름',
    icon: <Play className="w-4 h-4" />,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    description: '일반적인 데이터 흐름 시각화',
  },
  failure: {
    label: '장애 시나리오',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
    description: '장애 상황 시뮬레이션',
  },
  performance: {
    label: '성능 시나리오',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-green-400 bg-green-500/10 border-green-500/30',
    description: '성능 및 부하 분산 시각화',
  },
};

export function ScenarioSelector({
  onSelect,
  onClose,
  currentScenario,
}: ScenarioSelectorProps) {
  const scenarios = getAvailableScenarios();
  const [expandedCategories, setExpandedCategories] = useState<Set<CategoryKey>>(
    new Set(['basic', 'failure', 'performance'])
  );

  // Group scenarios by category
  const groupedScenarios = useMemo(() => {
    const groups: Record<CategoryKey, typeof scenarios> = {
      basic: [],
      failure: [],
      performance: [],
    };

    for (const scenario of scenarios) {
      const category = scenario.category as CategoryKey;
      if (groups[category]) {
        groups[category].push(scenario);
      }
    }

    return groups;
  }, [scenarios]);

  const toggleCategory = (category: CategoryKey) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-16 right-4 z-20"
    >
      <div className="bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-white font-semibold">흐름 시나리오</h3>
            <p className="text-xs text-gray-400 mt-0.5">애니메이션 유형 선택</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories */}
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {(Object.keys(groupedScenarios) as CategoryKey[]).map((category) => {
            const info = categoryInfo[category];
            const scenariosInCategory = groupedScenarios[category];
            const isExpanded = expandedCategories.has(category);

            if (scenariosInCategory.length === 0) return null;

            return (
              <div key={category} className="mb-2">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className={`w-full flex items-center gap-2 p-2.5 rounded-lg border transition-all ${info.color}`}
                >
                  {info.icon}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{info.label}</div>
                    <div className="text-xs opacity-70">{info.description}</div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  )}
                </button>

                {/* Scenarios */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1 pl-2 space-y-1">
                        {scenariosInCategory.map((scenario) => (
                          <button
                            key={scenario.type}
                            onClick={() => onSelect(scenario.type)}
                            className={`
                              w-full flex items-center gap-3 p-2.5 rounded-lg transition-all
                              ${currentScenario === scenario.type
                                ? 'bg-blue-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/10'
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                              }
                            `}
                          >
                            <span className="text-lg flex-shrink-0">{scenario.icon}</span>
                            <div className="flex-1 text-left min-w-0">
                              <div className="text-white text-sm font-medium truncate">
                                {scenario.name}
                              </div>
                              <div className="text-gray-400 text-xs truncate">
                                {scenario.description}
                              </div>
                            </div>
                            {currentScenario === scenario.type && (
                              <motion.div
                                layoutId="active-indicator"
                                className="w-2 h-2 rounded-full bg-blue-500"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-white/5">
          <p className="text-xs text-gray-500 text-center">
            시나리오를 선택하면 애니메이션이 시작됩니다
          </p>
        </div>
      </div>
    </motion.div>
  );
}
