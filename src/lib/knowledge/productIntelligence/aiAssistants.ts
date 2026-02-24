/**
 * Product Intelligence - AI Assistant Products
 *
 * Self-hosted / local-first AI assistant tools that users deploy
 * on desktop, mobile, or server infrastructure.
 *
 * Products: OpenClaw, Open WebUI, Jan.ai, LobeChat, Anything LLM, LibreChat
 */

import type { ProductIntelligence } from './types';

// ---------------------------------------------------------------------------
// OpenClaw
// ---------------------------------------------------------------------------

const openclaw: ProductIntelligence = {
  id: 'PI-AST-001',
  productId: 'openclaw-ai',
  name: 'OpenClaw',
  nameKo: 'OpenClaw (오픈클로)',
  category: 'ai-assistant',
  sourceUrl: 'https://openclaw.ai/',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['Linux', 'macOS', 'Windows'],
      installMethod: 'pip install openclaw',
      installMethodKo: 'pip install openclaw (Python 패키지 설치)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '5 GB',
      },
      infraComponents: ['app-server'],
      notes: 'Python-based desktop installation, works without GPU for small models',
      notesKo: 'Python 기반 데스크톱 설치, 소형 모델은 GPU 없이 동작',
    },
    {
      platform: 'mobile',
      os: ['Android (Termux)'],
      installMethod: 'pkg install python && pip install openclaw',
      installMethodKo: 'pkg install python && pip install openclaw (Termux 환경)',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '3 GB',
      },
      infraComponents: ['edge-device', 'mobile-device'],
      notes: 'Runs on Android via Termux; limited to smaller models due to RAM constraints',
      notesKo: 'Termux를 통해 Android에서 실행; RAM 제약으로 소형 모델에 제한',
    },
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'RHEL 9'],
      installMethod: 'docker run openclaw/server',
      installMethodKo: 'docker run openclaw/server (Docker 컨테이너 배포)',
      minRequirements: {
        cpu: '8 cores',
        ram: '16 GB',
        vram: '8 GB',
        storage: '50 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['gpu-server', 'container', 'inference-engine'],
      notes: 'Production server deployment with GPU acceleration for inference',
      notesKo: '추론을 위한 GPU 가속이 포함된 운영 서버 배포',
    },
  ],
  integrations: [
    {
      target: 'Slack',
      method: 'webhook',
      infraComponents: ['api-gateway'],
      protocol: 'REST',
      description: 'Slack bot integration via incoming webhooks for team AI access',
      descriptionKo: 'Incoming Webhook을 통한 Slack 봇 연동으로 팀 AI 접근 제공',
    },
    {
      target: 'Ollama',
      method: 'api',
      infraComponents: ['inference-engine'],
      protocol: 'REST',
      description: 'Connect to local Ollama instance for LLM inference backend',
      descriptionKo: 'LLM 추론 백엔드로 로컬 Ollama 인스턴스에 연결',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Team exceeds 10 users with concurrent inference requests',
      triggerKo: '동시 추론 요청이 있는 팀 사용자 10명 초과',
      from: ['gpu-server', 'container'],
      to: ['ai-cluster', 'load-balancer', 'kubernetes', 'container'],
      cloudServices: ['AWS SageMaker', 'AWS ECS'],
      reason:
        'Single GPU server cannot handle concurrent inference; need cluster with load distribution',
      reasonKo:
        '단일 GPU 서버로 동시 추론 처리 불가; 부하 분산이 가능한 클러스터 필요',
    },
  ],
  embeddingText:
    'OpenClaw AI assistant desktop mobile server Docker Slack Ollama inference local-first team deployment GPU cluster',
  embeddingTextKo:
    'OpenClaw AI 어시스턴트 데스크톱 모바일 서버 Docker Slack Ollama 추론 로컬 우선 팀 배포 GPU 클러스터',
};

// ---------------------------------------------------------------------------
// Open WebUI
// ---------------------------------------------------------------------------

