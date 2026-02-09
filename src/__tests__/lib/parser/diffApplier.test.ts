import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  applyOperations,
  type Operation,
  type ReplaceOperation,
  type AddOperation,
  type RemoveOperation,
  type ModifyOperation,
  type ConnectOperation,
  type DisconnectOperation,
} from '@/lib/parser/diffApplier';
import type { InfraSpec } from '@/types/infra';

// Mock nanoid for deterministic node IDs
const MOCK_NANOID = 'AbCdEfGh';
vi.mock('nanoid', () => ({
  nanoid: () => MOCK_NANOID,
}));

describe('diffApplier', () => {
  let baseSpec: InfraSpec;

  beforeEach(() => {
    baseSpec = {
      nodes: [
        { id: 'firewall-1', type: 'firewall', label: 'Firewall', tier: 'dmz' },
        { id: 'web-server-1', type: 'web-server', label: 'Web Server', tier: 'internal' },
        { id: 'db-server-1', type: 'db-server', label: 'Database', tier: 'data' },
      ],
      connections: [
        { source: 'firewall-1', target: 'web-server-1', flowType: 'request' },
        { source: 'web-server-1', target: 'db-server-1', flowType: 'request' },
      ],
    };
  });

  describe('replace operation', () => {
    it('should replace a node with a new type and preserve connections by default', () => {
      const ops: Operation[] = [
        {
          type: 'replace',
          target: 'firewall-1',
          data: {
            newType: 'waf',
            label: 'WAF',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      expect(result.appliedOps).toBe(1);

      // Old node replaced
      const oldNode = result.newSpec.nodes.find((n) => n.id === 'firewall-1');
      expect(oldNode).toBeUndefined();

      // New node exists
      const newNode = result.newSpec.nodes.find((n) => n.type === 'waf');
      expect(newNode).toBeDefined();
      expect(newNode!.label).toBe('WAF');
      expect(newNode!.id).toBe(`waf-${MOCK_NANOID}`);

      // Connections preserved with new ID
      const conn = result.newSpec.connections.find((c) => c.target === 'web-server-1');
      expect(conn).toBeDefined();
      expect(conn!.source).toBe(`waf-${MOCK_NANOID}`);

      // ID mapping tracked
      expect(result.nodeIdMappings.get('firewall-1')).toBe(`waf-${MOCK_NANOID}`);
    });

    it('should remove connections when preserveConnections is false', () => {
      const ops: Operation[] = [
        {
          type: 'replace',
          target: 'firewall-1',
          data: {
            newType: 'waf',
            preserveConnections: false,
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);

      // Connection from old firewall-1 should be gone
      const connFromOld = result.newSpec.connections.find(
        (c) => c.source === 'firewall-1' || c.target === 'firewall-1'
      );
      expect(connFromOld).toBeUndefined();

      // Connection from new node to web-server should also not exist
      const connFromNew = result.newSpec.connections.find(
        (c) => c.source === `waf-${MOCK_NANOID}`
      );
      expect(connFromNew).toBeUndefined();

      // web-server-1 -> db-server-1 connection remains untouched
      const remaining = result.newSpec.connections.find(
        (c) => c.source === 'web-server-1' && c.target === 'db-server-1'
      );
      expect(remaining).toBeDefined();
    });

    it('should throw error for non-existent target node', () => {
      const ops: Operation[] = [
        {
          type: 'replace',
          target: 'non-existent',
          data: { newType: 'waf' },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('non-existent');
    });
  });

  describe('add operation', () => {
    it('should add a new node to the spec', () => {
      const ops: Operation[] = [
        {
          type: 'add',
          target: 'waf',
          data: {
            label: 'WAF',
            tier: 'dmz',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      expect(result.newSpec.nodes).toHaveLength(4);

      const newNode = result.newSpec.nodes.find((n) => n.id === `waf-${MOCK_NANOID}`);
      expect(newNode).toBeDefined();
      expect(newNode!.type).toBe('waf');
      expect(newNode!.label).toBe('WAF');
      expect(newNode!.tier).toBe('dmz');
    });

    it('should create connection from afterNode to new node', () => {
      const ops: Operation[] = [
        {
          type: 'add',
          target: 'waf',
          data: {
            label: 'WAF',
            afterNode: 'firewall-1',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);

      const newConn = result.newSpec.connections.find(
        (c) => c.source === 'firewall-1' && c.target === `waf-${MOCK_NANOID}`
      );
      expect(newConn).toBeDefined();
      expect(newConn!.flowType).toBe('request');
    });

    it('should create connection from new node to beforeNode', () => {
      const ops: Operation[] = [
        {
          type: 'add',
          target: 'waf',
          data: {
            label: 'WAF',
            beforeNode: 'web-server-1',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);

      const newConn = result.newSpec.connections.find(
        (c) => c.source === `waf-${MOCK_NANOID}` && c.target === 'web-server-1'
      );
      expect(newConn).toBeDefined();
    });

    it('should insert between two nodes and re-wire connections', () => {
      const ops: Operation[] = [
        {
          type: 'add',
          target: 'waf',
          data: {
            label: 'WAF',
            betweenNodes: ['firewall-1', 'web-server-1'],
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);

      // Old direct connection removed
      const directConn = result.newSpec.connections.find(
        (c) => c.source === 'firewall-1' && c.target === 'web-server-1'
      );
      expect(directConn).toBeUndefined();

      // New connections: firewall -> waf -> web-server
      const connToNew = result.newSpec.connections.find(
        (c) => c.source === 'firewall-1' && c.target === `waf-${MOCK_NANOID}`
      );
      expect(connToNew).toBeDefined();

      const connFromNew = result.newSpec.connections.find(
        (c) => c.source === `waf-${MOCK_NANOID}` && c.target === 'web-server-1'
      );
      expect(connFromNew).toBeDefined();
    });

    it('should infer tier when not provided', () => {
      const ops: Operation[] = [
        {
          type: 'add',
          target: 'db-server',
          data: {
            label: 'Replica DB',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      const newNode = result.newSpec.nodes.find((n) => n.id === `db-server-${MOCK_NANOID}`);
      expect(newNode).toBeDefined();
      expect(newNode!.tier).toBe('data');
    });
  });

  describe('remove operation', () => {
    it('should remove a node and its connections', () => {
      const ops: Operation[] = [
        {
          type: 'remove',
          target: 'web-server-1',
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      expect(result.newSpec.nodes).toHaveLength(2);

      const removedNode = result.newSpec.nodes.find((n) => n.id === 'web-server-1');
      expect(removedNode).toBeUndefined();

      // All connections involving web-server-1 removed
      const connInvolving = result.newSpec.connections.filter(
        (c) => c.source === 'web-server-1' || c.target === 'web-server-1'
      );
      expect(connInvolving).toHaveLength(0);
    });

    it('should throw error when removing non-existent node', () => {
      const ops: Operation[] = [
        {
          type: 'remove',
          target: 'non-existent-node',
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('non-existent-node');
    });
  });

  describe('modify operation', () => {
    it('should update node label', () => {
      const ops: Operation[] = [
        {
          type: 'modify',
          target: 'web-server-1',
          data: {
            label: 'Updated Web Server',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      const modified = result.newSpec.nodes.find((n) => n.id === 'web-server-1');
      expect(modified!.label).toBe('Updated Web Server');
    });

    it('should update node description', () => {
      const ops: Operation[] = [
        {
          type: 'modify',
          target: 'web-server-1',
          data: {
            description: 'Nginx web server',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      const modified = result.newSpec.nodes.find((n) => n.id === 'web-server-1');
      expect(modified!.description).toBe('Nginx web server');
    });

    it('should update node tier', () => {
      const ops: Operation[] = [
        {
          type: 'modify',
          target: 'web-server-1',
          data: {
            tier: 'dmz',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      const modified = result.newSpec.nodes.find((n) => n.id === 'web-server-1');
      expect(modified!.tier).toBe('dmz');
    });

    it('should throw error for non-existent target', () => {
      const ops: Operation[] = [
        {
          type: 'modify',
          target: 'non-existent',
          data: { label: 'test' },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('non-existent');
    });
  });

  describe('connect operation', () => {
    it('should create a new connection between existing nodes', () => {
      const ops: Operation[] = [
        {
          type: 'connect',
          data: {
            source: 'firewall-1',
            target: 'db-server-1',
            flowType: 'encrypted',
            label: 'Direct DB Access',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);

      const newConn = result.newSpec.connections.find(
        (c) => c.source === 'firewall-1' && c.target === 'db-server-1'
      );
      expect(newConn).toBeDefined();
      expect(newConn!.flowType).toBe('encrypted');
      expect(newConn!.label).toBe('Direct DB Access');
    });

    it('should not create duplicate connection', () => {
      const ops: Operation[] = [
        {
          type: 'connect',
          data: {
            source: 'firewall-1',
            target: 'web-server-1',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);

      // Should still have same number of connections (duplicate prevented)
      const matchingConns = result.newSpec.connections.filter(
        (c) => c.source === 'firewall-1' && c.target === 'web-server-1'
      );
      expect(matchingConns).toHaveLength(1);
    });

    it('should throw error when source node does not exist', () => {
      const ops: Operation[] = [
        {
          type: 'connect',
          data: {
            source: 'non-existent',
            target: 'web-server-1',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('소스 노드를 찾을 수 없습니다');
    });

    it('should throw error when target node does not exist', () => {
      const ops: Operation[] = [
        {
          type: 'connect',
          data: {
            source: 'firewall-1',
            target: 'non-existent',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('타겟 노드를 찾을 수 없습니다');
    });

    it('should default to request flowType when not specified', () => {
      const ops: Operation[] = [
        {
          type: 'connect',
          data: {
            source: 'firewall-1',
            target: 'db-server-1',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      const newConn = result.newSpec.connections.find(
        (c) => c.source === 'firewall-1' && c.target === 'db-server-1'
      );
      expect(newConn!.flowType).toBe('request');
    });
  });

  describe('disconnect operation', () => {
    it('should remove an existing connection', () => {
      const ops: Operation[] = [
        {
          type: 'disconnect',
          data: {
            source: 'firewall-1',
            target: 'web-server-1',
          },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);

      const removedConn = result.newSpec.connections.find(
        (c) => c.source === 'firewall-1' && c.target === 'web-server-1'
      );
      expect(removedConn).toBeUndefined();

      // Other connections remain
      expect(result.newSpec.connections).toHaveLength(1);
    });

    it('should handle disconnect when nodes are not found by falling back to ID matching', () => {
      const ops: Operation[] = [
        {
          type: 'disconnect',
          data: {
            source: 'firewall-1',
            target: 'web-server-1',
          },
        },
      ];

      // Remove nodes but keep connections to test the fallback path
      const specWithOrphanConns: InfraSpec = {
        nodes: [],
        connections: [
          { source: 'firewall-1', target: 'web-server-1', flowType: 'request' },
        ],
      };

      const result = applyOperations(specWithOrphanConns, ops);

      expect(result.success).toBe(true);
      expect(result.newSpec.connections).toHaveLength(0);
    });
  });

  describe('findNode matching', () => {
    it('should find node by exact ID', () => {
      const ops: Operation[] = [
        {
          type: 'modify',
          target: 'firewall-1',
          data: { label: 'Found by ID' },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      const modified = result.newSpec.nodes.find((n) => n.id === 'firewall-1');
      expect(modified!.label).toBe('Found by ID');
    });

    it('should find node by type when ID does not match', () => {
      const ops: Operation[] = [
        {
          type: 'modify',
          target: 'firewall',
          data: { label: 'Found by type' },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      const modified = result.newSpec.nodes.find((n) => n.type === 'firewall');
      expect(modified!.label).toBe('Found by type');
    });

    it('should find node by partial ID match', () => {
      const ops: Operation[] = [
        {
          type: 'modify',
          target: 'web-server',
          data: { label: 'Found by partial' },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      const modified = result.newSpec.nodes.find((n) => n.id === 'web-server-1');
      expect(modified!.label).toBe('Found by partial');
    });
  });

  describe('multiple operations', () => {
    it('should apply multiple operations sequentially', () => {
      const ops: Operation[] = [
        {
          type: 'add',
          target: 'waf',
          data: { label: 'WAF' },
        },
        {
          type: 'modify',
          target: 'web-server-1',
          data: { label: 'Updated Web Server' },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(true);
      expect(result.appliedOps).toBe(2);
      expect(result.newSpec.nodes).toHaveLength(4);

      const modified = result.newSpec.nodes.find((n) => n.id === 'web-server-1');
      expect(modified!.label).toBe('Updated Web Server');
    });

    it('should continue applying operations even if one fails and record errors', () => {
      const ops: Operation[] = [
        {
          type: 'remove',
          target: 'non-existent',
        },
        {
          type: 'modify',
          target: 'web-server-1',
          data: { label: 'Still Modified' },
        },
      ];

      const result = applyOperations(baseSpec, ops);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      // The second op should still be applied
      expect(result.appliedOps).toBe(1);

      const modified = result.newSpec.nodes.find((n) => n.id === 'web-server-1');
      expect(modified!.label).toBe('Still Modified');
    });
  });

  describe('immutability', () => {
    it('should not mutate the original spec', () => {
      const originalNodes = baseSpec.nodes.map((n) => ({ ...n }));
      const originalConnections = baseSpec.connections.map((c) => ({ ...c }));

      const ops: Operation[] = [
        {
          type: 'remove',
          target: 'web-server-1',
        },
      ];

      applyOperations(baseSpec, ops);

      // Original spec should be unchanged
      expect(baseSpec.nodes).toHaveLength(originalNodes.length);
      expect(baseSpec.connections).toHaveLength(originalConnections.length);
    });
  });
});
