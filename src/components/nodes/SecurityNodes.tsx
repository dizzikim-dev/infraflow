'use client';

import { memo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { InfraNodeData } from '@/types';

type InfraNodeProps = NodeProps<Node<InfraNodeData>>;

// Firewall Node
export const FirewallNode = memo(function FirewallNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🔥" color="red" selected={selected} />;
});

// WAF Node
export const WafNode = memo(function WafNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🛡️" color="red" selected={selected} />;
});

// IDS/IPS Node
export const IdsIpsNode = memo(function IdsIpsNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="👁️" color="red" selected={selected} />;
});

// VPN Gateway Node
export const VpnGatewayNode = memo(function VpnGatewayNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🔐" color="red" selected={selected} />;
});

// NAC Node
export const NacNode = memo(function NacNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="🚧" color="red" selected={selected} />;
});

// DLP Node
export const DlpNode = memo(function DlpNode({ data, selected }: InfraNodeProps) {
  return <BaseNode data={data} icon="📋" color="red" selected={selected} />;
});