const openWebUI: ProductIntelligence = {
  id: 'PI-AST-002',
  productId: 'open-webui',
  name: 'Open WebUI',
  nameKo: 'Open WebUI (오픈 웹UI)',
  category: 'ai-assistant',
  sourceUrl: 'https://github.com/open-webui/open-webui',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux', 'macOS', 'Windows (WSL)'],
      installMethod: 'docker run -d -p 3000:8080 ghcr.io/open-webui/open-webui:main',
      installMethodKo:
        'docker run -d -p 3000:8080 ghcr.io/open-webui/open-webui:main (Docker 컨테이너)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB SSD',
        network: '100 Mbps',
      },
      infraComponents: ['web-server', 'container', 'inference-engine'],
      notes:
        'Docker is the recommended deployment method; connects to Ollama or OpenAI-compatible APIs',
      notesKo:
        'Docker가 권장 배포 방식; Ollama 또는 OpenAI 호환 API에 연결',
    },
    {
      platform: 'desktop',
      os: ['Linux', 'macOS', 'Windows'],
      installMethod: 'pip install open-webui && open-webui serve',
      installMethodKo:
        'pip install open-webui && open-webui serve (Python 패키지 직접 실행)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '5 GB',
      },
      infraComponents: ['app-server', 'web-server'],
      notes: 'Python-based local run without Docker; suitable for development or single-user',
      notesKo: 'Docker 없이 Python 기반 로컬 실행; 개발 또는 단일 사용자에 적합',
    },
  ],
  integrations: [
    {
      target: 'Ollama',
      method: 'api',
      infraComponents: ['inference-engine'],
      protocol: 'REST',
      description: 'Primary LLM backend via Ollama local inference engine',
      descriptionKo: 'Ollama 로컬 추론 엔진을 통한 주요 LLM 백엔드',
    },
    {
      target: 'OpenAI API',
      method: 'api',
      infraComponents: ['api-gateway'],
      protocol: 'REST',
      description: 'OpenAI-compatible API support for cloud LLM providers',
      descriptionKo: '클라우드 LLM 공급자를 위한 OpenAI 호환 API 지원',
    },
    {
      target: 'LDAP/SSO',
      method: 'native',
      infraComponents: ['ldap-ad', 'sso'],
      description: 'Enterprise authentication via LDAP or SSO for user management',
      descriptionKo: '사용자 관리를 위한 LDAP 또는 SSO 기반 기업 인증',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Concurrent users exceed 20 or need multi-model serving',
      triggerKo: '동시 사용자 20명 초과 또는 다중 모델 서빙 필요',
      from: ['web-server', 'container'],
      to: ['web-server', 'container', 'load-balancer', 'gpu-server', 'kubernetes'],
      cloudServices: ['AWS ECS', 'Azure Container Instances'],
      reason:
        'Single container cannot serve multiple concurrent users with different models efficiently',
      reasonKo: '단일 컨테이너로 여러 모델을 사용하는 다수 동시 사용자를 효율적으로 처리 불가',
    },
  ],
  embeddingText:
    'Open WebUI web interface Ollama OpenAI Docker self-hosted LDAP SSO multi-model chat server deployment',
  embeddingTextKo:
    'Open WebUI 웹 인터페이스 Ollama OpenAI Docker 셀프 호스팅 LDAP SSO 다중 모델 채팅 서버 배포',
};

// ---------------------------------------------------------------------------
// Jan.ai
// ---------------------------------------------------------------------------

