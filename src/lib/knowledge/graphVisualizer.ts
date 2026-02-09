/**
 * Knowledge Graph Visualization Data Layer
 *
 * Transforms knowledge graph data (relationships, patterns, antipatterns, failures)
 * into React Flow-compatible nodes and edges for visualization.
 *
 * Pure TypeScript — no React imports. This is the DATA LAYER only.
 */

import type { InfraNodeType } from '@/types/infra';
import { RELATIONSHIPS } from './relationships';
import { PATTERNS } from './patterns';
import { ANTIPATTERNS } from './antipatterns';
import { FAILURES } from './failures';
import { getCategoryForType, getTierForType, getLabelForType } from '@/lib/data/infrastructureDB';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KGNodeType = 'component' | 'pattern' | 'antipattern' | 'failure';

export interface KGNode {
  id: string;
  type: KGNodeType;
  label: string;
  labelKo: string;
  category?: string;
  metadata: Record<string, unknown>;
  position: { x: number; y: number };
}

export type KGEdgeType =
  | 'requires'
  | 'recommends'
  | 'conflicts'
  | 'enhances'
  | 'protects'
  | 'detected-in'
  | 'affects';

export interface KGEdge {
  id: string;
  source: string;
  target: string;
  type: KGEdgeType;
  label: string;
  labelKo: string;
  animated: boolean;
  metadata: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: KGNode[];
  edges: KGEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    componentCount: number;
    patternCount: number;
    antipatternCount: number;
    failureCount: number;
  };
}

export interface GraphOptions {
  includeComponents?: boolean;
  includePatterns?: boolean;
  includeAntiPatterns?: boolean;
  includeFailures?: boolean;
  filterComponents?: string[];
  maxNodes?: number;
  layout?: 'radial' | 'hierarchical' | 'force';
}

// ---------------------------------------------------------------------------
// Edge type -> style mapping (frozen)
// ---------------------------------------------------------------------------

const EDGE_STYLE_MAP: Readonly<Record<KGEdgeType, { color: string; animated: boolean }>> = Object.freeze({
  requires: { color: '#3b82f6', animated: false },      // blue
  recommends: { color: '#22c55e', animated: false },     // green
  conflicts: { color: '#ef4444', animated: true },       // red
  enhances: { color: '#a855f7', animated: false },       // purple
  protects: { color: '#f59e0b', animated: false },       // amber
  'detected-in': { color: '#f97316', animated: true },   // orange
  affects: { color: '#ec4899', animated: true },          // pink
});

// ---------------------------------------------------------------------------
// Tier ordering for hierarchical layout
// ---------------------------------------------------------------------------

const TIER_Y_POSITIONS: Readonly<Record<string, number>> = Object.freeze({
  external: 0,
  dmz: 200,
  internal: 400,
  data: 600,
});

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Collect unique component types from RELATIONSHIPS.
 */
function collectUniqueComponents(): Set<InfraNodeType> {
  const types = new Set<InfraNodeType>();
  for (const rel of RELATIONSHIPS) {
    types.add(rel.source);
    types.add(rel.target);
  }
  return types;
}

/**
 * Build KGNode for an infrastructure component.
 */
function buildComponentNode(componentType: InfraNodeType): KGNode {
  const category = getCategoryForType(componentType);
  const label = getLabelForType(componentType);

  // Korean label map for common component types
  const koLabelMap: Record<string, string> = {
    firewall: '방화벽',
    waf: 'WAF',
    'ids-ips': 'IDS/IPS',
    'vpn-gateway': 'VPN 게이트웨이',
    nac: 'NAC',
    dlp: 'DLP',
    router: '라우터',
    'switch-l2': 'L2 스위치',
    'switch-l3': 'L3 스위치',
    'load-balancer': '로드 밸런서',
    dns: 'DNS',
    cdn: 'CDN',
    'sd-wan': 'SD-WAN',
    'web-server': '웹 서버',
    'app-server': '앱 서버',
    'db-server': 'DB 서버',
    container: '컨테이너',
    vm: '가상머신',
    kubernetes: 'Kubernetes',
    'aws-vpc': 'AWS VPC',
    'azure-vnet': 'Azure VNet',
    'gcp-network': 'GCP Network',
    'private-cloud': '프라이빗 클라우드',
    'san-nas': 'SAN/NAS',
    'object-storage': '오브젝트 스토리지',
    backup: '백업',
    cache: '캐시',
    'ldap-ad': 'LDAP/AD',
    sso: 'SSO',
    mfa: 'MFA',
    iam: 'IAM',
    user: '사용자',
    internet: '인터넷',
  };

  return {
    id: `comp-${componentType}`,
    type: 'component',
    label,
    labelKo: koLabelMap[componentType] || label,
    category: category as string,
    metadata: {
      componentType,
      tier: getTierForType(componentType),
    },
    position: { x: 0, y: 0 }, // Assigned by layout
  };
}

