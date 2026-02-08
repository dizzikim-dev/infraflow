/**
 * Spec Builder Module
 *
 * Handles InfraSpec building, modifications, and context management.
 */

import type { InfraSpec, InfraNodeSpec, ConnectionSpec, InfraNodeType } from '@/types';
import {
  nodeTypePatterns as defaultNodeTypePatterns,
} from './patterns';
import { detectAllNodeTypes, findInsertionPoint, generateNodeId } from './componentDetector';
import { parsePromptLocal, type ParseResult } from './templateMatcher';
import type { CommandType } from './patterns';

// ============================================================
// Types
// ============================================================

export interface SmartParseResult extends ParseResult {
  commandType: CommandType;
  modifications?: SpecModification[];
  query?: string;
}

export interface SpecModification {
  type: 'add-node' | 'remove-node' | 'add-connection' | 'remove-connection' | 'modify-node';
  target?: string;
  data?: Partial<InfraNodeSpec> | Partial<ConnectionSpec>;
}

export interface ConversationContext {
  history: PromptHistoryItem[];
  currentSpec: InfraSpec | null;
}

export interface PromptHistoryItem {
  prompt: string;
  result: ParseResult;
  timestamp: number;
}

// ============================================================
// Context Management
// ============================================================

/**
 * Create a new conversation context
 */
export function createContext(): ConversationContext {
  return {
    history: [],
    currentSpec: null,
  };
}

/**
 * Update context with new result
 */
export function updateContext(
  context: ConversationContext,
  prompt: string,
  result: SmartParseResult
): ConversationContext {
  return {
    history: [
      ...context.history,
      { prompt, result, timestamp: Date.now() },
    ].slice(-10),
    currentSpec: result.spec || context.currentSpec,
  };
}

// ============================================================
// Command Handlers
// ============================================================

/**
 * Handle create command
 */
export function handleCreate(
  prompt: string,
  options: { useTemplates?: boolean; useComponentDetection?: boolean }
): SmartParseResult {
  const result = parsePromptLocal(prompt, options);
  return {
    ...result,
    commandType: 'create',
  };
}

/**
 * Handle add command
 */
