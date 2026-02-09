import { InfraSpec, InfraNodeSpec, InfraNodeType, ConnectionSpec } from '@/types';

/**
 * PlantUML export options
 */
export interface PlantUMLExportOptions {
  format?: 'c4' | 'deployment' | 'component';
  title?: string;
  includeStyles?: boolean;
  includeZones?: boolean;
}

/**
 * Map node types to C4 model elements
 */
const c4ElementMap: Record<InfraNodeType, { stereotype: string; shape: string }> = {
  // Security
  'firewall': { stereotype: 'Security', shape: 'Container' },
  'waf': { stereotype: 'Security', shape: 'Container' },
  'ids-ips': { stereotype: 'Security', shape: 'Container' },
  'vpn-gateway': { stereotype: 'Security', shape: 'Container' },
  'nac': { stereotype: 'Security', shape: 'Container' },
  'dlp': { stereotype: 'Security', shape: 'Container' },

  // Network
  'router': { stereotype: 'Network', shape: 'Container' },
  'switch-l2': { stereotype: 'Network', shape: 'Container' },
  'switch-l3': { stereotype: 'Network', shape: 'Container' },
  'load-balancer': { stereotype: 'Network', shape: 'Container' },
  'sd-wan': { stereotype: 'Network', shape: 'Container' },
  'dns': { stereotype: 'Network', shape: 'Container' },
  'cdn': { stereotype: 'Network', shape: 'Container' },

  // Compute
  'web-server': { stereotype: 'Compute', shape: 'Container' },
  'app-server': { stereotype: 'Compute', shape: 'Container' },
  'db-server': { stereotype: 'Database', shape: 'ContainerDb' },
  'container': { stereotype: 'Compute', shape: 'Container' },
  'vm': { stereotype: 'Compute', shape: 'Container' },
  'kubernetes': { stereotype: 'Compute', shape: 'Container' },

  // Cloud
  'aws-vpc': { stereotype: 'Cloud', shape: 'System_Boundary' },
  'azure-vnet': { stereotype: 'Cloud', shape: 'System_Boundary' },
  'gcp-network': { stereotype: 'Cloud', shape: 'System_Boundary' },
  'private-cloud': { stereotype: 'Cloud', shape: 'System_Boundary' },

  // Storage
  'san-nas': { stereotype: 'Storage', shape: 'ContainerDb' },
  'object-storage': { stereotype: 'Storage', shape: 'ContainerDb' },
  'backup': { stereotype: 'Storage', shape: 'ContainerDb' },
  'cache': { stereotype: 'Storage', shape: 'ContainerDb' },
  'storage': { stereotype: 'Storage', shape: 'ContainerDb' },

  // Auth
  'ldap-ad': { stereotype: 'Auth', shape: 'Container' },
  'sso': { stereotype: 'Auth', shape: 'Container' },
  'mfa': { stereotype: 'Auth', shape: 'Container' },
  'iam': { stereotype: 'Auth', shape: 'Container' },

  // External
  'user': { stereotype: 'External', shape: 'Person' },
  'internet': { stereotype: 'External', shape: 'System_Ext' },

  // Zone
  'zone': { stereotype: 'Zone', shape: 'System_Boundary' },

  // Telecom
  'central-office': { stereotype: 'Telecom', shape: 'Container' },
  'base-station': { stereotype: 'Telecom', shape: 'Container' },
  'olt': { stereotype: 'Telecom', shape: 'Container' },
  'customer-premise': { stereotype: 'Telecom', shape: 'Container' },
  'idc': { stereotype: 'Telecom', shape: 'Container' },

  // WAN
  'pe-router': { stereotype: 'WAN', shape: 'Container' },
  'p-router': { stereotype: 'WAN', shape: 'Container' },
  'mpls-network': { stereotype: 'WAN', shape: 'System_Boundary' },
  'dedicated-line': { stereotype: 'WAN', shape: 'Container' },
  'metro-ethernet': { stereotype: 'WAN', shape: 'Container' },
  'corporate-internet': { stereotype: 'WAN', shape: 'Container' },
  'vpn-service': { stereotype: 'WAN', shape: 'Container' },
  'sd-wan-service': { stereotype: 'WAN', shape: 'Container' },
  'private-5g': { stereotype: 'WAN', shape: 'Container' },
  'core-network': { stereotype: 'WAN', shape: 'Container' },
  'upf': { stereotype: 'WAN', shape: 'Container' },
  'ring-network': { stereotype: 'WAN', shape: 'System_Boundary' },
};

/**
 * Sanitize ID for PlantUML
 */
function sanitizePUMLId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Generate C4 model styles
 */
