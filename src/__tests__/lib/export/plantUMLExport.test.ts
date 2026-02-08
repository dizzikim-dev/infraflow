import { describe, it, expect } from 'vitest';
import { exportToPlantUML, type PlantUMLExportOptions } from '@/lib/export/plantUMLExport';
import type { InfraSpec, InfraNodeSpec, ConnectionSpec } from '@/types';

describe('PlantUMLExport', () => {
  // Helper to create a basic InfraSpec
  const createSpec = (
    nodes: InfraNodeSpec[],
    connections: ConnectionSpec[] = []
  ): InfraSpec => ({
    nodes,
    connections,
  });

  // Helper to create a node
  const createNode = (
    id: string,
    type: InfraNodeSpec['type'],
    label: string,
    zone?: string,
    description?: string
  ): InfraNodeSpec => ({
    id,
    type,
    label,
    zone,
    description,
  });

  // Helper to create a connection
  const createConnection = (
    source: string,
    target: string,
    flowType?: ConnectionSpec['flowType'],
    label?: string
  ): ConnectionSpec => ({
    source,
    target,
    flowType,
    label,
  });

  describe('exportToPlantUML', () => {
    describe('Valid PlantUML Syntax', () => {
      it('should generate valid PlantUML syntax', () => {
        const spec = createSpec([createNode('fw-1', 'firewall', 'Firewall')]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('@startuml');
        expect(result).toContain('@enduml');
      });

      it('should include C4 model include directive', () => {
        const spec = createSpec([]);
        const result = exportToPlantUML(spec, { format: 'c4' });

        expect(result).toContain('!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml');
      });

      it('should include title', () => {
        const spec = createSpec([]);
        const result = exportToPlantUML(spec, { title: 'My Architecture' });

        expect(result).toContain('title My Architecture');
      });

      it('should use default title when not specified', () => {
        const spec = createSpec([]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('title Infrastructure Architecture');
      });
    });

    describe('Include All Nodes', () => {
      it('should include all nodes in output', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('web-1', 'web-server', 'Web Server'),
          createNode('db-1', 'db-server', 'Database'),
        ]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('fw_1');
        expect(result).toContain('"Firewall"');
        expect(result).toContain('web_1');
        expect(result).toContain('"Web Server"');
        expect(result).toContain('db_1');
        expect(result).toContain('"Database"');
      });

      it('should include security nodes', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall'),
          createNode('waf-1', 'waf', 'WAF'),
          createNode('ids-1', 'ids-ips', 'IDS/IPS'),
        ]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('fw_1');
        expect(result).toContain('waf_1');
        expect(result).toContain('ids_1');
        expect(result).toContain('$tags="security"');
      });

      it('should include network nodes', () => {
        const spec = createSpec([
          createNode('lb-1', 'load-balancer', 'Load Balancer'),
          createNode('cdn-1', 'cdn', 'CDN'),
          createNode('dns-1', 'dns', 'DNS'),
        ]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('lb_1');
        expect(result).toContain('cdn_1');
        expect(result).toContain('dns_1');
        expect(result).toContain('$tags="network"');
      });

      it('should include compute nodes', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server'),
          createNode('app-1', 'app-server', 'App Server'),
          createNode('k8s-1', 'kubernetes', 'K8s Cluster'),
        ]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('web_1');
        expect(result).toContain('app_1');
        expect(result).toContain('k8s_1');
        expect(result).toContain('$tags="compute"');
      });

      it('should include storage nodes with ContainerDb shape', () => {
        const spec = createSpec([
          createNode('db-1', 'db-server', 'Database'),
          createNode('cache-1', 'cache', 'Redis'),
          createNode('s3-1', 'object-storage', 'S3'),
        ]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('ContainerDb(db_1');
        expect(result).toContain('ContainerDb(cache_1');
        expect(result).toContain('ContainerDb(s3_1');
      });
    });

    describe('Include Connections', () => {
      it('should include connections between nodes', () => {
        const spec = createSpec(
          [
            createNode('web-1', 'web-server', 'Web'),
            createNode('db-1', 'db-server', 'DB'),
          ],
          [createConnection('web-1', 'db-1', 'request', 'SQL Query')]
        );
        const result = exportToPlantUML(spec);

        expect(result).toContain('Rel(web_1, db_1');
        expect(result).toContain('"SQL Query"');
      });

      it('should handle encrypted flow type', () => {
        const spec = createSpec(
          [
            createNode('client-1', 'user', 'Client'),
            createNode('web-1', 'web-server', 'Web'),
          ],
          [createConnection('client-1', 'web-1', 'encrypted', 'HTTPS')]
        );
        const result = exportToPlantUML(spec);

        expect(result).toContain('$tags="encrypted"');
      });

      it('should handle blocked flow type', () => {
        const spec = createSpec(
          [
            createNode('attacker', 'user', 'Attacker'),
            createNode('fw-1', 'firewall', 'Firewall'),
          ],
          [createConnection('attacker', 'fw-1', 'blocked', 'Blocked')]
        );
        const result = exportToPlantUML(spec);

        expect(result).toContain('$tags="blocked"');
      });

      it('should handle sync flow type with BiRel', () => {
        const spec = createSpec(
          [
            createNode('db-1', 'db-server', 'Primary DB'),
            createNode('db-2', 'db-server', 'Replica DB'),
          ],
          [createConnection('db-1', 'db-2', 'sync', 'Replication')]
        );
        const result = exportToPlantUML(spec);

        expect(result).toContain('BiRel(db_1, db_2');
      });

      it('should handle connections without labels', () => {
        const spec = createSpec(
          [
            createNode('web-1', 'web-server', 'Web'),
            createNode('app-1', 'app-server', 'App'),
          ],
          [createConnection('web-1', 'app-1')]
        );
        const result = exportToPlantUML(spec);

        expect(result).toContain('Rel(web_1, app_1');
        expect(result).toContain('""');
      });
    });

    describe('Styles', () => {
      it('should include styles when includeStyles is true', () => {
        const spec = createSpec([]);
        const result = exportToPlantUML(spec, { includeStyles: true });

        expect(result).toContain('!define SECURITY_COLOR');
        expect(result).toContain('!define NETWORK_COLOR');
        expect(result).toContain('!define COMPUTE_COLOR');
        expect(result).toContain('!define STORAGE_COLOR');
        expect(result).toContain('!define AUTH_COLOR');
        expect(result).toContain('AddElementTag');
      });

      it('should exclude styles when includeStyles is false', () => {
        const spec = createSpec([]);
        const result = exportToPlantUML(spec, { includeStyles: false });

        expect(result).not.toContain('!define SECURITY_COLOR');
        expect(result).not.toContain('AddElementTag');
      });
    });

    describe('Zone Grouping', () => {
      it('should group nodes by zone when includeZones is true', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall', 'DMZ'),
          createNode('web-1', 'web-server', 'Web Server', 'DMZ'),
          createNode('db-1', 'db-server', 'Database', 'Internal'),
        ]);
        const result = exportToPlantUML(spec, { includeZones: true });

        expect(result).toContain('System_Boundary(DMZ, "DMZ")');
        expect(result).toContain('System_Boundary(Internal, "Internal")');
      });

      it('should place nodes without zone in Internal boundary', () => {
        const spec = createSpec([
          createNode('app-1', 'app-server', 'App Server'),
        ]);
        const result = exportToPlantUML(spec, { includeZones: true });

        expect(result).toContain('System_Boundary(internal, "Internal")');
      });

      it('should not create zone boundaries when includeZones is false', () => {
        const spec = createSpec([
          createNode('fw-1', 'firewall', 'Firewall', 'DMZ'),
        ]);
        const result = exportToPlantUML(spec, { includeZones: false });

        expect(result).not.toContain('System_Boundary(DMZ');
      });
    });

    describe('External Elements', () => {
      it('should render user as Person element', () => {
        const spec = createSpec([createNode('user-1', 'user', 'End User')]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('Person(user_1, "End User"');
      });

      it('should render internet as System_Ext element', () => {
        const spec = createSpec([createNode('internet-1', 'internet', 'Internet')]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('System_Ext(internet_1, "Internet"');
      });

      it('should place external nodes outside zone boundaries', () => {
        const spec = createSpec([
          createNode('user-1', 'user', 'User'),
          createNode('web-1', 'web-server', 'Web', 'DMZ'),
        ]);
        const result = exportToPlantUML(spec, { includeZones: true });

        // External nodes should come before zone boundaries
        const userIndex = result.indexOf('Person(user_1');
        const boundaryIndex = result.indexOf('System_Boundary');
        expect(userIndex).toBeLessThan(boundaryIndex);
      });
    });

    describe('Format Options', () => {
      describe('C4 Format', () => {
        it('should generate C4 model diagram by default', () => {
          const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
          const result = exportToPlantUML(spec, { format: 'c4' });

          expect(result).toContain('!include');
          expect(result).toContain('C4_Container.puml');
          expect(result).toContain('Container(');
        });
      });

      describe('Deployment Format', () => {
        it('should generate deployment diagram', () => {
          const spec = createSpec([
            createNode('web-1', 'web-server', 'Web Server'),
            createNode('db-1', 'db-server', 'Database'),
          ]);
          const result = exportToPlantUML(spec, { format: 'deployment' });

          expect(result).toContain('skinparam nodeBackgroundColor');
          expect(result).toContain('node "');
          expect(result).toContain('database "');
        });

        it('should use actor for user in deployment diagram', () => {
          const spec = createSpec([createNode('user-1', 'user', 'User')]);
          const result = exportToPlantUML(spec, { format: 'deployment' });

          expect(result).toContain('actor "User"');
        });

        it('should use cloud for internet in deployment diagram', () => {
          const spec = createSpec([createNode('net-1', 'internet', 'Internet')]);
          const result = exportToPlantUML(spec, { format: 'deployment' });

          expect(result).toContain('cloud "Internet"');
        });

        it('should use database shape for storage nodes', () => {
          const spec = createSpec([
            createNode('db-1', 'db-server', 'Database'),
            createNode('cache-1', 'cache', 'Cache'),
          ]);
          const result = exportToPlantUML(spec, { format: 'deployment' });

          expect(result).toContain('database "Database"');
          expect(result).toContain('database "Cache"');
        });

        it('should use correct arrows for flow types', () => {
          const spec = createSpec(
            [
              createNode('a', 'web-server', 'A'),
              createNode('b', 'app-server', 'B'),
              createNode('c', 'db-server', 'C'),
              createNode('d', 'cache', 'D'),
            ],
            [
              createConnection('a', 'b', 'request', 'Request'),
              createConnection('a', 'c', 'sync', 'Sync'),
              createConnection('a', 'd', 'blocked', 'Blocked'),
            ]
          );
          const result = exportToPlantUML(spec, { format: 'deployment' });

          expect(result).toContain('-->');
          expect(result).toContain('<-->'); // sync
          expect(result).toContain('-[#red]-x'); // blocked
        });

        it('should use encrypted arrow style', () => {
          const spec = createSpec(
            [
              createNode('a', 'web-server', 'A'),
              createNode('b', 'app-server', 'B'),
            ],
            [createConnection('a', 'b', 'encrypted', 'TLS')]
          );
          const result = exportToPlantUML(spec, { format: 'deployment' });

          expect(result).toContain('==[#green]==>');
        });
      });

      describe('Component Format', () => {
        it('should generate component diagram', () => {
          const spec = createSpec([createNode('web-1', 'web-server', 'Web Server')]);
          const result = exportToPlantUML(spec, { format: 'component' });

          expect(result).toContain('skinparam componentStyle rectangle');
          expect(result).toContain('skinparam linetype ortho');
          expect(result).toContain('[Web Server]');
        });

        it('should use actor for user in component diagram', () => {
          const spec = createSpec([createNode('user-1', 'user', 'User')]);
          const result = exportToPlantUML(spec, { format: 'component' });

          expect(result).toContain('actor "User"');
        });

        it('should use cloud for internet in component diagram', () => {
          const spec = createSpec([createNode('net-1', 'internet', 'Internet')]);
          const result = exportToPlantUML(spec, { format: 'component' });

          expect(result).toContain('cloud "Internet"');
        });

        it('should use database for storage nodes', () => {
          const spec = createSpec([
            createNode('db-1', 'db-server', 'DB'),
            createNode('cache-1', 'cache', 'Cache'),
            createNode('storage-1', 'storage', 'Storage'),
          ]);
          const result = exportToPlantUML(spec, { format: 'component' });

          expect(result).toContain('database "DB"');
          expect(result).toContain('database "Cache"');
          expect(result).toContain('database "Storage"');
        });

        it('should include simple arrows for connections', () => {
          const spec = createSpec(
            [
              createNode('a', 'web-server', 'A'),
              createNode('b', 'app-server', 'B'),
            ],
            [createConnection('a', 'b', 'request', 'HTTP')]
          );
          const result = exportToPlantUML(spec, { format: 'component' });

          expect(result).toContain('a --> b : HTTP');
        });
      });
    });

    describe('ID Sanitization', () => {
      it('should sanitize IDs for PlantUML compatibility', () => {
        const spec = createSpec([createNode('my-node-1', 'web-server', 'Node')]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('my_node_1');
        expect(result).not.toContain('my-node-1');
      });

      it('should handle special characters in IDs', () => {
        const spec = createSpec([createNode('node@special#chars!', 'web-server', 'Node')]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('node_special_chars_');
      });
    });

    describe('Node Description', () => {
      it('should include description in C4 elements', () => {
        const spec = createSpec([
          createNode('web-1', 'web-server', 'Web Server', undefined, 'Handles HTTP requests'),
        ]);
        const result = exportToPlantUML(spec, { format: 'c4' });

        expect(result).toContain('Handles HTTP requests');
      });

      it('should use default description when not provided', () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web Server')]);
        const result = exportToPlantUML(spec, { format: 'c4' });

        expect(result).toContain('web-server component');
      });
    });

    describe('Empty Spec Handling', () => {
      it('should handle empty nodes array', () => {
        const spec = createSpec([]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('@startuml');
        expect(result).toContain('@enduml');
        expect(result).toContain('title');
      });

      it('should handle empty connections array', () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')], []);
        const result = exportToPlantUML(spec);

        expect(result).not.toContain('Rel(');
      });
    });

    describe('Cloud Resources', () => {
      it('should render cloud resources as System_Boundary', () => {
        const spec = createSpec([
          createNode('vpc-1', 'aws-vpc', 'AWS VPC'),
          createNode('vnet-1', 'azure-vnet', 'Azure VNet'),
          createNode('gcp-1', 'gcp-network', 'GCP Network'),
        ]);
        const result = exportToPlantUML(spec, { format: 'c4' });

        expect(result).toContain('System_Boundary(vpc_1');
        expect(result).toContain('System_Boundary(vnet_1');
        expect(result).toContain('System_Boundary(gcp_1');
      });
    });

    describe('Options Defaults', () => {
      it('should use default format of c4', () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web')]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('Container(');
        expect(result).toContain('C4_Container.puml');
      });

      it('should default includeStyles to true', () => {
        const spec = createSpec([]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('!define SECURITY_COLOR');
      });

      it('should default includeZones to true', () => {
        const spec = createSpec([createNode('web-1', 'web-server', 'Web', 'DMZ')]);
        const result = exportToPlantUML(spec);

        expect(result).toContain('System_Boundary(DMZ');
      });
    });
  });
});
