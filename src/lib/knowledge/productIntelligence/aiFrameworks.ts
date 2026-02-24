/**
 * Product Intelligence - AI Framework Products
 *
 * AI orchestration frameworks that help developers build LLM-powered
 * applications with chains, agents, RAG pipelines, and tool integration.
 *
 * Products: LangChain, LlamaIndex, Haystack, Semantic Kernel, Dify
 */

import type { ProductIntelligence } from './types';

// ---------------------------------------------------------------------------
// LangChain
// ---------------------------------------------------------------------------

const langchain: ProductIntelligence = {
  id: 'PI-FW-001',
  productId: 'langchain',
  name: 'LangChain',
  nameKo: 'LangChain (랭체인)',
  category: 'ai-framework',
  sourceUrl: 'https://github.com/langchain-ai/langchain',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Linux', 'Windows'],
      installMethod: 'pip install langchain langchain-openai langchain-community',
      installMethodKo: 'pip install langchain langchain-openai langchain-community (Python 패키지 설치)',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '2 GB',
      },
      infraComponents: ['ai-orchestrator', 'app-server'],
      notes:
        'Python package for local development; minimal resources needed as LangChain orchestrates calls to external LLMs',
      notesKo:
        '로컬 개발을 위한 Python 패키지; LangChain이 외부 LLM 호출을 오케스트레이션하므로 최소 리소스 필요',
    },
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'RHEL 9'],
      installMethod: 'docker compose up (LangServe or custom FastAPI app)',
      installMethodKo: 'docker compose up (LangServe 또는 커스텀 FastAPI 앱, Docker 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '20 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['ai-orchestrator', 'app-server', 'container'],
      notes:
        'Production deployment via LangServe (FastAPI-based); serves chains and agents as REST endpoints',
      notesKo:
        'LangServe(FastAPI 기반)를 통한 운영 배포; 체인과 에이전트를 REST 엔드포인트로 서빙',
    },
    {
      platform: 'cloud',
      os: ['Linux (LangSmith Cloud)'],
      installMethod: 'Deploy via LangSmith platform or cloud container services',
      installMethodKo: 'LangSmith 플랫폼 또는 클라우드 컨테이너 서비스를 통해 배포',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '20 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['ai-orchestrator', 'app-server', 'container', 'load-balancer'],
      notes:
        'Cloud deployment with LangSmith for tracing, monitoring, and evaluation of LLM applications',
      notesKo:
        'LLM 애플리케이션 추적, 모니터링, 평가를 위한 LangSmith 포함 클라우드 배포',
    },
  ],
  integrations: [
    {
      target: 'Ollama',
      method: 'api',
      infraComponents: ['inference-engine', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'ChatOllama integration for local LLM inference within LangChain chains and agents',
      descriptionKo:
        'LangChain 체인과 에이전트 내 로컬 LLM 추론을 위한 ChatOllama 연동',
    },
    {
      target: 'OpenAI API',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'api-gateway'],
      protocol: 'REST',
      description:
        'ChatOpenAI integration for GPT models; supports function calling, streaming, and structured output',
      descriptionKo:
        'GPT 모델용 ChatOpenAI 연동; 함수 호출, 스트리밍, 구조화된 출력 지원',
    },
    {
      target: 'ChromaDB',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'Vector store integration for RAG pipelines; supports similarity search and document retrieval',
      descriptionKo:
        'RAG 파이프라인을 위한 벡터 스토어 연동; 유사도 검색 및 문서 검색 지원',
    },
    {
      target: 'Pinecone',
      method: 'api',
      infraComponents: ['vector-db', 'api-gateway'],
      protocol: 'REST',
      description:
        'Managed vector database integration for production-scale RAG applications',
      descriptionKo:
        '프로덕션 규모 RAG 애플리케이션을 위한 관리형 벡터 데이터베이스 연동',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Chain latency exceeds SLA or concurrent agent sessions exceed 100',
      triggerKo: '체인 지연 시간이 SLA 초과 또는 동시 에이전트 세션 100건 초과',
      from: ['ai-orchestrator', 'app-server', 'container'],
      to: ['ai-orchestrator', 'app-server', 'container', 'load-balancer', 'kubernetes', 'cache'],
      cloudServices: ['AWS ECS', 'GCP Cloud Run', 'LangSmith'],
      reason:
        'High-concurrency LLM orchestration requires horizontal scaling with caching and load distribution',
      reasonKo:
        '고동시성 LLM 오케스트레이션에 캐싱과 부하 분산을 통한 수평 확장 필요',
    },
  ],
  embeddingText:
    'LangChain AI orchestration framework chains agents RAG LangServe OpenAI Ollama ChromaDB Pinecone Python LLM application building',
  embeddingTextKo:
    'LangChain AI 오케스트레이션 프레임워크 체인 에이전트 RAG LangServe OpenAI Ollama ChromaDB Pinecone Python LLM 애플리케이션 구축',
};

