/**
 * Diff Applier - Applies LLM operations to InfraSpec
 */

import type {
  InfraSpec,
  InfraNodeSpec,
  ConnectionSpec,
  InfraNodeType,
  TierType,
  EdgeFlowType,
} from '@/types/infra';
import { nanoid } from 'nanoid';
import { inferTier } from './contextBuilder';
import { getLabelForType } from '@/lib/data';

// Operation types
export interface ReplaceOperation {
  type: 'replace';
  target: string;
  data: {
    newType: InfraNodeType;
    label?: string;
    description?: string;
    preserveConnections?: boolean;
  };
}

export interface AddOperation {
  type: 'add';
  target: string; // Node type to add
  data: {
    label?: string;
    description?: string;
    tier?: TierType;
    afterNode?: string;
    beforeNode?: string;
    betweenNodes?: [string, string];
  };
}

export interface RemoveOperation {
  type: 'remove';
  target: string;
}

export interface ModifyOperation {
  type: 'modify';
  target: string;
  data: {
    label?: string;
    description?: string;
    tier?: TierType;
  };
}

export interface ConnectOperation {
  type: 'connect';
  data: {
    source: string;
    target: string;
    flowType?: EdgeFlowType;
    label?: string;
  };
}

export interface DisconnectOperation {
  type: 'disconnect';
  data: {
    source: string;
    target: string;
  };
}

export type Operation =
  | ReplaceOperation
  | AddOperation
  | RemoveOperation
  | ModifyOperation
  | ConnectOperation
  | DisconnectOperation;

export interface ApplyResult {
  success: boolean;
  newSpec: InfraSpec;
  appliedOps: number;
  errors: string[];
  nodeIdMappings: Map<string, string>; // oldId -> newId for replaced nodes
}

/**
 * Apply operations to an InfraSpec
 */
