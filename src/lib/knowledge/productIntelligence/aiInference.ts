/**
 * Product Intelligence - AI Inference Engine Products
 *
 * Local and self-hosted AI inference engines that serve LLM models
 * on desktop, server, edge, and cloud infrastructure.
 *
 * Products: Ollama, vLLM, llama.cpp, TGI, LocalAI, LM Studio, Triton Inference Server
 */

import type { ProductIntelligence } from './types';

// ---------------------------------------------------------------------------
// Ollama
// ---------------------------------------------------------------------------

const ollama: ProductIntelligence = {
  id: 'PI-INF-001',
  productId: 'ollama',
  name: 'Ollama',
  nameKo: 'Ollama (올라마)',
  category: 'ai-inference',
  sourceUrl: 'https://ollama.ai/',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Linux', 'Windows'],
      installMethod: 'Download native installer from ollama.ai or brew install ollama',
      installMethodKo: 'ollama.ai에서 네이티브 설치 프로그램 다운로드 또는 brew install ollama',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB',
      },
      infraComponents: ['inference-engine', 'app-server'],
      notes:
        'Native desktop app with CLI; runs models locally, GPU acceleration on macOS (Metal) and Linux (CUDA)',
      notesKo:
        'CLI 포함 네이티브 데스크톱 앱; 모델을 로컬에서 실행, macOS(Metal)와 Linux(CUDA)에서 GPU 가속',
    },
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'RHEL 9'],
      installMethod: 'docker run -d -p 11434:11434 ollama/ollama (or systemd service)',
      installMethodKo: 'docker run -d -p 11434:11434 ollama/ollama (또는 systemd 서비스)',
      minRequirements: {
        cpu: '8 cores',
        ram: '16 GB',
        vram: '16 GB',
        storage: '100 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['inference-engine', 'gpu-server', 'container'],
      notes:
        'Production server deployment via Docker or systemd; supports multi-model concurrent serving',
      notesKo:
        'Docker 또는 systemd를 통한 운영 서버 배포; 다중 모델 동시 서빙 지원',
    },
    {
      platform: 'mobile',
      os: ['Android (Termux)'],
      installMethod: 'Install via Termux package manager (limited support)',
      installMethodKo: 'Termux 패키지 관리자를 통한 설치 (제한적 지원)',
      minRequirements: {
        cpu: '4 cores',
        ram: '6 GB',
        storage: '5 GB',
      },
      infraComponents: ['inference-engine', 'mobile-device'],
      notes:
        'Experimental mobile support via Termux on Android; limited to small models (7B or below)',
      notesKo:
        'Android의 Termux를 통한 실험적 모바일 지원; 소형 모델(7B 이하)에 제한',
    },
  ],
  integrations: [
    {
      target: 'Open WebUI',
      method: 'api',
      infraComponents: ['web-server', 'inference-engine'],
      protocol: 'REST',
      description: 'Primary backend for Open WebUI chat interface via REST API on port 11434',
      descriptionKo: '포트 11434의 REST API를 통한 Open WebUI 채팅 인터페이스의 주요 백엔드',
    },
    {
      target: 'LangChain',
      method: 'api',
      infraComponents: ['inference-engine', 'app-server'],
      protocol: 'REST',
      description:
        'LangChain OllamaLLM/ChatOllama integration for building LLM-powered applications',
      descriptionKo:
        'LLM 기반 애플리케이션 구축을 위한 LangChain OllamaLLM/ChatOllama 연동',
    },
    {
      target: 'REST API',
      method: 'api',
      infraComponents: ['inference-engine', 'api-gateway'],
      protocol: 'REST',
      description:
        'OpenAI-compatible REST API for direct integration with any HTTP client or framework',
      descriptionKo:
        '모든 HTTP 클라이언트 또는 프레임워크와 직접 연동을 위한 OpenAI 호환 REST API',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Concurrent requests exceed 50 or need high-availability inference',
      triggerKo: '동시 요청 50건 초과 또는 고가용성 추론 필요',
      from: ['inference-engine', 'gpu-server'],
      to: ['load-balancer', 'gpu-server', 'inference-engine', 'container', 'kubernetes'],
      cloudServices: ['AWS EC2 P4d', 'GCP A2 instances'],
      reason:
        'Single Ollama instance cannot handle high concurrency; load balancer distributes requests across multiple GPU server instances',
      reasonKo:
        '단일 Ollama 인스턴스로 높은 동시성 처리 불가; 로드 밸런서가 여러 GPU 서버 인스턴스로 요청 분산',
    },
  ],
  embeddingText:
    'Ollama local LLM inference engine desktop server Docker REST API OpenAI compatible GPU acceleration model serving',
  embeddingTextKo:
    'Ollama 로컬 LLM 추론 엔진 데스크톱 서버 Docker REST API OpenAI 호환 GPU 가속 모델 서빙',
};