// ---------------------------------------------------------------------------
// LlamaIndex
// ---------------------------------------------------------------------------

const llamaindex: ProductIntelligence = {
  id: 'PI-FW-002',
  productId: 'llamaindex',
  name: 'LlamaIndex',
  nameKo: 'LlamaIndex (라마인덱스)',
  category: 'ai-framework',
  sourceUrl: 'https://github.com/run-llama/llama_index',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Linux', 'Windows'],
      installMethod: 'pip install llama-index',
      installMethodKo: 'pip install llama-index (Python 패키지 설치)',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '2 GB',
      },
      infraComponents: ['ai-orchestrator', 'app-server', 'vector-db'],
      notes:
        'Python package for local RAG development; includes built-in vector store for prototyping',
      notesKo:
        '로컬 RAG 개발을 위한 Python 패키지; 프로토타이핑을 위한 내장 벡터 스토어 포함',
    },
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'RHEL 9'],
      installMethod: 'docker compose up (FastAPI/Flask app with llama-index)',
      installMethodKo: 'docker compose up (llama-index 포함 FastAPI/Flask 앱, Docker 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '16 GB',
        storage: '50 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['ai-orchestrator', 'app-server', 'container', 'vector-db'],
      notes:
        'Production RAG pipeline with external vector store; supports 160+ data connectors for document ingestion',
      notesKo:
        '외부 벡터 스토어를 활용한 운영 RAG 파이프라인; 문서 수집을 위한 160개 이상의 데이터 커넥터 지원',
    },
  ],
  integrations: [
    {
      target: 'ChromaDB',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'ChromaDB vector store backend for persistent document indexing and retrieval',
      descriptionKo:
        '영구 문서 인덱싱 및 검색을 위한 ChromaDB 벡터 스토어 백엔드',
    },
    {
      target: 'OpenAI API',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'api-gateway'],
      protocol: 'REST',
      description:
        'Default LLM provider for query synthesis, summarization, and response generation',
      descriptionKo:
        '쿼리 합성, 요약, 응답 생성을 위한 기본 LLM 공급자',
    },
    {
      target: 'LlamaParse',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'app-server'],
      protocol: 'REST',
      description:
        'Document parsing service for complex PDFs, tables, and images before indexing',
      descriptionKo:
        '인덱싱 전 복잡한 PDF, 테이블, 이미지 파싱을 위한 문서 파싱 서비스',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Document index exceeds 1M vectors or query latency exceeds acceptable threshold',
      triggerKo: '문서 인덱스 100만 벡터 초과 또는 쿼리 지연 시간이 허용 임계값 초과',
      from: ['ai-orchestrator', 'app-server', 'vector-db'],
      to: ['ai-orchestrator', 'app-server', 'vector-db', 'container', 'kubernetes', 'load-balancer'],
      cloudServices: ['Pinecone Cloud', 'AWS OpenSearch', 'LlamaCloud'],
      reason:
        'Large-scale RAG requires managed vector DB with sharding and dedicated query infrastructure',
      reasonKo:
        '대규모 RAG에 샤딩과 전용 쿼리 인프라를 갖춘 관리형 벡터 DB 필요',
    },
  ],
  embeddingText:
    'LlamaIndex RAG framework data connectors document indexing vector store query engine Python LLM retrieval augmented generation',
  embeddingTextKo:
    'LlamaIndex RAG 프레임워크 데이터 커넥터 문서 인덱싱 벡터 스토어 쿼리 엔진 Python LLM 검색 증강 생성',
};

