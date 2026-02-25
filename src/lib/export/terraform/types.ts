/**
 * Terraform Export Types
 *
 * Shared types and interfaces for the Terraform export module.
 *
 * @module lib/export/terraform/types
 */

/**
 * Options for Terraform export.
 *
 * @interface TerraformExportOptions
 * @property {'aws' | 'azure' | 'gcp'} [provider='aws'] - Target cloud provider
 * @property {string} [region='ap-northeast-2'] - Cloud region for resources
 * @property {boolean} [includeVariables=true] - Whether to include variable definitions
 * @property {boolean} [includeOutputs=true] - Whether to include output definitions
 * @property {boolean} [moduleFormat=false] - Whether to format as a reusable module
 */
export interface TerraformExportOptions {
  provider?: 'aws' | 'azure' | 'gcp';
  region?: string;
  includeVariables?: boolean;
  includeOutputs?: boolean;
  moduleFormat?: boolean;
}