/**
 * Build KGNode for an architecture pattern.
 */
function buildPatternNode(
  pattern: (typeof PATTERNS)[number],
): KGNode {
  return {
    id: `pat-${pattern.id}`,
    type: 'pattern',
    label: pattern.name,
    labelKo: pattern.nameKo,
    category: undefined,
    metadata: {
      patternId: pattern.id,
      complexity: pattern.complexity,
      scalability: pattern.scalability,
      requiredComponents: pattern.requiredComponents.map((c) => c.type),
    },
    position: { x: 0, y: 0 },
  };
}

/**
 * Build KGNode for an antipattern.
 */
function buildAntiPatternNode(
  ap: (typeof ANTIPATTERNS)[number],
): KGNode {
  return {
    id: `ap-${ap.id}`,
    type: 'antipattern',
    label: ap.name,
    labelKo: ap.nameKo,
    category: undefined,
    metadata: {
      antipatternId: ap.id,
      severity: ap.severity,
    },
    position: { x: 0, y: 0 },
  };
}

/**
 * Build KGNode for a failure scenario.
 */
function buildFailureNode(
  failure: (typeof FAILURES)[number],
): KGNode {
  return {
    id: `fail-${failure.id}`,
    type: 'failure',
    label: failure.titleKo,
    labelKo: failure.titleKo,
    category: undefined,
    metadata: {
      failureId: failure.id,
      component: failure.component,
      impact: failure.impact,
      likelihood: failure.likelihood,
      affectedComponents: failure.affectedComponents,
    },
    position: { x: 0, y: 0 },
  };
}

// ---------------------------------------------------------------------------
// Layout algorithms
// ---------------------------------------------------------------------------

/**
 * Radial layout: place nodes in concentric circles.
 * If a centerNodeId is provided, that node is placed at origin.
 */
function applyRadialLayout(
  nodes: KGNode[],
  centerNodeId?: string,
): void {
  if (nodes.length === 0) return;

  const centerX = 400;
  const centerY = 400;

  if (centerNodeId) {
    const centerNode = nodes.find((n) => n.id === centerNodeId);
    if (centerNode) {
      centerNode.position = { x: centerX, y: centerY };
    }

    // Group remaining nodes by type for layered rings
    const remaining = nodes.filter((n) => n.id !== centerNodeId);
    const components = remaining.filter((n) => n.type === 'component');
    const others = remaining.filter((n) => n.type !== 'component');

    // Inner ring: components
    layoutCircle(components, centerX, centerY, 200);
    // Outer ring: patterns, antipatterns, failures
    layoutCircle(others, centerX, centerY, 380);
  } else {
    // Group by type: component in inner ring, others in outer
    const components = nodes.filter((n) => n.type === 'component');
    const others = nodes.filter((n) => n.type !== 'component');

    layoutCircle(components, centerX, centerY, 250);
    layoutCircle(others, centerX, centerY, 450);
  }
}

/**
 * Lay nodes in a circle around center.
 */
function layoutCircle(
  nodes: KGNode[],
  centerX: number,
  centerY: number,
  radius: number,
): void {
  if (nodes.length === 0) return;
  const angleStep = (2 * Math.PI) / nodes.length;

  for (let i = 0; i < nodes.length; i++) {
    const angle = i * angleStep - Math.PI / 2; // Start from top
    nodes[i].position = {
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    };
  }
}

