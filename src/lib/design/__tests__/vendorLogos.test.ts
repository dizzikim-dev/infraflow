import { describe, it, expect } from 'vitest';
import { getLogoForNode, getVendorNameForNode, VENDOR_LOGOS, VENDOR_NAMES } from '../vendorLogos';
import type { InfraNodeData } from '@/types';

describe('vendorLogos', () => {
  const baseData: InfraNodeData = {
    label: 'Test',
    category: 'security',
    nodeType: 'firewall',
  };

  describe('VENDOR_LOGOS', () => {
    it('should have 26 vendor/provider logos (22 vendors + 1 alias + 3 cloud)', () => {
      expect(Object.keys(VENDOR_LOGOS)).toHaveLength(26);
    });

    it('should include original 4 vendors with aliases', () => {
      expect(VENDOR_LOGOS.cisco).toBe('/logos/cisco.svg');
      expect(VENDOR_LOGOS.fortinet).toBe('/logos/fortinet.svg');
      expect(VENDOR_LOGOS.paloalto).toBe('/logos/paloalto.svg');
      expect(VENDOR_LOGOS['palo-alto-networks']).toBe('/logos/paloalto.svg');
      expect(VENDOR_LOGOS.arista).toBe('/logos/arista.svg');
    });

    it('should include Phase 1-4 vendors', () => {
      expect(VENDOR_LOGOS['f5-networks']).toBe('/logos/f5.svg');
      expect(VENDOR_LOGOS['dell-technologies']).toBe('/logos/dell.svg');
      expect(VENDOR_LOGOS['schneider-electric']).toBe('/logos/schneider.svg');
      expect(VENDOR_LOGOS.veeam).toBe('/logos/veeam.svg');
      expect(VENDOR_LOGOS.cloudflare).toBe('/logos/cloudflare.svg');
      expect(VENDOR_LOGOS.zscaler).toBe('/logos/zscaler.svg');
      expect(VENDOR_LOGOS.crowdstrike).toBe('/logos/crowdstrike.svg');
      expect(VENDOR_LOGOS.infoblox).toBe('/logos/infoblox.svg');
      expect(VENDOR_LOGOS.okta).toBe('/logos/okta.svg');
      expect(VENDOR_LOGOS.proofpoint).toBe('/logos/proofpoint.svg');
      expect(VENDOR_LOGOS.vmware).toBe('/logos/vmware.svg');
      expect(VENDOR_LOGOS['red-hat']).toBe('/logos/redhat.svg');
      expect(VENDOR_LOGOS.oracle).toBe('/logos/oracle.svg');
      expect(VENDOR_LOGOS.datadog).toBe('/logos/datadog.svg');
      expect(VENDOR_LOGOS['hpe-aruba']).toBe('/logos/hpe-aruba.svg');
      expect(VENDOR_LOGOS.netapp).toBe('/logos/netapp.svg');
      expect(VENDOR_LOGOS.confluent).toBe('/logos/confluent.svg');
      expect(VENDOR_LOGOS.kong).toBe('/logos/kong.svg');
    });

    it('should include all 3 cloud providers', () => {
      expect(VENDOR_LOGOS.aws).toBe('/logos/aws.svg');
      expect(VENDOR_LOGOS.azure).toBe('/logos/azure.svg');
      expect(VENDOR_LOGOS.gcp).toBe('/logos/gcp.svg');
    });
  });

  describe('VENDOR_NAMES', () => {
    it('should have 26 vendor/provider names (22 vendors + 1 alias + 3 cloud)', () => {
      expect(Object.keys(VENDOR_NAMES)).toHaveLength(26);
    });

    it('should have correct display names for original vendors', () => {
      expect(VENDOR_NAMES.cisco).toBe('Cisco');
      expect(VENDOR_NAMES.paloalto).toBe('Palo Alto Networks');
      expect(VENDOR_NAMES.aws).toBe('AWS');
    });

    it('should have correct display names for new vendors', () => {
      expect(VENDOR_NAMES['f5-networks']).toBe('F5 Networks');
      expect(VENDOR_NAMES.crowdstrike).toBe('CrowdStrike');
      expect(VENDOR_NAMES['red-hat']).toBe('Red Hat');
      expect(VENDOR_NAMES['hpe-aruba']).toBe('HPE Aruba');
      expect(VENDOR_NAMES.kong).toBe('Kong');
    });
  });

  describe('getLogoForNode', () => {
    it('should return null when no vendor or cloud is selected', () => {
      expect(getLogoForNode(baseData)).toBeNull();
    });

    it('should return vendor logo path when vendorId is set', () => {
      expect(getLogoForNode({ ...baseData, vendorId: 'cisco' })).toBe('/logos/cisco.svg');
    });

    it('should return cloud logo path when cloudProvider is set', () => {
      expect(getLogoForNode({ ...baseData, cloudProvider: 'aws' })).toBe('/logos/aws.svg');
    });

    it('should prefer vendorId over cloudProvider when both set', () => {
      expect(getLogoForNode({ ...baseData, vendorId: 'cisco', cloudProvider: 'aws' }))
        .toBe('/logos/cisco.svg');
    });

    it('should return logo for palo-alto-networks alias', () => {
      expect(getLogoForNode({ ...baseData, vendorId: 'palo-alto-networks' })).toBe('/logos/paloalto.svg');
    });

    it('should return logo for new vendors', () => {
      expect(getLogoForNode({ ...baseData, vendorId: 'crowdstrike' })).toBe('/logos/crowdstrike.svg');
      expect(getLogoForNode({ ...baseData, vendorId: 'red-hat' })).toBe('/logos/redhat.svg');
      expect(getLogoForNode({ ...baseData, vendorId: 'hpe-aruba' })).toBe('/logos/hpe-aruba.svg');
      expect(getLogoForNode({ ...baseData, vendorId: 'kong' })).toBe('/logos/kong.svg');
    });

    it('should return null for unknown vendorId', () => {
      expect(getLogoForNode({ ...baseData, vendorId: 'unknown' })).toBeNull();
    });
  });

  describe('getVendorNameForNode', () => {
    it('should return null when no vendor or cloud is selected', () => {
      expect(getVendorNameForNode(baseData)).toBeNull();
    });

    it('should return vendor name when vendorId is set', () => {
      expect(getVendorNameForNode({ ...baseData, vendorId: 'fortinet' })).toBe('Fortinet');
    });

    it('should return provider name when cloudProvider is set', () => {
      expect(getVendorNameForNode({ ...baseData, cloudProvider: 'gcp' })).toBe('GCP');
    });

    it('should return null for unknown cloudProvider', () => {
      expect(getVendorNameForNode({ ...baseData, cloudProvider: 'unknown' })).toBeNull();
    });
  });
});
