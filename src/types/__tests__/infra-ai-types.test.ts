import { describe, it, expect } from 'vitest';
import type {
  AIComputeNodeType,
  AIServiceNodeType,
  NodeCategory,
  InfraNodeType,
  EdgeFlowType,
} from '../infra';

describe('AI Infrastructure Types', () => {
  it('should accept ai-compute node types as InfraNodeType', () => {
    const types: InfraNodeType[] = [
      'gpu-server', 'ai-accelerator', 'edge-device',
      'mobile-device', 'ai-cluster', 'model-registry',
    ];
    expect(types).toHaveLength(6);
  });

  it('should accept ai-service node types as InfraNodeType', () => {
    const types: InfraNodeType[] = [
      'inference-engine', 'vector-db', 'ai-gateway',
      'ai-orchestrator', 'embedding-service', 'training-platform',
      'prompt-manager', 'ai-monitor',
    ];
    expect(types).toHaveLength(8);
  });

  it('should include ai-compute and ai-service in NodeCategory', () => {
    const categories: NodeCategory[] = ['ai-compute', 'ai-service'];
    expect(categories).toHaveLength(2);
  });

  it('should include new edge flow types', () => {
    const flows: EdgeFlowType[] = ['inference', 'model-sync', 'embedding'];
    expect(flows).toHaveLength(3);
  });
});
