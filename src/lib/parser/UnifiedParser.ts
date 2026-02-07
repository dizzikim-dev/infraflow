/**
 * Unified Parser
 *
 * Single entry point for all parsing operations.
 * Consolidates promptParser, smartParser, and intelligentParser into one module.
 *
 * 플러그인 시스템 지원:
 * - 플러그인 레지스트리에서 패턴/템플릿 동적 로드
 * - 플러그인 커맨드 핸들러 체인
 * - 기존 기능과 하위 호환
 */

import { InfraSpec, InfraNodeSpec, ConnectionSpec, InfraNodeType } from '@/types';
import { infraTemplates, templateKeywords } from './templates';
import {
  nodeTypePatterns as defaultNodeTypePatterns,
  commandPatterns,
  detectAllNodeTypes as defaultDetectAllNodeTypes,
  detectCommandType,
  type CommandType,
  type NodeTypePattern,
} from './patterns';
import type { ParserExtension } from '@/types/plugin';

// ============================================================
// Types
// ============================================================

export interface ParseResult {
  success: boolean;
  spec?: InfraSpec;
  templateUsed?: string;
  error?: string;
  confidence: number;
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

export interface ConversationContext {
  history: PromptHistoryItem[];
  currentSpec: InfraSpec | null;
}

export interface PromptHistoryItem {
  prompt: string;
  result: ParseResult;
  timestamp: number;
}

export interface ParseOptions {
  /** Use template matching */
  useTemplates?: boolean;
  /** Use component detection */
  useComponentDetection?: boolean;
  /** Minimum confidence threshold */
  minConfidence?: number;
}

// ============================================================
// Plugin Integration
// ============================================================

/**
 * 플러그인 레지스트리에서 노드 타입 패턴 가져오기
 */
function getNodeTypePatternsFromRegistry(): NodeTypePattern[] {
  try {
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const patterns = pluginRegistry.getAllPatterns();
    return patterns.length > 0 ? patterns : defaultNodeTypePatterns;
  } catch {
    return defaultNodeTypePatterns;
  }
}

/**
 * 플러그인 레지스트리에서 템플릿 가져오기
 */
function getTemplatesFromRegistry(): Record<string, InfraSpec> {
  try {
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const templates = pluginRegistry.getAllTemplates();
    return { ...infraTemplates, ...templates };
  } catch {
    return infraTemplates;
  }
}

/**
 * 플러그인 레지스트리에서 파서 확장 가져오기
 */
function getParserExtensionsFromRegistry(): ParserExtension[] {
  try {
    const { pluginRegistry } = require('@/lib/plugins/registry');
    return pluginRegistry.getParserExtensions();
  } catch {
    return [];
  }
}

/**
 * 동적 패턴으로 모든 노드 타입 감지
 */
function detectAllNodeTypes(text: string): NodeTypePattern[] {
  const patterns = getNodeTypePatternsFromRegistry();
  const normalized = text.toLowerCase();
  return patterns.filter((p) => p.pattern.test(normalized));
}

// 하위 호환성을 위해 기존 함수도 export
export { nodeTypePatterns } from './patterns';

// ============================================================
// Unified Parser Class
// ============================================================

export class UnifiedParser {
  private context: ConversationContext;
  private usePluginPatterns: boolean;

  constructor(initialContext?: ConversationContext, usePluginPatterns = true) {
    this.context = initialContext || createContext();
    this.usePluginPatterns = usePluginPatterns;
  }

  /**
   * 플러그인 패턴 사용 여부 설정
   */
  setUsePluginPatterns(use: boolean): void {
    this.usePluginPatterns = use;
  }

  /**
   * 현재 사용 중인 패턴 조회
   */
  getPatterns(): NodeTypePattern[] {
    return this.usePluginPatterns
      ? getNodeTypePatternsFromRegistry()
      : defaultNodeTypePatterns;
  }

  /**
   * 현재 사용 중인 템플릿 조회
   */
  getTemplates(): Record<string, InfraSpec> {
    return this.usePluginPatterns
      ? getTemplatesFromRegistry()
      : infraTemplates;
  }

