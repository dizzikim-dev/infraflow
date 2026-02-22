/**
 * InfraFlow - Cloud Cost Data
 *
 * Hardcoded base pricing data (USD, monthly) for each InfraNodeType
 * across AWS, Azure, GCP, and on-prem providers.
 *
 * Extracted from costEstimator.ts for maintainability.
 */

import type { InfraNodeType } from '@/types';

export const BASE_COSTS: Record<InfraNodeType, {
  aws: { service: string; cost: number; tier: string };
  azure: { service: string; cost: number; tier: string };
  gcp: { service: string; cost: number; tier: string };
  onprem: { service: string; cost: number; tier: string };
}> = {
  // Security
  firewall: {
    aws: { service: 'AWS Network Firewall', cost: 450, tier: 'Standard' },
    azure: { service: 'Azure Firewall', cost: 912, tier: 'Standard' },
    gcp: { service: 'Cloud Firewall', cost: 0, tier: 'Included' },
    onprem: { service: 'Enterprise Firewall', cost: 500, tier: 'Estimated' },
  },
  waf: {
    aws: { service: 'AWS WAF', cost: 25, tier: 'Basic (5 rules)' },
    azure: { service: 'Azure WAF', cost: 175, tier: 'Standard' },
    gcp: { service: 'Cloud Armor', cost: 200, tier: 'Standard' },
    onprem: { service: 'WAF Appliance', cost: 800, tier: 'Estimated' },
  },
  'ids-ips': {
    aws: { service: 'AWS GuardDuty', cost: 35, tier: 'Standard' },
    azure: { service: 'Azure Defender', cost: 15, tier: 'Per Server' },
    gcp: { service: 'Cloud IDS', cost: 250, tier: 'Standard' },
    onprem: { service: 'IDS/IPS Appliance', cost: 600, tier: 'Estimated' },
  },
  'vpn-gateway': {
    aws: { service: 'AWS VPN', cost: 36.5, tier: 'Standard' },
    azure: { service: 'Azure VPN Gateway', cost: 140, tier: 'VpnGw1' },
    gcp: { service: 'Cloud VPN', cost: 36.5, tier: 'Standard' },
    onprem: { service: 'VPN Appliance', cost: 200, tier: 'Estimated' },
  },
  nac: {
    aws: { service: 'AWS Verified Access', cost: 100, tier: 'Standard' },
    azure: { service: 'Azure AD P2', cost: 9, tier: 'Per User' },
    gcp: { service: 'BeyondCorp', cost: 6, tier: 'Per User' },
    onprem: { service: 'NAC Solution', cost: 300, tier: 'Estimated' },
  },
  dlp: {
    aws: { service: 'Amazon Macie', cost: 100, tier: 'Standard' },
    azure: { service: 'Microsoft Purview', cost: 200, tier: 'Standard' },
    gcp: { service: 'Cloud DLP', cost: 75, tier: 'Standard' },
    onprem: { service: 'DLP Solution', cost: 500, tier: 'Estimated' },
  },
  'sase-gateway': {
    aws: { service: 'AWS Verified Access + CloudWAN', cost: 800, tier: 'Standard' },
    azure: { service: 'Azure SASE', cost: 750, tier: 'Standard' },
    gcp: { service: 'BeyondCorp Enterprise', cost: 700, tier: 'Standard' },
    onprem: { service: 'SASE Gateway Appliance', cost: 1200, tier: 'Estimated' },
  },
  'ztna-broker': {
    aws: { service: 'AWS Verified Access', cost: 300, tier: 'Standard' },
    azure: { service: 'Azure AD App Proxy', cost: 250, tier: 'Standard' },
    gcp: { service: 'BeyondCorp', cost: 200, tier: 'Standard' },
    onprem: { service: 'ZTNA Broker Solution', cost: 600, tier: 'Estimated' },
  },
  casb: {
    aws: { service: 'AWS CloudTrail + Macie', cost: 200, tier: 'Standard' },
    azure: { service: 'Microsoft Defender for Cloud Apps', cost: 350, tier: 'Standard' },
    gcp: { service: 'Google Cloud SCC', cost: 250, tier: 'Standard' },
    onprem: { service: 'CASB Solution', cost: 800, tier: 'Estimated' },
  },
  siem: {
    aws: { service: 'Amazon Security Lake + OpenSearch', cost: 500, tier: 'Standard' },
    azure: { service: 'Microsoft Sentinel', cost: 450, tier: 'Standard' },
    gcp: { service: 'Chronicle SIEM', cost: 400, tier: 'Standard' },
    onprem: { service: 'SIEM Solution', cost: 1000, tier: 'Estimated' },
  },
  soar: {
    aws: { service: 'AWS Security Hub + Step Functions', cost: 300, tier: 'Standard' },
    azure: { service: 'Microsoft Sentinel SOAR', cost: 350, tier: 'Standard' },
    gcp: { service: 'Chronicle SOAR', cost: 300, tier: 'Standard' },
    onprem: { service: 'SOAR Platform', cost: 900, tier: 'Estimated' },
  },
  'cctv-camera': {
    aws: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    onprem: { service: 'IP Camera', cost: 300, tier: 'Per Unit' },
  },
  nvr: {
    aws: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    onprem: { service: 'Network Video Recorder', cost: 800, tier: 'Per Unit' },
  },
  'video-server': {
    aws: { service: 'Amazon Kinesis Video Streams', cost: 200, tier: 'Standard' },
    azure: { service: 'Azure Video Analyzer', cost: 250, tier: 'Standard' },
    gcp: { service: 'Vertex AI Vision', cost: 200, tier: 'Standard' },
    onprem: { service: 'VMS Server', cost: 2000, tier: 'Estimated' },
  },
  'access-control': {
    aws: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A (Physical Device)', cost: 0, tier: 'N/A' },
    onprem: { service: 'Access Control System', cost: 500, tier: 'Per Door' },
  },

  // Network
  router: {
    aws: { service: 'Transit Gateway', cost: 36.5, tier: 'Per Attachment' },
    azure: { service: 'Virtual WAN Hub', cost: 328.5, tier: 'Standard' },
    gcp: { service: 'Cloud Router', cost: 0, tier: 'Included' },
    onprem: { service: 'Enterprise Router', cost: 150, tier: 'Estimated' },
  },
  'switch-l2': {
    aws: { service: 'VPC (Included)', cost: 0, tier: 'Included' },
    azure: { service: 'VNet (Included)', cost: 0, tier: 'Included' },
    gcp: { service: 'VPC (Included)', cost: 0, tier: 'Included' },
    onprem: { service: 'L2 Switch', cost: 100, tier: 'Estimated' },
  },
  'switch-l3': {
    aws: { service: 'VPC + Route Tables', cost: 0, tier: 'Included' },
    azure: { service: 'VNet + Route Tables', cost: 0, tier: 'Included' },
    gcp: { service: 'VPC Routes', cost: 0, tier: 'Included' },
    onprem: { service: 'L3 Switch', cost: 200, tier: 'Estimated' },
  },
  'load-balancer': {
    aws: { service: 'ALB', cost: 22.5, tier: 'Standard' },
    azure: { service: 'Azure Load Balancer', cost: 18, tier: 'Standard' },
    gcp: { service: 'Cloud Load Balancing', cost: 18, tier: 'Standard' },
    onprem: { service: 'Load Balancer', cost: 300, tier: 'Estimated' },
  },
  'api-gateway': {
    aws: { service: 'AWS API Gateway', cost: 35, tier: 'HTTP API' },
    azure: { service: 'Azure API Management', cost: 50, tier: 'Consumption' },
    gcp: { service: 'Apigee', cost: 300, tier: 'Standard' },
    onprem: { service: 'Kong/NGINX', cost: 100, tier: 'Estimated' },
  },
  'sd-wan': {
    aws: { service: 'AWS Cloud WAN', cost: 100, tier: 'Standard' },
    azure: { service: 'Azure Virtual WAN', cost: 328.5, tier: 'Standard' },
    gcp: { service: 'Network Connectivity Center', cost: 50, tier: 'Standard' },
    onprem: { service: 'SD-WAN Appliance', cost: 400, tier: 'Estimated' },
  },
  'wireless-ap': {
    aws: { service: 'N/A (Physical AP)', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A (Physical AP)', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A (Physical AP)', cost: 0, tier: 'N/A' },
    onprem: { service: 'Wireless Access Point', cost: 500, tier: 'Estimated' },
  },
  dns: {
    aws: { service: 'Route 53', cost: 0.5, tier: 'Per Zone' },
    azure: { service: 'Azure DNS', cost: 0.5, tier: 'Per Zone' },
    gcp: { service: 'Cloud DNS', cost: 0.2, tier: 'Per Zone' },
    onprem: { service: 'DNS Server', cost: 50, tier: 'Estimated' },
  },
  cdn: {
    aws: { service: 'CloudFront', cost: 85, tier: '1TB Transfer' },
    azure: { service: 'Azure CDN', cost: 75, tier: '1TB Transfer' },
    gcp: { service: 'Cloud CDN', cost: 80, tier: '1TB Transfer' },
    onprem: { service: 'CDN Service', cost: 100, tier: 'Estimated' },
  },

  // Compute
  'web-server': {
    aws: { service: 'EC2 t3.medium', cost: 30, tier: 'Standard' },
    azure: { service: 'VM B2s', cost: 30, tier: 'Standard' },
    gcp: { service: 'e2-medium', cost: 25, tier: 'Standard' },
    onprem: { service: 'Web Server', cost: 100, tier: 'Estimated' },
  },
  'app-server': {
    aws: { service: 'EC2 t3.large', cost: 60, tier: 'Standard' },
    azure: { service: 'VM B4ms', cost: 60, tier: 'Standard' },
    gcp: { service: 'e2-standard-4', cost: 97, tier: 'Standard' },
    onprem: { service: 'App Server', cost: 150, tier: 'Estimated' },
  },
  'db-server': {
    aws: { service: 'RDS db.t3.medium', cost: 50, tier: 'Standard' },
    azure: { service: 'Azure SQL', cost: 75, tier: 'Standard S0' },
    gcp: { service: 'Cloud SQL', cost: 52, tier: 'db-f1-micro' },
    onprem: { service: 'DB Server', cost: 200, tier: 'Estimated' },
  },
  container: {
    aws: { service: 'Fargate (2vCPU, 4GB)', cost: 58, tier: 'Standard' },
    azure: { service: 'Container Instances', cost: 45, tier: 'Standard' },
    gcp: { service: 'Cloud Run', cost: 40, tier: 'Standard' },
    onprem: { service: 'Container Host', cost: 100, tier: 'Estimated' },
  },
  vm: {
    aws: { service: 'EC2 t3.medium', cost: 30, tier: 'Standard' },
    azure: { service: 'VM B2s', cost: 30, tier: 'Standard' },
    gcp: { service: 'e2-medium', cost: 25, tier: 'Standard' },
    onprem: { service: 'Virtual Machine', cost: 50, tier: 'Estimated' },
  },
  kubernetes: {
    aws: { service: 'EKS Cluster', cost: 72, tier: 'Standard' },
    azure: { service: 'AKS', cost: 0, tier: 'Free Tier' },
    gcp: { service: 'GKE Autopilot', cost: 72, tier: 'Standard' },
    onprem: { service: 'K8s Cluster', cost: 300, tier: 'Estimated' },
  },
  kafka: {
    aws: { service: 'Amazon MSK', cost: 350, tier: 'kafka.m5.large x3' },
    azure: { service: 'Azure Event Hubs', cost: 300, tier: 'Standard' },
    gcp: { service: 'Confluent Cloud on GCP', cost: 400, tier: 'Standard' },
    onprem: { service: 'Kafka Cluster', cost: 200, tier: 'Estimated' },
  },
  rabbitmq: {
    aws: { service: 'Amazon MQ (RabbitMQ)', cost: 150, tier: 'mq.m5.large' },
    azure: { service: 'Azure Service Bus', cost: 100, tier: 'Standard' },
    gcp: { service: 'Cloud Pub/Sub', cost: 50, tier: 'Standard' },
    onprem: { service: 'RabbitMQ Server', cost: 100, tier: 'Estimated' },
  },
  prometheus: {
    aws: { service: 'Amazon Managed Prometheus', cost: 100, tier: 'Standard' },
    azure: { service: 'Azure Monitor', cost: 80, tier: 'Standard' },
    gcp: { service: 'Cloud Monitoring', cost: 0, tier: 'Included' },
    onprem: { service: 'Prometheus Server', cost: 50, tier: 'Estimated' },
  },
  grafana: {
    aws: { service: 'Amazon Managed Grafana', cost: 9, tier: 'Per Editor' },
    azure: { service: 'Azure Managed Grafana', cost: 20, tier: 'Standard' },
    gcp: { service: 'Grafana Cloud', cost: 0, tier: 'Free Tier' },
    onprem: { service: 'Grafana Server', cost: 25, tier: 'Estimated' },
  },

  // Cloud
  'aws-vpc': {
    aws: { service: 'VPC', cost: 0, tier: 'Free' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  'azure-vnet': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'Virtual Network', cost: 0, tier: 'Free' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  'gcp-network': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'VPC Network', cost: 0, tier: 'Free' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  'private-cloud': {
    aws: { service: 'Outposts', cost: 5000, tier: 'Rack' },
    azure: { service: 'Azure Stack', cost: 4000, tier: 'Hub' },
    gcp: { service: 'Anthos', cost: 500, tier: 'Per Cluster' },
    onprem: { service: 'Private Cloud', cost: 2000, tier: 'Estimated' },
  },

  // Storage
  'san-nas': {
    aws: { service: 'FSx', cost: 230, tier: '1TB' },
    azure: { service: 'Azure Files', cost: 100, tier: '1TB Premium' },
    gcp: { service: 'Filestore', cost: 204, tier: '1TB' },
    onprem: { service: 'SAN/NAS', cost: 500, tier: 'Estimated' },
  },
  'object-storage': {
    aws: { service: 'S3', cost: 23, tier: '1TB Standard' },
    azure: { service: 'Blob Storage', cost: 21, tier: '1TB Hot' },
    gcp: { service: 'Cloud Storage', cost: 20, tier: '1TB Standard' },
    onprem: { service: 'Object Storage', cost: 100, tier: 'Estimated' },
  },
  backup: {
    aws: { service: 'AWS Backup', cost: 50, tier: '1TB' },
    azure: { service: 'Azure Backup', cost: 25, tier: '1TB' },
    gcp: { service: 'Backup Service', cost: 30, tier: '1TB' },
    onprem: { service: 'Backup Solution', cost: 100, tier: 'Estimated' },
  },
  cache: {
    aws: { service: 'ElastiCache Redis', cost: 25, tier: 'cache.t3.micro' },
    azure: { service: 'Azure Cache Redis', cost: 16, tier: 'Basic C0' },
    gcp: { service: 'Memorystore', cost: 35, tier: 'Basic 1GB' },
    onprem: { service: 'Redis Server', cost: 50, tier: 'Estimated' },
  },
  elasticsearch: {
    aws: { service: 'Amazon OpenSearch', cost: 200, tier: 'r6g.large x3' },
    azure: { service: 'Azure Cognitive Search', cost: 250, tier: 'Standard' },
    gcp: { service: 'Elastic Cloud on GCP', cost: 175, tier: 'Standard' },
    onprem: { service: 'Elasticsearch Cluster', cost: 150, tier: 'Estimated' },
  },
  storage: {
    aws: { service: 'EBS gp3', cost: 80, tier: '1TB' },
    azure: { service: 'Managed Disk', cost: 77, tier: '1TB Premium SSD' },
    gcp: { service: 'Persistent Disk', cost: 68, tier: '1TB SSD' },
    onprem: { service: 'Storage', cost: 100, tier: 'Estimated' },
  },

  // Auth
  'ldap-ad': {
    aws: { service: 'AWS Directory Service', cost: 109, tier: 'Standard' },
    azure: { service: 'Azure AD DS', cost: 109, tier: 'Standard' },
    gcp: { service: 'Managed AD', cost: 109, tier: 'Standard' },
    onprem: { service: 'Active Directory', cost: 100, tier: 'Estimated' },
  },
  sso: {
    aws: { service: 'AWS IAM Identity Center', cost: 0, tier: 'Free' },
    azure: { service: 'Azure AD SSO', cost: 0, tier: 'Included' },
    gcp: { service: 'Cloud Identity', cost: 0, tier: 'Free Tier' },
    onprem: { service: 'SSO Solution', cost: 200, tier: 'Estimated' },
  },
  mfa: {
    aws: { service: 'AWS MFA', cost: 0, tier: 'Free' },
    azure: { service: 'Azure MFA', cost: 6, tier: 'Per User' },
    gcp: { service: '2-Step Verification', cost: 0, tier: 'Free' },
    onprem: { service: 'MFA Solution', cost: 100, tier: 'Estimated' },
  },
  iam: {
    aws: { service: 'AWS IAM', cost: 0, tier: 'Free' },
    azure: { service: 'Azure AD', cost: 0, tier: 'Free Tier' },
    gcp: { service: 'Cloud IAM', cost: 0, tier: 'Free' },
    onprem: { service: 'IAM Solution', cost: 150, tier: 'Estimated' },
  },

  // External
  user: {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  internet: {
    aws: { service: 'Data Transfer Out', cost: 90, tier: '1TB' },
    azure: { service: 'Bandwidth', cost: 87, tier: '1TB' },
    gcp: { service: 'Egress', cost: 120, tier: '1TB' },
    onprem: { service: 'Internet', cost: 100, tier: 'Estimated' },
  },
  zone: {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'N/A', cost: 0, tier: 'N/A' },
  },
  // Telecom
  'central-office': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Central Office', cost: 5000, tier: 'Estimated' },
  },
  'base-station': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Base Station (gNB)', cost: 10000, tier: 'Estimated' },
  },
  'olt': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'OLT', cost: 3000, tier: 'Estimated' },
  },
  'customer-premise': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'CPE Router', cost: 500, tier: 'Estimated' },
  },
  'idc': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'IDC Colocation', cost: 2000, tier: 'Monthly' },
  },
  // WAN
  'pe-router': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'PE Router', cost: 8000, tier: 'Estimated' },
  },
  'p-router': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'P Router', cost: 15000, tier: 'Estimated' },
  },
  'mpls-network': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'MPLS Service', cost: 3000, tier: 'Monthly' },
  },
  'dedicated-line': {
    aws: { service: 'Direct Connect', cost: 200, tier: '1Gbps' },
    azure: { service: 'ExpressRoute', cost: 250, tier: '1Gbps' },
    gcp: { service: 'Cloud Interconnect', cost: 220, tier: '1Gbps' },
    onprem: { service: 'Dedicated Line', cost: 500, tier: 'Monthly' },
  },
  'metro-ethernet': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Metro Ethernet', cost: 400, tier: 'Monthly' },
  },
  'corporate-internet': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Corporate Internet', cost: 300, tier: 'Monthly' },
  },
  'vpn-service': {
    aws: { service: 'Site-to-Site VPN', cost: 36, tier: 'Per connection' },
    azure: { service: 'VPN Gateway', cost: 138, tier: 'VpnGw1' },
    gcp: { service: 'Cloud VPN', cost: 36, tier: 'Per tunnel' },
    onprem: { service: 'MPLS VPN', cost: 800, tier: 'Monthly' },
  },
  'sd-wan-service': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'Virtual WAN', cost: 250, tier: 'Standard' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'SD-WAN Service', cost: 500, tier: 'Monthly' },
  },
  'private-5g': {
    aws: { service: 'Private 5G', cost: 10000, tier: 'Estimated' },
    azure: { service: 'Private 5G Core', cost: 10000, tier: 'Estimated' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Private 5G', cost: 15000, tier: 'Monthly' },
  },
  'core-network': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Mobile Core', cost: 20000, tier: 'Estimated' },
  },
  'upf': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'UPF', cost: 5000, tier: 'Estimated' },
  },
  'ring-network': {
    aws: { service: 'N/A', cost: 0, tier: 'N/A' },
    azure: { service: 'N/A', cost: 0, tier: 'N/A' },
    gcp: { service: 'N/A', cost: 0, tier: 'N/A' },
    onprem: { service: 'Ring Network', cost: 2000, tier: 'Monthly' },
  },
};