export function applyOperations(currentSpec: InfraSpec, operations: Operation[]): ApplyResult {
  // Deep clone the spec
  let spec: InfraSpec = JSON.parse(JSON.stringify(currentSpec));
  const errors: string[] = [];
  let appliedOps = 0;
  const nodeIdMappings = new Map<string, string>();

  for (const op of operations) {
    try {
      switch (op.type) {
        case 'replace':
          spec = applyReplace(spec, op, nodeIdMappings);
          appliedOps++;
          break;
        case 'add':
          spec = applyAdd(spec, op);
          appliedOps++;
          break;
        case 'remove':
          spec = applyRemove(spec, op);
          appliedOps++;
          break;
        case 'modify':
          spec = applyModify(spec, op);
          appliedOps++;
          break;
        case 'connect':
          spec = applyConnect(spec, op);
          appliedOps++;
          break;
        case 'disconnect':
          spec = applyDisconnect(spec, op);
          appliedOps++;
          break;
        default:
          errors.push(`Unknown operation type: ${(op as Operation).type}`);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    success: errors.length === 0,
    newSpec: spec,
    appliedOps,
    errors,
    nodeIdMappings,
  };
}

/**
 * Find node by ID or type
 */
function findNode(
  spec: InfraSpec,
  target: string
): { node: InfraNodeSpec; index: number } | null {
  // First try to find by exact ID
  let index = spec.nodes.findIndex((n) => n.id === target);

  // If not found, try to find by type (first match)
  if (index === -1) {
    index = spec.nodes.findIndex((n) => n.type === target);
  }

  // If still not found, try partial ID match
  if (index === -1) {
    index = spec.nodes.findIndex(
      (n) => n.id.includes(target) || n.type.includes(target)
    );
  }

  if (index === -1) {
    return null;
  }

  return { node: spec.nodes[index], index };
}

/**
 * Apply replace operation
 */
function applyReplace(
  spec: InfraSpec,
  op: ReplaceOperation,
  nodeIdMappings: Map<string, string>
): InfraSpec {
  const found = findNode(spec, op.target);

  if (!found) {
    throw new Error(`노드를 찾을 수 없습니다: ${op.target}`);
  }

  const { node: oldNode, index } = found;
  const newNodeId = `${op.data.newType}-${nanoid(8)}`;

  // Create new node with preserved properties
  const newNode: InfraNodeSpec = {
    id: newNodeId,
    type: op.data.newType,
    label: op.data.label || formatLabel(op.data.newType),
    tier: oldNode.tier || inferTier(op.data.newType),
    zone: oldNode.zone,
    description: op.data.description || oldNode.description,
  };

  // Replace node in spec
  spec.nodes[index] = newNode;

  // Track the ID mapping
  nodeIdMappings.set(oldNode.id, newNodeId);

  // Update connections if preserveConnections is true (default)
  if (op.data.preserveConnections !== false) {
    spec.connections = spec.connections.map((conn) => ({
      ...conn,
      source: conn.source === oldNode.id ? newNodeId : conn.source,
      target: conn.target === oldNode.id ? newNodeId : conn.target,
    }));
  } else {
    // Remove connections to/from old node
    spec.connections = spec.connections.filter(
      (conn) => conn.source !== oldNode.id && conn.target !== oldNode.id
    );
  }

  return spec;
}

/**
 * Apply add operation
 */
function applyAdd(spec: InfraSpec, op: AddOperation): InfraSpec {
  const newNodeId = `${op.target}-${nanoid(8)}`;
  const nodeType = op.target as InfraNodeType;

  // Create new node
  const newNode: InfraNodeSpec = {
    id: newNodeId,
    type: nodeType,
    label: op.data.label || formatLabel(op.target),
    tier: op.data.tier || inferTier(op.target),
    description: op.data.description,
  };

  spec.nodes.push(newNode);

  // Handle positioning with connections
  if (op.data.betweenNodes) {
    const [sourceId, targetId] = op.data.betweenNodes;

    // Remove existing connection between source and target
    spec.connections = spec.connections.filter(
      (c) => !(c.source === sourceId && c.target === targetId)
    );

    // Add new connections: source -> new -> target
    spec.connections.push(
      { source: sourceId, target: newNodeId, flowType: 'request' },
      { source: newNodeId, target: targetId, flowType: 'request' }
    );
  } else {
    // afterNode: create connection from afterNode to new node
    if (op.data.afterNode) {
      const afterFound = findNode(spec, op.data.afterNode);
      if (afterFound) {
        spec.connections.push({
          source: afterFound.node.id,
          target: newNodeId,
          flowType: 'request',
        });
      }
    }

    // beforeNode: create connection from new node to beforeNode
    if (op.data.beforeNode) {
      const beforeFound = findNode(spec, op.data.beforeNode);
      if (beforeFound) {
        spec.connections.push({
          source: newNodeId,
          target: beforeFound.node.id,
          flowType: 'request',
        });
      }
    }
  }

  return spec;
}

/**
 * Apply remove operation
 */
function applyRemove(spec: InfraSpec, op: RemoveOperation): InfraSpec {
  const found = findNode(spec, op.target);

  if (!found) {
    throw new Error(`노드를 찾을 수 없습니다: ${op.target}`);
  }

  const { node: nodeToRemove } = found;

  // Remove node
  spec.nodes = spec.nodes.filter((n) => n.id !== nodeToRemove.id);

  // Remove connections to/from this node
  spec.connections = spec.connections.filter(
    (conn) => conn.source !== nodeToRemove.id && conn.target !== nodeToRemove.id
  );

  return spec;
}

/**
 * Apply modify operation
 */
function applyModify(spec: InfraSpec, op: ModifyOperation): InfraSpec {
  const found = findNode(spec, op.target);

  if (!found) {
    throw new Error(`노드를 찾을 수 없습니다: ${op.target}`);
  }

  const { index } = found;

  // Update node properties
  spec.nodes[index] = {
    ...spec.nodes[index],
    ...(op.data.label && { label: op.data.label }),
    ...(op.data.description && { description: op.data.description }),
    ...(op.data.tier && { tier: op.data.tier }),
  };

  return spec;
}

/**
 * Apply connect operation
 */
function applyConnect(spec: InfraSpec, op: ConnectOperation): InfraSpec {
  const sourceFound = findNode(spec, op.data.source);
  const targetFound = findNode(spec, op.data.target);

  if (!sourceFound) {
    throw new Error(`소스 노드를 찾을 수 없습니다: ${op.data.source}`);
  }

  if (!targetFound) {
    throw new Error(`타겟 노드를 찾을 수 없습니다: ${op.data.target}`);
  }

  // Check if connection already exists
  const exists = spec.connections.some(
    (c) => c.source === sourceFound.node.id && c.target === targetFound.node.id
  );

  if (exists) {
    // Connection already exists, skip
    return spec;
  }

  // Add new connection
  const newConnection: ConnectionSpec = {
    source: sourceFound.node.id,
    target: targetFound.node.id,
    flowType: op.data.flowType || 'request',
    label: op.data.label,
  };

  spec.connections.push(newConnection);

  return spec;
}

/**
 * Apply disconnect operation
 */
function applyDisconnect(spec: InfraSpec, op: DisconnectOperation): InfraSpec {
  const sourceFound = findNode(spec, op.data.source);
  const targetFound = findNode(spec, op.data.target);

  if (!sourceFound || !targetFound) {
    // If nodes not found, try to remove by ID directly
    spec.connections = spec.connections.filter(
      (c) =>
        !(
          (c.source === op.data.source || c.source.includes(op.data.source)) &&
          (c.target === op.data.target || c.target.includes(op.data.target))
        )
    );
    return spec;
  }

  // Remove connection
  spec.connections = spec.connections.filter(
    (c) => !(c.source === sourceFound.node.id && c.target === targetFound.node.id)
  );

  return spec;
}

/**
 * Format node type to human-readable label (delegates to SSoT in infrastructureDB)
 */
function formatLabel(nodeType: string): string {
  return getLabelForType(nodeType as InfraNodeType);
}
