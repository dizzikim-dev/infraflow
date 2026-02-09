import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Telecom Edge Badge Verification Tests
 *
 * These tests verify the structure of the AnimatedEdge component badges
 * for telecom-specific flowTypes (wan-link, wireless, tunnel) by examining
 * the source code, since full React rendering in vitest with SVG/motion
 * components requires complex setup.
 */

// We import to verify the module loads correctly
import { AnimatedEdge } from '@/components/edges/AnimatedEdge';

// Read source once for all tests
const sourcePath = resolve(process.cwd(), 'src/components/edges/AnimatedEdge.tsx');
const source = readFileSync(sourcePath, 'utf-8');

describe('telecom edge component', () => {
  describe('AnimatedEdge component export', () => {
    it('should be a valid React component', () => {
      expect(AnimatedEdge).toBeDefined();
      expect(typeof AnimatedEdge).toBe('object'); // memo wraps it as an object
    });
  });

  describe('flowTypeStyles structure', () => {
    it('should define wan-link style with teal color', () => {
      expect(source).toContain("'wan-link':");
      expect(source).toContain('#14b8a6'); // teal color
    });

    it('should define wireless style with cyan color', () => {
      // 'wireless' is a valid JS identifier, so it may or may not be quoted in source
      expect(source).toMatch(/wireless['"]*\s*:/);
      expect(source).toContain('#06b6d4'); // cyan color
    });

    it('should define tunnel style with indigo color', () => {
      // 'tunnel' is a valid JS identifier, so it may or may not be quoted in source
      expect(source).toMatch(/tunnel['"]*\s*:/);
      expect(source).toContain('#6366f1'); // indigo color
    });
  });

  describe('badge indicators in source', () => {
    it('should contain WAN badge indicator', () => {
      expect(source).toContain("WAN Link Indicator");
      expect(source).toContain("flowType === 'wan-link'");
      expect(source).toContain('bg-teal-500/20');
      expect(source).toContain('text-teal-400');
    });

    it('should contain 5G wireless badge indicator', () => {
      expect(source).toContain("Wireless Indicator");
      expect(source).toContain("flowType === 'wireless'");
      expect(source).toContain('bg-cyan-500/20');
      expect(source).toContain('text-cyan-400');
      expect(source).toMatch(/5G/);
    });

    it('should contain MPLS tunnel badge indicator', () => {
      expect(source).toContain("Tunnel Indicator");
      expect(source).toContain("flowType === 'tunnel'");
      expect(source).toContain('bg-indigo-500/20');
      expect(source).toContain('text-indigo-400');
      expect(source).toContain('MPLS');
    });

    it('should place telecom badges before custom label section', () => {
      const wanBadgeIndex = source.indexOf("WAN Link Indicator");
      const wirelessBadgeIndex = source.indexOf("Wireless Indicator");
      const tunnelBadgeIndex = source.indexOf("Tunnel Indicator");
      const customLabelIndex = source.indexOf("Custom Label");

      expect(wanBadgeIndex).toBeGreaterThan(-1);
      expect(wirelessBadgeIndex).toBeGreaterThan(-1);
      expect(tunnelBadgeIndex).toBeGreaterThan(-1);
      expect(customLabelIndex).toBeGreaterThan(-1);

      expect(wanBadgeIndex).toBeLessThan(customLabelIndex);
      expect(wirelessBadgeIndex).toBeLessThan(customLabelIndex);
      expect(tunnelBadgeIndex).toBeLessThan(customLabelIndex);
    });

    it('should place telecom badges after encrypted indicator', () => {
      const encryptedIndex = source.indexOf("Encrypted Indicator");
      const wanBadgeIndex = source.indexOf("WAN Link Indicator");

      expect(encryptedIndex).toBeGreaterThan(-1);
      expect(wanBadgeIndex).toBeGreaterThan(-1);
      expect(wanBadgeIndex).toBeGreaterThan(encryptedIndex);
    });

    it('should use EdgeLabelRenderer for all telecom badges', () => {
      const matches = source.match(/EdgeLabelRenderer/g);
      expect(matches).toBeDefined();
      // At least 12 occurrences (6 pairs of opening+closing tags):
      // blocked, encrypted, wan-link, wireless, tunnel, custom label
      expect(matches!.length).toBeGreaterThanOrEqual(12);
    });

    it('should include SVG antenna icon for wireless badge', () => {
      // Verify the wireless badge has the antenna/wifi SVG paths
      const wirelessSection = source.substring(
        source.indexOf("Wireless Indicator"),
        source.indexOf("Tunnel Indicator")
      );
      expect(wirelessSection).toContain('viewBox="0 0 24 24"');
      expect(wirelessSection).toContain('M5 12.55');
    });

    it('should include SVG lock icon for tunnel badge', () => {
      // Verify the tunnel badge has the lock SVG paths
      const tunnelSection = source.substring(
        source.indexOf("Tunnel Indicator"),
        source.indexOf("Custom Label")
      );
      expect(tunnelSection).toContain('viewBox="0 0 24 24"');
      expect(tunnelSection).toContain('M7 11V7a5 5 0 0110 0v4');
    });
  });
});