// ---------------------------------------------------------------------------
// vLLM
// ---------------------------------------------------------------------------

const vllm: ProductIntelligence = {
  id: 'PI-INF-002',
  productId: 'vllm',
  name: 'vLLM',
  nameKo: 'vLLM (브이엘엘엠)',
  category: 'ai-inference',
  sourceUrl: 'https://github.com/vllm-project/vllm',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'RHEL 9'],
      installMethod: 'pip install vllm && python -m vllm.entrypoints.openai.api_server',
      installMethodKo: 'pip install vllm && python -m vllm.entrypoints.openai.api_server (Python 패키지)',
      minRequirements: {
        cpu: '8 cores',
        ram: '32 GB',
        vram: '24 GB (NVIDIA CUDA)',
        storage: '100 GB SSD',
        network: '10 Gbps',
      },
      infraComponents: ['gpu-server', 'inference-engine', 'container'],
      notes:
        'High-throughput production inference with PagedAttention; requires NVIDIA GPU with CUDA support',
      notesKo:
        'PagedAttention을 활용한 고처리량 운영 추론; CUDA 지원 NVIDIA GPU 필요',
    },
    {
      platform: 'cloud',
      os: ['Linux (AWS Deep Learning AMI)', 'Linux (GCP GPU VM)'],
      installMethod: 'Deploy on cloud GPU instances (AWS p4d/p5, GCP a2/a3) with Docker or pip',
      installMethodKo: '클라우드 GPU 인스턴스(AWS p4d/p5, GCP a2/a3)에 Docker 또는 pip으로 배포',
      minRequirements: {
        cpu: '16 cores',
        ram: '64 GB',
        vram: '80 GB (A100/H100)',
        storage: '500 GB SSD',
        network: '25 Gbps',
      },
      infraComponents: ['gpu-server', 'inference-engine', 'container', 'load-balancer'],
      notes:
        'Cloud deployment for maximum throughput; supports tensor parallelism across multiple GPUs',
      notesKo:
        '최대 처리량을 위한 클라우드 배포; 다중 GPU 간 텐서 병렬 처리 지원',
    },
  ],
  integrations: [
    {
      target: 'OpenAI API',
      method: 'api',
      infraComponents: ['inference-engine', 'api-gateway'],
      protocol: 'REST',
      description:
        'Fully OpenAI-compatible API server; drop-in replacement for OpenAI endpoints',
      descriptionKo:
        '완전한 OpenAI 호환 API 서버; OpenAI 엔드포인트의 드롭인 대체',
    },
    {
      target: 'Hugging Face',
      method: 'api',
      infraComponents: ['inference-engine'],
      protocol: 'REST',
      description:
        'Direct model loading from Hugging Face Hub; supports all major model architectures',
      descriptionKo:
        'Hugging Face Hub에서 직접 모델 로딩; 모든 주요 모델 아키텍처 지원',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Throughput exceeds single-node GPU capacity or need multi-model serving',
      triggerKo: '처리량이 단일 노드 GPU 용량 초과 또는 다중 모델 서빙 필요',
      from: ['gpu-server', 'inference-engine'],
      to: ['ai-cluster', 'gpu-server', 'inference-engine', 'load-balancer', 'kubernetes'],
      cloudServices: ['AWS SageMaker', 'GCP Vertex AI', 'Azure ML'],
      reason:
        'Single GPU node throughput limited; scale to multi-node cluster with tensor/pipeline parallelism and orchestration',
      reasonKo:
        '단일 GPU 노드 처리량 제한; 텐서/파이프라인 병렬 처리와 오케스트레이션을 갖춘 다중 노드 클러스터로 확장',
    },
  ],
  embeddingText:
    'vLLM high-throughput LLM inference PagedAttention CUDA GPU server production serving OpenAI compatible tensor parallelism',
  embeddingTextKo:
    'vLLM 고처리량 LLM 추론 PagedAttention CUDA GPU 서버 운영 서빙 OpenAI 호환 텐서 병렬 처리',
};

