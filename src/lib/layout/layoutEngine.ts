import { Node, Edge } from '@xyflow/react';
import { InfraSpec, InfraNodeData, InfraEdgeData, InfraNodeType } from '@/types';
import { isInfraNodeData } from '@/types/guards';
import { infrastructureDB, tierOrder, getCategoryForType, getTierForType } from '@/lib/data';

export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalGap: number;
  verticalGap: number;
  tierGap: number;
  startX: number;
  startY: number;
}

const defaultConfig: LayoutConfig = {
  nodeWidth: 180,
  nodeHeight: 90,
  horizontalGap: 260,  // 레이어 간 가로 간격
  verticalGap: 140,    // 같은 레이어 내 세로 간격
  tierGap: 260,        // alias (backward compat)
  startX: 100,
  startY: 100,
};

// Map InfraNodeType to React Flow node type
function getNodeType(infraType: InfraNodeType): string {
  const typeMap: Record<string, string> = {
    'web-server': 'webServer',
    'app-server': 'appServer',
    'db-server': 'dbServer',
    'load-balancer': 'load-balancer',
    'switch-l2': 'switch-l2',
    'switch-l3': 'switch-l3',
    'vpn-gateway': 'vpn-gateway',
    'ids-ips': 'ids-ips',
    'san-nas': 'storage',
    'object-storage': 'storage',
    'ldap-ad': 'ldap',
    'aws-vpc': 'aws-vpc',
    'azure-vnet': 'azure-vnet',
    'gcp-network': 'aws-vpc',
    'private-cloud': 'aws-vpc',
  };
  return typeMap[infraType] || infraType;
}

// Get category from node type (delegates to SSoT in infrastructureDB)
function getCategoryFromType(type: InfraNodeType): InfraNodeData['category'] {
  return getCategoryForType(type);
}

// Get tier for a node type (for horizontal layout)
function getTierForNode(type: InfraNodeType, zone?: string): typeof tierOrder[number] {
  // Zone이 명시되어 있으면 존 기반으로 티어 결정
  if (zone) {
    const zoneToTier: Record<string, typeof tierOrder[number]> = {
      'external': 'external',
      'internet': 'external',
      'dmz': 'dmz',
      'gateway': 'dmz',
      'security': 'dmz',
      'access': 'dmz',
      'edge': 'dmz',
      'internal': 'internal',
      'app': 'internal',
      'web': 'internal',
      'services': 'internal',
      'vdi': 'internal',
      'processing': 'internal',
      'workload': 'internal',
      'data': 'data',
      'db': 'data',
      'storage': 'data',
      // Telecom zone keywords (order matters: longer patterns first to avoid substring matches)
      'aggregation': 'dmz',
      'backbone': 'internal',
      'core-dc': 'internal',
      'transport': 'dmz',
      'ran': 'external',
      '국사': 'dmz',
      '백본': 'internal',
      '기지국': 'external',
    };

    const lowerZone = zone.toLowerCase();
    for (const [key, tier] of Object.entries(zoneToTier)) {
      if (lowerZone.includes(key)) {
        return tier;
      }
    }
  }

  // DB에서 기본 티어 가져오기
  const dbInfo = infrastructureDB[type];
  if (dbInfo) {
    return dbInfo.tier;
  }

  // 타입 기반 기본 티어 (SSoT: infrastructureDB via getTierForType)
  return getTierForType(type);
}

/**
 * Topological layering: assign each node a layer (column) based on
 * longest-path from source nodes. This ensures chain nodes (A→B→C)
 * are placed in consecutive columns, and fan-out (A→B1,B2) stacks vertically.
 */