/**
 * Hierarchical layout: top-to-bottom by tier (external -> dmz -> internal -> data).
 * Non-component nodes get placed in a separate column.
 */
function applyHierarchicalLayout(nodes: KGNode[]): void {
  if (nodes.length === 0) return;

  // Group component nodes by tier
  const tierGroups: Record<string, KGNode[]> = {
    external: [],
    dmz: [],
    internal: [],
    data: [],
  };
  const nonComponents: KGNode[] = [];

  for (const node of nodes) {
    if (node.type === 'component') {
      const tier = (node.metadata.tier as string) || 'internal';
      if (tier in tierGroups) {
        tierGroups[tier].push(node);
      } else {
        tierGroups['internal'].push(node);
      }
    } else {
      nonComponents.push(node);
    }
  }

  // Layout each tier row
  const xSpacing = 160;
  for (const [tier, group] of Object.entries(tierGroups)) {
    const y = TIER_Y_POSITIONS[tier] ?? 400;
    const startX = -(group.length - 1) * xSpacing / 2 + 400;
    for (let i = 0; i < group.length; i++) {
      group[i].position = {
        x: Math.round(startX + i * xSpacing),
        y,
      };
    }
  }

  // Place non-component nodes to the right
  const rightX = 900;
  const yStart = 50;
  const ySpacing = 80;
  for (let i = 0; i < nonComponents.length; i++) {
    nonComponents[i].position = {
      x: rightX,
      y: yStart + i * ySpacing,
    };
  }
}

/**
 * Simple force-directed layout simulation (limited iterations, not animated).
 */
function applyForceLayout(nodes: KGNode[], edges: KGEdge[]): void {
  if (nodes.length === 0) return;

  // Initialize positions in a grid
  const gridSize = Math.ceil(Math.sqrt(nodes.length));
  const spacing = 200;

  for (let i = 0; i < nodes.length; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    nodes[i].position = {
      x: col * spacing + 100,
      y: row * spacing + 100,
    };
  }

  // Build adjacency for attraction
  const nodeIdxMap = new Map<string, number>();
  for (let i = 0; i < nodes.length; i++) {
    nodeIdxMap.set(nodes[i].id, i);
  }

  const edgePairs: [number, number][] = [];
  for (const edge of edges) {
    const si = nodeIdxMap.get(edge.source);
    const ti = nodeIdxMap.get(edge.target);
    if (si !== undefined && ti !== undefined) {
      edgePairs.push([si, ti]);
    }
  }

  // Simulate for a few iterations
  const iterations = 50;
  const idealDist = 200;
  const repulsionStrength = 5000;
  const attractionStrength = 0.01;
  const damping = 0.9;

  const velocities: { x: number; y: number }[] = nodes.map(() => ({ x: 0, y: 0 }));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].position.x - nodes[j].position.x;
        const dy = nodes[i].position.y - nodes[j].position.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsionStrength / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        velocities[i].x += fx;
        velocities[i].y += fy;
        velocities[j].x -= fx;
        velocities[j].y -= fy;
      }
    }

    // Attraction along edges
    for (const [si, ti] of edgePairs) {
      const dx = nodes[ti].position.x - nodes[si].position.x;
      const dy = nodes[ti].position.y - nodes[si].position.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - idealDist) * attractionStrength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      velocities[si].x += fx;
      velocities[si].y += fy;
      velocities[ti].x -= fx;
      velocities[ti].y -= fy;
    }

    // Apply velocities with damping
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].position.x += velocities[i].x;
      nodes[i].position.y += velocities[i].y;
      velocities[i].x *= damping;
      velocities[i].y *= damping;
    }
  }

  // Round positions
  for (const node of nodes) {
    node.position.x = Math.round(node.position.x);
    node.position.y = Math.round(node.position.y);
  }
}

/**
 * Apply the chosen layout algorithm.
 */
function applyLayout(
  nodes: KGNode[],
  edges: KGEdge[],
  layout: 'radial' | 'hierarchical' | 'force',
  centerNodeId?: string,
): void {
  switch (layout) {
    case 'radial':
      applyRadialLayout(nodes, centerNodeId);
      break;
    case 'hierarchical':
      applyHierarchicalLayout(nodes);
      break;
    case 'force':
      applyForceLayout(nodes, edges);
      break;
  }
}

