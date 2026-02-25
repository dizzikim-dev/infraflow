/**
 * Terraform Compute Resource Generators
 *
 * Generates Terraform HCL for compute-related infrastructure components
 * including web/app/db servers, containers, Kubernetes, message queues,
 * and monitoring services.
 *
 * @module lib/export/terraform/computeResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import { sanitizeId, generateEC2Instance } from './helpers';

/**
 * Compute node type resource generators.
 *
 * Maps compute-related InfraNodeTypes to their Terraform resource generator functions.
 * Includes servers, containers, Kubernetes, message queues, and monitoring.
 */
export const computeResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, provider: string) => string>> = {
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

  'kafka': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_msk_cluster" "${sanitizeId(node.id)}" {
  cluster_name           = "${sanitizeId(node.id)}"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = aws_subnet.private[*].id
    security_groups = [aws_security_group.kafka.id]

    storage_info {
      ebs_storage_info {
        volume_size = 100
      }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    if (provider === 'azure') {
      return `
resource "azurerm_eventhub_namespace" "${sanitizeId(node.id)}" {
  name                = "${sanitizeId(node.id)}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "Standard"
  capacity            = 2
}`;
    }
    return `# Kafka: ${node.label}`;
  },

  'rabbitmq': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_mq_broker" "${sanitizeId(node.id)}" {
  broker_name   = "${sanitizeId(node.id)}"
  engine_type   = "RabbitMQ"
  engine_version = "3.11"
  host_instance_type = "mq.m5.large"
  deployment_mode    = "CLUSTER_MULTI_AZ"
  publicly_accessible = false

  user {
    username = "admin"
    password = var.rabbitmq_password
  }

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    // TODO: Add Azure (azurerm_servicebus_namespace) and GCP support
    return `# RabbitMQ: ${node.label} — Azure/GCP not yet implemented`;
  },

  'prometheus': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_prometheus_workspace" "${sanitizeId(node.id)}" {
  alias = "${sanitizeId(node.id)}"

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    // TODO: Add Azure (azurerm_monitor_workspace) and GCP support
    return `# Prometheus: ${node.label} — Azure/GCP not yet implemented`;
  },

  'grafana': (node, provider) => {
    if (provider === 'aws') {
      return `
resource "aws_grafana_workspace" "${sanitizeId(node.id)}" {
  name                     = "${sanitizeId(node.id)}"
  account_access_type      = "CURRENT_ACCOUNT"
  authentication_providers = ["AWS_SSO"]
  permission_type          = "SERVICE_MANAGED"
  role_arn                 = aws_iam_role.grafana.arn

  tags = {
    Name = "${node.label}"
  }
}`;
    }
    // TODO: Add Azure (azurerm_dashboard_grafana) and GCP support
    return `# Grafana: ${node.label} — Azure/GCP not yet implemented`;
  },
};