// ---------------------------------------------------------------------------
// llama.cpp
// ---------------------------------------------------------------------------

const llamaCpp: ProductIntelligence = {
  id: 'PI-INF-003',
  productId: 'llama-cpp',
  name: 'llama.cpp',
  nameKo: 'llama.cpp (라마씨피피)',
  category: 'ai-inference',
  sourceUrl: 'https://github.com/ggerganov/llama.cpp',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Linux', 'Windows'],
      installMethod: 'brew install llama.cpp or build from source (cmake)',
      installMethodKo: 'brew install llama.cpp 또는 소스에서 빌드 (cmake)',
      minRequirements: {
        cpu: '4 cores',
        ram: '4 GB',
        storage: '5 GB',
      },
      infraComponents: ['inference-engine', 'app-server'],
      notes:
        'CPU-only inference possible; lightest weight LLM runtime using GGUF quantized models',
      notesKo:
        'CPU 전용 추론 가능; GGUF 양자화 모델을 사용하는 가장 경량 LLM 런타임',
    },
    {
      platform: 'edge',
      os: ['Linux (Raspberry Pi OS)', 'Linux (ARM64)'],
      installMethod: 'Cross-compile or build natively on ARM device',
      installMethodKo: '크로스 컴파일 또는 ARM 디바이스에서 네이티브 빌드',
      minRequirements: {
        cpu: '4 cores (ARM)',
        ram: '4 GB',
        storage: '2 GB',
      },
      infraComponents: ['inference-engine', 'edge-device'],
      notes:
        'Runs on Raspberry Pi and ARM SBCs; ideal for edge AI with quantized small models',
      notesKo:
        'Raspberry Pi 및 ARM SBC에서 실행; 양자화된 소형 모델로 엣지 AI에 이상적',
    },
    {
      platform: 'mobile',
      os: ['Android (NDK)', 'iOS'],
      installMethod: 'Build with Android NDK or integrate via iOS framework',
      installMethodKo: 'Android NDK로 빌드 또는 iOS 프레임워크를 통해 통합',
      minRequirements: {
        cpu: '4 cores (ARM)',
        ram: '4 GB',
        storage: '2 GB',
      },
      infraComponents: ['inference-engine', 'mobile-device'],
      notes:
        'Native mobile inference via C++ library; supports Android NDK and iOS Metal acceleration',
      notesKo:
        'C++ 라이브러리를 통한 네이티브 모바일 추론; Android NDK 및 iOS Metal 가속 지원',
    },
  ],
  integrations: [
    {
      target: 'llama-cpp-python',
      method: 'native',
      infraComponents: ['inference-engine', 'app-server'],
      description:
        'Python bindings for llama.cpp enabling integration with Python ML frameworks and applications',
      descriptionKo:
        'Python ML 프레임워크 및 애플리케이션과 연동을 가능하게 하는 llama.cpp Python 바인딩',
    },
    {
      target: 'Ollama',
      method: 'native',
      infraComponents: ['inference-engine'],
      description:
        'Ollama uses llama.cpp as its inference backend; GGUF models are shared between both tools',
      descriptionKo:
        'Ollama는 llama.cpp를 추론 백엔드로 사용; GGUF 모델이 두 도구 간 공유',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Edge deployment needs centralized model management or higher throughput',
      triggerKo: '엣지 배포에 중앙 모델 관리 또는 높은 처리량 필요',
      from: ['inference-engine', 'edge-device'],
      to: ['gpu-server', 'inference-engine', 'load-balancer', 'model-registry'],
      cloudServices: ['AWS IoT Greengrass', 'Azure IoT Edge'],
      reason:
        'Scattered edge devices need centralized model distribution and GPU server for larger models',
      reasonKo:
        '분산된 엣지 디바이스에 중앙 모델 배포와 대형 모델용 GPU 서버 필요',
    },
  ],
  embeddingText:
    'llama.cpp lightweight LLM inference GGUF quantized CPU ARM Raspberry Pi edge mobile Android iOS local deployment',
  embeddingTextKo:
    'llama.cpp 경량 LLM 추론 GGUF 양자화 CPU ARM Raspberry Pi 엣지 모바일 Android iOS 로컬 배포',
};

