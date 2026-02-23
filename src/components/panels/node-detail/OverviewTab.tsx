'use client';

import { motion } from 'framer-motion';
import type { TabProps } from './types';
import { tierLabels } from './constants';

interface OverviewTabProps extends TabProps {
  tier: string;
  zone?: string;
  description?: string;
}

export function OverviewTab({ infraInfo, colors, tier, zone, description }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase text-zinc-500 tracking-wider">{'\uc124\uba85'}</h4>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {infraInfo?.descriptionKo || description || '\uc0c1\uc138 \uc124\uba85\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.'}
        </p>
      </div>

      {/* Features */}
      {infraInfo?.featuresKo && infraInfo.featuresKo.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">{'\uc8fc\uc694 \ud2b9\uc9d5'}</h4>
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
          <div className="text-xs text-zinc-500 mb-1">{'\uacc4\uce35 (Tier)'}</div>
          <div className="text-sm text-white font-medium">{tierLabels[tier] || tier}</div>
        </div>
        {zone && (
          <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <div className="text-xs text-zinc-500 mb-1">{'\uc601\uc5ed (Zone)'}</div>
            <div className="text-sm text-white font-medium">{zone}</div>
          </div>
        )}
      </div>

      {/* Functions */}
      {infraInfo?.functionsKo && infraInfo.functionsKo.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">{'\uae30\ub2a5'}</h4>
          <div className="space-y-2">
            {infraInfo.functionsKo.map((func, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${colors.bg} ${colors.text}`}>
                  {idx + 1}
                </div>
                <span className="text-sm text-zinc-300 flex-1">{func}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