function generateC4Styles(): string {
  return `
!define SECURITY_COLOR #FF6B6B
!define NETWORK_COLOR #4ECDC4
!define COMPUTE_COLOR #45B7D1
!define STORAGE_COLOR #FFA07A
!define AUTH_COLOR #DDA0DD
!define EXTERNAL_COLOR #808080

AddElementTag("security", $bgColor=SECURITY_COLOR)
AddElementTag("network", $bgColor=NETWORK_COLOR)
AddElementTag("compute", $bgColor=COMPUTE_COLOR)
AddElementTag("storage", $bgColor=STORAGE_COLOR)
AddElementTag("auth", $bgColor=AUTH_COLOR)
AddElementTag("external", $bgColor=EXTERNAL_COLOR)
`;
}

/**
 * Generate C4 element
 */
function generateC4Element(node: InfraNodeSpec): string {
  const elementInfo = c4ElementMap[node.type] || { stereotype: 'Component', shape: 'Container' };
  const id = sanitizePUMLId(node.id);
  const label = node.label;
  const description = node.description || `${node.type} component`;
  const tag = elementInfo.stereotype.toLowerCase();

  switch (elementInfo.shape) {
    case 'Person':
      return `Person(${id}, "${label}", "${description}", $tags="${tag}")`;
    case 'System_Ext':
      return `System_Ext(${id}, "${label}", "${description}", $tags="${tag}")`;
    case 'System_Boundary':
      return `System_Boundary(${id}, "${label}") {`;
    case 'ContainerDb':
      return `ContainerDb(${id}, "${label}", "", "${description}", $tags="${tag}")`;
    default:
      return `Container(${id}, "${label}", "", "${description}", $tags="${tag}")`;
  }
}

/**
 * Generate C4 relationship
 */
function generateC4Relationship(conn: ConnectionSpec, spec: InfraSpec): string {
  const sourceId = sanitizePUMLId(conn.source);
  const targetId = sanitizePUMLId(conn.target);
  const label = conn.label || '';
  const flowType = conn.flowType || 'request';

  let style = '';
  switch (flowType) {
    case 'encrypted':
      style = ', $tags="encrypted"';
      break;
    case 'blocked':
      style = ', $tags="blocked"';
      break;
    case 'sync':
      style = '<->';
      break;
    default:
      break;
  }

  if (style === '<->') {
    return `BiRel(${sourceId}, ${targetId}, "${label}")`;
  }

  return `Rel(${sourceId}, ${targetId}, "${label}"${style})`;
}

/**
 * Export to C4 model format
 */
function exportToC4(spec: InfraSpec, options: PlantUMLExportOptions): string {
  const { title = 'Infrastructure Architecture', includeStyles = true, includeZones = true } = options;

  const lines: string[] = [
    '@startuml',
    '!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml',
    '',
    `title ${title}`,
    '',
  ];

  if (includeStyles) {
    lines.push(generateC4Styles());
  }

  // Group nodes by zone
  const zoneGroups = new Map<string, InfraNodeSpec[]>();
  const noZoneNodes: InfraNodeSpec[] = [];

  for (const node of spec.nodes) {
    const zone = node.zone || '';
    if (zone && includeZones) {
      if (!zoneGroups.has(zone)) {
        zoneGroups.set(zone, []);
      }
      zoneGroups.get(zone)!.push(node);
    } else {
      noZoneNodes.push(node);
    }
  }

  // Generate external nodes first
  const externalNodes = noZoneNodes.filter((n) =>
    ['user', 'internet'].includes(n.type)
  );
  const internalNodes = noZoneNodes.filter((n) =>
    !['user', 'internet'].includes(n.type)
  );

  for (const node of externalNodes) {
    lines.push(generateC4Element(node));
  }

  // Generate zones
  if (includeZones && zoneGroups.size > 0) {
    for (const [zone, nodes] of zoneGroups) {
      lines.push('');
      lines.push(`System_Boundary(${sanitizePUMLId(zone)}, "${zone}") {`);
      for (const node of nodes) {
        lines.push(`  ${generateC4Element(node)}`);
      }
      lines.push('}');
    }
  }

  // Generate internal nodes without zone
  if (internalNodes.length > 0) {
    lines.push('');
    lines.push('System_Boundary(internal, "Internal") {');
    for (const node of internalNodes) {
      lines.push(`  ${generateC4Element(node)}`);
    }
    lines.push('}');
  }

  // Generate relationships
  lines.push('');
  for (const conn of spec.connections) {
    lines.push(generateC4Relationship(conn, spec));
  }

  lines.push('');
  lines.push('@enduml');

  return lines.join('\n');
}

/**
 * Generate deployment diagram element
 */
