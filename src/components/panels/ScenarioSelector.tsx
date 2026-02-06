'use client';

import { motion } from 'framer-motion';
import { getAvailableScenarios, ScenarioType } from '@/lib/animation';

interface ScenarioSelectorProps {
  onSelect: (type: ScenarioType) => void;
  onClose: () => void;
  currentScenario?: ScenarioType;
}

export function ScenarioSelector({
  onSelect,
  onClose,
  currentScenario,
}: ScenarioSelectorProps) {
  const scenarios = getAvailableScenarios();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-16 right-4 z-20"
    >
      <div className="bg-zinc-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-zinc-700 p-4 w-64">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium text-sm">흐름 시나리오</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.type}
              onClick={() => onSelect(scenario.type)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg transition-all
                ${currentScenario === scenario.type
                  ? 'bg-blue-500/20 border border-blue-500/50'
                  : 'bg-zinc-700/50 hover:bg-zinc-700 border border-transparent'
                }
              `}
            >
              <span className="text-xl">{scenario.icon}</span>
              <div className="text-left">
                <div className="text-white text-sm font-medium">
                  {scenario.name}
                </div>
                <div className="text-zinc-400 text-xs">
                  {scenario.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-700">
          <p className="text-xs text-zinc-500 text-center">
            시나리오를 선택하면 애니메이션이 시작됩니다
          </p>
        </div>
      </div>
    </motion.div>
  );
}
