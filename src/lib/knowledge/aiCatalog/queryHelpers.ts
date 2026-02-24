/**
 * AI Software Catalog — Query Helpers
 *
 * Search and filter functions for the AI software catalog.
 * Imports from individual data files to avoid circular dependencies with index.ts.
 */

import type { AISoftware, AISoftwareCategory } from './types';
import type { AIServiceNodeType } from '@/types/infra';
import { inferenceEngines } from './inferenceEngines';
import { vectorDatabases } from './vectorDatabases';
import { orchestrators } from './orchestrators';
import { gateways } from './gateways';
import { monitoringTools } from './monitoring';
import { embeddingServices } from './embeddingServices';
import { trainingPlatforms } from './trainingPlatforms';
import { promptManagers } from './promptManagement';

const allSoftware: AISoftware[] = [
  ...inferenceEngines,
  ...vectorDatabases,
  ...orchestrators,
  ...gateways,
  ...monitoringTools,
  ...embeddingServices,
  ...trainingPlatforms,
  ...promptManagers,
];

/** Filter AI software by category */
export function getAISoftwareByCategory(category: AISoftwareCategory): AISoftware[] {
  return allSoftware.filter(s => s.category === category);
}

/** Find AI software products that map to a given infra node type */
export function getAISoftwareForNodeType(nodeType: AIServiceNodeType): AISoftware[] {
  return allSoftware.filter(s => s.infraNodeTypes.includes(nodeType));
}

/** Search AI software by name or description (bilingual) */
export function searchAISoftware(query: string): AISoftware[] {
  const q = query.toLowerCase();
  return allSoftware.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.nameKo.includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.descriptionKo.includes(q)
  );
}