// ---------------------------------------------------------------------------
// Haystack
// ---------------------------------------------------------------------------

const haystack: ProductIntelligence = {
  id: 'PI-FW-003',
  productId: 'deepset-haystack',
  name: 'Haystack',
  nameKo: 'Haystack (헤이스택)',
  category: 'ai-framework',
  sourceUrl: 'https://github.com/deepset-ai/haystack',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'macOS'],
      installMethod: 'pip install haystack-ai && docker compose up (with document store)',
      installMethodKo: 'pip install haystack-ai && docker compose up (문서 스토어 포함 Docker 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '20 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['ai-orchestrator', 'app-server', 'container'],
      notes:
        'Pipeline-based NLP framework; composable components for retrieval, generation, and evaluation',
      notesKo:
        '파이프라인 기반 NLP 프레임워크; 검색, 생성, 평가를 위한 조합 가능한 컴포넌트',
    },
    {
      platform: 'cloud',
      os: ['Linux (deepset Cloud)'],
      installMethod: 'Deploy via deepset Cloud platform or cloud container services',
      installMethodKo: 'deepset Cloud 플랫폼 또는 클라우드 컨테이너 서비스를 통해 배포',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '20 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['ai-orchestrator', 'app-server', 'container', 'load-balancer'],
      notes:
        'Managed cloud deployment via deepset Cloud with built-in pipeline management and monitoring',
      notesKo:
        '내장 파이프라인 관리 및 모니터링이 포함된 deepset Cloud 관리형 클라우드 배포',
    },
  ],
  integrations: [
    {
      target: 'Elasticsearch',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'app-server'],
      protocol: 'REST',
      description:
        'Elasticsearch document store for full-text and semantic search in NLP pipelines',
      descriptionKo:
        'NLP 파이프라인에서 전문 검색 및 시맨틱 검색을 위한 Elasticsearch 문서 스토어',
    },
    {
      target: 'OpenAI API',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'api-gateway'],
      protocol: 'REST',
      description:
        'LLM generator component for answer synthesis and prompt-based processing',
      descriptionKo:
        '답변 합성 및 프롬프트 기반 처리를 위한 LLM 생성기 컴포넌트',
    },
    {
      target: 'Hugging Face',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'inference-engine'],
      protocol: 'REST',
      description:
        'Hugging Face model integration for embedding, classification, and local inference',
      descriptionKo:
        '임베딩, 분류, 로컬 추론을 위한 Hugging Face 모델 연동',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Pipeline throughput bottleneck or need multi-tenant document processing',
      triggerKo: '파이프라인 처리량 병목 또는 다중 테넌트 문서 처리 필요',
      from: ['ai-orchestrator', 'app-server', 'container'],
      to: ['ai-orchestrator', 'app-server', 'container', 'kubernetes', 'load-balancer'],
      cloudServices: ['deepset Cloud', 'AWS ECS', 'Azure Kubernetes Service'],
      reason:
        'Multi-tenant NLP pipelines require orchestration and horizontal scaling for document processing throughput',
      reasonKo:
        '다중 테넌트 NLP 파이프라인에 문서 처리 처리량을 위한 오케스트레이션과 수평 확장 필요',
    },
  ],
  embeddingText:
    'Haystack NLP pipeline framework deepset retrieval generation evaluation Elasticsearch OpenAI Hugging Face document processing',
  embeddingTextKo:
    'Haystack NLP 파이프라인 프레임워크 deepset 검색 생성 평가 Elasticsearch OpenAI Hugging Face 문서 처리',
};

// ---------------------------------------------------------------------------
// Semantic Kernel
// ---------------------------------------------------------------------------

