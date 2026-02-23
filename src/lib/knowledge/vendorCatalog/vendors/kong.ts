/**
 * Kong Inc. -- Full Product Catalog
 *
 * Hierarchical product tree covering API Gateway, Service Mesh,
 * API Management Platform, Developer Tools, and Kubernetes Infrastructure.
 *
 * Data sourced from https://konghq.com/products
 * Last crawled: 2026-02-23
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Kong Inc. Product Catalog
// ---------------------------------------------------------------------------

export const kongCatalog: VendorCatalog = {
  vendorId: 'kong',
  vendorName: 'Kong Inc.',
  vendorNameKo: '콩 주식회사',
  headquarters: 'San Francisco, CA, USA',
  website: 'https://konghq.com',
  productPageUrl: 'https://konghq.com/products',
  depthStructure: ['category', 'product-line', 'edition'],
  depthStructureKo: ['카테고리', '제품 라인', '에디션'],
  lastCrawled: '2026-02-23',
  crawlSource: 'https://konghq.com/products',
  // stats will be computed at the bottom of the file
  stats: { totalProducts: 0, maxDepth: 0, categoriesCount: 0 },
  products: [
    // =====================================================================
    // 1. API Gateway
    // =====================================================================
    {
      nodeId: 'kong-api-gateway',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'API Gateway',
      nameKo: 'API 게이트웨이',
      description:
        'High-performance, lightweight API gateway platform built on NGINX/OpenResty for request routing, authentication, rate limiting, and protocol translation across on-premises, cloud, and Kubernetes environments',
      descriptionKo:
        '온프레미스, 클라우드 및 Kubernetes 환경에서의 요청 라우팅, 인증, 속도 제한 및 프로토콜 변환을 위한 NGINX/OpenResty 기반 고성능 경량 API 게이트웨이 플랫폼',
      sourceUrl: 'https://konghq.com/products/kong-gateway',
      infraNodeTypes: ['api-gateway', 'load-balancer'],
      children: [
        // -----------------------------------------------------------------
        // Kong Gateway OSS
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-gateway-oss',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Gateway OSS',
          nameKo: 'Kong Gateway 오픈소스',
          description:
            'Open-source API gateway providing core routing, load balancing, authentication, and plugin extensibility with community-driven development and no licensing cost',
          descriptionKo:
            '커뮤니티 주도 개발과 무료 라이선스로 핵심 라우팅, 부하 분산, 인증 및 플러그인 확장성을 제공하는 오픈소스 API 게이트웨이',
          sourceUrl: 'https://konghq.com/products/kong-gateway',
          infraNodeTypes: ['api-gateway', 'load-balancer'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'perpetual',
          architectureRole: 'API Gateway / Microservices Entry Point',
          architectureRoleKo: 'API 게이트웨이 / 마이크로서비스 진입점',
          recommendedFor: [
            'Open-source API gateway for microservices',
            'Developer-driven API management without licensing cost',
            'Lightweight L7 proxy and load balancing',
            'Plugin-based extensible API middleware',
          ],
          recommendedForKo: [
            '마이크로서비스를 위한 오픈소스 API 게이트웨이',
            '라이선스 비용 없는 개발자 주도 API 관리',
            '경량 L7 프록시 및 부하 분산',
            '플러그인 기반 확장 가능 API 미들웨어',
          ],
          supportedProtocols: [
            'HTTP/HTTPS',
            'HTTP/2',
            'gRPC',
            'GraphQL',
            'WebSocket',
            'TCP',
            'UDP',
            'REST',
          ],
          haFeatures: [
            'Horizontal scaling with multiple nodes',
            'Database-backed clustering (PostgreSQL)',
            'DB-less declarative mode',
            'Health checks (active/passive)',
          ],
          securityCapabilities: [
            'Basic Auth, HMAC Auth, JWT Auth',
            'OAuth 2.0 authentication',
            'Key authentication',
            'Rate limiting',
            'IP restriction',
            'Bot detection',
            'CORS policy enforcement',
            'ACL (Access Control Lists)',
          ],
          specs: {
            'Engine': 'NGINX / OpenResty (Lua)',
            'Throughput': 'Up to 50K TPS per node',
            'Latency': 'Sub-millisecond proxy latency',
            'Plugins': '100+ community plugins',
            'Deployment': 'Docker, Kubernetes, Bare Metal, VM',
            'Database': 'PostgreSQL or DB-less (declarative YAML)',
            'Configuration': 'Admin API (REST), declarative YAML',
          },
          operationalComplexity: 'moderate',
          ecosystemMaturity: 'mature',
          children: [],
        },
        // -----------------------------------------------------------------
        // Kong Gateway Enterprise
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-gateway-enterprise',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Gateway Enterprise',
          nameKo: 'Kong Gateway 엔터프라이즈',
          description:
            'Enterprise-grade API gateway with advanced security (OIDC, SAML, mTLS, FIPS 140-2), RBAC, secrets management, audit logging, Kong Manager GUI, and 24/7 enterprise support',
          descriptionKo:
            '고급 보안(OIDC, SAML, mTLS, FIPS 140-2), RBAC, 시크릿 관리, 감사 로깅, Kong Manager GUI 및 24/7 엔터프라이즈 지원을 제공하는 엔터프라이즈급 API 게이트웨이',
          sourceUrl: 'https://konghq.com/products/kong-gateway',
          infraNodeTypes: ['api-gateway', 'load-balancer'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'subscription',
          maxThroughput: '50K TPS per node',
          architectureRole: 'Enterprise API Gateway / Zero Trust API Security',
          architectureRoleKo: '엔터프라이즈 API 게이트웨이 / 제로 트러스트 API 보안',
          recommendedFor: [
            'Enterprise API management with compliance requirements',
            'Zero Trust API security with OIDC/SAML/mTLS',
            'Regulated industry API governance (FIPS 140-2)',
            'Hybrid cloud API gateway with centralized management',
            'Multi-team API platform with RBAC and audit logging',
          ],
          recommendedForKo: [
            '컴플라이언스 요구사항이 있는 엔터프라이즈 API 관리',
            'OIDC/SAML/mTLS 기반 제로 트러스트 API 보안',
            '규제 산업 API 거버넌스(FIPS 140-2)',
            '중앙 관리 기반 하이브리드 클라우드 API 게이트웨이',
            'RBAC 및 감사 로깅을 갖춘 멀티팀 API 플랫폼',
          ],
          supportedProtocols: [
            'HTTP/HTTPS',
            'HTTP/2',
            'gRPC',
            'GraphQL',
            'WebSocket',
            'TCP',
            'UDP',
            'REST',
            'SOAP',
          ],
          haFeatures: [
            'Hybrid mode (separate control/data planes)',
            'Horizontal scaling with clustering',
            'Data plane resilience (S3 config backup)',
            'Health checks (active/passive)',
            'Blue-green and canary deployments',
            'Rolling upgrades',
          ],
          securityCapabilities: [
            'OIDC (OpenID Connect)',
            'SAML 2.0',
            'Mutual TLS (mTLS)',
            'FIPS 140-2 compliance',
            'OAuth 2.0 with introspection',
            'RBAC (Role-Based Access Control)',
            'Secrets management (Vault integration)',
            'Audit logging',
            'OPA (Open Policy Agent) integration',
            'Rate limiting (advanced with Redis)',
            'IP restriction and bot detection',
          ],
          specs: {
            'Engine': 'NGINX / OpenResty (Lua)',
            'Throughput': 'Up to 50K TPS per node',
            'Latency': 'Sub-millisecond proxy latency',
            'Plugins': '400+ plugins (community + enterprise)',
            'Deployment': 'Docker, Kubernetes, Bare Metal, VM, Cloud',
            'Management': 'Kong Manager GUI, Admin API, decK CLI',
            'Compliance': 'FIPS 140-2, SOC 2',
            'Database': 'PostgreSQL (clustered) or DB-less mode',
          },
          operationalComplexity: 'moderate',
          ecosystemMaturity: 'mature',
          children: [],
        },
        // -----------------------------------------------------------------
        // Kong AI Gateway
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-ai-gateway',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong AI Gateway',
          nameKo: 'Kong AI 게이트웨이',
          description:
            'Specialized API gateway for managing AI/LLM provider access with semantic caching, prompt security, PII sanitization, cost control, and multi-provider routing',
          descriptionKo:
            '시맨틱 캐싱, 프롬프트 보안, PII 정제, 비용 제어 및 다중 프로바이더 라우팅을 갖춘 AI/LLM 프로바이더 접근 관리 전용 API 게이트웨이',
          sourceUrl: 'https://konghq.com/products/kong-ai-gateway',
          infraNodeTypes: ['api-gateway'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'subscription',
          architectureRole: 'AI/LLM API Gateway / AI Traffic Management',
          architectureRoleKo: 'AI/LLM API 게이트웨이 / AI 트래픽 관리',
          recommendedFor: [
            'Multi-LLM provider API management and routing',
            'AI cost control with semantic caching and token tracking',
            'Prompt security and PII sanitization for AI workloads',
            'Enterprise AI governance and compliance',
          ],
          recommendedForKo: [
            '다중 LLM 프로바이더 API 관리 및 라우팅',
            '시맨틱 캐싱과 토큰 추적을 통한 AI 비용 제어',
            'AI 워크로드를 위한 프롬프트 보안 및 PII 정제',
            '엔터프라이즈 AI 거버넌스 및 컴플라이언스',
          ],
          supportedProtocols: [
            'HTTP/HTTPS',
            'REST',
            'gRPC',
            'WebSocket',
          ],
          securityCapabilities: [
            'Semantic prompt guards',
            'PII detection and sanitization',
            'Compliance policy enforcement',
            'Centralized MCP server authentication',
            'Rate limiting per model/provider',
          ],
          specs: {
            'LLM Providers': 'OpenAI, Azure AI, AWS Bedrock, GCP Vertex, Anthropic',
            'Semantic Caching': 'Eliminates duplicate prompt processing',
            'Cost Control': 'Token consumption tracking, predictive cost modeling',
            'RAG Support': 'Gateway-layer RAG pipeline automation',
            'MCP': 'Model Context Protocol server generation',
            'Analytics': 'LLM token consumption, cost per model, latency',
          },
          operationalComplexity: 'moderate',
          ecosystemMaturity: 'emerging',
          children: [],
        },
      ],
    },

    // =====================================================================
    // 2. API Management Platform
    // =====================================================================
    {
      nodeId: 'kong-api-management',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'API Management Platform',
      nameKo: 'API 관리 플랫폼',
      description:
        'Unified SaaS-based API management platform providing centralized control plane, developer portal, service catalog, analytics, and governance for distributed API infrastructures',
      descriptionKo:
        '분산 API 인프라를 위한 통합 컨트롤 플레인, 개발자 포털, 서비스 카탈로그, 분석 및 거버넌스를 제공하는 통합 SaaS 기반 API 관리 플랫폼',
      sourceUrl: 'https://konghq.com/products/kong-konnect',
      infraNodeTypes: ['api-gateway'],
      children: [
        // -----------------------------------------------------------------
        // Kong Konnect
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-konnect',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Konnect',
          nameKo: 'Kong Konnect',
          description:
            'Unified SaaS API management platform with federated control plane for managing APIs, events, microservices, and AI runtimes with gateway management, developer portal, service catalog, and advanced analytics',
          descriptionKo:
            'API, 이벤트, 마이크로서비스 및 AI 런타임을 관리하기 위한 게이트웨이 관리, 개발자 포털, 서비스 카탈로그 및 고급 분석을 갖춘 통합 SaaS API 관리 플랫폼',
          sourceUrl: 'https://konghq.com/products/kong-konnect',
          infraNodeTypes: ['api-gateway'],
          lifecycle: 'active',
          formFactor: 'cloud',
          licensingModel: 'as-a-service',
          architectureRole: 'SaaS API Management Control Plane',
          architectureRoleKo: 'SaaS API 관리 컨트롤 플레인',
          recommendedFor: [
            'Centralized multi-environment API management',
            'SaaS-managed API gateway control plane',
            'Developer self-service API portal and catalog',
            'API analytics with AI/LLM metrics tracking',
            'Hybrid cloud API governance and compliance',
          ],
          recommendedForKo: [
            '중앙 집중식 멀티 환경 API 관리',
            'SaaS 관리형 API 게이트웨이 컨트롤 플레인',
            '개발자 셀프서비스 API 포털 및 카탈로그',
            'AI/LLM 메트릭 추적을 포함한 API 분석',
            '하이브리드 클라우드 API 거버넌스 및 컴플라이언스',
          ],
          supportedProtocols: [
            'HTTP/HTTPS',
            'REST',
            'gRPC',
            'GraphQL',
            'WebSocket',
            'Kafka (event streaming)',
          ],
          haFeatures: [
            'SaaS-managed high availability',
            'Multi-region deployment support (AWS, Azure, GCP)',
            'Hybrid runtime with customer-managed data planes',
            'Federated control plane architecture',
          ],
          securityCapabilities: [
            'RBAC and federated control planes',
            'Secrets management',
            'PII sanitization with encryption enforcement',
            'Automated security guardrails',
            'SOC 2 compliance',
            'OIDC and SAML identity provider integration',
            'SCIM user provisioning',
          ],
          specs: {
            'Type': 'SaaS API Management Platform',
            'Control Plane': 'Kong-managed SaaS',
            'Data Plane': 'Customer-managed (hybrid) or Kong-managed cloud',
            'Cloud Regions': 'AWS, Azure, GCP',
            'Automation': 'Admin API, decK CLI, Terraform provider, K8s Operator',
            'Analytics': 'API consumption, LLM token tracking, error rates, latency',
            'Governance': 'Scorecards, compliance templates, automated guardrails',
          },
          operationalComplexity: 'simple',
          ecosystemMaturity: 'stable',
          children: [],
        },
        // -----------------------------------------------------------------
        // Kong Developer Portal
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-developer-portal',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Developer Portal',
          nameKo: 'Kong 개발자 포털',
          description:
            'Self-service API discovery portal enabling API consumers to browse, test, subscribe to, and manage API products with interactive documentation and usage analytics',
          descriptionKo:
            'API 소비자가 대화형 문서 및 사용량 분석을 통해 API 제품을 탐색, 테스트, 구독 및 관리할 수 있는 셀프서비스 API 검색 포털',
          sourceUrl: 'https://konghq.com/products/kong-konnect',
          infraNodeTypes: ['api-gateway'],
          lifecycle: 'active',
          formFactor: 'cloud',
          licensingModel: 'as-a-service',
          architectureRole: 'API Developer Portal / API Catalog',
          architectureRoleKo: 'API 개발자 포털 / API 카탈로그',
          recommendedFor: [
            'Self-service API product catalog for developers',
            'API documentation and interactive testing',
            'API subscription and key management',
          ],
          recommendedForKo: [
            '개발자를 위한 셀프서비스 API 제품 카탈로그',
            'API 문서화 및 대화형 테스트',
            'API 구독 및 키 관리',
          ],
          specs: {
            'Type': 'API Developer Portal',
            'Features': 'API catalog, documentation, interactive testing',
            'Subscription': 'Self-service API key provisioning',
            'Analytics': 'API usage metrics per consumer',
            'Customization': 'Branded portal with custom themes',
          },
          operationalComplexity: 'simple',
          ecosystemMaturity: 'stable',
          children: [],
        },
        // -----------------------------------------------------------------
        // Kong Service Catalog
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-service-catalog',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Service Catalog',
          nameKo: 'Kong 서비스 카탈로그',
          description:
            'Internal service registry for tracking microservices, APIs, and dependencies with auto-discovery, compliance scoring, and organizational ownership mapping',
          descriptionKo:
            '자동 검색, 컴플라이언스 스코어링 및 조직 소유권 매핑을 통해 마이크로서비스, API 및 종속성을 추적하는 내부 서비스 레지스트리',
          sourceUrl: 'https://konghq.com/products/kong-konnect',
          infraNodeTypes: ['api-gateway'],
          lifecycle: 'active',
          formFactor: 'cloud',
          licensingModel: 'as-a-service',
          architectureRole: 'Service Registry / API Inventory',
          architectureRoleKo: '서비스 레지스트리 / API 인벤토리',
          recommendedFor: [
            'Microservices inventory and dependency tracking',
            'API governance with compliance scoring',
            'Organization-wide service ownership mapping',
          ],
          recommendedForKo: [
            '마이크로서비스 인벤토리 및 종속성 추적',
            '컴플라이언스 스코어링을 통한 API 거버넌스',
            '조직 전체 서비스 소유권 매핑',
          ],
          specs: {
            'Type': 'Service catalog / registry',
            'Discovery': 'Auto-discovery from connected runtimes',
            'Scoring': 'Compliance scorecards with custom templates',
            'Integration': 'Kong Konnect control plane',
            'Ownership': 'Team and organizational mapping',
          },
          operationalComplexity: 'simple',
          ecosystemMaturity: 'stable',
          children: [],
        },
      ],
    },

    // =====================================================================
    // 3. Service Mesh
    // =====================================================================
    {
      nodeId: 'kong-service-mesh',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Service Mesh',
      nameKo: '서비스 메시',
      description:
        'Service mesh platform for connecting, securing, and observing microservices communication across Kubernetes, cloud, and on-premises environments with mTLS, traffic management, and zero-trust security',
      descriptionKo:
        'mTLS, 트래픽 관리 및 제로 트러스트 보안을 통해 Kubernetes, 클라우드 및 온프레미스 환경에서 마이크로서비스 통신을 연결, 보안 및 관찰하는 서비스 메시 플랫폼',
      sourceUrl: 'https://konghq.com/products/kong-mesh',
      infraNodeTypes: ['load-balancer', 'api-gateway'],
      children: [
        // -----------------------------------------------------------------
        // Kong Mesh (Enterprise)
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-mesh-enterprise',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Mesh',
          nameKo: 'Kong Mesh',
          description:
            'Enterprise service mesh built on Kuma (CNCF) providing mTLS encryption, zero-trust security, traffic management, circuit breaking, and multi-zone observability across Kubernetes and VM workloads',
          descriptionKo:
            'Kuma(CNCF) 기반의 엔터프라이즈 서비스 메시로 Kubernetes 및 VM 워크로드에서 mTLS 암호화, 제로 트러스트 보안, 트래픽 관리, 서킷 브레이킹 및 다중 존 관찰 가능성 제공',
          sourceUrl: 'https://konghq.com/products/kong-mesh',
          infraNodeTypes: ['load-balancer', 'api-gateway'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'subscription',
          architectureRole: 'Service Mesh / East-West Traffic Management',
          architectureRoleKo: '서비스 메시 / 동서 트래픽 관리',
          recommendedFor: [
            'Microservices mTLS encryption and zero-trust security',
            'East-west traffic management and observability',
            'Multi-cluster and multi-zone service connectivity',
            'Circuit breaking and intelligent failover',
            'Cross-platform mesh (Kubernetes + VM workloads)',
          ],
          recommendedForKo: [
            '마이크로서비스 mTLS 암호화 및 제로 트러스트 보안',
            '동서 트래픽 관리 및 관찰 가능성',
            '다중 클러스터 및 다중 존 서비스 연결',
            '서킷 브레이킹 및 지능형 페일오버',
            '크로스 플랫폼 메시(Kubernetes + VM 워크로드)',
          ],
          supportedProtocols: [
            'HTTP/HTTPS',
            'HTTP/2',
            'gRPC',
            'TCP',
            'mTLS',
          ],
          haFeatures: [
            'Multi-zone deployment',
            'Locality-aware routing',
            'Circuit breaker policies',
            'Intelligent failover',
            'Health checks',
          ],
          securityCapabilities: [
            'Mutual TLS (mTLS) by default',
            'Zero-trust service identity',
            'Traffic policies and authorization',
            'Certificate rotation automation',
            'Centralized security audit',
          ],
          specs: {
            'Foundation': 'Kuma (CNCF project)',
            'Data Plane': 'Envoy proxy sidecar',
            'Throughput': '10,000+ TPS (customer benchmark)',
            'Platforms': 'Kubernetes, VMs, Bare Metal',
            'Observability': 'Prometheus, Grafana, Jaeger, Zipkin',
            'Management': 'Kong Konnect or standalone control plane',
          },
          operationalComplexity: 'complex',
          ecosystemMaturity: 'stable',
          children: [],
        },
        // -----------------------------------------------------------------
        // Kuma (Open Source)
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-kuma-oss',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kuma (Open Source)',
          nameKo: 'Kuma (오픈소스)',
          description:
            'CNCF-graduated open-source service mesh providing Envoy-based sidecar proxy, mTLS, traffic policies, and observability for Kubernetes and universal (VM) deployments',
          descriptionKo:
            'Kubernetes 및 유니버설(VM) 배포를 위한 Envoy 기반 사이드카 프록시, mTLS, 트래픽 정책 및 관찰 가능성을 제공하는 CNCF 졸업 오픈소스 서비스 메시',
          sourceUrl: 'https://kuma.io',
          infraNodeTypes: ['load-balancer', 'api-gateway'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'perpetual',
          architectureRole: 'Open Source Service Mesh / Sidecar Proxy',
          architectureRoleKo: '오픈소스 서비스 메시 / 사이드카 프록시',
          recommendedFor: [
            'Open-source service mesh for microservices',
            'Envoy-based sidecar proxy with mTLS',
            'Community-driven service mesh without licensing cost',
          ],
          recommendedForKo: [
            '마이크로서비스를 위한 오픈소스 서비스 메시',
            'mTLS를 갖춘 Envoy 기반 사이드카 프록시',
            '라이선스 비용 없는 커뮤니티 주도 서비스 메시',
          ],
          supportedProtocols: [
            'HTTP/HTTPS',
            'HTTP/2',
            'gRPC',
            'TCP',
            'mTLS',
          ],
          haFeatures: [
            'Multi-zone deployment',
            'Circuit breaker policies',
            'Health checks',
            'Locality-aware routing',
          ],
          securityCapabilities: [
            'Mutual TLS (mTLS)',
            'Traffic policies',
            'Zero-trust identity',
          ],
          specs: {
            'Foundation': 'CNCF graduated project',
            'Data Plane': 'Envoy proxy sidecar',
            'Platforms': 'Kubernetes, Universal (VMs)',
            'Observability': 'Prometheus, Grafana, Jaeger',
            'Configuration': 'CRDs (K8s) or REST API (Universal)',
          },
          operationalComplexity: 'moderate',
          ecosystemMaturity: 'stable',
          children: [],
        },
      ],
    },

    // =====================================================================
    // 4. Kubernetes Infrastructure
    // =====================================================================
    {
      nodeId: 'kong-kubernetes',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Kubernetes Infrastructure',
      nameKo: 'Kubernetes 인프라',
      description:
        'Kubernetes-native API gateway and ingress solutions including ingress controller, Gateway API implementation, and Kubernetes operator for automated lifecycle management',
      descriptionKo:
        '인그레스 컨트롤러, Gateway API 구현 및 자동화된 라이프사이클 관리를 위한 Kubernetes 오퍼레이터를 포함하는 Kubernetes 네이티브 API 게이트웨이 및 인그레스 솔루션',
      sourceUrl: 'https://konghq.com/products/kong-ingress-controller',
      infraNodeTypes: ['load-balancer', 'api-gateway'],
      children: [
        // -----------------------------------------------------------------
        // Kong Ingress Controller
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-ingress-controller',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Ingress Controller',
          nameKo: 'Kong 인그레스 컨트롤러',
          description:
            'Kubernetes-native ingress controller providing declarative API gateway configuration, traffic management, authentication, and plugin extensibility as a unified entry point for external cluster traffic',
          descriptionKo:
            '선언적 API 게이트웨이 구성, 트래픽 관리, 인증 및 플러그인 확장성을 제공하는 Kubernetes 네이티브 인그레스 컨트롤러로 외부 클러스터 트래픽의 통합 진입점',
          sourceUrl: 'https://konghq.com/products/kong-ingress-controller',
          infraNodeTypes: ['load-balancer', 'api-gateway'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'perpetual',
          architectureRole: 'Kubernetes Ingress / API Gateway',
          architectureRoleKo: 'Kubernetes 인그레스 / API 게이트웨이',
          recommendedFor: [
            'Kubernetes ingress traffic management with API gateway features',
            'Declarative API gateway configuration in K8s clusters',
            'Multi-cluster API management (700+ clusters supported)',
            'Plugin-based authentication and security at ingress layer',
          ],
          recommendedForKo: [
            'API 게이트웨이 기능을 갖춘 Kubernetes 인그레스 트래픽 관리',
            'K8s 클러스터에서의 선언적 API 게이트웨이 구성',
            '멀티 클러스터 API 관리(700+ 클러스터 지원)',
            '인그레스 레이어에서의 플러그인 기반 인증 및 보안',
          ],
          supportedProtocols: [
            'HTTP/HTTPS',
            'HTTP/2',
            'gRPC',
            'TCP',
            'UDP',
            'WebSocket',
          ],
          haFeatures: [
            'Horizontal scaling with multiple replicas',
            'High availability with minimum service disruption',
            'Kubernetes-native health probes',
            'cert-manager integration for certificate automation',
          ],
          securityCapabilities: [
            'Kong Gateway plugin ecosystem at ingress',
            'TLS termination',
            'Authentication plugins (JWT, OAuth, OIDC)',
            'Rate limiting and IP restriction',
          ],
          specs: {
            'Type': 'Kubernetes Ingress Controller',
            'Deployment': 'Helm chart, YAML manifests',
            'K8s API': 'Ingress, Gateway API resources',
            'Configuration': 'CRDs (KongPlugin, KongConsumer, etc.)',
            'Scaling': 'Horizontal pod autoscaling',
            'Integration': 'cert-manager, Prometheus, Konnect',
          },
          operationalComplexity: 'moderate',
          ecosystemMaturity: 'mature',
          children: [],
        },
        // -----------------------------------------------------------------
        // Kong Gateway Operator
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-gateway-operator',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Gateway Operator',
          nameKo: 'Kong Gateway 오퍼레이터',
          description:
            'Kubernetes operator automating deployment, scaling, certificate rotation, and lifecycle management of Kong Gateway instances with Gateway API support and Konnect integration',
          descriptionKo:
            'Gateway API 지원 및 Konnect 통합을 통해 Kong Gateway 인스턴스의 배포, 스케일링, 인증서 순환 및 라이프사이클 관리를 자동화하는 Kubernetes 오퍼레이터',
          sourceUrl: 'https://konghq.com/products/kong-gateway-operator',
          infraNodeTypes: ['load-balancer', 'api-gateway'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'perpetual',
          architectureRole: 'Kubernetes Operator / Gateway Lifecycle Automation',
          architectureRoleKo: 'Kubernetes 오퍼레이터 / 게이트웨이 라이프사이클 자동화',
          recommendedFor: [
            'Automated Kong Gateway deployment and lifecycle management',
            'Kubernetes Gateway API-based traffic management',
            'Certificate rotation automation with cert-manager',
          ],
          recommendedForKo: [
            '자동화된 Kong Gateway 배포 및 라이프사이클 관리',
            'Kubernetes Gateway API 기반 트래픽 관리',
            'cert-manager를 통한 인증서 순환 자동화',
          ],
          specs: {
            'Type': 'Kubernetes Operator',
            'Gateway API': 'CNCF Gateway API v1.0+ support',
            'Autoscaling': 'Latency-based and resource-based HPA',
            'Certificates': 'Automatic rotation via cert-manager',
            'Modes': 'Standalone, Ingress, Konnect hybrid',
            'Observability': 'K8s-native metrics, Konnect Debugger',
          },
          operationalComplexity: 'moderate',
          ecosystemMaturity: 'stable',
          children: [],
        },
      ],
    },

    // =====================================================================
    // 5. Developer Tools
    // =====================================================================
    {
      nodeId: 'kong-developer-tools',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Developer Tools',
      nameKo: '개발자 도구',
      description:
        'API development, testing, and debugging tools including API design with OpenAPI, automated testing, mocking, MCP client, and collaborative workflows for distributed development teams',
      descriptionKo:
        'OpenAPI를 통한 API 설계, 자동화된 테스트, 모킹, MCP 클라이언트 및 분산 개발 팀을 위한 협업 워크플로우를 포함하는 API 개발, 테스트 및 디버깅 도구',
      sourceUrl: 'https://konghq.com/products/insomnia',
      infraNodeTypes: ['api-gateway'],
      children: [
        // -----------------------------------------------------------------
        // Kong Insomnia
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-insomnia',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Insomnia',
          nameKo: 'Kong Insomnia',
          description:
            'Collaborative API development platform for designing, testing, debugging, and mocking APIs with OpenAPI support, Git sync, pre/post-response scripting, and MCP server testing',
          descriptionKo:
            'OpenAPI 지원, Git 동기화, 사전/사후 응답 스크립팅 및 MCP 서버 테스트를 갖춘 API 설계, 테스트, 디버깅 및 모킹을 위한 협업 API 개발 플랫폼',
          sourceUrl: 'https://konghq.com/products/insomnia',
          infraNodeTypes: ['api-gateway'],
          lifecycle: 'active',
          formFactor: 'cloud',
          licensingModel: 'subscription',
          architectureRole: 'API Development / Testing Tool',
          architectureRoleKo: 'API 개발 / 테스트 도구',
          recommendedFor: [
            'API design-first development with OpenAPI',
            'API testing and automated collection runs',
            'API mocking for frontend-backend parallel development',
            'MCP server testing and debugging',
          ],
          recommendedForKo: [
            'OpenAPI를 활용한 API 설계 우선 개발',
            'API 테스트 및 자동화된 컬렉션 실행',
            '프론트엔드-백엔드 병렬 개발을 위한 API 모킹',
            'MCP 서버 테스트 및 디버깅',
          ],
          supportedProtocols: [
            'REST',
            'GraphQL',
            'gRPC',
            'WebSocket',
          ],
          specs: {
            'Type': 'API development platform',
            'API Design': 'OpenAPI editor with preview',
            'Testing': 'Automated collection runs with scripting',
            'Mocking': 'Dynamic mocks from OpenAPI, collections, or AI',
            'Storage': 'Local, Git, or Cloud sync (E2E encrypted)',
            'CLI': 'Inso CLI for CI/CD automation',
            'Plugins': '350+ community plugins',
            'Compliance': 'SOC 2 Type 2',
          },
          operationalComplexity: 'simple',
          ecosystemMaturity: 'mature',
          children: [],
        },
        // -----------------------------------------------------------------
        // Kong decK CLI
        // -----------------------------------------------------------------
        {
          nodeId: 'kong-deck-cli',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'decK CLI',
          nameKo: 'decK CLI',
          description:
            'Declarative configuration management CLI tool for Kong Gateway enabling GitOps-style infrastructure-as-code, diff-based sync, and CI/CD pipeline integration',
          descriptionKo:
            'GitOps 스타일의 IaC, diff 기반 동기화 및 CI/CD 파이프라인 통합을 가능하게 하는 Kong Gateway용 선언적 구성 관리 CLI 도구',
          sourceUrl: 'https://docs.konghq.com/deck/latest/',
          infraNodeTypes: ['api-gateway'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'perpetual',
          architectureRole: 'API Gateway Configuration Management / IaC',
          architectureRoleKo: 'API 게이트웨이 구성 관리 / IaC',
          recommendedFor: [
            'GitOps-based Kong Gateway configuration management',
            'CI/CD pipeline integration for API gateway changes',
            'Declarative infrastructure-as-code for Kong',
          ],
          recommendedForKo: [
            'GitOps 기반 Kong Gateway 구성 관리',
            'API 게이트웨이 변경을 위한 CI/CD 파이프라인 통합',
            'Kong을 위한 선언적 IaC',
          ],
          specs: {
            'Type': 'CLI configuration management tool',
            'Operations': 'Sync, diff, dump, ping, validate',
            'Format': 'Declarative YAML configuration',
            'Integration': 'Git, CI/CD pipelines, Konnect',
            'License': 'Apache 2.0 (open source)',
          },
          operationalComplexity: 'simple',
          ecosystemMaturity: 'mature',
          children: [],
        },
      ],
    },

    // =====================================================================
    // 6. Event Gateway
    // =====================================================================
    {
      nodeId: 'kong-event-processing',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Event Gateway',
      nameKo: '이벤트 게이트웨이',
      description:
        'Event-driven architecture gateway for managing asynchronous communication patterns with Kafka event streaming integration, event routing, and governance',
      descriptionKo:
        'Kafka 이벤트 스트리밍 통합, 이벤트 라우팅 및 거버넌스를 갖춘 비동기 통신 패턴 관리를 위한 이벤트 기반 아키텍처 게이트웨이',
      sourceUrl: 'https://konghq.com/products',
      infraNodeTypes: ['api-gateway', 'kafka'],
      children: [
        {
          nodeId: 'kong-event-gateway',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Kong Event Gateway',
          nameKo: 'Kong 이벤트 게이트웨이',
          description:
            'Event-driven architecture gateway managing Kafka event streaming integration with event routing, schema validation, and governance for asynchronous microservices communication',
          descriptionKo:
            '비동기 마이크로서비스 통신을 위한 이벤트 라우팅, 스키마 검증 및 거버넌스를 갖춘 Kafka 이벤트 스트리밍 통합을 관리하는 이벤트 기반 아키텍처 게이트웨이',
          sourceUrl: 'https://konghq.com/products',
          infraNodeTypes: ['api-gateway', 'kafka'],
          lifecycle: 'active',
          formFactor: 'container',
          licensingModel: 'subscription',
          architectureRole: 'Event Gateway / Async API Management',
          architectureRoleKo: '이벤트 게이트웨이 / 비동기 API 관리',
          recommendedFor: [
            'Kafka event streaming governance and routing',
            'Event-driven architecture API management',
            'Asynchronous microservices communication management',
          ],
          recommendedForKo: [
            'Kafka 이벤트 스트리밍 거버넌스 및 라우팅',
            '이벤트 기반 아키텍처 API 관리',
            '비동기 마이크로서비스 통신 관리',
          ],
          supportedProtocols: [
            'Kafka',
            'HTTP/HTTPS',
            'WebSocket',
          ],
          specs: {
            'Type': 'Event-driven architecture gateway',
            'Event Streaming': 'Apache Kafka integration',
            'Patterns': 'Pub/Sub, Event sourcing, CQRS',
            'Governance': 'Schema validation, event routing policies',
            'Integration': 'Kong Konnect control plane',
          },
          operationalComplexity: 'moderate',
          ecosystemMaturity: 'emerging',
          children: [],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Compute and fix stats after catalog is defined
// ---------------------------------------------------------------------------

import { computeStats } from '../queryHelpers';

const computed = computeStats(kongCatalog.products);
kongCatalog.stats = computed;
