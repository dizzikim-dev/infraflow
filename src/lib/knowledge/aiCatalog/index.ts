/**
 * AI Software Catalog — Public API
 *
 * Re-exports all AI software data and query helpers.
 */

export type { AISoftware, AISoftwareCategory, LicenseType, DeploymentModel, MaturityLevel, CommunitySize } from './types';

import type { AISoftware } from './types';
import { inferenceEngines } from './inferenceEngines';
import { vectorDatabases } from './vectorDatabases';
import { orchestrators } from './orchestrators';
import { gateways } from './gateways';
import { monitoringTools } from './monitoring';
import { embeddingServices } from './embeddingServices';
import { trainingPlatforms } from './trainingPlatforms';
import { promptManagers } from './promptManagement';

/** All AI software products across all categories */
export const allAISoftware: readonly AISoftware[] = Object.freeze([
  ...inferenceEngines,
  ...vectorDatabases,
  ...orchestrators,
  ...gateways,
  ...monitoringTools,
  ...embeddingServices,
  ...trainingPlatforms,
  ...promptManagers,
]);

export { getAISoftwareByCategory, getAISoftwareForNodeType, searchAISoftware } from './queryHelpers';
