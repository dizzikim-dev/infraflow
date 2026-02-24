/**
 * Product Intelligence - Vector Database Products
 *
 * Vector databases purpose-built for storing and querying high-dimensional
 * embeddings, enabling RAG, semantic search, and AI-powered retrieval.
 *
 * Products: ChromaDB, Pinecone, Milvus, Weaviate, Qdrant
 */

import type { ProductIntelligence } from './types';

// ---------------------------------------------------------------------------
// ChromaDB
// ---------------------------------------------------------------------------

const chromadb: ProductIntelligence = {
  id: 'PI-VDB-001',
  productId: 'chromadb',
  name: 'ChromaDB',
  nameKo: 'ChromaDB (크로마DB)',
  category: 'vector-db',
  sourceUrl: 'https://github.com/chroma-core/chroma',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Linux', 'Windows'],
      installMethod: 'pip install chromadb',
      installMethodKo: 'pip install chromadb (Python 패키지 설치)',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '2 GB',
      },
      infraComponents: ['vector-db', 'app-server'],
      notes:
        'In-process Python library for prototyping; stores embeddings locally with zero configuration',
      notesKo:
        '프로토타이핑을 위한 인프로세스 Python 라이브러리; 설정 없이 임베딩을 로컬에 저장',
    },
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'macOS'],
      installMethod: 'docker run -p 8000:8000 chromadb/chroma',
      installMethodKo: 'docker run -p 8000:8000 chromadb/chroma (Docker 서버 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '50 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['vector-db', 'container', 'app-server'],
      notes:
        'Client/server mode via Docker; persistent storage with multi-tenant support for production RAG',
      notesKo:
        'Docker를 통한 클라이언트/서버 모드; 운영 RAG를 위한 다중 테넌트 지원 영구 저장',
    },
    {
      platform: 'cloud',
      os: ['Linux (Chroma Cloud)'],
      installMethod: 'Sign up at trychroma.com for managed Chroma Cloud instance',
      installMethodKo: '관리형 Chroma Cloud 인스턴스를 위해 trychroma.com에서 가입',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '10 GB',
        network: '100 Mbps',
      },
      infraComponents: ['vector-db', 'api-gateway'],
      notes:
        'Managed cloud service with automatic scaling, backups, and monitoring',
      notesKo:
        '자동 스케일링, 백업, 모니터링이 포함된 관리형 클라우드 서비스',
    },
  ],
  integrations: [
    {
      target: 'LangChain',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'LangChain Chroma vector store integration for RAG pipelines and semantic search',
      descriptionKo:
        'RAG 파이프라인 및 시맨틱 검색을 위한 LangChain Chroma 벡터 스토어 연동',
    },
    {
      target: 'LlamaIndex',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'LlamaIndex ChromaVectorStore for document indexing and retrieval-augmented generation',
      descriptionKo:
        '문서 인덱싱 및 검색 증강 생성을 위한 LlamaIndex ChromaVectorStore 연동',
    },
    {
      target: 'OpenAI Embeddings',
      method: 'api',
      infraComponents: ['vector-db', 'api-gateway'],
      protocol: 'REST',
      description:
        'Automatic embedding generation via OpenAI embedding models during document ingestion',
      descriptionKo:
        '문서 수집 시 OpenAI 임베딩 모델을 통한 자동 임베딩 생성',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Collection exceeds 10M vectors or concurrent queries exceed 100 QPS',
      triggerKo: '컬렉션 1000만 벡터 초과 또는 동시 쿼리 100 QPS 초과',
      from: ['vector-db', 'container'],
      to: ['vector-db', 'container', 'load-balancer', 'kubernetes'],
      cloudServices: ['Chroma Cloud', 'AWS ECS'],
      reason:
        'Large collections need distributed storage and query parallelism for acceptable latency',
      reasonKo:
        '대규모 컬렉션에 허용 가능한 지연 시간을 위한 분산 저장 및 쿼리 병렬 처리 필요',
    },
  ],
  embeddingText:
    'ChromaDB lightweight vector database Python embedding storage RAG semantic search LangChain LlamaIndex Docker local prototyping',
  embeddingTextKo:
    'ChromaDB 경량 벡터 데이터베이스 Python 임베딩 저장 RAG 시맨틱 검색 LangChain LlamaIndex Docker 로컬 프로토타이핑',
};

// ---------------------------------------------------------------------------
// Pinecone
// ---------------------------------------------------------------------------

