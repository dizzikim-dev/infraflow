/**
 * 컴포넌트 서비스
 *
 * Prisma 모델 ↔ 기존 InfraComponent 인터페이스 변환
 * API 호출 유틸리티
 */

import { InfraComponent, PolicyRecommendation } from './infrastructureDB';

// API 응답 타입
interface ApiComponent {
  id: string;
  componentId: string;
  name: string;
  nameKo: string;
  category: string;
  tier: string;
  description: string;
  descriptionKo: string;
  functions: string[];
  functionsKo: string[];
  features: string[];
  featuresKo: string[];
  ports: string[];
  protocols: string[];
  vendors: string[];
  policies: ApiPolicy[];
  isActive: boolean;
}

interface ApiPolicy {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  priority: string;
  category: string;
}

interface ApiListResponse {
  data: ApiComponent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API 컴포넌트를 InfraComponent 인터페이스로 변환
 */
export function toInfraComponent(apiComponent: ApiComponent): InfraComponent {
  return {
    id: apiComponent.componentId,
    name: apiComponent.name,
    nameKo: apiComponent.nameKo,
    category: apiComponent.category as InfraComponent['category'],
    tier: apiComponent.tier as InfraComponent['tier'],
    description: apiComponent.description,
    descriptionKo: apiComponent.descriptionKo,
    functions: apiComponent.functions,
    functionsKo: apiComponent.functionsKo,
    features: apiComponent.features,
    featuresKo: apiComponent.featuresKo,
    ports: apiComponent.ports,
    protocols: apiComponent.protocols,
    vendors: apiComponent.vendors,
    recommendedPolicies: apiComponent.policies.map((policy) => ({
      name: policy.name,
      nameKo: policy.nameKo,
      description: policy.description,
      priority: policy.priority as PolicyRecommendation['priority'],
      category: policy.category as PolicyRecommendation['category'],
    })),
  };
}

/**
 * API에서 모든 활성 컴포넌트 가져오기
 */
export async function fetchComponents(): Promise<Record<string, InfraComponent>> {
  try {
    // 모든 활성 컴포넌트 가져오기 (페이지네이션 없이)
    const response = await fetch('/api/components?limit=100&isActive=true');

    if (!response.ok) {
      throw new Error('Failed to fetch components');
    }

    const data: ApiListResponse = await response.json();

    // componentId를 키로 하는 Record로 변환
    const components: Record<string, InfraComponent> = {};

    for (const apiComponent of data.data) {
      components[apiComponent.componentId] = toInfraComponent(apiComponent);
    }

    return components;
  } catch (error) {
    console.error('컴포넌트 로드 실패:', error);
    throw error;
  }
}

/**
 * 단일 컴포넌트 가져오기
 */
export async function fetchComponent(componentId: string): Promise<InfraComponent | null> {
  try {
    const response = await fetch(`/api/components/${componentId}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch component');
    }

    const apiComponent: ApiComponent = await response.json();
    return toInfraComponent(apiComponent);
  } catch (error) {
    console.error('컴포넌트 로드 실패:', error);
    throw error;
  }
}

/**
 * 컴포넌트 검색
 */
export async function searchComponents(query: string): Promise<InfraComponent[]> {
  try {
    const response = await fetch(`/api/components/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error('Failed to search components');
    }

    const data = await response.json();

    return data.results.map((result: ApiComponent) => toInfraComponent(result));
  } catch (error) {
    console.error('컴포넌트 검색 실패:', error);
    throw error;
  }
}
