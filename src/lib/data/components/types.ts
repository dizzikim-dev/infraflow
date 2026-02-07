/**
 * Infrastructure Component Types
 * Shared types for infrastructure database components
 */

export interface InfraComponent {
  id: string;
  name: string;
  nameKo: string;
  category: 'security' | 'network' | 'compute' | 'cloud' | 'storage' | 'auth' | 'external';
  description: string;
  descriptionKo: string;
  functions: string[];
  functionsKo: string[];
  features: string[];
  featuresKo: string[];
  recommendedPolicies: PolicyRecommendation[];
  tier: 'external' | 'dmz' | 'internal' | 'data';
  ports?: string[];
  protocols?: string[];
  vendors?: string[];
}

export interface PolicyRecommendation {
  name: string;
  nameKo: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'access' | 'security' | 'monitoring' | 'compliance' | 'performance';
}

export type InfraComponentCategory = InfraComponent['category'];
export type InfraComponentTier = InfraComponent['tier'];