function computeTopologicalLayers(
  specNodes: InfraSpec['nodes'],
  connections: InfraSpec['connections'],
): Map<string, number> {
  const nodeIds = new Set(specNodes.map(n => n.id));
  const forward = new Map<string, string[]>();
  const reverse = new Map<string, string[]>();

  for (const conn of connections) {
    if (!nodeIds.has(conn.source) || !nodeIds.has(conn.target)) continue;
    if (!forward.has(conn.source)) forward.set(conn.source, []);
    forward.get(conn.source)!.push(conn.target);
    if (!reverse.has(conn.target)) reverse.set(conn.target, []);
    reverse.get(conn.target)!.push(conn.source);
  }

  const tierLayerFallback: Record<string, number> = { external: 0, dmz: 1, internal: 2, data: 3 };

  // If no connections, fall back to tier-based layering
  if (connections.length === 0) {
    const layerMap = new Map<string, number>();
    for (const node of specNodes) {
      const tier = getTierForNode(node.type, node.zone);
      layerMap.set(node.id, tierLayerFallback[tier] ?? 0);
    }
    return layerMap;
  }

  // Root nodes = no incoming edges
  const roots = specNodes.filter(n => !reverse.has(n.id) || reverse.get(n.id)!.length === 0);

  const layerMap = new Map<string, number>();

  // BFS longest-path layering from roots
  const queue: string[] = [];
  for (const root of roots) {
    layerMap.set(root.id, 0);
    queue.push(root.id);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLayer = layerMap.get(current)!;
    for (const target of (forward.get(current) || [])) {
      const newLayer = currentLayer + 1;
      if ((layerMap.get(target) ?? -1) < newLayer) {
        layerMap.set(target, newLayer);
        queue.push(target);
      }
    }
  }

  // Handle disconnected nodes (no edges to/from main graph) — place by tier order
  for (const node of specNodes) {
    if (!layerMap.has(node.id)) {
      const tier = getTierForNode(node.type, node.zone);
      layerMap.set(node.id, tierLayerFallback[tier] ?? 0);
    }
  }

  return layerMap;
}

/**
 * Barycenter ordering: sort nodes within each layer by the average
 * Y-position of their connected nodes in the previous layer.
 * This minimizes edge crossings.
 */
function orderLayersByBarycenter(
  layers: Map<number, InfraSpec['nodes']>,
  sortedKeys: number[],
  reverse: Map<string, string[]>,
): void {
  for (let i = 1; i < sortedKeys.length; i++) {
    const layerNodes = layers.get(sortedKeys[i])!;
    const prevNodes = layers.get(sortedKeys[i - 1])!;

    // Build index lookup for previous layer
    const prevIndex = new Map<string, number>();
    prevNodes.forEach((n, idx) => prevIndex.set(n.id, idx));

    layerNodes.sort((a, b) => {
      const aParents = (reverse.get(a.id) || []).filter(p => prevIndex.has(p));
      const bParents = (reverse.get(b.id) || []).filter(p => prevIndex.has(p));

      const aCenter = aParents.length > 0
        ? aParents.reduce((sum, p) => sum + prevIndex.get(p)!, 0) / aParents.length
        : Infinity; // no parent in prev layer → push to bottom
      const bCenter = bParents.length > 0
        ? bParents.reduce((sum, p) => sum + prevIndex.get(p)!, 0) / bParents.length
        : Infinity;

      return aCenter - bCenter;
    });
  }
}

/**
 * Convert InfraSpec to React Flow nodes and edges with topological layout.
 * Nodes are placed left-to-right by their depth in the connection graph.
 * Same-depth nodes are stacked vertically and ordered to minimize edge crossings.
 */
