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
    it('should have 8 vendor/provider logos (including aliases)', () => {
      expect(Object.keys(VENDOR_LOGOS)).toHaveLength(8);
    });

    it('should include all 4 vendors with aliases', () => {
      expect(VENDOR_LOGOS.cisco).toBe('/logos/cisco.svg');
      expect(VENDOR_LOGOS.fortinet).toBe('/logos/fortinet.svg');
      expect(VENDOR_LOGOS.paloalto).toBe('/logos/paloalto.svg');
      expect(VENDOR_LOGOS['palo-alto-networks']).toBe('/logos/paloalto.svg');
      expect(VENDOR_LOGOS.arista).toBe('/logos/arista.svg');
    });

    it('should include all 3 cloud providers', () => {
      expect(VENDOR_LOGOS.aws).toBe('/logos/aws.svg');
      expect(VENDOR_LOGOS.azure).toBe('/logos/azure.svg');
      expect(VENDOR_LOGOS.gcp).toBe('/logos/gcp.svg');
    });
  });

  describe('VENDOR_NAMES', () => {
    it('should have 8 vendor/provider names (including aliases)', () => {
      expect(Object.keys(VENDOR_NAMES)).toHaveLength(8);
    });

    it('should have correct display names', () => {
      expect(VENDOR_NAMES.cisco).toBe('Cisco');
      expect(VENDOR_NAMES.paloalto).toBe('Palo Alto Networks');
      expect(VENDOR_NAMES.aws).toBe('AWS');
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