const pinecone: ProductIntelligence = {
  id: 'PI-VDB-002',
  productId: 'pinecone',
  name: 'Pinecone',
  nameKo: 'Pinecone (파인콘)',
  category: 'vector-db',
  sourceUrl: 'https://www.pinecone.io/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['SaaS (managed cloud)'],
      installMethod: 'pip install pinecone-client && configure API key via Pinecone console',
      installMethodKo: 'pip install pinecone-client && Pinecone 콘솔을 통해 API 키 설정',
      minRequirements: {
        cpu: '1 core (client)',
        ram: '2 GB (client)',
        storage: '1 GB (client)',
        network: '100 Mbps',
      },
      infraComponents: ['vector-db', 'api-gateway'],
      notes:
        'Fully managed cloud-only service; serverless and pod-based deployment options with auto-scaling',
      notesKo:
        '완전 관리형 클라우드 전용 서비스; 오토 스케일링이 포함된 서버리스 및 파드 기반 배포 옵션',
    },
  ],
  integrations: [
    {
      target: 'LangChain',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'LangChain PineconeVectorStore for production-grade RAG with managed infrastructure',
      descriptionKo:
        '관리형 인프라를 활용한 프로덕션급 RAG를 위한 LangChain PineconeVectorStore 연동',
    },
    {
      target: 'LlamaIndex',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'LlamaIndex Pinecone integration for scalable document retrieval and hybrid search',
      descriptionKo:
        '확장 가능한 문서 검색 및 하이브리드 검색을 위한 LlamaIndex Pinecone 연동',
    },
    {
      target: 'OpenAI Embeddings',
      method: 'api',
      infraComponents: ['vector-db', 'api-gateway'],
      protocol: 'REST',
      description:
        'Integrated embedding generation via OpenAI models with Pinecone Inference API',
      descriptionKo:
        'Pinecone Inference API를 통한 OpenAI 모델 기반 통합 임베딩 생성',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Serverless tier limits exceeded or need dedicated pods for low-latency SLA',
      triggerKo: '서버리스 티어 제한 초과 또는 저지연 SLA를 위한 전용 파드 필요',
      from: ['vector-db', 'api-gateway'],
      to: ['vector-db', 'api-gateway', 'load-balancer'],
      cloudServices: ['Pinecone Enterprise', 'Pinecone Dedicated Pods'],
      reason:
        'Enterprise-grade latency and throughput SLAs require dedicated pod infrastructure with guaranteed resources',
      reasonKo:
        '엔터프라이즈급 지연 시간 및 처리량 SLA에 보장된 리소스가 포함된 전용 파드 인프라 필요',
    },
  ],
  embeddingText:
    'Pinecone managed vector database cloud SaaS serverless pods RAG semantic search embedding API LangChain production enterprise',
  embeddingTextKo:
    'Pinecone 관리형 벡터 데이터베이스 클라우드 SaaS 서버리스 파드 RAG 시맨틱 검색 임베딩 API LangChain 프로덕션 엔터프라이즈',
};

// ---------------------------------------------------------------------------
// Milvus
// ---------------------------------------------------------------------------

const milvus: ProductIntelligence = {
  id: 'PI-VDB-003',
  productId: 'milvus',
  name: 'Milvus',
  nameKo: 'Milvus (밀버스)',
  category: 'vector-db',
  sourceUrl: 'https://github.com/milvus-io/milvus',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'macOS'],
      installMethod: 'docker compose up -d (Milvus standalone or cluster mode)',
      installMethodKo: 'docker compose up -d (Milvus 스탠드얼론 또는 클러스터 모드, Docker 배포)',
      minRequirements: {
        cpu: '8 cores',
        ram: '16 GB',
        storage: '100 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['vector-db', 'container', 'kubernetes'],
      notes:
        'Distributed vector database with standalone and cluster modes; supports billion-scale vector search',
      notesKo:
        '스탠드얼론 및 클러스터 모드를 갖춘 분산 벡터 데이터베이스; 수십억 규모 벡터 검색 지원',
    },
    {
      platform: 'cloud',
      os: ['Linux (Zilliz Cloud)'],
      installMethod: 'Sign up at zilliz.com for fully managed Milvus instance',
      installMethodKo: '완전 관리형 Milvus 인스턴스를 위해 zilliz.com에서 가입',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '50 GB',
        network: '1 Gbps',
      },
      infraComponents: ['vector-db', 'api-gateway', 'load-balancer'],
      notes:
        'Zilliz Cloud managed deployment with auto-scaling, monitoring, and enterprise support',
      notesKo:
        '오토 스케일링, 모니터링, 엔터프라이즈 지원이 포함된 Zilliz Cloud 관리형 배포',
    },
  ],
  integrations: [
    {
      target: 'LangChain',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'gRPC',
      description:
        'LangChain Milvus vector store for high-performance RAG with filtering and hybrid search',
      descriptionKo:
        '필터링 및 하이브리드 검색이 포함된 고성능 RAG를 위한 LangChain Milvus 벡터 스토어',
    },
    {
      target: 'Attu',
      method: 'native',
      infraComponents: ['vector-db', 'web-server'],
      description:
        'Attu GUI management tool for Milvus cluster monitoring, data visualization, and admin operations',
      descriptionKo:
        'Milvus 클러스터 모니터링, 데이터 시각화, 관리 작업을 위한 Attu GUI 관리 도구',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Vector count exceeds 100M or need multi-region deployment for global latency',
      triggerKo: '벡터 수 1억 초과 또는 글로벌 지연 시간을 위한 다중 리전 배포 필요',
      from: ['vector-db', 'container', 'kubernetes'],
      to: ['vector-db', 'container', 'kubernetes', 'load-balancer', 'cache'],
      cloudServices: ['Zilliz Cloud Enterprise', 'AWS EKS', 'GCP GKE'],
      reason:
        'Billion-scale vectors require distributed cluster with sharding, replicas, and cross-region replication',
      reasonKo:
        '수십억 규모 벡터에 샤딩, 레플리카, 크로스 리전 복제를 갖춘 분산 클러스터 필요',
    },
  ],
  embeddingText:
    'Milvus distributed vector database billion-scale search Kubernetes Docker Zilliz Cloud gRPC RAG enterprise high-performance',
  embeddingTextKo:
    'Milvus 분산 벡터 데이터베이스 수십억 규모 검색 Kubernetes Docker Zilliz Cloud gRPC RAG 엔터프라이즈 고성능',
};

