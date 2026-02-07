/**
 * InfraFlow Plugin System Types
 *
 * 플러그인 시스템을 위한 타입 정의
 * - 플러그인 메타데이터
 * - 노드, 파서, 익스포터, 패널 확장
 * - 라이프사이클 훅
 */

import type { ComponentType, ReactNode } from 'react';
import type {
  NodeCategory,
  InfraNodeType,
  InfraSpec,
  InfraNodeSpec,
  PolicyRule,
} from './infra';
import type { NodeConfig } from '@/components/nodes/nodeConfig';

// ============================================================
// Plugin Metadata
// ============================================================

/**
 * 플러그인 메타데이터
 */
export interface PluginMetadata {
  /** 고유 플러그인 ID (예: 'my-plugin', 'aws-extensions') */
  id: string;
  /** 표시 이름 */
  name: string;
  /** 시맨틱 버전 (예: '1.0.0') */
  version: string;
  /** 작성자 */
  author?: string;
  /** 설명 */
  description?: string;
  /** 라이선스 */
  license?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 의존하는 플러그인 ID 목록 */
  dependencies?: string[];
}

// ============================================================
// Category Style
// ============================================================

/**
 * 카테고리별 스타일 정의
 */
export interface CategoryStyle {
  /** Tailwind 그래디언트 클래스 */
  gradient: string;
  /** 아이콘 배경 그래디언트 */
  iconBg: string;
  /** 테두리 색상 클래스 */
  border: string;
  /** 그림자 색상 클래스 */
  shadow: string;
  /** 글로우 색상 (hex) */
  glowColor?: string;
}

// ============================================================
// Node Extension
// ============================================================

/**
 * BaseNode 컴포넌트 Props 타입
 */
export interface BaseNodeProps {
  data: {
    label: string;
    category: NodeCategory | 'external' | 'zone';
    nodeType: InfraNodeType | string;
    description?: string;
    policies?: PolicyRule[];
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
  };
  selected?: boolean;
  isEditingLabel?: boolean;
  isEditingDescription?: boolean;
  onStartEditLabel?: () => void;
  onStartEditDescription?: () => void;
  onCommitEdit?: (field: 'label' | 'description', value: string) => void;
  onCancelEdit?: () => void;
}

/**
 * 노드 확장 정의
 */
export interface NodeExtension {
  /** 노드 설정 */
  config: NodeConfig;
  /** 카테고리 스타일 (새 카테고리인 경우) */
  categoryStyle?: CategoryStyle;
  /** 커스텀 렌더러 (기본 BaseNode 대신 사용) */
  customRenderer?: ComponentType<BaseNodeProps>;
  /** 노드 유효성 검사기 */
  validator?: (data: BaseNodeProps['data']) => boolean;
}

// ============================================================
// Parser Extension
// ============================================================

/**
 * 노드 타입 패턴 (프롬프트 파싱용)
 */
export interface NodeTypePattern {
  /** 매칭 정규식 */
  pattern: RegExp;
  /** 매칭 시 반환할 노드 타입 */
  type: InfraNodeType | string;
  /** 영문 라벨 */
  label: string;
  /** 한글 라벨 */
  labelKo?: string;
}

/**
 * 파싱 결과 타입
 */
export interface ParseResult {
  success: boolean;
  spec?: InfraSpec;
  templateUsed?: string;
  error?: string;
  confidence: number;
}

/**
 * 스마트 파싱 결과 (수정 명령 포함)
 */
export interface SmartParseResult extends ParseResult {
  commandType: CommandType;
  modifications?: SpecModification[];
  query?: string;
}

/**
 * 명령 타입
 */
export type CommandType =
  | 'create'
  | 'add'
  | 'remove'
  | 'modify'
  | 'connect'
  | 'disconnect'
  | 'query'
  | 'custom';

/**
 * 스펙 수정 정의
 */
export interface SpecModification {
  type:
    | 'add-node'
    | 'remove-node'
    | 'add-connection'
    | 'remove-connection'
    | 'modify-node';
  target?: string;
  data?: Partial<InfraNodeSpec>;
}

/**
 * 대화 컨텍스트
 */
export interface ConversationContext {
  history: PromptHistoryItem[];
  currentSpec: InfraSpec | null;
}

/**
 * 프롬프트 히스토리 항목
 */
export interface PromptHistoryItem {
  prompt: string;
  result: ParseResult;
  timestamp: number;
}

/**
 * 파서 확장 정의
 */
export interface ParserExtension {
  /** 추가 노드 타입 패턴 */
  patterns: NodeTypePattern[];
  /** 추가 템플릿 */
  templates?: Record<string, InfraSpec>;
  /** 커스텀 명령 핸들러 */
  commandHandler?: (
    prompt: string,
    context: ConversationContext
  ) => SmartParseResult | null;
  /** 우선순위 (높을수록 먼저 처리, 기본 0) */
  priority?: number;
}

// ============================================================
// Exporter Extension
// ============================================================

/**
 * 리소스 매퍼 함수 타입
 */
export type ResourceMapper<T = string> = (
  node: InfraNodeSpec,
  options?: Record<string, unknown>
) => T;

