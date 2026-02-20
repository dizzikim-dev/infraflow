/**
 * Cost Comparison Engine — Tests
 *
 * Validates vendor cost comparison logic including tier classification,
 * per-product cost estimation, per-vendor summaries, and the full
 * multi-vendor comparison with cheapest/coverage/recommended analysis.
 */

import { describe, it, expect } from 'vitest';
import type { InfraSpec } from '@/types/infra';
import type { ProductNode } from '@/lib/knowledge/vendorCatalog/types';
import {
  compareVendorCosts,
  classifyProductTier,
  estimateProductCost,
  getVendorSummary,
  PRICING_TIERS,
} from '../costComparator';

// ---------------------------------------------------------------------------
// Helpers: minimal ProductNode and InfraSpec factories
// ---------------------------------------------------------------------------

function makeProduct(overrides: Partial<ProductNode> = {}): ProductNode {
  return {
    nodeId: 'test-product-001',
    depth: 2,
    depthLabel: 'Model',
    depthLabelKo: '모델',
    name: 'Test Product',
    nameKo: '테스트 제품',
    description: 'A test product',
    descriptionKo: '테스트 제품',
    sourceUrl: 'https://example.com',
    children: [],
    ...overrides,
  };
}

function makeSpec(
  nodes: { type: string; label?: string }[] = [],
): InfraSpec {
  return {
    name: 'Test Spec',
    description: 'Test infrastructure',
    nodes: nodes.map((n, i) => ({
      id: `node-${i}`,
      type: n.type as InfraSpec['nodes'][number]['type'],
      label: n.label ?? n.type,
    })),
    connections: [],
  };
}

// ---------------------------------------------------------------------------
// classifyProductTier
// ---------------------------------------------------------------------------

describe('classifyProductTier', () => {
  it('classifies entry-level products by name pattern (e.g., 40F)', () => {
    const product = makeProduct({ name: 'FortiGate 40F', description: 'Entry-level desktop NGFW' });
    expect(classifyProductTier(product)).toBe('entry-level');
  });

  it('classifies entry-level products by description keyword', () => {
    const product = makeProduct({ name: 'FG-60F', description: 'Small office firewall' });
    expect(classifyProductTier(product)).toBe('entry-level');
  });

  it('classifies mid-range products by model number pattern (e.g., 200F)', () => {
    const product = makeProduct({ name: 'FortiGate 200F', description: 'Mid-range NGFW' });
    expect(classifyProductTier(product)).toBe('mid-range');
  });

  it('classifies high-end products by model number (e.g., 1000 series)', () => {
    const product = makeProduct({ name: 'Catalyst 1000 Series', description: 'Switching platform' });
    expect(classifyProductTier(product)).toBe('high-end');
  });

  it('classifies enterprise products by model number (e.g., 9600)', () => {
    const product = makeProduct({ name: 'Catalyst 9600 Series', description: 'Modular core' });
    expect(classifyProductTier(product)).toBe('enterprise');
  });

  it('classifies enterprise products by chassis keyword', () => {
    const product = makeProduct({ name: 'Nexus 9000 Chassis', description: 'Data center spine' });
    expect(classifyProductTier(product)).toBe('enterprise');
  });

  it('classifies software/virtual products', () => {
    const product = makeProduct({ name: 'FortiGate VM', description: 'Virtual firewall' });
    expect(classifyProductTier(product)).toBe('software');
  });

  it('classifies management platforms', () => {
    const product = makeProduct({ name: 'FortiManager', description: 'Centralized management platform' });
    expect(classifyProductTier(product)).toBe('management');
  });

  it('defaults to entry-level for deep nodes (depth >= 2) with no keyword match', () => {
    const product = makeProduct({ name: 'FG-X', description: 'Some device', depth: 3 });
    expect(classifyProductTier(product)).toBe('entry-level');
  });

  it('defaults to mid-range for shallow nodes (depth < 2) with no keyword match', () => {
    const product = makeProduct({ name: 'Some Product Line', description: 'A line', depth: 1 });
    expect(classifyProductTier(product)).toBe('mid-range');
  });
});

// ---------------------------------------------------------------------------
// estimateProductCost
// ---------------------------------------------------------------------------