// ---------------------------------------------------------------------------
// Text Generation Inference (TGI)
// ---------------------------------------------------------------------------

const tgi: ProductIntelligence = {
  id: 'PI-INF-004',
  productId: 'huggingface-tgi',
  name: 'Text Generation Inference (TGI)',
  nameKo: 'Text Generation Inference (TGI, 텍스트 생성 추론)',
  category: 'ai-inference',
  sourceUrl: 'https://github.com/huggingface/text-generation-inference',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)'],
      installMethod:
        'docker run --gpus all -p 8080:80 ghcr.io/huggingface/text-generation-inference',
      installMethodKo:
        'docker run --gpus all -p 8080:80 ghcr.io/huggingface/text-generation-inference (Docker GPU)',
      minRequirements: {
        cpu: '8 cores',
        ram: '32 GB',
        vram: '24 GB (NVIDIA CUDA)',
        storage: '100 GB SSD',
        network: '10 Gbps',
      },
      infraComponents: ['gpu-server', 'inference-engine', 'container'],
      notes:
        'Docker deployment with NVIDIA GPU; optimized for Hugging Face models with continuous batching and Flash Attention',
      notesKo:
        'NVIDIA GPU가 포함된 Docker 배포; 연속 배칭과 Flash Attention으로 Hugging Face 모델에 최적화',
    },
    {
      platform: 'cloud',
      os: ['Linux (HuggingFace Inference Endpoints)'],
      installMethod: 'Deploy via HuggingFace Inference Endpoints dashboard or API',
      installMethodKo: 'HuggingFace Inference Endpoints 대시보드 또는 API를 통해 배포',
      minRequirements: {
        cpu: '8 cores',
        ram: '32 GB',
        vram: '24 GB',
        storage: '100 GB SSD',
        network: '10 Gbps',
      },
      infraComponents: ['gpu-server', 'inference-engine', 'container', 'load-balancer'],
      notes:
        'Managed deployment on HuggingFace cloud; auto-scaling and monitoring included',
      notesKo:
        'HuggingFace 클라우드의 관리형 배포; 오토 스케일링 및 모니터링 포함',
    },
  ],
  integrations: [
    {
      target: 'Hugging Face Hub',
      method: 'native',
      infraComponents: ['inference-engine'],
      description:
        'Native model loading from Hugging Face Hub; supports all transformer architectures',
      descriptionKo:
        'Hugging Face Hub에서 네이티브 모델 로딩; 모든 트랜스포머 아키텍처 지원',
    },
    {
      target: 'OpenAI API',
      method: 'api',
      infraComponents: ['inference-engine', 'api-gateway'],
      protocol: 'REST',
      description:
        'Messages API compatible with OpenAI format for easy migration from cloud to self-hosted',
      descriptionKo:
        '클라우드에서 셀프 호스팅으로 쉬운 마이그레이션을 위한 OpenAI 형식 호환 Messages API',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Request volume exceeds single GPU capacity or need multi-model endpoints',
      triggerKo: '요청량이 단일 GPU 용량 초과 또는 다중 모델 엔드포인트 필요',
      from: ['gpu-server', 'inference-engine', 'container'],
      to: ['ai-cluster', 'gpu-server', 'inference-engine', 'load-balancer', 'kubernetes'],
      cloudServices: ['HuggingFace Inference Endpoints', 'AWS SageMaker'],
      reason:
        'High request volume requires horizontal scaling with load balancer and Kubernetes orchestration',
      reasonKo:
        '높은 요청량에 로드 밸런서와 Kubernetes 오케스트레이션을 통한 수평 확장 필요',
    },
  ],
  embeddingText:
    'TGI Text Generation Inference HuggingFace Docker GPU server continuous batching Flash Attention production inference serving',
  embeddingTextKo:
    'TGI 텍스트 생성 추론 HuggingFace Docker GPU 서버 연속 배칭 Flash Attention 운영 추론 서빙',
};

