/**
 * Terraform Export Helpers
 *
 * Shared utility functions for the Terraform export module including
 * ID sanitization, provider block generation, and variable/output blocks.
 *
 * @module lib/export/terraform/helpers
 */

import { InfraNodeSpec } from '@/types';

/**
 * Sanitizes an ID for use as a Terraform resource name.
 *
 * Terraform resource names must contain only alphanumeric characters and underscores.
 * This function replaces all invalid characters with underscores and converts to lowercase.
 *
 * @param {string} id - The original ID to sanitize
 * @returns {string} Sanitized ID safe for Terraform resource names
 *
 * @example
 * sanitizeId('web-server-1') // Returns 'web_server_1'
 * sanitizeId('My App') // Returns 'my_app'
 */
export function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

/**
 * Generates an AWS EC2 instance Terraform resource.
 *
 * Creates an EC2 instance configuration with appropriate subnet placement
 * based on the node's zone (DMZ uses public subnet, others use private).
 *
 * @param {InfraNodeSpec} node - The infrastructure node specification
 * @param {string} provider - Cloud provider (only generates for 'aws')
 * @param {string} tier - Instance tier (web, app, vm)
 * @returns {string} Terraform HCL configuration for the EC2 instance
 */
export function generateEC2Instance(node: InfraNodeSpec, provider: string, tier: string): string {
  if (provider !== 'aws') {
    return `# ${tier.toUpperCase()} Server: ${node.label}`;
  }

  return `
resource "aws_instance" "${sanitizeId(node.id)}" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.${node.zone === 'dmz' ? 'public' : 'private'}[0].id
  vpc_security_group_ids = [aws_security_group.${tier}.id]

  tags = {
    Name = "${node.label}"
    Tier = "${tier}"
  }
}`;
}

/**
 * Generates the Terraform provider configuration block.
 *
 * Creates the required_providers and provider blocks for the specified
 * cloud provider with the given region.
 *
 * @param {string} provider - Cloud provider ('aws', 'azure', or 'gcp')
 * @param {string} region - Cloud region (e.g., 'ap-northeast-2', 'us-east-1')
 * @returns {string} Terraform HCL for the provider configuration
 */
export function generateProviderBlock(provider: string, region: string): string {
  switch (provider) {
    case 'aws':
      return `
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}`;

    case 'azure':
      return `
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}`;

    case 'gcp':
      return `
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = "${region}"
}`;

    default:
      return `# Provider: ${provider}`;
  }
}

/**
 * Generates the Terraform variables block with common infrastructure variables.
 *
 * Creates variable definitions for sensitive values like database credentials
 * and project configuration.
 *
 * @returns {string} Terraform HCL for variable definitions
 */
export function generateVariablesBlock(): string {
  return `
variable "db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

variable "project_id" {
  description = "GCP Project ID (if using GCP)"
  type        = string
  default     = ""
}`;
}
