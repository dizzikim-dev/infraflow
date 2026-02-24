/**
 * Product Intelligence - Type Definition Tests
 *
 * Validates the shape, union types, and optional fields of all PI types.
 */

import { describe, it, expect } from 'vitest';
import type {
  PICategory,
  DeploymentPlatform,
  IntegrationMethod,
  ResourceRequirements,
  DeploymentProfile,
  IntegrationInfo,
  ScaleUpPath,
  ProductIntelligence,
} from '../types';

// ---------------------------------------------------------------------------
// PICategory — 12 values
// ---------------------------------------------------------------------------

describe('PICategory', () => {
  it('should accept all 12 valid category values', () => {
    const categories: PICategory[] = [
      'ai-inference',
      'ai-assistant',
      'ai-framework',
      'vector-db',
      'ai-gateway',
      'ai-orchestrator',
      'ai-monitor',
      'cloud-compute',
      'cloud-gpu',
      'cloud-container',
      'communication',
      'devops',
    ];

    expect(categories).toHaveLength(12);
    // Each value should be a string
    for (const cat of categories) {
      expect(typeof cat).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// DeploymentPlatform — 5 values
// ---------------------------------------------------------------------------

describe('DeploymentPlatform', () => {
  it('should accept all 5 valid platform values', () => {
    const platforms: DeploymentPlatform[] = [
      'desktop',
      'mobile',
      'server',
      'edge',
      'cloud',
    ];

    expect(platforms).toHaveLength(5);
    for (const p of platforms) {
      expect(typeof p).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// IntegrationMethod — 5 values
// ---------------------------------------------------------------------------

describe('IntegrationMethod', () => {
  it('should accept all 5 valid method values', () => {
    const methods: IntegrationMethod[] = [
      'webhook',
      'api',
      'plugin',
      'native',
      'mcp',
    ];

    expect(methods).toHaveLength(5);
    for (const m of methods) {
      expect(typeof m).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// ResourceRequirements — all fields optional
// ---------------------------------------------------------------------------

describe('ResourceRequirements', () => {
  it('should allow an empty object (all fields optional)', () => {
    const empty: ResourceRequirements = {};
    expect(empty).toBeDefined();
    expect(empty.cpu).toBeUndefined();
    expect(empty.ram).toBeUndefined();
    expect(empty.vram).toBeUndefined();
    expect(empty.storage).toBeUndefined();
    expect(empty.network).toBeUndefined();
  });

  it('should allow partial fields', () => {
    const partial: ResourceRequirements = {
      cpu: '4 cores',
      ram: '16 GB',
    };
    expect(partial.cpu).toBe('4 cores');
    expect(partial.ram).toBe('16 GB');
    expect(partial.vram).toBeUndefined();
    expect(partial.storage).toBeUndefined();
    expect(partial.network).toBeUndefined();
  });

  it('should allow all fields populated', () => {
    const full: ResourceRequirements = {
      cpu: '8 cores',
      ram: '32 GB',
      vram: '24 GB',
      storage: '500 GB SSD',
      network: '1 Gbps',
    };
    expect(full.cpu).toBe('8 cores');
    expect(full.ram).toBe('32 GB');
    expect(full.vram).toBe('24 GB');
    expect(full.storage).toBe('500 GB SSD');
    expect(full.network).toBe('1 Gbps');
  });
});

// ---------------------------------------------------------------------------
// DeploymentProfile
// ---------------------------------------------------------------------------

describe('DeploymentProfile', () => {
  it('should create a valid deployment profile', () => {
    const profile: DeploymentProfile = {
      platform: 'desktop',
      os: ['macOS', 'Windows', 'Linux'],
      installMethod: 'Native installer',
      installMethodKo: '네이티브 설치 프로그램',
      minRequirements: {
        cpu: '4 cores',
        ram: '8 GB',
        storage: '10 GB',
      },
      infraComponents: ['edge-device'],
      notes: 'Runs locally with optional GPU acceleration',
      notesKo: 'GPU 가속을 옵션으로 로컬에서 실행',
    };

    expect(profile.platform).toBe('desktop');
    expect(profile.os).toHaveLength(3);
    expect(profile.installMethod).toContain('installer');
    expect(profile.installMethodKo).toContain('설치');
    expect(profile.minRequirements.cpu).toBe('4 cores');
    expect(profile.infraComponents).toContain('edge-device');
    expect(profile.notes).toContain('GPU');
    expect(profile.notesKo).toContain('GPU');
  });

  it('should support server deployment with full requirements', () => {
    const serverProfile: DeploymentProfile = {
      platform: 'server',
      os: ['Ubuntu 22.04', 'RHEL 9'],
      installMethod: 'Docker container',
      installMethodKo: 'Docker 컨테이너',
      minRequirements: {
        cpu: '16 cores',
        ram: '64 GB',
        vram: '48 GB',
        storage: '1 TB NVMe',
        network: '10 Gbps',
      },
      infraComponents: ['gpu-server', 'container', 'inference-engine'],
      notes: 'Production deployment requires NVIDIA A100 or H100 GPU',
      notesKo: '운영 배포에 NVIDIA A100 또는 H100 GPU 필요',
    };

    expect(serverProfile.platform).toBe('server');
    expect(serverProfile.minRequirements.vram).toBe('48 GB');
    expect(serverProfile.minRequirements.network).toBe('10 Gbps');
    expect(serverProfile.infraComponents).toHaveLength(3);
    expect(serverProfile.infraComponents).toContain('gpu-server');
    expect(serverProfile.infraComponents).toContain('inference-engine');
  });
});

// ---------------------------------------------------------------------------
// IntegrationInfo
// ---------------------------------------------------------------------------

describe('IntegrationInfo', () => {
  it('should create a valid integration with protocol', () => {
    const integration: IntegrationInfo = {
      target: 'VS Code',
      method: 'plugin',
      infraComponents: ['edge-device'],
      protocol: 'LSP',
      description: 'VS Code extension for AI code assistance',
      descriptionKo: 'AI 코드 지원을 위한 VS Code 확장',
    };

    expect(integration.target).toBe('VS Code');
    expect(integration.method).toBe('plugin');
    expect(integration.infraComponents).toContain('edge-device');
    expect(integration.protocol).toBe('LSP');
    expect(integration.description).toContain('VS Code');
    expect(integration.descriptionKo).toContain('VS Code');
  });

  it('should allow optional protocol to be omitted', () => {
    const noProtocol: IntegrationInfo = {
      target: 'Slack',
      method: 'webhook',
      infraComponents: ['api-gateway', 'app-server'],
      description: 'Slack bot integration via incoming webhooks',
      descriptionKo: 'Incoming Webhook을 통한 Slack 봇 연동',
    };

    expect(noProtocol.protocol).toBeUndefined();
    expect(noProtocol.method).toBe('webhook');
    expect(noProtocol.infraComponents).toHaveLength(2);
  });

  it('should support MCP integration method', () => {
    const mcpIntegration: IntegrationInfo = {
      target: 'Claude Desktop',
      method: 'mcp',
      infraComponents: ['edge-device', 'ai-gateway'],
      protocol: 'MCP over stdio',
      description: 'Model Context Protocol integration for tool use',
      descriptionKo: '도구 사용을 위한 Model Context Protocol 연동',
    };

    expect(mcpIntegration.method).toBe('mcp');
    expect(mcpIntegration.protocol).toBe('MCP over stdio');
  });
});

// ---------------------------------------------------------------------------
// ScaleUpPath
// ---------------------------------------------------------------------------

describe('ScaleUpPath', () => {
  it('should create a valid scale-up path', () => {
    const scaleUp: ScaleUpPath = {
      trigger: 'Concurrent users exceed 50',
      triggerKo: '동시 사용자 50명 초과',
      from: ['edge-device'],
      to: ['gpu-server', 'container', 'load-balancer'],
      cloudServices: ['AWS SageMaker', 'AWS ECS'],
      reason: 'Local GPU cannot handle concurrent inference requests',
      reasonKo: '로컬 GPU로 동시 추론 요청을 처리할 수 없음',
    };

    expect(scaleUp.trigger).toContain('50');
    expect(scaleUp.triggerKo).toContain('50');
    expect(scaleUp.from).toContain('edge-device');
    expect(scaleUp.to).toHaveLength(3);
    expect(scaleUp.to).toContain('gpu-server');
    expect(scaleUp.to).toContain('load-balancer');
    expect(scaleUp.cloudServices).toHaveLength(2);
    expect(scaleUp.reason).toContain('GPU');
    expect(scaleUp.reasonKo).toContain('GPU');
  });

  it('should support empty cloudServices array', () => {
    const onPremScale: ScaleUpPath = {
      trigger: 'Data volume exceeds 1 TB',
      triggerKo: '데이터 볼륨 1TB 초과',
      from: ['db-server'],
      to: ['db-server', 'san-nas', 'backup'],
      cloudServices: [],
      reason: 'On-premise scale-up with dedicated storage',
      reasonKo: '전용 스토리지를 통한 온프레미스 확장',
    };

    expect(onPremScale.cloudServices).toHaveLength(0);
    expect(onPremScale.to).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// ProductIntelligence — complete object
// ---------------------------------------------------------------------------

describe('ProductIntelligence', () => {
  it('should create a complete ProductIntelligence object', () => {
    const pi: ProductIntelligence = {
      id: 'PI-CLAUDE-001',
      productId: 'anthropic-claude',
      name: 'Claude',
      nameKo: 'Claude (클로드)',
      category: 'ai-assistant',
      sourceUrl: 'https://www.anthropic.com/claude',
      deploymentProfiles: [
        {
          platform: 'cloud',
          os: ['Any (API-based)'],
          installMethod: 'API key provisioning',
          installMethodKo: 'API 키 발급',
          minRequirements: {
            network: '10 Mbps',
          },
          infraComponents: ['api-gateway', 'app-server'],
          notes: 'Cloud-hosted API, no local compute required',
          notesKo: '클라우드 호스팅 API, 로컬 컴퓨팅 불필요',
        },
        {
          platform: 'desktop',
          os: ['macOS', 'Windows'],
          installMethod: 'Native desktop app',
          installMethodKo: '네이티브 데스크톱 앱',
          minRequirements: {
            ram: '4 GB',
            storage: '500 MB',
          },
          infraComponents: ['edge-device'],
          notes: 'Desktop client connects to cloud API',
          notesKo: '데스크톱 클라이언트가 클라우드 API에 연결',
        },
      ],
      integrations: [
        {
          target: 'VS Code',
          method: 'plugin',
          infraComponents: ['edge-device'],
          protocol: 'LSP',
          description: 'Claude extension for AI code assistance',
          descriptionKo: 'AI 코드 지원을 위한 Claude 확장',
        },
        {
          target: 'Slack',
          method: 'api',
          infraComponents: ['api-gateway', 'app-server'],
          description: 'Claude integration for Slack workspace',
          descriptionKo: 'Slack 워크스페이스용 Claude 연동',
        },
      ],
      scaleUpPaths: [
        {
          trigger: 'Team exceeds 50 members or needs custom fine-tuning',
          triggerKo: '팀 50명 초과 또는 커스텀 미세 조정 필요',
          from: ['api-gateway'],
          to: ['api-gateway', 'load-balancer', 'app-server', 'cache'],
          cloudServices: ['AWS API Gateway', 'AWS ElastiCache'],
          reason: 'High concurrency requires caching layer and load distribution',
          reasonKo: '높은 동시성을 위해 캐싱 레이어와 부하 분산 필요',
        },
      ],
      embeddingText:
        'Claude AI assistant chatbot enterprise API cloud deployment MCP integration',
      embeddingTextKo:
        'Claude AI 어시스턴트 챗봇 엔터프라이즈 API 클라우드 배포 MCP 연동',
    };

    // Top-level fields
    expect(pi.id).toBe('PI-CLAUDE-001');
    expect(pi.productId).toBe('anthropic-claude');
    expect(pi.name).toBe('Claude');
    expect(pi.nameKo).toContain('클로드');
    expect(pi.category).toBe('ai-assistant');
    expect(pi.sourceUrl).toContain('anthropic.com');

    // Deployment profiles
    expect(pi.deploymentProfiles).toHaveLength(2);
    expect(pi.deploymentProfiles[0].platform).toBe('cloud');
    expect(pi.deploymentProfiles[1].platform).toBe('desktop');
    expect(pi.deploymentProfiles[0].infraComponents).toContain('api-gateway');

    // Integrations
    expect(pi.integrations).toHaveLength(2);
    expect(pi.integrations[0].method).toBe('plugin');
    expect(pi.integrations[0].protocol).toBe('LSP');
    expect(pi.integrations[1].protocol).toBeUndefined();

    // Scale-up paths
    expect(pi.scaleUpPaths).toHaveLength(1);
    expect(pi.scaleUpPaths[0].from).toContain('api-gateway');
    expect(pi.scaleUpPaths[0].to).toHaveLength(4);
    expect(pi.scaleUpPaths[0].cloudServices).toHaveLength(2);

    // Embedding text
    expect(pi.embeddingText).toContain('Claude');
    expect(pi.embeddingText).toContain('MCP');
    expect(pi.embeddingTextKo).toContain('Claude');
    expect(pi.embeddingTextKo).toContain('MCP');
  });

  it('should support empty arrays for deployment, integration, and scale-up', () => {
    const minimal: ProductIntelligence = {
      id: 'PI-TEST-001',
      productId: 'test-product',
      name: 'Test Product',
      nameKo: '테스트 제품',
      category: 'devops',
      sourceUrl: 'https://example.com',
      deploymentProfiles: [],
      integrations: [],
      scaleUpPaths: [],
      embeddingText: 'test product devops',
      embeddingTextKo: '테스트 제품 데브옵스',
    };

    expect(minimal.deploymentProfiles).toHaveLength(0);
    expect(minimal.integrations).toHaveLength(0);
    expect(minimal.scaleUpPaths).toHaveLength(0);
  });

  it('should accept all 12 PICategory values as category', () => {
    const allCategories: PICategory[] = [
      'ai-inference',
      'ai-assistant',
      'ai-framework',
      'vector-db',
      'ai-gateway',
      'ai-orchestrator',
      'ai-monitor',
      'cloud-compute',
      'cloud-gpu',
      'cloud-container',
      'communication',
      'devops',
    ];

    for (const category of allCategories) {
      const pi: ProductIntelligence = {
        id: `PI-TEST-${category}`,
        productId: `test-${category}`,
        name: `Test ${category}`,
        nameKo: `테스트 ${category}`,
        category,
        sourceUrl: 'https://example.com',
        deploymentProfiles: [],
        integrations: [],
        scaleUpPaths: [],
        embeddingText: `test ${category}`,
        embeddingTextKo: `테스트 ${category}`,
      };
      expect(pi.category).toBe(category);
    }
  });
});