// ---------------------------------------------------------------------------
// LocalAI
// ---------------------------------------------------------------------------

const localAI: ProductIntelligence = {
  id: 'PI-INF-005',
  productId: 'localai',
  name: 'LocalAI',
  nameKo: 'LocalAI (로컬AI)',
  category: 'ai-inference',
  sourceUrl: 'https://github.com/mudler/LocalAI',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Linux', 'Windows'],
      installMethod: 'brew install localai or download binary from GitHub releases',
      installMethodKo: 'brew install localai 또는 GitHub 릴리스에서 바이너리 다운로드',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB',
      },
      infraComponents: ['inference-engine', 'app-server'],
      notes:
        'Local desktop installation; CPU-only mode available, supports GGUF, GPTQ, and other formats',
      notesKo:
        '로컬 데스크톱 설치; CPU 전용 모드 가능, GGUF, GPTQ 등 다양한 형식 지원',
    },
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'macOS'],
      installMethod: 'docker run -p 8080:8080 localai/localai',
      installMethodKo: 'docker run -p 8080:8080 localai/localai (Docker 컨테이너)',
      minRequirements: {
        cpu: '8 cores',
        ram: '16 GB',
        vram: '8 GB',
        storage: '50 GB SSD',
        network: '1 Gbps',
      },
      infraComponents: ['inference-engine', 'app-server', 'container'],
      notes:
        'Docker server deployment with optional GPU support; serves as OpenAI API drop-in replacement',
      notesKo:
        '선택적 GPU 지원이 포함된 Docker 서버 배포; OpenAI API 드롭인 대체로 작동',
    },
    {
      platform: 'edge',
      os: ['Linux (ARM64)', 'Linux (Raspberry Pi OS)'],
      installMethod: 'Download ARM64 binary or build from source',
      installMethodKo: 'ARM64 바이너리 다운로드 또는 소스에서 빌드',
      minRequirements: {
        cpu: '4 cores (ARM)',
        ram: '4 GB',
        storage: '5 GB',
      },
      infraComponents: ['inference-engine', 'edge-device'],
      notes:
        'Edge deployment on ARM devices; supports quantized models for resource-constrained environments',
      notesKo:
        'ARM 디바이스에서의 엣지 배포; 리소스 제한 환경을 위한 양자화 모델 지원',
    },
  ],
  integrations: [
    {
      target: 'OpenAI-compatible clients',
      method: 'api',
      infraComponents: ['inference-engine', 'api-gateway'],
      protocol: 'REST',
      description:
        'Full OpenAI API compatibility (chat, completion, embeddings, images, audio); works with any OpenAI SDK client',
      descriptionKo:
        '완전한 OpenAI API 호환(채팅, 완성, 임베딩, 이미지, 오디오); 모든 OpenAI SDK 클라이언트와 호환',
    },
    {
      target: 'LangChain',
      method: 'api',
      infraComponents: ['inference-engine', 'app-server'],
      protocol: 'REST',
      description:
        'Integration with LangChain via OpenAI-compatible endpoint for RAG and agent workflows',
      descriptionKo:
        'RAG 및 에이전트 워크플로우를 위한 OpenAI 호환 엔드포인트를 통한 LangChain 연동',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Multi-modal workloads (text + image + audio) or team-wide deployment',
      triggerKo: '멀티모달 워크로드(텍스트 + 이미지 + 오디오) 또는 팀 전체 배포',
      from: ['inference-engine', 'app-server', 'container'],
      to: ['gpu-server', 'inference-engine', 'load-balancer', 'kubernetes', 'container'],
      cloudServices: ['AWS ECS', 'GCP Cloud Run'],
      reason:
        'Multi-modal serving requires GPU acceleration and horizontal scaling for acceptable latency across modalities',
      reasonKo:
        '멀티모달 서빙에 GPU 가속과 모달리티 간 허용 가능한 지연 시간을 위한 수평 확장 필요',
    },
  ],
  embeddingText:
    'LocalAI OpenAI compatible local inference GGUF GPTQ CPU GPU Docker edge ARM multi-modal text image audio serving',
  embeddingTextKo:
    'LocalAI OpenAI 호환 로컬 추론 GGUF GPTQ CPU GPU Docker 엣지 ARM 멀티모달 텍스트 이미지 오디오 서빙',
};

