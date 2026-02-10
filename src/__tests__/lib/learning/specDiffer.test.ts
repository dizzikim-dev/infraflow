import { describe, it, expect } from 'vitest';
import { computeSpecDiff, hasSignificantChanges, computeModificationScore } from '@/lib/learning/specDiffer';
import type { InfraSpec } from '@/types/infra';

function makeSpec(overrides: Partial<InfraSpec> = {}): InfraSpec {
  return {
    nodes: [],
    connections: [],
    ...overrides,
  };
}

describe('computeSpecDiff', () => {
  it('should return empty diff for identical specs', () => {
    const spec = makeSpec({
      nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }],
      connections: [{ source: 'fw-1', target: 'ws-1' }],
    });
    const diff = computeSpecDiff(spec, spec);
    expect(diff.nodesAdded).toBe(0);
    expect(diff.nodesRemoved).toBe(0);
    expect(diff.nodesModified).toBe(0);
    expect(diff.connectionsAdded).toBe(0);
    expect(diff.connectionsRemoved).toBe(0);
    expect(diff.operations).toHaveLength(0);
    expect(diff.placementChanges).toHaveLength(0);
  });

  it('should detect added nodes', () => {
    const original = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }] });
    const modified = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
    });
    const diff = computeSpecDiff(original, modified);
    expect(diff.nodesAdded).toBe(1);
    expect(diff.nodesRemoved).toBe(0);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ type: 'add-node', nodeId: 'ws-1', nodeType: 'web-server' })
    );
  });

  it('should detect removed nodes', () => {
    const original = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
    });
    const modified = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }] });
    const diff = computeSpecDiff(original, modified);
    expect(diff.nodesRemoved).toBe(1);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ type: 'remove-node', nodeId: 'ws-1', nodeType: 'web-server' })
    );
  });

  it('should detect modified node label', () => {
    const original = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }] });
    const modified = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'Firewall' }] });
    const diff = computeSpecDiff(original, modified);
    expect(diff.nodesModified).toBe(1);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ type: 'modify-node', nodeId: 'fw-1', field: 'label', oldValue: 'FW', newValue: 'Firewall' })
    );
  });

  it('should detect modified node type', () => {
    const original = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }] });
    const modified = makeSpec({ nodes: [{ id: 'fw-1', type: 'waf', label: 'FW' }] });
    const diff = computeSpecDiff(original, modified);
    expect(diff.nodesModified).toBe(1);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ type: 'modify-node', field: 'type', oldValue: 'firewall', newValue: 'waf' })
    );
  });

  it('should detect tier placement changes', () => {
    const original = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW', tier: 'dmz' }] });
    const modified = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW', tier: 'internal' }] });
    const diff = computeSpecDiff(original, modified);
    expect(diff.placementChanges).toHaveLength(1);
    expect(diff.placementChanges[0]).toEqual({
      nodeId: 'fw-1',
      nodeType: 'firewall',
      originalTier: 'dmz',
      newTier: 'internal',
      moved: true,
    });
  });

  it('should detect added connections', () => {
    const original = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
      connections: [],
    });
    const modified = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
      connections: [{ source: 'fw-1', target: 'ws-1' }],
    });
    const diff = computeSpecDiff(original, modified);
    expect(diff.connectionsAdded).toBe(1);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ type: 'add-connection', source: 'fw-1', target: 'ws-1' })
    );
  });

  it('should detect removed connections', () => {
    const original = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
      connections: [{ source: 'fw-1', target: 'ws-1' }],
    });
    const modified = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
      connections: [],
    });
    const diff = computeSpecDiff(original, modified);
    expect(diff.connectionsRemoved).toBe(1);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ type: 'remove-connection', source: 'fw-1', target: 'ws-1' })
    );
  });

  it('should detect modified connection flowType', () => {
    const original = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
      connections: [{ source: 'fw-1', target: 'ws-1', flowType: 'request' }],
    });
    const modified = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
      connections: [{ source: 'fw-1', target: 'ws-1', flowType: 'encrypted' }],
    });
    const diff = computeSpecDiff(original, modified);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ type: 'modify-connection', field: 'flowType' })
    );
  });

  it('should handle empty specs', () => {
    const diff = computeSpecDiff(makeSpec(), makeSpec());
    expect(diff.operations).toHaveLength(0);
    expect(diff.nodesAdded).toBe(0);
  });

  it('should handle adding nodes to empty spec', () => {
    const modified = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
    });
    const diff = computeSpecDiff(makeSpec(), modified);
    expect(diff.nodesAdded).toBe(2);
    expect(diff.nodesRemoved).toBe(0);
  });

  it('should handle removing all nodes from spec', () => {
    const original = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
    });
    const diff = computeSpecDiff(original, makeSpec());
    expect(diff.nodesAdded).toBe(0);
    expect(diff.nodesRemoved).toBe(2);
  });

  it('should detect multiple changes simultaneously', () => {
    const original = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW', tier: 'dmz' },
        { id: 'ws-1', type: 'web-server', label: 'Web' },
      ],
      connections: [{ source: 'fw-1', target: 'ws-1' }],
    });
    const modified = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'Firewall', tier: 'internal' },
        { id: 'lb-1', type: 'load-balancer', label: 'LB' },
      ],
      connections: [{ source: 'fw-1', target: 'lb-1' }],
    });
    const diff = computeSpecDiff(original, modified);
    expect(diff.nodesAdded).toBe(1); // lb-1
    expect(diff.nodesRemoved).toBe(1); // ws-1
    expect(diff.nodesModified).toBe(1); // fw-1 label + tier
    expect(diff.connectionsAdded).toBe(1); // fw-1→lb-1
    expect(diff.connectionsRemoved).toBe(1); // fw-1→ws-1
    expect(diff.placementChanges).toHaveLength(1);
  });

  it('should not report unchanged nodes as modified', () => {
    const spec = makeSpec({
      nodes: [
        { id: 'fw-1', type: 'firewall', label: 'FW', tier: 'dmz' },
        { id: 'ws-1', type: 'web-server', label: 'Web', tier: 'internal' },
      ],
    });
    const diff = computeSpecDiff(spec, spec);
    expect(diff.nodesModified).toBe(0);
  });

  it('should detect node description changes', () => {
    const original = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW', description: 'old' }] });
    const modified = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW', description: 'new' }] });
    const diff = computeSpecDiff(original, modified);
    expect(diff.nodesModified).toBe(1);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ field: 'description', oldValue: 'old', newValue: 'new' })
    );
  });

  it('should detect zone changes', () => {
    const original = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW', zone: 'zone-a' }] });
    const modified = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW', zone: 'zone-b' }] });
    const diff = computeSpecDiff(original, modified);
    expect(diff.operations).toContainEqual(
      expect.objectContaining({ field: 'zone', oldValue: 'zone-a', newValue: 'zone-b' })
    );
  });
});

