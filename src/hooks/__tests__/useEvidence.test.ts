import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEvidence } from '../useEvidence';
import type { InfraSpec, InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeSpec(nodeTypes: InfraNodeType[]): InfraSpec {
  return {
    nodes: nodeTypes.map((type, i) => ({
      id: `node-${i}`,
      type,
      label: `${type}-${i}`,
    })),
    connections: [],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useEvidence', () => {
  it('returns null when nodeId is null', () => {
    const { result } = renderHook(() =>
      useEvidence(null, 'firewall', makeSpec(['firewall'])),
    );
    expect(result.current).toBeNull();
  });

  it('returns null when nodeType is null', () => {
    const { result } = renderHook(() =>
      useEvidence('node-0', null, makeSpec(['firewall'])),
    );
    expect(result.current).toBeNull();
  });

  it('returns null when spec is null', () => {
    const { result } = renderHook(() =>
      useEvidence('node-0', 'firewall', null),
    );
    expect(result.current).toBeNull();
  });

  it('returns EvidenceData with correct structure for valid inputs', () => {
    const spec = makeSpec(['firewall', 'router', 'switch-l2']);
    const { result } = renderHook(() =>
      useEvidence('node-0', 'firewall', spec),
    );

    expect(result.current).not.toBeNull();
    const data = result.current!;

    // Check structure
    expect(data).toHaveProperty('relationships');
    expect(data).toHaveProperty('suggestions');
    expect(data).toHaveProperty('recommendations');
    expect(data).toHaveProperty('violations');
    expect(data).toHaveProperty('vulnerabilities');
    expect(data).toHaveProperty('complianceGaps');
    expect(data).toHaveProperty('sources');
    expect(data).toHaveProperty('counts');

    // Counts structure
    expect(data.counts).toHaveProperty('relationships');
    expect(data.counts).toHaveProperty('recommendations');
    expect(data.counts).toHaveProperty('validationIssues');
    expect(data.counts).toHaveProperty('sources');

    // Arrays
    expect(Array.isArray(data.relationships)).toBe(true);
    expect(Array.isArray(data.suggestions)).toBe(true);
    expect(Array.isArray(data.recommendations)).toBe(true);
    expect(Array.isArray(data.violations)).toBe(true);
    expect(Array.isArray(data.vulnerabilities)).toBe(true);
    expect(Array.isArray(data.complianceGaps)).toBe(true);
    expect(Array.isArray(data.sources)).toBe(true);
  });

  it('filters relationships to only those involving the selected node type', () => {
    const spec = makeSpec(['firewall', 'router', 'switch-l2', 'web-server']);
    const { result } = renderHook(() =>
      useEvidence('node-0', 'firewall', spec),
    );

    const data = result.current!;
    // All returned relationships should involve 'firewall'
    for (const rel of data.relationships) {
      expect(
        rel.source === 'firewall' || rel.target === 'firewall',
      ).toBe(true);
    }
  });

  it('deduplicates sources by title+url', () => {
    const spec = makeSpec(['firewall', 'router', 'switch-l2']);
    const { result } = renderHook(() =>
      useEvidence('node-0', 'firewall', spec),
    );

    const data = result.current!;
    // Check uniqueness of sources
    const keys = data.sources.map((s) => `${s.title}::${s.url ?? ''}`);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('counts relationships include both relationships and suggestions', () => {
    const spec = makeSpec(['firewall', 'router', 'switch-l2']);
    const { result } = renderHook(() =>
      useEvidence('node-0', 'firewall', spec),
    );

    const data = result.current!;
    expect(data.counts.relationships).toBe(
      data.relationships.length + data.suggestions.length,
    );
  });

  it('counts validationIssues as sum of violations, vulnerabilities, and complianceGaps', () => {
    const spec = makeSpec(['firewall', 'router', 'switch-l2']);
    const { result } = renderHook(() =>
      useEvidence('node-0', 'firewall', spec),
    );

    const data = result.current!;
    expect(data.counts.validationIssues).toBe(
      data.violations.length + data.vulnerabilities.length + data.complianceGaps.length,
    );
  });

  it('sources are sorted by type', () => {
    const spec = makeSpec(['firewall', 'router', 'switch-l2', 'web-server', 'load-balancer']);
    const { result } = renderHook(() =>
      useEvidence('node-0', 'firewall', spec),
    );

    const data = result.current!;
    if (data.sources.length > 1) {
      for (let i = 1; i < data.sources.length; i++) {
        expect(data.sources[i].type.localeCompare(data.sources[i - 1].type)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
