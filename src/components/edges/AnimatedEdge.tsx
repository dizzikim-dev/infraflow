'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import { EdgeFlowType, InfraEdgeData } from '@/types';

const flowTypeStyles: Record<EdgeFlowType, {
  color: string;
  glowColor: string;
  strokeWidth: number;
  dashArray?: string;
  particleSize: number;
  speed: number;
}> = {
  request: {
    color: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.4)',
    strokeWidth: 2,
    particleSize: 4,
    speed: 1.5,
  },
  response: {
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.4)',
    strokeWidth: 2,
    particleSize: 4,
    speed: 1.5,
  },
  sync: {
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.4)',
    strokeWidth: 2,
    dashArray: '8,4',
    particleSize: 3,
    speed: 2,
  },
  blocked: {
    color: '#f87171',
    glowColor: 'rgba(248, 113, 113, 0.4)',
    strokeWidth: 2,
    dashArray: '4,4',
    particleSize: 0,
    speed: 0,
  },
  encrypted: {
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    strokeWidth: 3,
    dashArray: '12,4',
    particleSize: 5,
    speed: 1.2,
  },
};

export const AnimatedEdge = memo(function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as InfraEdgeData | undefined;
  const flowType = edgeData?.flowType || 'request';
  const style = flowTypeStyles[flowType];

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const gradientId = `gradient-${id}`;
  const filterId = `glow-${id}`;

  return (
    <>
      {/* Gradient & Glow Definitions */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={style.color} stopOpacity={0.3} />
          <stop offset="50%" stopColor={style.color} stopOpacity={1} />
          <stop offset="100%" stopColor={style.color} stopOpacity={0.3} />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow Layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={style.glowColor}
        strokeWidth={style.strokeWidth + 6}
        strokeLinecap="round"
        className="opacity-30"
      />

      {/* Main Edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.color,
          strokeWidth: selected ? style.strokeWidth + 1 : style.strokeWidth,
          strokeDasharray: style.dashArray,
          strokeLinecap: 'round',
          filter: selected ? `url(#${filterId})` : undefined,
        }}
      />

      {/* Arrow Head */}
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
        >
          <path
            d="M2,2 L10,6 L2,10 L4,6 Z"
            fill={style.color}
          />
        </marker>
      </defs>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={1}
        markerEnd={`url(#arrow-${id})`}
      />

      {/* Animated Particles - using SVG animateMotion for path-following */}
      {edgeData?.animated !== false && flowType !== 'blocked' && (
        <>
          {/* Main particle with glow */}
          <circle
            r={style.particleSize}
            fill="white"
            filter={`url(#${filterId})`}
          >
            <animateMotion
              dur={`${style.speed}s`}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
          {/* Trailing particle */}
          <circle
            r={style.particleSize * 0.6}
            fill={style.color}
            opacity={0.5}
          >
            <animateMotion
              dur={`${style.speed}s`}
              repeatCount="indefinite"
              path={edgePath}
              begin={`${style.speed * 0.1}s`}
            />
          </circle>
          {/* Second trailing particle for smoother effect */}
          <circle
            r={style.particleSize * 0.4}
            fill={style.color}
            opacity={0.3}
          >
            <animateMotion
              dur={`${style.speed}s`}
              repeatCount="indefinite"
              path={edgePath}
              begin={`${style.speed * 0.2}s`}
            />
          </circle>
        </>
      )}

      {/* Blocked Indicator */}
      {flowType === 'blocked' && (
        <EdgeLabelRenderer>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="
              bg-red-500/90 backdrop-blur-sm
              text-white px-3 py-1.5 rounded-full
              text-[10px] font-bold uppercase tracking-wider
              shadow-lg shadow-red-500/30
              border border-red-400/50
              flex items-center gap-1.5
            "
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            BLOCKED
          </motion.div>
        </EdgeLabelRenderer>
      )}

      {/* Encrypted Indicator */}
      {flowType === 'encrypted' && (
        <EdgeLabelRenderer>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 20}px)`,
            }}
            className="
              bg-amber-500/20 backdrop-blur-sm
              text-amber-400 px-2 py-1 rounded-full
              text-[10px] font-medium
              border border-amber-500/30
              flex items-center gap-1
            "
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            TLS
          </motion.div>
        </EdgeLabelRenderer>
      )}

      {/* Custom Label */}
      {edgeData?.label && flowType !== 'blocked' && (
        <EdgeLabelRenderer>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="
              bg-zinc-800/90 backdrop-blur-sm
              text-zinc-200 px-2.5 py-1 rounded-md
              text-[11px] font-medium
              border border-zinc-700/50
              shadow-lg
            "
          >
            {edgeData.label}
          </motion.div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