const semanticKernel: ProductIntelligence = {
  id: 'PI-FW-004',
  productId: 'microsoft-semantic-kernel',
  name: 'Semantic Kernel',
  nameKo: 'Semantic Kernel (시맨틱 커널)',
  category: 'ai-framework',
  sourceUrl: 'https://github.com/microsoft/semantic-kernel',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux', 'Windows', 'macOS'],
      installMethod: 'dotnet add package Microsoft.SemanticKernel (or pip install semantic-kernel)',
      installMethodKo: 'dotnet add package Microsoft.SemanticKernel (또는 pip install semantic-kernel)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['ai-orchestrator', 'app-server', 'container'],
      notes:
        'Multi-language SDK (.NET, Python, Java); integrates AI orchestration into existing enterprise applications',
      notesKo:
        '다중 언어 SDK (.NET, Python, Java); 기존 기업 애플리케이션에 AI 오케스트레이션 통합',
    },
    {
      platform: 'cloud',
      os: ['Linux (Azure App Service)', 'Windows (Azure Functions)'],
      installMethod: 'Deploy to Azure App Service or Azure Functions with Semantic Kernel SDK',
      installMethodKo: 'Semantic Kernel SDK로 Azure App Service 또는 Azure Functions에 배포',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['ai-orchestrator', 'app-server', 'container', 'load-balancer'],
      notes:
        'Azure-native deployment with tight integration into Azure OpenAI, Cosmos DB, and Azure AI Search',
      notesKo:
        'Azure OpenAI, Cosmos DB, Azure AI Search와의 긴밀한 통합이 포함된 Azure 네이티브 배포',
    },
  ],
  integrations: [
    {
      target: 'Azure OpenAI',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'api-gateway'],
      protocol: 'REST',
      description:
        'Native Azure OpenAI service connector with enterprise-grade authentication and compliance',
      descriptionKo:
        '엔터프라이즈급 인증 및 컴플라이언스가 포함된 네이티브 Azure OpenAI 서비스 커넥터',
    },
    {
      target: 'OpenAI API',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'api-gateway'],
      protocol: 'REST',
      description:
        'OpenAI API connector for GPT models with plugin and function calling support',
      descriptionKo:
        '플러그인 및 함수 호출 지원이 포함된 GPT 모델용 OpenAI API 커넥터',
    },
    {
      target: 'Microsoft 365',
      method: 'plugin',
      infraComponents: ['ai-orchestrator', 'app-server'],
      description:
        'Plugin architecture for Microsoft 365 (Teams, Outlook, SharePoint) AI copilot scenarios',
      descriptionKo:
        'Microsoft 365 (Teams, Outlook, SharePoint) AI 코파일럿 시나리오를 위한 플러그인 아키텍처',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Enterprise-wide AI copilot deployment with 1000+ users and compliance requirements',
      triggerKo: '1000명 이상 사용자와 컴플라이언스 요구사항이 있는 기업 전체 AI 코파일럿 배포',
      from: ['ai-orchestrator', 'app-server', 'container'],
      to: ['ai-orchestrator', 'app-server', 'container', 'kubernetes', 'load-balancer', 'cache'],
      cloudServices: ['Azure Kubernetes Service', 'Azure OpenAI', 'Azure AI Search'],
      reason:
        'Enterprise AI copilot at scale requires Kubernetes orchestration, caching, and managed Azure services',
      reasonKo:
        '대규모 기업 AI 코파일럿에 Kubernetes 오케스트레이션, 캐싱, 관리형 Azure 서비스 필요',
    },
  ],
  embeddingText:
    'Semantic Kernel Microsoft AI orchestration SDK .NET Python Azure OpenAI plugins enterprise copilot function calling',
  embeddingTextKo:
    'Semantic Kernel Microsoft AI 오케스트레이션 SDK .NET Python Azure OpenAI 플러그인 기업 코파일럿 함수 호출',
};

// ---------------------------------------------------------------------------
// Dify
// ---------------------------------------------------------------------------

