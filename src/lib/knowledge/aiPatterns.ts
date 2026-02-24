/**
 * AI Architecture Patterns - Edge AI & ML infrastructure design patterns
 *
 * 9 patterns organized by scale:
 * - PAT-033 ~ PAT-035: Personal (edge/mobile AI)
 * - PAT-036 ~ PAT-038: Startup (self-hosted AI services)
 * - PAT-039 ~ PAT-041: Enterprise (large-scale AI platforms)
 *
 * Evolution chains:
 * - PAT-033 → PAT-034 → PAT-037 → PAT-039
 * - PAT-035 → PAT-040
 * - PAT-036 → PAT-041 → PAT-039
 */

import type { ArchitecturePattern } from './types';
import {
  NVIDIA_AI_ENTERPRISE,
  HUGGINGFACE_DOCS,
  MLOPS_COMMUNITY,
  NIST_AI_RMF,
  withSection,
} from './sourceRegistry';

// ---------------------------------------------------------------------------
// Personal Patterns (PAT-033 ~ PAT-035)
// ---------------------------------------------------------------------------

const personalPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-033',
    type: 'pattern',
    name: 'Personal AI Assistant',
    nameKo: '개인 AI 어시스턴트',
    description:
      'Lightweight personal AI setup running a local inference engine on an edge device with an orchestrator for multi-step tasks. Ideal for privacy-conscious users who want on-device AI without cloud dependency.',
    descriptionKo:
      '엣지 디바이스에서 로컬 추론 엔진을 실행하고, 오케스트레이터로 다단계 작업을 처리하는 경량 개인 AI 구성입니다. 클라우드 의존 없이 온디바이스 AI를 원하는 프라이버시 중시 사용자에게 적합합니다.',
    requiredComponents: [
      { type: 'edge-device', minCount: 1 },
      { type: 'inference-engine', minCount: 1 },
      { type: 'ai-orchestrator', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'ai-monitor', benefit: 'Track model performance and resource usage', benefitKo: '모델 성능 및 리소스 사용량 추적' },
      { type: 'prompt-manager', benefit: 'Manage and version prompt templates', benefitKo: '프롬프트 템플릿 관리 및 버전 관리' },
    ],
    scalability: 'low',
    complexity: 1,
    bestForKo: [
      '프라이버시가 중요한 개인 AI 비서',
      '오프라인 환경에서의 AI 활용',
      '간단한 텍스트 생성 및 요약 작업',
      '로컬 코딩 어시스턴트',
    ],
    notSuitableForKo: [
      '대규모 모델(70B+) 실행',
      '동시 다중 사용자 서비스',
      '실시간 고성능 추론',
    ],
    evolvesTo: ['PAT-034'],
    evolvesFrom: [],
    tags: ['ai', 'personal', 'edge', 'privacy', 'local-inference'],
    wafPillars: {
      operationalExcellence: 2,
      security: 3,
      reliability: 2,
      performanceEfficiency: 2,
      costOptimization: 5,
    },
    trust: {
      confidence: 0.8,
      sources: [
        withSection(HUGGINGFACE_DOCS, 'Local Model Deployment'),
        withSection(NIST_AI_RMF, 'Section 5 - AI Risk Management'),
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-034',
    type: 'pattern',
    name: 'Home RAG System',
    nameKo: '홈 RAG 시스템',
    description:
      'Personal Retrieval-Augmented Generation system that combines a local inference engine with a vector database and embedding service on an edge device. Enables question-answering over private documents without cloud upload.',
    descriptionKo:
      '엣지 디바이스에서 로컬 추론 엔진, 벡터 DB, 임베딩 서비스를 결합한 개인용 RAG 시스템입니다. 클라우드 업로드 없이 개인 문서에 대한 질의응답이 가능합니다.',
    requiredComponents: [
      { type: 'edge-device', minCount: 1 },
      { type: 'inference-engine', minCount: 1 },
      { type: 'vector-db', minCount: 1 },
      { type: 'embedding-service', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'ai-orchestrator', benefit: 'Chain multiple RAG steps for complex queries', benefitKo: '복잡한 질의를 위한 다단계 RAG 체인' },
      { type: 'ai-monitor', benefit: 'Monitor retrieval quality and response accuracy', benefitKo: '검색 품질 및 응답 정확도 모니터링' },
    ],
    scalability: 'low',
    complexity: 2,
    bestForKo: [
      '개인 문서 기반 질의응답',
      '사내 지식 베이스 검색',
      '논문/보고서 요약 및 분석',
      '프라이버시가 중요한 데이터 처리',
    ],
    notSuitableForKo: [
      '수백만 건 이상의 대규모 문서 처리',
      '실시간 스트리밍 데이터 분석',
      '다국어 대규모 임베딩',
    ],
    evolvesTo: ['PAT-037'],
    evolvesFrom: ['PAT-033'],
    tags: ['ai', 'personal', 'rag', 'vector-search', 'privacy', 'edge'],
    wafPillars: {
      operationalExcellence: 2,
      security: 4,
      reliability: 2,
      performanceEfficiency: 2,
      costOptimization: 4,
    },
    trust: {
      confidence: 0.8,
      sources: [
        withSection(HUGGINGFACE_DOCS, 'RAG Pipeline Architecture'),
        withSection(NIST_AI_RMF, 'Section 5.2 - Data Privacy'),
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-035',
    type: 'pattern',
    name: 'Mobile Edge AI',
    nameKo: '모바일 엣지 AI',
    description:
      'On-device AI architecture for mobile devices with a lightweight inference engine and optional edge device fallback. Enables real-time AI features like image recognition and voice processing directly on smartphones.',
    descriptionKo:
      '모바일 디바이스에서 경량 추론 엔진을 실행하고, 엣지 디바이스로 폴백하는 온디바이스 AI 아키텍처입니다. 스마트폰에서 이미지 인식, 음성 처리 등 실시간 AI 기능을 제공합니다.',
    requiredComponents: [
      { type: 'mobile-device', minCount: 1 },
      { type: 'inference-engine', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'edge-device', benefit: 'Fallback for complex inference when mobile resources are limited', benefitKo: '모바일 리소스 부족 시 복잡한 추론 폴백' },
      { type: 'ai-gateway', benefit: 'Route between on-device and edge/cloud inference', benefitKo: '온디바이스와 엣지/클라우드 추론 간 라우팅' },
      { type: 'ai-monitor', benefit: 'Track battery usage and inference latency', benefitKo: '배터리 사용량 및 추론 지연 시간 추적' },
    ],
    scalability: 'low',
    complexity: 2,
    bestForKo: [
      '실시간 이미지/영상 인식',
      '온디바이스 음성 처리',
      '오프라인 환경 AI 서비스',
      '배터리 효율적인 AI 추론',
    ],
    notSuitableForKo: [
      '대규모 언어 모델 실행',
      '장시간 학습/파인튜닝',
      '높은 정확도가 필요한 전문 분석',
    ],
    evolvesTo: ['PAT-040'],
    evolvesFrom: [],
    tags: ['ai', 'personal', 'mobile', 'edge', 'on-device', 'real-time'],
    wafPillars: {
      operationalExcellence: 2,
      security: 3,
      reliability: 2,
      performanceEfficiency: 3,
      costOptimization: 5,
    },
    trust: {
      confidence: 0.75,
      sources: [
        withSection(NVIDIA_AI_ENTERPRISE, 'Edge AI Deployment'),
        withSection(NIST_AI_RMF, 'Section 5.1 - AI System Trustworthiness'),
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Startup Patterns (PAT-036 ~ PAT-038)
// ---------------------------------------------------------------------------

const startupPatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-036',
    type: 'pattern',
    name: 'Self-Hosted LLM Service',
    nameKo: '자체 호스팅 LLM 서비스',
    description:
      'GPU-powered self-hosted LLM deployment with inference engine, AI gateway for model routing, and API gateway for client access. Provides full control over model selection, data privacy, and cost management.',
    descriptionKo:
      'GPU 서버에서 추론 엔진, 모델 라우팅용 AI 게이트웨이, 클라이언트 접근용 API 게이트웨이를 갖춘 자체 호스팅 LLM 배포입니다. 모델 선택, 데이터 프라이버시, 비용 관리를 완전히 제어할 수 있습니다.',
    requiredComponents: [
      { type: 'gpu-server', minCount: 1 },
      { type: 'inference-engine', minCount: 1 },
      { type: 'ai-gateway', minCount: 1 },
      { type: 'api-gateway', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'load-balancer', benefit: 'Distribute inference requests across multiple GPU servers', benefitKo: '여러 GPU 서버 간 추론 요청 분산' },
      { type: 'cache', benefit: 'Cache frequent prompt-response pairs to reduce GPU load', benefitKo: '빈번한 프롬프트-응답 캐싱으로 GPU 부하 감소' },
      { type: 'ai-monitor', benefit: 'Monitor GPU utilization, latency, and throughput', benefitKo: 'GPU 활용률, 지연 시간, 처리량 모니터링' },
      { type: 'model-registry', benefit: 'Version and manage multiple model deployments', benefitKo: '여러 모델 배포의 버전 관리' },
    ],
    scalability: 'medium',
    complexity: 3,
    bestForKo: [
      '데이터 주권이 중요한 AI 서비스',
      'API 기반 LLM 서비스 제공',
      '비용 최적화가 필요한 중규모 AI 서비스',
      '특정 도메인 파인튜닝 모델 서빙',
    ],
    notSuitableForKo: [
      'GPU 투자가 어려운 초기 스타트업',
      '글로벌 멀티 리전 서비스',
      '수천 동시 사용자 처리',
    ],
    evolvesTo: ['PAT-041'],
    evolvesFrom: [],
    tags: ['ai', 'startup', 'llm', 'self-hosted', 'gpu', 'inference'],
    wafPillars: {
      operationalExcellence: 3,
      security: 4,
      reliability: 3,
      performanceEfficiency: 4,
      costOptimization: 3,
    },
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NVIDIA_AI_ENTERPRISE, 'GPU Infrastructure for LLM Serving'),
        withSection(HUGGINGFACE_DOCS, 'Text Generation Inference (TGI)'),
        MLOPS_COMMUNITY,
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-037',
    type: 'pattern',
    name: 'RAG Pipeline',
    nameKo: 'RAG 파이프라인',
    description:
      'Production-grade Retrieval-Augmented Generation pipeline with embedding service for document ingestion, vector database for semantic search, orchestrator for query routing, and inference engine for response generation.',
    descriptionKo:
      '문서 수집용 임베딩 서비스, 시맨틱 검색용 벡터 DB, 질의 라우팅 오케스트레이터, 응답 생성 추론 엔진을 갖춘 프로덕션급 RAG 파이프라인입니다.',
    requiredComponents: [
      { type: 'embedding-service', minCount: 1 },
      { type: 'vector-db', minCount: 1 },
      { type: 'ai-orchestrator', minCount: 1 },
      { type: 'inference-engine', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'cache', benefit: 'Cache embeddings and frequent query results', benefitKo: '임베딩 및 빈번한 질의 결과 캐싱' },
      { type: 'ai-gateway', benefit: 'Route to different models based on query complexity', benefitKo: '질의 복잡도에 따른 모델 라우팅' },
      { type: 'ai-monitor', benefit: 'Monitor retrieval relevance and generation quality', benefitKo: '검색 관련도 및 생성 품질 모니터링' },
      { type: 'prompt-manager', benefit: 'Manage and optimize RAG prompt templates', benefitKo: 'RAG 프롬프트 템플릿 관리 및 최적화' },
    ],
    scalability: 'medium',
    complexity: 3,
    bestForKo: [
      '기업 지식 기반 질의응답 시스템',
      '고객 지원 챗봇',
      '문서 검색 및 요약 서비스',
      '도메인 특화 AI 어시스턴트',
    ],
    notSuitableForKo: [
      '실시간 스트리밍 데이터 처리',
      '이미지/비디오 중심 검색',
      '밀리초 단위 초저지연 응답',
    ],
    evolvesTo: ['PAT-039'],
    evolvesFrom: ['PAT-034'],
    tags: ['ai', 'startup', 'rag', 'vector-search', 'knowledge-base', 'llm'],
    wafPillars: {
      operationalExcellence: 3,
      security: 3,
      reliability: 3,
      performanceEfficiency: 3,
      costOptimization: 3,
    },
    trust: {
      confidence: 0.85,
      sources: [
        withSection(HUGGINGFACE_DOCS, 'RAG Architecture'),
        MLOPS_COMMUNITY,
        withSection(NIST_AI_RMF, 'Section 5 - AI Risk Management'),
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-038',
    type: 'pattern',
    name: 'AI Agent Platform',
    nameKo: 'AI 에이전트 플랫폼',
    description:
      'Multi-agent AI platform with an orchestrator coordinating specialized AI agents, inference engine for LLM reasoning, vector database for long-term memory, and prompt manager for agent behavior configuration.',
    descriptionKo:
      '오케스트레이터가 특화된 AI 에이전트를 조율하고, 추론 엔진의 LLM 추론, 벡터 DB의 장기 메모리, 프롬프트 매니저의 에이전트 동작 설정을 갖춘 멀티 에이전트 AI 플랫폼입니다.',
    requiredComponents: [
      { type: 'ai-orchestrator', minCount: 1 },
      { type: 'inference-engine', minCount: 1 },
      { type: 'vector-db', minCount: 1 },
      { type: 'prompt-manager', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'ai-gateway', benefit: 'Route agent requests to appropriate models', benefitKo: '에이전트 요청을 적절한 모델로 라우팅' },
      { type: 'ai-monitor', benefit: 'Track agent performance and token usage', benefitKo: '에이전트 성능 및 토큰 사용량 추적' },
      { type: 'embedding-service', benefit: 'Semantic search in agent memory', benefitKo: '에이전트 메모리의 시맨틱 검색' },
      { type: 'api-gateway', benefit: 'Expose agent capabilities as APIs', benefitKo: '에이전트 기능을 API로 노출' },
    ],
    scalability: 'medium',
    complexity: 3,
    bestForKo: [
      '복잡한 다단계 업무 자동화',
      '자율형 AI 워크플로우',
      '코드 생성 및 리뷰 에이전트',
      '리서치 및 분석 에이전트',
    ],
    notSuitableForKo: [
      '단순 질의응답만 필요한 경우',
      '밀리초 단위 응답이 필요한 서비스',
      '에이전트 비용 관리가 어려운 환경',
    ],
    evolvesTo: ['PAT-039'],
    evolvesFrom: [],
    tags: ['ai', 'startup', 'agent', 'orchestration', 'multi-agent', 'llm'],
    wafPillars: {
      operationalExcellence: 3,
      security: 3,
      reliability: 3,
      performanceEfficiency: 3,
      costOptimization: 2,
    },
    trust: {
      confidence: 0.8,
      sources: [
        MLOPS_COMMUNITY,
        withSection(HUGGINGFACE_DOCS, 'Agent Architecture'),
        withSection(NIST_AI_RMF, 'Section 3 - AI Risk Management Framework'),
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Enterprise Patterns (PAT-039 ~ PAT-041)
// ---------------------------------------------------------------------------

const enterprisePatterns: ArchitecturePattern[] = [
  {
    id: 'PAT-039',
    type: 'pattern',
    name: 'Enterprise AI Platform',
    nameKo: '엔터프라이즈 AI 플랫폼',
    description:
      'Full-scale enterprise AI infrastructure with GPU clusters for training, model registry for lifecycle management, training platform for experiment tracking, inference engine for serving, and AI gateway for unified access control.',
    descriptionKo:
      'GPU 클러스터 학습, 모델 레지스트리 라이프사이클 관리, 학습 플랫폼 실험 추적, 추론 엔진 서빙, AI 게이트웨이 통합 접근 제어를 갖춘 대규모 엔터프라이즈 AI 인프라입니다.',
    requiredComponents: [
      { type: 'ai-cluster', minCount: 1 },
      { type: 'training-platform', minCount: 1 },
      { type: 'model-registry', minCount: 1 },
      { type: 'inference-engine', minCount: 1 },
      { type: 'ai-gateway', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'gpu-server', benefit: 'Additional GPU servers for inference scaling', benefitKo: '추론 스케일링을 위한 추가 GPU 서버' },
      { type: 'vector-db', benefit: 'Enterprise knowledge base for RAG', benefitKo: 'RAG를 위한 엔터프라이즈 지식 베이스' },
      { type: 'ai-monitor', benefit: 'Monitor model drift, bias, and performance', benefitKo: '모델 드리프트, 편향, 성능 모니터링' },
      { type: 'ai-orchestrator', benefit: 'Orchestrate complex ML pipelines', benefitKo: '복잡한 ML 파이프라인 오케스트레이션' },
      { type: 'load-balancer', benefit: 'Distribute inference load across serving nodes', benefitKo: '서빙 노드 간 추론 부하 분산' },
    ],
    scalability: 'auto',
    complexity: 5,
    bestForKo: [
      '대규모 AI/ML 팀의 학습 및 서빙 통합 플랫폼',
      '모델 거버넌스 및 규정 준수가 필요한 금융/의료 기관',
      '다수의 ML 모델을 동시 운영하는 기업',
      'MLOps 파이프라인 자동화',
    ],
    notSuitableForKo: [
      'AI 팀이 5명 이하인 소규모 조직',
      '단일 모델만 서빙하는 경우',
      '클라우드 AI 서비스로 충분한 규모',
    ],
    evolvesTo: [],
    evolvesFrom: ['PAT-037', 'PAT-038', 'PAT-041'],
    tags: ['ai', 'enterprise', 'mlops', 'training', 'serving', 'governance'],
    wafPillars: {
      operationalExcellence: 5,
      security: 4,
      reliability: 4,
      performanceEfficiency: 5,
      costOptimization: 2,
    },
    trust: {
      confidence: 0.9,
      sources: [
        NVIDIA_AI_ENTERPRISE,
        withSection(NIST_AI_RMF, 'Section 5 - AI Risk Management'),
        MLOPS_COMMUNITY,
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-040',
    type: 'pattern',
    name: 'Edge-Cloud Hybrid AI',
    nameKo: '엣지-클라우드 하이브리드 AI',
    description:
      'Distributed AI architecture that splits inference between edge devices and cloud AI clusters. Edge handles latency-sensitive tasks while cloud processes complex workloads, connected via an AI gateway for intelligent routing.',
    descriptionKo:
      '엣지 디바이스와 클라우드 AI 클러스터 간에 추론을 분산하는 아키텍처입니다. 엣지에서 지연 민감 작업을 처리하고, 클라우드에서 복잡한 워크로드를 처리하며, AI 게이트웨이가 지능적 라우팅을 담당합니다.',
    requiredComponents: [
      { type: 'edge-device', minCount: 1 },
      { type: 'ai-gateway', minCount: 1 },
      { type: 'ai-cluster', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'inference-engine', benefit: 'Dedicated inference engines at edge and cloud', benefitKo: '엣지 및 클라우드의 전용 추론 엔진' },
      { type: 'model-registry', benefit: 'Sync model versions between edge and cloud', benefitKo: '엣지-클라우드 간 모델 버전 동기화' },
      { type: 'ai-monitor', benefit: 'Monitor edge device health and inference quality', benefitKo: '엣지 디바이스 상태 및 추론 품질 모니터링' },
      { type: 'load-balancer', benefit: 'Balance between edge and cloud inference', benefitKo: '엣지-클라우드 추론 간 부하 분산' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      'IoT/엣지 AI가 필요한 제조/물류 환경',
      '네트워크 지연에 민감한 실시간 AI 서비스',
      '엣지-클라우드 간 하이브리드 워크로드',
      '대규모 엣지 디바이스 플릿 관리',
    ],
    notSuitableForKo: [
      '클라우드만으로 충분한 지연 허용 서비스',
      '엣지 디바이스 관리 인력이 없는 조직',
      '네트워크 연결이 항상 안정적인 환경',
    ],
    evolvesTo: ['PAT-039'],
    evolvesFrom: ['PAT-035'],
    tags: ['ai', 'enterprise', 'edge-cloud', 'hybrid', 'iot', 'distributed'],
    wafPillars: {
      operationalExcellence: 4,
      security: 3,
      reliability: 4,
      performanceEfficiency: 4,
      costOptimization: 3,
    },
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NVIDIA_AI_ENTERPRISE, 'Edge AI & Hybrid Deployment'),
        withSection(NIST_AI_RMF, 'Section 5.3 - AI System Deployment'),
        MLOPS_COMMUNITY,
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
  {
    id: 'PAT-041',
    type: 'pattern',
    name: 'Multi-Model Serving',
    nameKo: '멀티 모델 서빙',
    description:
      'Architecture for serving multiple AI models simultaneously through a unified AI gateway that routes requests to appropriate inference engines based on task type, with monitoring for model performance comparison and A/B testing.',
    descriptionKo:
      '통합 AI 게이트웨이를 통해 여러 AI 모델을 동시에 서빙하고, 작업 유형에 따라 적절한 추론 엔진으로 라우팅하며, 모델 성능 비교 및 A/B 테스트를 위한 모니터링을 제공하는 아키텍처입니다.',
    requiredComponents: [
      { type: 'ai-gateway', minCount: 1 },
      { type: 'inference-engine', minCount: 2 },
      { type: 'ai-monitor', minCount: 1 },
    ],
    optionalComponents: [
      { type: 'model-registry', benefit: 'Track model versions and deployment history', benefitKo: '모델 버전 및 배포 이력 추적' },
      { type: 'load-balancer', benefit: 'Distribute traffic across model instances', benefitKo: '모델 인스턴스 간 트래픽 분산' },
      { type: 'cache', benefit: 'Cache responses for frequently used models', benefitKo: '자주 사용되는 모델의 응답 캐싱' },
      { type: 'prompt-manager', benefit: 'Model-specific prompt optimization', benefitKo: '모델별 프롬프트 최적화' },
    ],
    scalability: 'high',
    complexity: 4,
    bestForKo: [
      '다양한 AI 모델을 통합 관리하는 서비스',
      'A/B 테스트 기반 모델 성능 비교',
      '워크로드별 최적 모델 라우팅',
      '모델 마이그레이션 및 카나리 배포',
    ],
    notSuitableForKo: [
      '단일 모델만 사용하는 서비스',
      '모델 관리 인력이 부족한 조직',
      '비용 민감한 소규모 서비스',
    ],
    evolvesTo: ['PAT-039'],
    evolvesFrom: ['PAT-036'],
    tags: ['ai', 'enterprise', 'multi-model', 'serving', 'gateway', 'ab-testing'],
    wafPillars: {
      operationalExcellence: 4,
      security: 3,
      reliability: 4,
      performanceEfficiency: 4,
      costOptimization: 3,
    },
    trust: {
      confidence: 0.85,
      sources: [
        withSection(NVIDIA_AI_ENTERPRISE, 'Multi-Model Inference Architecture'),
        withSection(HUGGINGFACE_DOCS, 'Model Serving & Routing'),
        MLOPS_COMMUNITY,
      ],
      lastReviewedAt: '2026-02-24',
      upvotes: 0,
      downvotes: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Exported aggregate
// ---------------------------------------------------------------------------

export const aiPatterns: ArchitecturePattern[] = [
  ...personalPatterns,
  ...startupPatterns,
  ...enterprisePatterns,
];
