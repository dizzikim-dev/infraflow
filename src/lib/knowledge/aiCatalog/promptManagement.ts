/**
 * AI Software Catalog — Prompt Management
 *
 * Platforms for managing, versioning, and optimizing AI prompts.
 */

import type { AISoftware } from './types';

export const promptManagers: AISoftware[] = [
  {
    id: 'AI-PMT-001',
    name: 'PromptLayer',
    nameKo: 'PromptLayer',
    category: 'prompt-mgmt',
    license: 'freemium',
    infraNodeTypes: ['prompt-manager'],
    architectureRole: 'Prompt versioning and management platform',
    architectureRoleKo: '프롬프트 버전 관리 플랫폼',
    recommendedFor: [
      'Prompt version control and history',
      'Prompt performance analytics',
      'Team prompt collaboration',
      'LLM request logging and debugging',
    ],
    recommendedForKo: [
      '프롬프트 버전 관리 및 이력',
      '프롬프트 성능 분석',
      '팀 프롬프트 협업',
      'LLM 요청 로깅 및 디버깅',
    ],
    deploymentModel: ['cloud'],
    operationalComplexity: 'low',
    communitySize: 'small',
    maturity: 'growing',
    documentationUrl: 'https://docs.promptlayer.com/',
    description: 'Platform for managing, versioning, and evaluating prompts with request logging and team collaboration features.',
    descriptionKo: '요청 로깅과 팀 협업 기능을 갖춘 프롬프트 관리, 버전 관리, 평가 플랫폼입니다.',
  },
  {
    id: 'AI-PMT-002',
    name: 'Humanloop',
    nameKo: 'Humanloop',
    category: 'prompt-mgmt',
    license: 'commercial',
    infraNodeTypes: ['prompt-manager'],
    architectureRole: 'Enterprise prompt engineering and evaluation platform',
    architectureRoleKo: '엔터프라이즈 프롬프트 엔지니어링 및 평가 플랫폼',
    recommendedFor: [
      'Enterprise prompt optimization',
      'LLM evaluation and benchmarking',
      'Prompt CI/CD pipelines',
      'Human feedback collection for LLMs',
    ],
    recommendedForKo: [
      '엔터프라이즈 프롬프트 최적화',
      'LLM 평가 및 벤치마킹',
      '프롬프트 CI/CD 파이프라인',
      'LLM 인간 피드백 수집',
    ],
    deploymentModel: ['cloud'],
    operationalComplexity: 'medium',
    communitySize: 'small',
    maturity: 'growing',
    documentationUrl: 'https://humanloop.com/docs',
    description: 'Enterprise platform for prompt engineering, evaluation, and monitoring with integrated human feedback workflows.',
    descriptionKo: '통합 인간 피드백 워크플로우를 갖춘 프롬프트 엔지니어링, 평가, 모니터링 엔터프라이즈 플랫폼입니다.',
  },
];
