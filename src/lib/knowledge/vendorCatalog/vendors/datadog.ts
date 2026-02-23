/**
 * Datadog -- Full Product Catalog
 *
 * Hierarchical product tree covering Infrastructure Monitoring, Application
 * Performance, Log Management, Cloud Security, and Developer Experience.
 *
 * Data sourced from https://www.datadoghq.com/product/
 * Last crawled: 2026-02-22
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Datadog Product Catalog
// ---------------------------------------------------------------------------

export const datadogCatalog: VendorCatalog = {
  vendorId: 'datadog',
  vendorName: 'Datadog',
  vendorNameKo: '데이터독',
  headquarters: 'New York, NY, USA',
  website: 'https://www.datadoghq.com',
  productPageUrl: 'https://www.datadoghq.com/product/',
  depthStructure: ['category', 'product-line', 'module'],
  depthStructureKo: ['카테고리', '제품 라인', '모듈'],
  lastCrawled: '2026-02-22',
  crawlSource: 'https://www.datadoghq.com/product/',
  stats: { totalProducts: 41, maxDepth: 2, categoriesCount: 5 },
  products: [
    // =====================================================================
    // 1. Infrastructure Monitoring
    // =====================================================================
    {
      nodeId: 'datadog-infrastructure-monitoring',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Infrastructure Monitoring',
      nameKo: '인프라 모니터링',
      description:
        'Comprehensive infrastructure observability platform providing metrics, dashboards, and alerts for cloud, on-premises, and hybrid environments',
      descriptionKo:
        '클라우드, 온프레미스, 하이브리드 환경을 위한 메트릭, 대시보드, 알림을 제공하는 포괄적인 인프라 관측성 플랫폼',
      sourceUrl: 'https://www.datadoghq.com/product/',
      infraNodeTypes: ['prometheus', 'grafana'],
      children: [
        // -- Infrastructure Monitoring --
        {
          nodeId: 'datadog-infra-monitoring',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Infrastructure Monitoring',
          nameKo: '인프라 모니터링',
          description:
            'Real-time infrastructure monitoring with 900+ vendor-backed integrations, AIOps-driven alerting, and full-stack correlation across metrics, traces, and logs',
          descriptionKo:
            '900개 이상의 벤더 지원 통합, AIOps 기반 알림, 메트릭/트레이스/로그 전체 스택 상관 분석을 통한 실시간 인프라 모니터링',
          sourceUrl: 'https://www.datadoghq.com/product/infrastructure-monitoring/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Centralized Infrastructure Observability Platform',
          architectureRoleKo: '중앙 집중식 인프라 관측성 플랫폼',
          recommendedFor: [
            'Multi-cloud and hybrid infrastructure monitoring with unified dashboards',
            'AIOps-driven alert correlation and noise reduction for large-scale environments',
            'Real-time infrastructure health tracking with 900+ out-of-box integrations',
            'Compliance monitoring across 15+ frameworks (PCI DSS, SOC 2, HIPAA, GDPR, CIS)',
          ],
          recommendedForKo: [
            '통합 대시보드를 통한 멀티 클라우드 및 하이브리드 인프라 모니터링',
            '대규모 환경을 위한 AIOps 기반 알림 상관 분석 및 노이즈 감소',
            '900개 이상 기본 통합을 통한 실시간 인프라 상태 추적',
            '15개 이상 프레임워크(PCI DSS, SOC 2, HIPAA, GDPR, CIS) 컴플라이언스 모니터링',
          ],
          children: [
            {
              nodeId: 'datadog-infra-monitoring-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Infrastructure Monitoring',
              nameKo: 'Datadog 인프라 모니터링',
              description:
                'SaaS-based infrastructure monitoring with custom metrics, tag-based search, AIOps alerting, and 900+ technology integrations',
              descriptionKo:
                '커스텀 메트릭, 태그 기반 검색, AIOps 알림, 900개 이상 기술 통합을 갖춘 SaaS 기반 인프라 모니터링',
              sourceUrl: 'https://www.datadoghq.com/product/infrastructure-monitoring/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Centralized Infrastructure Observability Platform',
              architectureRoleKo: '중앙 집중식 인프라 관측성 플랫폼',
              recommendedFor: [
                'Multi-cloud and hybrid environment infrastructure monitoring',
                'AIOps-driven alert noise reduction and incident correlation',
                'Custom metric collection for business-specific infrastructure KPIs',
              ],
              recommendedForKo: [
                '멀티 클라우드 및 하이브리드 환경 인프라 모니터링',
                'AIOps 기반 알림 노이즈 감소 및 인시던트 상관 분석',
                '비즈니스별 인프라 KPI를 위한 커스텀 메트릭 수집',
              ],
              specs: {
                'Integrations': '900+ vendor-backed integrations',
                'Cloud Providers': 'AWS, Azure, Google Cloud, Oracle Cloud',
                'Metrics': 'Tens of thousands of out-of-box metrics',
                'Retention': 'Historical data for decommissioned infrastructure',
                'Compliance Frameworks': 'PCI DSS, SOC 2, HIPAA, GDPR, CIS (15+)',
                'Deployment': 'SaaS (agent-based collection)',
                'Alerting': 'AIOps-driven event correlation and anomaly detection',
              },
              children: [],
            },
          ],
        },
        // -- Container Monitoring --
        {
          nodeId: 'datadog-container-monitoring',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Container Monitoring',
          nameKo: '컨테이너 모니터링',
          description:
            'Real-time visibility into containers and Kubernetes clusters with auto-discovery, orchestrator-level metrics, and live container inspection',
          descriptionKo:
            '자동 탐지, 오케스트레이터 수준 메트릭, 실시간 컨테이너 검사를 통한 컨테이너 및 Kubernetes 클러스터 가시성',
          sourceUrl: 'https://www.datadoghq.com/product/container-monitoring/',
          infraNodeTypes: ['kubernetes', 'container', 'prometheus'],
          architectureRole: 'Container and Kubernetes Observability',
          architectureRoleKo: '컨테이너 및 Kubernetes 관측성',
          recommendedFor: [
            'Kubernetes cluster health monitoring and resource optimization',
            'Container orchestration visibility with auto-discovery',
            'Microservices architecture observability in containerized environments',
          ],
          recommendedForKo: [
            'Kubernetes 클러스터 상태 모니터링 및 리소스 최적화',
            '자동 탐지를 통한 컨테이너 오케스트레이션 가시성',
            '컨테이너 환경에서의 마이크로서비스 아키텍처 관측성',
          ],
          children: [
            {
              nodeId: 'datadog-container-monitoring-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Container Monitoring',
              nameKo: 'Datadog 컨테이너 모니터링',
              description:
                'End-to-end container and Kubernetes monitoring with live process-level visibility, orchestrator maps, and pod-level resource tracking',
              descriptionKo:
                '실시간 프로세스 수준 가시성, 오케스트레이터 맵, 파드 수준 리소스 추적을 통한 엔드 투 엔드 컨테이너 및 Kubernetes 모니터링',
              sourceUrl: 'https://www.datadoghq.com/product/container-monitoring/',
              infraNodeTypes: ['kubernetes', 'container', 'prometheus'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Container and Kubernetes Observability',
              architectureRoleKo: '컨테이너 및 Kubernetes 관측성',
              recommendedFor: [
                'Kubernetes pod and node resource monitoring and optimization',
                'Container orchestration visibility for DevOps teams',
                'Microservices dependency mapping in containerized deployments',
              ],
              recommendedForKo: [
                'Kubernetes 파드 및 노드 리소스 모니터링 및 최적화',
                'DevOps 팀을 위한 컨테이너 오케스트레이션 가시성',
                '컨테이너 배포 환경에서의 마이크로서비스 의존성 매핑',
              ],
              specs: {
                'Supported Orchestrators': 'Kubernetes, ECS, Docker Swarm, OpenShift',
                'Auto-Discovery': 'Automatic container and service detection',
                'Metrics': 'CPU, memory, network, disk per container/pod',
                'Live Containers': 'Real-time process-level container inspection',
                'Cluster Maps': 'Visual orchestrator-level topology',
                'Deployment': 'SaaS (DaemonSet agent)',
              },
              children: [],
            },
          ],
        },
        // -- Network Performance Monitoring --
        {
          nodeId: 'datadog-npm',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Network Performance Monitoring',
          nameKo: '네트워크 성능 모니터링',
          description:
            'Network traffic visibility across multi-cloud, hybrid, and on-premises environments with hop-by-hop path analysis and device monitoring',
          descriptionKo:
            '홉별 경로 분석 및 장비 모니터링을 통한 멀티 클라우드, 하이브리드, 온프레미스 네트워크 트래픽 가시성',
          sourceUrl: 'https://www.datadoghq.com/product/network-monitoring/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Network Observability and Flow Analysis',
          architectureRoleKo: '네트워크 관측성 및 플로우 분석',
          recommendedFor: [
            'Multi-cloud network traffic flow visualization and bottleneck detection',
            'Network device monitoring for routers, switches, and firewalls (Cisco, Juniper, Arista, F5)',
            'DNS traffic security monitoring and suspicious domain detection',
          ],
          recommendedForKo: [
            '멀티 클라우드 네트워크 트래픽 흐름 시각화 및 병목 탐지',
            '라우터, 스위치, 방화벽(Cisco, Juniper, Arista, F5) 네트워크 장비 모니터링',
            'DNS 트래픽 보안 모니터링 및 의심스러운 도메인 탐지',
          ],
          supportedProtocols: [
            'NetFlow v5', 'NetFlow v9', 'IPFIX', 'sFlow', 'jFlow',
            'SNMP', 'DNS', 'TCP', 'UDP',
          ],
          children: [
            {
              nodeId: 'datadog-npm-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog NPM',
              nameKo: 'Datadog NPM',
              description:
                'Network performance monitoring with hop-by-hop path analysis, NetFlow/sFlow/IPFIX collection, network device monitoring, and DNS security analysis',
              descriptionKo:
                '홉별 경로 분석, NetFlow/sFlow/IPFIX 수집, 네트워크 장비 모니터링, DNS 보안 분석을 포함한 네트워크 성능 모니터링',
              sourceUrl: 'https://www.datadoghq.com/product/network-monitoring/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Network Observability and Flow Analysis',
              architectureRoleKo: '네트워크 관측성 및 플로우 분석',
              recommendedFor: [
                'Service-to-service network latency and packet loss tracking',
                'Network device monitoring via SNMP, NetFlow, and syslog',
                'Cloud network traffic analysis across AWS, Azure, and GCP',
              ],
              recommendedForKo: [
                '서비스 간 네트워크 지연 및 패킷 손실 추적',
                'SNMP, NetFlow, syslog를 통한 네트워크 장비 모니터링',
                'AWS, Azure, GCP 전반의 클라우드 네트워크 트래픽 분석',
              ],
              supportedProtocols: [
                'NetFlow v5', 'NetFlow v9', 'IPFIX', 'sFlow', 'jFlow',
                'SNMP', 'DNS', 'TCP', 'UDP',
              ],
              specs: {
                'Flow Protocols': 'NetFlow v5/v9, IPFIX, sFlow, jFlow',
                'Device Vendors': 'Cisco, Juniper, Meraki, F5, Arista, Aruba',
                'Data Collection': 'SNMP metrics, traps, APIs, NetFlow, syslogs',
                'Cloud Networks': 'AWS VPC Flow Logs, Azure NSG, GCP VPC Flow',
                'DNS Monitoring': 'Suspicious domain detection and traffic analysis',
                'Topology': 'Automatic device discovery and topology mapping',
              },
              children: [],
            },
          ],
        },
        // -- Database Monitoring --
        {
          nodeId: 'datadog-database-monitoring',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Database Monitoring',
          nameKo: '데이터베이스 모니터링',
          description:
            'Database performance monitoring with query-level visibility, execution plan analysis, and host-level resource correlation',
          descriptionKo:
            '쿼리 수준 가시성, 실행 계획 분석, 호스트 수준 리소스 상관 분석을 포함한 데이터베이스 성능 모니터링',
          sourceUrl: 'https://www.datadoghq.com/product/database-monitoring/',
          infraNodeTypes: ['db-server'],
          architectureRole: 'Database Performance Observability',
          architectureRoleKo: '데이터베이스 성능 관측성',
          recommendedFor: [
            'Query performance optimization and slow query detection',
            'Database host resource monitoring correlated with query workloads',
            'Multi-database fleet visibility across PostgreSQL, MySQL, SQL Server, and Oracle',
          ],
          recommendedForKo: [
            '쿼리 성능 최적화 및 슬로우 쿼리 탐지',
            '쿼리 워크로드와 상관 분석된 데이터베이스 호스트 리소스 모니터링',
            'PostgreSQL, MySQL, SQL Server, Oracle 전반의 멀티 데이터베이스 가시성',
          ],
          children: [
            {
              nodeId: 'datadog-database-monitoring-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Database Monitoring',
              nameKo: 'Datadog 데이터베이스 모니터링',
              description:
                'Deep database observability with normalized query metrics, execution plan tracking, wait event analysis, and APM trace correlation',
              descriptionKo:
                '정규화된 쿼리 메트릭, 실행 계획 추적, 대기 이벤트 분석, APM 트레이스 상관 분석을 포함한 심층 데이터베이스 관측성',
              sourceUrl: 'https://www.datadoghq.com/product/database-monitoring/',
              infraNodeTypes: ['db-server'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Database Performance Observability',
              architectureRoleKo: '데이터베이스 성능 관측성',
              recommendedFor: [
                'Query-level performance analysis and optimization across database fleets',
                'Execution plan tracking for identifying performance regressions',
                'Correlating database performance with application traces and infrastructure metrics',
              ],
              recommendedForKo: [
                '데이터베이스 전체에서의 쿼리 수준 성능 분석 및 최적화',
                '성능 회귀 식별을 위한 실행 계획 추적',
                '애플리케이션 트레이스 및 인프라 메트릭과 데이터베이스 성능 상관 분석',
              ],
              specs: {
                'Supported Databases': 'PostgreSQL, MySQL, SQL Server, Oracle, MongoDB',
                'Query Analysis': 'Normalized query metrics with execution plan tracking',
                'Wait Events': 'Wait event analysis for blocking and lock detection',
                'APM Correlation': 'End-to-end trace to query correlation',
                'Metrics': 'QPS, latency, rows examined, connections, buffer usage',
                'Deployment': 'SaaS (agent-based, no database code changes)',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. Application Performance
    // =====================================================================
    {
      nodeId: 'datadog-application-performance',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Application Performance',
      nameKo: '애플리케이션 성능',
      description:
        'End-to-end application performance monitoring with distributed tracing, profiling, real user monitoring, and synthetic testing',
      descriptionKo:
        '분산 트레이싱, 프로파일링, 실제 사용자 모니터링, 합성 테스트를 포함한 엔드 투 엔드 애플리케이션 성능 모니터링',
      sourceUrl: 'https://www.datadoghq.com/product/',
      infraNodeTypes: ['prometheus', 'grafana'],
      children: [
        // -- APM --
        {
          nodeId: 'datadog-apm',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'APM',
          nameKo: 'APM',
          description:
            'Cloud-scale distributed tracing and service performance monitoring with auto-instrumentation, Watchdog AI root cause analysis, and deployment tracking',
          descriptionKo:
            '자동 계측, Watchdog AI 근본 원인 분석, 배포 추적을 포함한 클라우드 규모 분산 트레이싱 및 서비스 성능 모니터링',
          sourceUrl: 'https://www.datadoghq.com/product/apm/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Application Performance Monitoring / Distributed Tracing',
          architectureRoleKo: '애플리케이션 성능 모니터링 / 분산 트레이싱',
          recommendedFor: [
            'Microservices distributed tracing and service dependency mapping',
            'Deployment-correlated performance regression detection',
            'Watchdog AI-driven anomaly detection and root cause analysis',
            'Serverless function monitoring on AWS Lambda and Azure App Service',
          ],
          recommendedForKo: [
            '마이크로서비스 분산 트레이싱 및 서비스 의존성 매핑',
            '배포 상관 성능 회귀 탐지',
            'Watchdog AI 기반 이상 탐지 및 근본 원인 분석',
            'AWS Lambda, Azure App Service 서버리스 함수 모니터링',
          ],
          supportedProtocols: ['OpenTelemetry', 'HTTP/HTTPS', 'gRPC'],
          children: [
            {
              nodeId: 'datadog-apm-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog APM',
              nameKo: 'Datadog APM',
              description:
                'Distributed tracing platform with thread-level code visibility, auto-instrumentation, Watchdog AI root cause analysis, and OpenTelemetry support',
              descriptionKo:
                '스레드 수준 코드 가시성, 자동 계측, Watchdog AI 근본 원인 분석, OpenTelemetry 지원을 포함한 분산 트레이싱 플랫폼',
              sourceUrl: 'https://www.datadoghq.com/product/apm/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Application Performance Monitoring / Distributed Tracing',
              architectureRoleKo: '애플리케이션 성능 모니터링 / 분산 트레이싱',
              recommendedFor: [
                'Distributed tracing across microservices with code-level visibility',
                'Auto-instrumented APM without application code changes',
                'AI-driven root cause analysis for service performance degradation',
              ],
              recommendedForKo: [
                '코드 수준 가시성을 갖춘 마이크로서비스 분산 트레이싱',
                '애플리케이션 코드 변경 없는 자동 계측 APM',
                '서비스 성능 저하에 대한 AI 기반 근본 원인 분석',
              ],
              supportedProtocols: ['OpenTelemetry', 'HTTP/HTTPS', 'gRPC'],
              specs: {
                'Instrumentation': 'Auto-instrumentation (no code changes), OpenTelemetry native/hybrid',
                'Tracing': 'Thread-level distributed tracing with live query',
                'AI/ML': 'Watchdog automated root cause analysis and anomaly detection',
                'Serverless': 'AWS Lambda, Azure App Service support',
                'Sampling': 'Fine-grained at host, service, and endpoint levels',
                'Deployment Tracking': 'Pre/during/post-deployment performance comparison',
              },
              children: [],
            },
          ],
        },
        // -- Continuous Profiler --
        {
          nodeId: 'datadog-continuous-profiler',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Continuous Profiler',
          nameKo: '연속 프로파일러',
          description:
            'Always-on, low-overhead code profiling for CPU, memory, and I/O hotspots across all production services',
          descriptionKo:
            '모든 프로덕션 서비스에서 CPU, 메모리, I/O 핫스팟에 대한 상시 저오버헤드 코드 프로파일링',
          sourceUrl: 'https://www.datadoghq.com/product/code-profiling/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Production Code Profiling',
          architectureRoleKo: '프로덕션 코드 프로파일링',
          recommendedFor: [
            'Identifying CPU and memory hotspots in production services',
            'Correlating code-level performance with APM traces',
            'Reducing cloud compute costs by optimizing resource-heavy code paths',
          ],
          recommendedForKo: [
            '프로덕션 서비스에서 CPU 및 메모리 핫스팟 식별',
            '코드 수준 성능과 APM 트레이스 상관 분석',
            '리소스 집약적 코드 경로 최적화를 통한 클라우드 컴퓨팅 비용 절감',
          ],
          children: [
            {
              nodeId: 'datadog-continuous-profiler-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Continuous Profiler',
              nameKo: 'Datadog 연속 프로파일러',
              description:
                'Low-overhead always-on profiling for Java, Python, Go, Ruby, .NET, Node.js, and PHP with flame graph visualization and APM trace correlation',
              descriptionKo:
                'Java, Python, Go, Ruby, .NET, Node.js, PHP를 위한 저오버헤드 상시 프로파일링, 플레임 그래프 시각화 및 APM 트레이스 상관 분석',
              sourceUrl: 'https://www.datadoghq.com/product/code-profiling/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Production Code Profiling',
              architectureRoleKo: '프로덕션 코드 프로파일링',
              recommendedFor: [
                'Always-on production profiling with minimal overhead',
                'Flame graph analysis for CPU, memory, and I/O bottleneck identification',
                'Correlating code hotspots with distributed traces for end-to-end optimization',
              ],
              recommendedForKo: [
                '최소 오버헤드로 상시 프로덕션 프로파일링',
                'CPU, 메모리, I/O 병목 식별을 위한 플레임 그래프 분석',
                '엔드 투 엔드 최적화를 위한 코드 핫스팟과 분산 트레이스 상관 분석',
              ],
              specs: {
                'Languages': 'Java, Python, Go, Ruby, .NET, Node.js, PHP',
                'Profiling Types': 'CPU, wall time, memory allocation, lock contention, I/O',
                'Visualization': 'Flame graphs, comparison views, timeline',
                'Overhead': 'Low-overhead continuous collection',
                'APM Integration': 'Direct trace-to-profile correlation',
              },
              children: [],
            },
          ],
        },
        // -- RUM --
        {
          nodeId: 'datadog-rum',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'RUM',
          nameKo: 'RUM (실사용자 모니터링)',
          description:
            'Real user monitoring for browser and mobile applications with session replay, Core Web Vitals tracking, and error detection',
          descriptionKo:
            '세션 리플레이, Core Web Vitals 추적, 오류 탐지를 포함한 브라우저 및 모바일 애플리케이션 실사용자 모니터링',
          sourceUrl: 'https://www.datadoghq.com/product/real-user-monitoring/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Frontend and Mobile User Experience Monitoring',
          architectureRoleKo: '프론트엔드 및 모바일 사용자 경험 모니터링',
          recommendedFor: [
            'Core Web Vitals and frontend performance tracking for web applications',
            'Mobile application performance monitoring on iOS and Android',
            'Session replay with pixel-perfect accuracy for UX issue diagnosis',
          ],
          recommendedForKo: [
            '웹 애플리케이션의 Core Web Vitals 및 프론트엔드 성능 추적',
            'iOS 및 Android 모바일 애플리케이션 성능 모니터링',
            'UX 문제 진단을 위한 픽셀 단위 정확도의 세션 리플레이',
          ],
          children: [
            {
              nodeId: 'datadog-rum-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog RUM',
              nameKo: 'Datadog RUM',
              description:
                'Real user monitoring capturing 100% sessions with 30+ performance metrics, session replay, error tracking, and backend trace correlation',
              descriptionKo:
                '30개 이상 성능 메트릭, 세션 리플레이, 오류 추적, 백엔드 트레이스 상관 분석으로 100% 세션을 캡처하는 실사용자 모니터링',
              sourceUrl: 'https://www.datadoghq.com/product/real-user-monitoring/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Frontend and Mobile User Experience Monitoring',
              architectureRoleKo: '프론트엔드 및 모바일 사용자 경험 모니터링',
              recommendedFor: [
                'Capturing 100% user sessions with flexible retention filtering',
                'JavaScript error tracking down to the exact line of code',
                'Correlating frontend performance with backend APM traces',
              ],
              recommendedForKo: [
                '유연한 보존 필터링으로 100% 사용자 세션 캡처',
                '정확한 코드 라인까지의 JavaScript 오류 추적',
                '프론트엔드 성능과 백엔드 APM 트레이스 상관 분석',
              ],
              specs: {
                'Platforms': 'Browser (Web), iOS, Android',
                'Performance Metrics': '30+ out-of-box metrics (Core Web Vitals, load times)',
                'Session Replay': 'Pixel-perfect session reproduction with privacy controls',
                'Retention': '15 months metric retention',
                'Session Capture': '100% sessions with flexible retention filters (RUM Without Limits)',
                'Error Tracking': 'Automatic error grouping with source map support',
              },
              children: [],
            },
          ],
        },
        // -- Synthetics --
        {
          nodeId: 'datadog-synthetics',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Synthetics',
          nameKo: '합성 모니터링',
          description:
            'Proactive synthetic testing with codeless browser tests, multi-protocol API tests, and CI/CD pipeline integration',
          descriptionKo:
            '코드리스 브라우저 테스트, 멀티 프로토콜 API 테스트, CI/CD 파이프라인 통합을 포함한 사전 합성 테스트',
          sourceUrl: 'https://www.datadoghq.com/product/synthetic-monitoring/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Proactive Synthetic Testing and SLA Monitoring',
          architectureRoleKo: '사전 합성 테스트 및 SLA 모니터링',
          recommendedFor: [
            'Proactive SLA and endpoint availability monitoring from global locations',
            'Codeless browser test automation for critical user journeys',
            'Multi-protocol API testing (HTTP, gRPC, SSL, DNS, WebSocket, TCP, UDP, ICMP)',
          ],
          recommendedForKo: [
            '글로벌 위치에서 사전 SLA 및 엔드포인트 가용성 모니터링',
            '핵심 사용자 여정을 위한 코드리스 브라우저 테스트 자동화',
            '멀티 프로토콜 API 테스트(HTTP, gRPC, SSL, DNS, WebSocket, TCP, UDP, ICMP)',
          ],
          supportedProtocols: [
            'HTTP/HTTPS', 'gRPC', 'SSL/TLS', 'DNS', 'WebSocket', 'TCP', 'UDP', 'ICMP',
          ],
          children: [
            {
              nodeId: 'datadog-synthetics-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Synthetics',
              nameKo: 'Datadog 합성 모니터링',
              description:
                'Synthetic monitoring with codeless browser recorder, multi-protocol API testing, network path analysis, and CI/CD integration with automatic UI change detection',
              descriptionKo:
                '코드리스 브라우저 레코더, 멀티 프로토콜 API 테스트, 네트워크 경로 분석, 자동 UI 변경 탐지 CI/CD 통합을 포함한 합성 모니터링',
              sourceUrl: 'https://www.datadoghq.com/product/synthetic-monitoring/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Proactive Synthetic Testing and SLA Monitoring',
              architectureRoleKo: '사전 합성 테스트 및 SLA 모니터링',
              recommendedFor: [
                'Proactive API and website availability monitoring from managed/private locations',
                'CI/CD integrated synthetic testing (GitHub, GitLab, Jenkins, CircleCI)',
                'Network path testing to identify packet loss and latency across hops',
              ],
              recommendedForKo: [
                '관리형/프라이빗 위치에서 사전 API 및 웹사이트 가용성 모니터링',
                'CI/CD 통합 합성 테스트(GitHub, GitLab, Jenkins, CircleCI)',
                '홉 간 패킷 손실 및 지연 식별을 위한 네트워크 경로 테스트',
              ],
              supportedProtocols: [
                'HTTP/HTTPS', 'gRPC', 'SSL/TLS', 'DNS', 'WebSocket', 'TCP', 'UDP', 'ICMP',
              ],
              specs: {
                'Browser Tests': 'Codeless web recorder with automatic UI change detection',
                'API Protocols': 'HTTP, gRPC, SSL, DNS, WebSocket, TCP, UDP, ICMP',
                'CI/CD Integration': 'GitHub, GitLab, Jenkins, CircleCI, Azure DevOps',
                'Global Locations': 'Globally managed + private agent locations',
                'Network Path': 'Hop-by-hop packet loss and latency detection',
                'Session Replay': 'Step-by-step screenshots and replay for browser tests',
              },
              children: [],
            },
          ],
        },
        // -- Universal Service Monitoring --
        {
          nodeId: 'datadog-usm',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Universal Service Monitoring',
          nameKo: '유니버설 서비스 모니터링',
          description:
            'Zero-instrumentation service visibility using eBPF for automatic discovery and golden signal monitoring of all services',
          descriptionKo:
            '모든 서비스의 자동 검색 및 골든 시그널 모니터링을 위한 eBPF 기반 제로 계측 서비스 가시성',
          sourceUrl: 'https://www.datadoghq.com/product/universal-service-monitoring/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Zero-Instrumentation Service Observability',
          architectureRoleKo: '제로 계측 서비스 관측성',
          recommendedFor: [
            'Automatic service discovery without code instrumentation using eBPF',
            'Golden signal monitoring (request rate, errors, latency) for all services',
            'Bridging observability gaps for services not yet instrumented with APM',
          ],
          recommendedForKo: [
            'eBPF를 사용한 코드 계측 없는 자동 서비스 검색',
            '모든 서비스에 대한 골든 시그널 모니터링(요청률, 오류, 지연)',
            'APM으로 아직 계측되지 않은 서비스의 관측성 격차 해소',
          ],
          children: [
            {
              nodeId: 'datadog-usm-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog USM',
              nameKo: 'Datadog USM',
              description:
                'eBPF-based universal service monitoring providing automatic service discovery and golden signal metrics without any code changes or instrumentation libraries',
              descriptionKo:
                '코드 변경이나 계측 라이브러리 없이 자동 서비스 검색 및 골든 시그널 메트릭을 제공하는 eBPF 기반 유니버설 서비스 모니터링',
              sourceUrl: 'https://www.datadoghq.com/product/universal-service-monitoring/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Zero-Instrumentation Service Observability',
              architectureRoleKo: '제로 계측 서비스 관측성',
              recommendedFor: [
                'Instant service visibility for legacy and third-party services',
                'eBPF-powered golden signal collection without code changes',
                'Complementing APM instrumentation for full service catalog coverage',
              ],
              recommendedForKo: [
                '레거시 및 서드파티 서비스를 위한 즉각적 서비스 가시성',
                '코드 변경 없는 eBPF 기반 골든 시그널 수집',
                '전체 서비스 카탈로그 커버리지를 위한 APM 계측 보완',
              ],
              specs: {
                'Technology': 'eBPF-based kernel-level service detection',
                'Instrumentation': 'Zero code changes required',
                'Metrics': 'Request rate, error rate, latency (golden signals)',
                'Service Discovery': 'Automatic detection of all running services',
                'Compatibility': 'Linux kernel 4.14+ (eBPF support)',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Log Management
    // =====================================================================
    {
      nodeId: 'datadog-log-management',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Log Management',
      nameKo: '로그 관리',
      description:
        'Full-stack log management platform with centralized collection, real-time search, SIEM-grade security analytics, and observability pipeline data routing',
      descriptionKo:
        '중앙 집중식 수집, 실시간 검색, SIEM급 보안 분석, 관측성 파이프라인 데이터 라우팅을 포함한 풀스택 로그 관리 플랫폼',
      sourceUrl: 'https://www.datadoghq.com/product/',
      infraNodeTypes: ['elasticsearch'],
      children: [
        // -- Log Management --
        {
          nodeId: 'datadog-logs',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Log Management',
          nameKo: '로그 관리',
          description:
            'Centralized log collection and analytics at any scale with Logging without Limits, flexible retention, pattern detection, and full-stack correlation',
          descriptionKo:
            'Logging without Limits, 유연한 보존, 패턴 탐지, 풀스택 상관 분석을 포함한 모든 규모의 중앙 집중식 로그 수집 및 분석',
          sourceUrl: 'https://www.datadoghq.com/product/log-management/',
          infraNodeTypes: ['elasticsearch'],
          architectureRole: 'Centralized Log Aggregation and Analytics',
          architectureRoleKo: '중앙 집중식 로그 수집 및 분석',
          recommendedFor: [
            'Centralized log aggregation from any source at petabyte-scale',
            'Log pattern detection and automated grouping for trend analysis',
            'Flexible log retention with independent ingest and query controls',
          ],
          recommendedForKo: [
            '페타바이트 규모에서 모든 소스의 중앙 집중식 로그 수집',
            '트렌드 분석을 위한 로그 패턴 탐지 및 자동 그룹화',
            '독립적 수집 및 쿼리 제어를 통한 유연한 로그 보존',
          ],
          children: [
            {
              nodeId: 'datadog-logs-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Log Management',
              nameKo: 'Datadog 로그 관리',
              description:
                'Petabyte-scale log management with Logging without Limits, Flex Logs retention, log rehydration, pattern analysis, and no-query-language Log Explorer',
              descriptionKo:
                'Logging without Limits, Flex Logs 보존, 로그 리하이드레이션, 패턴 분석, 쿼리 언어 불필요 Log Explorer를 갖춘 페타바이트 규모 로그 관리',
              sourceUrl: 'https://www.datadoghq.com/product/log-management/',
              infraNodeTypes: ['elasticsearch'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Centralized Log Aggregation and Analytics',
              architectureRoleKo: '중앙 집중식 로그 수집 및 분석',
              recommendedFor: [
                'Petabyte-scale log ingestion with cost-optimized retention tiers',
                'Log Explorer with no complex query language required',
                'Archived log rehydration for historical investigation',
              ],
              recommendedForKo: [
                '비용 최적화된 보존 계층을 갖춘 페타바이트 규모 로그 수집',
                '복잡한 쿼리 언어 불필요 Log Explorer',
                '과거 조사를 위한 아카이브 로그 리하이드레이션',
              ],
              specs: {
                'Scale': 'Millions of logs per minute, petabytes per month',
                'Retention': 'Flex Logs with independent ingest/query/archive controls',
                'Log Explorer': 'Search, filter, visualize, export (no query language needed)',
                'Pattern Analysis': 'Automatic grouping of similar log messages',
                'Rehydration': 'Decompress archived logs for on-demand analysis',
                'Correlation': 'Unified with metrics, APM traces, and security signals',
              },
              children: [],
            },
          ],
        },
        // -- Cloud SIEM --
        {
          nodeId: 'datadog-cloud-siem',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Cloud SIEM',
          nameKo: '클라우드 SIEM',
          description:
            'AI-driven threat detection and incident response platform with 800+ detection rules, MITRE ATT&CK mapping, and SOAR workflow automation',
          descriptionKo:
            '800개 이상 탐지 규칙, MITRE ATT&CK 매핑, SOAR 워크플로우 자동화를 포함한 AI 기반 위협 탐지 및 사고 대응 플랫폼',
          sourceUrl: 'https://www.datadoghq.com/product/cloud-siem/',
          infraNodeTypes: ['siem'],
          architectureRole: 'Cloud-Native SIEM / Security Operations',
          architectureRoleKo: '클라우드 네이티브 SIEM / 보안 운영',
          recommendedFor: [
            'Cloud-native SIEM replacing legacy on-premises SIEM solutions',
            'MITRE ATT&CK coverage mapping and gap analysis for threat detection',
            'SOAR-integrated automated incident response with 1,000+ actions',
            'AI-powered security investigation with autonomous analyst capabilities',
          ],
          recommendedForKo: [
            '레거시 온프레미스 SIEM 솔루션을 대체하는 클라우드 네이티브 SIEM',
            '위협 탐지를 위한 MITRE ATT&CK 커버리지 매핑 및 격차 분석',
            '1,000개 이상 액션을 갖춘 SOAR 통합 자동 사고 대응',
            '자율 분석가 기능을 갖춘 AI 기반 보안 조사',
          ],
          securityCapabilities: [
            '800+ out-of-box detection rules (Datadog Security Research)',
            'MITRE ATT&CK framework mapping',
            '1,000+ integrations (network, identity, endpoint, SaaS)',
            'OCSF log normalization',
            'SOAR workflow automation with 1,000+ actions',
            'AI Security Analyst for autonomous investigation',
            'Graph-based investigation with 15+ months history',
            'Case Management for collaborative investigation',
          ],
          children: [
            {
              nodeId: 'datadog-cloud-siem-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Cloud SIEM',
              nameKo: 'Datadog 클라우드 SIEM',
              description:
                'AI-driven cloud SIEM with 800+ detection rules, MITRE ATT&CK mapping, graph-based investigation, SOAR automation, and Bits AI autonomous analyst',
              descriptionKo:
                '800개 이상 탐지 규칙, MITRE ATT&CK 매핑, 그래프 기반 조사, SOAR 자동화, Bits AI 자율 분석가를 포함한 AI 기반 클라우드 SIEM',
              sourceUrl: 'https://www.datadoghq.com/product/cloud-siem/',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud-Native SIEM / Security Operations',
              architectureRoleKo: '클라우드 네이티브 SIEM / 보안 운영',
              recommendedFor: [
                'Replacing legacy SIEM with cloud-scale AI-driven threat detection',
                'MITRE ATT&CK-aligned detection coverage assessment and improvement',
                'Automated incident response via SOAR workflows with 1,000+ actions',
              ],
              recommendedForKo: [
                '클라우드 규모 AI 기반 위협 탐지로 레거시 SIEM 대체',
                'MITRE ATT&CK 정렬 탐지 커버리지 평가 및 개선',
                '1,000개 이상 액션을 갖춘 SOAR 워크플로우를 통한 자동 사고 대응',
              ],
              securityCapabilities: [
                '800+ detection rules maintained by Datadog Security Research',
                'MITRE ATT&CK framework mapping with interactive coverage view',
                'Bits AI Security Analyst for autonomous threat investigation',
                'Graph-based root cause investigation with 15+ months history',
                'OCSF-based log normalization and enrichment',
              ],
              specs: {
                'Detection Rules': '800+ out-of-box (customizable)',
                'Integrations': '1,000+ (network, identity, endpoint, SaaS)',
                'MITRE ATT&CK': 'Interactive tactics/techniques coverage mapping',
                'Investigation': 'Graph-based with 15+ months historical data',
                'SOAR': 'Pre-configured workflows, 1,000+ actions',
                'AI Analyst': 'Bits AI autonomous investigation and triage',
                'Log Normalization': 'OCSF, OTEL, Splunk CIM, custom mappings',
              },
              children: [],
            },
          ],
        },
        // -- Observability Pipelines --
        {
          nodeId: 'datadog-observability-pipelines',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Observability Pipelines',
          nameKo: '관측성 파이프라인',
          description:
            'Petabyte-scale data pipeline for routing, transforming, and enriching observability data before delivery to any SIEM, data lake, or storage destination',
          descriptionKo:
            'SIEM, 데이터 레이크, 스토리지 목적지로 전달 전 관측성 데이터 라우팅, 변환, 보강을 위한 페타바이트 규모 데이터 파이프라인',
          sourceUrl: 'https://www.datadoghq.com/product/observability-pipelines/',
          infraNodeTypes: ['elasticsearch'],
          architectureRole: 'Observability Data Pipeline / Log Router',
          architectureRoleKo: '관측성 데이터 파이프라인 / 로그 라우터',
          recommendedFor: [
            'Centralizing and routing logs/metrics to multiple SIEM and storage destinations',
            'Sensitive data redaction and PII compliance before log indexing',
            'Cost optimization via log filtering, sampling, and volume reduction',
          ],
          recommendedForKo: [
            '여러 SIEM 및 스토리지 목적지로 로그/메트릭 중앙 집중화 및 라우팅',
            '로그 인덱싱 전 민감 데이터 삭제 및 PII 컴플라이언스',
            '로그 필터링, 샘플링, 볼륨 감소를 통한 비용 최적화',
          ],
          children: [
            {
              nodeId: 'datadog-observability-pipelines-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Observability Pipelines',
              nameKo: 'Datadog 관측성 파이프라인',
              description:
                'Rust-based petabyte-scale pipeline for log and metric routing with 150+ parsing rules, dual-shipping, PII detection, and multi-destination delivery',
              descriptionKo:
                '150개 이상 파싱 규칙, 이중 전송, PII 탐지, 다중 목적지 전달을 포함한 Rust 기반 페타바이트 규모 로그 및 메트릭 라우팅 파이프라인',
              sourceUrl: 'https://www.datadoghq.com/product/observability-pipelines/',
              infraNodeTypes: ['elasticsearch'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Observability Data Pipeline / Log Router',
              architectureRoleKo: '관측성 데이터 파이프라인 / 로그 라우터',
              recommendedFor: [
                'Dual-shipping logs to multiple SIEMs and data lakes simultaneously',
                'PII and regulated data detection with 150+ built-in rules (PCI, PII)',
                'Rust-based petabyte-scale pipeline for cost-effective log routing',
              ],
              recommendedForKo: [
                '여러 SIEM 및 데이터 레이크로 동시 이중 로그 전송',
                '150개 이상 내장 규칙(PCI, PII)을 통한 PII 및 규제 데이터 탐지',
                '비용 효율적 로그 라우팅을 위한 Rust 기반 페타바이트 규모 파이프라인',
              ],
              securityCapabilities: [
                '150+ built-in PII/PCI detection rules',
                'Sensitive data classification and redaction',
                'OCSF schema normalization',
              ],
              specs: {
                'Engine': 'Rust-based (petabyte-scale)',
                'Parsing Rules': '150+ built-in Grok rules, AI-assisted parsing',
                'Schema Support': 'OCSF, OTEL, Splunk CIM, custom mappings',
                'Destinations': 'SIEMs, data lakes (Snowflake, Databricks, ClickHouse)',
                'Data Governance': '150+ PII/PCI detection rules',
                'Enrichment': 'GeoIP, threat intelligence, network metadata',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Cloud Security
    // =====================================================================
    {
      nodeId: 'datadog-cloud-security',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Cloud Security',
      nameKo: '클라우드 보안',
      description:
        'Unified cloud security platform with posture management, application security, and workload protection for cloud-native environments',
      descriptionKo:
        '클라우드 네이티브 환경을 위한 포스처 관리, 애플리케이션 보안, 워크로드 보호를 포함한 통합 클라우드 보안 플랫폼',
      sourceUrl: 'https://www.datadoghq.com/product/',
      infraNodeTypes: ['siem'],
      children: [
        // -- Cloud Security Management --
        {
          nodeId: 'datadog-csm',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Cloud Security Management',
          nameKo: '클라우드 보안 관리',
          description:
            'Cloud security posture management with continuous misconfiguration detection, compliance tracking, identity risk analysis, and vulnerability prioritization',
          descriptionKo:
            '지속적 설정 오류 탐지, 컴플라이언스 추적, 아이덴티티 리스크 분석, 취약점 우선순위 지정을 포함한 클라우드 보안 포스처 관리',
          sourceUrl: 'https://www.datadoghq.com/product/cloud-security-management/',
          infraNodeTypes: ['siem'],
          architectureRole: 'Cloud Security Posture Management (CSPM)',
          architectureRoleKo: '클라우드 보안 포스처 관리 (CSPM)',
          recommendedFor: [
            'Continuous cloud misconfiguration detection across AWS, Azure, and GCP',
            'Compliance tracking for CIS, PCI DSS, SOC 2, and custom frameworks',
            'Identity and entitlement risk analysis for excessive IAM permissions',
            'Kubernetes deployment security benchmarking',
          ],
          recommendedForKo: [
            'AWS, Azure, GCP 전반의 지속적 클라우드 설정 오류 탐지',
            'CIS, PCI DSS, SOC 2, 커스텀 프레임워크 컴플라이언스 추적',
            '과도한 IAM 권한에 대한 아이덴티티 및 자격 리스크 분석',
            'Kubernetes 배포 보안 벤치마킹',
          ],
          securityCapabilities: [
            'CSPM with 1,000+ detection rules',
            'CIS, PCI DSS, SOC 2, custom framework compliance',
            'Identity risk analysis (CIEM)',
            'Vulnerability detection and prioritization',
            'Kubernetes security benchmarking',
            'Posture Score for organizational compliance tracking',
          ],
          children: [
            {
              nodeId: 'datadog-csm-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog CSM',
              nameKo: 'Datadog CSM',
              description:
                'Cloud security posture management with 1,000+ detection rules, multi-framework compliance, CIEM identity risk analysis, and Security Inbox prioritization',
              descriptionKo:
                '1,000개 이상 탐지 규칙, 멀티 프레임워크 컴플라이언스, CIEM 아이덴티티 리스크 분석, Security Inbox 우선순위 지정을 포함한 클라우드 보안 포스처 관리',
              sourceUrl: 'https://www.datadoghq.com/product/cloud-security-management/',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Security Posture Management (CSPM)',
              architectureRoleKo: '클라우드 보안 포스처 관리 (CSPM)',
              recommendedFor: [
                'Multi-cloud CSPM with 1,000+ misconfiguration detection rules',
                'CIS/PCI DSS/SOC 2 compliance scoring and gap remediation',
                'IAM entitlement risk reduction for overprivileged identities',
              ],
              recommendedForKo: [
                '1,000개 이상 설정 오류 탐지 규칙을 갖춘 멀티 클라우드 CSPM',
                'CIS/PCI DSS/SOC 2 컴플라이언스 스코어링 및 격차 해소',
                '과도한 권한 아이덴티티에 대한 IAM 자격 리스크 감소',
              ],
              securityCapabilities: [
                '1,000+ cloud misconfiguration detection rules',
                'CIS, PCI DSS, SOC 2, custom compliance frameworks',
                'CIEM identity risk and entitlement analysis',
                'Severity-based Security Inbox prioritization',
                'Kubernetes CIS benchmark compliance',
              ],
              specs: {
                'Detection Rules': '1,000+ cloud misconfiguration rules',
                'Compliance Frameworks': 'CIS, PCI DSS, SOC 2, custom',
                'Cloud Providers': 'AWS, Azure, GCP',
                'CIEM': 'Identity risk analysis with IAM attack path visualization',
                'Posture Score': 'Organizational compliance health tracking',
                'Coverage': 'Cloud accounts, hosts, containers, Kubernetes',
              },
              children: [],
            },
          ],
        },
        // -- Application Security Management --
        {
          nodeId: 'datadog-asm',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Application Security Management',
          nameKo: '애플리케이션 보안 관리',
          description:
            'Runtime application and API protection with OWASP Top 10 defense, shadow API discovery, business logic protection, and in-app/edge blocking',
          descriptionKo:
            'OWASP Top 10 방어, 섀도우 API 검색, 비즈니스 로직 보호, 인앱/엣지 차단을 포함한 런타임 애플리케이션 및 API 보호',
          sourceUrl: 'https://www.datadoghq.com/product/application-security-management/',
          infraNodeTypes: ['waf'],
          architectureRole: 'Runtime Application and API Security (RASP/WAAP)',
          architectureRoleKo: '런타임 애플리케이션 및 API 보안 (RASP/WAAP)',
          recommendedFor: [
            'Runtime application protection against OWASP API Top 10 threats',
            'Shadow and undocumented API discovery and monitoring',
            'Business logic protection against account takeover and credential stuffing',
            'In-app and edge-level request blocking for malicious actors',
          ],
          recommendedForKo: [
            'OWASP API Top 10 위협에 대한 런타임 애플리케이션 보호',
            '섀도우 및 문서화되지 않은 API 검색 및 모니터링',
            '계정 탈취 및 크레덴셜 스터핑에 대한 비즈니스 로직 보호',
            '악성 행위자에 대한 인앱 및 엣지 수준 요청 차단',
          ],
          securityCapabilities: [
            'OWASP API Top 10 risk detection',
            'Shadow and undocumented API discovery',
            'Account Takeover and Credential Stuffing detection',
            'Real-time blocking at in-app tracer or edge (WAF/CDN/LB)',
            'End-to-end attack flow visualization',
            'Code Security (SAST/IAST/SCA)',
          ],
          children: [
            {
              nodeId: 'datadog-asm-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog ASM',
              nameKo: 'Datadog ASM',
              description:
                'Application and API protection with OWASP Top 10 defense, shadow API discovery, business logic attack detection, and flexible in-app/edge blocking',
              descriptionKo:
                'OWASP Top 10 방어, 섀도우 API 검색, 비즈니스 로직 공격 탐지, 유연한 인앱/엣지 차단을 포함한 애플리케이션 및 API 보호',
              sourceUrl: 'https://www.datadoghq.com/product/application-security-management/',
              infraNodeTypes: ['waf'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Runtime Application and API Security (RASP/WAAP)',
              architectureRoleKo: '런타임 애플리케이션 및 API 보안 (RASP/WAAP)',
              recommendedFor: [
                'OWASP API Top 10 runtime protection for microservices',
                'Shadow API discovery and continuous API inventory monitoring',
                'Account takeover detection with business logic flow instrumentation',
              ],
              recommendedForKo: [
                '마이크로서비스를 위한 OWASP API Top 10 런타임 보호',
                '섀도우 API 검색 및 지속적 API 인벤토리 모니터링',
                '비즈니스 로직 흐름 계측을 통한 계정 탈취 탐지',
              ],
              securityCapabilities: [
                'OWASP API Top 10 threat detection',
                'Continuous API discovery (including shadow/undocumented)',
                'Account Takeover and Credential Stuffing detection',
                'Real-time request/user/IP blocking (in-app tracer or edge)',
                'Attack flow visualization across services',
              ],
              specs: {
                'Protection': 'OWASP API Top 10 defense',
                'API Discovery': 'Continuous shadow and undocumented API detection',
                'Blocking Modes': 'In-app tracer, edge (WAF, CDN, LB, reverse proxy)',
                'Business Logic': 'Login, checkout, account recovery flow instrumentation',
                'Attack Visualization': 'End-to-end attack propagation across services',
                'Code Security': 'SAST, IAST, SCA integration',
              },
              children: [],
            },
          ],
        },
        // -- Cloud Workload Security --
        {
          nodeId: 'datadog-cws',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Cloud Workload Security',
          nameKo: '클라우드 워크로드 보안',
          description:
            'Runtime workload protection for hosts, containers, and Kubernetes with file integrity monitoring, process-level threat detection, and kernel-level visibility',
          descriptionKo:
            '파일 무결성 모니터링, 프로세스 수준 위협 탐지, 커널 수준 가시성을 포함한 호스트, 컨테이너, Kubernetes 런타임 워크로드 보호',
          sourceUrl: 'https://www.datadoghq.com/product/cloud-security-management/',
          infraNodeTypes: ['siem'],
          architectureRole: 'Cloud Workload Protection Platform (CWPP)',
          architectureRoleKo: '클라우드 워크로드 보호 플랫폼 (CWPP)',
          recommendedFor: [
            'Runtime threat detection for containers and Kubernetes workloads',
            'File integrity monitoring (FIM) for compliance-sensitive environments',
            'Kernel-level process activity monitoring using eBPF',
          ],
          recommendedForKo: [
            '컨테이너 및 Kubernetes 워크로드에 대한 런타임 위협 탐지',
            '컴플라이언스 민감 환경을 위한 파일 무결성 모니터링(FIM)',
            'eBPF를 사용한 커널 수준 프로세스 활동 모니터링',
          ],
          securityCapabilities: [
            'Runtime workload threat detection',
            'File integrity monitoring (FIM)',
            'Process-level activity monitoring',
            'Kernel-level visibility via eBPF',
            'Container image vulnerability scanning',
          ],
          children: [
            {
              nodeId: 'datadog-cws-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog CWS',
              nameKo: 'Datadog CWS',
              description:
                'Cloud workload protection with eBPF-based runtime threat detection, file integrity monitoring, process activity tracking, and container image scanning',
              descriptionKo:
                'eBPF 기반 런타임 위협 탐지, 파일 무결성 모니터링, 프로세스 활동 추적, 컨테이너 이미지 스캔을 포함한 클라우드 워크로드 보호',
              sourceUrl: 'https://www.datadoghq.com/product/cloud-security-management/',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Workload Protection Platform (CWPP)',
              architectureRoleKo: '클라우드 워크로드 보호 플랫폼 (CWPP)',
              recommendedFor: [
                'eBPF-based runtime threat detection for cloud workloads',
                'File integrity monitoring for PCI DSS and HIPAA compliance',
                'Container image vulnerability scanning before deployment',
              ],
              recommendedForKo: [
                '클라우드 워크로드에 대한 eBPF 기반 런타임 위협 탐지',
                'PCI DSS 및 HIPAA 컴플라이언스를 위한 파일 무결성 모니터링',
                '배포 전 컨테이너 이미지 취약점 스캔',
              ],
              securityCapabilities: [
                'eBPF-based kernel-level runtime detection',
                'File integrity monitoring (FIM)',
                'Process activity monitoring and anomaly detection',
                'Container image vulnerability scanning',
                'Custom detection rule support',
              ],
              specs: {
                'Runtime Detection': 'eBPF-based kernel-level monitoring',
                'File Integrity': 'FIM for critical file and directory changes',
                'Process Monitoring': 'Process tree analysis and anomaly detection',
                'Image Scanning': 'Container image vulnerability detection',
                'Coverage': 'Hosts, containers, Kubernetes workloads',
                'Compliance': 'PCI DSS, HIPAA, CIS file integrity requirements',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 5. Developer Experience
    // =====================================================================
    {
      nodeId: 'datadog-developer-experience',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Developer Experience',
      nameKo: '개발자 경험',
      description:
        'Developer productivity platform with CI/CD pipeline visibility, software delivery tracking, and workflow automation',
      descriptionKo:
        'CI/CD 파이프라인 가시성, 소프트웨어 딜리버리 추적, 워크플로우 자동화를 포함한 개발자 생산성 플랫폼',
      sourceUrl: 'https://www.datadoghq.com/product/',
      infraNodeTypes: ['prometheus', 'grafana'],
      children: [
        // -- CI Visibility --
        {
          nodeId: 'datadog-ci-visibility',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'CI Visibility',
          nameKo: 'CI 가시성',
          description:
            'CI/CD pipeline performance monitoring with execution time tracking, flaky test detection, Intelligent Test Runner, and deployment correlation',
          descriptionKo:
            '실행 시간 추적, 불안정 테스트 탐지, 지능형 테스트 러너, 배포 상관 분석을 포함한 CI/CD 파이프라인 성능 모니터링',
          sourceUrl: 'https://www.datadoghq.com/product/ci-cd-monitoring/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'CI/CD Pipeline Observability',
          architectureRoleKo: 'CI/CD 파이프라인 관측성',
          recommendedFor: [
            'CI/CD pipeline execution time and failure rate monitoring',
            'Flaky test detection and elimination before production impact',
            'Intelligent Test Runner for automatic irrelevant test skipping',
          ],
          recommendedForKo: [
            'CI/CD 파이프라인 실행 시간 및 실패율 모니터링',
            '프로덕션 영향 전 불안정 테스트 탐지 및 제거',
            '자동 불필요 테스트 건너뛰기를 위한 지능형 테스트 러너',
          ],
          children: [
            {
              nodeId: 'datadog-ci-visibility-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog CI Visibility',
              nameKo: 'Datadog CI 가시성',
              description:
                'CI/CD pipeline monitoring with job duration benchmarking, flaky test detection, Intelligent Test Runner, Quality Gates, and commit-centric performance views',
              descriptionKo:
                '작업 기간 벤치마킹, 불안정 테스트 탐지, 지능형 테스트 러너, 품질 게이트, 커밋 중심 성능 뷰를 포함한 CI/CD 파이프라인 모니터링',
              sourceUrl: 'https://www.datadoghq.com/product/ci-cd-monitoring/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'CI/CD Pipeline Observability',
              architectureRoleKo: 'CI/CD 파이프라인 관측성',
              recommendedFor: [
                'Pipeline execution time tracking with default branch benchmarking',
                'Flaky test elimination with Intelligent Test Runner and Quality Gates',
                'Commit-correlated pipeline performance regression detection',
              ],
              recommendedForKo: [
                '기본 브랜치 벤치마킹을 통한 파이프라인 실행 시간 추적',
                '지능형 테스트 러너 및 품질 게이트를 통한 불안정 테스트 제거',
                '커밋 상관 파이프라인 성능 회귀 탐지',
              ],
              specs: {
                'Pipeline Metrics': 'Execution time, failure rate, queue time',
                'Test Management': 'Flaky test detection, Intelligent Test Runner, Quality Gates',
                'CI Providers': 'GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure DevOps',
                'Runners': 'Cloud and self-hosted runners',
                'Views': 'Commit-centric performance with GitHub PR comments',
                'Related Products': 'Test Optimization, Code Coverage, Feature Flags',
              },
              children: [],
            },
          ],
        },
        // -- Software Delivery --
        {
          nodeId: 'datadog-software-delivery',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Software Delivery',
          nameKo: '소프트웨어 딜리버리',
          description:
            'End-to-end software delivery tracking with DORA metrics, deployment tracking, feature flag management, and internal developer portal',
          descriptionKo:
            'DORA 메트릭, 배포 추적, 기능 플래그 관리, 내부 개발자 포털을 포함한 엔드 투 엔드 소프트웨어 딜리버리 추적',
          sourceUrl: 'https://www.datadoghq.com/product/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Software Delivery Intelligence',
          architectureRoleKo: '소프트웨어 딜리버리 인텔리전스',
          recommendedFor: [
            'DORA metrics tracking for engineering team performance measurement',
            'Deployment frequency and lead time optimization',
            'Feature flag management with observability-integrated rollout controls',
          ],
          recommendedForKo: [
            '엔지니어링 팀 성과 측정을 위한 DORA 메트릭 추적',
            '배포 빈도 및 리드 타임 최적화',
            '관측성 통합 롤아웃 제어를 통한 기능 플래그 관리',
          ],
          children: [
            {
              nodeId: 'datadog-software-delivery-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Software Delivery',
              nameKo: 'Datadog 소프트웨어 딜리버리',
              description:
                'Software delivery platform with DORA metrics, deployment tracking, feature flags, internal developer portal, and code coverage analysis',
              descriptionKo:
                'DORA 메트릭, 배포 추적, 기능 플래그, 내부 개발자 포털, 코드 커버리지 분석을 포함한 소프트웨어 딜리버리 플랫폼',
              sourceUrl: 'https://www.datadoghq.com/product/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Software Delivery Intelligence',
              architectureRoleKo: '소프트웨어 딜리버리 인텔리전스',
              recommendedFor: [
                'DORA metrics (deployment frequency, lead time, MTTR, change failure rate)',
                'Feature flag management with real-time observability integration',
                'Internal developer portal for service ownership and documentation',
              ],
              recommendedForKo: [
                'DORA 메트릭(배포 빈도, 리드 타임, MTTR, 변경 실패율)',
                '실시간 관측성 통합을 통한 기능 플래그 관리',
                '서비스 소유권 및 문서화를 위한 내부 개발자 포털',
              ],
              specs: {
                'DORA Metrics': 'Deployment frequency, lead time, MTTR, change failure rate',
                'Feature Flags': 'Observability-integrated rollout and rollback',
                'Developer Portal': 'Service catalog with ownership and runbooks',
                'Code Coverage': 'Per-commit and per-test coverage analysis',
                'Deployment Tracking': 'Canary, blue-green, rolling deployment monitoring',
              },
              children: [],
            },
          ],
        },
        // -- Workflow Automation --
        {
          nodeId: 'datadog-workflow-automation',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Workflow Automation',
          nameKo: '워크플로우 자동화',
          description:
            'No-code workflow automation with 1,750+ actions, monitor/security signal triggers, human-in-the-loop approvals, and persistent datastore',
          descriptionKo:
            '1,750개 이상 액션, 모니터/보안 시그널 트리거, 사람 참여형 승인, 영구 데이터 스토어를 포함한 노코드 워크플로우 자동화',
          sourceUrl: 'https://www.datadoghq.com/product/workflow-automation/',
          infraNodeTypes: ['prometheus', 'grafana'],
          architectureRole: 'Observability-Driven Workflow Automation / SOAR',
          architectureRoleKo: '관측성 기반 워크플로우 자동화 / SOAR',
          recommendedFor: [
            'Alert-triggered automated remediation and incident response workflows',
            'No-code automation for operations teams with 1,750+ pre-built actions',
            'Human-in-the-loop approval workflows via Slack integration',
          ],
          recommendedForKo: [
            '알림 트리거 자동 해결 및 인시던트 대응 워크플로우',
            '1,750개 이상 사전 구축 액션을 갖춘 운영 팀용 노코드 자동화',
            'Slack 통합을 통한 사람 참여형 승인 워크플로우',
          ],
          children: [
            {
              nodeId: 'datadog-workflow-automation-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Datadog Workflow Automation',
              nameKo: 'Datadog 워크플로우 자동화',
              description:
                'Point-and-click workflow builder with 1,750+ actions, 150+ blueprints, AI-assisted natural language workflow generation, and persistent datastore',
              descriptionKo:
                '1,750개 이상 액션, 150개 이상 블루프린트, AI 지원 자연어 워크플로우 생성, 영구 데이터 스토어를 포함한 포인트 앤 클릭 워크플로우 빌더',
              sourceUrl: 'https://www.datadoghq.com/product/workflow-automation/',
              infraNodeTypes: ['prometheus', 'grafana'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Observability-Driven Workflow Automation / SOAR',
              architectureRoleKo: '관측성 기반 워크플로우 자동화 / SOAR',
              recommendedFor: [
                'Alert-triggered automated remediation with 1,750+ pre-built actions',
                'AI-assisted natural language workflow generation for rapid automation',
                'Human-in-the-loop Slack approval workflows for critical operations',
              ],
              recommendedForKo: [
                '1,750개 이상 사전 구축 액션을 통한 알림 트리거 자동 해결',
                '신속한 자동화를 위한 AI 지원 자연어 워크플로우 생성',
                '중요 운영을 위한 Slack 사람 참여형 승인 워크플로우',
              ],
              specs: {
                'Actions': '1,750+ out-of-box actions',
                'Blueprints': '150+ customizable workflow templates',
                'Triggers': 'Monitor alerts, security signals, schedules, manual',
                'AI Generation': 'Natural language to workflow conversion',
                'Integrations': 'AWS, Cloudflare, GitLab, Slack, REST API, Datadog native',
                'Datastore': 'Persistent key-value store with JSON and runtime lookups',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
