/**
 * Product Intelligence - Cloud Compute Products
 *
 * Cloud-native compute services: serverless functions, container orchestration,
 * GPU/ML platforms across AWS, GCP, Azure, and specialized providers.
 *
 * Products: AWS Lambda, AWS ECS, AWS SageMaker, GCP Cloud Run,
 *           GCP Vertex AI, Azure Container Apps, RunPod
 */

import type { ProductIntelligence } from './types';

// ---------------------------------------------------------------------------
// AWS Lambda
// ---------------------------------------------------------------------------

const awsLambda: ProductIntelligence = {
  id: 'PI-CLD-001',
  productId: 'aws-lambda',
  name: 'AWS Lambda',
  nameKo: 'AWS Lambda (AWS 람다)',
  category: 'cloud-compute',
  sourceUrl: 'https://aws.amazon.com/lambda/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['AWS Managed Runtime'],
      installMethod: 'Deploy via AWS Console, CLI, SAM, or CDK with function code package',
      installMethodKo: 'AWS 콘솔, CLI, SAM 또는 CDK를 통해 함수 코드 패키지 배포',
      minRequirements: {
        ram: '128 MB - 10 GB (configurable)',
        storage: '512 MB /tmp (configurable to 10 GB)',
      },
      infraComponents: ['app-server', 'api-gateway'],
      notes:
        'Serverless event-driven functions; auto-scales to zero; supports Node.js, Python, Java, Go, .NET, Ruby',
      notesKo:
        '서버리스 이벤트 기반 함수; 자동으로 제로 스케일링; Node.js, Python, Java, Go, .NET, Ruby 지원',
    },
  ],
  integrations: [
    {
      target: 'API Gateway',
      method: 'native',
      infraComponents: ['api-gateway'],
      protocol: 'REST',
      description: 'AWS API Gateway triggers Lambda functions for HTTP request handling',
      descriptionKo: 'AWS API Gateway가 HTTP 요청 처리를 위해 Lambda 함수를 트리거',
    },
    {
      target: 'S3',
      method: 'native',
      infraComponents: ['object-storage'],
      description: 'S3 event notifications trigger Lambda for file processing workflows',
      descriptionKo: 'S3 이벤트 알림이 파일 처리 워크플로우를 위해 Lambda를 트리거',
    },
    {
      target: 'SQS',
      method: 'native',
      infraComponents: ['app-server'],
      description: 'SQS message queue triggers Lambda for async event processing',
      descriptionKo: 'SQS 메시지 큐가 비동기 이벤트 처리를 위해 Lambda를 트리거',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Cold start latency exceeds SLA or need persistent connections',
      triggerKo: '콜드 스타트 지연 시간이 SLA 초과 또는 지속적 연결 필요',
      from: ['app-server', 'api-gateway'],
      to: ['container', 'load-balancer', 'kubernetes'],
      cloudServices: ['AWS ECS', 'AWS EKS', 'AWS Fargate'],
      reason:
        'Lambda cold starts and execution time limits may not suit latency-sensitive or long-running workloads',
      reasonKo:
        'Lambda 콜드 스타트와 실행 시간 제한이 지연 시간에 민감하거나 장기 실행 워크로드에 부적합할 수 있음',
    },
  ],
  embeddingText:
    'AWS Lambda serverless functions event-driven auto-scaling API Gateway S3 SQS cloud compute pay-per-use',
  embeddingTextKo:
    'AWS Lambda 서버리스 함수 이벤트 기반 자동 스케일링 API Gateway S3 SQS 클라우드 컴퓨트 사용량 기반 과금',
};

// ---------------------------------------------------------------------------
// AWS ECS
// ---------------------------------------------------------------------------

