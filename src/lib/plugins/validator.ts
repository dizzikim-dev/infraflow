/**
 * Plugin Validator
 *
 * 플러그인 유효성 검증
 * - 구조 검증
 * - 타입 검증
 * - 보안 검증
 */

import type {
  InfraFlowPlugin,
  PluginMetadata,
  NodeExtension,
  ExporterExtension,
  PanelExtension,
  ThemeExtension,
  ParserExtension,
} from '@/types/plugin';

// ============================================================
// Types
// ============================================================

/**
 * 검증 결과
 */
export interface ValidationResult {
  /** 검증 통과 여부 */
  valid: boolean;
  /** 오류 목록 (검증 실패 시) */
  errors: string[];
  /** 경고 목록 (검증 통과하지만 권장하지 않음) */
  warnings: string[];
}

/**
 * 검증 옵션
 */
export interface ValidationOptions {
  /** 엄격 모드 (경고도 오류로 처리) */
  strict?: boolean;
  /** 특정 검증 건너뛰기 */
  skip?: ('metadata' | 'nodes' | 'exporters' | 'panels' | 'themes' | 'parsers')[];
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * 플러그인 검증
 */
export function validatePlugin(
  plugin: unknown,
  options: ValidationOptions = {}
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { strict = false, skip = [] } = options;

  // 기본 타입 검증
  if (!plugin || typeof plugin !== 'object') {
    return {
      valid: false,
      errors: ['Plugin must be an object'],
      warnings: [],
    };
  }

  const p = plugin as Partial<InfraFlowPlugin>;

  // 메타데이터 검증
  if (!skip.includes('metadata')) {
    const metaResult = validateMetadata(p.metadata);
    errors.push(...metaResult.errors);
    warnings.push(...metaResult.warnings);
  }

  // 노드 확장 검증
  if (!skip.includes('nodes') && p.nodes) {
    const nodesResult = validateNodeExtensions(p.nodes);
    errors.push(...nodesResult.errors);
    warnings.push(...nodesResult.warnings);
  }

  // 익스포터 확장 검증
  if (!skip.includes('exporters') && p.exporters) {
    const exportersResult = validateExporterExtensions(p.exporters);
    errors.push(...exportersResult.errors);
    warnings.push(...exportersResult.warnings);
  }

  // 패널 확장 검증
  if (!skip.includes('panels') && p.panels) {
    const panelsResult = validatePanelExtensions(p.panels);
    errors.push(...panelsResult.errors);
    warnings.push(...panelsResult.warnings);
  }

  // 테마 확장 검증
  if (!skip.includes('themes') && p.themes) {
    const themesResult = validateThemeExtensions(p.themes);
    errors.push(...themesResult.errors);
    warnings.push(...themesResult.warnings);
  }

  // 파서 확장 검증
  if (!skip.includes('parsers') && p.parsers) {
    const parsersResult = validateParserExtension(p.parsers);
    errors.push(...parsersResult.errors);
    warnings.push(...parsersResult.warnings);
  }

  // 라이프사이클 훅 검증
  if (p.onLoad && typeof p.onLoad !== 'function') {
    errors.push('onLoad must be a function');
  }
  if (p.onUnload && typeof p.onUnload !== 'function') {
    errors.push('onUnload must be a function');
  }

  // 확장이 하나도 없으면 경고
  if (!p.nodes && !p.exporters && !p.panels && !p.themes && !p.parsers) {
    warnings.push('Plugin has no extensions');
  }

  return {
    valid: errors.length === 0 && (!strict || warnings.length === 0),
    errors,
    warnings,
  };
}

/**
 * 메타데이터 검증
 */
export function validateMetadata(
  metadata: unknown
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!metadata || typeof metadata !== 'object') {
    return {
      valid: false,
      errors: ['Metadata is required and must be an object'],
      warnings: [],
    };
  }

  const m = metadata as Partial<PluginMetadata>;

  // 필수 필드
  if (!m.id || typeof m.id !== 'string') {
    errors.push('metadata.id is required and must be a string');
  } else {
    // ID 형식 검증
    if (!/^[a-z0-9-]+$/.test(m.id)) {
      errors.push('metadata.id must contain only lowercase letters, numbers, and hyphens');
    }
    if (m.id.length < 2 || m.id.length > 50) {
      errors.push('metadata.id must be between 2 and 50 characters');
    }
  }

  if (!m.name || typeof m.name !== 'string') {
    errors.push('metadata.name is required and must be a string');
  }

