'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PolicyRule } from '@/types';

interface PolicyOverlayProps {
  nodeName: string;
  nodeType: string;
  policies: PolicyRule[];
  position: { x: number; y: number };
  onClose: () => void;
  onPolicyEdit?: (policy: PolicyRule) => void;
}

export function PolicyOverlay({
  nodeName,
  nodeType,
  policies,
  position,
  onClose,
  onPolicyEdit,
}: PolicyOverlayProps) {
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const getPolicyTypeColor = (type: PolicyRule['type']) => {
    switch (type) {
      case 'allow':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'deny':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'rate-limit':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getPolicyTypeIcon = (type: PolicyRule['type']) => {
    switch (type) {
      case 'allow':
        return '✓';
      case 'deny':
        return '✕';
      case 'rate-limit':
        return '⏱';
      default:
        return '•';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        marginTop: -20,
      }}
      className="z-50 pointer-events-auto"
    >
      <div className="bg-zinc-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-zinc-700 min-w-[280px] max-w-[400px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <div>
              <h3 className="text-white font-medium text-sm">{nodeName}</h3>
              <span className="text-zinc-500 text-xs capitalize">{nodeType}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Policies List */}
        <div className="p-3 max-h-[300px] overflow-y-auto">
          {policies.length === 0 ? (
            <div className="text-zinc-500 text-sm text-center py-4">
              No policies configured
            </div>
          ) : (
            <div className="space-y-2">
              {policies.map((policy) => (
                <motion.div
                  key={policy.id}
                  layout
                  className={`
                    rounded-lg border p-3 cursor-pointer transition-colors
                    ${getPolicyTypeColor(policy.type)}
                    hover:bg-opacity-30
                  `}
                  onClick={() =>
                    setExpandedPolicy(
                      expandedPolicy === policy.id ? null : policy.id
                    )
                  }
                >
                  {/* Policy Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPolicyTypeIcon(policy.type)}</span>
                      <span className="font-medium text-sm">{policy.name}</span>
                    </div>
                    <span className="text-xs uppercase opacity-70">{policy.type}</span>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedPolicy === policy.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-current/20 space-y-2 text-xs">
                          {policy.source && (
                            <div className="flex justify-between">
                              <span className="opacity-70">Source:</span>
                              <span>{policy.source}</span>
                            </div>
                          )}
                          {policy.destination && (
                            <div className="flex justify-between">
                              <span className="opacity-70">Destination:</span>
                              <span>{policy.destination}</span>
                            </div>
                          )}
                          {policy.port && (
                            <div className="flex justify-between">
                              <span className="opacity-70">Port:</span>
                              <span>{policy.port}</span>
                            </div>
                          )}
                          {policy.protocol && (
                            <div className="flex justify-between">
                              <span className="opacity-70">Protocol:</span>
                              <span>{policy.protocol}</span>
                            </div>
                          )}
                          {policy.description && (
                            <div className="mt-2 opacity-70 italic">
                              {policy.description}
                            </div>
                          )}

                          {/* Edit Button */}
                          {onPolicyEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPolicyEdit(policy);
                              }}
                              className="mt-2 w-full py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors text-center"
                            >
                              Edit Policy
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-zinc-900/30 border-t border-zinc-700">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{policies.length} rule{policies.length !== 1 ? 's' : ''}</span>
            <span>Click rule for details</span>
          </div>
        </div>
      </div>

      {/* Arrow pointing to node */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full"
        style={{ marginBottom: -8 }}
      >
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-zinc-800" />
      </div>
    </motion.div>
  );
}
