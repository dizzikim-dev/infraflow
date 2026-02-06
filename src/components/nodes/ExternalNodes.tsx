'use client';

import { memo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { InfraNodeData } from '@/types';

type InfraNodeProps = NodeProps<Node<InfraNodeData>>;

// User Node
export const UserNode = memo(function UserNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="👤" color="gray" selected={selected} />;
});

// Internet Node
export const InternetNode = memo(function InternetNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🌏" color="gray" selected={selected} />;
});

// Cloud Nodes
export const AwsVpcNode = memo(function AwsVpcNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="☁️" color="purple" selected={selected} />;
});

export const AzureVnetNode = memo(function AzureVnetNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="☁️" color="purple" selected={selected} />;
});

// Storage Nodes
export const StorageNode = memo(function StorageNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="💾" color="amber" selected={selected} />;
});

export const CacheNode = memo(function CacheNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="⚡" color="amber" selected={selected} />;
});

// Auth Nodes
export const LdapNode = memo(function LdapNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🔑" color="pink" selected={selected} />;
});

export const SsoNode = memo(function SsoNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🎫" color="pink" selected={selected} />;
});