  if (!m.version || typeof m.version !== 'string') {
    errors.push('metadata.version is required and must be a string');
  } else {
    // 시맨틱 버전 검증
    if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(m.version)) {
      warnings.push('metadata.version should follow semantic versioning (e.g., 1.0.0)');
    }
  }

  // 선택 필드
  if (m.author !== undefined && typeof m.author !== 'string') {
    errors.push('metadata.author must be a string');
  }

  if (m.description !== undefined && typeof m.description !== 'string') {
    errors.push('metadata.description must be a string');
  }

  if (m.license !== undefined && typeof m.license !== 'string') {
    errors.push('metadata.license must be a string');
  }

  if (m.homepage !== undefined) {
    if (typeof m.homepage !== 'string') {
      errors.push('metadata.homepage must be a string');
    } else if (!/^https?:\/\//.test(m.homepage)) {
      warnings.push('metadata.homepage should be a valid URL');
    }
  }

  if (m.dependencies !== undefined) {
    if (!Array.isArray(m.dependencies)) {
      errors.push('metadata.dependencies must be an array');
    } else {
      for (const dep of m.dependencies) {
        if (typeof dep !== 'string') {
          errors.push('metadata.dependencies must contain only strings');
          break;
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 노드 확장 검증
 */
export function validateNodeExtensions(
  nodes: unknown
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(nodes)) {
    return {
      valid: false,
      errors: ['nodes must be an array'],
      warnings: [],
    };
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i] as Partial<NodeExtension>;
    const prefix = `nodes[${i}]`;

    if (!node.config) {
      errors.push(`${prefix}.config is required`);
    } else {
      const config = node.config;

      if (!config.id || typeof config.id !== 'string') {
        errors.push(`${prefix}.config.id is required`);
      }

      if (!config.name || typeof config.name !== 'string') {
        errors.push(`${prefix}.config.name is required`);
      }

      if (!config.category) {
        errors.push(`${prefix}.config.category is required`);
      }

      if (!config.icon) {
        errors.push(`${prefix}.config.icon is required`);
      }

      if (!config.color || typeof config.color !== 'string') {
        errors.push(`${prefix}.config.color is required`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 익스포터 확장 검증
 */
export function validateExporterExtensions(
  exporters: unknown
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(exporters)) {
    return {
      valid: false,
      errors: ['exporters must be an array'],
      warnings: [],
    };
  }

  const formats = new Set<string>();

  for (let i = 0; i < exporters.length; i++) {
    const exporter = exporters[i] as Partial<ExporterExtension>;
    const prefix = `exporters[${i}]`;

    if (!exporter.name || typeof exporter.name !== 'string') {
      errors.push(`${prefix}.name is required`);
    }

    if (!exporter.format || typeof exporter.format !== 'string') {
      errors.push(`${prefix}.format is required`);
    } else {
      if (formats.has(exporter.format)) {
        errors.push(`${prefix}.format '${exporter.format}' is duplicated`);
      }
      formats.add(exporter.format);
    }

    if (!exporter.fileExtension || typeof exporter.fileExtension !== 'string') {
      errors.push(`${prefix}.fileExtension is required`);
    }

    if (!exporter.export || typeof exporter.export !== 'function') {
      errors.push(`${prefix}.export must be a function`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 패널 확장 검증
 */
export function validatePanelExtensions(
  panels: unknown
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(panels)) {
    return {
      valid: false,
      errors: ['panels must be an array'],
      warnings: [],
    };
  }

  const ids = new Set<string>();

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i] as Partial<PanelExtension>;
    const prefix = `panels[${i}]`;

    if (!panel.id || typeof panel.id !== 'string') {
      errors.push(`${prefix}.id is required`);
    } else {
      if (ids.has(panel.id)) {
        errors.push(`${prefix}.id '${panel.id}' is duplicated`);
      }
      ids.add(panel.id);
    }

    if (!panel.title || typeof panel.title !== 'string') {
      errors.push(`${prefix}.title is required`);
    }

    if (!panel.position || !['left', 'right', 'bottom'].includes(panel.position)) {
      errors.push(`${prefix}.position must be 'left', 'right', or 'bottom'`);
    }

    if (!panel.component) {
      errors.push(`${prefix}.component is required`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 테마 확장 검증
 */
export function validateThemeExtensions(
  themes: unknown
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(themes)) {
    return {
      valid: false,
      errors: ['themes must be an array'],
      warnings: [],
    };
  }

  const ids = new Set<string>();

  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i] as Partial<ThemeExtension>;
    const prefix = `themes[${i}]`;

    if (!theme.id || typeof theme.id !== 'string') {
      errors.push(`${prefix}.id is required`);
    } else {
      if (ids.has(theme.id)) {
        errors.push(`${prefix}.id '${theme.id}' is duplicated`);
      }
      ids.add(theme.id);
    }

    if (!theme.name || typeof theme.name !== 'string') {
      errors.push(`${prefix}.name is required`);
    }

    if (!theme.colors || typeof theme.colors !== 'object') {
      errors.push(`${prefix}.colors is required and must be an object`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 파서 확장 검증
 */
export function validateParserExtension(
  parser: unknown
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!parser || typeof parser !== 'object') {
    return {
      valid: false,
      errors: ['parsers must be an object'],
      warnings: [],
    };
  }

  const p = parser as Partial<ParserExtension>;

  // 패턴 검증
  if (p.patterns !== undefined) {
    if (!Array.isArray(p.patterns)) {
      errors.push('parsers.patterns must be an array');
    } else {
      for (let i = 0; i < p.patterns.length; i++) {
        const pattern = p.patterns[i];
        const prefix = `parsers.patterns[${i}]`;

        if (!pattern.pattern || !(pattern.pattern instanceof RegExp)) {
          errors.push(`${prefix}.pattern must be a RegExp`);
        }

        if (!pattern.type || typeof pattern.type !== 'string') {
          errors.push(`${prefix}.type is required`);
        }

        if (!pattern.label || typeof pattern.label !== 'string') {
          errors.push(`${prefix}.label is required`);
        }
      }
    }
  }

  // 템플릿 검증
  if (p.templates !== undefined) {
    if (typeof p.templates !== 'object') {
      errors.push('parsers.templates must be an object');
    }
  }

  // 커맨드 핸들러 검증
  if (p.commandHandler !== undefined) {
    if (typeof p.commandHandler !== 'function') {
      errors.push('parsers.commandHandler must be a function');
    }
  }

  // 최소한 하나는 있어야 함
  if (!p.patterns && !p.templates && !p.commandHandler) {
    warnings.push('parsers should have at least one of: patterns, templates, commandHandler');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================
// Type Guards
// ============================================================

/**
 * 유효한 플러그인인지 확인
 */
export function isValidPlugin(plugin: unknown): plugin is InfraFlowPlugin {
  return validatePlugin(plugin).valid;
}

/**
 * 유효한 메타데이터인지 확인
 */
export function isValidMetadata(metadata: unknown): metadata is PluginMetadata {
  return validateMetadata(metadata).valid;
}
