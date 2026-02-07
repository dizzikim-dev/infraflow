'use client';

import { memo, useMemo, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { FlowCanvas } from '@/components/shared';
import { PanelState, DiffResult } from '@/hooks/useComparisonMode';
import { InfraNodeData, isInfraNodeData } from '@/types';

interface ComparisonPanelProps {
  side: 'left' | 'right';
  panel: PanelState;
  diff: DiffResult;
  showDiff: boolean;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDataUpdate?: (nodeId: string, field: 'label' | 'description', value: string) => void;
}

/**
 * Individual comparison panel with diff visualization
 */
export const ComparisonPanel = memo(function ComparisonPanel({
  side,
  panel,
  diff,
  showDiff,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDataUpdate,
}: ComparisonPanelProps) {
  // Apply diff styling to nodes
  const styledNodes = useMemo(() => {
    if (!showDiff) return panel.nodes;

    return panel.nodes.map((node) => {
      let diffStyle = {};

      if (side === 'right') {
        // Right panel: show added and modified nodes
        if (diff.addedNodes.includes(node.id)) {
          diffStyle = {
            style: {
              ...node.style,
              boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.6), 0 0 12px rgba(34, 197, 94, 0.3)',
            },
            className: `${node.className || ''} diff-added`,
          };
        } else if (diff.modifiedNodes.includes(node.id)) {
          diffStyle = {
            style: {
              ...node.style,
              boxShadow: '0 0 0 2px rgba(234, 179, 8, 0.6), 0 0 12px rgba(234, 179, 8, 0.3)',
            },
            className: `${node.className || ''} diff-modified`,
          };
        }
      } else {
        // Left panel: show removed nodes
        if (diff.removedNodes.includes(node.id)) {
          diffStyle = {
            style: {
              ...node.style,
              boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.6), 0 0 12px rgba(239, 68, 68, 0.3)',
              opacity: 0.7,
            },
            className: `${node.className || ''} diff-removed`,
          };
        } else if (diff.modifiedNodes.includes(node.id)) {
          diffStyle = {
            style: {
              ...node.style,
              boxShadow: '0 0 0 2px rgba(234, 179, 8, 0.6), 0 0 12px rgba(234, 179, 8, 0.3)',
            },
            className: `${node.className || ''} diff-modified`,
          };
        }
      }

      return {
        ...node,
        ...diffStyle,
      };
    });
  }, [panel.nodes, diff, showDiff, side]);

  // Apply diff styling to edges
  const styledEdges = useMemo(() => {
    if (!showDiff) return panel.edges;

    return panel.edges.map((edge) => {
      let diffStyle = {};

      if (side === 'right' && diff.addedEdges.includes(edge.id)) {
        diffStyle = {
          style: {
            ...edge.style,
            stroke: 'rgba(34, 197, 94, 0.8)',
            strokeWidth: 2,
          },
          animated: true,
        };
      } else if (side === 'left' && diff.removedEdges.includes(edge.id)) {
        diffStyle = {
          style: {
            ...edge.style,
            stroke: 'rgba(239, 68, 68, 0.8)',
            strokeWidth: 2,
            strokeDasharray: '5,5',
          },
        };
      }

      return {
        ...edge,
        ...diffStyle,
      };
    });
  }, [panel.edges, diff, showDiff, side]);

  return (
    <div className="relative flex-1 h-full flex flex-col">
      {/* Panel Header */}
      <div className={`
        flex items-center justify-between px-4 py-2 border-b
        ${side === 'left' ? 'border-r border-zinc-700' : ''}
        bg-zinc-800/50
      `}>
        <div className="flex items-center gap-2">
          <span className={`
            w-2 h-2 rounded-full
            ${side === 'left' ? 'bg-blue-500' : 'bg-purple-500'}
          `} />
          <span className="text-sm font-medium text-zinc-200">
            {panel.label}
          </span>
        </div>

        {showDiff && (
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {side === 'right' ? (
              <>
                {diff.addedNodes.length > 0 && (
                  <span className="text-green-400">+{diff.addedNodes.length}</span>
                )}
                {diff.modifiedNodes.length > 0 && (
                  <span className="text-yellow-400">~{diff.modifiedNodes.length}</span>
                )}
              </>
            ) : (
              <>
                {diff.removedNodes.length > 0 && (
                  <span className="text-red-400">-{diff.removedNodes.length}</span>
                )}
                {diff.modifiedNodes.length > 0 && (
                  <span className="text-yellow-400">~{diff.modifiedNodes.length}</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <FlowCanvas
          initialNodes={styledNodes}
          initialEdges={styledEdges}
          onNodeClick={onNodeClick}
          onNodeDataUpdate={onNodeDataUpdate}
        />

        {/* Empty state */}
        {panel.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 pointer-events-none">
            <div className="text-center text-zinc-500">
              <p className="text-sm">다이어그램이 없습니다</p>
              <p className="text-xs mt-1">프롬프트를 입력하여 생성하세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ComparisonPanel;