// ---------------------------------------------------------------------------
// Weaviate
// ---------------------------------------------------------------------------

const weaviate: ProductIntelligence = {
  id: 'PI-VDB-004',
  productId: 'weaviate',
  name: 'Weaviate',
  nameKo: 'Weaviate (위비에이트)',
  category: 'vector-db',
  sourceUrl: 'https://github.com/weaviate/weaviate',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'macOS'],
      installMethod: 'docker compose up -d (Weaviate Docker deployment)',
      installMethodKo: 'docker compose up -d (Weaviate Docker 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '50 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['vector-db', 'container', 'api-gateway'],
      notes:
        'Go-based vector database with built-in vectorizer modules, GraphQL API, and multi-modal support',
      notesKo:
        '내장 벡터라이저 모듈, GraphQL API, 다중 모달 지원을 갖춘 Go 기반 벡터 데이터베이스',
    },
    {
      platform: 'cloud',
      os: ['Linux (Weaviate Cloud)'],
      installMethod: 'Sign up at weaviate.io for managed Weaviate Cloud instance',
      installMethodKo: '관리형 Weaviate Cloud 인스턴스를 위해 weaviate.io에서 가입',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '20 GB',
        network: '100 Mbps',
      },
      infraComponents: ['vector-db', 'api-gateway'],
      notes:
        'Managed cloud service with automatic scaling, backups, and multi-tenant isolation',
      notesKo:
        '자동 스케일링, 백업, 다중 테넌트 격리가 포함된 관리형 클라우드 서비스',
    },
  ],
  integrations: [
    {
      target: 'LangChain',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'LangChain Weaviate vector store for hybrid (keyword + semantic) search in RAG applications',
      descriptionKo:
        'RAG 애플리케이션에서 하이브리드(키워드 + 시맨틱) 검색을 위한 LangChain Weaviate 벡터 스토어',
    },
    {
      target: 'Hugging Face',
      method: 'native',
      infraComponents: ['vector-db', 'inference-engine'],
      description:
        'Built-in text2vec-huggingface module for automatic embedding generation during ingestion',
      descriptionKo:
        '수집 시 자동 임베딩 생성을 위한 내장 text2vec-huggingface 모듈',
    },
    {
      target: 'GraphQL',
      method: 'api',
      infraComponents: ['vector-db', 'api-gateway'],
      protocol: 'GraphQL',
      description:
        'Native GraphQL API for flexible querying with filters, aggregations, and cross-references',
      descriptionKo:
        '필터, 집계, 교차 참조가 포함된 유연한 쿼리를 위한 네이티브 GraphQL API',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Multi-tenant workloads exceed single-node capacity or need horizontal scaling',
      triggerKo: '다중 테넌트 워크로드가 단일 노드 용량 초과 또는 수평 확장 필요',
      from: ['vector-db', 'container'],
      to: ['vector-db', 'container', 'kubernetes', 'load-balancer'],
      cloudServices: ['Weaviate Cloud Enterprise', 'AWS EKS', 'GCP GKE'],
      reason:
        'Multi-tenant vector search at scale requires Kubernetes clustering with shard-based distribution',
      reasonKo:
        '대규모 다중 테넌트 벡터 검색에 샤드 기반 분산을 갖춘 Kubernetes 클러스터링 필요',
    },
  ],
  embeddingText:
    'Weaviate vector database GraphQL multi-modal vectorizer modules hybrid search Docker Kubernetes cloud multi-tenant RAG',
  embeddingTextKo:
    'Weaviate 벡터 데이터베이스 GraphQL 다중 모달 벡터라이저 모듈 하이브리드 검색 Docker Kubernetes 클라우드 다중 테넌트 RAG',
};

