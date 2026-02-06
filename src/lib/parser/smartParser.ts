import { InfraSpec, InfraNodeSpec, ConnectionSpec, InfraNodeType } from '@/types';
import { parsePrompt, ParseResult } from './promptParser';
import {
  nodeTypePatterns,
  detectCommandType as detectCommand,
  type CommandType,
} from './patterns';

export interface ConversationContext {
  history: PromptHistoryItem[];
  currentSpec: InfraSpec | null;
}

export interface PromptHistoryItem {
  prompt: string;
  result: ParseResult;
  timestamp: number;
}

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

/**
 * Smart parser that understands context and modification commands
 */
export function smartParse(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  const normalizedPrompt = prompt.trim().toLowerCase();

  // Detect command type using shared patterns
  const commandType = detectCommand(normalizedPrompt);

  // If no current spec and not a create command, treat as create
  if (!context.currentSpec && commandType !== 'create') {
    const baseResult = parsePrompt(prompt);
    return {
      ...baseResult,
      commandType: 'create',
    };
  }

  // Handle different command types
  switch (commandType) {
    case 'add':
      return handleAddCommand(prompt, context);

    case 'remove':
      return handleRemoveCommand(prompt, context);

    case 'modify':
      return handleModifyCommand(prompt, context);

    case 'connect':
      return handleConnectCommand(prompt, context);

    case 'disconnect':
      return handleDisconnectCommand(prompt, context);

    case 'query':
      return handleQueryCommand(prompt, context);

    case 'create':
    default:
      const baseResult = parsePrompt(prompt);
      return {
        ...baseResult,
        commandType: 'create',
      };
  }
}