const janAI: ProductIntelligence = {
  id: 'PI-AST-003',
  productId: 'jan-ai',
  name: 'Jan.ai',
  nameKo: 'Jan.ai (잔 AI)',
  category: 'ai-assistant',
  sourceUrl: 'https://jan.ai/',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Windows', 'Linux'],
      installMethod: 'Download native installer from jan.ai',
      installMethodKo: 'jan.ai에서 네이티브 설치 프로그램 다운로드',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB',
      },
      infraComponents: ['app-server', 'edge-device'],
      notes:
        'Local-first native app; downloads and runs models locally without server dependency',
      notesKo:
        '로컬 우선 네이티브 앱; 서버 의존 없이 모델을 로컬에서 다운로드하고 실행',
    },
  ],
  integrations: [
    {
      target: 'Hugging Face',
      method: 'api',
      infraComponents: ['app-server'],
      protocol: 'REST',
      description: 'Download and run models from Hugging Face model hub',
      descriptionKo: 'Hugging Face 모델 허브에서 모델 다운로드 및 실행',
    },
    {
      target: 'OpenAI API',
      method: 'api',
      infraComponents: ['api-gateway'],
      protocol: 'REST',
      description: 'OpenAI-compatible local server API for tool integration',
      descriptionKo: '도구 연동을 위한 OpenAI 호환 로컬 서버 API',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Need larger models (70B+) or multi-user access',
      triggerKo: '대형 모델(70B+) 또는 다중 사용자 접근 필요',
      from: ['app-server', 'edge-device'],
      to: ['gpu-server', 'inference-engine', 'load-balancer'],
      cloudServices: ['AWS SageMaker', 'GCP Vertex AI'],
      reason:
        'Desktop GPU insufficient for large models; dedicated GPU server with inference engine needed',
      reasonKo: '대형 모델에 데스크톱 GPU 불충분; 전용 GPU 서버와 추론 엔진 필요',
    },
  ],
  embeddingText:
    'Jan.ai local-first desktop AI assistant native app offline models Hugging Face privacy-focused edge deployment',
  embeddingTextKo:
    'Jan.ai 로컬 우선 데스크톱 AI 어시스턴트 네이티브 앱 오프라인 모델 Hugging Face 프라이버시 중심 엣지 배포',
};

// ---------------------------------------------------------------------------
// LobeChat
// ---------------------------------------------------------------------------

const lobeChat: ProductIntelligence = {
  id: 'PI-AST-004',
  productId: 'lobechat',
  name: 'LobeChat',
  nameKo: 'LobeChat (로브챗)',
  category: 'ai-assistant',
  sourceUrl: 'https://github.com/lobehub/lobe-chat',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux', 'macOS', 'Windows (WSL)'],
      installMethod: 'docker run -d -p 3210:3210 lobehub/lobe-chat',
      installMethodKo: 'docker run -d -p 3210:3210 lobehub/lobe-chat (Docker 배포)',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '5 GB SSD',
        network: '100 Mbps',
      },
      infraComponents: ['web-server', 'container', 'app-server'],
      notes: 'Docker deployment recommended; also supports Vercel one-click deploy',
      notesKo: 'Docker 배포 권장; Vercel 원클릭 배포도 지원',
    },
    {
      platform: 'desktop',
      os: ['macOS', 'Windows', 'Linux'],
      installMethod: 'Download Electron desktop app from releases',
      installMethodKo: '릴리스에서 Electron 데스크톱 앱 다운로드',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '3 GB',
      },
      infraComponents: ['app-server', 'edge-device'],
      notes: 'Electron-based desktop client; connects to cloud LLM APIs',
      notesKo: 'Electron 기반 데스크톱 클라이언트; 클라우드 LLM API에 연결',
    },
  ],
  integrations: [
    {
      target: 'Multiple LLM Providers',
      method: 'api',
      infraComponents: ['api-gateway'],
      protocol: 'REST',
      description:
        'Supports OpenAI, Anthropic, Google, Ollama, and 10+ other LLM providers simultaneously',
      descriptionKo:
        'OpenAI, Anthropic, Google, Ollama 등 10개 이상의 LLM 공급자를 동시에 지원',
    },
    {
      target: 'Plugin Marketplace',
      method: 'plugin',
      infraComponents: ['app-server'],
      description: 'Extensible plugin system with marketplace for web search, code execution, etc.',
      descriptionKo: '웹 검색, 코드 실행 등을 위한 마켓플레이스가 있는 확장 가능한 플러그인 시스템',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Team deployment with shared conversations and user management',
      triggerKo: '공유 대화 및 사용자 관리가 필요한 팀 배포',
      from: ['web-server', 'container'],
      to: ['web-server', 'container', 'db-server', 'load-balancer', 'kubernetes'],
      cloudServices: ['Vercel', 'AWS ECS', 'Azure App Service'],
      reason:
        'Team use requires persistent database, authentication, and horizontal scaling for reliability',
      reasonKo: '팀 사용에는 영구 데이터베이스, 인증, 안정성을 위한 수평 확장이 필요',
    },
  ],
  embeddingText:
    'LobeChat multi-provider AI chat Docker Vercel Electron plugins marketplace self-hosted team collaboration',
  embeddingTextKo:
    'LobeChat 다중 공급자 AI 채팅 Docker Vercel Electron 플러그인 마켓플레이스 셀프 호스팅 팀 협업',
};