function generateDeploymentElement(node: InfraNodeSpec): string {
  const id = sanitizePUMLId(node.id);
  const label = node.label;
  const elementInfo = c4ElementMap[node.type] || { stereotype: 'Component', shape: 'node' };

  switch (node.type) {
    case 'user':
      return `actor "${label}" as ${id}`;
    case 'internet':
      return `cloud "${label}" as ${id}`;
    case 'db-server':
    case 'cache':
    case 'storage':
    case 'san-nas':
    case 'object-storage':
      return `database "${label}" as ${id}`;
    case 'load-balancer':
    case 'cdn':
      return `node "${label}" as ${id} <<load balancer>>`;
    case 'firewall':
    case 'waf':
    case 'ids-ips':
      return `node "${label}" as ${id} <<security>>`;
    case 'kubernetes':
    case 'container':
      return `node "${label}" as ${id} <<container>>`;
    default:
      return `node "${label}" as ${id}`;
  }
}

/**
 * Export to deployment diagram format
 */
function exportToDeployment(spec: InfraSpec, options: PlantUMLExportOptions): string {
  const { title = 'Deployment Diagram', includeZones = true } = options;

  const lines: string[] = [
    '@startuml',
    `title ${title}`,
    '',
    'skinparam nodeBackgroundColor<<security>> LightCoral',
    'skinparam nodeBackgroundColor<<load balancer>> LightBlue',
    'skinparam nodeBackgroundColor<<container>> LightGreen',
    '',
  ];

  // Group nodes by zone
  const zoneGroups = new Map<string, InfraNodeSpec[]>();
  const noZoneNodes: InfraNodeSpec[] = [];

  for (const node of spec.nodes) {
    const zone = node.zone || '';
    if (zone && includeZones) {
      if (!zoneGroups.has(zone)) {
        zoneGroups.set(zone, []);
      }
      zoneGroups.get(zone)!.push(node);
    } else {
      noZoneNodes.push(node);
    }
  }

  // Generate elements
  for (const node of noZoneNodes) {
    lines.push(generateDeploymentElement(node));
  }

  // Generate zones
  if (includeZones && zoneGroups.size > 0) {
    for (const [zone, nodes] of zoneGroups) {
      lines.push('');
      lines.push(`package "${zone}" {`);
      for (const node of nodes) {
        lines.push(`  ${generateDeploymentElement(node)}`);
      }
      lines.push('}');
    }
  }

  // Generate relationships
  lines.push('');
  for (const conn of spec.connections) {
    const sourceId = sanitizePUMLId(conn.source);
    const targetId = sanitizePUMLId(conn.target);
    const label = conn.label || '';
    const flowType = conn.flowType || 'request';

    let arrow = '-->';
    if (flowType === 'sync') {
      arrow = '<-->';
    } else if (flowType === 'blocked') {
      arrow = '-[#red]-x';
    } else if (flowType === 'encrypted') {
      arrow = '==[#green]==>';
    }

    lines.push(`${sourceId} ${arrow} ${targetId}${label ? ` : ${label}` : ''}`);
  }

  lines.push('');
  lines.push('@enduml');

  return lines.join('\n');
}

/**
 * Export to component diagram format
 */
function exportToComponent(spec: InfraSpec, options: PlantUMLExportOptions): string {
  const { title = 'Component Diagram' } = options;

  const lines: string[] = [
    '@startuml',
    `title ${title}`,
    '',
    'skinparam componentStyle rectangle',
    'skinparam linetype ortho',
    '',
  ];

  // Generate components
  for (const node of spec.nodes) {
    const id = sanitizePUMLId(node.id);
    const label = node.label;
    const elementInfo = c4ElementMap[node.type] || { stereotype: 'Component', shape: 'component' };

    switch (node.type) {
      case 'user':
        lines.push(`actor "${label}" as ${id}`);
        break;
      case 'internet':
        lines.push(`cloud "${label}" as ${id}`);
        break;
      case 'db-server':
      case 'cache':
      case 'storage':
        lines.push(`database "${label}" as ${id}`);
        break;
      default:
        lines.push(`[${label}] as ${id}`);
    }
  }

  // Generate relationships
  lines.push('');
  for (const conn of spec.connections) {
    const sourceId = sanitizePUMLId(conn.source);
    const targetId = sanitizePUMLId(conn.target);
    const label = conn.label || '';

    lines.push(`${sourceId} --> ${targetId}${label ? ` : ${label}` : ''}`);
  }

  lines.push('');
  lines.push('@enduml');

  return lines.join('\n');
}

/**
 * Export InfraSpec to PlantUML format
 */
export function exportToPlantUML(
  spec: InfraSpec,
  options: PlantUMLExportOptions = {}
): string {
  const { format = 'c4' } = options;

  switch (format) {
    case 'c4':
      return exportToC4(spec, options);
    case 'deployment':
      return exportToDeployment(spec, options);
    case 'component':
      return exportToComponent(spec, options);
    default:
      return exportToC4(spec, options);
  }
}
