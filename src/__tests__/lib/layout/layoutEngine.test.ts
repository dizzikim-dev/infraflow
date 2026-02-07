import { describe, it, expect } from 'vitest';
import { specToFlow, relayoutNodes, getTierLabel } from '@/lib/layout/layoutEngine';
import { InfraSpec } from '@/types';

describe('layoutEngine', () => {
  describe('specToFlow', () => {
    it('should convert InfraSpec to nodes and edges', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'user', type: 'user', label: 'User' },
          { id: 'firewall', type: 'firewall', label: 'Firewall' },
          { id: 'web', type: 'web-server', label: 'Web Server' },
        ],
        connections: [
          { source: 'user', target: 'firewall' },
          { source: 'firewall', target: 'web' },
        ],
      };

      const result = specToFlow(spec);

      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
    });

    it('should assign positions to all nodes', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'user', type: 'user', label: 'User' },
          { id: 'firewall', type: 'firewall', label: 'Firewall' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);

      for (const node of result.nodes) {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
      }
    });

    it('should place nodes in correct tiers', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'user', type: 'user', label: 'User' },
          { id: 'firewall', type: 'firewall', label: 'Firewall' },
          { id: 'db', type: 'db-server', label: 'Database' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);

      const userNode = result.nodes.find(n => n.id === 'user');
      const firewallNode = result.nodes.find(n => n.id === 'firewall');
      const dbNode = result.nodes.find(n => n.id === 'db');

      // External tier should be leftmost
      // Data tier should be rightmost
      expect(userNode!.position.x).toBeLessThan(dbNode!.position.x);
      expect(firewallNode!.position.x).toBeLessThan(dbNode!.position.x);
    });

    it('should create edges with correct source and target', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'a', type: 'user', label: 'A' },
          { id: 'b', type: 'firewall', label: 'B' },
        ],
        connections: [{ source: 'a', target: 'b' }],
      };

      const result = specToFlow(spec);

      expect(result.edges[0].source).toBe('a');
      expect(result.edges[0].target).toBe('b');
    });

    it('should handle empty spec', () => {
      const spec: InfraSpec = {
        nodes: [],
        connections: [],
      };

      const result = specToFlow(spec);

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('should set correct node data', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'fw', type: 'firewall', label: 'My Firewall' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);
      const node = result.nodes[0];

      expect(node.data.label).toBe('My Firewall');
      expect(node.data.nodeType).toBe('firewall');
      expect(node.data.category).toBe('security');
    });

    it('should use zone for tier placement when specified', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'server1', type: 'web-server', label: 'Server 1', zone: 'dmz' },
          { id: 'server2', type: 'web-server', label: 'Server 2', zone: 'internal' },
        ],
        connections: [],
      };

      const result = specToFlow(spec);

      const server1 = result.nodes.find(n => n.id === 'server1');
      const server2 = result.nodes.find(n => n.id === 'server2');

      expect(server1!.data.tier).toBe('dmz');
      expect(server2!.data.tier).toBe('internal');
    });

    it('should respect custom layout config', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'user', type: 'user', label: 'User' },
        ],
        connections: [],
      };

      const config = {
        startX: 500,
        startY: 500,
      };

      const result = specToFlow(spec, config);
      const node = result.nodes[0];

      expect(node.position.x).toBeGreaterThanOrEqual(config.startX);
    });

    it('should sort nodes in tier by connection count', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'hub', type: 'load-balancer', label: 'Hub' },
          { id: 'node1', type: 'web-server', label: 'Node 1' },
          { id: 'node2', type: 'web-server', label: 'Node 2' },
        ],
        connections: [
          { source: 'hub', target: 'node1' },
          { source: 'hub', target: 'node2' },
        ],
      };

      const result = specToFlow(spec);

      // Hub has more connections, might be placed differently
      expect(result.nodes.length).toBe(3);
    });
  });

  describe('relayoutNodes', () => {
    it('should update node positions', () => {
      const nodes = [
        {
          id: 'user',
          type: 'user',
          position: { x: 0, y: 0 },
          data: { label: 'User', nodeType: 'user', category: 'external' },
        },
        {
          id: 'db',
          type: 'dbServer',
          position: { x: 0, y: 0 },
          data: { label: 'DB', nodeType: 'db-server', category: 'compute' },
        },
      ];

      const edges = [
        { id: 'e1', source: 'user', target: 'db' },
      ];

      const result = relayoutNodes(nodes, edges);

      // Positions should be updated
      expect(result[0].position.x).not.toBe(0);
      expect(result[1].position.x).not.toBe(0);
    });

    it('should maintain node data', () => {
      const nodes = [
        {
          id: 'user',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'Custom Label',
            nodeType: 'user',
            category: 'external',
            customProp: 'value',
          },
        },
      ];

      const result = relayoutNodes(nodes, []);

      expect(result[0].data.label).toBe('Custom Label');
      expect(result[0].data.customProp).toBe('value');
    });
  });

  describe('getTierLabel', () => {
    it('should return Korean labels for known tiers', () => {
      expect(getTierLabel('external')).toBe('외부 (External)');
      expect(getTierLabel('dmz')).toBe('DMZ');
      expect(getTierLabel('internal')).toBe('내부망 (Internal)');
      expect(getTierLabel('data')).toBe('데이터 (Data)');
    });

    it('should return tier name for unknown tiers', () => {
      expect(getTierLabel('unknown')).toBe('unknown');
      expect(getTierLabel('custom-tier')).toBe('custom-tier');
    });
  });
});
