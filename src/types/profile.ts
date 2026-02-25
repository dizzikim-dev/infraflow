/**
 * Project Profile types for storing per-project context
 * (industry, scale, SLA, budget, regulations, persona).
 */

export interface PersonaPreset {
  id: string;
  name: string;
  nameKo: string;
  depth: 'summary' | 'standard' | 'detailed';
  focus: 'cost-schedule' | 'security-compliance' | 'operations-sre' | 'learning';
  tone: 'consulting' | 'learning';
}

export interface ProjectProfile {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;

  industry: string;
  companySize: string;
  teamSize?: number;

  slaTarget?: string;
  dataClassification?: string;
  regulations?: string[];
  cloudPreference?: string;

  budgetRange?: { min: number; max: number; currency: string };

  persona?: PersonaPreset;
}

export interface ProjectProfileStore {
  version: 1;
  activeProfileId: string | null;
  profiles: ProjectProfile[];
}