// ---------------------------------------------------------------------------
// Anything LLM
// ---------------------------------------------------------------------------

const anythingLLM: ProductIntelligence = {
  id: 'PI-AST-005',
  productId: 'anything-llm',
  name: 'Anything LLM',
  nameKo: 'Anything LLM (애니씽 LLM)',
  category: 'ai-assistant',
  sourceUrl: 'https://github.com/Mintplex-Labs/anything-llm',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Windows', 'Linux'],
      installMethod: 'Download native installer from anythingllm.com',
      installMethodKo: 'anythingllm.com에서 네이티브 설치 프로그램 다운로드',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB',
      },
      infraComponents: ['app-server', 'edge-device'],
      notes: 'All-in-one desktop app with built-in vector database and document processing',
      notesKo: '내장 벡터 데이터베이스와 문서 처리가 포함된 올인원 데스크톱 앱',
    },
    {
      platform: 'server',
      os: ['Linux', 'macOS', 'Windows (WSL)'],
      installMethod: 'docker compose up -d (Docker Compose)',
      installMethodKo: 'docker compose up -d (Docker Compose 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        vram: '4 GB',
        storage: '20 GB SSD',
        network: '100 Mbps',
      },
      infraComponents: ['app-server', 'container', 'vector-db'],
      notes: 'Server deployment with embedded vector DB for RAG; supports Ollama and cloud LLMs',
      notesKo: 'RAG용 내장 벡터 DB가 포함된 서버 배포; Ollama 및 클라우드 LLM 지원',
    },
  ],
  integrations: [
    {
      target: 'Ollama',
      method: 'api',
      infraComponents: ['inference-engine'],
      protocol: 'REST',
      description: 'Local LLM inference via Ollama for privacy-focused deployments',
      descriptionKo: '프라이버시 중심 배포를 위한 Ollama 기반 로컬 LLM 추론',
    },
    {
      target: 'Vector Databases',
      method: 'native',
      infraComponents: ['vector-db'],
      description:
        'Built-in support for ChromaDB, Pinecone, Weaviate, and LanceDB for RAG workflows',
      descriptionKo:
        'RAG 워크플로우를 위한 ChromaDB, Pinecone, Weaviate, LanceDB 내장 지원',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Document corpus exceeds 10K files or team usage with concurrent RAG queries',
      triggerKo: '문서 코퍼스 10K 파일 초과 또는 동시 RAG 쿼리가 있는 팀 사용',
      from: ['app-server', 'container', 'vector-db'],
      to: ['gpu-server', 'container', 'vector-db', 'load-balancer', 'kubernetes'],
      cloudServices: ['AWS OpenSearch', 'Pinecone Cloud'],
      reason:
        'Large document corpus needs dedicated vector DB cluster and GPU inference for acceptable latency',
      reasonKo:
        '대규모 문서 코퍼스에 허용 가능한 지연 시간을 위해 전용 벡터 DB 클러스터와 GPU 추론 필요',
    },
  ],
  embeddingText:
    'Anything LLM RAG vector database document processing ChromaDB Pinecone desktop server Docker self-hosted local inference',
  embeddingTextKo:
    'Anything LLM RAG 벡터 데이터베이스 문서 처리 ChromaDB Pinecone 데스크톱 서버 Docker 셀프 호스팅 로컬 추론',
};

