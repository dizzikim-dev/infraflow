/**
 * Terraform Export Module
 *
 * This module converts InfraFlow infrastructure specifications to Terraform HCL format.
 * It supports multiple cloud providers (AWS, Azure, GCP) and generates production-ready
 * Terraform configurations.
 *
 * @module lib/export/terraformExport
 *
 * @example
 * import { exportToTerraform } from '@/lib/export/terraformExport';
 *
 * const terraform = exportToTerraform(infraSpec, {
 *   provider: 'aws',
 *   region: 'ap-northeast-2',
 *   includeVariables: true,
 *   includeOutputs: true
 * });
 *
 * console.log(terraform);
 * // Outputs HCL configuration
 */

import { InfraSpec, InfraNodeSpec, InfraNodeType } from '@/types';

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

/**
 * Maps InfraFlow node types to Terraform resource generator functions.
 *
 * Each node type has a corresponding function that generates the appropriate
 * Terraform HCL configuration for the target cloud provider.
 *
 * @constant
 * @type {Record<InfraNodeType, (node: InfraNodeSpec, provider: string) => string>}
 *
 * Supported node types include:
 * - Security: firewall, waf, ids-ips, vpn-gateway, nac, dlp
 * - Network: router, switch-l2, switch-l3, load-balancer, sd-wan, dns, cdn
 * - Compute: web-server, app-server, db-server, container, vm, kubernetes
 * - Cloud: aws-vpc, azure-vnet, gcp-network, private-cloud
 * - Storage: san-nas, object-storage, backup, cache, storage
 * - Auth: ldap-ad, sso, mfa, iam
 * - External: user, internet, zone
 */
const terraformResourceMap: Record<InfraNodeType, (node: InfraNodeSpec, provider: string) => string> = {
  // Security
  'firewall': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_security_group" "${sanitizeId(node.id)}" {
  name        = "${node.label}"
  description = "${node.description || 'Managed by InfraFlow'}"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# Firewall: ${node.label}`;
  },

  'waf': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_wafv2_web_acl" "${sanitizeId(node.id)}" {
  name        = "${sanitizeId(node.id)}"
  description = "${node.description || 'WAF managed by InfraFlow'}"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${sanitizeId(node.id)}-metric"
    sampled_requests_enabled   = true
  }
}`;
    }
    return `# WAF: ${node.label}`;
  },

  'ids-ips': (node) => `# IDS/IPS: ${node.label} - Use GuardDuty or third-party solution`,
  'vpn-gateway': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_vpn_gateway" "${sanitizeId(node.id)}" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# VPN Gateway: ${node.label}`;
  },
  'nac': (node) => `# NAC: ${node.label} - Network Access Control configuration`,
  'dlp': (node) => `# DLP: ${node.label} - Data Loss Prevention configuration`,

  // Network
  'router': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_route_table" "${sanitizeId(node.id)}" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# Router: ${node.label}`;
  },

  'switch-l2': (node) => `# L2 Switch: ${node.label} - Managed at network layer`,
  'switch-l3': (node) => `# L3 Switch: ${node.label} - Managed at network layer`,

  'load-balancer': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_lb" "${sanitizeId(node.id)}" {
  name               = "${sanitizeId(node.id)}"
  internal           = ${node.zone === 'internal'}
  load_balancer_type = "application"
  security_groups    = [aws_security_group.main.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${node.label}"
  }
}

resource "aws_lb_target_group" "${sanitizeId(node.id)}_tg" {
  name     = "${sanitizeId(node.id)}-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 10
  }
}

resource "aws_lb_listener" "${sanitizeId(node.id)}_listener" {
  load_balancer_arn = aws_lb.${sanitizeId(node.id)}.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.${sanitizeId(node.id)}_tg.arn
  }
}`;
    }
    return `# Load Balancer: ${node.label}`;
  },

  'sd-wan': (node) => `# SD-WAN: ${node.label} - Software-defined WAN configuration`,
  'dns': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_route53_zone" "${sanitizeId(node.id)}" {
  name = "example.com"  # Replace with your domain

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# DNS: ${node.label}`;
  },

  'cdn': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_cloudfront_distribution" "${sanitizeId(node.id)}" {
  enabled             = true
  comment             = "${node.description || node.label}"
  default_root_object = "index.html"

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# CDN: ${node.label}`;
  },

  // Compute
  'web-server': (node, provider) => generateEC2Instance(node, provider, 'web'),
  'app-server': (node, provider) => generateEC2Instance(node, provider, 'app'),
  'db-server': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_db_instance" "${sanitizeId(node.id)}" {
  identifier             = "${sanitizeId(node.id)}"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.medium"
  allocated_storage      = 20
  storage_type           = "gp3"
  db_name                = "appdb"
  username               = var.db_username
  password               = var.db_password
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  skip_final_snapshot    = true

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# Database: ${node.label}`;
  },

  'container': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_ecs_cluster" "${sanitizeId(node.id)}" {
  name = "${sanitizeId(node.id)}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# Container: ${node.label}`;
  },

  'vm': (node, provider) => generateEC2Instance(node, provider, 'vm'),
  'kubernetes': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_eks_cluster" "${sanitizeId(node.id)}" {
  name     = "${sanitizeId(node.id)}"
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    return `# Kubernetes: ${node.label}`;
  },

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
};

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
function generateEC2Instance(node: InfraNodeSpec, provider: string, tier: string): string {
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
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
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
function generateProviderBlock(provider: string, region: string): string {
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
function generateVariablesBlock(): string {
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

/**
 * Exports an InfraSpec to Terraform HCL format.
 *
 * Converts an infrastructure specification into a complete Terraform configuration
 * including provider setup, variables, resources, and outputs.
 *
 * @param {InfraSpec} spec - The infrastructure specification to export
 * @param {TerraformExportOptions} [options={}] - Export configuration options
 * @returns {string} Complete Terraform HCL configuration
 *
 * @example
 * const terraform = exportToTerraform(spec, {
 *   provider: 'aws',
 *   region: 'us-west-2',
 *   includeVariables: true,
 *   includeOutputs: true
 * });
 *
 * // Save to file
 * fs.writeFileSync('main.tf', terraform);
 */
export function exportToTerraform(
  spec: InfraSpec,
  options: TerraformExportOptions = {}
): string {
  const {
    provider = 'aws',
    region = 'ap-northeast-2',
    includeVariables = true,
    includeOutputs = true,
  } = options;

  const sections: string[] = [];

  // Header comment
  sections.push(`# Terraform configuration generated by InfraFlow
# Provider: ${provider.toUpperCase()}
# Generated: ${new Date().toISOString()}
`);

  // Provider block
  sections.push(generateProviderBlock(provider, region));

  // Variables
  if (includeVariables) {
    sections.push(generateVariablesBlock());
  }

  // Resources
  sections.push('\n# ============= Resources =============\n');

  for (const node of spec.nodes) {
    const resourceGenerator = terraformResourceMap[node.type];
    if (resourceGenerator) {
      sections.push(resourceGenerator(node, provider));
    } else {
      sections.push(`# Unknown node type: ${node.type} - ${node.label}`);
    }
  }

  // Outputs
  if (includeOutputs) {
    sections.push('\n# ============= Outputs =============\n');
    sections.push(`
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}
`);
  }

  return sections.join('\n');
}