const awsECS: ProductIntelligence = {
  id: 'PI-CLD-002',
  productId: 'aws-ecs',
  name: 'AWS ECS',
  nameKo: 'AWS ECS (Elastic Container Service)',
  category: 'cloud-container',
  sourceUrl: 'https://aws.amazon.com/ecs/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['AWS Managed (Fargate)', 'Linux (EC2 launch type)'],
      installMethod: 'Create ECS cluster via Console, CLI, or CDK; define task definitions and services',
      installMethodKo: '콘솔, CLI 또는 CDK를 통해 ECS 클러스터 생성; 태스크 정의 및 서비스 정의',
      minRequirements: {
        cpu: '0.25 vCPU (Fargate min)',
        ram: '512 MB (Fargate min)',
        storage: '20 GB ephemeral',
        network: '5 Gbps (VPC)',
      },
      infraComponents: ['container', 'load-balancer'],
      notes:
        'Managed container orchestration; supports Fargate (serverless) and EC2 launch types with ALB integration',
      notesKo:
        '관리형 컨테이너 오케스트레이션; Fargate(서버리스) 및 EC2 시작 유형을 ALB 통합과 함께 지원',
    },
  ],
  integrations: [
    {
      target: 'ECR',
      method: 'native',
      infraComponents: ['container'],
      description: 'Pull container images from Elastic Container Registry for task deployment',
      descriptionKo: '태스크 배포를 위해 Elastic Container Registry에서 컨테이너 이미지 풀링',
    },
    {
      target: 'ALB',
      method: 'native',
      infraComponents: ['load-balancer'],
      protocol: 'HTTP/HTTPS',
      description: 'Application Load Balancer distributes traffic across ECS tasks with health checks',
      descriptionKo: 'Application Load Balancer가 헬스 체크와 함께 ECS 태스크로 트래픽 분산',
    },
    {
      target: 'CloudWatch',
      method: 'native',
      infraComponents: ['app-server'],
      description: 'Centralized logging and metrics collection for container monitoring',
      descriptionKo: '컨테이너 모니터링을 위한 중앙 집중식 로깅 및 메트릭 수집',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Complex multi-service deployments need advanced networking and service mesh',
      triggerKo: '복잡한 멀티 서비스 배포에 고급 네트워킹과 서비스 메시 필요',
      from: ['container', 'load-balancer'],
      to: ['container', 'kubernetes', 'load-balancer', 'api-gateway'],
      cloudServices: ['AWS EKS', 'AWS App Mesh', 'AWS Fargate'],
      reason:
        'ECS service-to-service communication becomes complex at scale; EKS provides richer orchestration with Kubernetes ecosystem',
      reasonKo:
        'ECS 서비스 간 통신이 규모가 커지면 복잡해짐; EKS가 Kubernetes 생태계와 더 풍부한 오케스트레이션 제공',
    },
  ],
  embeddingText:
    'AWS ECS Elastic Container Service Fargate Docker container orchestration ALB ECR CloudWatch managed cloud',
  embeddingTextKo:
    'AWS ECS Elastic Container Service Fargate Docker 컨테이너 오케스트레이션 ALB ECR CloudWatch 관리형 클라우드',
};

// ---------------------------------------------------------------------------
// AWS SageMaker
// ---------------------------------------------------------------------------

