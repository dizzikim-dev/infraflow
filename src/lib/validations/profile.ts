/**
 * Zod schemas and safety validation for Project Profile.
 */

import { z } from 'zod';
import { validateInputSafety } from '@/lib/security/inputSafetyCheck';
import type { ProjectProfile } from '@/types/profile';

const PersonaPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKo: z.string(),
  depth: z.enum(['summary', 'standard', 'detailed']),
  focus: z.enum(['cost-schedule', 'security-compliance', 'operations-sre', 'learning']),
  tone: z.enum(['consulting', 'learning']),
});

const ProjectProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  createdAt: z.number(),
  updatedAt: z.number(),
  industry: z.string(),
  companySize: z.string(),
  teamSize: z.number().optional(),
  slaTarget: z.string().optional(),
  dataClassification: z.string().optional(),
  regulations: z.array(z.string()).optional(),
  cloudPreference: z.string().optional(),
  budgetRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }).optional(),
  persona: PersonaPresetSchema.optional(),
});

export const ProjectProfileStoreSchema = z.object({
  version: z.literal(1),
  activeProfileId: z.string().nullable(),
  profiles: z.array(ProjectProfileSchema),
});

/** Check all string fields in a profile for sensitive data */
export function validateProfileSafety(profile: ProjectProfile) {
  const allStrings = Object.values(profile)
    .filter((v): v is string => typeof v === 'string')
    .join(' ');

  return validateInputSafety(allStrings, 'profile');
}
