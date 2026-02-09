import { describe, it, expect } from 'vitest';
import { AVAILABLE_COMPONENTS, SYSTEM_PROMPT } from '@/lib/parser/prompts';
import { buildContext, containsTelecomKeywords, TELECOM_KEYWORDS } from '@/lib/parser/contextBuilder';
import type { Node, Edge } from '@xyflow/react';
import type { InfraNodeData } from '@/types/infra';

describe('telecom prompts and parser extension', () => {
  describe('AVAILABLE_COMPONENTS', () => {
    it('should contain telecom category', () => {
      expect(AVAILABLE_COMPONENTS).toHaveProperty('telecom');
    });

    it('should contain wan category', () => {
      expect(AVAILABLE_COMPONENTS).toHaveProperty('wan');
    });

    it('should include all telecom component types', () => {
      const telecom = AVAILABLE_COMPONENTS.telecom;
      expect(telecom).toContain('central-office');
      expect(telecom).toContain('base-station');
      expect(telecom).toContain('olt');
      expect(telecom).toContain('customer-premise');
      expect(telecom).toContain('idc');
    });

    it('should include all wan component types', () => {
      const wan = AVAILABLE_COMPONENTS.wan;
      expect(wan).toContain('pe-router');
      expect(wan).toContain('p-router');
      expect(wan).toContain('mpls-network');
      expect(wan).toContain('dedicated-line');
      expect(wan).toContain('metro-ethernet');
      expect(wan).toContain('corporate-internet');
      expect(wan).toContain('vpn-service');
      expect(wan).toContain('sd-wan-service');
      expect(wan).toContain('private-5g');
      expect(wan).toContain('core-network');
      expect(wan).toContain('upf');
      expect(wan).toContain('ring-network');
    });

    it('should have 5 telecom components', () => {
      expect(AVAILABLE_COMPONENTS.telecom).toHaveLength(5);
    });

    it('should have 12 wan components', () => {
      expect(AVAILABLE_COMPONENTS.wan).toHaveLength(12);
    });

    it('should still contain all original categories', () => {
      expect(AVAILABLE_COMPONENTS).toHaveProperty('security');
      expect(AVAILABLE_COMPONENTS).toHaveProperty('network');
      expect(AVAILABLE_COMPONENTS).toHaveProperty('compute');
      expect(AVAILABLE_COMPONENTS).toHaveProperty('cloud');
      expect(AVAILABLE_COMPONENTS).toHaveProperty('storage');
      expect(AVAILABLE_COMPONENTS).toHaveProperty('auth');
      expect(AVAILABLE_COMPONENTS).toHaveProperty('external');
    });
  });

  describe('SYSTEM_PROMPT telecom mode guide', () => {
    it('should contain telecom mode section header', () => {
      expect(SYSTEM_PROMPT).toContain('통신망/네트워크 토폴로지 모드');
    });

    it('should list telecom trigger keywords', () => {
      expect(SYSTEM_PROMPT).toContain('전용회선');
      expect(SYSTEM_PROMPT).toContain('국사');
      expect(SYSTEM_PROMPT).toContain('기지국');
      expect(SYSTEM_PROMPT).toContain('MPLS');
      expect(SYSTEM_PROMPT).toContain('IDC');
      expect(SYSTEM_PROMPT).toContain('메트로이더넷');
      expect(SYSTEM_PROMPT).toContain('5G 특화망');
      expect(SYSTEM_PROMPT).toContain('KORNET');
    });

    it('should describe telecom network construction principles', () => {
      expect(SYSTEM_PROMPT).toContain('통신망 구성 원칙');
      expect(SYSTEM_PROMPT).toContain('고객 구내(CPE)');
      expect(SYSTEM_PROMPT).toContain('이중화 요청 시');
    });

    it('should specify wan-link flowType for WAN segments', () => {
      expect(SYSTEM_PROMPT).toContain("wan-link");
    });

    it('should specify wireless flowType for wireless segments', () => {
      expect(SYSTEM_PROMPT).toContain("wireless");
    });

    it('should specify tunnel flowType for VPN/MPLS', () => {
      expect(SYSTEM_PROMPT).toContain("tunnel");
    });

    it('should mention firewall at security boundary', () => {
      expect(SYSTEM_PROMPT).toContain('보안 경계');
      expect(SYSTEM_PROMPT).toContain('firewall 배치');
    });

    it('should clarify when NOT to use telecom components', () => {
      expect(SYSTEM_PROMPT).toContain('통신망을 사용하지 않을 때');
      expect(SYSTEM_PROMPT).toContain('telecom/wan 컴포넌트 미사용');
    });
  });

  describe('SYSTEM_PROMPT flowType documentation', () => {
    it('should document all flowType options', () => {
      expect(SYSTEM_PROMPT).toContain('flowType 옵션');
    });

    it('should document wan-link flowType', () => {
      expect(SYSTEM_PROMPT).toContain('wan-link: WAN 전용회선 연결');
    });

    it('should document wireless flowType', () => {
      expect(SYSTEM_PROMPT).toContain('wireless: 무선 구간');
    });

    it('should document tunnel flowType', () => {
      expect(SYSTEM_PROMPT).toContain('tunnel: VPN/MPLS 터널');
    });

    it('should document existing flowTypes alongside new ones', () => {
      expect(SYSTEM_PROMPT).toContain('request: 요청 흐름');
      expect(SYSTEM_PROMPT).toContain('response: 응답 흐름');
      expect(SYSTEM_PROMPT).toContain('blocked: 차단');
      expect(SYSTEM_PROMPT).toContain('encrypted: 암호화 연결');
    });
  });

  describe('containsTelecomKeywords', () => {
    it('should detect Korean telecom keywords', () => {
      expect(containsTelecomKeywords('전용회선으로 연결해줘')).toBe(true);
      expect(containsTelecomKeywords('국사를 추가해줘')).toBe(true);
      expect(containsTelecomKeywords('기지국 연결 구성')).toBe(true);
    });

    it('should detect English telecom keywords', () => {
      expect(containsTelecomKeywords('add MPLS network')).toBe(true);
      expect(containsTelecomKeywords('configure VPN service')).toBe(true);
      expect(containsTelecomKeywords('setup telecom infrastructure')).toBe(true);
    });

    it('should detect case-insensitive keywords', () => {
      expect(containsTelecomKeywords('mpls 네트워크')).toBe(true);
      expect(containsTelecomKeywords('kornet 인터넷')).toBe(true);
      expect(containsTelecomKeywords('idc 연결')).toBe(true);
    });

    it('should return false for non-telecom prompts', () => {
      expect(containsTelecomKeywords('3티어 웹 아키텍처')).toBe(false);
      expect(containsTelecomKeywords('WAF 추가해줘')).toBe(false);
      expect(containsTelecomKeywords('로드밸런서 설정')).toBe(false);
    });

    it('should detect SD-WAN keyword', () => {
      expect(containsTelecomKeywords('SD-WAN 서비스 구성')).toBe(true);
      expect(containsTelecomKeywords('sd-wan 연결')).toBe(true);
    });

    it('should detect 5G related keywords', () => {
      expect(containsTelecomKeywords('5G 특화망 구성')).toBe(true);
      expect(containsTelecomKeywords('UPF 배포')).toBe(true);
      expect(containsTelecomKeywords('코어망 설정')).toBe(true);
    });

    it('should detect backbone keyword', () => {
      expect(containsTelecomKeywords('backbone 네트워크')).toBe(true);
      expect(containsTelecomKeywords('백본 연결')).toBe(true);
    });
  });

  describe('TELECOM_KEYWORDS', () => {
    it('should be a non-empty array', () => {
      expect(TELECOM_KEYWORDS).toBeInstanceOf(Array);
      expect(TELECOM_KEYWORDS.length).toBeGreaterThan(0);
    });

    it('should include both Korean and English keywords', () => {
      const hasKorean = TELECOM_KEYWORDS.some((kw) => /[가-힣]/.test(kw));
      const hasEnglish = TELECOM_KEYWORDS.some((kw) => /[a-zA-Z]/.test(kw));
      expect(hasKorean).toBe(true);
      expect(hasEnglish).toBe(true);
    });
  });

  describe('buildContext telecom detection', () => {
    function makeNode(
      id: string,
      nodeType: string,
      category: string,
      label?: string,
      tier?: string
    ): Node<InfraNodeData> {
      return {
        id,
        position: { x: 0, y: 0 },
        data: {
          label: label || id,
          category: category as InfraNodeData['category'],
          nodeType: nodeType as InfraNodeData['nodeType'],
          tier: tier as InfraNodeData['tier'],
        },
        type: nodeType,
      };
    }

    it('should add telecom context to summary when telecom nodes exist', () => {
      const nodes = [
        makeNode('co-1', 'central-office', 'telecom', '국사', 'dmz'),
        makeNode('pe-1', 'pe-router', 'wan', 'PE Router', 'dmz'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('통신망 구성이 포함되어 있습니다');
    });

    it('should add telecom context when only wan nodes exist', () => {
      const nodes = [
        makeNode('mpls-1', 'mpls-network', 'wan', 'MPLS', 'internal'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('통신망 구성이 포함되어 있습니다');
    });

    it('should not add telecom context for standard infrastructure', () => {
      const nodes = [
        makeNode('fw-1', 'firewall', 'security', 'Firewall', 'dmz'),
        makeNode('web-1', 'web-server', 'compute', 'Web', 'internal'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).not.toContain('통신망 구성이 포함되어 있습니다');
    });

    it('should detect telecom architecture type when telecom and wan nodes coexist', () => {
      const nodes = [
        makeNode('co-1', 'central-office', 'telecom', '국사', 'dmz'),
        makeNode('dl-1', 'dedicated-line', 'wan', '전용회선', 'dmz'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('통신망 토폴로지');
    });

    it('should detect WAN architecture when only wan nodes exist', () => {
      const nodes = [
        makeNode('pe-1', 'pe-router', 'wan', 'PE Router', 'dmz'),
        makeNode('mpls-1', 'mpls-network', 'wan', 'MPLS', 'internal'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('WAN 네트워크 아키텍처');
    });

    it('should detect telecom infrastructure when only telecom nodes exist', () => {
      const nodes = [
        makeNode('co-1', 'central-office', 'telecom', '국사', 'dmz'),
        makeNode('bs-1', 'base-station', 'telecom', '기지국', 'external'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('통신 인프라 아키텍처');
    });
  });
});
