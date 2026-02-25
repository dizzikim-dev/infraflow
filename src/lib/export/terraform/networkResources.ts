/**
 * Terraform Network Resource Generators
 *
 * Generates Terraform HCL for network-related infrastructure components
 * including routers, switches, load balancers, API gateways, DNS, and CDN.
 *
 * @module lib/export/terraform/networkResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import { sanitizeId } from './helpers';

/**
 * Network node type resource generators.
 *
 * Maps network-related InfraNodeTypes to their Terraform resource generator functions.
 */
export const networkResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, provider: string) => string>> = {
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

  'api-gateway': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_apigatewayv2_api" "${sanitizeId(node.id)}" {
  name          = "${sanitizeId(node.id)}"
  protocol_type = "HTTP"
  description   = "${node.description || 'API Gateway managed by InfraFlow'}"

  tags = {
    Name = "${node.label}"
  }
}

resource "aws_apigatewayv2_stage" "${sanitizeId(node.id)}_default" {
  api_id      = aws_apigatewayv2_api.${sanitizeId(node.id)}.id
  name        = "$default"
  auto_deploy = true
}`;
    }
    if (provider === 'azure') {
      return `
resource "azurerm_api_management" "${sanitizeId(node.id)}" {
  name                = "${sanitizeId(node.id)}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  publisher_name      = "InfraFlow"
  publisher_email     = "admin@example.com"
  sku_name            = "Consumption_0"
}`;
    }
    return `# API Gateway: ${node.label}`;
  },

  'sd-wan': (node) => `# SD-WAN: ${node.label} - Software-defined WAN configuration`,
  'wireless-ap': (node) => `# Wireless AP: ${node.label} - Physical access point (not Terraform-managed)`,
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
};