  /**
   * Main parse method - automatically selects best parsing strategy
   */
  parse(prompt: string, options: ParseOptions = {}): SmartParseResult {
    const {
      useTemplates = true,
      useComponentDetection = true,
      minConfidence = 0,
    } = options;

    const normalizedPrompt = prompt.trim().toLowerCase();
    const commandType = detectCommandType(normalizedPrompt);

    // If no current spec and not a create command, treat as create
    if (!this.context.currentSpec && commandType !== 'create') {
      return this.handleCreate(prompt, { useTemplates, useComponentDetection });
    }

    // Handle different command types
    switch (commandType) {
      case 'add':
        return this.handleAdd(prompt);
      case 'remove':
        return this.handleRemove(prompt);
      case 'modify':
        return this.handleModify(prompt);
      case 'connect':
        return this.handleConnect(prompt);
      case 'disconnect':
        return this.handleDisconnect(prompt);
      case 'query':
        return this.handleQuery(prompt);
      case 'create':
      default:
        return this.handleCreate(prompt, { useTemplates, useComponentDetection });
    }
  }

  /**
   * Simple parse without context (backwards compatible with promptParser)
   */
  parseSimple(prompt: string): ParseResult {
    return parsePromptLocal(prompt);
  }

  /**
   * Get current context
   */
  getContext(): ConversationContext {
    return this.context;
  }

  /**
   * Update context with result
   */
  updateContext(prompt: string, result: SmartParseResult): void {
    this.context = updateContext(this.context, prompt, result);
  }

  /**
   * Reset context
   */
  resetContext(): void {
    this.context = createContext();
  }

  /**
   * Set current spec directly
   */
  setCurrentSpec(spec: InfraSpec): void {
    this.context.currentSpec = spec;
  }

  // ============================================================
  // Command Handlers
  // ============================================================

  private handleCreate(
    prompt: string,
    options: { useTemplates?: boolean; useComponentDetection?: boolean }
  ): SmartParseResult {
    const result = parsePromptLocal(prompt, options);
    return {
      ...result,
      commandType: 'create',
    };
  }