describe('hasSignificantChanges', () => {
  it('should return false for no changes', () => {
    expect(hasSignificantChanges({
      operations: [],
      nodesAdded: 0,
      nodesRemoved: 0,
      nodesModified: 0,
      connectionsAdded: 0,
      connectionsRemoved: 0,
      placementChanges: [],
    })).toBe(false);
  });

  it('should return true when nodes are added', () => {
    expect(hasSignificantChanges({
      operations: [],
      nodesAdded: 1,
      nodesRemoved: 0,
      nodesModified: 0,
      connectionsAdded: 0,
      connectionsRemoved: 0,
      placementChanges: [],
    })).toBe(true);
  });

  it('should return true when connections are modified', () => {
    expect(hasSignificantChanges({
      operations: [],
      nodesAdded: 0,
      nodesRemoved: 0,
      nodesModified: 0,
      connectionsAdded: 1,
      connectionsRemoved: 0,
      placementChanges: [],
    })).toBe(true);
  });
});

describe('computeModificationScore', () => {
  it('should return 0 for no original nodes', () => {
    const diff = computeSpecDiff(makeSpec(), makeSpec());
    expect(computeModificationScore(diff, 0)).toBe(0);
  });

  it('should return 0 for no changes', () => {
    const spec = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }] });
    const diff = computeSpecDiff(spec, spec);
    expect(computeModificationScore(diff, 1)).toBe(0);
  });

  it('should return 1.0 when changes equal node count', () => {
    const original = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }] });
    const modified = makeSpec({ nodes: [{ id: 'ws-1', type: 'web-server', label: 'Web' }] });
    const diff = computeSpecDiff(original, modified);
    // 1 removed + 1 added = 2 changes for 1 original node → capped at 1.0
    expect(computeModificationScore(diff, 1)).toBe(1);
  });

  it('should cap at 1.0', () => {
    const original = makeSpec({ nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }] });
    const modified = makeSpec({
      nodes: [
        { id: 'ws-1', type: 'web-server', label: 'Web' },
        { id: 'lb-1', type: 'load-balancer', label: 'LB' },
        { id: 'db-1', type: 'db-server', label: 'DB' },
      ],
    });
    const diff = computeSpecDiff(original, modified);
    expect(computeModificationScore(diff, 1)).toBe(1);
  });
});
