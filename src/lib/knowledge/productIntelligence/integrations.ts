/**
 * Product Intelligence - Communication & Integration Products
 *
 * Communication platforms and workflow automation tools that integrate
 * with infrastructure via webhooks, APIs, bots, and native connectors.
 *
 * Products: Slack, Discord, GitHub Actions, Microsoft Teams, n8n, Zapier
 */

import type { ProductIntelligence } from './types';

// ---------------------------------------------------------------------------
// Slack
// ---------------------------------------------------------------------------

const slack: ProductIntelligence = {
  id: 'PI-INT-001',
  productId: 'slack',
  name: 'Slack',
  nameKo: 'Slack (슬랙)',
  category: 'communication',
  sourceUrl: 'https://slack.com/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['SaaS (Web, Desktop, Mobile)'],
      installMethod: 'Sign up at slack.com; install desktop/mobile apps or use web browser',
      installMethodKo: 'slack.com에서 가입; 데스크톱/모바일 앱 설치 또는 웹 브라우저 사용',
      minRequirements: {
        network: 'Internet connection (HTTPS)',
      },
      infraComponents: ['api-gateway'],
      notes:
        'Cloud SaaS platform; integrate via Incoming Webhooks, Slack Apps (API + WebSocket), or Bot users',
      notesKo:
        '클라우드 SaaS 플랫폼; Incoming Webhook, Slack 앱(API + WebSocket) 또는 Bot 사용자를 통해 통합',
    },
    {
      platform: 'server',
      os: ['Linux', 'macOS', 'Windows'],
      installMethod: 'Deploy Slack bot/app backend on server; register with Slack API',
      installMethodKo: '서버에 Slack 봇/앱 백엔드 배포; Slack API에 등록',
      minRequirements: {
        cpu: '1 core',
        ram: '512 MB',
        storage: '1 GB',
        network: '100 Mbps',
      },
      infraComponents: ['app-server', 'api-gateway'],
      notes:
        'Self-hosted bot backend handles Slack events and commands; requires public HTTPS endpoint or WebSocket',
      notesKo:
        '셀프 호스팅 봇 백엔드가 Slack 이벤트와 명령을 처리; 공개 HTTPS 엔드포인트 또는 WebSocket 필요',
    },
  ],
  integrations: [
    {
      target: 'Incoming Webhooks',
      method: 'webhook',
      infraComponents: ['api-gateway'],
      protocol: 'HTTPS',
      description: 'Send notifications to Slack channels via simple HTTPS POST webhook URLs',
      descriptionKo: '간단한 HTTPS POST 웹훅 URL을 통해 Slack 채널에 알림 전송',
    },
    {
      target: 'Slack App (Events API)',
      method: 'api',
      infraComponents: ['app-server', 'api-gateway'],
      protocol: 'REST + WebSocket',
      description: 'Full Slack App with Events API for real-time message handling and interactive components',
      descriptionKo: '실시간 메시지 처리와 인터랙티브 컴포넌트를 위한 Events API를 갖춘 전체 Slack 앱',
    },
    {
      target: 'Slack Bolt SDK',
      method: 'native',
      infraComponents: ['app-server'],
      description: 'Official Bolt SDK (Node.js, Python, Java) for building Slack apps with event handling',
      descriptionKo: '이벤트 처리가 가능한 Slack 앱 구축을 위한 공식 Bolt SDK (Node.js, Python, Java)',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Bot handling exceeds 1000 events/minute or needs multi-workspace deployment',
      triggerKo: '봇 처리가 분당 1000 이벤트 초과 또는 멀티 워크스페이스 배포 필요',
      from: ['app-server', 'api-gateway'],
      to: ['app-server', 'container', 'load-balancer', 'kubernetes', 'cache'],
      cloudServices: ['AWS Lambda', 'AWS ECS', 'GCP Cloud Run'],
      reason:
        'High-volume Slack event processing needs horizontal scaling with message queue and caching for rate limit management',
      reasonKo:
        '대량 Slack 이벤트 처리에 레이트 리밋 관리를 위한 메시지 큐와 캐싱이 포함된 수평 확장 필요',
    },
  ],
  embeddingText:
    'Slack communication platform webhook bot API Events WebSocket Bolt SDK notification team messaging SaaS integration',
  embeddingTextKo:
    'Slack 커뮤니케이션 플랫폼 웹훅 봇 API 이벤트 WebSocket Bolt SDK 알림 팀 메시징 SaaS 통합',
};

