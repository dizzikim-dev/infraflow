/**
 * Terraform Security Resource Generators
 *
 * Generates Terraform HCL for security-related infrastructure components
 * including firewalls, WAF, VPN gateways, and other security services.
 *
 * @module lib/export/terraform/securityResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import { sanitizeId } from './helpers';

/**
 * Security node type resource generators.
 *
 * Maps security-related InfraNodeTypes to their Terraform resource generator functions.
 */
export const securityResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, provider: string) => string>> = {
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
  'sase-gateway': (node) => `# SASE Gateway: ${node.label} - Secure Access Service Edge gateway`,
  'ztna-broker': (node) => `# ZTNA Broker: ${node.label} - Zero Trust Network Access broker`,
  'casb': (node) => `# CASB: ${node.label} - Cloud Access Security Broker`,
  'siem': (node) => `# SIEM: ${node.label} - Security Information and Event Management`,
  'soar': (node) => `# SOAR: ${node.label} - Security Orchestration, Automation and Response`,
  'cctv-camera': (node) => `# CCTV Camera: ${node.label} - IP surveillance camera`,
  'nvr': (node) => `# NVR: ${node.label} - Network Video Recorder`,
  'video-server': (node) => `# Video Server: ${node.label} - Video Management System`,
  'access-control': (node) => `# Access Control: ${node.label} - Physical access control system`,
};
