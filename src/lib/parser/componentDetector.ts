/**
 * Component Detector Module
 *
 * Handles detection of infrastructure components from natural language prompts.
 */

import { nanoid } from 'nanoid';
import type { InfraSpec, InfraNodeSpec, ConnectionSpec, InfraNodeType } from '@/types';
import {
  nodeTypePatterns as defaultNodeTypePatterns,
  type NodeTypePattern,
} from './patterns';
import { getNodeTypePatternsFromRegistry } from './pluginIntegration';

/**
 * Detect all node types from text using dynamic patterns
 * Uses plugin patterns when available
 */
export function detectAllNodeTypes(text: string): NodeTypePattern[] {
  const patterns = getNodeTypePatternsFromRegistry();
  const normalized = text.toLowerCase();
  return patterns.filter((p) => p.pattern.test(normalized));
}

/**
 * Detect node types using specific patterns
 * Does not use plugin registry - for internal use
 */
export function detectNodeTypesWithPatterns(
  text: string,
  patterns: NodeTypePattern[]
): NodeTypePattern[] {
  const normalized = text.toLowerCase();
  return patterns.filter((p) => p.pattern.test(normalized));
}

/**
 * Find insertion point for new nodes based on prompt
 */
export function findInsertionPoint(
  prompt: string,
  spec: InfraSpec
): { afterNode?: string; beforeNode?: string } | null {
  const afterMatch = prompt.match(/(\w+)\s*(뒤에|다음에|after)/i);
  const beforeMatch = prompt.match(/(\w+)\s*(앞에|이전에|before)/i);

  if (afterMatch) {
    const targetType = afterMatch[1].toLowerCase();
    for (const { pattern, type } of defaultNodeTypePatterns) {
      if (pattern.test(targetType)) {
        const node = spec.nodes.find((n) => n.type === type);
        if (node) return { afterNode: node.id };
      }
    }
  }

  if (beforeMatch) {
    const targetType = beforeMatch[1].toLowerCase();
    for (const { pattern, type } of defaultNodeTypePatterns) {
      if (pattern.test(targetType)) {
        const node = spec.nodes.find((n) => n.type === type);
        if (node) return { beforeNode: node.id };
      }
    }
  }

  // Default: add at the end
  const lastNode = spec.nodes[spec.nodes.length - 1];
  return lastNode ? { afterNode: lastNode.id } : null;
}

/**
 * Parse custom prompts by detecting component keywords.
 *
 * Used as a fallback when template matching fails.
 * Scans the prompt for known infrastructure component patterns
 * and builds a spec from detected components.
 *
 * @see {@link parsePromptLocal} which calls this as step 3 in its pipeline
 * @see {@link detectAllNodeTypes} for the underlying pattern detection
 */
export function parseCustomPrompt(prompt: string, usePlugins = true): InfraSpec | null {
  const nodes: InfraNodeSpec[] = [];
  const connections: ConnectionSpec[] = [];

  // Determine which patterns to use
  const patterns = usePlugins ? getNodeTypePatternsFromRegistry() : defaultNodeTypePatterns;

  // Detect components using patterns
  let nodeIndex = 0;
  for (const { pattern, type, label } of patterns) {
    if (pattern.test(prompt)) {
      nodes.push({
        id: `${type}-${nodeIndex}`,
        type: type as InfraNodeType,
        label,
      });
      nodeIndex++;
    }
  }

  if (nodes.length === 0) {
    return null;
  }

  // Always add a user node at the start if not present
  if (!nodes.some((n) => n.type === 'user')) {
    nodes.unshift({ id: 'user', type: 'user', label: 'User' });
  }

  // Create sequential connections
  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push({
      source: nodes[i].id,
      target: nodes[i + 1].id,
      flowType: 'request',
    });
  }

  return { nodes, connections };
}

/**
 * Generate unique node ID
 */
export function generateNodeId(type: InfraNodeType): string {
  return `${type}-${nanoid(8)}`;
}