const dify: ProductIntelligence = {
  id: 'PI-FW-005',
  productId: 'dify',
  name: 'Dify',
  nameKo: 'Dify (디파이)',
  category: 'ai-framework',
  sourceUrl: 'https://github.com/langgenius/dify',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'macOS'],
      installMethod: 'docker compose up -d (Docker Compose self-hosted)',
      installMethodKo: 'docker compose up -d (Docker Compose 셀프 호스팅 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '30 GB SSD',
        network: '100 Mbps',
      },
      infraComponents: ['web-server', 'container', 'ai-orchestrator', 'db-server'],
      notes:
        'Self-hosted deployment with PostgreSQL, Redis, and Weaviate/Qdrant for vector storage; visual workflow builder',
      notesKo:
        'PostgreSQL, Redis, 벡터 저장을 위한 Weaviate/Qdrant가 포함된 셀프 호스팅 배포; 시각적 워크플로우 빌더',
    },
    {
      platform: 'cloud',
      os: ['Linux (Dify Cloud SaaS)'],
      installMethod: 'Sign up at dify.ai and use managed cloud instance',
      installMethodKo: 'dify.ai에서 가입하고 관리형 클라우드 인스턴스 사용',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '10 GB',
        network: '100 Mbps',
      },
      infraComponents: ['web-server', 'ai-orchestrator', 'db-server'],
      notes:
        'Managed SaaS with built-in RAG, agent workflows, and multi-model support; free tier available',
      notesKo:
        '내장 RAG, 에이전트 워크플로우, 다중 모델 지원이 포함된 관리형 SaaS; 무료 티어 제공',
    },
  ],
  integrations: [
    {
      target: 'Multiple LLM Providers',
      method: 'api',
      infraComponents: ['ai-orchestrator', 'api-gateway'],
      protocol: 'REST',
      description:
        'Supports OpenAI, Anthropic, Azure OpenAI, Ollama, Hugging Face, and 50+ model providers',
      descriptionKo:
        'OpenAI, Anthropic, Azure OpenAI, Ollama, Hugging Face 등 50개 이상 모델 공급자 지원',
    },
    {
      target: 'Vector Databases',
      method: 'native',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      description:
        'Built-in RAG with support for Weaviate, Qdrant, Pinecone, Milvus, and ChromaDB',
      descriptionKo:
        'Weaviate, Qdrant, Pinecone, Milvus, ChromaDB를 지원하는 내장 RAG',
    },
    {
      target: 'REST API',
      method: 'api',
      infraComponents: ['web-server', 'api-gateway'],
      protocol: 'REST',
      description:
        'RESTful API for embedding Dify workflows into external applications and services',
      descriptionKo:
        '외부 애플리케이션 및 서비스에 Dify 워크플로우를 임베딩하기 위한 RESTful API',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Team exceeds 50 users or workflow execution volume requires dedicated infrastructure',
      triggerKo: '팀 50명 초과 또는 워크플로우 실행량에 전용 인프라 필요',
      from: ['web-server', 'container', 'ai-orchestrator', 'db-server'],
      to: ['web-server', 'container', 'ai-orchestrator', 'db-server', 'kubernetes', 'load-balancer', 'vector-db'],
      cloudServices: ['AWS ECS', 'GCP Cloud Run', 'Azure Container Instances'],
      reason:
        'High-volume workflow execution requires horizontal scaling, dedicated vector DB, and load balancing',
      reasonKo:
        '대량 워크플로우 실행에 수평 확장, 전용 벡터 DB, 로드 밸런싱 필요',
    },
  ],
  embeddingText:
    'Dify visual AI workflow builder RAG self-hosted Docker LLM orchestration multi-model agents knowledge base no-code',
  embeddingTextKo:
    'Dify 시각적 AI 워크플로우 빌더 RAG 셀프 호스팅 Docker LLM 오케스트레이션 다중 모델 에이전트 지식 베이스 노코드',
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** AI framework product intelligence data (5 products) */
export const aiFrameworkProducts: ProductIntelligence[] = [
  langchain,
  llamaindex,
  haystack,
  semanticKernel,
  dify,
];
