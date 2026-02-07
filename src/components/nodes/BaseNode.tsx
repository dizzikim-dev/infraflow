'use client';

import { memo, ReactNode, useCallback } from 'react';
import { Handle, Position, useNodeId } from '@xyflow/react';
import { motion } from 'framer-motion';
import { InfraNodeData, NodeCategory } from '@/types';
import { getColorsForNode, nodeIcons } from '@/lib/design';
import { EditableLabel } from './EditableLabel';

interface BaseNodeProps {
  data: InfraNodeData;
  icon: ReactNode;
  color: string;
  selected?: boolean;
  // Editing props
  isEditingLabel?: boolean;
  isEditingDescription?: boolean;
  onStartEditLabel?: () => void;
  onStartEditDescription?: () => void;
  onCommitEdit?: (field: 'label' | 'description', value: string) => void;
  onCancelEdit?: () => void;
}

// 카테고리별 스타일 정의
const categoryStyles: Record<NodeCategory | 'external' | 'zone', {
  gradient: string;
  iconBg: string;
  border: string;
  shadow: string;
}> = {
  security: {
    gradient: 'from-red-500/20 to-rose-600/20',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    border: 'border-red-500/30',
    shadow: 'shadow-red-500/20',
  },
  network: {
    gradient: 'from-blue-500/20 to-indigo-600/20',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/20',
  },
  compute: {
    gradient: 'from-emerald-500/20 to-teal-600/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    border: 'border-emerald-500/30',
    shadow: 'shadow-emerald-500/20',
  },
  cloud: {
    gradient: 'from-violet-500/20 to-purple-600/20',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    border: 'border-violet-500/30',
    shadow: 'shadow-violet-500/20',
  },
  storage: {
    gradient: 'from-amber-500/20 to-orange-600/20',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    border: 'border-amber-500/30',
    shadow: 'shadow-amber-500/20',
  },
  auth: {
    gradient: 'from-pink-500/20 to-rose-600/20',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
    border: 'border-pink-500/30',
    shadow: 'shadow-pink-500/20',
  },
  external: {
    gradient: 'from-slate-500/20 to-gray-600/20',
    iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
    border: 'border-slate-500/30',
    shadow: 'shadow-slate-500/20',
  },
  zone: {
    gradient: 'from-slate-500/20 to-gray-600/20',
    iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
    border: 'border-slate-500/30',
    shadow: 'shadow-slate-500/20',
  },
};

// SVG 아이콘 컴포넌트
function NodeIcon({ nodeType }: { nodeType: string }) {
  const iconPath = nodeIcons[nodeType] || nodeIcons['user'];

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPath} />
    </svg>
  );
}

// Custom comparison function for React.memo
function arePropsEqual(prevProps: BaseNodeProps, nextProps: BaseNodeProps): boolean {
  // Fast path: check reference equality for data object
  if (prevProps.data === nextProps.data && prevProps.selected === nextProps.selected) {
    return (
      prevProps.isEditingLabel === nextProps.isEditingLabel &&
      prevProps.isEditingDescription === nextProps.isEditingDescription
    );
  }

  // Deep comparison for data properties that affect rendering
  return (
    prevProps.data.label === nextProps.data.label &&
    prevProps.data.description === nextProps.data.description &&
    prevProps.data.nodeType === nextProps.data.nodeType &&
    prevProps.data.category === nextProps.data.category &&
    prevProps.data.policies?.length === nextProps.data.policies?.length &&
    prevProps.selected === nextProps.selected &&
    prevProps.isEditingLabel === nextProps.isEditingLabel &&
    prevProps.isEditingDescription === nextProps.isEditingDescription
  );
}

