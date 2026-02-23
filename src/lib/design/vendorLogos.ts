import type { InfraNodeData } from '@/types';

/** Vendor/provider logo paths mapped by ID */
export const VENDOR_LOGOS: Record<string, string> = {
  // Original 4 vendors
  cisco: '/logos/cisco.svg',
  fortinet: '/logos/fortinet.svg',
  paloalto: '/logos/paloalto.svg',
  'palo-alto-networks': '/logos/paloalto.svg', // Alias: catalog uses this ID
  arista: '/logos/arista.svg',
  // Phase 1 vendors
  'f5-networks': '/logos/f5.svg',
  'dell-technologies': '/logos/dell.svg',
  'schneider-electric': '/logos/schneider.svg',
  veeam: '/logos/veeam.svg',
  cloudflare: '/logos/cloudflare.svg',
  zscaler: '/logos/zscaler.svg',
  // Phase 2 vendors
  crowdstrike: '/logos/crowdstrike.svg',
  infoblox: '/logos/infoblox.svg',
  okta: '/logos/okta.svg',
  proofpoint: '/logos/proofpoint.svg',
  // Phase 3 vendors
  vmware: '/logos/vmware.svg',
  'red-hat': '/logos/redhat.svg',
  oracle: '/logos/oracle.svg',
  datadog: '/logos/datadog.svg',
  // Phase 4 vendors
  'hpe-aruba': '/logos/hpe-aruba.svg',
  netapp: '/logos/netapp.svg',
  confluent: '/logos/confluent.svg',
  kong: '/logos/kong.svg',
  // Cloud providers
  aws: '/logos/aws.svg',
  azure: '/logos/azure.svg',
  gcp: '/logos/gcp.svg',
};

/** Vendor/provider display names */
export const VENDOR_NAMES: Record<string, string> = {
  // Original 4 vendors
  cisco: 'Cisco',
  fortinet: 'Fortinet',
  paloalto: 'Palo Alto Networks',
  'palo-alto-networks': 'Palo Alto Networks', // Alias: catalog uses this ID
  arista: 'Arista',
  // Phase 1 vendors
  'f5-networks': 'F5 Networks',
  'dell-technologies': 'Dell Technologies',
  'schneider-electric': 'Schneider Electric',
  veeam: 'Veeam',
  cloudflare: 'Cloudflare',
  zscaler: 'Zscaler',
  // Phase 2 vendors
  crowdstrike: 'CrowdStrike',
  infoblox: 'Infoblox',
  okta: 'Okta',
  proofpoint: 'Proofpoint',
  // Phase 3 vendors
  vmware: 'VMware',
  'red-hat': 'Red Hat',
  oracle: 'Oracle',
  datadog: 'Datadog',
  // Phase 4 vendors
  'hpe-aruba': 'HPE Aruba',
  netapp: 'NetApp',
  confluent: 'Confluent',
  kong: 'Kong',
  // Cloud providers
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
};

/**
 * Get the logo path for a node based on its vendorId or cloudProvider.
 * Returns null if no vendor/cloud product is selected.
 */
export function getLogoForNode(data: InfraNodeData): string | null {
  if (data.vendorId && VENDOR_LOGOS[data.vendorId]) {
    return VENDOR_LOGOS[data.vendorId];
  }
  if (data.cloudProvider && VENDOR_LOGOS[data.cloudProvider]) {
    return VENDOR_LOGOS[data.cloudProvider];
  }
  return null;
}

/**
 * Get the vendor/provider display name for a node.
 * Returns null if no vendor/cloud product is selected.
 */
export function getVendorNameForNode(data: InfraNodeData): string | null {
  if (data.vendorId && VENDOR_NAMES[data.vendorId]) {
    return VENDOR_NAMES[data.vendorId];
  }
  if (data.cloudProvider && VENDOR_NAMES[data.cloudProvider]) {
    return VENDOR_NAMES[data.cloudProvider];
  }
  return null;
}