// ---------------------------------------------------------------------------
// Discord
// ---------------------------------------------------------------------------

const discord: ProductIntelligence = {
  id: 'PI-INT-002',
  productId: 'discord',
  name: 'Discord',
  nameKo: 'Discord (디스코드)',
  category: 'communication',
  sourceUrl: 'https://discord.com/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['SaaS (Web, Desktop, Mobile)'],
      installMethod: 'Create Discord application at discord.com/developers; deploy bot to servers',
      installMethodKo: 'discord.com/developers에서 Discord 애플리케이션 생성; 서버에 봇 배포',
      minRequirements: {
        network: 'Internet connection (HTTPS + WebSocket)',
      },
      infraComponents: ['api-gateway', 'app-server'],
      notes:
        'Discord Bot API via WebSocket Gateway for real-time events; Webhook for simple notifications',
      notesKo:
        '실시간 이벤트를 위한 WebSocket Gateway 기반 Discord Bot API; 간단한 알림을 위한 Webhook',
    },
  ],
  integrations: [
    {
      target: 'Bot API',
      method: 'api',
      infraComponents: ['app-server', 'api-gateway'],
      protocol: 'WebSocket + REST',
      description: 'Discord Bot API via WebSocket Gateway for real-time message and event handling',
      descriptionKo: '실시간 메시지 및 이벤트 처리를 위한 WebSocket Gateway 기반 Discord Bot API',
    },
    {
      target: 'Webhooks',
      method: 'webhook',
      infraComponents: ['api-gateway'],
      protocol: 'HTTPS',
      description: 'Channel webhooks for sending automated notifications without a bot user',
      descriptionKo: '봇 사용자 없이 자동 알림을 전송하기 위한 채널 웹훅',
    },
    {
      target: 'Interactions Endpoint',
      method: 'api',
      infraComponents: ['app-server', 'api-gateway'],
      protocol: 'REST',
      description: 'HTTP-based interactions for slash commands without persistent WebSocket connection',
      descriptionKo: '영구 WebSocket 연결 없이 슬래시 명령을 위한 HTTP 기반 인터랙션',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Bot serves 100+ guilds with high message volume and slash command usage',
      triggerKo: '봇이 높은 메시지 양과 슬래시 명령 사용으로 100개 이상의 길드에 서비스',
      from: ['app-server', 'api-gateway'],
      to: ['app-server', 'container', 'load-balancer', 'cache', 'db-server'],
      cloudServices: ['AWS ECS', 'GCP Cloud Run', 'Railway'],
      reason:
        'Multi-guild bots need sharded WebSocket connections, caching for rate limits, and database for persistent state',
      reasonKo:
        '멀티 길드 봇에 샤딩된 WebSocket 연결, 레이트 리밋 캐싱, 영구 상태를 위한 데이터베이스 필요',
    },
  ],
  embeddingText:
    'Discord communication bot API WebSocket Gateway webhook slash commands guild server real-time messaging integration',
  embeddingTextKo:
    'Discord 커뮤니케이션 봇 API WebSocket Gateway 웹훅 슬래시 명령 길드 서버 실시간 메시징 통합',
};

// ---------------------------------------------------------------------------
// GitHub Actions
// ---------------------------------------------------------------------------

