'use client';

import { useState, useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import {
  smartParse,
  createContext,
  updateContext,
  ConversationContext,
} from '@/lib/parser';
import { specToFlow } from '@/lib/layout';
import { generateFlowSequence, ScenarioType } from '@/lib/animation';
import { Template } from '@/lib/templates';
import { InfraSpec, AnimationSequence, PolicyRule, isInfraNodeData, safeGetTier } from '@/types';
import { LOADING_DELAY_MS } from '@/lib/constants';

export interface ParseResultInfo {
  templateUsed?: string;
  confidence: number;
  commandType?: string;
}

export interface SelectedNodeDetail {
  id: string;
  name: string;
  nodeType: string;
  tier: string;
  zone?: string;
  description?: string;
}

export interface SelectedNodePolicy {
  name: string;
  type: string;
  policies: PolicyRule[];
  position: { x: number; y: number };
}

/**
 * Main infrastructure state management hook
 * Handles nodes, edges, parsing, animations, and selections
 */
export function useInfraState() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [currentSpec, setCurrentSpec] = useState<InfraSpec | null>(null);
  const [lastResult, setLastResult] = useState<ParseResultInfo | null>(null);

  // Conversation context for smart parsing
  const [context, setContext] = useState<ConversationContext>(createContext());

  // Animation state
  const [currentScenario, setCurrentScenario] = useState<ScenarioType | null>(null);
  const [animationSequence, setAnimationSequence] = useState<AnimationSequence | null>(null);

  // Selection state
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<SelectedNodeDetail | null>(null);
  const [selectedNodePolicy, setSelectedNodePolicy] = useState<SelectedNodePolicy | null>(null);

  /**
   * Handle prompt submission and parsing
   */
  const handlePromptSubmit = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setSelectedNodePolicy(null);

    // Optional loading delay (configurable, default 0)
    if (LOADING_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY_MS));
    }

    try {
      const result = smartParse(prompt, {
        ...context,
        currentSpec,
      });

      if (result.success && result.spec) {
        const { nodes: newNodes, edges: newEdges } = specToFlow(result.spec);

        setNodes(newNodes);
        setEdges(newEdges);
        setCurrentSpec(result.spec);
        setLastResult({
          templateUsed: result.templateUsed,
          confidence: result.confidence,
          commandType: result.commandType,
        });

        // Update conversation context
        setContext(updateContext(context, prompt, result));
      } else if (result.error) {
        console.warn('Parse warning:', result.error);
        setLastResult({
          confidence: result.confidence,
          commandType: result.commandType,
        });
      }
    } catch (error) {
      console.error('Failed to parse prompt:', error);
    }

    setIsLoading(false);
  }, [context, currentSpec]);

  /**
   * Handle scenario selection for animation
   */
  const handleScenarioSelect = useCallback((type: ScenarioType) => {
    if (!currentSpec) return;

    const sequence = generateFlowSequence(currentSpec, type);
    setAnimationSequence(sequence);
    setCurrentScenario(type);
  }, [currentSpec]);

  /**
   * Handle template selection
   */
  const handleTemplateSelect = useCallback((template: Template) => {
    const { nodes: newNodes, edges: newEdges } = specToFlow(template.spec);

    setNodes(newNodes);
    setEdges(newEdges);
    setCurrentSpec(template.spec);
    setLastResult({
      templateUsed: template.id,
      confidence: 1,
      commandType: 'template',
    });

    // Reset animation
    setCurrentScenario(null);
    setAnimationSequence(null);
  }, []);

  /**
   * Handle node click - show detail panel and policy overlay
   */
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (!isInfraNodeData(node.data)) {
      console.warn('Invalid node data:', node.id);
      return;
    }

    const data = node.data;

    // Show node detail panel
    setSelectedNodeDetail({
      id: node.id,
      name: data.label,
      nodeType: data.nodeType,
      tier: safeGetTier(data),
      zone: data.zone,
      description: data.description,
    });

    // If node has policies, also show policy overlay
    if (data.policies && data.policies.length > 0) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setSelectedNodePolicy({
        name: data.label,
        type: data.nodeType,
        policies: data.policies,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top,
        },
      });
    }
  }, []);

  /**
   * Clear current diagram
   */
  const clearDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentSpec(null);
    setLastResult(null);
    setAnimationSequence(null);
    setCurrentScenario(null);
    setSelectedNodeDetail(null);
    setSelectedNodePolicy(null);
  }, []);

  return {
    // Refs
    canvasRef,

    // Core state
    isLoading,
    nodes,
    edges,
    currentSpec,
    lastResult,

    // Animation state
    currentScenario,
    animationSequence,

    // Selection state
    selectedNodeDetail,
    setSelectedNodeDetail,
    selectedNodePolicy,
    setSelectedNodePolicy,

    // Actions
    handlePromptSubmit,
    handleScenarioSelect,
    handleTemplateSelect,
    handleNodeClick,
    clearDiagram,
  };
}
