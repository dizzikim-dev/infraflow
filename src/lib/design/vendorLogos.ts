import type { InfraNodeData } from '@/types';

/** Vendor/provider logo paths mapped by ID */
export const VENDOR_LOGOS: Record<string, string> = {
  cisco: '/logos/cisco.svg',
  fortinet: '/logos/fortinet.svg',
  paloalto: '/logos/paloalto.svg',
  'palo-alto-networks': '/logos/paloalto.svg', // Alias: catalog uses this ID
  arista: '/logos/arista.svg',
  aws: '/logos/aws.svg',
  azure: '/logos/azure.svg',
  gcp: '/logos/gcp.svg',
};

/** Vendor/provider display names */
export const VENDOR_NAMES: Record<string, string> = {
  cisco: 'Cisco',
  fortinet: 'Fortinet',
  paloalto: 'Palo Alto Networks',
  'palo-alto-networks': 'Palo Alto Networks', // Alias: catalog uses this ID
  arista: 'Arista',
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
