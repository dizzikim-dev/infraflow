'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node, Edge } from '@xyflow/react';
import { ComparisonToolbar } from './ComparisonToolbar';
import { ComparisonPanel } from './ComparisonPanel';
import {
  ComparisonMode,
  PanelState,
  DiffResult,
} from '@/hooks/useComparisonMode';
import { InfraSpec } from '@/types';

interface ComparisonViewProps {
  isActive: boolean;
  mode: ComparisonMode;
  leftPanel: PanelState;
  rightPanel: PanelState;
  showDiff: boolean;
  syncViewport: boolean;
  diff: DiffResult;

  // Toolbar actions
  onExit: () => void;
  onModeChange: (mode: ComparisonMode) => void;
  onSwapPanels: () => void;
  onCopyToRight: () => void;
  onCopyToLeft: () => void;
  onToggleDiff: () => void;
  onToggleSyncViewport: () => void;

  // Panel updates
  onLeftPanelUpdate?: (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => void;
  onRightPanelUpdate?: (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => void;

  // Node interactions
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDataUpdate?: (nodeId: string, field: 'label' | 'description', value: string) => void;
}

/**
 * Main comparison view with split panels
 */
export const ComparisonView = memo(function ComparisonView({
  isActive,
  mode,
  leftPanel,
  rightPanel,
  showDiff,
  syncViewport,
  diff,
  onExit,
  onModeChange,
  onSwapPanels,
  onCopyToRight,
  onCopyToLeft,
  onToggleDiff,
  onToggleSyncViewport,
  onLeftPanelUpdate,
  onRightPanelUpdate,
  onNodeClick,
  onNodeDataUpdate,
}: ComparisonViewProps) {
  // Handle left panel node data update
  const handleLeftNodeDataUpdate = useCallback(
    (nodeId: string, field: 'label' | 'description', value: string) => {
      if (onNodeDataUpdate) {
        onNodeDataUpdate(nodeId, field, value);
      }
      // Update left panel nodes
      if (onLeftPanelUpdate) {
        const updatedNodes = leftPanel.nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            };
          }
          return node;
        });
        onLeftPanelUpdate(leftPanel.spec, updatedNodes, leftPanel.edges);
      }
    },
    [leftPanel, onLeftPanelUpdate, onNodeDataUpdate]
  );

  // Handle right panel node data update
  const handleRightNodeDataUpdate = useCallback(
    (nodeId: string, field: 'label' | 'description', value: string) => {
      if (onNodeDataUpdate) {
        onNodeDataUpdate(nodeId, field, value);
      }
      // Update right panel nodes
      if (onRightPanelUpdate) {
        const updatedNodes = rightPanel.nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            };
          }
          return node;
        });
        onRightPanelUpdate(rightPanel.spec, updatedNodes, rightPanel.edges);
      }
    },
    [rightPanel, onRightPanelUpdate, onNodeDataUpdate]
  );

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-40 bg-zinc-900 flex flex-col"
        >
          {/* Toolbar */}
          <ComparisonToolbar
            mode={mode}
            showDiff={showDiff}
            syncViewport={syncViewport}
            onExit={onExit}
            onModeChange={onModeChange}
            onSwapPanels={onSwapPanels}
            onCopyToRight={onCopyToRight}
            onCopyToLeft={onCopyToLeft}
            onToggleDiff={onToggleDiff}
            onToggleSyncViewport={onToggleSyncViewport}
          />

          {/* Split Panels */}
          <div className="flex-1 flex relative" style={{ marginTop: showDiff ? '72px' : '48px' }}>
            {/* Left Panel */}
            <ComparisonPanel
              side="left"
              panel={leftPanel}
              diff={diff}
              showDiff={showDiff}
              onNodeClick={onNodeClick}
              onNodeDataUpdate={handleLeftNodeDataUpdate}
            />

            {/* Divider */}
            <div className="w-px bg-zinc-700 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-zinc-800 border border-zinc-600 rounded-full flex items-center justify-center cursor-ew-resize hover:bg-zinc-700 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="w-1 h-1 rounded-full bg-zinc-500" />
                  <div className="w-1 h-1 rounded-full bg-zinc-500" />
                  <div className="w-1 h-1 rounded-full bg-zinc-500" />
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <ComparisonPanel
              side="right"
              panel={rightPanel}
              diff={diff}
              showDiff={showDiff}
              onNodeClick={onNodeClick}
              onNodeDataUpdate={handleRightNodeDataUpdate}
            />
          </div>

          {/* Summary Bar */}
          <div className="h-8 bg-zinc-800 border-t border-zinc-700 flex items-center justify-center gap-6 text-xs text-zinc-400">
            <span>
              왼쪽: {leftPanel.nodes.length}개 노드, {leftPanel.edges.length}개 연결
            </span>
            <span className="text-zinc-600">|</span>
            <span>
              오른쪽: {rightPanel.nodes.length}개 노드, {rightPanel.edges.length}개 연결
            </span>
            {showDiff && (
              <>
                <span className="text-zinc-600">|</span>
                <span>
                  변경사항:
                  <span className="text-green-400 ml-1">+{diff.addedNodes.length}</span>
                  <span className="text-red-400 ml-1">-{diff.removedNodes.length}</span>
                  <span className="text-yellow-400 ml-1">~{diff.modifiedNodes.length}</span>
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default ComparisonView;