const githubActions: ProductIntelligence = {
  id: 'PI-INT-003',
  productId: 'github-actions',
  name: 'GitHub Actions',
  nameKo: 'GitHub Actions (깃허브 액션)',
  category: 'devops',
  sourceUrl: 'https://github.com/features/actions',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['GitHub-hosted runners (Ubuntu, Windows, macOS)'],
      installMethod: 'Define workflows in .github/workflows/*.yml; triggered by repository events',
      installMethodKo: '.github/workflows/*.yml에 워크플로우 정의; 리포지토리 이벤트로 트리거',
      minRequirements: {
        cpu: '2 cores (GitHub-hosted)',
        ram: '7 GB (GitHub-hosted Linux)',
        storage: '14 GB SSD',
      },
      infraComponents: ['container', 'app-server'],
      notes:
        'CI/CD platform integrated with GitHub; YAML-based workflow definitions with 15,000+ community actions',
      notesKo:
        'GitHub과 통합된 CI/CD 플랫폼; 15,000개 이상의 커뮤니티 액션이 있는 YAML 기반 워크플로우 정의',
    },
    {
      platform: 'server',
      os: ['Linux', 'macOS', 'Windows'],
      installMethod: 'Install self-hosted runner agent; register with GitHub organization or repository',
      installMethodKo: '셀프 호스팅 러너 에이전트 설치; GitHub 조직 또는 리포지토리에 등록',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '20 GB SSD',
        network: '100 Mbps',
      },
      infraComponents: ['app-server', 'container'],
      notes:
        'Self-hosted runners for private network access, GPU workloads, or custom hardware requirements',
      notesKo:
        '프라이빗 네트워크 접근, GPU 워크로드 또는 커스텀 하드웨어 요구사항을 위한 셀프 호스팅 러너',
    },
  ],
  integrations: [
    {
      target: 'Docker',
      method: 'native',
      infraComponents: ['container'],
      description: 'Build and push Docker images as part of CI/CD workflows',
      descriptionKo: 'CI/CD 워크플로우의 일부로 Docker 이미지 빌드 및 푸시',
    },
    {
      target: 'AWS/GCP/Azure',
      method: 'api',
      infraComponents: ['app-server'],
      protocol: 'REST',
      description: 'Deploy to cloud providers using official actions for AWS, GCP, and Azure',
      descriptionKo: 'AWS, GCP, Azure 공식 액션을 사용하여 클라우드 공급자에 배포',
    },
    {
      target: 'Slack Notifications',
      method: 'webhook',
      infraComponents: ['api-gateway'],
      protocol: 'HTTPS',
      description: 'Send CI/CD pipeline status notifications to Slack channels via webhook',
      descriptionKo: '웹훅을 통해 CI/CD 파이프라인 상태 알림을 Slack 채널에 전송',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'CI/CD pipelines need GPU runners, custom environments, or large-scale parallel jobs',
      triggerKo: 'CI/CD 파이프라인에 GPU 러너, 커스텀 환경 또는 대규모 병렬 작업 필요',
      from: ['container', 'app-server'],
      to: ['container', 'kubernetes', 'gpu-server', 'app-server'],
      cloudServices: ['GitHub Larger Runners', 'AWS CodeBuild', 'GCP Cloud Build'],
      reason:
        'Standard GitHub-hosted runners have limited resources; self-hosted runner clusters or larger runners needed for demanding workloads',
      reasonKo:
        '표준 GitHub 호스팅 러너는 제한된 리소스; 요구되는 워크로드를 위해 셀프 호스팅 러너 클러스터 또는 대형 러너 필요',
    },
  ],
  embeddingText:
    'GitHub Actions CI/CD pipeline workflow automation Docker cloud deploy self-hosted runner YAML actions marketplace devops',
  embeddingTextKo:
    'GitHub Actions CI/CD 파이프라인 워크플로우 자동화 Docker 클라우드 배포 셀프 호스팅 러너 YAML 액션 마켓플레이스 데브옵스',
};

// ---------------------------------------------------------------------------
// Microsoft Teams
// ---------------------------------------------------------------------------

const microsoftTeams: ProductIntelligence = {
  id: 'PI-INT-004',
  productId: 'microsoft-teams',
  name: 'Microsoft Teams',
  nameKo: 'Microsoft Teams (마이크로소프트 팀즈)',
  category: 'communication',
  sourceUrl: 'https://www.microsoft.com/en-us/microsoft-teams/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['SaaS (Web, Desktop, Mobile)'],
      installMethod:
        'Sign up via Microsoft 365; integrate via Teams App, Bot Framework, or Incoming Webhook',
      installMethodKo:
        'Microsoft 365를 통해 가입; Teams 앱, Bot Framework 또는 Incoming Webhook을 통해 통합',
      minRequirements: {
        network: 'Internet connection (HTTPS)',
      },
      infraComponents: ['api-gateway', 'app-server'],
      notes:
        'Enterprise communication platform in Microsoft 365 ecosystem; integrate via webhooks, Bot Framework, or Adaptive Cards',
      notesKo:
        'Microsoft 365 생태계의 엔터프라이즈 커뮤니케이션 플랫폼; 웹훅, Bot Framework 또는 Adaptive Cards를 통해 통합',
    },
  ],
  integrations: [
    {
      target: 'Incoming Webhook',
      method: 'webhook',
      infraComponents: ['api-gateway'],
      protocol: 'HTTPS',
      description: 'Send notifications to Teams channels via Incoming Webhook connector with Adaptive Cards',
      descriptionKo: 'Incoming Webhook 커넥터와 Adaptive Cards를 통해 Teams 채널에 알림 전송',
    },
    {
      target: 'Bot Framework',
      method: 'api',
      infraComponents: ['app-server', 'api-gateway'],
      protocol: 'REST',
      description: 'Build conversational bots using Azure Bot Framework with Teams channel integration',
      descriptionKo: 'Teams 채널 통합이 가능한 Azure Bot Framework를 사용하여 대화형 봇 구축',
    },
    {
      target: 'Power Automate',
      method: 'native',
      infraComponents: ['app-server'],
      description: 'Low-code workflow automation connecting Teams with 500+ Microsoft and third-party connectors',
      descriptionKo: 'Teams를 500개 이상의 Microsoft 및 서드파티 커넥터와 연결하는 로우코드 워크플로우 자동화',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Bot needs complex conversation flows, proactive messaging, or multi-tenant deployment',
      triggerKo: '봇에 복잡한 대화 흐름, 능동적 메시징 또는 멀티 테넌트 배포 필요',
      from: ['app-server', 'api-gateway'],
      to: ['app-server', 'container', 'load-balancer', 'db-server', 'cache'],
      cloudServices: ['Azure Bot Service', 'Azure App Service', 'Azure Functions'],
      reason:
        'Enterprise Teams bots require managed bot infrastructure with persistent state, conversation history, and multi-tenant support',
      reasonKo:
        '엔터프라이즈 Teams 봇에 영구 상태, 대화 기록, 멀티 테넌트 지원이 포함된 관리형 봇 인프라 필요',
    },
  ],
  embeddingText:
    'Microsoft Teams communication webhook Bot Framework Adaptive Cards Power Automate Microsoft 365 enterprise collaboration',
  embeddingTextKo:
    'Microsoft Teams 커뮤니케이션 웹훅 Bot Framework Adaptive Cards Power Automate Microsoft 365 엔터프라이즈 협업',
};

