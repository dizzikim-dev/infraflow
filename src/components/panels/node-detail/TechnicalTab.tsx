'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PolicyRecommendation } from '@/lib/data';
import type { TabProps } from './types';
import { priorityColors } from './constants';

export function TechnicalTab({ infraInfo, colors }: TabProps) {
  const [expandedPolicy, setExpandedPolicy] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Ports */}
      {infraInfo?.ports && infraInfo.ports.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">{'\uc0ac\uc6a9 \ud3ec\ud2b8'}</h4>
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
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">{'\ud504\ub85c\ud1a0\ucf5c'}</h4>
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
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">{'\uc8fc\uc694 \ubca4\ub354/\uc81c\ud488'}</h4>
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
      {(!infraInfo?.ports?.length && !infraInfo?.protocols?.length && !infraInfo?.vendors?.length
        && !infraInfo?.recommendedPolicies?.length) && (
        <div className="text-center py-8 text-zinc-500">
          {'\uae30\uc220 \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.'}
        </div>
      )}

      {/* Recommended Policies */}
      {infraInfo?.recommendedPolicies && infraInfo.recommendedPolicies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase text-zinc-500 tracking-wider">{'\uad8c\uc7a5 \uc815\ucc45'}</h4>
          {infraInfo.recommendedPolicies.map((policy: PolicyRecommendation, idx: number) => (
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-current/20 uppercase">
                    {policy.priority}
                  </span>
                  <span className="font-medium text-sm">{policy.nameKo}</span>
                </div>
                <span className="text-xs opacity-70 capitalize">{policy.category}</span>
              </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
