'use client';

import { memo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { InfraNodeData } from '@/types';

type InfraNodeProps = NodeProps<Node<InfraNodeData>>;

// Web Server Node
export const WebServerNode = memo(function WebServerNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🌐" color="green" selected={selected} />;
});

// App Server Node
export const AppServerNode = memo(function AppServerNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="⚙️" color="green" selected={selected} />;
});

// DB Server Node
export const DbServerNode = memo(function DbServerNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🗄️" color="green" selected={selected} />;
});

// Container Node
export const ContainerNode = memo(function ContainerNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="📦" color="green" selected={selected} />;
});

// VM Node
export const VmNode = memo(function VmNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="💻" color="green" selected={selected} />;
});

// Kubernetes Node
export const KubernetesNode = memo(function KubernetesNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="☸️" color="green" selected={selected} />;
});