const awsSageMaker: ProductIntelligence = {
  id: 'PI-CLD-003',
  productId: 'aws-sagemaker',
  name: 'AWS SageMaker',
  nameKo: 'AWS SageMaker (세이지메이커)',
  category: 'cloud-gpu',
  sourceUrl: 'https://aws.amazon.com/sagemaker/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['AWS Managed Runtime'],
      installMethod:
        'Create SageMaker domain via Console or CLI; launch notebooks, training jobs, and endpoints',
      installMethodKo: '콘솔 또는 CLI를 통해 SageMaker 도메인 생성; 노트북, 훈련 작업, 엔드포인트 시작',
      minRequirements: {
        cpu: '2 vCPU (ml.t3.medium notebook)',
        ram: '4 GB (notebook instance)',
        vram: '16 GB (ml.g4dn.xlarge for training)',
        storage: '50 GB EBS',
        network: '10 Gbps (VPC)',
      },
      infraComponents: ['gpu-server', 'ai-cluster', 'model-registry', 'inference-engine'],
      notes:
        'End-to-end ML platform: data labeling, training, tuning, model registry, real-time and batch inference endpoints',
      notesKo:
        '엔드투엔드 ML 플랫폼: 데이터 라벨링, 훈련, 튜닝, 모델 레지스트리, 실시간 및 배치 추론 엔드포인트',
    },
  ],
  integrations: [
    {
      target: 'S3',
      method: 'native',
      infraComponents: ['object-storage'],
      description: 'S3 as primary data store for training datasets and model artifacts',
      descriptionKo: '훈련 데이터셋과 모델 아티팩트의 주요 데이터 저장소로 S3 사용',
    },
    {
      target: 'ECR',
      method: 'native',
      infraComponents: ['container'],
      description: 'Custom training and inference containers stored in Elastic Container Registry',
      descriptionKo: 'Elastic Container Registry에 저장된 커스텀 훈련 및 추론 컨테이너',
    },
    {
      target: 'Step Functions',
      method: 'native',
      infraComponents: ['app-server'],
      description: 'Orchestrate ML pipelines with AWS Step Functions for automated workflows',
      descriptionKo: '자동화된 워크플로우를 위해 AWS Step Functions로 ML 파이프라인 오케스트레이션',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Training on datasets exceeding 100 GB or distributed multi-GPU training needed',
      triggerKo: '100 GB를 초과하는 데이터셋 훈련 또는 분산 멀티 GPU 훈련 필요',
      from: ['gpu-server', 'model-registry'],
      to: ['ai-cluster', 'gpu-server', 'model-registry', 'inference-engine', 'load-balancer'],
      cloudServices: ['AWS SageMaker HyperPod', 'AWS Trainium', 'AWS Inferentia'],
      reason:
        'Single GPU instance cannot handle large-scale training; distributed training cluster with custom silicon accelerators needed',
      reasonKo:
        '단일 GPU 인스턴스로 대규모 훈련 처리 불가; 커스텀 실리콘 가속기를 갖춘 분산 훈련 클러스터 필요',
    },
  ],
  embeddingText:
    'AWS SageMaker ML machine learning training inference model registry GPU cluster distributed S3 endpoint deployment',
  embeddingTextKo:
    'AWS SageMaker ML 머신러닝 훈련 추론 모델 레지스트리 GPU 클러스터 분산 S3 엔드포인트 배포',
};

// ---------------------------------------------------------------------------
// GCP Cloud Run
// ---------------------------------------------------------------------------

const gcpCloudRun: ProductIntelligence = {
  id: 'PI-CLD-004',
  productId: 'gcp-cloud-run',
  name: 'GCP Cloud Run',
  nameKo: 'GCP Cloud Run (클라우드 런)',
  category: 'cloud-container',
  sourceUrl: 'https://cloud.google.com/run',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['GCP Managed Runtime'],
      installMethod:
        'Deploy container image via gcloud CLI, Console, or Cloud Build; auto-scaling with HTTPS endpoint',
      installMethodKo:
        'gcloud CLI, 콘솔 또는 Cloud Build를 통해 컨테이너 이미지 배포; HTTPS 엔드포인트와 자동 스케일링',
      minRequirements: {
        cpu: '1 vCPU',
        ram: '512 MB',
        storage: 'In-memory only (stateless)',
        network: '1 Gbps',
      },
      infraComponents: ['container', 'load-balancer', 'api-gateway'],
      notes:
        'Fully managed serverless container platform; auto-scales to zero; supports any language via container images',
      notesKo:
        '완전 관리형 서버리스 컨테이너 플랫폼; 자동 제로 스케일링; 컨테이너 이미지를 통해 모든 언어 지원',
    },
  ],
  integrations: [
    {
      target: 'Cloud Build',
      method: 'native',
      infraComponents: ['container'],
      description: 'CI/CD pipeline: build container images and auto-deploy to Cloud Run',
      descriptionKo: 'CI/CD 파이프라인: 컨테이너 이미지 빌드 후 Cloud Run에 자동 배포',
    },
    {
      target: 'Cloud SQL',
      method: 'native',
      infraComponents: ['db-server'],
      description: 'Managed relational database connection via Cloud SQL connector',
      descriptionKo: 'Cloud SQL 커넥터를 통한 관리형 관계형 데이터베이스 연결',
    },
    {
      target: 'Pub/Sub',
      method: 'native',
      infraComponents: ['app-server'],
      description: 'Event-driven invocation via Cloud Pub/Sub push subscriptions',
      descriptionKo: 'Cloud Pub/Sub 푸시 구독을 통한 이벤트 기반 호출',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Workload requires persistent state, GPU access, or multi-container pods',
      triggerKo: '워크로드에 영구 상태, GPU 접근 또는 멀티 컨테이너 팟 필요',
      from: ['container', 'load-balancer'],
      to: ['container', 'kubernetes', 'gpu-server', 'load-balancer'],
      cloudServices: ['GKE', 'GKE Autopilot', 'Cloud Run for Anthos'],
      reason:
        'Cloud Run is stateless and lacks GPU support; GKE provides full Kubernetes with GPU node pools and persistent volumes',
      reasonKo:
        'Cloud Run은 무상태이며 GPU를 지원하지 않음; GKE가 GPU 노드 풀과 영구 볼륨을 갖춘 전체 Kubernetes 제공',
    },
  ],
  embeddingText:
    'GCP Cloud Run serverless container auto-scaling HTTPS Pub/Sub Cloud Build Cloud SQL managed Google Cloud',
  embeddingTextKo:
    'GCP Cloud Run 서버리스 컨테이너 자동 스케일링 HTTPS Pub/Sub Cloud Build Cloud SQL 관리형 Google Cloud',
};