/**
 * 익스포터 확장 정의
 */
export interface ExporterExtension {
  /** 익스포터 이름 */
  name: string;
  /** 출력 형식 (예: 'terraform', 'kubernetes', 'docker-compose') */
  format: string;
  /** 파일 확장자 (예: '.tf', '.yaml') */
  fileExtension: string;
  /** 설명 */
  description?: string;
  /** 아이콘 */
  icon?: ReactNode;
  /** 내보내기 함수 */
  export: (spec: InfraSpec, options?: Record<string, unknown>) => string | Blob;
  /** 노드 타입별 리소스 매퍼 */
  resourceMap?: Record<string, ResourceMapper>;
  /** 지원하는 옵션 스키마 */
  optionsSchema?: ExporterOptionSchema[];
}

/**
 * 익스포터 옵션 스키마
 */
export interface ExporterOptionSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  description?: string;
  defaultValue?: unknown;
  options?: { label: string; value: string | number }[];
  required?: boolean;
}

// ============================================================
// Panel Extension
// ============================================================

/**
 * 패널 위치
 */
export type PanelPosition = 'left' | 'right' | 'bottom';

/**
 * 패널 Props 타입
 */
export interface PanelProps {
  /** 패널 ID */
  panelId: string;
  /** 열림 상태 (옵션) */
  isOpen?: boolean;
  /** 닫기 핸들러 (옵션) */
  onClose?: () => void;
  /** 토글 핸들러 (옵션) */
  onToggle?: () => void;
}

/**
 * 패널 확장 정의
 */
export interface PanelExtension {
  /** 패널 ID */
  id: string;
  /** 패널 제목 */
  title: string;
  /** 패널 아이콘 */
  icon: ReactNode;
  /** 패널 컴포넌트 */
  component: ComponentType<PanelProps>;
  /** 패널 위치 */
  position: PanelPosition;
  /** 기본 열림 상태 */
  defaultOpen?: boolean;
  /** 순서 (낮을수록 먼저, 기본 100) */
  order?: number;
}

// ============================================================
// Theme Extension
// ============================================================

/**
 * 테마 색상 정의
 */
export interface ThemeColors {
  /** 배경 색상 */
  background: string;
  /** 표면 색상 */
  surface: string;
  /** 주요 색상 */
  primary: string;
  /** 보조 색상 */
  secondary: string;
  /** 강조 색상 */
  accent: string;
  /** 텍스트 색상 */
  text: string;
  /** 보조 텍스트 색상 */
  textMuted: string;
  /** 테두리 색상 */
  border: string;
}

/**
 * 테마 확장 정의
 */
export interface ThemeExtension {
  /** 테마 ID */
  id: string;
  /** 테마 이름 */
  name: string;
  /** 테마 색상 */
  colors: ThemeColors;
  /** 카테고리별 스타일 */
  categoryStyles?: Partial<Record<NodeCategory | 'external' | 'zone', CategoryStyle>>;
  /** 다크 모드 여부 */
  isDark?: boolean;
}

// ============================================================
// Main Plugin Interface
// ============================================================

/**
 * InfraFlow 플러그인 인터페이스
 */
export interface InfraFlowPlugin {
  /** 플러그인 메타데이터 */
  metadata: PluginMetadata;

  /** 노드 확장 */
  nodes?: NodeExtension[];

  /** 파서 확장 */
  parsers?: ParserExtension;

  /** 익스포터 확장 */
  exporters?: ExporterExtension[];

  /** 패널 확장 */
  panels?: PanelExtension[];

  /** 테마 확장 */
  themes?: ThemeExtension[];

  // ============================================================
  // Lifecycle Hooks
  // ============================================================

  /** 플러그인 로드 시 호출 */
  onLoad?: () => Promise<void>;

  /** 플러그인 언로드 시 호출 */
  onUnload?: () => Promise<void>;

  /** 설정 변경 시 호출 */
  onConfigChange?: (config: Record<string, unknown>) => void;
}

// ============================================================
// Plugin State
// ============================================================

/**
 * 플러그인 상태
 */
export type PluginStatus = 'installed' | 'active' | 'inactive' | 'error';

/**
 * 플러그인 상태 정보
 */
export interface PluginState {
  plugin: InfraFlowPlugin;
  status: PluginStatus;
  error?: string;
  loadedAt?: number;
  config?: Record<string, unknown>;
}

// ============================================================
// Validation
// ============================================================

/**
 * 검증 결과
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * 검증 오류
 */
export interface ValidationError {
  code: string;
  message: string;
  path?: string;
}

/**
 * 검증 경고
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
}

// ============================================================
// Registry Events
// ============================================================

/**
 * 레지스트리 이벤트 타입
 */
export type RegistryEventType =
  | 'plugin:registered'
  | 'plugin:unregistered'
  | 'plugin:activated'
  | 'plugin:deactivated'
  | 'plugin:error';

/**
 * 레지스트리 이벤트
 */
export interface RegistryEvent {
  type: RegistryEventType;
  pluginId: string;
  timestamp: number;
  data?: unknown;
}

/**
 * 레지스트리 이벤트 리스너
 */
export type RegistryEventListener = (event: RegistryEvent) => void;
