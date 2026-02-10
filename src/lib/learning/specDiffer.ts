/**
 * Spec Differ — Pure function to compute structural diffs between InfraSpecs
 *
 * Compares original AI-generated spec with user-modified spec to extract
 * learning signals: node additions/removals, connection changes, tier corrections.
 */

import type { InfraSpec, InfraNodeSpec, ConnectionSpec } from '@/types/infra';
import type { SpecDiff, SpecDiffOperation, PlacementChange } from './types';

/**
 * Compute the structural diff between an original spec and a modified spec.
 * Pure function — no side effects.
 */
export function computeSpecDiff(original: InfraSpec, modified: InfraSpec): SpecDiff {
  const operations: SpecDiffOperation[] = [];
  const placementChanges: PlacementChange[] = [];

  // Build lookup maps by node ID
  const originalNodes = new Map<string, InfraNodeSpec>();
  const modifiedNodes = new Map<string, InfraNodeSpec>();

  for (const node of original.nodes) {
    originalNodes.set(node.id, node);
  }
  for (const node of modified.nodes) {
    modifiedNodes.set(node.id, node);
  }

  let nodesAdded = 0;
  let nodesRemoved = 0;
  let nodesModified = 0;

  // Find removed nodes (in original but not in modified)
  for (const [id, node] of originalNodes) {
    if (!modifiedNodes.has(id)) {
      operations.push({
        type: 'remove-node',
        nodeId: id,
        nodeType: node.type,
      });
      nodesRemoved++;
    }
  }

  // Find added and modified nodes
  for (const [id, modNode] of modifiedNodes) {
    const origNode = originalNodes.get(id);

    if (!origNode) {
      // Added node
      operations.push({
        type: 'add-node',
        nodeId: id,
        nodeType: modNode.type,
      });
      nodesAdded++;
    } else {
      // Check for modifications
      const changes = diffNode(origNode, modNode);
      if (changes.length > 0) {
        for (const change of changes) {
          operations.push(change);
        }
        nodesModified++;
      }

      // Check for placement changes
      if (origNode.tier !== modNode.tier) {
        placementChanges.push({
          nodeId: id,
          nodeType: modNode.type,
          originalTier: origNode.tier,
          newTier: modNode.tier,
          moved: true,
        });
      }
    }
  }

  // Diff connections
  const { added: connsAdded, removed: connsRemoved, ops: connOps } = diffConnections(
    original.connections,
    modified.connections
  );
  operations.push(...connOps);

  return {
    operations,
    nodesAdded,
    nodesRemoved,
    nodesModified,
    connectionsAdded: connsAdded,
    connectionsRemoved: connsRemoved,
    placementChanges,
  };
}

/**
 * Compare two nodes and return diff operations for changed fields.
 */
function diffNode(original: InfraNodeSpec, modified: InfraNodeSpec): SpecDiffOperation[] {
  const ops: SpecDiffOperation[] = [];
  const fields: (keyof InfraNodeSpec)[] = ['type', 'label', 'tier', 'zone', 'description'];

  for (const field of fields) {
    if (original[field] !== modified[field]) {
      ops.push({
        type: 'modify-node',
        nodeId: modified.id,
        nodeType: modified.type,
        field,
        oldValue: original[field],
        newValue: modified[field],
      });
    }
  }

  return ops;
}

/**
 * Build a connection key for comparison.
 */
function connectionKey(conn: ConnectionSpec): string {
  return `${conn.source}→${conn.target}`;
}

/**
 * Diff two connection arrays.
 */
function diffConnections(
  original: ConnectionSpec[],
  modified: ConnectionSpec[]
): { added: number; removed: number; ops: SpecDiffOperation[] } {
  const ops: SpecDiffOperation[] = [];
  const origMap = new Map<string, ConnectionSpec>();
  const modMap = new Map<string, ConnectionSpec>();

  for (const conn of original) {
    origMap.set(connectionKey(conn), conn);
  }
  for (const conn of modified) {
    modMap.set(connectionKey(conn), conn);
  }

  let added = 0;
  let removed = 0;

  // Find removed connections
  for (const [key, conn] of origMap) {
    if (!modMap.has(key)) {
      ops.push({
        type: 'remove-connection',
        source: conn.source,
        target: conn.target,
      });
      removed++;
    }
  }

  // Find added connections
  for (const [key, conn] of modMap) {
    if (!origMap.has(key)) {
      ops.push({
        type: 'add-connection',
        source: conn.source,
        target: conn.target,
      });
      added++;
    } else {
      // Check for modifications (flowType, label changes)
      const orig = origMap.get(key)!;
      if (orig.flowType !== conn.flowType || orig.label !== conn.label) {
        ops.push({
          type: 'modify-connection',
          source: conn.source,
          target: conn.target,
          field: 'flowType',
          oldValue: orig.flowType,
          newValue: conn.flowType,
        });
      }
    }
  }

  return { added, removed, ops };
}

/**
 * Check if a spec has been meaningfully modified from the original.
 * Returns true if there are any structural changes (not just cosmetic).
 */
export function hasSignificantChanges(diff: SpecDiff): boolean {
  return (
    diff.nodesAdded > 0 ||
    diff.nodesRemoved > 0 ||
    diff.nodesModified > 0 ||
    diff.connectionsAdded > 0 ||
    diff.connectionsRemoved > 0
  );
}

/**
 * Compute a simple "modification score" (0-1) indicating how much was changed.
 */
export function computeModificationScore(diff: SpecDiff, originalNodeCount: number): number {
  if (originalNodeCount === 0) return 0;

  const totalChanges =
    diff.nodesAdded + diff.nodesRemoved + diff.nodesModified +
    diff.connectionsAdded + diff.connectionsRemoved;

  // Normalize: a change count equal to the original node count = 1.0
  return Math.min(1, totalChanges / Math.max(1, originalNodeCount));
}