// ---------------------------------------------------------------------------
// GCP Vertex AI
// ---------------------------------------------------------------------------

const gcpVertexAI: ProductIntelligence = {
  id: 'PI-CLD-005',
  productId: 'gcp-vertex-ai',
  name: 'GCP Vertex AI',
  nameKo: 'GCP Vertex AI (버텍스 AI)',
  category: 'cloud-gpu',
  sourceUrl: 'https://cloud.google.com/vertex-ai',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['GCP Managed Runtime'],
      installMethod:
        'Create Vertex AI Workbench; configure training pipelines and deploy model endpoints via Console or SDK',
      installMethodKo:
        'Vertex AI Workbench 생성; 콘솔 또는 SDK를 통해 훈련 파이프라인 구성 및 모델 엔드포인트 배포',
      minRequirements: {
        cpu: '4 vCPU (n1-standard-4)',
        ram: '15 GB',
        vram: '16 GB (NVIDIA T4)',
        storage: '100 GB persistent disk',
        network: '10 Gbps',
      },
      infraComponents: ['gpu-server', 'ai-cluster', 'model-registry'],
      notes:
        'Unified ML platform: AutoML, custom training, feature store, model registry, prediction endpoints, and MLOps pipelines',
      notesKo:
        '통합 ML 플랫폼: AutoML, 커스텀 훈련, 피처 스토어, 모델 레지스트리, 예측 엔드포인트, MLOps 파이프라인',
    },
  ],
  integrations: [
    {
      target: 'BigQuery',
      method: 'native',
      infraComponents: ['db-server'],
      description: 'Direct integration with BigQuery for feature engineering and training data access',
      descriptionKo: '피처 엔지니어링과 훈련 데이터 접근을 위한 BigQuery 직접 통합',
    },
    {
      target: 'GCS',
      method: 'native',
      infraComponents: ['object-storage'],
      description: 'Google Cloud Storage as primary artifact and dataset storage for ML workflows',
      descriptionKo: 'ML 워크플로우를 위한 주요 아티팩트 및 데이터셋 저장소로 Google Cloud Storage 사용',
    },
    {
      target: 'Vertex AI Pipelines',
      method: 'native',
      infraComponents: ['app-server', 'ai-cluster'],
      description: 'Kubeflow-based ML pipeline orchestration for reproducible training workflows',
      descriptionKo: '재현 가능한 훈련 워크플로우를 위한 Kubeflow 기반 ML 파이프라인 오케스트레이션',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Training workloads require multi-node distributed training with TPU pods',
      triggerKo: '훈련 워크로드에 TPU 팟을 사용한 멀티 노드 분산 훈련 필요',
      from: ['gpu-server', 'model-registry'],
      to: ['ai-cluster', 'gpu-server', 'model-registry', 'inference-engine', 'load-balancer'],
      cloudServices: ['GCP TPU v5e', 'Vertex AI HyperTune', 'GKE with GPU'],
      reason:
        'Single GPU node cannot handle foundation model training; TPU pods and distributed training infrastructure needed',
      reasonKo:
        '단일 GPU 노드로 파운데이션 모델 훈련 불가; TPU 팟과 분산 훈련 인프라 필요',
    },
  ],
  embeddingText:
    'GCP Vertex AI ML platform AutoML training inference feature store model registry BigQuery TPU Google Cloud MLOps',
  embeddingTextKo:
    'GCP Vertex AI ML 플랫폼 AutoML 훈련 추론 피처 스토어 모델 레지스트리 BigQuery TPU Google Cloud MLOps',
};