// ---------------------------------------------------------------------------
// Graph builders
// ---------------------------------------------------------------------------

function computeStats(nodes: KGNode[]): KnowledgeGraph['stats'] {
  return {
    totalNodes: nodes.length,
    totalEdges: 0, // Will be updated
    componentCount: nodes.filter((n) => n.type === 'component').length,
    patternCount: nodes.filter((n) => n.type === 'pattern').length,
    antipatternCount: nodes.filter((n) => n.type === 'antipattern').length,
    failureCount: nodes.filter((n) => n.type === 'failure').length,
  };
}

/**
 * Build a full knowledge graph with configurable options.
 */
export function buildKnowledgeGraph(options?: GraphOptions): KnowledgeGraph {
  const opts: Required<GraphOptions> = {
    includeComponents: options?.includeComponents ?? true,
    includePatterns: options?.includePatterns ?? false,
    includeAntiPatterns: options?.includeAntiPatterns ?? false,
    includeFailures: options?.includeFailures ?? false,
    filterComponents: options?.filterComponents ?? [],
    maxNodes: options?.maxNodes ?? 50,
    layout: options?.layout ?? 'radial',
  };

  const nodes: KGNode[] = [];
  const edges: KGEdge[] = [];
  const nodeIds = new Set<string>();

  // 1. Build component nodes
  if (opts.includeComponents) {
    const componentTypes = collectUniqueComponents();

    for (const compType of componentTypes) {
      // Apply component filter if specified
      if (opts.filterComponents.length > 0 && !opts.filterComponents.includes(compType)) {
        continue;
      }

      const node = buildComponentNode(compType);
      if (!nodeIds.has(node.id)) {
        nodes.push(node);
        nodeIds.add(node.id);
      }
    }

    // Build edges from relationships
    for (const rel of RELATIONSHIPS) {
      const sourceId = `comp-${rel.source}`;
      const targetId = `comp-${rel.target}`;

      // Only add edge if both nodes exist
      if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
        edges.push({
          id: `edge-${rel.id}`,
          source: sourceId,
          target: targetId,
          type: rel.relationshipType as KGEdgeType,
          label: rel.reason,
          labelKo: rel.reasonKo,
          animated: EDGE_STYLE_MAP[rel.relationshipType as KGEdgeType]?.animated ?? false,
          metadata: {
            strength: rel.strength,
            direction: rel.direction,
            confidence: rel.trust.confidence,
          },
        });
      }
    }
  }

  // 2. Build pattern nodes
  if (opts.includePatterns) {
    for (const pattern of PATTERNS) {
      const node = buildPatternNode(pattern);
      if (!nodeIds.has(node.id)) {
        nodes.push(node);
        nodeIds.add(node.id);
      }

      // Connect pattern to its required components
      for (const req of pattern.requiredComponents) {
        const compId = `comp-${req.type}`;
        if (nodeIds.has(compId)) {
          edges.push({
            id: `edge-pat-${pattern.id}-${req.type}`,
            source: node.id,
            target: compId,
            type: 'requires',
            label: `Required by ${pattern.name}`,
            labelKo: `${pattern.nameKo}에 필수`,
            animated: false,
            metadata: { minCount: req.minCount },
          });
        }
      }
    }
  }

  // 3. Build antipattern nodes
  if (opts.includeAntiPatterns) {
    for (const ap of ANTIPATTERNS) {
      const node = buildAntiPatternNode(ap);
      if (!nodeIds.has(node.id)) {
        nodes.push(node);
        nodeIds.add(node.id);
      }

      // Connect antipattern to relevant components based on tags
      // Anti-patterns reference components in their tags
      for (const tag of ap.tags) {
        const compId = `comp-${tag}`;
        if (nodeIds.has(compId)) {
          edges.push({
            id: `edge-ap-${ap.id}-${tag}`,
            source: node.id,
            target: compId,
            type: 'detected-in',
            label: `Anti-pattern: ${ap.name}`,
            labelKo: `안티패턴: ${ap.nameKo}`,
            animated: true,
            metadata: { severity: ap.severity },
          });
        }
      }
    }
  }

  // 4. Build failure nodes
  if (opts.includeFailures) {
    for (const failure of FAILURES) {
      const node = buildFailureNode(failure);
      if (!nodeIds.has(node.id)) {
        nodes.push(node);
        nodeIds.add(node.id);
      }

      // Connect failure to its primary component
      const primaryCompId = `comp-${failure.component}`;
      if (nodeIds.has(primaryCompId)) {
        edges.push({
          id: `edge-fail-${failure.id}-primary`,
          source: node.id,
          target: primaryCompId,
          type: 'affects',
          label: failure.titleKo,
          labelKo: failure.titleKo,
          animated: true,
          metadata: { impact: failure.impact, likelihood: failure.likelihood },
        });
      }

      // Connect failure to affected components
      for (const affected of failure.affectedComponents) {
        const affectedId = `comp-${affected}`;
        if (nodeIds.has(affectedId)) {
          edges.push({
            id: `edge-fail-${failure.id}-${affected}`,
            source: node.id,
            target: affectedId,
            type: 'affects',
            label: `Affected by ${failure.titleKo}`,
            labelKo: `${failure.titleKo} 영향`,
            animated: true,
            metadata: { impact: failure.impact, secondary: true },
          });
        }
      }
    }
  }

  // 5. Enforce maxNodes limit
  if (nodes.length > opts.maxNodes) {
    // Prioritize: components > patterns > failures > antipatterns
    const sorted = [...nodes].sort((a, b) => {
      const priority: Record<KGNodeType, number> = {
        component: 0,
        pattern: 1,
        failure: 2,
        antipattern: 3,
      };
      return priority[a.type] - priority[b.type];
    });
    const kept = sorted.slice(0, opts.maxNodes);
    const keptIds = new Set(kept.map((n) => n.id));

    // Filter nodes
    nodes.length = 0;
    nodes.push(...kept);

    // Filter edges to only reference existing nodes
    const validEdges = edges.filter(
      (e) => keptIds.has(e.source) && keptIds.has(e.target),
    );
    edges.length = 0;
    edges.push(...validEdges);
  }

  // 6. Apply layout
  applyLayout(nodes, edges, opts.layout);

  // 7. Build stats
  const stats = computeStats(nodes);
  stats.totalEdges = edges.length;

  return { nodes, edges, stats };
}

