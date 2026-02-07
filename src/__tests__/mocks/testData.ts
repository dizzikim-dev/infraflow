import { Node, Edge } from '@xyflow/react';
import { InfraSpec, InfraNodeData } from '@/types';

/**
 * Mock test data for testing hooks and components
 */

// Sample InfraSpec for testing
export const mockInfraSpec: InfraSpec = {
  name: 'Test Architecture',
  description: 'Test infrastructure spec',
  nodes: [
    {
      id: 'firewall-1',
      type: 'firewall',
      label: '방화벽',
      tier: 'dmz',
    },
    {
      id: 'web-server-1',
      type: 'web-server',
      label: '웹서버',
      tier: 'dmz',
    },
    {
      id: 'app-server-1',
      type: 'app-server',
      label: '앱서버',
      tier: 'internal',
    },
    {
      id: 'db-server-1',
      type: 'db-server',
      label: 'DB서버',
      tier: 'data',
    },
  ],
  connections: [
    { source: 'firewall-1', target: 'web-server-1' },
    { source: 'web-server-1', target: 'app-server-1' },
    { source: 'app-server-1', target: 'db-server-1' },
  ],
};

// Sample React Flow nodes
export const mockNodes: Node<InfraNodeData>[] = [
  {
    id: 'firewall-1',
    type: 'firewall',
    position: { x: 0, y: 100 },
    data: {
      label: '방화벽',
      nodeType: 'firewall',
      category: 'security',
      tier: 'dmz',
      description: 'Main firewall',
    },
  },
  {
    id: 'web-server-1',
    type: 'web-server',
    position: { x: 200, y: 100 },
    data: {
      label: '웹서버',
      nodeType: 'web-server',
      category: 'compute',
      tier: 'dmz',
      description: 'Web server',
    },
  },
  {
    id: 'app-server-1',
    type: 'app-server',
    position: { x: 400, y: 100 },
    data: {
      label: '앱서버',
      nodeType: 'app-server',
      category: 'compute',
      tier: 'internal',
      description: 'Application server',
    },
  },
];

// Sample React Flow edges
export const mockEdges: Edge[] = [
  {
    id: 'e_firewall-1_web-server-1',
    source: 'firewall-1',
    target: 'web-server-1',
    type: 'animated',
  },
  {
    id: 'e_web-server-1_app-server-1',
    source: 'web-server-1',
    target: 'app-server-1',
    type: 'animated',
  },
];

// Sample component data for addNode
export const mockComponentData = {
  id: 'firewall',
  name: 'Firewall',
  nameKo: '방화벽',
  category: 'security',
  tier: 'dmz',
};

// Empty states for testing initial conditions
export const emptySpec: InfraSpec = {
  name: '',
  description: '',
  nodes: [],
  connections: [],
};

export const emptyNodes: Node[] = [];
export const emptyEdges: Edge[] = [];
