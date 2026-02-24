/**
 * AI Software Catalog — Type definitions for AI/ML software products.
 *
 * Covers inference engines, vector databases, orchestrators, gateways,
 * monitoring tools, embedding services, training platforms, and prompt management.
 */

import type { AIServiceNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Category & Classification Types
// ---------------------------------------------------------------------------

/** AI software product category */
export type AISoftwareCategory =
  | 'inference'
  | 'vector-db'
  | 'orchestrator'
  | 'gateway'
  | 'monitoring'
  | 'embedding'
  | 'training'
  | 'prompt-mgmt';

/** Software licensing model */
export type LicenseType = 'open-source' | 'commercial' | 'freemium';

/** Supported deployment environments */
export type DeploymentModel = 'local' | 'server' | 'cloud' | 'edge';

/** Software maturity level */
export type MaturityLevel = 'emerging' | 'growing' | 'mature';

/** Community size classification */
export type CommunitySize = 'small' | 'medium' | 'large';

// ---------------------------------------------------------------------------
// AI Software Product
// ---------------------------------------------------------------------------

/** A single AI software product entry in the catalog */
export interface AISoftware {
  /** Unique identifier (e.g., 'AI-INF-001') */
  id: string;
  /** Product name */
  name: string;
  /** Korean product name */
  nameKo: string;
  /** Product category */
  category: AISoftwareCategory;
  /** Licensing model */
  license: LicenseType;
  /** InfraFlow AI node types this product maps to */
  infraNodeTypes: AIServiceNodeType[];
  /** Architecture role description */
  architectureRole: string;
  /** Korean architecture role */
  architectureRoleKo: string;
  /** Recommended deployment use cases */
  recommendedFor: string[];
  /** Korean recommended use cases */
  recommendedForKo: string[];
  /** Supported AI/ML models (for inference engines) */
  supportedModels?: string[];
  /** Supported hardware accelerators */
  supportedHardware?: string[];
  /** Deployment model options */
  deploymentModel: DeploymentModel[];
  /** Minimum system requirements */
  minRequirements?: { ram?: string; vram?: string; storage?: string };
  /** Operational complexity rating */
  operationalComplexity: 'low' | 'medium' | 'high';
  /** Community size */
  communitySize: CommunitySize;
  /** Software maturity level */
  maturity: MaturityLevel;
  /** Official documentation URL */
  documentationUrl: string;
  /** Product description */
  description: string;
  /** Korean product description */
  descriptionKo: string;
}