// ---------------------------------------------------------------------------
// n8n
// ---------------------------------------------------------------------------

const n8n: ProductIntelligence = {
  id: 'PI-INT-005',
  productId: 'n8n',
  name: 'n8n',
  nameKo: 'n8n (엔에이트엔)',
  category: 'devops',
  sourceUrl: 'https://github.com/n8n-io/n8n',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux', 'macOS', 'Windows (WSL)'],
      installMethod: 'docker run -d --name n8n -p 5678:5678 n8nio/n8n',
      installMethodKo: 'docker run -d --name n8n -p 5678:5678 n8nio/n8n (Docker 컨테이너 배포)',
      minRequirements: {
        cpu: '2 cores',
        ram: '2 GB',
        storage: '10 GB SSD',
        network: '100 Mbps',
      },
      infraComponents: ['app-server', 'container', 'db-server'],
      notes:
        'Self-hosted workflow automation with Docker; PostgreSQL or SQLite for workflow and execution data persistence',
      notesKo:
        'Docker 기반 셀프 호스팅 워크플로우 자동화; 워크플로우 및 실행 데이터 지속성을 위한 PostgreSQL 또는 SQLite',
    },
    {
      platform: 'cloud',
      os: ['n8n Cloud (Managed SaaS)'],
      installMethod: 'Sign up at n8n.io; instant access to managed workflow automation platform',
      installMethodKo: 'n8n.io에서 가입; 관리형 워크플로우 자동화 플랫폼 즉시 접근',
      minRequirements: {
        network: 'Internet connection (HTTPS)',
      },
      infraComponents: ['app-server', 'api-gateway'],
      notes:
        'Managed cloud version with automatic updates, backups, and team collaboration features',
      notesKo:
        '자동 업데이트, 백업, 팀 협업 기능이 포함된 관리형 클라우드 버전',
    },
  ],
  integrations: [
    {
      target: 'REST API / Webhooks',
      method: 'webhook',
      infraComponents: ['api-gateway', 'app-server'],
      protocol: 'HTTPS',
      description: 'Trigger workflows via webhook endpoints or call external APIs with 400+ built-in integrations',
      descriptionKo: '웹훅 엔드포인트를 통해 워크플로우 트리거 또는 400개 이상의 내장 통합으로 외부 API 호출',
    },
    {
      target: 'Database Connectors',
      method: 'native',
      infraComponents: ['db-server'],
      description: 'Direct database access for PostgreSQL, MySQL, MongoDB, and other databases in workflows',
      descriptionKo: '워크플로우에서 PostgreSQL, MySQL, MongoDB 및 기타 데이터베이스에 직접 접근',
    },
    {
      target: 'AI/LLM Nodes',
      method: 'api',
      infraComponents: ['app-server', 'api-gateway'],
      protocol: 'REST',
      description: 'AI workflow nodes for OpenAI, Anthropic, and local LLM integration in automation chains',
      descriptionKo: '자동화 체인에서 OpenAI, Anthropic 및 로컬 LLM 통합을 위한 AI 워크플로우 노드',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Workflow executions exceed 10,000/day or need high-availability multi-worker setup',
      triggerKo: '워크플로우 실행이 일 10,000회 초과 또는 고가용성 멀티 워커 설정 필요',
      from: ['app-server', 'container', 'db-server'],
      to: ['app-server', 'container', 'db-server', 'load-balancer', 'kubernetes', 'cache'],
      cloudServices: ['AWS ECS', 'GCP Cloud Run', 'n8n Cloud Enterprise'],
      reason:
        'Single n8n instance has execution throughput limits; multi-worker queue mode with dedicated database and Redis needed',
      reasonKo:
        '단일 n8n 인스턴스에 실행 처리량 제한; 전용 데이터베이스와 Redis가 포함된 멀티 워커 큐 모드 필요',
    },
  ],
  embeddingText:
    'n8n workflow automation self-hosted Docker 400+ integrations webhook API database AI nodes low-code open-source',
  embeddingTextKo:
    'n8n 워크플로우 자동화 셀프 호스팅 Docker 400개 이상 통합 웹훅 API 데이터베이스 AI 노드 로우코드 오픈소스',
};