  private handleAdd(prompt: string): SmartParseResult {
    if (!this.context.currentSpec) {
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
    const insertionPoint = findInsertionPoint(prompt, this.context.currentSpec);

    // Create new spec with added nodes
    const newSpec: InfraSpec = {
      nodes: [...this.context.currentSpec.nodes],
      connections: [...this.context.currentSpec.connections],
    };

    for (const { type, label } of detectedNodes) {
      const newNodeId = generateNodeId(type);
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

  private handleRemove(prompt: string): SmartParseResult {
    if (!this.context.currentSpec) {
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
        const matchingNodes = this.context.currentSpec.nodes.filter(
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
    const newSpec: InfraSpec = {
      nodes: this.context.currentSpec.nodes.filter((n) => !nodesToRemove.includes(n.id)),
      connections: this.context.currentSpec.connections.filter(
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

  private handleModify(prompt: string): SmartParseResult {
    if (!this.context.currentSpec) {
      return {
        success: false,
        commandType: 'modify',
        confidence: 0,
        error: '먼저 아키텍처를 생성해주세요.',
      };
    }

    // Basic modify: update labels or descriptions
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
      nodes: [...this.context.currentSpec.nodes],
      connections: [...this.context.currentSpec.connections],
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

  private handleConnect(prompt: string): SmartParseResult {
    if (!this.context.currentSpec) {
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

    const sourceNode = this.context.currentSpec.nodes.find(
      (n) => n.type === mentionedTypes[0].type
    );
    const targetNode = this.context.currentSpec.nodes.find(
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
      nodes: [...this.context.currentSpec.nodes],
      connections: [...this.context.currentSpec.connections, newConnection],
    };

    return {
      success: true,
      spec: newSpec,
      commandType: 'connect',
      modifications: [{ type: 'add-connection', data: newConnection }],
      confidence: 0.8,
    };
  }

  private handleDisconnect(prompt: string): SmartParseResult {
    if (!this.context.currentSpec) {
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

    const sourceNode = this.context.currentSpec.nodes.find(
      (n) => n.type === mentionedTypes[0].type
    );
    const targetNode = this.context.currentSpec.nodes.find(
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
      nodes: [...this.context.currentSpec.nodes],
      connections: this.context.currentSpec.connections.filter(
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

  private handleQuery(prompt: string): SmartParseResult {
    return {
      success: true,
      commandType: 'query',
      query: prompt,
      confidence: 1,
      spec: this.context.currentSpec || undefined,
    };
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate unique node ID
 */
function generateNodeId(type: InfraNodeType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * Find insertion point for new nodes
 */
function findInsertionPoint(
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
 * Parse prompt using local logic (no LLM)
 *
 * 플러그인 시스템 지원:
 * - 플러그인 템플릿 우선 검색
 * - 플러그인 패턴으로 컴포넌트 감지
 */
function parsePromptLocal(
  prompt: string,
  options: { useTemplates?: boolean; useComponentDetection?: boolean; usePlugins?: boolean } = {}
): ParseResult {
  const { useTemplates = true, useComponentDetection = true, usePlugins = true } = options;
  const normalizedPrompt = prompt.toLowerCase().trim();

  // 사용할 템플릿 결정 (플러그인 우선)
  const templates = usePlugins ? getTemplatesFromRegistry() : infraTemplates;

  // Try to match templates by keywords
  if (useTemplates) {
    // 플러그인 템플릿 키워드도 검색
    for (const [templateId, keywords] of Object.entries(templateKeywords)) {
      for (const keyword of keywords) {
        if (normalizedPrompt.includes(keyword.toLowerCase())) {
          const template = templates[templateId];
          if (template) {
            return {
              success: true,
              spec: template,
              templateUsed: templateId,
              confidence: 0.8,
            };
          }
        }
      }
    }

    // 플러그인 템플릿 ID로 직접 매칭
    for (const templateId of Object.keys(templates)) {
      if (normalizedPrompt.includes(templateId.toLowerCase())) {
        return {
          success: true,
          spec: templates[templateId],
          templateUsed: templateId,
          confidence: 0.8,
        };
      }
    }
  }

  // Parse components from prompt
  if (useComponentDetection) {
    const parsedSpec = parseCustomPrompt(normalizedPrompt, usePlugins);
    if (parsedSpec) {
      return {
        success: true,
        spec: parsedSpec,
        confidence: 0.5,
      };
    }
  }

  // Default fallback
  return {
    success: true,
    spec: templates['simple-waf'] || infraTemplates['simple-waf'],
    templateUsed: 'simple-waf',
    confidence: 0.3,
  };
}

/**
 * Parse custom prompts by detecting component keywords
 *
 * 플러그인 시스템 지원:
 * - usePlugins=true 시 플러그인 패턴 사용
 */
function parseCustomPrompt(prompt: string, usePlugins = true): InfraSpec | null {
  const nodes: InfraNodeSpec[] = [];
  const connections: ConnectionSpec[] = [];

  // 사용할 패턴 결정
  const patterns = usePlugins ? getNodeTypePatternsFromRegistry() : defaultNodeTypePatterns;

  // Detect components using shared patterns
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
// Backwards Compatibility Exports
// ============================================================

/**
 * Simple parse function (backwards compatible with parsePrompt)
 */
export function parsePrompt(prompt: string): ParseResult {
  return parsePromptLocal(prompt);
}

/**
 * Smart parse function (backwards compatible with smartParse)
 */
export function smartParse(
  prompt: string,
  context: ConversationContext
): SmartParseResult {
  const parser = new UnifiedParser(context);
  return parser.parse(prompt);
}

/**
 * Get available templates
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(infraTemplates);
}

/**
 * Get a specific template
 */
export function getTemplate(name: string): InfraSpec | null {
  return infraTemplates[name] || null;
}

// Default parser instance
export const defaultParser = new UnifiedParser();
