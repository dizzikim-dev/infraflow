/**
 * Terraform Export Module (Re-export)
 *
 * This file re-exports from the modularized terraform/ directory for backward
 * compatibility. All implementation has been split into sub-modules:
 *
 * - terraform/types.ts — TerraformExportOptions interface
 * - terraform/helpers.ts — sanitizeId, generateEC2Instance, etc.
 * - terraform/securityResources.ts — Security node generators
 * - terraform/networkResources.ts — Network node generators
 * - terraform/computeResources.ts — Compute node generators
 * - terraform/storageResources.ts — Storage, cloud, auth, external generators
 * - terraform/aiResources.ts — AI node generators
 * - terraform/index.ts — Combined resource map + exportToTerraform
 *
 * @module lib/export/terraformExport
 */

export {
  exportToTerraform,
  sanitizeId,
  generateEC2Instance,
  generateProviderBlock,
  generateVariablesBlock,
  type TerraformExportOptions,
} from './terraform';
