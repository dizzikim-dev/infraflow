import { describe, it, expect } from 'vitest';
import { specToFlow, getTierLabel } from '@/lib/layout/layoutEngine';
import { getTierForType } from '@/lib/data';
import type { InfraSpec } from '@/types';
import type { InfraNodeType } from '@/types/infra';

describe('telecom layout engine', () => {
  describe('telecom component tier placements via SSoT', () => {
    it('should place central-office in dmz tier', () => {
      expect(getTierForType('central-office' as InfraNodeType)).toBe('dmz');
    });

    it('should place base-station in external tier', () => {
      expect(getTierForType('base-station' as InfraNodeType)).toBe('external');
    });

    it('should place olt in dmz tier', () => {
      expect(getTierForType('olt' as InfraNodeType)).toBe('dmz');
    });

    it('should place customer-premise in external tier', () => {
      expect(getTierForType('customer-premise' as InfraNodeType)).toBe('external');
    });

    it('should place idc in internal tier', () => {
      expect(getTierForType('idc' as InfraNodeType)).toBe('internal');
    });
  });

  describe('wan component tier placements via SSoT', () => {
    it('should place pe-router in dmz tier', () => {
      expect(getTierForType('pe-router' as InfraNodeType)).toBe('dmz');
    });

    it('should place p-router in internal tier', () => {
      expect(getTierForType('p-router' as InfraNodeType)).toBe('internal');
    });

    it('should place mpls-network in internal tier', () => {
      expect(getTierForType('mpls-network' as InfraNodeType)).toBe('internal');
    });

    it('should place dedicated-line in dmz tier', () => {
      expect(getTierForType('dedicated-line' as InfraNodeType)).toBe('dmz');
    });

    it('should place metro-ethernet in dmz tier', () => {
      expect(getTierForType('metro-ethernet' as InfraNodeType)).toBe('dmz');
    });

    it('should place corporate-internet in dmz tier', () => {
      expect(getTierForType('corporate-internet' as InfraNodeType)).toBe('dmz');
    });

    it('should place vpn-service in internal tier', () => {
      expect(getTierForType('vpn-service' as InfraNodeType)).toBe('internal');
    });

    it('should place sd-wan-service in dmz tier', () => {
      expect(getTierForType('sd-wan-service' as InfraNodeType)).toBe('dmz');
    });

    it('should place private-5g in internal tier', () => {
      expect(getTierForType('private-5g' as InfraNodeType)).toBe('internal');
    });

    it('should place core-network in internal tier', () => {
      expect(getTierForType('core-network' as InfraNodeType)).toBe('internal');
    });

    it('should place upf in internal tier', () => {
      expect(getTierForType('upf' as InfraNodeType)).toBe('internal');
    });

    it('should place ring-network in dmz tier', () => {
      expect(getTierForType('ring-network' as InfraNodeType)).toBe('dmz');
    });
  });

  describe('telecom zone keyword to tier mapping', () => {
    it('should map access zone to dmz tier (already existed)', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE', zone: 'access' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'cpe-1');
      expect(node!.data.tier).toBe('dmz');
    });

    it('should map aggregation zone to dmz tier', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'co-1', type: 'central-office', label: '국사', zone: 'aggregation' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'co-1');
      expect(node!.data.tier).toBe('dmz');
    });

    it('should map backbone zone to internal tier', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'mpls-1', type: 'mpls-network', label: 'MPLS', zone: 'backbone' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'mpls-1');
      expect(node!.data.tier).toBe('internal');
    });

    it('should map core-dc zone to internal tier', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'idc-1', type: 'idc', label: 'IDC', zone: 'core-dc' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'idc-1');
      expect(node!.data.tier).toBe('internal');
    });

    it('should map ran zone to external tier', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'bs-1', type: 'base-station', label: '기지국', zone: 'ran' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'bs-1');
      expect(node!.data.tier).toBe('external');
    });

    it('should map transport zone to dmz tier', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'dl-1', type: 'dedicated-line', label: '전용회선', zone: 'transport' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'dl-1');
      expect(node!.data.tier).toBe('dmz');
    });

    it('should map 국사 zone to dmz tier', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'co-1', type: 'central-office', label: '국사', zone: '국사' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'co-1');
      expect(node!.data.tier).toBe('dmz');
    });

    it('should map 백본 zone to internal tier', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'p-1', type: 'p-router', label: 'P Router', zone: '백본' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'p-1');
      expect(node!.data.tier).toBe('internal');
    });

    it('should map 기지국 zone to external tier', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'bs-1', type: 'base-station', label: '기지국', zone: '기지국' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes.find(n => n.id === 'bs-1');
      expect(node!.data.tier).toBe('external');
    });
  });

  describe('telecom specToFlow layout', () => {
    it('should convert telecom spec to nodes and edges', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
          { id: 'co-1', type: 'central-office', label: '국사' },
          { id: 'mpls-1', type: 'mpls-network', label: 'MPLS' },
          { id: 'idc-1', type: 'idc', label: 'IDC' },
        ],
        connections: [
          { source: 'cpe-1', target: 'co-1', flowType: 'wan-link' },
          { source: 'co-1', target: 'mpls-1', flowType: 'tunnel' },
          { source: 'mpls-1', target: 'idc-1' },
        ],
      };

      const result = specToFlow(spec);

      expect(result.nodes).toHaveLength(4);
      expect(result.edges).toHaveLength(3);
    });

    it('should assign positions to all telecom nodes', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
          { id: 'pe-1', type: 'pe-router', label: 'PE Router' },
          { id: 'p-1', type: 'p-router', label: 'P Router' },
        ],
        connections: [
          { source: 'cpe-1', target: 'pe-1' },
          { source: 'pe-1', target: 'p-1' },
        ],
      };

      const result = specToFlow(spec);

      for (const node of result.nodes) {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
      }
    });

    it('should preserve flowType in edge data for wan-link', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
          { id: 'co-1', type: 'central-office', label: '국사' },
        ],
        connections: [
          { source: 'cpe-1', target: 'co-1', flowType: 'wan-link' },
        ],
      };

      const result = specToFlow(spec);
      const edge = result.edges[0];

      expect(edge.data?.flowType).toBe('wan-link');
    });

    it('should preserve flowType in edge data for wireless', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'bs-1', type: 'base-station', label: '기지국' },
          { id: 'core-1', type: 'core-network', label: '코어망' },
        ],
        connections: [
          { source: 'bs-1', target: 'core-1', flowType: 'wireless' },
        ],
      };

      const result = specToFlow(spec);
      const edge = result.edges[0];

      expect(edge.data?.flowType).toBe('wireless');
    });

    it('should preserve flowType in edge data for tunnel', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'pe-1', type: 'pe-router', label: 'PE' },
          { id: 'pe-2', type: 'pe-router', label: 'PE2' },
        ],
        connections: [
          { source: 'pe-1', target: 'pe-2', flowType: 'tunnel' },
        ],
      };

      const result = specToFlow(spec);
      const edge = result.edges[0];

      expect(edge.data?.flowType).toBe('tunnel');
    });

    it('should place CPE before IDC in x-axis (external to internal)', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
          { id: 'co-1', type: 'central-office', label: '국사' },
          { id: 'idc-1', type: 'idc', label: 'IDC' },
        ],
        connections: [
          { source: 'cpe-1', target: 'co-1' },
          { source: 'co-1', target: 'idc-1' },
        ],
      };

      const result = specToFlow(spec);
      const cpe = result.nodes.find(n => n.id === 'cpe-1');
      const idc = result.nodes.find(n => n.id === 'idc-1');

      // CPE (external) should be to the left of IDC (internal)
      expect(cpe!.position.x).toBeLessThan(idc!.position.x);
    });
  });
});