export function specToFlow(
  spec: InfraSpec,
  config: Partial<LayoutConfig> = {}
): { nodes: Node[]; edges: Edge[] } {
  const cfg = { ...defaultConfig, ...config };

  if (spec.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  // --- Step 1: Build adjacency ---
  const nodeIds = new Set(spec.nodes.map(n => n.id));
  const reverse = new Map<string, string[]>();
  for (const conn of spec.connections) {
    if (!nodeIds.has(conn.source) || !nodeIds.has(conn.target)) continue;
    if (!reverse.has(conn.target)) reverse.set(conn.target, []);
    reverse.get(conn.target)!.push(conn.source);
  }

  // --- Step 2: Topological layering ---
  const layerMap = computeTopologicalLayers(spec.nodes, spec.connections);

  // Group nodes by layer
  const layers = new Map<number, typeof spec.nodes>();
  for (const node of spec.nodes) {
    const layer = layerMap.get(node.id) ?? 0;
    if (!layers.has(layer)) layers.set(layer, []);
    layers.get(layer)!.push(node);
  }

  const sortedLayerKeys = [...layers.keys()].sort((a, b) => a - b);

  // --- Step 3: Minimize edge crossings (barycenter) ---
  orderLayersByBarycenter(layers, sortedLayerKeys, reverse);

  // --- Step 4: Position calculation ---
  const maxInLayer = Math.max(...[...layers.values()].map(l => l.length), 1);
  const centerY = cfg.startY + ((maxInLayer - 1) * cfg.verticalGap) / 2;

  const nodePositions = new Map<string, { x: number; y: number }>();

  sortedLayerKeys.forEach((_, colIndex) => {
    const layerKey = sortedLayerKeys[colIndex];
    const layerNodes = layers.get(layerKey)!;
    const layerHeight = (layerNodes.length - 1) * cfg.verticalGap;
    const layerStartY = centerY - layerHeight / 2;

    layerNodes.forEach((node, rowIndex) => {
      nodePositions.set(node.id, {
        x: cfg.startX + colIndex * cfg.horizontalGap,
        y: layerStartY + rowIndex * cfg.verticalGap,
      });
    });
  });

  // --- Step 5: Create React Flow nodes ---
  const nodes: Node[] = spec.nodes.map((infraNode) => {
    const position = nodePositions.get(infraNode.id) || { x: cfg.startX, y: cfg.startY };
    const tier = getTierForNode(infraNode.type, infraNode.zone);

    return {
      id: infraNode.id,
      type: getNodeType(infraNode.type),
      position,
      data: {
        label: infraNode.label,
        category: getCategoryFromType(infraNode.type),
        nodeType: infraNode.type,
        description: infraNode.description,
        tier,
        zone: infraNode.zone,
      } as InfraNodeData,
    };
  });

  // --- Step 6: Create React Flow edges ---
  const edges: Edge[] = spec.connections.map((conn, index) => ({
    id: `e-${conn.source}-${conn.target}-${index}`,
    source: conn.source,
    target: conn.target,
    type: 'animated',
    data: {
      flowType: conn.flowType || 'request',
      label: conn.label,
      animated: true,
    } as InfraEdgeData,
  }));

  return { nodes, edges };
}

/**
 * Convert React Flow nodes and edges back to InfraSpec
 */
export function flowToSpec(nodes: Node[], edges: Edge[]): InfraSpec {
  return {
    nodes: nodes.map((n) => {
      if (isInfraNodeData(n.data)) {
        return {
          id: n.id,
          type: n.data.nodeType,
          label: n.data.label,
          tier: n.data.tier,
          zone: typeof n.data.zone === 'string' ? n.data.zone : undefined,
          description: n.data.description,
        };
      }
      // Fallback for nodes without proper data
      return {
        id: n.id,
        type: (n.type as InfraNodeType) || 'user',
        label: n.id,
      };
    }),
    connections: edges.map((e) => ({
      source: e.source,
      target: e.target,
      flowType: (e.data as InfraEdgeData)?.flowType,
      label: (e.data as InfraEdgeData)?.label,
    })),
  };
}

/**
 * Re-layout existing nodes maintaining connections
 */
export function relayoutNodes(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): Node[] {
  // Build connection map
  const connections = edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  // Create a mock spec to reuse layout logic
  const spec: InfraSpec = {
    nodes: nodes.map((n) => {
      // Use type guard for safe data extraction
      if (isInfraNodeData(n.data)) {
        return {
          id: n.id,
          type: n.data.nodeType,
          label: n.data.label,
          zone: typeof n.data.zone === 'string' ? n.data.zone : undefined,
        };
      }
      // Fallback for nodes without proper data
      return {
        id: n.id,
        type: 'user' as InfraNodeType,
        label: n.id,
        zone: undefined,
      };
    }),
    connections,
  };

  const { nodes: layoutedNodes } = specToFlow(spec, config);

  // Merge positions with existing node data
  return nodes.map((node) => {
    const layoutedNode = layoutedNodes.find((n) => n.id === node.id);
    return layoutedNode
      ? { ...node, position: layoutedNode.position }
      : node;
  });
}

/**
 * Get tier label for display
 */
export function getTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    external: '외부 (External)',
    dmz: 'DMZ',
    internal: '내부망 (Internal)',
    data: '데이터 (Data)',
  };
  return labels[tier] || tier;
}
