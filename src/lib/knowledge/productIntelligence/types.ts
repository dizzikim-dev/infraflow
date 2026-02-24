/**
 * Product Intelligence - Type Definitions
 *
 * Defines the schema for AI/cloud product intelligence data:
 * deployment profiles, integration info, and scale-up paths.
 *
 * Each product maps to InfraNodeType components, enabling the knowledge graph
 * to recommend infrastructure for specific AI/cloud products.
 */

import type { InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Category & Union Types
// ---------------------------------------------------------------------------

/** Product intelligence category — classifies AI/cloud/devops products */
export type PICategory =
  | 'ai-inference'
  | 'ai-assistant'
  | 'ai-framework'
  | 'vector-db'
  | 'ai-gateway'
  | 'ai-orchestrator'
  | 'ai-monitor'
  | 'cloud-compute'
  | 'cloud-gpu'
  | 'cloud-container'
  | 'communication'
  | 'devops';

/** Target deployment platform */
export type DeploymentPlatform = 'desktop' | 'mobile' | 'server' | 'edge' | 'cloud';

/** How a product integrates with other tools/services */
export type IntegrationMethod = 'webhook' | 'api' | 'plugin' | 'native' | 'mcp';

// ---------------------------------------------------------------------------
// Sub-Interfaces
// ---------------------------------------------------------------------------

/** Minimum resource requirements for a deployment profile */
export interface ResourceRequirements {
  /** CPU requirement (e.g., '4 cores', 'Apple M1') */
  cpu?: string;
  /** RAM requirement (e.g., '16 GB') */
  ram?: string;
  /** Video RAM / GPU memory (e.g., '24 GB VRAM') */
  vram?: string;
  /** Disk storage requirement (e.g., '500 GB SSD') */
  storage?: string;
  /** Network bandwidth requirement (e.g., '1 Gbps') */
  network?: string;
}

/** How a product is deployed on a specific platform */
export interface DeploymentProfile {
  /** Target platform */
  platform: DeploymentPlatform;
  /** Supported operating systems */
  os: string[];
  /** Installation method (English) */
  installMethod: string;
  /** Installation method (Korean) */
  installMethodKo: string;
  /** Minimum resource requirements */
  minRequirements: ResourceRequirements;
  /** Infrastructure components needed for this deployment */
  infraComponents: InfraNodeType[];
  /** Additional deployment notes (English) */
  notes: string;
  /** Additional deployment notes (Korean) */
  notesKo: string;
}

/** How a product integrates with another tool or service */
export interface IntegrationInfo {
  /** Target tool/service name (e.g., 'VS Code', 'Slack') */
  target: string;
  /** Integration method */
  method: IntegrationMethod;
  /** Infrastructure components involved in this integration */
  infraComponents: InfraNodeType[];
  /** Communication protocol (e.g., 'REST', 'gRPC', 'LSP', 'MCP over stdio') */
  protocol?: string;
  /** Integration description (English) */
  description: string;
  /** Integration description (Korean) */
  descriptionKo: string;
}

/** When and how to scale up infrastructure for a product */
export interface ScaleUpPath {
  /** What triggers the need to scale (English) */
  trigger: string;
  /** What triggers the need to scale (Korean) */
  triggerKo: string;
  /** Current infrastructure components (before scale) */
  from: InfraNodeType[];
  /** Target infrastructure components (after scale) */
  to: InfraNodeType[];
  /** Recommended cloud services for this scale path */
  cloudServices: string[];
  /** Why this scale-up is needed (English) */
  reason: string;
  /** Why this scale-up is needed (Korean) */
  reasonKo: string;
}

// ---------------------------------------------------------------------------
// Main Interface
// ---------------------------------------------------------------------------

/** Complete product intelligence entry for an AI/cloud product */
export interface ProductIntelligence {
  /** Unique identifier (e.g., 'PI-CLAUDE-001') */
  id: string;
  /** Product identifier linking to vendor catalog (e.g., 'anthropic-claude') */
  productId: string;
  /** Product name (English) */
  name: string;
  /** Product name (Korean) */
  nameKo: string;
  /** Product category */
  category: PICategory;
  /** Official product page URL */
  sourceUrl: string;
  /** How this product can be deployed across platforms */
  deploymentProfiles: DeploymentProfile[];
  /** How this product integrates with other tools/services */
  integrations: IntegrationInfo[];
  /** When and how to scale up infrastructure */
  scaleUpPaths: ScaleUpPath[];
  /** Text for vector embedding generation (English) */
  embeddingText: string;
  /** Text for vector embedding generation (Korean) */
  embeddingTextKo: string;
}