// ---------------------------------------------------------------------------
// LM Studio
// ---------------------------------------------------------------------------

const lmStudio: ProductIntelligence = {
  id: 'PI-INF-006',
  productId: 'lm-studio',
  name: 'LM Studio',
  nameKo: 'LM Studio (LM 스튜디오)',
  category: 'ai-inference',
  sourceUrl: 'https://lmstudio.ai/',
  deploymentProfiles: [
    {
      platform: 'desktop',
      os: ['macOS', 'Windows', 'Linux'],
      installMethod: 'Download native installer from lmstudio.ai',
      installMethodKo: 'lmstudio.ai에서 네이티브 설치 프로그램 다운로드',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB',
      },
      infraComponents: ['app-server', 'inference-engine'],
      notes:
        'GUI-based desktop application; local-first with built-in model discovery, download, and chat interface',
      notesKo:
        'GUI 기반 데스크톱 애플리케이션; 내장 모델 검색, 다운로드 및 채팅 인터페이스를 갖춘 로컬 우선',
    },
  ],
  integrations: [
    {
      target: 'OpenAI-compatible clients',
      method: 'api',
      infraComponents: ['inference-engine', 'app-server'],
      protocol: 'REST',
      description:
        'Built-in local server with OpenAI-compatible API; enables integration with VS Code, Cursor, and other dev tools',
      descriptionKo:
        'OpenAI 호환 API가 포함된 내장 로컬 서버; VS Code, Cursor 등 개발 도구와 연동 가능',
    },
    {
      target: 'Hugging Face',
      method: 'api',
      infraComponents: ['app-server'],
      protocol: 'REST',
      description:
        'Browse and download models directly from Hugging Face within the application UI',
      descriptionKo:
        '애플리케이션 UI 내에서 Hugging Face의 모델을 직접 탐색하고 다운로드',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Need production-grade serving or team access beyond single desktop',
      triggerKo: '단일 데스크톱을 넘어 프로덕션급 서빙 또는 팀 접근 필요',
      from: ['app-server', 'inference-engine'],
      to: ['gpu-server', 'inference-engine', 'load-balancer', 'api-gateway'],
      cloudServices: ['AWS EC2 G5', 'GCP A2 instances'],
      reason:
        'LM Studio is desktop-only; production/team use requires migrating to server-based inference engine with API gateway',
      reasonKo:
        'LM Studio는 데스크톱 전용; 프로덕션/팀 사용에 API 게이트웨이를 갖춘 서버 기반 추론 엔진으로 마이그레이션 필요',
    },
  ],
  embeddingText:
    'LM Studio desktop GUI local LLM inference model discovery download chat GGUF OpenAI compatible local server developer tools',
  embeddingTextKo:
    'LM Studio 데스크톱 GUI 로컬 LLM 추론 모델 검색 다운로드 채팅 GGUF OpenAI 호환 로컬 서버 개발자 도구',
};

// ---------------------------------------------------------------------------
// Triton Inference Server
// ---------------------------------------------------------------------------

