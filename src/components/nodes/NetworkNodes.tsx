'use client';

import { memo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { InfraNodeData } from '@/types';

type InfraNodeProps = NodeProps<Node<InfraNodeData>>;

// Router Node
export const RouterNode = memo(function RouterNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="📡" color="blue" selected={selected} />;
});

// Switch L2 Node
export const SwitchL2Node = memo(function SwitchL2Node({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🔀" color="blue" selected={selected} />;
});

// Switch L3 Node
export const SwitchL3Node = memo(function SwitchL3Node({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🔀" color="blue" selected={selected} />;
});

// Load Balancer Node
export const LoadBalancerNode = memo(function LoadBalancerNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="⚖️" color="blue" selected={selected} />;
});

// SD-WAN Node
export const SdWanNode = memo(function SdWanNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🌐" color="blue" selected={selected} />;
});

// DNS Node
export const DnsNode = memo(function DnsNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="📖" color="blue" selected={selected} />;
});

// CDN Node
export const CdnNode = memo(function CdnNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🌍" color="blue" selected={selected} />;
});