// ---------------------------------------------------------------------------
// Qdrant
// ---------------------------------------------------------------------------

const qdrant: ProductIntelligence = {
  id: 'PI-VDB-005',
  productId: 'qdrant',
  name: 'Qdrant',
  nameKo: 'Qdrant (쿼드런트)',
  category: 'vector-db',
  sourceUrl: 'https://github.com/qdrant/qdrant',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Linux', 'Windows'],
      installMethod: 'Download binary from GitHub releases or cargo install qdrant',
      installMethodKo: 'GitHub 릴리스에서 바이너리 다운로드 또는 cargo install qdrant',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '5 GB',
      },
      infraComponents: ['vector-db', 'app-server'],
      notes:
        'Rust-based lightweight binary; runs locally with persistent storage and REST/gRPC API',
      notesKo:
        'Rust 기반 경량 바이너리; 영구 저장 및 REST/gRPC API로 로컬에서 실행',
    },
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'macOS'],
      installMethod: 'docker run -p 6333:6333 qdrant/qdrant',
      installMethodKo: 'docker run -p 6333:6333 qdrant/qdrant (Docker 서버 배포)',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '50 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['vector-db', 'container', 'app-server'],
      notes:
        'Docker deployment for production; supports snapshots, replicas, and distributed cluster mode',
      notesKo:
        '운영을 위한 Docker 배포; 스냅샷, 레플리카, 분산 클러스터 모드 지원',
    },
    {
      platform: 'cloud',
      os: ['Linux (Qdrant Cloud)'],
      installMethod: 'Sign up at qdrant.io for managed Qdrant Cloud cluster',
      installMethodKo: '관리형 Qdrant Cloud 클러스터를 위해 qdrant.io에서 가입',
      minRequirements: {
        cpu: '2 cores',
        ram: '4 GB',
        storage: '20 GB',
        network: '100 Mbps',
      },
      infraComponents: ['vector-db', 'api-gateway'],
      notes:
        'Managed cloud with hybrid cloud option for on-premises data residency requirements',
      notesKo:
        '온프레미스 데이터 상주 요구사항을 위한 하이브리드 클라우드 옵션이 포함된 관리형 클라우드',
    },
  ],
  integrations: [
    {
      target: 'LangChain',
      method: 'api',
      infraComponents: ['vector-db', 'ai-orchestrator'],
      protocol: 'REST',
      description:
        'LangChain QdrantVectorStore for high-performance RAG with payload filtering and sparse vectors',
      descriptionKo:
        '페이로드 필터링 및 희소 벡터가 포함된 고성능 RAG를 위한 LangChain QdrantVectorStore',
    },
    {
      target: 'FastEmbed',
      method: 'native',
      infraComponents: ['vector-db', 'app-server'],
      description:
        'Built-in FastEmbed integration for local embedding generation without external API dependency',
      descriptionKo:
        '외부 API 의존 없이 로컬 임베딩 생성을 위한 내장 FastEmbed 연동',
    },
    {
      target: 'REST/gRPC API',
      method: 'api',
      infraComponents: ['vector-db', 'api-gateway'],
      protocol: 'gRPC',
      description:
        'Dual REST and gRPC API for flexible integration; gRPC for high-throughput production workloads',
      descriptionKo:
        '유연한 연동을 위한 듀얼 REST 및 gRPC API; 고처리량 운영 워크로드에 gRPC',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Collection exceeds 50M vectors or need high-availability with automatic failover',
      triggerKo: '컬렉션 5000만 벡터 초과 또는 자동 장애 조치가 포함된 고가용성 필요',
      from: ['vector-db', 'container'],
      to: ['vector-db', 'container', 'kubernetes', 'load-balancer'],
      cloudServices: ['Qdrant Cloud Enterprise', 'AWS EKS', 'GCP GKE'],
      reason:
        'Large-scale vector search requires distributed cluster with automatic sharding and replica management',
      reasonKo:
        '대규모 벡터 검색에 자동 샤딩 및 레플리카 관리를 갖춘 분산 클러스터 필요',
    },
  ],
  embeddingText:
    'Qdrant Rust vector database high-performance gRPC REST Docker FastEmbed filtering sparse vectors distributed cluster',
  embeddingTextKo:
    'Qdrant Rust 벡터 데이터베이스 고성능 gRPC REST Docker FastEmbed 필터링 희소 벡터 분산 클러스터',
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Vector database product intelligence data (5 products) */
export const vectorDbProducts: ProductIntelligence[] = [
  chromadb,
  pinecone,
  milvus,
  weaviate,
  qdrant,
];