export const BaseNode = memo(function BaseNode({
  data,
  icon,
  selected,
  isEditingLabel = false,
  isEditingDescription = false,
  onStartEditLabel,
  onStartEditDescription,
  onCommitEdit,
  onCancelEdit,
}: BaseNodeProps) {
  const styles = categoryStyles[data.category] || categoryStyles.external;
  const nodeType = data.nodeType || 'user';

  const handleLabelCommit = useCallback((value: string) => {
    onCommitEdit?.('label', value);
  }, [onCommitEdit]);

  const handleDescriptionCommit = useCallback((value: string) => {
    onCommitEdit?.('description', value);
  }, [onCommitEdit]);

  const handleCancelEdit = useCallback(() => {
    onCancelEdit?.();
  }, [onCancelEdit]);

  // Generate accessible description
  const accessibleDescription = `${data.label}, ${nodeType.replace('-', ' ')} node${data.description ? `, ${data.description}` : ''}${data.policies?.length ? `, ${data.policies.length} policies attached` : ''}`;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      role="button"
      tabIndex={0}
      aria-label={accessibleDescription}
      aria-selected={selected}
      aria-roledescription="infrastructure node"
      className={`
        relative group
        min-w-[140px] max-w-[180px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
      `}
    >
      {/* Glow Effect */}
      <div className={`
        absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-50
        bg-gradient-to-br ${styles.gradient}
        transition-opacity duration-300
      `} />

      {/* Main Card */}
      <div className={`
        relative
        bg-zinc-900/80 backdrop-blur-xl
        border ${styles.border} ${selected ? 'border-white/60 ring-2 ring-white/20' : ''}
        rounded-xl
        shadow-2xl ${styles.shadow}
        overflow-hidden
        transition-all duration-200
      `}>
        {/* Top Gradient Bar */}
        <div className={`h-1 w-full ${styles.iconBg}`} />

        {/* Content */}
        <div className="p-3">
          <div className="flex items-start gap-3">
            {/* Icon Container */}
            <div className={`
              flex-shrink-0
              w-10 h-10 rounded-lg
              ${styles.iconBg}
              flex items-center justify-center
              shadow-lg
            `}>
              <NodeIcon nodeType={nodeType} />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm leading-tight">
                {onStartEditLabel ? (
                  <EditableLabel
                    value={data.label}
                    isEditing={isEditingLabel}
                    onStartEdit={onStartEditLabel}
                    onCommit={handleLabelCommit}
                    onCancel={handleCancelEdit}
                    className="text-white font-semibold text-sm"
                    maxLength={30}
                  />
                ) : (
                  <span className="truncate block">{data.label}</span>
                )}
              </div>
              {(data.description || onStartEditDescription) && (
                <div className="text-zinc-400 text-xs mt-0.5">
                  {onStartEditDescription ? (
                    <EditableLabel
                      value={data.description || ''}
                      isEditing={isEditingDescription}
                      onStartEdit={onStartEditDescription}
                      onCommit={handleDescriptionCommit}
                      onCancel={handleCancelEdit}
                      className="text-zinc-400 text-xs"
                      placeholder="설명 추가..."
                      maxLength={50}
                    />
                  ) : (
                    <span className="truncate block">{data.description}</span>
                  )}
                </div>
              )}
              <div className="text-zinc-500 text-[10px] mt-1 font-mono uppercase tracking-wide">
                {nodeType.replace('-', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Indicator */}
        {data.policies && data.policies.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              absolute -top-1.5 -right-1.5
              w-5 h-5 rounded-full
              ${styles.iconBg}
              flex items-center justify-center
              text-[10px] font-bold text-white
              shadow-lg
              ring-2 ring-zinc-900
            `}
          >
            {data.policies.length}
          </motion.div>
        )}
      </div>

      {/* Handles - 4 directions */}
      {/* Left - Target */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={true}
        className={`
          !w-4 !h-4 !bg-zinc-600
          !border-2 !border-zinc-400
          hover:!bg-blue-500 hover:!border-blue-400
          !cursor-crosshair
          transition-colors
        `}
        style={{ left: -8 }}
      />
      {/* Right - Source */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={true}
        className={`
          !w-4 !h-4 !bg-zinc-600
          !border-2 !border-zinc-400
          hover:!bg-blue-500 hover:!border-blue-400
          !cursor-crosshair
          transition-colors
        `}
        style={{ right: -8 }}
      />
      {/* Top - Target */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={true}
        className={`
          !w-4 !h-4 !bg-zinc-600
          !border-2 !border-zinc-400
          hover:!bg-blue-500 hover:!border-blue-400
          !cursor-crosshair
          transition-colors
        `}
        style={{ top: -8 }}
      />
      {/* Bottom - Source */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={true}
        className={`
          !w-4 !h-4 !bg-zinc-600
          !border-2 !border-zinc-400
          hover:!bg-blue-500 hover:!border-blue-400
          !cursor-crosshair
          transition-colors
        `}
        style={{ bottom: -8 }}
      />
    </motion.div>
  );
}, arePropsEqual);
