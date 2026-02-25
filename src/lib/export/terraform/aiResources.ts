/**
 * Terraform AI Resource Generators
 *
 * Generates Terraform HCL for AI-related infrastructure components
 * including GPU servers, AI clusters, inference engines, vector databases,
 * and other AI compute and service nodes.
 *
 * @module lib/export/terraform/aiResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import { sanitizeId } from './helpers';

/**
 * AI node type resource generators.
 *
 * Maps AI-related InfraNodeTypes (ai-compute and ai-service categories)
 * to their Terraform resource generator functions.
 */
export const aiResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, provider: string) => string>> = {
  // AI Compute
  'gpu-server': (node, provider) => {
    if (provider === 'aws') return `\nresource "aws_instance" "${sanitizeId(node.id)}" {\n  ami           = "ami-gpu-server"\n  instance_type = "p4d.24xlarge"\n  tags = {\n    Name = "${node.label}"\n    managed-by = "infraflow"\n  }\n}\n`;
    if (provider === 'azure') return `\nresource "azurerm_linux_virtual_machine" "${sanitizeId(node.id)}" {\n  name                = "${sanitizeId(node.id)}"\n  resource_group_name = azurerm_resource_group.main.name\n  location            = azurerm_resource_group.main.location\n  size                = "Standard_ND96asr_v4"\n  admin_username      = "adminuser"\n  network_interface_ids = []\n  os_disk {\n    caching              = "ReadWrite"\n    storage_account_type = "Premium_LRS"\n  }\n  source_image_reference {\n    publisher = "Canonical"\n    offer     = "UbuntuServer"\n    sku       = "20.04-LTS"\n    version   = "latest"\n  }\n}\n`;
    return `\nresource "google_compute_instance" "${sanitizeId(node.id)}" {\n  name         = "${sanitizeId(node.id)}"\n  machine_type = "a2-ultragpu-8g"\n  zone         = var.zone\n  boot_disk {\n    initialize_params {\n      image = "ubuntu-os-cloud/ubuntu-2004-lts"\n    }\n  }\n  guest_accelerator {\n    type  = "nvidia-a100-80gb"\n    count = 8\n  }\n}\n`;
  },
  'ai-accelerator': (node) => `# AI Accelerator: ${node.label} - Physical/cloud AI accelerator`,
  'edge-device': (node) => `# Edge Device: ${node.label} - Edge AI device (on-premise)`,
  'mobile-device': (node) => `# Mobile Device: ${node.label} - Mobile AI device (on-device)`,
  'ai-cluster': (node, provider) => {
    if (provider === 'aws') return `\nresource "aws_sagemaker_cluster" "${sanitizeId(node.id)}" {\n  # AI Cluster: ${node.label}\n  # Configure via SageMaker HyperPod or EKS with GPU nodes\n}\n`;
    return `# AI Cluster: ${node.label} - Multi-node GPU cluster`;
  },
  'model-registry': (node, provider) => {
    if (provider === 'aws') return `\nresource "aws_sagemaker_model_package_group" "${sanitizeId(node.id)}" {\n  model_package_group_name = "${sanitizeId(node.id)}"\n  model_package_group_description = "${node.label} - Managed by InfraFlow"\n}\n`;
    return `# Model Registry: ${node.label}`;
  },

  // AI Service
  'inference-engine': (node, provider) => {
    if (provider === 'aws') return `\nresource "aws_sagemaker_endpoint" "${sanitizeId(node.id)}" {\n  name = "${sanitizeId(node.id)}"\n  endpoint_config_name = aws_sagemaker_endpoint_configuration.${sanitizeId(node.id)}.name\n  tags = {\n    Name = "${node.label}"\n    managed-by = "infraflow"\n  }\n}\n`;
    return `# Inference Engine: ${node.label}`;
  },
  'vector-db': (node, provider) => {
    if (provider === 'aws') return `\nresource "aws_opensearchserverless_collection" "${sanitizeId(node.id)}" {\n  name = "${sanitizeId(node.id)}"\n  type = "VECTORSEARCH"\n  tags = {\n    Name = "${node.label}"\n    managed-by = "infraflow"\n  }\n}\n`;
    return `# Vector Database: ${node.label}`;
  },
  'ai-gateway': (node) => `# AI Gateway: ${node.label} - LiteLLM/Kong AI proxy`,
  'ai-orchestrator': (node) => `# AI Orchestrator: ${node.label} - LangChain/CrewAI`,
  'embedding-service': (node) => `# Embedding Service: ${node.label}`,
  'training-platform': (node, provider) => {
    if (provider === 'aws') return `\nresource "aws_sagemaker_notebook_instance" "${sanitizeId(node.id)}" {\n  name          = "${sanitizeId(node.id)}"\n  instance_type = "ml.g5.2xlarge"\n  role_arn      = aws_iam_role.sagemaker.arn\n  tags = {\n    Name = "${node.label}"\n    managed-by = "infraflow"\n  }\n}\n`;
    return `# Training Platform: ${node.label}`;
  },
  'prompt-manager': (node) => `# Prompt Manager: ${node.label}`,
  'ai-monitor': (node) => `# AI Monitor: ${node.label}`,
};