const triton: ProductIntelligence = {
  id: 'PI-INF-007',
  productId: 'nvidia-triton',
  name: 'Triton Inference Server',
  nameKo: 'Triton Inference Server (트리톤 추론 서버)',
  category: 'ai-inference',
  sourceUrl: 'https://github.com/triton-inference-server/server',
  deploymentProfiles: [
    {
      platform: 'server',
      os: ['Linux (Ubuntu 22.04+)', 'RHEL 9'],
      installMethod:
        'docker run --gpus all -p 8000:8000 -p 8001:8001 -p 8002:8002 nvcr.io/nvidia/tritonserver',
      installMethodKo:
        'docker run --gpus all nvcr.io/nvidia/tritonserver (NVIDIA Container Registry Docker)',
      minRequirements: {
        cpu: '16 cores',
        ram: '64 GB',
        vram: '48 GB (NVIDIA A100/H100)',
        storage: '500 GB SSD',
        network: '25 Gbps',
      },
      infraComponents: ['gpu-server', 'inference-engine', 'ai-cluster', 'container'],
      notes:
        'Enterprise-grade multi-model serving with dynamic batching, model ensemble, and concurrent model execution',
      notesKo:
        '동적 배칭, 모델 앙상블, 동시 모델 실행이 포함된 엔터프라이즈급 다중 모델 서빙',
    },
    {
      platform: 'cloud',
      os: ['Linux (NVIDIA GPU Cloud)', 'Linux (AWS/GCP/Azure GPU VMs)'],
      installMethod: 'Deploy via NVIDIA GPU Cloud (NGC) catalog or cloud marketplace',
      installMethodKo: 'NVIDIA GPU Cloud(NGC) 카탈로그 또는 클라우드 마켓플레이스를 통해 배포',
      minRequirements: {
        cpu: '32 cores',
        ram: '128 GB',
        vram: '80 GB (multi-GPU)',
        storage: '1 TB SSD',
        network: '100 Gbps',
      },
      infraComponents: ['gpu-server', 'inference-engine', 'ai-cluster', 'container', 'kubernetes'],
      notes:
        'Cloud-scale deployment with Kubernetes; supports multi-node multi-GPU inference with model repository',
      notesKo:
        'Kubernetes를 사용한 클라우드 규모 배포; 모델 저장소와 함께 다중 노드 다중 GPU 추론 지원',
    },
  ],
  integrations: [
    {
      target: 'TensorRT',
      method: 'native',
      infraComponents: ['gpu-server', 'inference-engine'],
      description:
        'Native TensorRT backend for maximum GPU inference performance with optimized model graphs',
      descriptionKo:
        '최적화된 모델 그래프로 최대 GPU 추론 성능을 위한 네이티브 TensorRT 백엔드',
    },
    {
      target: 'Kubernetes',
      method: 'native',
      infraComponents: ['kubernetes', 'ai-cluster'],
      description:
        'Kubernetes-native deployment with Helm charts, auto-scaling, and health monitoring',
      descriptionKo:
        'Helm 차트, 오토 스케일링, 상태 모니터링이 포함된 Kubernetes 네이티브 배포',
    },
    {
      target: 'Prometheus/Grafana',
      method: 'api',
      infraComponents: ['inference-engine', 'app-server'],
      protocol: 'REST',
      description:
        'Built-in metrics endpoint for Prometheus scraping; GPU utilization, latency, and throughput monitoring',
      descriptionKo:
        'Prometheus 스크래핑을 위한 내장 메트릭 엔드포인트; GPU 활용률, 지연 시간, 처리량 모니터링',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Multi-model production workload with strict latency SLAs and high availability',
      triggerKo: '엄격한 지연 시간 SLA와 고가용성이 필요한 다중 모델 운영 워크로드',
      from: ['gpu-server', 'inference-engine', 'ai-cluster'],
      to: ['ai-cluster', 'gpu-server', 'inference-engine', 'kubernetes', 'load-balancer', 'model-registry'],
      cloudServices: ['NVIDIA DGX Cloud', 'AWS SageMaker', 'Azure ML'],
      reason:
        'Enterprise SLAs require multi-datacenter deployment with model registry, advanced orchestration, and failover',
      reasonKo:
        '엔터프라이즈 SLA에 모델 레지스트리, 고급 오케스트레이션, 장애 조치를 갖춘 다중 데이터센터 배포 필요',
    },
  ],
  embeddingText:
    'Triton Inference Server NVIDIA enterprise multi-model serving dynamic batching TensorRT Kubernetes GPU cluster production deployment',
  embeddingTextKo:
    'Triton 추론 서버 NVIDIA 엔터프라이즈 다중 모델 서빙 동적 배칭 TensorRT Kubernetes GPU 클러스터 운영 배포',
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** AI inference engine product intelligence data (7 products) */
export const aiInferenceProducts: ProductIntelligence[] = [
  ollama,
  vllm,
  llamaCpp,
  tgi,
  localAI,
  lmStudio,
  triton,
];