/**
 * Build a focused graph centered on one component.
 * Includes all direct relationships (1 hop) plus related failures/antipatterns.
 */
export function buildComponentGraph(centerComponent: string): KnowledgeGraph {
  const centerType = centerComponent as InfraNodeType;

  // Check if this component exists in any relationship
  const relatedRels = RELATIONSHIPS.filter(
    (r) => r.source === centerType || r.target === centerType,
  );

  if (relatedRels.length === 0) {
    // Unknown or unconnected component
    return {
      nodes: [],
      edges: [],
      stats: {
        totalNodes: 0,
        totalEdges: 0,
        componentCount: 0,
        patternCount: 0,
        antipatternCount: 0,
        failureCount: 0,
      },
    };
  }

  const nodes: KGNode[] = [];
  const edges: KGEdge[] = [];
  const nodeIds = new Set<string>();

  // 1. Center component node
  const centerNode = buildComponentNode(centerType);
  nodes.push(centerNode);
  nodeIds.add(centerNode.id);

  // 2. Direct relationship neighbors (1 hop)
  for (const rel of relatedRels) {
    const neighborType = rel.source === centerType ? rel.target : rel.source;
    const neighborId = `comp-${neighborType}`;

    if (!nodeIds.has(neighborId)) {
      const neighborNode = buildComponentNode(neighborType);
      nodes.push(neighborNode);
      nodeIds.add(neighborId);
    }

    edges.push({
      id: `edge-${rel.id}`,
      source: `comp-${rel.source}`,
      target: `comp-${rel.target}`,
      type: rel.relationshipType as KGEdgeType,
      label: rel.reason,
      labelKo: rel.reasonKo,
      animated: EDGE_STYLE_MAP[rel.relationshipType as KGEdgeType]?.animated ?? false,
      metadata: {
        strength: rel.strength,
        direction: rel.direction,
        confidence: rel.trust.confidence,
      },
    });
  }

  // 3. Related failure scenarios (as secondary nodes)
  const relatedFailures = FAILURES.filter(
    (f) => f.component === centerType || f.affectedComponents.includes(centerType),
  );

  for (const failure of relatedFailures) {
    const failureNode = buildFailureNode(failure);
    if (!nodeIds.has(failureNode.id)) {
      nodes.push(failureNode);
      nodeIds.add(failureNode.id);
    }

    const targetCompId = `comp-${failure.component}`;
    if (nodeIds.has(targetCompId)) {
      edges.push({
        id: `edge-fail-${failure.id}-${failure.component}`,
        source: failureNode.id,
        target: targetCompId,
        type: 'affects',
        label: failure.titleKo,
        labelKo: failure.titleKo,
        animated: true,
        metadata: { impact: failure.impact, likelihood: failure.likelihood },
      });
    }
  }

  // 4. Related antipatterns (detect by tags matching center component)
  const relatedAPs = ANTIPATTERNS.filter(
    (ap) => ap.tags.includes(centerType) || ap.tags.includes(centerType.replace(/-/g, '')),
  );

  for (const ap of relatedAPs) {
    const apNode = buildAntiPatternNode(ap);
    if (!nodeIds.has(apNode.id)) {
      nodes.push(apNode);
      nodeIds.add(apNode.id);
    }

    edges.push({
      id: `edge-ap-${ap.id}-${centerType}`,
      source: apNode.id,
      target: centerNode.id,
      type: 'detected-in',
      label: `Anti-pattern: ${ap.name}`,
      labelKo: `안티패턴: ${ap.nameKo}`,
      animated: true,
      metadata: { severity: ap.severity },
    });
  }

  // 5. Apply radial layout with center
  applyRadialLayout(nodes, centerNode.id);

  // 6. Build stats
  const stats = computeStats(nodes);
  stats.totalEdges = edges.length;

  return { nodes, edges, stats };
}

