/**
 * Confluent -- Full Product Catalog
 *
 * Hierarchical product tree covering Confluent Cloud, Confluent Platform,
 * Data Streaming, and Stream Sharing categories.
 *
 * Data sourced from https://www.confluent.io/product/ and Confluent documentation
 * Last crawled: 2026-02-23
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Confluent Product Catalog
// ---------------------------------------------------------------------------

export const confluentCatalog: VendorCatalog = {
  vendorId: 'confluent',
  vendorName: 'Confluent',
  vendorNameKo: '컨플루언트',
  headquarters: 'Mountain View, CA, USA',
  website: 'https://www.confluent.io',
  productPageUrl: 'https://www.confluent.io/product/',
  depthStructure: ['category', 'product-line', 'edition'],
  depthStructureKo: ['카테고리', '제품 라인', '에디션'],
  lastCrawled: '2026-02-23',
  crawlSource: 'https://docs.confluent.io',
  stats: { totalProducts: 29, maxDepth: 2, categoriesCount: 4 },
  products: [
    // =====================================================================
    // 1. Confluent Cloud
    // =====================================================================
    {
      nodeId: 'confluent-cloud',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Confluent Cloud',
      nameKo: 'Confluent 클라우드',
      description:
        'Fully managed, cloud-native data streaming platform offering managed Kafka clusters, stream processing with Apache Flink, and 200+ pre-built connectors across AWS, Azure, and GCP',
      descriptionKo:
        'AWS, Azure, GCP에서 관리형 Kafka 클러스터, Apache Flink 기반 스트림 처리, 200개 이상의 사전 구축된 커넥터를 제공하는 완전 관리형 클라우드 네이티브 데이터 스트리밍 플랫폼',
      sourceUrl: 'https://www.confluent.io/confluent-cloud/',
      infraNodeTypes: ['kafka'],
      children: [
        // -- Cloud Clusters --
        {
          nodeId: 'confluent-cloud-clusters',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Cloud Clusters',
          nameKo: '클라우드 클러스터',
          description:
            'Managed Apache Kafka clusters with multiple tiers for development through mission-critical production workloads',
          descriptionKo:
            '개발부터 미션 크리티컬 프로덕션 워크로드까지 다양한 티어를 갖춘 관리형 Apache Kafka 클러스터',
          sourceUrl: 'https://docs.confluent.io/cloud/current/clusters/cluster-types.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Event Streaming Backbone / Message Broker',
          architectureRoleKo: '이벤트 스트리밍 백본 / 메시지 브로커',
          recommendedFor: [
            'Cloud-native event-driven microservices architecture',
            'Real-time data pipeline ingestion and distribution',
            'Multi-cloud and hybrid data streaming infrastructure',
            'Event sourcing and CQRS pattern implementations',
            'High-throughput log aggregation and analytics pipelines',
          ],
          recommendedForKo: [
            '클라우드 네이티브 이벤트 기반 마이크로서비스 아키텍처',
            '실시간 데이터 파이프라인 수집 및 배포',
            '멀티클라우드 및 하이브리드 데이터 스트리밍 인프라',
            '이벤트 소싱 및 CQRS 패턴 구현',
            '고처리량 로그 집계 및 분석 파이프라인',
          ],
          supportedProtocols: [
            'Kafka Protocol', 'REST Proxy', 'Schema Registry API',
            'Connect REST API', 'ksqlDB REST API', 'SASL/PLAIN',
            'SASL/SCRAM', 'mTLS', 'OAuth 2.0',
          ],
          haFeatures: [
            'Multi-AZ replication',
            'Rack awareness',
            'ISR (In-Sync Replicas)',
            'Cluster Linking for cross-region replication',
            'Geo-replication across clouds',
            'Infinite storage (tiered)',
          ],
          securityCapabilities: [
            'TLS 1.2/1.3 encryption in transit',
            'Encryption at rest (AES-256)',
            'RBAC with predefined roles',
            'Kafka ACLs',
            'OAuth/OIDC authentication',
            'mTLS client authentication',
            'Audit logging',
            'Private networking (PrivateLink, VPC Peering, Transit Gateway)',
            'Self-managed encryption keys (BYOK)',
          ],
          children: [
            {
              nodeId: 'confluent-cloud-basic',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Basic Cluster',
              nameKo: 'Basic 클러스터',
              description:
                'Entry-level managed Kafka cluster for development, testing, and experimentation with essential Kafka functionality',
              descriptionKo:
                '필수 Kafka 기능을 갖춘 개발, 테스트, 실험용 엔트리 레벨 관리형 Kafka 클러스터',
              sourceUrl: 'https://docs.confluent.io/cloud/current/clusters/cluster-types.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Development / Test Event Broker',
              architectureRoleKo: '개발 / 테스트 이벤트 브로커',
              recommendedFor: [
                'Development and testing environments',
                'Proof-of-concept Kafka deployments',
                'Small-scale event streaming experimentation',
              ],
              recommendedForKo: [
                '개발 및 테스트 환경',
                '개념 증명(PoC) Kafka 배포',
                '소규모 이벤트 스트리밍 실험',
              ],
              specs: {
                'Availability Zone': 'Single-AZ',
                'SLA': '99.5% uptime',
                'Throughput': '250 MBps ingress + egress',
                'RBAC': 'Not supported',
                'Private Networking': 'Not supported',
                'Audit Logs': 'Not supported',
                'Flink Support': 'Not supported',
                'ksqlDB Support': 'Not supported',
                'Scaling Model': 'Elastic',
                'Encryption': 'TLS in transit, AES-256 at rest',
              },
              children: [],
            },
            {
              nodeId: 'confluent-cloud-standard',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Standard Cluster',
              nameKo: 'Standard 클러스터',
              description:
                'Production-ready managed Kafka cluster with RBAC, private networking, audit logs, and comprehensive security features',
              descriptionKo:
                'RBAC, 프라이빗 네트워킹, 감사 로그, 종합적인 보안 기능을 갖춘 프로덕션 레디 관리형 Kafka 클러스터',
              sourceUrl: 'https://docs.confluent.io/cloud/current/clusters/cluster-types.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Production Event Streaming Backbone',
              architectureRoleKo: '프로덕션 이벤트 스트리밍 백본',
              recommendedFor: [
                'Production event-driven microservices',
                'Multi-tenant Kafka workloads with RBAC isolation',
                'Compliance-driven deployments requiring audit logs',
                'Hybrid cloud architectures with private networking',
              ],
              recommendedForKo: [
                '프로덕션 이벤트 기반 마이크로서비스',
                'RBAC 격리를 사용한 멀티테넌트 Kafka 워크로드',
                '감사 로그가 필요한 컴플라이언스 기반 배포',
                '프라이빗 네트워킹을 사용한 하이브리드 클라우드 아키텍처',
              ],
              specs: {
                'Availability Zone': 'Multi-AZ',
                'SLA': '99.9% (standard), 99.99% (2+ eCKU)',
                'Throughput': '250 MBps ingress + egress (elastic)',
                'RBAC': 'Supported',
                'Private Networking': 'PrivateLink, VPC Peering, Transit Gateway',
                'Audit Logs': 'Supported',
                'Flink Support': 'Supported',
                'ksqlDB Support': 'Supported',
                'Custom Connectors': 'Supported',
                'Scaling Model': 'Elastic (eCKU-based)',
                'OAuth/mTLS': 'Supported',
                'Self-Managed Encryption Keys': 'Supported',
              },
              children: [],
            },
            {
              nodeId: 'confluent-cloud-enterprise',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Enterprise Cluster',
              nameKo: 'Enterprise 클러스터',
              description:
                'Enterprise-grade managed Kafka cluster with mandatory private networking, access transparency, and fast scaling for security-first production deployments',
              descriptionKo:
                '보안 중심 프로덕션 배포를 위한 필수 프라이빗 네트워킹, 액세스 투명성, 빠른 확장 기능을 갖춘 엔터프라이즈급 관리형 Kafka 클러스터',
              sourceUrl: 'https://docs.confluent.io/cloud/current/clusters/cluster-types.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Enterprise Secure Event Streaming Backbone',
              architectureRoleKo: '엔터프라이즈 보안 이벤트 스트리밍 백본',
              recommendedFor: [
                'Enterprise deployments requiring mandatory private networking',
                'Financial services and healthcare with strict network isolation',
                'Multi-region event streaming with Cluster Linking',
                'Regulated industries requiring access transparency',
              ],
              recommendedForKo: [
                '필수 프라이빗 네트워킹이 필요한 엔터프라이즈 배포',
                '엄격한 네트워크 격리가 필요한 금융 서비스 및 의료 분야',
                'Cluster Linking을 사용한 멀티리전 이벤트 스트리밍',
                '액세스 투명성이 필요한 규제 산업',
              ],
              specs: {
                'Availability Zone': 'Multi-AZ',
                'SLA': '99.9% (standard), 99.99% (2+ eCKU)',
                'Private Networking': 'Mandatory (PrivateLink, VPC Peering, Transit Gateway, PNI)',
                'RBAC': 'Supported',
                'Audit Logs': 'Supported',
                'Access Transparency': 'Supported',
                'Cluster Linking': 'Destination support',
                'Max eCKU (AWS PNI)': '32',
                'Max eCKU (PrivateLink)': '10',
                'Scaling Model': 'Elastic (fast up to 10 eCKU, on-demand beyond)',
                'Flink Support': 'Supported',
              },
              children: [],
            },
            {
              nodeId: 'confluent-cloud-dedicated',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Dedicated Cluster',
              nameKo: 'Dedicated 클러스터',
              description:
                'Dedicated-infrastructure managed Kafka cluster with CKU-based manual scaling, predictable performance, and 99.99% SLA for mission-critical workloads',
              descriptionKo:
                '미션 크리티컬 워크로드를 위한 CKU 기반 수동 확장, 예측 가능한 성능, 99.99% SLA를 갖춘 전용 인프라 관리형 Kafka 클러스터',
              sourceUrl: 'https://docs.confluent.io/cloud/current/clusters/cluster-types.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Mission-Critical Dedicated Event Streaming Infrastructure',
              architectureRoleKo: '미션 크리티컬 전용 이벤트 스트리밍 인프라',
              recommendedFor: [
                'Mission-critical production workloads with high traffic',
                'Workloads requiring predictable, preallocated throughput',
                'Multi-datacenter disaster recovery with bidirectional Cluster Linking',
                'Large-scale event streaming with CKU-based capacity planning',
              ],
              recommendedForKo: [
                '고트래픽 미션 크리티컬 프로덕션 워크로드',
                '예측 가능하고 사전 할당된 처리량이 필요한 워크로드',
                '양방향 Cluster Linking을 사용한 멀티 데이터센터 재해 복구',
                'CKU 기반 용량 계획을 사용한 대규모 이벤트 스트리밍',
              ],
              specs: {
                'Availability Zone': 'Single-AZ or Multi-AZ',
                'SLA': '99.95% (single-AZ), 99.99% (multi-AZ)',
                'Scaling Model': 'Manual (CKU-based provisioning)',
                'Private Networking': 'PrivateLink, VPC Peering, Transit Gateway',
                'RBAC': 'Supported',
                'Audit Logs': 'Supported',
                'Access Transparency': 'Supported',
                'Cluster Linking': 'Source and destination support',
                'Flink Support': 'Supported',
                'ksqlDB Support': 'Supported',
                'Resource Isolation': 'Dedicated infrastructure (not shared)',
              },
              children: [],
            },
          ],
        },
        // -- Stream Processing --
        {
          nodeId: 'confluent-cloud-stream-processing',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Stream Processing',
          nameKo: '스트림 처리',
          description:
            'Fully managed stream processing on Confluent Cloud with Apache Flink for complex stateful computations on event streams',
          descriptionKo:
            '이벤트 스트림에 대한 복잡한 상태 기반 연산을 위한 Apache Flink 기반 Confluent Cloud 완전 관리형 스트림 처리',
          sourceUrl: 'https://docs.confluent.io/cloud/current/flink/index.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Real-Time Stream Processing Engine',
          architectureRoleKo: '실시간 스트림 처리 엔진',
          recommendedFor: [
            'Complex event processing and pattern recognition',
            'Real-time ETL and data transformation pipelines',
            'Streaming analytics with windowed aggregations',
          ],
          recommendedForKo: [
            '복잡 이벤트 처리 및 패턴 인식',
            '실시간 ETL 및 데이터 변환 파이프라인',
            '윈도우 집계를 사용한 스트리밍 분석',
          ],
          children: [
            {
              nodeId: 'confluent-cloud-flink',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent Cloud for Apache Flink',
              nameKo: 'Apache Flink용 Confluent Cloud',
              description:
                'Fully managed Apache Flink service on Confluent Cloud for complex, stateful, low-latency streaming applications using SQL, Java, and Python APIs',
              descriptionKo:
                'SQL, Java, Python API를 사용한 복잡하고 상태 기반의 저지연 스트리밍 애플리케이션을 위한 Confluent Cloud의 완전 관리형 Apache Flink 서비스',
              sourceUrl: 'https://docs.confluent.io/cloud/current/flink/index.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Managed Stream Processing / Real-Time Analytics Engine',
              architectureRoleKo: '관리형 스트림 처리 / 실시간 분석 엔진',
              recommendedFor: [
                'Complex event processing with stateful operations',
                'Real-time streaming ETL and data enrichment',
                'Windowed aggregations and time-series analytics',
                'Pattern recognition and anomaly detection on event streams',
              ],
              recommendedForKo: [
                '상태 기반 연산을 사용한 복잡 이벤트 처리',
                '실시간 스트리밍 ETL 및 데이터 보강',
                '윈도우 집계 및 시계열 분석',
                '이벤트 스트림에서의 패턴 인식 및 이상 탐지',
              ],
              specs: {
                'Processing Model': 'Stateful stream and batch processing',
                'SQL Support': 'DDL, DML, JOINs, windowing, Top-N, deduplication',
                'API Support': 'SQL Shell, Java Table API, Python Table API, REST API',
                'Schema Formats': 'Avro, Protobuf, JSON Schema',
                'Pricing Unit': 'CFU (Confluent Flink Unit)',
                'Private Networking': 'Supported',
                'Schema Registry Integration': 'Native',
              },
              children: [],
            },
          ],
        },
        // -- Connectors --
        {
          nodeId: 'confluent-cloud-connectors',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Connectors',
          nameKo: '커넥터',
          description:
            'Fully managed and custom Kafka Connect connectors for integrating Confluent Cloud with databases, cloud services, SaaS applications, and messaging systems',
          descriptionKo:
            '데이터베이스, 클라우드 서비스, SaaS 애플리케이션, 메시징 시스템과 Confluent Cloud를 통합하는 완전 관리형 및 커스텀 Kafka Connect 커넥터',
          sourceUrl: 'https://docs.confluent.io/cloud/current/connectors/index.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Data Integration / ETL Layer',
          architectureRoleKo: '데이터 통합 / ETL 계층',
          recommendedFor: [
            'Database CDC (Change Data Capture) pipelines',
            'Cloud data warehouse ingestion from Kafka',
            'SaaS application event integration',
          ],
          recommendedForKo: [
            '데이터베이스 CDC(변경 데이터 캡처) 파이프라인',
            'Kafka에서 클라우드 데이터 웨어하우스로의 수집',
            'SaaS 애플리케이션 이벤트 통합',
          ],
          children: [
            {
              nodeId: 'confluent-cloud-connectors-managed',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent Cloud Connectors',
              nameKo: 'Confluent Cloud 커넥터',
              description:
                '200+ pre-built fully managed source and sink connectors for databases, cloud services, data warehouses, messaging systems, and SaaS applications',
              descriptionKo:
                '데이터베이스, 클라우드 서비스, 데이터 웨어하우스, 메시징 시스템, SaaS 애플리케이션을 위한 200개 이상의 사전 구축된 완전 관리형 소스 및 싱크 커넥터',
              sourceUrl: 'https://docs.confluent.io/cloud/current/connectors/index.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Managed Data Integration / Connector Hub',
              architectureRoleKo: '관리형 데이터 통합 / 커넥터 허브',
              recommendedFor: [
                'Zero-code data pipeline integration between Kafka and external systems',
                'Database CDC from PostgreSQL, MySQL, MongoDB, Oracle, SQL Server',
                'Cloud data warehouse loading to Snowflake, BigQuery, Redshift, Synapse',
                'IoT data ingestion via MQTT and messaging system bridging (RabbitMQ, IBM MQ)',
              ],
              recommendedForKo: [
                'Kafka와 외부 시스템 간 코드 없는 데이터 파이프라인 통합',
                'PostgreSQL, MySQL, MongoDB, Oracle, SQL Server에서의 데이터베이스 CDC',
                'Snowflake, BigQuery, Redshift, Synapse로의 클라우드 데이터 웨어하우스 적재',
                'MQTT를 통한 IoT 데이터 수집 및 메시징 시스템 브리징 (RabbitMQ, IBM MQ)',
              ],
              specs: {
                'Connector Count': '200+ pre-built connectors',
                'Connector Types': 'Source and Sink',
                'Deployment Model': 'Fully managed + Custom plugin support',
                'Key Sources': 'PostgreSQL, MySQL, MongoDB, Oracle, Salesforce, ServiceNow, S3, Azure Blob, GCS',
                'Key Sinks': 'Snowflake, BigQuery, Redshift, Elasticsearch, Datadog, S3, Azure Blob, GCS',
                'Data Transforms': 'Single Message Transforms (SMTs)',
                'Error Handling': 'Dead Letter Queue support',
                'Monitoring': 'Connector event logging and metrics',
                'RBAC': 'Supported',
              },
              children: [],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // 2. Confluent Platform
    // =====================================================================
    {
      nodeId: 'confluent-platform',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Confluent Platform',
      nameKo: 'Confluent 플랫폼',
      description:
        'Self-managed enterprise Kafka distribution with Schema Registry, ksqlDB, Kafka Connect, Control Center, tiered storage, and comprehensive security for on-premises and private cloud deployments',
      descriptionKo:
        'Schema Registry, ksqlDB, Kafka Connect, Control Center, 티어드 스토리지, 종합 보안 기능을 갖춘 온프레미스 및 프라이빗 클라우드 배포용 셀프 관리형 엔터프라이즈 Kafka 배포판',
      sourceUrl: 'https://www.confluent.io/product/confluent-platform/',
      infraNodeTypes: ['kafka'],
      children: [
        // -- Confluent Platform Self-Managed --
        {
          nodeId: 'confluent-platform-self-managed',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Confluent Platform Self-Managed',
          nameKo: 'Confluent 플랫폼 셀프 관리형',
          description:
            'Complete self-managed Apache Kafka distribution with enterprise features including Control Center, tiered storage, RBAC, and multi-datacenter replication',
          descriptionKo:
            'Control Center, 티어드 스토리지, RBAC, 멀티 데이터센터 복제를 포함한 엔터프라이즈 기능을 갖춘 완전 셀프 관리형 Apache Kafka 배포판',
          sourceUrl: 'https://docs.confluent.io/platform/current/platform.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'On-Premises Event Streaming Platform',
          architectureRoleKo: '온프레미스 이벤트 스트리밍 플랫폼',
          recommendedFor: [
            'On-premises event streaming requiring full infrastructure control',
            'Air-gapped and regulated environments (government, defense, finance)',
            'Hybrid cloud architectures with Cluster Linking to Confluent Cloud',
            'Large-scale data centers requiring customized Kafka deployments',
          ],
          recommendedForKo: [
            '완전한 인프라 제어가 필요한 온프레미스 이벤트 스트리밍',
            '에어갭 및 규제 환경 (정부, 국방, 금융)',
            'Confluent Cloud와의 Cluster Linking을 사용한 하이브리드 클라우드 아키텍처',
            '맞춤형 Kafka 배포가 필요한 대규모 데이터 센터',
          ],
          supportedProtocols: [
            'Kafka Protocol', 'REST Proxy', 'Schema Registry API',
            'Connect REST API', 'ksqlDB REST API', 'SASL/PLAIN',
            'SASL/SCRAM', 'SASL/GSSAPI (Kerberos)', 'mTLS',
            'OAuth 2.0', 'LDAP', 'MQTT Proxy', 'JMX',
          ],
          haFeatures: [
            'KRaft consensus (ZooKeeper-free mode)',
            'Self-Balancing Clusters for automated load distribution',
            'Cluster Linking for multi-datacenter replication',
            'Confluent Replicator for cross-cluster replication',
            'Multi-Region Cluster support',
            'Tiered Storage for infinite data retention',
          ],
          securityCapabilities: [
            'mTLS and SASL/SCRAM/GSSAPI authentication',
            'Role-Based Access Control (RBAC) with predefined roles',
            'Kafka ACLs for topic-level authorization',
            'LDAP group-based authorization',
            'TLS encryption in transit',
            'Client-Side Field Level Encryption (CSFLE)',
            'Client-Side Payload Encryption (CSPE)',
            'Audit logging with Confluent Server Authorizer',
            'Log redaction for sensitive data',
            'OAuth/OIDC integration',
          ],
          children: [
            {
              nodeId: 'confluent-platform-edition',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent Platform',
              nameKo: 'Confluent 플랫폼',
              description:
                'Self-managed enterprise Kafka distribution (v8.1.x) bundling Kafka brokers, Schema Registry, ksqlDB, Kafka Connect, REST Proxy, Control Center, and tiered storage',
              descriptionKo:
                'Kafka 브로커, Schema Registry, ksqlDB, Kafka Connect, REST Proxy, Control Center, 티어드 스토리지를 번들링한 셀프 관리형 엔터프라이즈 Kafka 배포판 (v8.1.x)',
              sourceUrl: 'https://docs.confluent.io/platform/current/platform.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'virtual',
              licensingModel: 'subscription',
              architectureRole: 'Self-Managed Enterprise Event Streaming Platform',
              architectureRoleKo: '셀프 관리형 엔터프라이즈 이벤트 스트리밍 플랫폼',
              recommendedFor: [
                'On-premises Kafka deployments with full operational control',
                'Regulated environments requiring data residency and air-gapped operations',
                'Large-scale streaming platforms with custom infrastructure requirements',
              ],
              recommendedForKo: [
                '완전한 운영 제어를 갖춘 온프레미스 Kafka 배포',
                '데이터 레지던시 및 에어갭 운영이 필요한 규제 환경',
                '맞춤형 인프라 요구사항을 가진 대규모 스트리밍 플랫폼',
              ],
              specs: {
                'Included Components': 'Kafka Brokers, Schema Registry, ksqlDB, Kafka Connect, REST Proxy, Control Center',
                'Consensus Mode': 'KRaft (ZooKeeper-free) or ZooKeeper',
                'Tiered Storage': 'Supported (S3, GCS, Azure Blob)',
                'Client Libraries': 'Java, Python, Go, C/C++ (librdkafka), .NET, JavaScript',
                'Deployment Options': 'Bare metal, VM, Docker, Ansible Playbooks, Kubernetes (CFK)',
                'Supported OS': 'Ubuntu, Debian, RHEL, CentOS, Rocky Linux, Amazon Linux',
                'Monitoring': 'JMX metrics, Control Center UI, Health+ alerts, Prometheus export',
                'Version': '8.1.x',
                'Self-Balancing Clusters': 'Supported',
                'MQTT Proxy': 'Supported (IoT use cases)',
              },
              children: [],
            },
          ],
        },
        // -- Confluent for Kubernetes --
        {
          nodeId: 'confluent-platform-kubernetes',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Confluent Platform for Kubernetes',
          nameKo: 'Kubernetes용 Confluent 플랫폼',
          description:
            'Kubernetes-native operator (CFK) for declarative deployment and lifecycle management of Confluent Platform on any Kubernetes distribution',
          descriptionKo:
            '모든 Kubernetes 배포판에서 Confluent Platform의 선언적 배포 및 라이프사이클 관리를 위한 Kubernetes 네이티브 오퍼레이터 (CFK)',
          sourceUrl: 'https://docs.confluent.io/operator/current/overview.html',
          infraNodeTypes: ['kafka', 'kubernetes'],
          architectureRole: 'Cloud-Native Kafka Orchestration on Kubernetes',
          architectureRoleKo: 'Kubernetes 기반 클라우드 네이티브 Kafka 오케스트레이션',
          recommendedFor: [
            'Kubernetes-native Kafka deployments with GitOps workflows',
            'Container-orchestrated event streaming infrastructure',
            'Automated Kafka cluster lifecycle management in private clouds',
          ],
          recommendedForKo: [
            'GitOps 워크플로를 사용한 Kubernetes 네이티브 Kafka 배포',
            '컨테이너 오케스트레이션 이벤트 스트리밍 인프라',
            '프라이빗 클라우드에서 자동화된 Kafka 클러스터 라이프사이클 관리',
          ],
          children: [
            {
              nodeId: 'confluent-for-kubernetes',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent for Kubernetes (CFK)',
              nameKo: 'Confluent for Kubernetes (CFK)',
              description:
                'Kubernetes operator using CRDs for declarative deployment of Kafka, Connect, ksqlDB, Schema Registry, Control Center, and REST Proxy with automated rolling upgrades and rack awareness',
              descriptionKo:
                'CRD를 사용하여 Kafka, Connect, ksqlDB, Schema Registry, Control Center, REST Proxy를 선언적으로 배포하고 자동 롤링 업그레이드 및 랙 인식을 지원하는 Kubernetes 오퍼레이터',
              sourceUrl: 'https://docs.confluent.io/operator/current/overview.html',
              infraNodeTypes: ['kafka', 'kubernetes'],
              lifecycle: 'active',
              formFactor: 'container',
              licensingModel: 'subscription',
              architectureRole: 'Kubernetes Operator for Confluent Platform Lifecycle Management',
              architectureRoleKo: 'Confluent Platform 라이프사이클 관리를 위한 Kubernetes 오퍼레이터',
              recommendedFor: [
                'Declarative Infrastructure-as-Code Kafka deployments on Kubernetes',
                'Zero-downtime rolling upgrades and automated scaling',
                'Multi-zone Kubernetes clusters with automated rack awareness',
              ],
              recommendedForKo: [
                'Kubernetes에서의 선언적 Infrastructure-as-Code Kafka 배포',
                '제로 다운타임 롤링 업그레이드 및 자동 확장',
                '자동 랙 인식을 갖춘 멀티존 Kubernetes 클러스터',
              ],
              specs: {
                'Managed Components': 'Kafka, Connect, ksqlDB, Schema Registry, Control Center, REST Proxy',
                'Deployment Model': 'Helm chart + CRDs (Custom Resource Definitions)',
                'Rolling Upgrades': 'Zero Kafka downtime',
                'Scaling': 'Single-command with reliability checks',
                'Rack Awareness': 'Automated partition distribution across zones',
                'Pod Restoration': 'Maintains broker ID, config, and persistent storage',
                'Security': 'Auto-generated certificates, HashiCorp Vault integration, RBAC, TLS',
                'Monitoring': 'JMX/Jolokia metrics, Prometheus export',
                'Scheduling': 'K8s tolerations, pod/node affinity, labels, annotations',
              },
              children: [],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // 3. Data Streaming
    // =====================================================================
    {
      nodeId: 'confluent-data-streaming',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Data Streaming',
      nameKo: '데이터 스트리밍',
      description:
        'Core data streaming services including Schema Registry, ksqlDB, Cluster Linking, and Stream Governance for building governed, connected event streaming architectures',
      descriptionKo:
        '거버넌스가 적용된 연결 이벤트 스트리밍 아키텍처 구축을 위한 Schema Registry, ksqlDB, Cluster Linking, Stream Governance 핵심 데이터 스트리밍 서비스',
      sourceUrl: 'https://www.confluent.io/product/',
      infraNodeTypes: ['kafka'],
      children: [
        // -- Schema Registry --
        {
          nodeId: 'confluent-schema-registry',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Schema Registry',
          nameKo: 'Schema Registry',
          description:
            'Centralized schema management service for Avro, Protobuf, and JSON Schema with versioning, compatibility enforcement, and payload optimization',
          descriptionKo:
            '버전 관리, 호환성 적용, 페이로드 최적화를 지원하는 Avro, Protobuf, JSON Schema용 중앙 집중식 스키마 관리 서비스',
          sourceUrl: 'https://docs.confluent.io/cloud/current/sr/index.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Schema Governance / Data Contract Layer',
          architectureRoleKo: '스키마 거버넌스 / 데이터 계약 계층',
          recommendedFor: [
            'Schema evolution management across producer/consumer teams',
            'Data contract enforcement between microservices',
            'Payload size optimization by transmitting schema IDs',
          ],
          recommendedForKo: [
            '프로듀서/컨슈머 팀 간 스키마 진화 관리',
            '마이크로서비스 간 데이터 계약 적용',
            '스키마 ID 전송을 통한 페이로드 크기 최적화',
          ],
          children: [
            {
              nodeId: 'confluent-schema-registry-service',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent Schema Registry',
              nameKo: 'Confluent Schema Registry',
              description:
                'REST-based centralized schema repository supporting Avro, Protobuf, and JSON Schema with versioning, compatibility modes, and integration with Kafka, Connect, ksqlDB, and Flink',
              descriptionKo:
                '버전 관리, 호환성 모드, Kafka/Connect/ksqlDB/Flink 통합을 지원하는 Avro, Protobuf, JSON Schema용 REST 기반 중앙 집중식 스키마 저장소',
              sourceUrl: 'https://docs.confluent.io/cloud/current/sr/index.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Centralized Schema Governance Service',
              architectureRoleKo: '중앙 집중식 스키마 거버넌스 서비스',
              recommendedFor: [
                'Kafka ecosystem schema management and evolution tracking',
                'Data contract enforcement for event-driven microservices',
                'Cross-team data quality assurance with compatibility checks',
              ],
              recommendedForKo: [
                'Kafka 생태계 스키마 관리 및 진화 추적',
                '이벤트 기반 마이크로서비스용 데이터 계약 적용',
                '호환성 검사를 통한 팀 간 데이터 품질 보증',
              ],
              specs: {
                'Supported Formats': 'Avro, Protobuf, JSON Schema',
                'API Type': 'REST API',
                'Schema Versioning': 'Full version history with compatibility checks',
                'Compatibility Modes': 'BACKWARD, FORWARD, FULL, NONE, and transitive variants',
                'Integration Points': 'Kafka, Kafka Connect, ksqlDB, Flink, REST Proxy',
                'Schema Linking': 'Cross-cluster schema synchronization',
                'Broker-Side Validation': 'Supported (topic-level schema enforcement)',
              },
              children: [],
            },
          ],
        },
        // -- ksqlDB --
        {
          nodeId: 'confluent-ksqldb',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'ksqlDB',
          nameKo: 'ksqlDB',
          description:
            'Streaming SQL engine for building real-time applications and data pipelines on Kafka with familiar SQL syntax',
          descriptionKo:
            '익숙한 SQL 구문으로 Kafka에서 실시간 애플리케이션과 데이터 파이프라인을 구축하는 스트리밍 SQL 엔진',
          sourceUrl: 'https://docs.confluent.io/cloud/current/ksqldb/index.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Streaming SQL Processing Engine',
          architectureRoleKo: '스트리밍 SQL 처리 엔진',
          recommendedFor: [
            'SQL-based stream processing for developers without JVM expertise',
            'Real-time materialized views and pull queries',
            'Streaming ETL with embedded connector management',
          ],
          recommendedForKo: [
            'JVM 전문 지식 없는 개발자를 위한 SQL 기반 스트림 처리',
            '실시간 구체화된 뷰 및 풀 쿼리',
            '내장 커넥터 관리를 사용한 스트리밍 ETL',
          ],
          children: [
            {
              nodeId: 'confluent-ksqldb-service',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent ksqlDB',
              nameKo: 'Confluent ksqlDB',
              description:
                'Managed streaming SQL engine for building real-time applications on Kafka with streams, tables, JOINs, windowed aggregations, pull queries, and embedded connector management',
              descriptionKo:
                '스트림, 테이블, JOIN, 윈도우 집계, 풀 쿼리, 내장 커넥터 관리를 지원하는 Kafka 기반 실시간 애플리케이션 구축용 관리형 스트리밍 SQL 엔진',
              sourceUrl: 'https://docs.confluent.io/cloud/current/ksqldb/index.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Managed Streaming SQL Engine',
              architectureRoleKo: '관리형 스트리밍 SQL 엔진',
              recommendedFor: [
                'SQL-first real-time stream processing on Kafka topics',
                'Materialized views for event-driven microservices state queries',
                'Lightweight streaming ETL without JVM application development',
              ],
              recommendedForKo: [
                'Kafka 토픽에 대한 SQL 중심 실시간 스트림 처리',
                '이벤트 기반 마이크로서비스 상태 쿼리를 위한 구체화된 뷰',
                'JVM 애플리케이션 개발 없는 경량 스트리밍 ETL',
              ],
              specs: {
                'Query Types': 'Persistent queries, Push queries, Pull queries',
                'Data Abstractions': 'Streams (append-only) and Tables (changelog)',
                'JOIN Support': 'Stream-Stream, Stream-Table, Table-Table',
                'Windowing': 'Tumbling, Hopping, Session windows',
                'Connector Management': 'Embedded CREATE CONNECTOR statements',
                'Schema Registry': 'Native integration for Avro, Protobuf, JSON Schema',
                'RBAC': 'Supported',
                'Monitoring': 'Cloud Console and API-based metrics',
              },
              children: [],
            },
          ],
        },
        // -- Cluster Linking --
        {
          nodeId: 'confluent-cluster-linking',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Cluster Linking',
          nameKo: 'Cluster Linking',
          description:
            'Fully managed service for real-time topic replication across Kafka clusters, regions, and clouds without custom MirrorMaker configurations',
          descriptionKo:
            '커스텀 MirrorMaker 구성 없이 Kafka 클러스터, 리전, 클라우드 간 실시간 토픽 복제를 위한 완전 관리형 서비스',
          sourceUrl: 'https://docs.confluent.io/cloud/current/multi-cloud/cluster-linking/index.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Cross-Cluster / Cross-Region Replication Service',
          architectureRoleKo: '크로스 클러스터 / 크로스 리전 복제 서비스',
          recommendedFor: [
            'Multi-region disaster recovery and failover for Kafka clusters',
            'Hybrid cloud migration from on-premises Kafka to Confluent Cloud',
            'Read-replica clusters for workload isolation',
          ],
          recommendedForKo: [
            'Kafka 클러스터를 위한 멀티리전 재해 복구 및 페일오버',
            '온프레미스 Kafka에서 Confluent Cloud로의 하이브리드 클라우드 마이그레이션',
            '워크로드 격리를 위한 읽기 전용 레플리카 클러스터',
          ],
          children: [
            {
              nodeId: 'confluent-cluster-linking-service',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent Cluster Linking',
              nameKo: 'Confluent Cluster Linking',
              description:
                'Managed real-time topic mirroring service that creates perfect copies of topics across clusters with consumer offset and ACL synchronization for disaster recovery, migration, and workload isolation',
              descriptionKo:
                '재해 복구, 마이그레이션, 워크로드 격리를 위해 클러스터 간 토픽의 완전한 복사본을 생성하고 컨슈머 오프셋 및 ACL 동기화를 지원하는 관리형 실시간 토픽 미러링 서비스',
              sourceUrl: 'https://docs.confluent.io/cloud/current/multi-cloud/cluster-linking/index.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Managed Cross-Cluster Replication / DR Service',
              architectureRoleKo: '관리형 크로스 클러스터 복제 / DR 서비스',
              recommendedFor: [
                'Geo-replication for multi-region high availability',
                'Kafka cluster migration to Confluent Cloud with zero data loss',
                'Workload isolation with read-replica clusters for analytics',
              ],
              recommendedForKo: [
                '멀티리전 고가용성을 위한 지역 간 복제',
                '데이터 손실 없는 Confluent Cloud로의 Kafka 클러스터 마이그레이션',
                '분석용 읽기 전용 레플리카 클러스터를 사용한 워크로드 격리',
              ],
              specs: {
                'Replication Type': 'Real-time topic mirroring (byte-for-byte copy)',
                'Consumer Offset Sync': 'Supported',
                'ACL Sync': 'Supported',
                'Pricing Model': 'Usage-based',
                'Supported Clusters': 'Dedicated (source+dest), Enterprise (dest only)',
                'Configuration': 'Single CLI command per link',
                'Hybrid Support': 'On-premises to Confluent Cloud',
              },
              children: [],
            },
          ],
        },
        // -- Stream Governance --
        {
          nodeId: 'confluent-stream-governance',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Stream Governance',
          nameKo: 'Stream Governance',
          description:
            'Comprehensive data governance suite for event streams including data lineage visualization, stream catalog, data quality rules, and data contracts',
          descriptionKo:
            '데이터 리니지 시각화, 스트림 카탈로그, 데이터 품질 규칙, 데이터 계약을 포함한 이벤트 스트림용 종합 데이터 거버넌스 제품군',
          sourceUrl: 'https://docs.confluent.io/cloud/current/stream-governance/index.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Data Governance / Lineage / Quality Layer',
          architectureRoleKo: '데이터 거버넌스 / 리니지 / 품질 계층',
          recommendedFor: [
            'Enterprise event stream governance and compliance',
            'Data lineage tracking for regulated industries',
            'Self-service data discovery across streaming architectures',
          ],
          recommendedForKo: [
            '엔터프라이즈 이벤트 스트림 거버넌스 및 컴플라이언스',
            '규제 산업을 위한 데이터 리니지 추적',
            '스트리밍 아키텍처 전반의 셀프 서비스 데이터 디스커버리',
          ],
          children: [
            {
              nodeId: 'confluent-stream-governance-service',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent Stream Governance',
              nameKo: 'Confluent Stream Governance',
              description:
                'Governance suite with three pillars: Stream Lineage for end-to-end data flow visualization, Stream Catalog for self-service data discovery, and Stream Quality for data contract enforcement and quality rules',
              descriptionKo:
                '세 가지 축으로 구성된 거버넌스 제품군: 엔드투엔드 데이터 흐름 시각화를 위한 Stream Lineage, 셀프 서비스 데이터 디스커버리를 위한 Stream Catalog, 데이터 계약 적용 및 품질 규칙을 위한 Stream Quality',
              sourceUrl: 'https://docs.confluent.io/cloud/current/stream-governance/index.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Streaming Data Governance Platform',
              architectureRoleKo: '스트리밍 데이터 거버넌스 플랫폼',
              recommendedFor: [
                'Enterprise data governance for real-time event streams',
                'Regulatory compliance with data lineage auditing (SOX, GDPR)',
                'Cross-team data discovery and self-service access to streaming data',
              ],
              recommendedForKo: [
                '실시간 이벤트 스트림에 대한 엔터프라이즈 데이터 거버넌스',
                '데이터 리니지 감사를 통한 규제 컴플라이언스 (SOX, GDPR)',
                '팀 간 데이터 디스커버리 및 스트리밍 데이터에 대한 셀프 서비스 접근',
              ],
              specs: {
                'Stream Lineage': 'Interactive end-to-end event stream maps',
                'Stream Catalog': 'Self-service data discovery and classification',
                'Stream Quality': 'Data contracts and quality rules enforcement',
                'Schema Registry Integration': 'Built-in (Avro, Protobuf, JSON Schema)',
                'Broker-Side Validation': 'Supported (topic-level schema enforcement)',
                'Schema Linking': 'Cross-cluster schema synchronization',
                'Data Contracts': 'Producer/consumer agreement enforcement',
              },
              children: [],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // 4. Stream Sharing
    // =====================================================================
    {
      nodeId: 'confluent-stream-sharing-category',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Stream Sharing',
      nameKo: '스트림 공유',
      description:
        'Cross-organizational data sharing and data lakehouse integration capabilities for extending event streams beyond organizational boundaries',
      descriptionKo:
        '이벤트 스트림을 조직 경계를 넘어 확장하는 크로스 조직 데이터 공유 및 데이터 레이크하우스 통합 기능',
      sourceUrl: 'https://www.confluent.io/product/',
      infraNodeTypes: ['kafka'],
      children: [
        // -- Stream Sharing --
        {
          nodeId: 'confluent-stream-sharing-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Stream Sharing',
          nameKo: 'Stream Sharing',
          description:
            'Cross-organizational real-time topic sharing enabling secure data exchange between separate Confluent Cloud organizations',
          descriptionKo:
            '별도의 Confluent Cloud 조직 간 안전한 데이터 교환을 가능하게 하는 크로스 조직 실시간 토픽 공유',
          sourceUrl: 'https://docs.confluent.io/cloud/current/stream-sharing/index.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Cross-Organization Data Sharing Service',
          architectureRoleKo: '크로스 조직 데이터 공유 서비스',
          recommendedFor: [
            'B2B real-time data exchange between partner organizations',
            'Multi-business-unit data sharing within enterprise groups',
            'Data marketplace and data mesh implementations',
          ],
          recommendedForKo: [
            '파트너 조직 간 B2B 실시간 데이터 교환',
            '엔터프라이즈 그룹 내 멀티 비즈니스 유닛 데이터 공유',
            '데이터 마켓플레이스 및 데이터 메시 구현',
          ],
          children: [
            {
              nodeId: 'confluent-stream-sharing-service',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent Stream Sharing',
              nameKo: 'Confluent Stream Sharing',
              description:
                'Managed cross-organization topic-level data sharing via email invitations with support for Basic, Standard, and Dedicated clusters over public and private networking',
              descriptionKo:
                '퍼블릭 및 프라이빗 네트워킹을 통해 Basic, Standard, Dedicated 클러스터를 지원하는 이메일 초대 기반 관리형 크로스 조직 토픽 레벨 데이터 공유',
              sourceUrl: 'https://docs.confluent.io/cloud/current/stream-sharing/index.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Managed Cross-Organization Event Data Sharing',
              architectureRoleKo: '관리형 크로스 조직 이벤트 데이터 공유',
              recommendedFor: [
                'Secure B2B real-time data exchange without custom integration',
                'Cross-organization event streaming for supply chain and partner ecosystems',
                'Data mesh architectures requiring cross-domain event sharing',
              ],
              recommendedForKo: [
                '커스텀 통합 없는 안전한 B2B 실시간 데이터 교환',
                '공급망 및 파트너 생태계를 위한 크로스 조직 이벤트 스트리밍',
                '크로스 도메인 이벤트 공유가 필요한 데이터 메시 아키텍처',
              ],
              specs: {
                'Sharing Method': 'Email-based invitation',
                'Throughput Limit': '10 MB/s per share',
                'Supported Clusters': 'Basic, Standard, Dedicated',
                'Networking': 'Public, AWS PrivateLink, Azure Private Link, GCP Private Service Connect',
                'Consumer Access': 'Standard Kafka clients',
                'Cross-Cloud': 'Same cloud provider required for private endpoints',
                'Cluster Linking Compatibility': 'Not compatible',
              },
              children: [],
            },
          ],
        },
        // -- Tableflow --
        {
          nodeId: 'confluent-tableflow-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Tableflow',
          nameKo: 'Tableflow',
          description:
            'Automated Kafka topic to Apache Iceberg and Delta Lake table materialization service bridging operational and analytical data estates',
          descriptionKo:
            '운영 데이터와 분석 데이터 영역을 연결하는 자동화된 Kafka 토픽에서 Apache Iceberg 및 Delta Lake 테이블 구체화 서비스',
          sourceUrl: 'https://docs.confluent.io/cloud/current/topics/tableflow/overview.html',
          infraNodeTypes: ['kafka'],
          architectureRole: 'Streaming-to-Lakehouse Bridge',
          architectureRoleKo: '스트리밍-레이크하우스 브릿지',
          recommendedFor: [
            'Bridging operational Kafka streams with analytical data lakehouses',
            'Real-time data warehouse loading without custom ETL pipelines',
            'CDC stream materialization for downstream analytics and AI workloads',
          ],
          recommendedForKo: [
            '운영 Kafka 스트림과 분석 데이터 레이크하우스 간 연결',
            '커스텀 ETL 파이프라인 없는 실시간 데이터 웨어하우스 적재',
            '다운스트림 분석 및 AI 워크로드를 위한 CDC 스트림 구체화',
          ],
          children: [
            {
              nodeId: 'confluent-tableflow-service',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Confluent Tableflow',
              nameKo: 'Confluent Tableflow',
              description:
                'Managed service that automatically transforms Kafka topics into Apache Iceberg and Delta Lake tables with CDC materialization, schema management, and integration with major data catalogs and query engines',
              descriptionKo:
                'CDC 구체화, 스키마 관리, 주요 데이터 카탈로그 및 쿼리 엔진과의 통합을 지원하며 Kafka 토픽을 Apache Iceberg 및 Delta Lake 테이블로 자동 변환하는 관리형 서비스',
              sourceUrl: 'https://docs.confluent.io/cloud/current/topics/tableflow/overview.html',
              infraNodeTypes: ['kafka'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Managed Kafka-to-Lakehouse Materialization Service',
              architectureRoleKo: '관리형 Kafka-레이크하우스 구체화 서비스',
              recommendedFor: [
                'Zero-ETL Kafka to data lakehouse integration',
                'Real-time analytics on operational event streams via Iceberg/Delta Lake',
                'CDC materialization for Snowflake, Databricks, and BigQuery consumers',
              ],
              recommendedForKo: [
                '제로 ETL Kafka에서 데이터 레이크하우스 통합',
                'Iceberg/Delta Lake를 통한 운영 이벤트 스트림의 실시간 분석',
                'Snowflake, Databricks, BigQuery 소비자를 위한 CDC 구체화',
              ],
              specs: {
                'Output Formats': 'Apache Iceberg, Delta Lake',
                'Input Schema Formats': 'Avro, Protobuf, JSON Schema',
                'CDC Materialization': 'Supported',
                'Storage Options': 'Confluent Managed Storage, Bring Your Own Storage (BYOS)',
                'Catalog Integrations': 'AWS Glue, Databricks Unity Catalog, Apache Polaris, Snowflake Open Catalog',
                'Auto Maintenance': 'File compaction and table optimization',
                'Schema Management': 'Via Confluent Cloud Schema Registry',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
