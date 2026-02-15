/**
 * Vendor Mappings — Compute & Cloud Infrastructure Components
 *
 * Covers 10 Compute components:
 *   web-server, app-server, db-server, container, vm,
 *   kubernetes, kafka, rabbitmq, prometheus, grafana
 *
 * Covers 4 Cloud components:
 *   aws-vpc, azure-vnet, gcp-network, private-cloud
 *
 * Last verified: 2026-02-14
 */

import type { ComponentVendorMap } from './types';

export const computeVendorMappings: ComponentVendorMap[] = [
  // =========================================================================
  // 1. web-server
  // =========================================================================
  {
    componentId: 'web-server',
    category: 'compute',
    cloud: [
      {
        id: 'VM-web-server-aws-001',
        provider: 'aws',
        serviceName: 'Amazon EC2',
        serviceNameKo: '아마존 EC2',
        serviceTier: 'IaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Broadest instance type selection with auto-scaling groups and per-second billing',
        differentiatorKo:
          '가장 폭넓은 인스턴스 유형 선택지, Auto Scaling 그룹 및 초 단위 과금',
        docUrl: 'https://docs.aws.amazon.com/ec2/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-web-server-aws-002',
        provider: 'aws',
        serviceName: 'AWS Elastic Beanstalk',
        serviceNameKo: 'AWS Elastic Beanstalk',
        serviceTier: 'PaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed PaaS with auto-provisioning, load balancing, and 99.99% uptime SLA',
        differentiatorKo:
          '자동 프로비저닝, 로드 밸런싱, 99.99% 가동률 SLA를 제공하는 관리형 PaaS',
        docUrl: 'https://docs.aws.amazon.com/elasticbeanstalk/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-web-server-azure-001',
        provider: 'azure',
        serviceName: 'Azure App Service',
        serviceNameKo: 'Azure 앱 서비스',
        serviceTier: 'PaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed PaaS with built-in CI/CD, autoscale, and enterprise Active Directory integration',
        differentiatorKo:
          '기본 CI/CD, 자동 확장, 엔터프라이즈 Active Directory 통합을 갖춘 완전 관리형 PaaS',
        docUrl: 'https://learn.microsoft.com/en-us/azure/app-service/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-web-server-gcp-001',
        provider: 'gcp',
        serviceName: 'Google App Engine',
        serviceNameKo: 'Google 앱 엔진',
        serviceTier: 'PaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Serverless PaaS with automatic scaling to zero and broad language/runtime support',
        differentiatorKo:
          '제로 스케일링이 가능한 서버리스 PaaS, 다양한 언어/런타임 지원',
        docUrl: 'https://cloud.google.com/appengine/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-web-server-managed-001',
        vendorName: 'Heroku',
        productName: 'Heroku Dynos',
        productNameKo: 'Heroku 다이노',
        pricingModel: 'subscription',
        differentiator:
          'Developer-friendly PaaS with one-command deployment, mature add-on ecosystem',
        differentiatorKo:
          '원커맨드 배포와 성숙한 애드온 생태계를 갖춘 개발자 친화적 PaaS',
        docUrl: 'https://devcenter.heroku.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-web-server-managed-002',
        vendorName: 'Render',
        productName: 'Render Web Services',
        productNameKo: 'Render 웹 서비스',
        pricingModel: 'freemium',
        differentiator:
          'Modern PaaS with generous free tier, auto-deploy from Git, and simple flat pricing',
        differentiatorKo:
          '넉넉한 무료 티어, Git 자동 배포, 단순 정액 요금을 제공하는 모던 PaaS',
        docUrl: 'https://docs.render.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-web-server-managed-003',
        vendorName: 'DigitalOcean',
        productName: 'DigitalOcean App Platform',
        productNameKo: 'DigitalOcean 앱 플랫폼',
        pricingModel: 'pay-per-use',
        differentiator:
          'Simple PaaS with VPC integration, managed databases, and predictable pricing from $5/mo',
        differentiatorKo:
          'VPC 통합, 관리형 데이터베이스, $5/월부터 예측 가능한 요금의 단순 PaaS',
        docUrl: 'https://docs.digitalocean.com/products/app-platform/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-web-server-oss-001',
        projectName: 'Nginx',
        projectNameKo: 'Nginx 웹 서버',
        license: 'BSD-2-Clause',
        description:
          'High-performance HTTP server, reverse proxy, and load balancer handling millions of concurrent connections',
        descriptionKo:
          '수백만 동시 연결을 처리하는 고성능 HTTP 서버, 리버스 프록시, 로드 밸런서',
        docUrl: 'https://nginx.org/en/docs/',
        githubUrl: 'https://github.com/nginx/nginx',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-web-server-oss-002',
        projectName: 'Apache HTTP Server',
        projectNameKo: 'Apache HTTP 서버',
        license: 'Apache-2.0',
        description:
          'Battle-tested HTTP server with rich module ecosystem and .htaccess per-directory configuration',
        descriptionKo:
          '풍부한 모듈 생태계와 .htaccess 디렉터리별 설정을 갖춘 검증된 HTTP 서버',
        docUrl: 'https://httpd.apache.org/docs/',
        githubUrl: 'https://github.com/apache/httpd',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-web-server-onprem-001',
        vendorName: 'Dell',
        productName: 'Dell PowerEdge R760',
        productNameKo: 'Dell PowerEdge R760 랙 서버',
        modelSeries: 'PowerEdge R-Series',
        productTier: 'enterprise',
        targetUseCase: 'High-density rack server for web tier workloads with modular design',
        targetUseCaseKo: '모듈형 설계의 고밀도 랙 서버, 웹 티어 워크로드용',
        keySpecs: '2x Intel Xeon 4th/5th Gen, up to 4TB DDR5, 12x NVMe',
        lifecycleStatus: 'active',
        productUrl: 'https://www.dell.com/en-us/shop/dell-poweredge-servers/sf/poweredge',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-web-server-onprem-002',
        vendorName: 'HPE',
        productName: 'HPE ProLiant DL380 Gen11',
        productNameKo: 'HPE ProLiant DL380 Gen11 서버',
        modelSeries: 'ProLiant DL Series',
        productTier: 'enterprise',
        targetUseCase: 'Industry-standard 2U server with best-in-class iLO remote management',
        targetUseCaseKo: '업계 표준 2U 서버, 최고 수준의 iLO 원격 관리 기능',
        keySpecs: '2x Intel Xeon 4th/5th Gen, up to 4TB DDR5, HPE iLO 6',
        lifecycleStatus: 'active',
        productUrl: 'https://www.hpe.com/us/en/servers/proliant-dl-servers.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 2. app-server
  // =========================================================================
  {
    componentId: 'app-server',
    category: 'compute',
    cloud: [
      {
        id: 'VM-app-server-aws-001',
        provider: 'aws',
        serviceName: 'AWS App Runner',
        serviceNameKo: 'AWS 앱 러너',
        serviceTier: 'PaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed container app service with automatic scaling, built-in load balancing, and TLS',
        differentiatorKo:
          '자동 스케일링, 내장 로드 밸런싱, TLS를 갖춘 완전 관리형 컨테이너 앱 서비스',
        docUrl: 'https://docs.aws.amazon.com/apprunner/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-app-server-azure-001',
        provider: 'azure',
        serviceName: 'Azure App Service',
        serviceNameKo: 'Azure 앱 서비스',
        serviceTier: 'PaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Enterprise PaaS tightly integrated with Azure DevOps, Active Directory, and hybrid connections',
        differentiatorKo:
          'Azure DevOps, Active Directory, 하이브리드 연결과 긴밀히 통합된 엔터프라이즈 PaaS',
        docUrl: 'https://learn.microsoft.com/en-us/azure/app-service/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-app-server-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Run',
        serviceNameKo: 'Google Cloud Run',
        serviceTier: 'Serverless',
        pricingModel: 'pay-per-use',
        differentiator:
          'Serverless container platform billed only while processing requests, with scale-to-zero',
        differentiatorKo:
          '요청 처리 시에만 과금되는 서버리스 컨테이너 플랫폼, 제로 스케일링 지원',
        docUrl: 'https://cloud.google.com/run/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-app-server-managed-001',
        vendorName: 'Railway',
        productName: 'Railway',
        productNameKo: 'Railway 앱 플랫폼',
        pricingModel: 'pay-per-use',
        differentiator:
          'Modern PaaS with usage-based pricing, native multi-region, and instant Git deploys',
        differentiatorKo:
          '사용량 기반 과금, 네이티브 멀티 리전, 즉시 Git 배포를 제공하는 모던 PaaS',
        docUrl: 'https://docs.railway.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-app-server-managed-002',
        vendorName: 'Heroku',
        productName: 'Heroku',
        productNameKo: 'Heroku',
        pricingModel: 'subscription',
        differentiator:
          'Pioneer PaaS with mature add-on marketplace, one-click scaling, and extensive buildpack support',
        differentiatorKo:
          '성숙한 애드온 마켓플레이스, 원클릭 스케일링, 광범위한 빌드팩을 갖춘 선구적 PaaS',
        docUrl: 'https://devcenter.heroku.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-app-server-managed-003',
        vendorName: 'DigitalOcean',
        productName: 'DigitalOcean App Platform',
        productNameKo: 'DigitalOcean 앱 플랫폼',
        pricingModel: 'pay-per-use',
        differentiator:
          'Affordable PaaS with built-in VPC, managed databases, and straightforward scaling',
        differentiatorKo:
          '내장 VPC, 관리형 데이터베이스, 간편한 스케일링을 제공하는 합리적 요금의 PaaS',
        docUrl: 'https://docs.digitalocean.com/products/app-platform/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-app-server-oss-001',
        projectName: 'Apache Tomcat',
        projectNameKo: 'Apache Tomcat 앱 서버',
        license: 'Apache-2.0',
        description:
          'De-facto standard Java servlet container and web application server',
        descriptionKo:
          '사실상 표준인 Java 서블릿 컨테이너 및 웹 애플리케이션 서버',
        docUrl: 'https://tomcat.apache.org/tomcat-10.1-doc/',
        githubUrl: 'https://github.com/apache/tomcat',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-app-server-oss-002',
        projectName: 'Node.js',
        projectNameKo: 'Node.js 런타임',
        license: 'MIT',
        description:
          'Event-driven JavaScript runtime built on V8 engine for scalable server-side applications',
        descriptionKo:
          'V8 엔진 기반의 이벤트 기반 JavaScript 런타임, 확장 가능한 서버 앱용',
        docUrl: 'https://nodejs.org/en/docs',
        githubUrl: 'https://github.com/nodejs/node',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-app-server-onprem-001',
        vendorName: 'Dell',
        productName: 'Dell PowerEdge R660',
        productNameKo: 'Dell PowerEdge R660 랙 서버',
        modelSeries: 'PowerEdge R-Series',
        productTier: 'enterprise',
        targetUseCase: 'Compact 1U rack server optimized for dense application workloads',
        targetUseCaseKo: '밀집 애플리케이션 워크로드에 최적화된 컴팩트 1U 랙 서버',
        keySpecs: '2x Intel Xeon 4th/5th Gen, up to 2TB DDR5, 10x 2.5" drives',
        lifecycleStatus: 'active',
        productUrl: 'https://www.dell.com/en-us/shop/dell-poweredge-servers/sf/poweredge',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-app-server-onprem-002',
        vendorName: 'Lenovo',
        productName: 'Lenovo ThinkSystem SR650 V3',
        productNameKo: 'Lenovo ThinkSystem SR650 V3 서버',
        modelSeries: 'ThinkSystem SR Series',
        productTier: 'mid-range',
        targetUseCase:
          'Cost-effective 2U general-purpose server for app tier workloads',
        targetUseCaseKo: '앱 티어 워크로드를 위한 비용 효율적 범용 2U 서버',
        keySpecs: '2x Intel Xeon 4th Gen, up to 4TB DDR5, Lenovo XClarity',
        lifecycleStatus: 'active',
        productUrl: 'https://www.lenovo.com/us/en/servers-storage/servers/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-app-server-onprem-003',
        vendorName: 'Red Hat',
        productName: 'Red Hat JBoss EAP',
        productNameKo: 'Red Hat JBoss EAP 앱 서버',
        modelSeries: 'JBoss Enterprise Application Platform',
        productTier: 'enterprise',
        targetUseCase: 'Enterprise Java application server with Red Hat support and Jakarta EE compliance',
        targetUseCaseKo: 'Red Hat 지원 및 Jakarta EE 호환의 엔터프라이즈 Java 앱 서버',
        lifecycleStatus: 'active',
        productUrl: 'https://www.redhat.com/en/technologies/jboss-middleware/application-platform',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 3. db-server
  // =========================================================================
  {
    componentId: 'db-server',
    category: 'compute',
    cloud: [
      {
        id: 'VM-db-server-aws-001',
        provider: 'aws',
        serviceName: 'Amazon RDS',
        serviceNameKo: '아마존 RDS',
        serviceTier: 'Managed DB',
        pricingModel: 'pay-per-use',
        differentiator:
          'Multi-AZ managed relational DB supporting PostgreSQL, MySQL, MariaDB, Oracle, SQL Server with automated backups',
        differentiatorKo:
          'PostgreSQL, MySQL, MariaDB, Oracle, SQL Server를 지원하는 Multi-AZ 관리형 RDB, 자동 백업',
        docUrl: 'https://docs.aws.amazon.com/rds/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-db-server-azure-001',
        provider: 'azure',
        serviceName: 'Azure SQL Database',
        serviceNameKo: 'Azure SQL 데이터베이스',
        serviceTier: 'Managed DB',
        pricingModel: 'pay-per-use',
        differentiator:
          'Intelligent managed SQL Server with built-in AI tuning, cross-region read replicas, and elastic pools',
        differentiatorKo:
          '내장 AI 튜닝, 교차 리전 읽기 복제본, 탄력적 풀을 갖춘 지능형 관리형 SQL Server',
        docUrl: 'https://learn.microsoft.com/en-us/azure/azure-sql/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-db-server-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud SQL',
        serviceNameKo: 'Google Cloud SQL',
        serviceTier: 'Managed DB',
        pricingModel: 'pay-per-use',
        differentiator:
          'Flexible managed DB with fine-grained CPU/RAM selection, automatic storage increases, and competitive pricing',
        differentiatorKo:
          '세밀한 CPU/RAM 선택, 자동 스토리지 확장, 경쟁력 있는 가격의 유연한 관리형 DB',
        docUrl: 'https://cloud.google.com/sql/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-db-server-managed-001',
        vendorName: 'PlanetScale',
        productName: 'PlanetScale',
        productNameKo: 'PlanetScale 관리형 데이터베이스',
        pricingModel: 'subscription',
        differentiator:
          'MySQL/PostgreSQL platform built on Vitess with zero-downtime schema migrations and branching',
        differentiatorKo:
          'Vitess 기반 MySQL/PostgreSQL, 무중단 스키마 마이그레이션 및 브랜칭 지원',
        docUrl: 'https://planetscale.com/docs',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-db-server-managed-002',
        vendorName: 'Supabase',
        productName: 'Supabase Database',
        productNameKo: 'Supabase 데이터베이스',
        pricingModel: 'freemium',
        differentiator:
          'Open-source Firebase alternative with managed PostgreSQL, realtime subscriptions, auth, and storage',
        differentiatorKo:
          '관리형 PostgreSQL, 실시간 구독, 인증, 스토리지를 제공하는 오픈소스 Firebase 대안',
        docUrl: 'https://supabase.com/docs',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-db-server-managed-003',
        vendorName: 'CockroachDB',
        productName: 'CockroachDB Serverless',
        productNameKo: 'CockroachDB 서버리스',
        pricingModel: 'pay-per-use',
        differentiator:
          'Distributed SQL with automatic sharding, multi-region, and PCI-DSS/HIPAA/SOC2 compliance',
        differentiatorKo:
          '자동 샤딩, 멀티 리전, PCI-DSS/HIPAA/SOC2 컴플라이언스를 갖춘 분산 SQL',
        docUrl: 'https://www.cockroachlabs.com/docs/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-db-server-oss-001',
        projectName: 'PostgreSQL',
        projectNameKo: 'PostgreSQL',
        license: 'PostgreSQL License',
        description:
          'Advanced open-source relational database known for extensibility, JSONB support, and standards compliance',
        descriptionKo:
          '확장성, JSONB 지원, 표준 준수로 유명한 고급 오픈소스 관계형 데이터베이스',
        docUrl: 'https://www.postgresql.org/docs/',
        githubUrl: 'https://github.com/postgres/postgres',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-db-server-oss-002',
        projectName: 'MySQL',
        projectNameKo: 'MySQL',
        license: 'GPL-2.0',
        description:
          'Most widely deployed open-source RDBMS with proven performance and massive community',
        descriptionKo:
          '입증된 성능과 거대한 커뮤니티를 가진 가장 널리 배포된 오픈소스 RDBMS',
        docUrl: 'https://dev.mysql.com/doc/',
        githubUrl: 'https://github.com/mysql/mysql-server',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-db-server-onprem-001',
        vendorName: 'Oracle',
        productName: 'Oracle Database Enterprise Edition',
        productNameKo: 'Oracle Database 엔터프라이즈 에디션',
        modelSeries: 'Oracle Database 23ai',
        productTier: 'enterprise',
        targetUseCase: 'Mission-critical OLTP/OLAP with RAC clustering, partitioning, and advanced security',
        targetUseCaseKo: 'RAC 클러스터링, 파티셔닝, 고급 보안을 갖춘 미션 크리티컬 OLTP/OLAP',
        lifecycleStatus: 'active',
        productUrl: 'https://www.oracle.com/database/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-db-server-onprem-002',
        vendorName: 'Microsoft',
        productName: 'Microsoft SQL Server',
        productNameKo: 'Microsoft SQL Server',
        modelSeries: 'SQL Server 2022',
        productTier: 'enterprise',
        targetUseCase: 'Enterprise RDBMS with deep Windows/Azure integration and BI capabilities',
        targetUseCaseKo: 'Windows/Azure 긴밀 통합 및 BI 기능을 갖춘 엔터프라이즈 RDBMS',
        lifecycleStatus: 'active',
        productUrl: 'https://www.microsoft.com/en-us/sql-server/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-db-server-onprem-003',
        vendorName: 'Dell',
        productName: 'Dell PowerEdge R760 (DB Optimized)',
        productNameKo: 'Dell PowerEdge R760 (DB 최적화)',
        modelSeries: 'PowerEdge R-Series',
        productTier: 'enterprise',
        targetUseCase: 'Database-optimized server with high memory density and NVMe storage',
        targetUseCaseKo: '고밀도 메모리와 NVMe 스토리지를 갖춘 데이터베이스 최적화 서버',
        keySpecs: '2x Intel Xeon, up to 4TB DDR5, 24x NVMe SSD bays',
        lifecycleStatus: 'active',
        productUrl: 'https://www.dell.com/en-us/shop/dell-poweredge-servers/sf/poweredge',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 4. container
  // =========================================================================
  {
    componentId: 'container',
    category: 'compute',
    cloud: [
      {
        id: 'VM-container-aws-001',
        provider: 'aws',
        serviceName: 'Amazon ECS with Fargate',
        serviceNameKo: '아마존 ECS (Fargate)',
        serviceTier: 'Serverless Container',
        pricingModel: 'pay-per-use',
        differentiator:
          'Serverless container orchestration with per-second billing, deep AWS integration, and VPC networking',
        differentiatorKo:
          '초 단위 과금, 깊은 AWS 통합, VPC 네트워킹을 갖춘 서버리스 컨테이너 오케스트레이션',
        docUrl: 'https://docs.aws.amazon.com/ecs/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-container-azure-001',
        provider: 'azure',
        serviceName: 'Azure Container Instances',
        serviceNameKo: 'Azure 컨테이너 인스턴스',
        serviceTier: 'Serverless Container',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fastest container startup with no orchestration overhead, pay-per-second billing',
        differentiatorKo:
          '오케스트레이션 오버헤드 없이 가장 빠른 컨테이너 시작, 초 단위 과금',
        docUrl: 'https://learn.microsoft.com/en-us/azure/container-instances/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-container-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Run',
        serviceNameKo: 'Google Cloud Run',
        serviceTier: 'Serverless Container',
        pricingModel: 'pay-per-use',
        differentiator:
          'Scale-to-zero serverless containers billed only during request processing, broadest language support',
        differentiatorKo:
          '요청 처리 시에만 과금, 제로 스케일링 서버리스 컨테이너, 가장 넓은 언어 지원',
        docUrl: 'https://cloud.google.com/run/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-container-managed-001',
        vendorName: 'DigitalOcean',
        productName: 'DigitalOcean App Platform (Containers)',
        productNameKo: 'DigitalOcean 앱 플랫폼 (컨테이너)',
        pricingModel: 'pay-per-use',
        differentiator:
          'Simple container hosting with Git-push deploys, free static sites, and VPC networking',
        differentiatorKo:
          'Git 푸시 배포, 무료 정적 사이트, VPC 네트워킹을 갖춘 간편 컨테이너 호스팅',
        docUrl: 'https://docs.digitalocean.com/products/app-platform/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-container-managed-002',
        vendorName: 'Render',
        productName: 'Render Private Services',
        productNameKo: 'Render 프라이빗 서비스',
        pricingModel: 'freemium',
        differentiator:
          'Zero-config container deploys with free tier, auto-TLS, and DDoS protection',
        differentiatorKo:
          '무료 티어, 자동 TLS, DDoS 보호를 갖춘 제로 설정 컨테이너 배포',
        docUrl: 'https://docs.render.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-container-oss-001',
        projectName: 'Docker',
        projectNameKo: 'Docker',
        license: 'Apache-2.0',
        description:
          'Industry-standard container platform for building, shipping, and running applications in isolated environments',
        descriptionKo:
          '격리된 환경에서 애플리케이션을 빌드, 배포, 실행하는 업계 표준 컨테이너 플랫폼',
        docUrl: 'https://docs.docker.com/',
        githubUrl: 'https://github.com/moby/moby',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-container-oss-002',
        projectName: 'Podman',
        projectNameKo: 'Podman',
        license: 'Apache-2.0',
        description:
          'Daemonless container engine compatible with Docker CLI, running containers as rootless by default',
        descriptionKo:
          '데몬 없이 동작하며 Docker CLI 호환, 기본 루트리스 실행을 지원하는 컨테이너 엔진',
        docUrl: 'https://podman.io/docs',
        githubUrl: 'https://github.com/containers/podman',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-container-onprem-001',
        vendorName: 'Red Hat',
        productName: 'Red Hat OpenShift Container Platform',
        productNameKo: 'Red Hat OpenShift 컨테이너 플랫폼',
        modelSeries: 'OpenShift 4.x',
        productTier: 'enterprise',
        targetUseCase: 'Enterprise Kubernetes with built-in CI/CD, registry, monitoring, and Red Hat support',
        targetUseCaseKo: '내장 CI/CD, 레지스트리, 모니터링, Red Hat 지원을 갖춘 엔터프라이즈 Kubernetes',
        lifecycleStatus: 'active',
        productUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-container-onprem-002',
        vendorName: 'VMware',
        productName: 'VMware Tanzu',
        productNameKo: 'VMware Tanzu',
        modelSeries: 'Tanzu Platform',
        productTier: 'enterprise',
        targetUseCase: 'Enterprise container platform integrated with vSphere for hybrid cloud workloads',
        targetUseCaseKo: 'vSphere와 통합된 엔터프라이즈 컨테이너 플랫폼, 하이브리드 클라우드 워크로드용',
        lifecycleStatus: 'active',
        productUrl: 'https://tanzu.vmware.com/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 5. vm
  // =========================================================================
  {
    componentId: 'vm',
    category: 'compute',
    cloud: [
      {
        id: 'VM-vm-aws-001',
        provider: 'aws',
        serviceName: 'Amazon EC2',
        serviceNameKo: '아마존 EC2',
        serviceTier: 'IaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Largest selection of instance families (700+), Nitro hypervisor, and Graviton ARM options',
        differentiatorKo:
          '700개 이상의 인스턴스 패밀리, Nitro 하이퍼바이저, Graviton ARM 옵션',
        docUrl: 'https://docs.aws.amazon.com/ec2/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vm-azure-001',
        provider: 'azure',
        serviceName: 'Azure Virtual Machines',
        serviceNameKo: 'Azure 가상 머신',
        serviceTier: 'IaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Seamless hybrid integration with Azure Arc, Active Directory, and Windows Server licensing benefits',
        differentiatorKo:
          'Azure Arc, Active Directory, Windows Server 라이선스 혜택과 원활한 하이브리드 통합',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-machines/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vm-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Compute Engine',
        serviceNameKo: 'Google Compute Engine',
        serviceTier: 'IaaS',
        pricingModel: 'pay-per-use',
        differentiator:
          'Custom machine types with per-second billing and automatic sustained use discounts (up to 30%)',
        differentiatorKo:
          '커스텀 머신 유형, 초 단위 과금, 자동 지속 사용 할인(최대 30%)',
        docUrl: 'https://cloud.google.com/compute/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-vm-managed-001',
        vendorName: 'DigitalOcean',
        productName: 'DigitalOcean Droplets',
        productNameKo: 'DigitalOcean 드롭릿',
        pricingModel: 'pay-per-use',
        differentiator:
          'Simple cloud VMs starting at $4/mo with predictable pricing and developer-friendly UX',
        differentiatorKo:
          '$4/월부터 예측 가능한 요금과 개발자 친화적 UX를 갖춘 단순 클라우드 VM',
        docUrl: 'https://docs.digitalocean.com/products/droplets/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vm-managed-002',
        vendorName: 'Vultr',
        productName: 'Vultr Cloud Compute',
        productNameKo: 'Vultr 클라우드 컴퓨트',
        pricingModel: 'pay-per-use',
        differentiator:
          'High-performance cloud VMs with bare-metal options across 32 global locations',
        differentiatorKo:
          '32개 글로벌 위치에 베어메탈 옵션을 갖춘 고성능 클라우드 VM',
        docUrl: 'https://www.vultr.com/docs/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-vm-oss-001',
        projectName: 'KVM (Kernel-based Virtual Machine)',
        projectNameKo: 'KVM (커널 기반 가상 머신)',
        license: 'GPL-2.0',
        description:
          'Linux kernel-integrated hypervisor providing full hardware virtualization with near-native performance',
        descriptionKo:
          '네이티브에 가까운 성능의 전체 하드웨어 가상화를 제공하는 리눅스 커널 통합 하이퍼바이저',
        docUrl: 'https://www.linux-kvm.org/page/Documents',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vm-oss-002',
        projectName: 'Proxmox VE',
        projectNameKo: 'Proxmox VE',
        license: 'AGPL-3.0',
        description:
          'Open-source server management platform combining KVM hypervisor and LXC containers with web UI',
        descriptionKo:
          'KVM 하이퍼바이저와 LXC 컨테이너를 웹 UI로 결합한 오픈소스 서버 관리 플랫폼',
        docUrl: 'https://pve.proxmox.com/wiki/Main_Page',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-vm-onprem-001',
        vendorName: 'Broadcom (VMware)',
        productName: 'VMware vSphere',
        productNameKo: 'VMware vSphere',
        modelSeries: 'vSphere 8',
        productTier: 'enterprise',
        targetUseCase: 'Enterprise virtualization with vMotion, DRS, HA, and vSAN integration',
        targetUseCaseKo: 'vMotion, DRS, HA, vSAN 통합을 갖춘 엔터프라이즈 가상화',
        lifecycleStatus: 'active',
        productUrl: 'https://www.vmware.com/products/vsphere.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vm-onprem-002',
        vendorName: 'Nutanix',
        productName: 'Nutanix AHV',
        productNameKo: 'Nutanix AHV 하이퍼바이저',
        modelSeries: 'Nutanix Cloud Platform',
        productTier: 'enterprise',
        targetUseCase: 'HCI-integrated hypervisor with one-click simplicity and no separate licensing cost',
        targetUseCaseKo: '원클릭 간편성과 별도 라이선스 비용이 없는 HCI 통합 하이퍼바이저',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nutanix.com/products/ahv',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-vm-onprem-003',
        vendorName: 'Microsoft',
        productName: 'Microsoft Hyper-V',
        productNameKo: 'Microsoft Hyper-V',
        modelSeries: 'Windows Server 2025',
        productTier: 'mid-range',
        targetUseCase:
          'Windows-integrated hypervisor bundled with Windows Server, ideal for Microsoft-centric environments',
        targetUseCaseKo:
          'Windows Server에 번들된 Windows 통합 하이퍼바이저, Microsoft 중심 환경에 이상적',
        lifecycleStatus: 'active',
        productUrl:
          'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-technology-overview',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 6. kubernetes
  // =========================================================================
  {
    componentId: 'kubernetes',
    category: 'compute',
    cloud: [
      {
        id: 'VM-kubernetes-aws-001',
        provider: 'aws',
        serviceName: 'Amazon EKS',
        serviceNameKo: '아마존 EKS',
        serviceTier: 'Managed Kubernetes',
        pricingModel: 'pay-per-use',
        differentiator:
          'Most widely adopted managed K8s with advanced VPC networking, EFA support, and deep AWS service integration',
        differentiatorKo:
          '가장 널리 채택된 관리형 K8s, 고급 VPC 네트워킹, EFA 지원, 깊은 AWS 서비스 통합',
        docUrl: 'https://docs.aws.amazon.com/eks/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kubernetes-azure-001',
        provider: 'azure',
        serviceName: 'Azure Kubernetes Service (AKS)',
        serviceNameKo: 'Azure Kubernetes Service (AKS)',
        serviceTier: 'Managed Kubernetes',
        pricingModel: 'free-tier',
        differentiator:
          'Free control plane, supports up to 5,000 nodes, seamless Azure Portal management and AD integration',
        differentiatorKo:
          '무료 컨트롤 플레인, 최대 5,000노드, Azure Portal 관리 및 AD 통합',
        docUrl: 'https://learn.microsoft.com/en-us/azure/aks/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kubernetes-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Kubernetes Engine (GKE)',
        serviceNameKo: 'Google Kubernetes Engine (GKE)',
        serviceTier: 'Managed Kubernetes',
        pricingModel: 'free-tier',
        differentiator:
          'Free zonal clusters, auto-upgrades by default, up to 5,000 nodes, cheapest storage and egress',
        differentiatorKo:
          '무료 존 클러스터, 기본 자동 업그레이드, 최대 5,000노드, 가장 저렴한 스토리지/이그레스',
        docUrl: 'https://cloud.google.com/kubernetes-engine/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-kubernetes-managed-001',
        vendorName: 'Red Hat',
        productName: 'Red Hat OpenShift',
        productNameKo: 'Red Hat OpenShift',
        pricingModel: 'subscription',
        differentiator:
          'Enterprise K8s with built-in CI/CD, developer portal, service mesh, and multi-cloud support',
        differentiatorKo:
          '내장 CI/CD, 개발자 포털, 서비스 메시, 멀티 클라우드를 갖춘 엔터프라이즈 K8s',
        docUrl: 'https://docs.openshift.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kubernetes-managed-002',
        vendorName: 'SUSE',
        productName: 'Rancher by SUSE',
        productNameKo: 'SUSE Rancher',
        pricingModel: 'subscription',
        differentiator:
          'Multi-cluster K8s management across any infrastructure with unified dashboard and GitOps',
        differentiatorKo:
          '통합 대시보드와 GitOps를 통해 모든 인프라에서 멀티 클러스터 K8s 관리',
        docUrl: 'https://ranchermanager.docs.rancher.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kubernetes-managed-003',
        vendorName: 'DigitalOcean',
        productName: 'DigitalOcean Kubernetes (DOKS)',
        productNameKo: 'DigitalOcean Kubernetes (DOKS)',
        pricingModel: 'pay-per-use',
        differentiator:
          'Free control plane with simple pricing, pay only for worker nodes and load balancers',
        differentiatorKo:
          '무료 컨트롤 플레인, 워커 노드와 로드 밸런서에만 과금되는 단순 요금',
        docUrl: 'https://docs.digitalocean.com/products/kubernetes/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-kubernetes-oss-001',
        projectName: 'K3s',
        projectNameKo: 'K3s 경량 Kubernetes',
        license: 'Apache-2.0',
        description:
          'Lightweight certified Kubernetes distribution for edge, IoT, and resource-constrained environments',
        descriptionKo:
          '엣지, IoT, 리소스 제한 환경을 위한 경량 인증 Kubernetes 배포판',
        docUrl: 'https://docs.k3s.io/',
        githubUrl: 'https://github.com/k3s-io/k3s',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kubernetes-oss-002',
        projectName: 'minikube',
        projectNameKo: 'minikube',
        license: 'Apache-2.0',
        description:
          'Local Kubernetes cluster for development and testing, supporting multiple container runtimes',
        descriptionKo:
          '개발 및 테스트용 로컬 Kubernetes 클러스터, 다양한 컨테이너 런타임 지원',
        docUrl: 'https://minikube.sigs.k8s.io/docs/',
        githubUrl: 'https://github.com/kubernetes/minikube',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-kubernetes-onprem-001',
        vendorName: 'Red Hat',
        productName: 'Red Hat OpenShift Container Platform',
        productNameKo: 'Red Hat OpenShift 컨테이너 플랫폼',
        modelSeries: 'OpenShift 4.x',
        productTier: 'enterprise',
        targetUseCase:
          'Full-stack K8s for on-premise with operator framework, internal registry, and HA control plane',
        targetUseCaseKo:
          '운영자 프레임워크, 내부 레지스트리, HA 컨트롤 플레인을 갖춘 온프레미스 풀스택 K8s',
        lifecycleStatus: 'active',
        productUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kubernetes-onprem-002',
        vendorName: 'SUSE',
        productName: 'SUSE Rancher',
        productNameKo: 'SUSE Rancher',
        modelSeries: 'Rancher 2.x',
        productTier: 'enterprise',
        targetUseCase: 'Multi-cluster management for on-prem and hybrid K8s with centralized fleet management',
        targetUseCaseKo: '중앙 플릿 관리를 통한 온프레미스 및 하이브리드 K8s 멀티 클러스터 관리',
        lifecycleStatus: 'active',
        productUrl: 'https://www.rancher.com/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 7. kafka
  // =========================================================================
  {
    componentId: 'kafka',
    category: 'compute',
    cloud: [
      {
        id: 'VM-kafka-aws-001',
        provider: 'aws',
        serviceName: 'Amazon MSK',
        serviceNameKo: '아마존 MSK',
        serviceTier: 'Managed Streaming',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed Apache Kafka with deep AWS integration, MSK Serverless option, and VPC networking',
        differentiatorKo:
          '깊은 AWS 통합, MSK 서버리스 옵션, VPC 네트워킹을 갖춘 완전 관리형 Apache Kafka',
        docUrl: 'https://docs.aws.amazon.com/msk/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kafka-azure-001',
        provider: 'azure',
        serviceName: 'Azure Event Hubs (Kafka API)',
        serviceNameKo: 'Azure Event Hubs (Kafka API)',
        serviceTier: 'Managed Streaming',
        pricingModel: 'pay-per-use',
        differentiator:
          'Kafka-compatible endpoint on Azure-native event streaming with tight Azure ecosystem integration',
        differentiatorKo:
          'Azure 네이티브 이벤트 스트리밍에서 Kafka 호환 엔드포인트, Azure 생태계 긴밀 통합',
        docUrl: 'https://learn.microsoft.com/en-us/azure/event-hubs/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kafka-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Pub/Sub',
        serviceNameKo: 'Google Cloud Pub/Sub',
        serviceTier: 'Managed Messaging',
        pricingModel: 'pay-per-use',
        differentiator:
          'Serverless global messaging with automatic scaling, at-least-once delivery, and Dataflow integration',
        differentiatorKo:
          '자동 확장, 최소 1회 전달, Dataflow 통합을 갖춘 서버리스 글로벌 메시징',
        docUrl: 'https://cloud.google.com/pubsub/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-kafka-managed-001',
        vendorName: 'Confluent',
        productName: 'Confluent Cloud',
        productNameKo: 'Confluent Cloud',
        pricingModel: 'pay-per-use',
        differentiator:
          'Enterprise Kafka platform by original creators with ksqlDB, Schema Registry, 100+ connectors, 99.99% SLA',
        differentiatorKo:
          '원 창시자의 엔터프라이즈 Kafka 플랫폼, ksqlDB, 스키마 레지스트리, 100개 이상 커넥터, 99.99% SLA',
        docUrl: 'https://docs.confluent.io/cloud/current/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kafka-managed-002',
        vendorName: 'Redpanda',
        productName: 'Redpanda Cloud',
        productNameKo: 'Redpanda Cloud',
        pricingModel: 'pay-per-use',
        differentiator:
          'Kafka-compatible C++ streaming platform with no JVM/ZooKeeper, ~46% cheaper than Confluent Standard',
        differentiatorKo:
          'JVM/ZooKeeper 없는 Kafka 호환 C++ 스트리밍, Confluent Standard 대비 약 46% 저렴',
        docUrl: 'https://docs.redpanda.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-kafka-oss-001',
        projectName: 'Apache Kafka',
        projectNameKo: 'Apache Kafka',
        license: 'Apache-2.0',
        description:
          'Distributed event streaming platform capable of handling trillions of events per day with KRaft mode',
        descriptionKo:
          'KRaft 모드를 통해 하루 수조 건의 이벤트를 처리하는 분산 이벤트 스트리밍 플랫폼',
        docUrl: 'https://kafka.apache.org/documentation/',
        githubUrl: 'https://github.com/apache/kafka',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kafka-oss-002',
        projectName: 'Redpanda (Self-Hosted)',
        projectNameKo: 'Redpanda (셀프 호스트)',
        license: 'BSL-1.1',
        description:
          'Kafka-compatible streaming engine written in C++ eliminating JVM and ZooKeeper dependencies',
        descriptionKo:
          'JVM과 ZooKeeper 의존성을 제거한 C++로 작성된 Kafka 호환 스트리밍 엔진',
        docUrl: 'https://docs.redpanda.com/',
        githubUrl: 'https://github.com/redpanda-data/redpanda',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-kafka-onprem-001',
        vendorName: 'Confluent',
        productName: 'Confluent Platform',
        productNameKo: 'Confluent 플랫폼',
        modelSeries: 'Confluent Platform 7.x',
        productTier: 'enterprise',
        targetUseCase:
          'Self-managed enterprise Kafka with Schema Registry, Connect, ksqlDB, and Confluent Control Center',
        targetUseCaseKo:
          'Schema Registry, Connect, ksqlDB, Control Center를 갖춘 셀프 관리형 엔터프라이즈 Kafka',
        lifecycleStatus: 'active',
        productUrl: 'https://www.confluent.io/product/confluent-platform/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-kafka-onprem-002',
        vendorName: 'IBM',
        productName: 'IBM Event Streams',
        productNameKo: 'IBM Event Streams',
        modelSeries: 'Cloud Pak for Integration',
        productTier: 'enterprise',
        targetUseCase: 'Enterprise Kafka on IBM Cloud Pak with geo-replication and schema management',
        targetUseCaseKo: 'IBM Cloud Pak의 지오 복제 및 스키마 관리를 갖춘 엔터프라이즈 Kafka',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ibm.com/products/event-streams',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 8. rabbitmq
  // =========================================================================
  {
    componentId: 'rabbitmq',
    category: 'compute',
    cloud: [
      {
        id: 'VM-rabbitmq-aws-001',
        provider: 'aws',
        serviceName: 'Amazon MQ for RabbitMQ',
        serviceNameKo: 'Amazon MQ (RabbitMQ)',
        serviceTier: 'Managed Broker',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed RabbitMQ broker with multi-AZ failover, CloudWatch monitoring, and automated backups',
        differentiatorKo:
          '멀티 AZ 장애 조치, CloudWatch 모니터링, 자동 백업을 갖춘 완전 관리형 RabbitMQ 브로커',
        docUrl: 'https://docs.aws.amazon.com/amazon-mq/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-rabbitmq-azure-001',
        provider: 'azure',
        serviceName: 'Azure Service Bus',
        serviceNameKo: 'Azure Service Bus',
        serviceTier: 'Managed Messaging',
        pricingModel: 'pay-per-use',
        differentiator:
          'Serverless enterprise messaging with AMQP support, topics/subscriptions, and Azure ecosystem integration',
        differentiatorKo:
          'AMQP 지원, 토픽/구독, Azure 생태계 통합을 갖춘 서버리스 엔터프라이즈 메시징',
        docUrl: 'https://learn.microsoft.com/en-us/azure/service-bus-messaging/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-rabbitmq-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Pub/Sub',
        serviceNameKo: 'Google Cloud Pub/Sub',
        serviceTier: 'Managed Messaging',
        pricingModel: 'pay-per-use',
        differentiator:
          'Global serverless messaging with push/pull delivery modes and dead-letter topic support',
        differentiatorKo:
          '푸시/풀 전달 모드와 데드레터 토픽을 지원하는 글로벌 서버리스 메시징',
        docUrl: 'https://cloud.google.com/pubsub/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-rabbitmq-managed-001',
        vendorName: 'CloudAMQP (84codes)',
        productName: 'CloudAMQP',
        productNameKo: 'CloudAMQP 관리형 RabbitMQ',
        pricingModel: 'freemium',
        differentiator:
          'Dedicated managed RabbitMQ/LavinMQ with SOC2/GDPR/HIPAA compliance, 24/7 support, multi-cloud',
        differentiatorKo:
          'SOC2/GDPR/HIPAA 준수, 24/7 지원, 멀티 클라우드를 갖춘 전용 관리형 RabbitMQ/LavinMQ',
        docUrl: 'https://www.cloudamqp.com/docs/index.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-rabbitmq-managed-002',
        vendorName: 'VMware',
        productName: 'VMware RabbitMQ (Commercial)',
        productNameKo: 'VMware RabbitMQ (상용)',
        pricingModel: 'subscription',
        differentiator:
          'Commercial RabbitMQ distribution with warm standby replication and enterprise support from VMware',
        differentiatorKo:
          'VMware 엔터프라이즈 지원과 웜 대기 복제를 갖춘 상용 RabbitMQ 배포판',
        docUrl: 'https://www.rabbitmq.com/docs',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-rabbitmq-oss-001',
        projectName: 'RabbitMQ',
        projectNameKo: 'RabbitMQ',
        license: 'MPL-2.0',
        description:
          'Multi-protocol message broker supporting AMQP, MQTT, STOMP with clustering and mirrored queues',
        descriptionKo:
          'AMQP, MQTT, STOMP을 지원하며 클러스터링과 미러 큐를 갖춘 멀티 프로토콜 메시지 브로커',
        docUrl: 'https://www.rabbitmq.com/docs',
        githubUrl: 'https://github.com/rabbitmq/rabbitmq-server',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-rabbitmq-onprem-001',
        vendorName: 'VMware',
        productName: 'VMware RabbitMQ for Kubernetes',
        productNameKo: 'VMware RabbitMQ for Kubernetes',
        modelSeries: 'Tanzu RabbitMQ',
        productTier: 'enterprise',
        targetUseCase: 'Commercial on-prem RabbitMQ with Kubernetes operator, warm standby, and enterprise SLA',
        targetUseCaseKo: 'Kubernetes 오퍼레이터, 웜 대기, 엔터프라이즈 SLA를 갖춘 상용 온프레미스 RabbitMQ',
        lifecycleStatus: 'active',
        productUrl: 'https://www.vmware.com/products/tanzu-rabbitmq.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-rabbitmq-onprem-002',
        vendorName: 'IBM',
        productName: 'IBM MQ',
        productNameKo: 'IBM MQ',
        modelSeries: 'IBM MQ 9.x',
        productTier: 'enterprise',
        targetUseCase: 'Enterprise message queue with transactional guarantees, mainframe connectivity, and HA',
        targetUseCaseKo: '트랜잭션 보장, 메인프레임 연결, HA를 갖춘 엔터프라이즈 메시지 큐',
        lifecycleStatus: 'active',
        productUrl: 'https://www.ibm.com/products/mq',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 9. prometheus
  // =========================================================================
  {
    componentId: 'prometheus',
    category: 'compute',
    cloud: [
      {
        id: 'VM-prometheus-aws-001',
        provider: 'aws',
        serviceName: 'Amazon Managed Service for Prometheus',
        serviceNameKo: 'Amazon Managed Prometheus',
        serviceTier: 'Managed Monitoring',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed Prometheus-compatible monitoring with automatic scaling and HA, no infrastructure to manage',
        differentiatorKo:
          '자동 확장 및 HA를 갖추고 인프라 관리가 필요 없는 완전 관리형 Prometheus 호환 모니터링',
        docUrl: 'https://docs.aws.amazon.com/prometheus/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-prometheus-azure-001',
        provider: 'azure',
        serviceName: 'Azure Monitor (Managed Prometheus)',
        serviceNameKo: 'Azure Monitor (관리형 Prometheus)',
        serviceTier: 'Managed Monitoring',
        pricingModel: 'pay-per-use',
        differentiator:
          'Prometheus metrics collection stored in Azure Monitor workspace with prebuilt Managed Grafana dashboards',
        differentiatorKo:
          'Azure Monitor 작업 영역에 저장되는 Prometheus 메트릭, 사전 구축된 Managed Grafana 대시보드',
        docUrl: 'https://learn.microsoft.com/en-us/azure/azure-monitor/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-prometheus-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Managed Service for Prometheus',
        serviceNameKo: 'Google Cloud Managed Prometheus',
        serviceTier: 'Managed Monitoring',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed Prometheus integrated with Cloud Monitoring, using Monarch backend for global-scale metrics',
        differentiatorKo:
          'Cloud Monitoring과 통합되고 Monarch 백엔드로 글로벌 규모 메트릭을 제공하는 관리형 Prometheus',
        docUrl: 'https://cloud.google.com/stackdriver/docs/managed-prometheus',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-prometheus-managed-001',
        vendorName: 'Grafana Labs',
        productName: 'Grafana Cloud (Metrics — Mimir)',
        productNameKo: 'Grafana Cloud (메트릭 — Mimir)',
        pricingModel: 'freemium',
        differentiator:
          'Prometheus-compatible long-term metrics storage with generous free tier (10K series) and Mimir backend',
        differentiatorKo:
          '넉넉한 무료 티어(10K 시리즈)와 Mimir 백엔드를 갖춘 Prometheus 호환 장기 메트릭 스토리지',
        docUrl: 'https://grafana.com/docs/grafana-cloud/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-prometheus-managed-002',
        vendorName: 'Datadog',
        productName: 'Datadog Infrastructure Monitoring',
        productNameKo: 'Datadog 인프라 모니터링',
        pricingModel: 'subscription',
        differentiator:
          'Unified monitoring with 600+ integrations, AI-powered alerting, and PromQL-compatible queries',
        differentiatorKo:
          '600개 이상 통합, AI 기반 알림, PromQL 호환 쿼리를 갖춘 통합 모니터링',
        docUrl: 'https://docs.datadoghq.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-prometheus-oss-001',
        projectName: 'Prometheus',
        projectNameKo: 'Prometheus',
        license: 'Apache-2.0',
        description:
          'CNCF graduated monitoring system with PromQL, pull-based scraping, AlertManager, and rich ecosystem',
        descriptionKo:
          'PromQL, 풀 기반 스크래핑, AlertManager, 풍부한 생태계를 갖춘 CNCF 졸업 모니터링 시스템',
        docUrl: 'https://prometheus.io/docs/',
        githubUrl: 'https://github.com/prometheus/prometheus',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-prometheus-oss-002',
        projectName: 'Thanos',
        projectNameKo: 'Thanos',
        license: 'Apache-2.0',
        description:
          'Highly available Prometheus setup with long-term storage via object storage and global querying',
        descriptionKo:
          '오브젝트 스토리지를 통한 장기 저장과 글로벌 쿼리를 갖춘 고가용성 Prometheus 구성',
        docUrl: 'https://thanos.io/tip/thanos/getting-started.md/',
        githubUrl: 'https://github.com/thanos-io/thanos',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-prometheus-onprem-001',
        vendorName: 'Grafana Labs',
        productName: 'Grafana Enterprise (Self-Hosted)',
        productNameKo: 'Grafana Enterprise (셀프 호스트)',
        modelSeries: 'Grafana Enterprise Stack',
        productTier: 'enterprise',
        targetUseCase:
          'Self-hosted Grafana + Mimir + Loki stack with enterprise features, LDAP/SAML, and support',
        targetUseCaseKo:
          'LDAP/SAML 및 지원을 갖춘 엔터프라이즈 기능의 셀프 호스트 Grafana + Mimir + Loki 스택',
        lifecycleStatus: 'active',
        productUrl: 'https://grafana.com/products/enterprise/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-prometheus-onprem-002',
        vendorName: 'Datadog',
        productName: 'Datadog Agent (On-Prem Collectors)',
        productNameKo: 'Datadog Agent (온프레미스 수집기)',
        modelSeries: 'Datadog Agent 7.x',
        productTier: 'enterprise',
        targetUseCase: 'On-prem metric collection agents streaming to Datadog SaaS for unified observability',
        targetUseCaseKo: '통합 옵저버빌리티를 위해 Datadog SaaS로 스트리밍하는 온프레미스 메트릭 수집 에이전트',
        lifecycleStatus: 'active',
        productUrl: 'https://docs.datadoghq.com/agent/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 10. grafana
  // =========================================================================
  {
    componentId: 'grafana',
    category: 'compute',
    cloud: [
      {
        id: 'VM-grafana-aws-001',
        provider: 'aws',
        serviceName: 'Amazon Managed Grafana',
        serviceNameKo: 'Amazon Managed Grafana',
        serviceTier: 'Managed Dashboard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Fully managed Grafana with AWS SSO integration, native data source plugins for AWS services',
        differentiatorKo:
          'AWS SSO 통합, AWS 서비스용 네이티브 데이터 소스 플러그인을 갖춘 완전 관리형 Grafana',
        docUrl: 'https://docs.aws.amazon.com/grafana/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-grafana-azure-001',
        provider: 'azure',
        serviceName: 'Azure Managed Grafana',
        serviceNameKo: 'Azure Managed Grafana',
        serviceTier: 'Managed Dashboard',
        pricingModel: 'pay-per-use',
        differentiator:
          'Managed Grafana with Azure Monitor/Prometheus integration, prebuilt dashboards, and Azure AD auth',
        differentiatorKo:
          'Azure Monitor/Prometheus 통합, 사전 구축 대시보드, Azure AD 인증을 갖춘 관리형 Grafana',
        docUrl: 'https://learn.microsoft.com/en-us/azure/managed-grafana/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-grafana-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Cloud Monitoring Dashboards',
        serviceNameKo: 'Google Cloud Monitoring 대시보드',
        serviceTier: 'Managed Monitoring',
        pricingModel: 'pay-per-use',
        differentiator:
          'Built-in dashboards with MQL queries, integrated with Cloud Logging and Cloud Trace',
        differentiatorKo:
          'MQL 쿼리를 갖춘 내장 대시보드, Cloud Logging 및 Cloud Trace와 통합',
        docUrl: 'https://cloud.google.com/monitoring/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-grafana-managed-001',
        vendorName: 'Grafana Labs',
        productName: 'Grafana Cloud',
        productNameKo: 'Grafana Cloud',
        pricingModel: 'freemium',
        differentiator:
          'Full observability stack (metrics/logs/traces) with generous free tier, 50+ data source plugins',
        differentiatorKo:
          '넉넉한 무료 티어, 50개 이상 데이터 소스 플러그인을 갖춘 풀 옵저버빌리티 스택(메트릭/로그/트레이스)',
        docUrl: 'https://grafana.com/docs/grafana-cloud/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-grafana-managed-002',
        vendorName: 'Datadog',
        productName: 'Datadog Dashboards',
        productNameKo: 'Datadog 대시보드',
        pricingModel: 'subscription',
        differentiator:
          'Drag-and-drop dashboards with 600+ integrations, AI-powered anomaly detection, and collaboration',
        differentiatorKo:
          '600개 이상 통합, AI 기반 이상 탐지, 협업 기능을 갖춘 드래그 앤 드롭 대시보드',
        docUrl: 'https://docs.datadoghq.com/dashboards/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-grafana-managed-003',
        vendorName: 'New Relic',
        productName: 'New Relic Dashboards',
        productNameKo: 'New Relic 대시보드',
        pricingModel: 'freemium',
        differentiator:
          'Usage-based pricing with deep APM insights, custom NRQL queries, and full-stack observability',
        differentiatorKo:
          '사용량 기반 과금, 심층 APM 인사이트, 커스텀 NRQL 쿼리, 풀스택 옵저버빌리티',
        docUrl: 'https://docs.newrelic.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-grafana-oss-001',
        projectName: 'Grafana OSS',
        projectNameKo: 'Grafana OSS',
        license: 'AGPL-3.0',
        description:
          'Leading open-source visualization platform with rich plugin ecosystem, supporting 50+ data sources',
        descriptionKo:
          '50개 이상의 데이터 소스를 지원하는 풍부한 플러그인 생태계를 갖춘 선도적 오픈소스 시각화 플랫폼',
        docUrl: 'https://grafana.com/docs/grafana/latest/',
        githubUrl: 'https://github.com/grafana/grafana',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-grafana-onprem-001',
        vendorName: 'Grafana Labs',
        productName: 'Grafana Enterprise (Self-Hosted)',
        productNameKo: 'Grafana Enterprise (셀프 호스트)',
        modelSeries: 'Grafana Enterprise 11.x',
        productTier: 'enterprise',
        targetUseCase:
          'Self-hosted dashboarding with enterprise plugins, RBAC, audit logs, LDAP/SAML, and premium support',
        targetUseCaseKo:
          '엔터프라이즈 플러그인, RBAC, 감사 로그, LDAP/SAML, 프리미엄 지원을 갖춘 셀프 호스트 대시보드',
        lifecycleStatus: 'active',
        productUrl: 'https://grafana.com/products/enterprise/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-grafana-onprem-002',
        vendorName: 'Datadog',
        productName: 'Datadog On-Prem Proxy',
        productNameKo: 'Datadog 온프레미스 프록시',
        modelSeries: 'Datadog Agent + Observability Pipelines',
        productTier: 'enterprise',
        targetUseCase: 'On-prem agents feeding metrics to Datadog SaaS dashboards via observability pipelines',
        targetUseCaseKo: '옵저버빌리티 파이프라인을 통해 Datadog SaaS 대시보드로 메트릭을 전송하는 온프레미스 에이전트',
        lifecycleStatus: 'active',
        productUrl: 'https://www.datadoghq.com/product/observability-pipelines/',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 11. aws-vpc
  // =========================================================================
  {
    componentId: 'aws-vpc',
    category: 'cloud',
    cloud: [
      {
        id: 'VM-aws-vpc-azure-001',
        provider: 'azure',
        serviceName: 'Azure Virtual Network (VNet)',
        serviceNameKo: 'Azure 가상 네트워크 (VNet)',
        serviceTier: 'Cloud Networking',
        pricingModel: 'pay-per-use',
        differentiator:
          'Azure equivalent of VPC with NSG security, VNet peering, and seamless Active Directory integration',
        differentiatorKo:
          'NSG 보안, VNet 피어링, Active Directory 원활한 통합을 갖춘 Azure의 VPC 대응 서비스',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-network/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-aws-vpc-gcp-001',
        provider: 'gcp',
        serviceName: 'Google VPC',
        serviceNameKo: 'Google VPC',
        serviceTier: 'Cloud Networking',
        pricingModel: 'pay-per-use',
        differentiator:
          'Global VPC spanning all regions (unlike AWS regional VPC), with automatic subnet creation',
        differentiatorKo:
          'AWS 리전별 VPC와 달리 전체 리전에 걸친 글로벌 VPC, 자동 서브넷 생성',
        docUrl: 'https://cloud.google.com/vpc/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-aws-vpc-managed-001',
        vendorName: 'Megaport',
        productName: 'Megaport Virtual Edge (MVE)',
        productNameKo: 'Megaport 가상 에지 (MVE)',
        pricingModel: 'pay-per-use',
        differentiator:
          'Network-as-a-service enabling private cloud interconnect to AWS VPC via Direct Connect',
        differentiatorKo:
          'Direct Connect를 통해 AWS VPC에 프라이빗 클라우드 상호 연결하는 NaaS',
        docUrl: 'https://docs.megaport.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-aws-vpc-managed-002',
        vendorName: 'Aviatrix',
        productName: 'Aviatrix Cloud Networking',
        productNameKo: 'Aviatrix 클라우드 네트워킹',
        pricingModel: 'subscription',
        differentiator:
          'Multi-cloud network architecture platform with transit gateway orchestration and security controls',
        differentiatorKo:
          '트랜짓 게이트웨이 오케스트레이션과 보안 제어를 갖춘 멀티 클라우드 네트워크 아키텍처 플랫폼',
        docUrl: 'https://docs.aviatrix.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-aws-vpc-oss-001',
        projectName: 'OpenStack Neutron',
        projectNameKo: 'OpenStack Neutron 네트워킹',
        license: 'Apache-2.0',
        description:
          'Software-defined networking (SDN) for private cloud with VPC-like network isolation and security groups',
        descriptionKo:
          'VPC와 유사한 네트워크 격리 및 보안 그룹을 갖춘 프라이빗 클라우드용 SDN',
        docUrl: 'https://docs.openstack.org/neutron/latest/',
        githubUrl: 'https://github.com/openstack/neutron',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-aws-vpc-onprem-001',
        vendorName: 'Cisco',
        productName: 'Cisco ACI (Application Centric Infrastructure)',
        productNameKo: 'Cisco ACI (애플리케이션 중심 인프라)',
        modelSeries: 'Nexus 9000 + APIC',
        productTier: 'enterprise',
        targetUseCase: 'Data center SDN fabric providing VPC-equivalent micro-segmentation and policy-driven networking',
        targetUseCaseKo: 'VPC 수준의 마이크로 세그멘테이션과 정책 기반 네트워킹을 제공하는 데이터 센터 SDN 패브릭',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/solutions/data-center-virtualization/application-centric-infrastructure/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-aws-vpc-onprem-002',
        vendorName: 'VMware',
        productName: 'VMware NSX',
        productNameKo: 'VMware NSX',
        modelSeries: 'NSX 4.x',
        productTier: 'enterprise',
        targetUseCase: 'Network virtualization and security platform providing VPC-like isolation in on-prem environments',
        targetUseCaseKo: '온프레미스 환경에서 VPC와 같은 격리를 제공하는 네트워크 가상화 및 보안 플랫폼',
        lifecycleStatus: 'active',
        productUrl: 'https://www.vmware.com/products/nsx.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 12. azure-vnet
  // =========================================================================
  {
    componentId: 'azure-vnet',
    category: 'cloud',
    cloud: [
      {
        id: 'VM-azure-vnet-aws-001',
        provider: 'aws',
        serviceName: 'Amazon VPC',
        serviceNameKo: '아마존 VPC',
        serviceTier: 'Cloud Networking',
        pricingModel: 'pay-per-use',
        differentiator:
          'Most mature cloud networking with Security Groups, NACLs, Transit Gateway, and PrivateLink',
        differentiatorKo:
          'Security Groups, NACLs, Transit Gateway, PrivateLink을 갖춘 가장 성숙한 클라우드 네트워킹',
        docUrl: 'https://docs.aws.amazon.com/vpc/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-azure-vnet-gcp-001',
        provider: 'gcp',
        serviceName: 'Google VPC',
        serviceNameKo: 'Google VPC',
        serviceTier: 'Cloud Networking',
        pricingModel: 'pay-per-use',
        differentiator:
          'Single global VPC spanning all regions with automatic mode subnets and Private Service Connect',
        differentiatorKo:
          '모든 리전에 걸친 단일 글로벌 VPC, 자동 모드 서브넷, Private Service Connect',
        docUrl: 'https://cloud.google.com/vpc/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-azure-vnet-managed-001',
        vendorName: 'Megaport',
        productName: 'Megaport Cloud Router (MCR)',
        productNameKo: 'Megaport 클라우드 라우터 (MCR)',
        pricingModel: 'pay-per-use',
        differentiator:
          'NaaS for private multi-cloud connectivity with Azure ExpressRoute integration',
        differentiatorKo:
          'Azure ExpressRoute 통합을 통한 프라이빗 멀티 클라우드 연결 NaaS',
        docUrl: 'https://docs.megaport.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-azure-vnet-managed-002',
        vendorName: 'Aviatrix',
        productName: 'Aviatrix Multi-Cloud Network',
        productNameKo: 'Aviatrix 멀티 클라우드 네트워크',
        pricingModel: 'subscription',
        differentiator:
          'Centralized multi-cloud networking with Azure VNet orchestration and advanced transit',
        differentiatorKo:
          'Azure VNet 오케스트레이션과 고급 트랜짓을 갖춘 중앙 집중식 멀티 클라우드 네트워킹',
        docUrl: 'https://docs.aviatrix.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-azure-vnet-oss-001',
        projectName: 'OpenStack Neutron',
        projectNameKo: 'OpenStack Neutron',
        license: 'Apache-2.0',
        description:
          'Open-source SDN providing VNet-equivalent network isolation, routing, and security for private clouds',
        descriptionKo:
          '프라이빗 클라우드를 위해 VNet과 동등한 네트워크 격리, 라우팅, 보안을 제공하는 오픈소스 SDN',
        docUrl: 'https://docs.openstack.org/neutron/latest/',
        githubUrl: 'https://github.com/openstack/neutron',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-azure-vnet-onprem-001',
        vendorName: 'Cisco',
        productName: 'Cisco ACI',
        productNameKo: 'Cisco ACI',
        modelSeries: 'Nexus 9000 + APIC',
        productTier: 'enterprise',
        targetUseCase: 'On-prem SDN fabric with policy-driven networking and micro-segmentation comparable to VNet',
        targetUseCaseKo: 'VNet에 필적하는 정책 기반 네트워킹과 마이크로 세그멘테이션을 갖춘 온프레미스 SDN 패브릭',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/solutions/data-center-virtualization/application-centric-infrastructure/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-azure-vnet-onprem-002',
        vendorName: 'VMware',
        productName: 'VMware NSX',
        productNameKo: 'VMware NSX',
        modelSeries: 'NSX 4.x',
        productTier: 'enterprise',
        targetUseCase: 'Network virtualization enabling VNet-like overlay networks on existing physical infrastructure',
        targetUseCaseKo: '기존 물리 인프라 위에 VNet과 같은 오버레이 네트워크를 제공하는 네트워크 가상화',
        lifecycleStatus: 'active',
        productUrl: 'https://www.vmware.com/products/nsx.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 13. gcp-network
  // =========================================================================
  {
    componentId: 'gcp-network',
    category: 'cloud',
    cloud: [
      {
        id: 'VM-gcp-network-aws-001',
        provider: 'aws',
        serviceName: 'Amazon VPC',
        serviceNameKo: '아마존 VPC',
        serviceTier: 'Cloud Networking',
        pricingModel: 'pay-per-use',
        differentiator:
          'Region-scoped VPC with broadest building blocks: NAT Gateway, PrivateLink, Network Firewall, Transit Gateway',
        differentiatorKo:
          '리전 범위 VPC, NAT Gateway, PrivateLink, Network Firewall, Transit Gateway 등 가장 폭넓은 구성 요소',
        docUrl: 'https://docs.aws.amazon.com/vpc/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-gcp-network-azure-001',
        provider: 'azure',
        serviceName: 'Azure Virtual Network (VNet)',
        serviceNameKo: 'Azure 가상 네트워크 (VNet)',
        serviceTier: 'Cloud Networking',
        pricingModel: 'pay-per-use',
        differentiator:
          'Region-scoped VNet with cohesive NSG/Route Table/Firewall/Virtual WAN ecosystem and enterprise AD integration',
        differentiatorKo:
          '일관된 NSG/경로 테이블/방화벽/Virtual WAN 생태계와 엔터프라이즈 AD 통합을 갖춘 리전 범위 VNet',
        docUrl: 'https://learn.microsoft.com/en-us/azure/virtual-network/',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-gcp-network-managed-001',
        vendorName: 'Megaport',
        productName: 'Megaport (GCP Interconnect)',
        productNameKo: 'Megaport (GCP 인터커넥트)',
        pricingModel: 'pay-per-use',
        differentiator:
          'On-demand private connectivity to GCP via Partner Interconnect',
        differentiatorKo:
          'Partner Interconnect를 통한 GCP 온디맨드 프라이빗 연결',
        docUrl: 'https://docs.megaport.com/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-gcp-network-managed-002',
        vendorName: 'Aviatrix',
        productName: 'Aviatrix Multi-Cloud Network',
        productNameKo: 'Aviatrix 멀티 클라우드 네트워크',
        pricingModel: 'subscription',
        differentiator:
          'Multi-cloud network abstraction unifying GCP VPC with AWS/Azure networking under single control plane',
        differentiatorKo:
          '단일 컨트롤 플레인으로 GCP VPC를 AWS/Azure 네트워킹과 통합하는 멀티 클라우드 네트워크 추상화',
        docUrl: 'https://docs.aviatrix.com/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-gcp-network-oss-001',
        projectName: 'OpenStack Neutron',
        projectNameKo: 'OpenStack Neutron',
        license: 'Apache-2.0',
        description:
          'Open-source SDN for private cloud providing GCP VPC-like global networking abstraction',
        descriptionKo:
          'GCP VPC와 유사한 글로벌 네트워킹 추상화를 제공하는 프라이빗 클라우드용 오픈소스 SDN',
        docUrl: 'https://docs.openstack.org/neutron/latest/',
        githubUrl: 'https://github.com/openstack/neutron',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-gcp-network-onprem-001',
        vendorName: 'Cisco',
        productName: 'Cisco ACI',
        productNameKo: 'Cisco ACI',
        modelSeries: 'Nexus 9000 + APIC',
        productTier: 'enterprise',
        targetUseCase: 'On-prem policy-driven SDN with intent-based networking comparable to GCP VPC',
        targetUseCaseKo: 'GCP VPC에 필적하는 인텐트 기반 네트워킹을 갖춘 온프레미스 정책 기반 SDN',
        lifecycleStatus: 'active',
        productUrl: 'https://www.cisco.com/c/en/us/solutions/data-center-virtualization/application-centric-infrastructure/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-gcp-network-onprem-002',
        vendorName: 'VMware',
        productName: 'VMware NSX',
        productNameKo: 'VMware NSX',
        modelSeries: 'NSX 4.x',
        productTier: 'enterprise',
        targetUseCase: 'Software-defined networking providing overlay network isolation similar to cloud VPC on-prem',
        targetUseCaseKo: '온프레미스에서 클라우드 VPC와 유사한 오버레이 네트워크 격리를 제공하는 SDN',
        lifecycleStatus: 'active',
        productUrl: 'https://www.vmware.com/products/nsx.html',
        lastVerified: '2026-02-14',
      },
    ],
  },

  // =========================================================================
  // 14. private-cloud
  // =========================================================================
  {
    componentId: 'private-cloud',
    category: 'cloud',
    cloud: [
      {
        id: 'VM-private-cloud-aws-001',
        provider: 'aws',
        serviceName: 'AWS Outposts',
        serviceNameKo: 'AWS Outposts',
        serviceTier: 'Hybrid Cloud',
        pricingModel: 'reserved',
        differentiator:
          'AWS-managed hardware in your data center running native AWS services, APIs, and tools on-prem',
        differentiatorKo:
          '데이터 센터에 AWS 관리형 하드웨어를 배치하여 온프레미스에서 네이티브 AWS 서비스, API, 도구 실행',
        docUrl: 'https://docs.aws.amazon.com/outposts/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-cloud-azure-001',
        provider: 'azure',
        serviceName: 'Azure Stack Hub',
        serviceNameKo: 'Azure Stack Hub',
        serviceTier: 'Hybrid Cloud',
        pricingModel: 'subscription',
        differentiator:
          'Run Azure IaaS/PaaS services on-prem with broadest service selection among hybrid solutions',
        differentiatorKo:
          '하이브리드 솔루션 중 가장 넓은 서비스 선택으로 온프레미스에서 Azure IaaS/PaaS 실행',
        docUrl: 'https://learn.microsoft.com/en-us/azure-stack/',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-cloud-gcp-001',
        provider: 'gcp',
        serviceName: 'Google Distributed Cloud',
        serviceNameKo: 'Google Distributed Cloud',
        serviceTier: 'Hybrid Cloud',
        pricingModel: 'subscription',
        differentiator:
          'Kubernetes-centric hybrid platform using Anthos, cloud-agnostic by design, runs on any infrastructure',
        differentiatorKo:
          'Anthos 기반 Kubernetes 중심 하이브리드 플랫폼, 클라우드 불가지론적 설계, 모든 인프라에서 실행',
        docUrl: 'https://cloud.google.com/distributed-cloud/docs',
        lastVerified: '2026-02-14',
      },
    ],
    managed: [
      {
        id: 'VM-private-cloud-managed-001',
        vendorName: 'Nutanix',
        productName: 'Nutanix Cloud Platform',
        productNameKo: 'Nutanix 클라우드 플랫폼',
        pricingModel: 'subscription',
        differentiator:
          'HCI platform with one-click simplicity, multi-cloud management, and built-in AHV hypervisor',
        differentiatorKo:
          '원클릭 간편성, 멀티 클라우드 관리, 내장 AHV 하이퍼바이저를 갖춘 HCI 플랫폼',
        docUrl: 'https://www.nutanix.com/products',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-cloud-managed-002',
        vendorName: 'Platform9',
        productName: 'Platform9 Managed OpenStack',
        productNameKo: 'Platform9 관리형 OpenStack',
        pricingModel: 'subscription',
        differentiator:
          'SaaS-managed OpenStack eliminating operational complexity of self-hosted private clouds',
        differentiatorKo:
          '셀프 호스트 프라이빗 클라우드의 운영 복잡성을 제거하는 SaaS 관리형 OpenStack',
        docUrl: 'https://platform9.com/docs/',
        lastVerified: '2026-02-14',
      },
    ],
    openSource: [
      {
        id: 'VM-private-cloud-oss-001',
        projectName: 'OpenStack',
        projectNameKo: 'OpenStack',
        license: 'Apache-2.0',
        description:
          'Most flexible private cloud platform with modular services (Nova, Neutron, Cinder), used by AT&T and Walmart',
        descriptionKo:
          'AT&T, Walmart이 사용하는 모듈형 서비스(Nova, Neutron, Cinder)를 갖춘 가장 유연한 프라이빗 클라우드 플랫폼',
        docUrl: 'https://docs.openstack.org/',
        githubUrl: 'https://github.com/openstack',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-cloud-oss-002',
        projectName: 'Apache CloudStack',
        projectNameKo: 'Apache CloudStack',
        license: 'Apache-2.0',
        description:
          'Turnkey IaaS cloud platform simpler than OpenStack, managing VMs, networking, and storage',
        descriptionKo:
          'OpenStack보다 간단하며 VM, 네트워킹, 스토리지를 관리하는 턴키 IaaS 클라우드 플랫폼',
        docUrl: 'https://cloudstack.apache.org/docs/',
        githubUrl: 'https://github.com/apache/cloudstack',
        lastVerified: '2026-02-14',
      },
    ],
    onPremise: [
      {
        id: 'VM-private-cloud-onprem-001',
        vendorName: 'Broadcom (VMware)',
        productName: 'VMware Cloud Foundation',
        productNameKo: 'VMware Cloud Foundation',
        modelSeries: 'VCF 5.x',
        productTier: 'enterprise',
        targetUseCase: 'Full-stack private cloud with vSphere, vSAN, NSX, and Aria automation suite',
        targetUseCaseKo: 'vSphere, vSAN, NSX, Aria 자동화 제품군을 갖춘 풀스택 프라이빗 클라우드',
        lifecycleStatus: 'active',
        productUrl: 'https://www.vmware.com/products/cloud-foundation.html',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-cloud-onprem-002',
        vendorName: 'Nutanix',
        productName: 'Nutanix Cloud Infrastructure',
        productNameKo: 'Nutanix 클라우드 인프라',
        modelSeries: 'NCI',
        productTier: 'enterprise',
        targetUseCase: 'HCI-based private cloud with one-click operations and no separate licensing for hypervisor',
        targetUseCaseKo: '원클릭 운영과 하이퍼바이저 별도 라이선스가 불필요한 HCI 기반 프라이빗 클라우드',
        lifecycleStatus: 'active',
        productUrl: 'https://www.nutanix.com/products/cloud-infrastructure',
        lastVerified: '2026-02-14',
      },
      {
        id: 'VM-private-cloud-onprem-003',
        vendorName: 'Red Hat',
        productName: 'Red Hat OpenStack Platform',
        productNameKo: 'Red Hat OpenStack 플랫폼',
        modelSeries: 'RHOSP 18',
        productTier: 'enterprise',
        targetUseCase: 'Enterprise-supported OpenStack distribution for telecom and large-scale private cloud',
        targetUseCaseKo: '통신사 및 대규모 프라이빗 클라우드를 위한 엔터프라이즈 지원 OpenStack 배포판',
        lifecycleStatus: 'active',
        productUrl: 'https://www.redhat.com/en/technologies/linux-platforms/openstack-platform',
        lastVerified: '2026-02-14',
      },
    ],
  },
];
