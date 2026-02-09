/**
 * Context Builder - Extracts canvas state for LLM processing
 */

import type { Node, Edge } from '@xyflow/react';
import type { InfraNodeData, TierType, InfraNodeType } from '@/types/infra';
import type { DiagramContext, NodeContext, ConnectionContext } from './prompts';
import { getTierForType } from '@/lib/data';

/**
 * Infer tier from node type (delegates to SSoT in infrastructureDB)
 */
export function inferTier(nodeType: string): TierType {
  return getTierForType(nodeType as InfraNodeType);
}

/**
 * Build context from React Flow nodes and edges
 */
export function buildContext(nodes: Node<InfraNodeData>[], edges: Edge[]): DiagramContext {
  const nodeContexts: NodeContext[] = nodes.map((node) => {
    const data = node.data;
    const nodeType = data?.nodeType || (node.type as InfraNodeType) || 'unknown';
    const category = data?.category || 'unknown';
    const tier = data?.tier || inferTier(nodeType);

    return {
      id: node.id,
      type: nodeType,
      label: data?.label || node.id,
      category: category,
      zone: tier,
      connectedTo: edges.filter((e) => e.source === node.id).map((e) => e.target),
      connectedFrom: edges.filter((e) => e.target === node.id).map((e) => e.source),
    };
  });

  const connectionContexts: ConnectionContext[] = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    label: (edge.data as { label?: string })?.label,
  }));

  return {
    nodes: nodeContexts,
    connections: connectionContexts,
    summary: generateSummary(nodeContexts),
  };
}

/**
 * Generate a summary of the diagram
 */
function generateSummary(nodes: NodeContext[]): string {
  if (nodes.length === 0) {
    return '빈 다이어그램';
  }

  // Count by category
  const categoryCounts: Record<string, number> = {};
  nodes.forEach((n) => {
    categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1;
  });

  // Count by zone
  const zoneCounts: Record<string, number> = {};
  nodes.forEach((n) => {
    zoneCounts[n.zone] = (zoneCounts[n.zone] || 0) + 1;
  });

  // Detect architecture type
  const archType = detectArchitectureType(nodes);

  // Build summary
  const categoryParts = Object.entries(categoryCounts)
    .map(([cat, count]) => `${cat}: ${count}개`)
    .join(', ');

  const zoneParts = Object.entries(zoneCounts)
    .map(([zone, count]) => `${zone}: ${count}개`)
    .join(', ');

  return `${archType} (총 ${nodes.length}개 노드) | 카테고리: ${categoryParts} | 티어: ${zoneParts}`;
}

/**
 * Detect the architecture type based on nodes
 */
function detectArchitectureType(nodes: NodeContext[]): string {
  const types = new Set(nodes.map((n) => n.type));

  // Check for common patterns
  const hasWebServer = types.has('web-server');
  const hasAppServer = types.has('app-server');
  const hasDBServer = types.has('db-server');
  const hasLoadBalancer = types.has('load-balancer');
  const hasFirewall = types.has('firewall');
  const hasWAF = types.has('waf');
  const hasKubernetes = types.has('kubernetes');
  const hasContainer = types.has('container');

  // Detect patterns
  if (hasWebServer && hasAppServer && hasDBServer) {
    return '3티어 웹 아키텍처';
  }

  if (hasKubernetes || hasContainer) {
    return '컨테이너 기반 아키텍처';
  }

  if (hasWebServer && hasDBServer && !hasAppServer) {
    return '2티어 웹 아키텍처';
  }

  if (hasLoadBalancer && (hasWebServer || hasAppServer)) {
    return '로드밸런싱 아키텍처';
  }

  if (hasFirewall || hasWAF) {
    return '보안 중심 아키텍처';
  }

  // Default
  return '인프라 다이어그램';
}

/**
 * Convert diagram context to compact string for debugging
 */
export function contextToString(context: DiagramContext): string {
  const nodeLines = context.nodes.map(
    (n) => `  ${n.id} (${n.type}) [${n.zone}] -> [${n.connectedTo.join(', ')}]`
  );

  return `Nodes:\n${nodeLines.join('\n')}\n\nSummary: ${context.summary}`;
}