// ---------------------------------------------------------------------------
// Zapier
// ---------------------------------------------------------------------------

const zapier: ProductIntelligence = {
  id: 'PI-INT-006',
  productId: 'zapier',
  name: 'Zapier',
  nameKo: 'Zapier (재피어)',
  category: 'devops',
  sourceUrl: 'https://zapier.com/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['SaaS (Web-based)'],
      installMethod: 'Sign up at zapier.com; create Zaps using visual workflow editor in browser',
      installMethodKo: 'zapier.com에서 가입; 브라우저에서 비주얼 워크플로우 편집기로 Zap 생성',
      minRequirements: {
        network: 'Internet connection (HTTPS)',
      },
      infraComponents: ['api-gateway'],
      notes:
        'Cloud-only SaaS platform; 6,000+ app integrations with no-code automation; no self-hosting option',
      notesKo:
        '클라우드 전용 SaaS 플랫폼; 6,000개 이상의 앱 통합과 노코드 자동화; 셀프 호스팅 옵션 없음',
    },
  ],
  integrations: [
    {
      target: 'Webhooks by Zapier',
      method: 'webhook',
      infraComponents: ['api-gateway'],
      protocol: 'HTTPS',
      description: 'Custom webhook triggers and actions for integrating any HTTP-based service',
      descriptionKo: '모든 HTTP 기반 서비스 통합을 위한 커스텀 웹훅 트리거 및 액션',
    },
    {
      target: '6000+ Apps',
      method: 'api',
      infraComponents: ['api-gateway'],
      protocol: 'REST',
      description: 'Pre-built connectors for 6,000+ apps including Slack, Salesforce, Google Workspace, and more',
      descriptionKo: 'Slack, Salesforce, Google Workspace 등 6,000개 이상의 앱을 위한 사전 구축 커넥터',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Need custom logic, self-hosted data processing, or sub-second latency automation',
      triggerKo: '커스텀 로직, 셀프 호스팅 데이터 처리 또는 1초 미만 지연 시간 자동화 필요',
      from: ['api-gateway'],
      to: ['app-server', 'container', 'api-gateway', 'db-server'],
      cloudServices: ['n8n Cloud', 'AWS Step Functions', 'Temporal Cloud'],
      reason:
        'Zapier has execution time limits and restricted custom code; self-hosted solutions like n8n or orchestration platforms provide full control',
      reasonKo:
        'Zapier에 실행 시간 제한과 제한된 커스텀 코드; n8n 같은 셀프 호스팅 솔루션이나 오케스트레이션 플랫폼이 전체 제어 제공',
    },
  ],
  embeddingText:
    'Zapier no-code automation SaaS 6000+ integrations webhook Zap trigger action cloud workflow connector',
  embeddingTextKo:
    'Zapier 노코드 자동화 SaaS 6000개 이상 통합 웹훅 Zap 트리거 액션 클라우드 워크플로우 커넥터',
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Communication & integration product intelligence data (6 products) */
export const integrationProducts: ProductIntelligence[] = [
  slack,
  discord,
  githubActions,
  microsoftTeams,
  n8n,
  zapier,
];