function handleAddCommand(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
    return {
      success: false,
      commandType: 'add',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  const modifications: SpecModification[] = [];
  const detectedNodes: Array<{ type: InfraNodeType; label: string }> = [];

  // Detect which nodes to add
  for (const { pattern, type, label } of nodeTypePatterns) {
    if (pattern.test(prompt)) {
      detectedNodes.push({ type, label });
    }
  }

  if (detectedNodes.length === 0) {
    return {
      success: false,
      commandType: 'add',
      confidence: 0.3,
      error: '추가할 컴포넌트를 인식하지 못했습니다.',
    };
  }

  // Find insertion point
  const insertionPoint = findInsertionPoint(prompt, context.currentSpec);

  // Create new spec with added nodes
  const newSpec = { ...context.currentSpec };
  newSpec.nodes = [...newSpec.nodes];
  newSpec.connections = [...newSpec.connections];

  for (const { type, label } of detectedNodes) {
    const newNodeId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newNode: InfraNodeSpec = {
      id: newNodeId,
      type,
      label,
    };

    newSpec.nodes.push(newNode);
    modifications.push({
      type: 'add-node',
      data: newNode,
    });

    // Auto-connect to insertion point
    if (insertionPoint) {
      const newConnection: ConnectionSpec = {
        source: insertionPoint.afterNode || newNodeId,
        target: insertionPoint.afterNode ? newNodeId : (insertionPoint.beforeNode || ''),
      };

      if (newConnection.target) {
        newSpec.connections.push(newConnection);
        modifications.push({
          type: 'add-connection',
          data: newConnection,
        });
      }
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

function handleRemoveCommand(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
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
  for (const { pattern, type } of nodeTypePatterns) {
    if (pattern.test(prompt)) {
      const matchingNodes = context.currentSpec.nodes.filter(
        (n) => n.type === type
      );
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
  const newSpec = { ...context.currentSpec };
  newSpec.nodes = newSpec.nodes.filter((n) => !nodesToRemove.includes(n.id));
  newSpec.connections = newSpec.connections.filter(
    (c) => !nodesToRemove.includes(c.source) && !nodesToRemove.includes(c.target)
  );

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

function handleModifyCommand(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  // For now, treat modify as a combination of remove + add
  // In a real implementation, this would update node properties
  return {
    success: false,
    commandType: 'modify',
    confidence: 0.3,
    error: '수정 기능은 아직 구현 중입니다. "삭제" 후 "추가"를 사용해주세요.',
  };
}

function handleConnectCommand(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  // Extract node types from prompt
  const mentionedTypes: InfraNodeType[] = [];
  for (const { pattern, type } of nodeTypePatterns) {
    if (pattern.test(prompt)) {
      mentionedTypes.push(type);
    }
  }

  if (mentionedTypes.length < 2) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0.3,
      error: '연결할 두 컴포넌트를 지정해주세요.',
    };
  }

  // Find matching nodes
  const sourceNode = context.currentSpec.nodes.find((n) => n.type === mentionedTypes[0]);
  const targetNode = context.currentSpec.nodes.find((n) => n.type === mentionedTypes[1]);

  if (!sourceNode || !targetNode) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0.3,
      error: '해당 컴포넌트를 찾을 수 없습니다.',
    };
  }

  const newSpec = { ...context.currentSpec };
  newSpec.connections = [...newSpec.connections];

  const newConnection: ConnectionSpec = {
    source: sourceNode.id,
    target: targetNode.id,
  };

  newSpec.connections.push(newConnection);

  return {
    success: true,
    spec: newSpec,
    commandType: 'connect',
    modifications: [{ type: 'add-connection', data: newConnection }],
    confidence: 0.8,
  };
}

function handleDisconnectCommand(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  // Similar to connect but removes connections
  const mentionedTypes: InfraNodeType[] = [];
  for (const { pattern, type } of nodeTypePatterns) {
    if (pattern.test(prompt)) {
      mentionedTypes.push(type);
    }
  }

  if (mentionedTypes.length < 2) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0.3,
      error: '연결 해제할 두 컴포넌트를 지정해주세요.',
    };
  }

  const sourceNode = context.currentSpec.nodes.find((n) => n.type === mentionedTypes[0]);
  const targetNode = context.currentSpec.nodes.find((n) => n.type === mentionedTypes[1]);

  if (!sourceNode || !targetNode) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0.3,
      error: '해당 컴포넌트를 찾을 수 없습니다.',
    };
  }

  const newSpec = { ...context.currentSpec };
  newSpec.connections = newSpec.connections.filter(
    (c) =>
      !(c.source === sourceNode.id && c.target === targetNode.id) &&
      !(c.source === targetNode.id && c.target === sourceNode.id)
  );

  return {
    success: true,
    spec: newSpec,
    commandType: 'disconnect',
    modifications: [{ type: 'remove-connection', target: `${sourceNode.id}-${targetNode.id}` }],
    confidence: 0.8,
  };
}

function handleQueryCommand(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  return {
    success: true,
    commandType: 'query',
    query: prompt,
    confidence: 1,
    spec: context.currentSpec || undefined,
  };
}

function findInsertionPoint(
  prompt: string,
  spec: InfraSpec
): { afterNode?: string; beforeNode?: string } | null {
  // Look for position indicators
  const afterMatch = prompt.match(/(\w+)\s*(뒤에|다음에|after)/i);
  const beforeMatch = prompt.match(/(\w+)\s*(앞에|이전에|before)/i);
  const betweenMatch = prompt.match(/(\w+).*(\w+)\s*사이에/i);

  if (afterMatch) {
    const targetType = afterMatch[1].toLowerCase();
    for (const { pattern, type } of nodeTypePatterns) {
      if (pattern.test(targetType)) {
        const node = spec.nodes.find((n) => n.type === type);
        if (node) return { afterNode: node.id };
      }
    }
  }

  if (beforeMatch) {
    const targetType = beforeMatch[1].toLowerCase();
    for (const { pattern, type } of nodeTypePatterns) {
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
    ].slice(-10), // Keep last 10 items
    currentSpec: result.spec || context.currentSpec,
  };
}