// ---------------------------------------------------------------------------
// Azure Container Apps
// ---------------------------------------------------------------------------

const azureContainerApps: ProductIntelligence = {
  id: 'PI-CLD-006',
  productId: 'azure-container-apps',
  name: 'Azure Container Apps',
  nameKo: 'Azure Container Apps (컨테이너 앱)',
  category: 'cloud-container',
  sourceUrl: 'https://azure.microsoft.com/en-us/products/container-apps',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['Azure Managed Runtime'],
      installMethod:
        'Deploy via Azure CLI, Portal, or Bicep/ARM templates with container image reference',
      installMethodKo:
        'Azure CLI, 포털 또는 Bicep/ARM 템플릿을 통해 컨테이너 이미지 참조로 배포',
      minRequirements: {
        cpu: '0.25 vCPU',
        ram: '0.5 GB',
        storage: 'Ephemeral (stateless)',
        network: 'Virtual network integration',
      },
      infraComponents: ['container', 'load-balancer'],
      notes:
        'Serverless container platform built on Kubernetes; auto-scaling with Dapr sidecar support for microservices',
      notesKo:
        'Kubernetes 기반 서버리스 컨테이너 플랫폼; 마이크로서비스를 위한 Dapr 사이드카 지원과 자동 스케일링',
    },
  ],
  integrations: [
    {
      target: 'Azure Container Registry',
      method: 'native',
      infraComponents: ['container'],
      description: 'Pull container images from ACR with managed identity authentication',
      descriptionKo: '관리 ID 인증을 통해 ACR에서 컨테이너 이미지 풀링',
    },
    {
      target: 'Dapr',
      method: 'native',
      infraComponents: ['app-server', 'api-gateway'],
      description: 'Built-in Dapr integration for service-to-service invocation, state management, and pub/sub',
      descriptionKo: '서비스 간 호출, 상태 관리, pub/sub을 위한 내장 Dapr 통합',
    },
    {
      target: 'Azure Service Bus',
      method: 'native',
      infraComponents: ['app-server'],
      description: 'Event-driven scaling with Azure Service Bus queue-based triggers',
      descriptionKo: 'Azure Service Bus 큐 기반 트리거를 사용한 이벤트 기반 스케일링',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Need advanced networking, custom operators, or GPU workloads',
      triggerKo: '고급 네트워킹, 커스텀 오퍼레이터 또는 GPU 워크로드 필요',
      from: ['container', 'load-balancer'],
      to: ['container', 'kubernetes', 'gpu-server', 'load-balancer'],
      cloudServices: ['AKS', 'Azure Kubernetes Service', 'Azure Machine Learning'],
      reason:
        'Container Apps abstracts Kubernetes but limits advanced features; AKS provides full control for complex deployments',
      reasonKo:
        'Container Apps는 Kubernetes를 추상화하지만 고급 기능이 제한됨; AKS가 복잡한 배포를 위한 전체 제어 제공',
    },
  ],
  embeddingText:
    'Azure Container Apps serverless container Kubernetes Dapr microservices auto-scaling ACR Service Bus managed Azure',
  embeddingTextKo:
    'Azure Container Apps 서버리스 컨테이너 Kubernetes Dapr 마이크로서비스 자동 스케일링 ACR Service Bus 관리형 Azure',
};

