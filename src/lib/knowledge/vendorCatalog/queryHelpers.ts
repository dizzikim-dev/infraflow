/**
 * Vendor Catalog — Tree traversal and query utilities.
 *
 * All helpers operate on `ProductNode[]` (the root-level array) and
 * recursively traverse the tree via each node's `children` array.
 */

import type { ProductNode, CatalogStats } from './types';

// ---------------------------------------------------------------------------
// findNodeById — DFS lookup
// ---------------------------------------------------------------------------

/** Find a node by its `nodeId` anywhere in the tree (depth-first). */
export function findNodeById(
  nodes: ProductNode[],
  nodeId: string,
): ProductNode | undefined {
  for (const node of nodes) {
    if (node.nodeId === nodeId) return node;
    const found = findNodeById(node.children, nodeId);
    if (found) return found;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// getNodePath — breadcrumb trail from root to target
// ---------------------------------------------------------------------------

/** Return the path (array of nodes) from the root to the target node. */
export function getNodePath(
  nodes: ProductNode[],
  targetId: string,
): ProductNode[] {
  for (const node of nodes) {
    if (node.nodeId === targetId) return [node];
    const childPath = getNodePath(node.children, targetId);
    if (childPath.length > 0) return [node, ...childPath];
  }
  return [];
}

// ---------------------------------------------------------------------------
// getLeafNodes — nodes with empty children array
// ---------------------------------------------------------------------------

/** Return all leaf nodes (nodes whose `children` array is empty). */
export function getLeafNodes(nodes: ProductNode[]): ProductNode[] {
  const leaves: ProductNode[] = [];
  for (const node of nodes) {
    if (node.children.length === 0) {
      leaves.push(node);
    } else {
      leaves.push(...getLeafNodes(node.children));
    }
  }
  return leaves;
}

// ---------------------------------------------------------------------------
// getAllNodes — flatten the entire tree
// ---------------------------------------------------------------------------

/** Flatten every node in the tree into a single array. */
export function getAllNodes(nodes: ProductNode[]): ProductNode[] {
  const result: ProductNode[] = [];
  for (const node of nodes) {
    result.push(node);
    result.push(...getAllNodes(node.children));
  }
  return result;
}

// ---------------------------------------------------------------------------
// getNodesByDepth — nodes at a specific depth level
// ---------------------------------------------------------------------------

/** Return all nodes whose `depth` field equals the given value. */
export function getNodesByDepth(
  nodes: ProductNode[],
  depth: number,
): ProductNode[] {
  return getAllNodes(nodes).filter((n) => n.depth === depth);
}

// ---------------------------------------------------------------------------
// countLeafNodes
// ---------------------------------------------------------------------------

/** Count the total number of leaf nodes in the tree. */
export function countLeafNodes(nodes: ProductNode[]): number {
  return getLeafNodes(nodes).length;
}

// ---------------------------------------------------------------------------
// getMaxDepth
// ---------------------------------------------------------------------------

/** Return the maximum `depth` value found in the tree (0 for empty). */
export function getMaxDepth(nodes: ProductNode[]): number {
  const all = getAllNodes(nodes);
  if (all.length === 0) return 0;
  return Math.max(...all.map((n) => n.depth));
}

// ---------------------------------------------------------------------------
// searchNodes — keyword search (case-insensitive)
// ---------------------------------------------------------------------------

/**
 * Search all nodes for a keyword (case-insensitive).
 * Matches against `name`, `nameKo`, `nodeId`, `description`, and `descriptionKo`.
 */
export function searchNodes(
  nodes: ProductNode[],
  query: string,
): ProductNode[] {
  if (!query) return [];
  const lower = query.toLowerCase();
  return getAllNodes(nodes).filter((node) => {
    return (
      node.name.toLowerCase().includes(lower) ||
      node.nameKo.toLowerCase().includes(lower) ||
      node.nodeId.toLowerCase().includes(lower) ||
      node.description.toLowerCase().includes(lower) ||
      node.descriptionKo.toLowerCase().includes(lower)
    );
  });
}

// ---------------------------------------------------------------------------
// computeStats — aggregate statistics for a product tree
// ---------------------------------------------------------------------------

/** Compute catalog statistics from a root-level product node array. */
export function computeStats(products: ProductNode[]): CatalogStats {
  const all = getAllNodes(products);
  return {
    totalProducts: all.length,
    maxDepth: getMaxDepth(products),
    categoriesCount: products.length,
  };
}