describe('estimateProductCost', () => {
  it('returns the typical cost for the classified tier', () => {
    const product = makeProduct({ name: 'FortiGate 40F', description: 'Entry-level desktop NGFW' });
    const cost = estimateProductCost(product);
    expect(cost).toBe(PRICING_TIERS['entry-level'].typical);
  });

  it('returns enterprise typical cost for enterprise products', () => {
    const product = makeProduct({ name: 'Catalyst 9600', description: 'Campus core' });
    const cost = estimateProductCost(product);
    expect(cost).toBe(PRICING_TIERS['enterprise'].typical);
  });

  it('returns a positive number for any product', () => {
    const product = makeProduct({ name: 'Unknown Widget', depth: 2 });
    const cost = estimateProductCost(product);
    expect(cost).toBeGreaterThan(0);
  });

  it('returns software tier cost for virtual appliances', () => {
    const product = makeProduct({ name: 'PA-VM', description: 'Virtual NGFW' });
    const cost = estimateProductCost(product);
    expect(cost).toBe(PRICING_TIERS['software'].typical);
  });
});

// ---------------------------------------------------------------------------
// getVendorSummary
// ---------------------------------------------------------------------------

describe('getVendorSummary', () => {
  it('returns correct structure with vendorId and vendorName', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const summary = getVendorSummary('fortinet', spec);
    expect(summary.vendorId).toBe('fortinet');
    expect(summary.vendorName).toBe('Fortinet');
  });

  it('includes products for matched node types', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const summary = getVendorSummary('fortinet', spec);
    expect(summary.products.length).toBeGreaterThanOrEqual(1);
    expect(summary.coveredNodeTypes).toContain('firewall');
  });

  it('lists uncovered node types for vendor without matching products', () => {
    // Use a type that no vendor likely covers
    const spec = makeSpec([{ type: 'user' }]);
    const summary = getVendorSummary('fortinet', spec);
    expect(summary.uncoveredNodeTypes).toContain('user');
  });

  it('calculates totalMonthlyCost as sum of product costs * quantities', () => {
    const spec = makeSpec([{ type: 'firewall' }, { type: 'firewall' }]);
    const summary = getVendorSummary('fortinet', spec);
    // Two firewalls → quantity 2
    const fwProduct = summary.products.find((p) => p.nodeType === 'firewall');
    if (fwProduct) {
      expect(fwProduct.quantity).toBe(2);
      expect(summary.totalMonthlyCost).toBe(fwProduct.monthlyCost * fwProduct.quantity);
    }
  });

  it('calculates totalAnnualCost as 12 * monthly', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const summary = getVendorSummary('fortinet', spec);
    expect(summary.totalAnnualCost).toBe(summary.totalMonthlyCost * 12);
  });

  it('calculates coverage percentage correctly', () => {
    // Fortinet covers firewall, probably does not cover 'user'
    const spec = makeSpec([{ type: 'firewall' }, { type: 'user' }]);
    const summary = getVendorSummary('fortinet', spec);
    expect(summary.coveragePercentage).toBe(50);
  });

  it('returns 0 coverage for empty spec', () => {
    const spec = makeSpec([]);
    const summary = getVendorSummary('fortinet', spec);
    expect(summary.coveragePercentage).toBe(0);
    expect(summary.products).toHaveLength(0);
  });

  it('returns 0 coverage for vendor with no matching products', () => {
    // 'zone' and 'internet' are not mapped to any vendor products
    const spec = makeSpec([{ type: 'zone' }, { type: 'internet' }]);
    const summary = getVendorSummary('cisco', spec);
    expect(summary.coveragePercentage).toBe(0);
  });

  it('handles unknown vendorId gracefully', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const summary = getVendorSummary('nonexistent-vendor', spec);
    expect(summary.vendorId).toBe('nonexistent-vendor');
    expect(summary.products).toHaveLength(0);
    expect(summary.coveragePercentage).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// compareVendorCosts — full comparison
// ---------------------------------------------------------------------------

describe('compareVendorCosts', () => {
  it('returns estimates for all 4 vendors with a firewall spec', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    // 4 vendors in the catalog
    expect(result.vendorEstimates).toHaveLength(4);
  });

  it('returns empty estimates for empty spec', () => {
    const spec = makeSpec([]);
    const result = compareVendorCosts(spec);
    expect(result.cheapestVendor).toBeNull();
    expect(result.bestCoverageVendor).toBeNull();
    expect(result.recommendedVendor).toBeNull();
    expect(result.savingsPercentage).toBe(0);
  });

  it('filters by vendorIds correctly', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec, { vendorIds: ['fortinet', 'cisco'] });
    expect(result.vendorEstimates).toHaveLength(2);
    expect(result.vendorEstimates.map((v) => v.vendorId)).toEqual(
      expect.arrayContaining(['fortinet', 'cisco']),
    );
  });

  it('sets cheapestVendor to the vendor with lowest total cost', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    if (result.cheapestVendor) {
      const cheapest = result.vendorEstimates.find(
        (v) => v.vendorId === result.cheapestVendor,
      );
      const others = result.vendorEstimates.filter(
        (v) => v.vendorId !== result.cheapestVendor && v.coveragePercentage > 0,
      );
      for (const other of others) {
        expect(cheapest!.totalMonthlyCost).toBeLessThanOrEqual(other.totalMonthlyCost);
      }
    }
  });

  it('sets bestCoverageVendor to the vendor with highest coverage', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    if (result.bestCoverageVendor) {
      const best = result.vendorEstimates.find(
        (v) => v.vendorId === result.bestCoverageVendor,
      );
      for (const other of result.vendorEstimates) {
        expect(best!.coveragePercentage).toBeGreaterThanOrEqual(other.coveragePercentage);
      }
    }
  });

  it('calculates savingsPercentage correctly (0 if only one vendor with coverage)', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    // Use a single vendor
    const result = compareVendorCosts(spec, { vendorIds: ['fortinet'] });
    expect(result.savingsPercentage).toBe(0);
  });

  it('calculates savingsPercentage > 0 when vendors have different costs', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    const vendorsWithCoverage = result.vendorEstimates.filter(
      (v) => v.coveragePercentage > 0,
    );
    if (vendorsWithCoverage.length >= 2) {
      const costs = vendorsWithCoverage.map((v) => v.totalMonthlyCost);
      const min = Math.min(...costs);
      const max = Math.max(...costs);
      if (min !== max) {
        expect(result.savingsPercentage).toBeGreaterThan(0);
      }
    }
  });

  it('sets recommendedVendor based on composite score', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    // recommendedVendor should be one of the vendors with coverage
    if (result.recommendedVendor) {
      const recommended = result.vendorEstimates.find(
        (v) => v.vendorId === result.recommendedVendor,
      );
      expect(recommended).toBeDefined();
      expect(recommended!.coveragePercentage).toBeGreaterThan(0);
    }
  });

  it('populates vendor names correctly in estimates', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    for (const estimate of result.vendorEstimates) {
      expect(estimate.vendorName).toBeTruthy();
      expect(estimate.vendorId).toBeTruthy();
    }
  });

  it('multi-node spec produces multi-product estimates', () => {
    const spec = makeSpec([
      { type: 'firewall' },
      { type: 'switch-l3' },
      { type: 'router' },
    ]);
    const result = compareVendorCosts(spec);
    // At least one vendor should have multiple product line items
    const maxProducts = Math.max(
      ...result.vendorEstimates.map((v) => v.products.length),
    );
    expect(maxProducts).toBeGreaterThanOrEqual(2);
  });

  it('handles nodes with no vendor matches gracefully', () => {
    // 'zone' and 'internet' are not mapped to any vendor products
    const spec = makeSpec([{ type: 'zone' }, { type: 'internet' }]);
    const result = compareVendorCosts(spec);
    // All vendors should have 0 coverage for these external types
    for (const estimate of result.vendorEstimates) {
      expect(estimate.coveragePercentage).toBe(0);
    }
    expect(result.cheapestVendor).toBeNull();
  });

  it('includes requirements in the result when provided', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const requirements = {
      organizationSize: 'medium' as const,
      industry: 'financial' as const,
      userCount: 500,
      concurrentUsers: 100,
      dataVolume: 'medium' as const,
      trafficPattern: 'steady' as const,
      availabilityTarget: 99.9 as const,
      securityLevel: 'high' as const,
      complianceFrameworks: ['PCI-DSS'],
      budgetRange: 'medium' as const,
      cloudPreference: 'hybrid' as const,
    };
    const result = compareVendorCosts(spec, { requirements });
    expect(result.requirements).toBe(requirements);
  });

  it('returns null requirements when none provided', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    expect(result.requirements).toBeNull();
  });

  it('provides bilingual recommended reason', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    expect(result.recommendedReason).toBeTruthy();
    expect(result.recommendedReasonKo).toBeTruthy();
  });

  it('includes the spec in the result', () => {
    const spec = makeSpec([{ type: 'firewall' }]);
    const result = compareVendorCosts(spec);
    expect(result.spec).toBe(spec);
  });
});
