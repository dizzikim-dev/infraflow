/**
 * Terraform Storage, Cloud, Auth, External, Telecom, and WAN Resource Generators
 *
 * Generates Terraform HCL for storage, cloud networking, authentication,
 * external entities, telecom, and WAN infrastructure components.
 *
 * @module lib/export/terraform/storageResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import { sanitizeId } from './helpers';

/**
 * Storage, cloud, auth, external, telecom, and WAN node type resource generators.
 *
 * Maps these InfraNodeTypes to their Terraform resource generator functions.
 */
export const storageAndMiscResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, provider: string) => string>> = {
  // Cloud
  'aws-vpc': (node) => `
resource "aws_vpc" "${sanitizeId(node.id)}" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${node.label}"
  }
}`,

  'azure-vnet': (node) => `
resource "azurerm_virtual_network" "${sanitizeId(node.id)}" {
  name                = "${sanitizeId(node.id)}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.0.0.0/16"]

  tags = {
    Name = "${node.label}"
  }
}`,

  'gcp-network': (node) => `
resource "google_compute_network" "${sanitizeId(node.id)}" {
  name                    = "${sanitizeId(node.id)}"
  auto_create_subnetworks = false
}`,

  'private-cloud': (node) => `# Private Cloud: ${node.label}`,

  // Storage
  'san-nas': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_efs_file_system" "${sanitizeId(node.id)}" {
  creation_token = "${sanitizeId(node.id)}"
  encrypted      = true

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# SAN/NAS: ${node.label}`;
  },

  'object-storage': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_s3_bucket" "${sanitizeId(node.id)}" {
  bucket = "${sanitizeId(node.id)}-\${random_string.suffix.result}"

  tags = {
    Name = "${node.label}"
  }
}

resource "aws_s3_bucket_versioning" "${sanitizeId(node.id)}_versioning" {
  bucket = aws_s3_bucket.${sanitizeId(node.id)}.id
  versioning_configuration {
    status = "Enabled"
  }
}`;
    }
    return `# Object Storage: ${node.label}`;
  },

  'backup': (node) => `# Backup: ${node.label}`,
  'cache': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_elasticache_cluster" "${sanitizeId(node.id)}" {
  cluster_id           = "${sanitizeId(node.id)}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  security_group_ids   = [aws_security_group.cache.id]
  subnet_group_name    = aws_elasticache_subnet_group.main.name

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# Cache: ${node.label}`;
  },

  'elasticsearch': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_opensearch_domain" "${sanitizeId(node.id)}" {
  domain_name    = "${sanitizeId(node.id)}"
  engine_version = "OpenSearch_2.11"

  cluster_config {
    instance_type  = "r6g.large.search"
    instance_count = 3
  }

  ebs_options {
    ebs_enabled = true
    volume_size = 100
    volume_type = "gp3"
  }

  encrypt_at_rest {
    enabled = true
  }

  node_to_node_encryption {
    enabled = true
  }

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    if (provider === 'azure') {
      return `
resource "azurerm_search_service" "${sanitizeId(node.id)}" {
  name                = "${sanitizeId(node.id)}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "standard"
  replica_count       = 3
  partition_count     = 1
}`;
    }
    return `# Elasticsearch: ${node.label}`;
  },

  'storage': (node) => `# Storage: ${node.label}`,

  // Auth
  'ldap-ad': (node) => `# LDAP/AD: ${node.label}`,
  'sso': (node) => `# SSO: ${node.label}`,
  'mfa': (node) => `# MFA: ${node.label}`,
  'iam': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_iam_role" "${sanitizeId(node.id)}" {
  name = "${sanitizeId(node.id)}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# IAM: ${node.label}`;
  },

  // External
  'user': () => `# User/Client - External entity`,
  'internet': () => `# Internet - External network`,

  // Zone
  'zone': (node) => `# Zone: ${node.label} - Network zone boundary`,

  // Telecom
  'central-office': (node) => `# Central Office: ${node.label} - Telecom facility`,
  'base-station': (node) => `# Base Station: ${node.label} - Wireless access point`,
  'olt': (node) => `# OLT: ${node.label} - Optical line terminal`,
  'customer-premise': (node) => `# Customer Premise: ${node.label} - CPE equipment`,
  'idc': (node) => `# IDC: ${node.label} - Internet data center`,

  // WAN
  'pe-router': (node) => `# PE Router: ${node.label} - Provider edge router`,
  'p-router': (node) => `# P Router: ${node.label} - Provider core router`,
  'mpls-network': (node) => `# MPLS Network: ${node.label} - MPLS backbone`,
  'dedicated-line': (node) => `# Dedicated Line: ${node.label} - Leased line`,
  'metro-ethernet': (node) => `# Metro Ethernet: ${node.label} - Metro ethernet service`,
  'corporate-internet': (node) => `# Corporate Internet: ${node.label} - Enterprise internet`,
  'vpn-service': (node) => `# VPN Service: ${node.label} - MPLS VPN service`,
  'sd-wan-service': (node) => `# SD-WAN Service: ${node.label} - SD-WAN overlay`,
  'private-5g': (node) => `# Private 5G: ${node.label} - Private 5G network`,
  'core-network': (node) => `# Core Network: ${node.label} - Mobile core network`,
  'upf': (node) => `# UPF: ${node.label} - User plane function`,
  'ring-network': (node) => `# Ring Network: ${node.label} - Ring topology`,
};
