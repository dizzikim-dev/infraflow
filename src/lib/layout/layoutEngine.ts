import { Node, Edge } from '@xyflow/react';
import { InfraSpec, InfraNodeData, InfraEdgeData, InfraNodeType } from '@/types';
import { isInfraNodeData } from '@/types/guards';
import { infrastructureDB, tierOrder } from '@/lib/data';

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
  nodeWidth: 160,
  nodeHeight: 80,
  horizontalGap: 220,  // 티어 간 가로 간격
  verticalGap: 100,    // 같은 티어 내 세로 간격
  tierGap: 280,        // 티어 영역 간 간격
  startX: 150,
  startY: 150,
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

// Get category from node type
function getCategoryFromType(type: InfraNodeType): InfraNodeData['category'] {
  const categoryMap: Record<string, InfraNodeData['category']> = {
    firewall: 'security',
    waf: 'security',
    'ids-ips': 'security',
    'vpn-gateway': 'security',
    nac: 'security',
    dlp: 'security',
    router: 'network',
    'switch-l2': 'network',
    'switch-l3': 'network',
    'load-balancer': 'network',
    'sd-wan': 'network',
    dns: 'network',
    cdn: 'network',
    'web-server': 'compute',
    'app-server': 'compute',
    'db-server': 'compute',
    container: 'compute',
    vm: 'compute',
    kubernetes: 'compute',
    'aws-vpc': 'cloud',
    'azure-vnet': 'cloud',
    'gcp-network': 'cloud',
    'private-cloud': 'cloud',
    'san-nas': 'storage',
    'object-storage': 'storage',
    backup: 'storage',
    cache: 'storage',
    storage: 'storage',
    'ldap-ad': 'auth',
    sso: 'auth',
    mfa: 'auth',
    iam: 'auth',
    user: 'external',
    internet: 'external',
  };
  return categoryMap[type] || 'external';
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

  // 타입 기반 기본 티어
  const typeTierMap: Record<string, typeof tierOrder[number]> = {
    // External
    user: 'external',
    internet: 'external',

    // DMZ
    cdn: 'dmz',
    waf: 'dmz',
    firewall: 'dmz',
    'load-balancer': 'dmz',
    'vpn-gateway': 'dmz',
    'ids-ips': 'dmz',
    'sd-wan': 'dmz',

    // Internal
    router: 'internal',
    'switch-l2': 'internal',
    'switch-l3': 'internal',
    'web-server': 'internal',
    'app-server': 'internal',
    container: 'internal',
    vm: 'internal',
    kubernetes: 'internal',
    dns: 'internal',
    nac: 'internal',
    dlp: 'internal',
    'ldap-ad': 'internal',
    sso: 'internal',
    mfa: 'internal',
    iam: 'internal',
    'aws-vpc': 'internal',
    'azure-vnet': 'internal',
    'gcp-network': 'internal',
    'private-cloud': 'internal',

    // Data
    'db-server': 'data',
    'san-nas': 'data',
    'object-storage': 'data',
    storage: 'data',
    backup: 'data',
    cache: 'data',
  };

  return typeTierMap[type] || 'internal';
}

/**
 * Convert InfraSpec to React Flow nodes and edges with horizontal tiered layout
 * 왼쪽→오른쪽: External → DMZ → Internal → Data
 */
export function specToFlow(
  spec: InfraSpec,
  config: Partial<LayoutConfig> = {}
): { nodes: Node[]; edges: Edge[] } {
  const cfg = { ...defaultConfig, ...config };

  // 노드를 티어별로 그룹화
  const tierGroups: Record<string, Array<{ id: string; type: InfraNodeType; label: string; zone?: string }>> = {
    external: [],
    dmz: [],
    internal: [],
    data: [],
  };

  for (const node of spec.nodes) {
    const tier = getTierForNode(node.type, node.zone);
    tierGroups[tier].push(node);
  }

  // 연결 그래프 구축 (같은 티어 내 순서 결정용)
  const adjacency = new Map<string, string[]>();
  const reverseAdjacency = new Map<string, string[]>();

  for (const conn of spec.connections) {
    const sourceAdj = adjacency.get(conn.source);
    if (sourceAdj) {
      sourceAdj.push(conn.target);
    } else {
      adjacency.set(conn.source, [conn.target]);
    }

    const targetRevAdj = reverseAdjacency.get(conn.target);
    if (targetRevAdj) {
      targetRevAdj.push(conn.source);
    } else {
      reverseAdjacency.set(conn.target, [conn.source]);
    }
  }

  // 각 티어 내에서 노드 순서 결정 (연결된 노드들 가까이 배치)
  const sortNodesInTier = (nodes: typeof tierGroups.external) => {
    if (nodes.length <= 1) return nodes;

    // 연결이 많은 노드부터 배치
    return [...nodes].sort((a, b) => {
      const aConnections = (adjacency.get(a.id)?.length || 0) + (reverseAdjacency.get(a.id)?.length || 0);
      const bConnections = (adjacency.get(b.id)?.length || 0) + (reverseAdjacency.get(b.id)?.length || 0);
      return bConnections - aConnections;
    });
  };

  // 각 티어 내 노드 정렬
  for (const tier of tierOrder) {
    tierGroups[tier] = sortNodesInTier(tierGroups[tier]);
  }

  // 위치 계산 (가로: 티어별, 세로: 티어 내 인덱스)
  const nodePositions = new Map<string, { x: number; y: number }>();

  let currentX = cfg.startX;

  for (const tier of tierOrder) {
    const nodes = tierGroups[tier];
    if (nodes.length === 0) continue;

    // 티어 내 노드들의 총 높이 계산
    const totalHeight = (nodes.length - 1) * cfg.verticalGap;
    const startY = cfg.startY + 100; // 상단 여백

    nodes.forEach((node, index) => {
      // 세로 중앙 정렬
      const offsetY = nodes.length > 1
        ? (index - (nodes.length - 1) / 2) * cfg.verticalGap
        : 0;

      nodePositions.set(node.id, {
        x: currentX,
        y: startY + 150 + offsetY, // 전체 다이어그램 세로 중앙
      });
    });

    // 다음 티어로 이동
    currentX += cfg.tierGap;
  }

  // React Flow 노드 생성
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

  // React Flow 엣지 생성
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