/**
 * Quick stats without building the full graph.
 */
export function getGraphStats(): KnowledgeGraph['stats'] {
  const componentTypes = collectUniqueComponents();
  return {
    totalNodes: componentTypes.size + PATTERNS.length + ANTIPATTERNS.length + FAILURES.length,
    totalEdges: RELATIONSHIPS.length,
    componentCount: componentTypes.size,
    patternCount: PATTERNS.length,
    antipatternCount: ANTIPATTERNS.length,
    failureCount: FAILURES.length,
  };
}

/**
 * Convert KnowledgeGraph to React Flow-compatible format.
 *
 * Maps KGNodeType to React Flow node types:
 * - component -> 'infraNode'
 * - pattern -> 'patternNode'
 * - antipattern -> 'antipatternNode'
 * - failure -> 'failureNode'
 *
 * Maps KGEdgeType to edge styles with colors and animation.
 */
export function toReactFlowFormat(graph: KnowledgeGraph): {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
    label?: string;
    data?: Record<string, unknown>;
    style?: Record<string, unknown>;
  }>;
} {
  const RF_NODE_TYPE_MAP: Readonly<Record<KGNodeType, string>> = Object.freeze({
    component: 'infraNode',
    pattern: 'patternNode',
    antipattern: 'antipatternNode',
    failure: 'failureNode',
  });

  const rfNodes = graph.nodes.map((node) => ({
    id: node.id,
    type: RF_NODE_TYPE_MAP[node.type],
    position: { x: node.position.x, y: node.position.y },
    data: {
      label: node.label,
      labelKo: node.labelKo,
      category: node.category,
      kgNodeType: node.type,
      ...node.metadata,
    },
  }));

  const rfEdges = graph.edges.map((edge) => {
    const style = EDGE_STYLE_MAP[edge.type] || { color: '#64748b', animated: false };

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
      animated: edge.animated || style.animated,
      label: edge.labelKo,
      data: {
        kgEdgeType: edge.type,
        ...edge.metadata,
      },
      style: {
        stroke: style.color,
        strokeWidth: edge.type === 'conflicts' ? 2 : 1,
      },
    };
  });

  return { nodes: rfNodes, edges: rfEdges };
}