// ---------------------------------------------------------------------------
// RunPod
// ---------------------------------------------------------------------------

const runPod: ProductIntelligence = {
  id: 'PI-CLD-007',
  productId: 'runpod',
  name: 'RunPod',
  nameKo: 'RunPod (런팟)',
  category: 'cloud-gpu',
  sourceUrl: 'https://www.runpod.io/',
  deploymentProfiles: [
    {
      platform: 'cloud',
      os: ['RunPod Managed (Linux-based containers)'],
      installMethod:
        'Select GPU type and deploy container via RunPod Console, CLI, or API; supports serverless and pod modes',
      installMethodKo:
        'RunPod 콘솔, CLI 또는 API를 통해 GPU 유형 선택 및 컨테이너 배포; 서버리스 및 팟 모드 지원',
      minRequirements: {
        vram: '16 GB (RTX A4000 min)',
        storage: '20 GB container volume',
        network: '1 Gbps',
      },
      infraComponents: ['gpu-server', 'inference-engine', 'container'],
      notes:
        'GPU cloud for AI inference and training; serverless GPU endpoints with auto-scaling; supports NVIDIA A100, H100, RTX series',
      notesKo:
        'AI 추론 및 훈련을 위한 GPU 클라우드; 자동 스케일링이 가능한 서버리스 GPU 엔드포인트; NVIDIA A100, H100, RTX 시리즈 지원',
    },
  ],
  integrations: [
    {
      target: 'Docker Hub',
      method: 'native',
      infraComponents: ['container'],
      description: 'Pull custom Docker images from Docker Hub or private registries for GPU pods',
      descriptionKo: 'GPU 팟을 위해 Docker Hub 또는 프라이빗 레지스트리에서 커스텀 Docker 이미지 풀링',
    },
    {
      target: 'RunPod Serverless API',
      method: 'api',
      infraComponents: ['api-gateway', 'inference-engine'],
      protocol: 'REST',
      description: 'Serverless GPU endpoints with REST API for on-demand inference at scale',
      descriptionKo: '대규모 온디맨드 추론을 위한 REST API 기반 서버리스 GPU 엔드포인트',
    },
    {
      target: 'vLLM',
      method: 'native',
      infraComponents: ['inference-engine', 'gpu-server'],
      description: 'Native vLLM integration for high-throughput LLM serving on RunPod GPUs',
      descriptionKo: 'RunPod GPU에서 고처리량 LLM 서빙을 위한 네이티브 vLLM 통합',
    },
  ],
  scaleUpPaths: [
    {
      trigger: 'Production workloads need multi-region deployment and enterprise SLA guarantees',
      triggerKo: '프로덕션 워크로드에 멀티 리전 배포와 엔터프라이즈 SLA 보장 필요',
      from: ['gpu-server', 'inference-engine'],
      to: ['ai-cluster', 'gpu-server', 'load-balancer', 'inference-engine', 'kubernetes'],
      cloudServices: ['AWS SageMaker', 'GCP Vertex AI', 'Azure ML'],
      reason:
        'RunPod excels for cost-effective GPU access but enterprise production requires managed ML platforms with SLA and multi-region support',
      reasonKo:
        'RunPod는 비용 효율적인 GPU 접근에 탁월하지만 기업 프로덕션에는 SLA와 멀티 리전 지원이 있는 관리형 ML 플랫폼 필요',
    },
  ],
  embeddingText:
    'RunPod GPU cloud AI inference serverless endpoint vLLM NVIDIA A100 H100 container training cost-effective on-demand',
  embeddingTextKo:
    'RunPod GPU 클라우드 AI 추론 서버리스 엔드포인트 vLLM NVIDIA A100 H100 컨테이너 훈련 비용 효율적 온디맨드',
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Cloud compute product intelligence data (7 products) */
export const cloudComputeProducts: ProductIntelligence[] = [
  awsLambda,
  awsECS,
  awsSageMaker,
  gcpCloudRun,
  gcpVertexAI,
  azureContainerApps,
  runPod,
];