// ---------------------------------------------------------------------------
// LibreChat
// ---------------------------------------------------------------------------

const libreChat: ProductIntelligence = {
  id: 'PI-AST-006',
  productId: 'librechat',
  name: 'LibreChat',
  nameKo: 'LibreChat (리브레챗)',
  category: 'ai-assistant',
  sourceUrl: 'https://github.com/danny-avila/LibreChat',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux', 'macOS', 'Windows (WSL)'],
      installMethod: 'docker compose up -d (Docker Compose with MongoDB)',
      installMethodKo: 'docker compose up -d (MongoDB 포함 Docker Compose 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '15 GB SSD',
        network: '100 Mbps',
      },
      infraComponents: ['web-server', 'container', 'db-server'],
      notes: 'Docker Compose deployment with MongoDB for persistent storage; Node.js backend',
      notesKo: 'MongoDB 영구 저장소가 포함된 Docker Compose 배포; Node.js 백엔드',
    },
    {
      platform: 'cloud',
      os: ['Linux (Docker on cloud VM)'],
      installMethod: 'Deploy to cloud VM with docker compose or managed container service',
      installMethodKo: 'Docker Compose 또는 관리형 컨테이너 서비스로 클라우드 VM에 배포',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '20 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['web-server', 'container', 'db-server', 'load-balancer'],
      notes: 'Cloud deployment with managed DB for team/enterprise use',
      notesKo: '팀/기업용 관리형 DB를 포함한 클라우드 배포',
    },
  ],
  integrations: [
    {
      target: 'Multi-Provider LLM',
      method: 'api',
      infraComponents: ['api-gateway'],
      protocol: 'REST',
      description:
        'Supports OpenAI, Anthropic, Google, Azure OpenAI, Ollama, and custom endpoints simultaneously',
      descriptionKo:
        'OpenAI, Anthropic, Google, Azure OpenAI, Ollama 및 커스텀 엔드포인트를 동시에 지원',
    },
    {
      target: 'LDAP',
      method: 'native',
      infraComponents: ['ldap-ad'],
      description: 'Enterprise LDAP authentication for centralized user management',
      descriptionKo: '중앙 집중식 사용자 관리를 위한 기업 LDAP 인증',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Enterprise deployment with 50+ users and compliance requirements',
      triggerKo: '50명 이상 사용자와 컴플라이언스 요구사항이 있는 기업 배포',
      from: ['web-server', 'container', 'db-server'],
      to: ['web-server', 'container', 'db-server', 'load-balancer', 'kubernetes', 'ldap-ad'],
      cloudServices: ['AWS ECS', 'Azure Kubernetes Service', 'AWS DocumentDB'],
      reason:
        'Enterprise scale requires orchestration, managed database, and centralized authentication',
      reasonKo:
        '기업 규모에 오케스트레이션, 관리형 데이터베이스, 중앙 집중식 인증 필요',
    },
  ],
  embeddingText:
    'LibreChat multi-provider chat platform Docker MongoDB LDAP enterprise self-hosted OpenAI Anthropic cloud deployment',
  embeddingTextKo:
    'LibreChat 다중 공급자 채팅 플랫폼 Docker MongoDB LDAP 기업용 셀프 호스팅 OpenAI Anthropic 클라우드 배포',
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** AI assistant product intelligence data (6 products) */
export const aiAssistantProducts: ProductIntelligence[] = [
  openclaw,
  openWebUI,
  janAI,
  lobeChat,
  anythingLLM,
  libreChat,
];