export function handleAdd(
  prompt: string,
  currentSpec: InfraSpec | null
): SmartParseResult {
  if (!currentSpec) {
    return {
      success: false,
      commandType: 'add',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  const modifications: SpecModification[] = [];
  const detectedNodes = detectAllNodeTypes(prompt);

  if (detectedNodes.length === 0) {
    return {
      success: false,
      commandType: 'add',
      confidence: 0.3,
      error: '추가할 컴포넌트를 인식하지 못했습니다.',
    };
  }

  // Find insertion point
  const insertionPoint = findInsertionPoint(prompt, currentSpec);

  // Create new spec with added nodes
  const newSpec: InfraSpec = {
    nodes: [...currentSpec.nodes],
    connections: [...currentSpec.connections],
  };

  for (const { type, label } of detectedNodes) {
    const newNodeId = generateNodeId(type as InfraNodeType);
    const newNode: InfraNodeSpec = {
      id: newNodeId,
      type: type as InfraNodeType,
      label,
    };

    newSpec.nodes.push(newNode);
    modifications.push({
      type: 'add-node',
      data: newNode,
    });

    // Auto-connect to insertion point
    if (insertionPoint?.afterNode) {
      const newConnection: ConnectionSpec = {
        source: insertionPoint.afterNode,
        target: newNodeId,
      };
      newSpec.connections.push(newConnection);
      modifications.push({
        type: 'add-connection',
        data: newConnection,
      });
    }
  }

  return {
    success: true,
    spec: newSpec,
    commandType: 'add',
    modifications,
    confidence: 0.8,
  };
}

/**
 * Handle remove command
 */
export function handleRemove(
  prompt: string,
  currentSpec: InfraSpec | null
): SmartParseResult {
  if (!currentSpec) {
    return {
      success: false,
      commandType: 'remove',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  const modifications: SpecModification[] = [];
  const nodesToRemove: string[] = [];

  // Find nodes to remove
  for (const { pattern, type } of defaultNodeTypePatterns) {
    if (pattern.test(prompt)) {
      const matchingNodes = currentSpec.nodes.filter((n) => n.type === type);
      nodesToRemove.push(...matchingNodes.map((n) => n.id));
    }
  }

  if (nodesToRemove.length === 0) {
    return {
      success: false,
      commandType: 'remove',
      confidence: 0.3,
      error: '제거할 컴포넌트를 찾지 못했습니다.',
    };
  }

  // Create new spec without removed nodes
  const newSpec: InfraSpec = {
    nodes: currentSpec.nodes.filter((n) => !nodesToRemove.includes(n.id)),
    connections: currentSpec.connections.filter(
      (c) => !nodesToRemove.includes(c.source) && !nodesToRemove.includes(c.target)
    ),
  };

  for (const nodeId of nodesToRemove) {
    modifications.push({
      type: 'remove-node',
      target: nodeId,
    });
  }

  return {
    success: true,
    spec: newSpec,
    commandType: 'remove',
    modifications,
    confidence: 0.8,
  };
}

/**
 * Handle modify command
 */
export function handleModify(
  prompt: string,
  currentSpec: InfraSpec | null
): SmartParseResult {
  if (!currentSpec) {
    return {
      success: false,
      commandType: 'modify',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  const detectedNodes = detectAllNodeTypes(prompt);
  if (detectedNodes.length === 0) {
    return {
      success: false,
      commandType: 'modify',
      confidence: 0.3,
      error: '수정할 컴포넌트를 인식하지 못했습니다.',
    };
  }

  const modifications: SpecModification[] = [];
  const newSpec: InfraSpec = {
    nodes: [...currentSpec.nodes],
    connections: [...currentSpec.connections],
  };

  for (const { type, label } of detectedNodes) {
    const nodeIndex = newSpec.nodes.findIndex((n) => n.type === type);
    if (nodeIndex >= 0) {
      const existingNode = newSpec.nodes[nodeIndex];
      const updatedNode: InfraNodeSpec = {
        ...existingNode,
        label: label || existingNode.label,
      };
      newSpec.nodes[nodeIndex] = updatedNode;
      modifications.push({
        type: 'modify-node',
        target: existingNode.id,
        data: updatedNode,
      });
    }
  }

  if (modifications.length === 0) {
    return {
      success: false,
      commandType: 'modify',
      confidence: 0.3,
      error: '수정할 컴포넌트를 찾지 못했습니다.',
    };
  }

  return {
    success: true,
    spec: newSpec,
    commandType: 'modify',
    modifications,
    confidence: 0.8,
  };
}

/**
 * Handle connect command
 */
export function handleConnect(
  prompt: string,
  currentSpec: InfraSpec | null
): SmartParseResult {
  if (!currentSpec) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  const mentionedTypes = detectAllNodeTypes(prompt);

  if (mentionedTypes.length < 2) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0.3,
      error: '연결할 두 컴포넌트를 지정해주세요.',
    };
  }

  const sourceNode = currentSpec.nodes.find(
    (n) => n.type === mentionedTypes[0].type
  );
  const targetNode = currentSpec.nodes.find(
    (n) => n.type === mentionedTypes[1].type
  );

  if (!sourceNode || !targetNode) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0.3,
      error: '해당 컴포넌트를 찾을 수 없습니다.',
    };
  }

  const newConnection: ConnectionSpec = {
    source: sourceNode.id,
    target: targetNode.id,
  };

  const newSpec: InfraSpec = {
    nodes: [...currentSpec.nodes],
    connections: [...currentSpec.connections, newConnection],
  };

  return {
    success: true,
    spec: newSpec,
    commandType: 'connect',
    modifications: [{ type: 'add-connection', data: newConnection }],
    confidence: 0.8,
  };
}

/**
 * Handle disconnect command
 */
export function handleDisconnect(
  prompt: string,
  currentSpec: InfraSpec | null
): SmartParseResult {
  if (!currentSpec) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  const mentionedTypes = detectAllNodeTypes(prompt);

  if (mentionedTypes.length < 2) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0.3,
      error: '연결 해제할 두 컴포넌트를 지정해주세요.',
    };
  }

  const sourceNode = currentSpec.nodes.find(
    (n) => n.type === mentionedTypes[0].type
  );
  const targetNode = currentSpec.nodes.find(
    (n) => n.type === mentionedTypes[1].type
  );

  if (!sourceNode || !targetNode) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0.3,
      error: '해당 컴포넌트를 찾을 수 없습니다.',
    };
  }

  const newSpec: InfraSpec = {
    nodes: [...currentSpec.nodes],
    connections: currentSpec.connections.filter(
      (c) =>
        !(c.source === sourceNode.id && c.target === targetNode.id) &&
        !(c.source === targetNode.id && c.target === sourceNode.id)
    ),
  };

  return {
    success: true,
    spec: newSpec,
    commandType: 'disconnect',
    modifications: [
      { type: 'remove-connection', target: `${sourceNode.id}-${targetNode.id}` },
    ],
    confidence: 0.8,
  };
}

/**
 * Handle query command
 */
export function handleQuery(
  prompt: string,
  currentSpec: InfraSpec | null
): SmartParseResult {
  return {
    success: true,
    commandType: 'query',
    query: prompt,
    confidence: 1,
    spec: currentSpec || undefined,
  };
}
