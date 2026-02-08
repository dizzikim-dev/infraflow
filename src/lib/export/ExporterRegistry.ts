/**
 * Exporter Registry
 *
 * 익스포터 플러그인 관리 및 내보내기 실행을 담당
 * 플러그인 시스템과 기존 익스포터를 통합
 */

import type {
  ExporterExtension,
  ExporterOptionSchema,
  ResourceMapper,
} from '@/types/plugin';
import type { InfraSpec, InfraNodeType } from '@/types/infra';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('ExporterRegistry');

// ============================================================
// Registry Class
// ============================================================

/**
 * 익스포터 레지스트리 클래스
 */
export class ExporterRegistry {
  private static instance: ExporterRegistry | null = null;
  private exporters: Map<string, ExporterExtension> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): ExporterRegistry {
    if (!ExporterRegistry.instance) {
      ExporterRegistry.instance = new ExporterRegistry();
    }
    return ExporterRegistry.instance;
  }

  /**
   * 테스트용: 인스턴스 초기화
   */
  static resetInstance(): void {
    ExporterRegistry.instance = null;
  }

  // ============================================================
  // Registration
  // ============================================================

  /**
   * 익스포터 등록
   */
  register(exporter: ExporterExtension): void {
    if (this.exporters.has(exporter.format)) {
      console.warn(
        `[ExporterRegistry] Overwriting existing exporter: ${exporter.format}`
      );
    }
    this.exporters.set(exporter.format, exporter);
  }

  /**
   * 익스포터 해제
   */
  unregister(format: string): void {
    this.exporters.delete(format);
  }

  /**
   * 여러 익스포터 등록
   */
  registerAll(exporters: ExporterExtension[]): void {
    for (const exporter of exporters) {
      this.register(exporter);
    }
  }

  // ============================================================
  // Query
  // ============================================================

  /**
   * 익스포터 조회
   */
  get(format: string): ExporterExtension | undefined {
    return this.exporters.get(format);
  }

  /**
   * 모든 익스포터 조회
   */
  getAll(): ExporterExtension[] {
    return Array.from(this.exporters.values());
  }

  /**
   * 지원 형식 목록
   */
  getSupportedFormats(): string[] {
    return Array.from(this.exporters.keys());
  }

  /**
   * 익스포터 존재 여부
   */
  has(format: string): boolean {
    return this.exporters.has(format);
  }

  /**
   * 익스포터 개수
   */
  get size(): number {
    return this.exporters.size;
  }

  // ============================================================
  // Export Execution
  // ============================================================

  /**
   * 내보내기 실행
   */
  export(
    format: string,
    spec: InfraSpec,
    options?: Record<string, unknown>
  ): string | Blob {
    const exporter = this.exporters.get(format);
    if (!exporter) {
      throw new Error(`Exporter not found for format: ${format}`);
    }

    try {
      return exporter.export(spec, options);
    } catch (error) {
      console.error(`[ExporterRegistry] Export failed for format: ${format}`, error);
      throw error;
    }
  }

  /**
   * 안전한 내보내기 (에러 시 null 반환)
   */
  exportSafe(
    format: string,
    spec: InfraSpec,
    options?: Record<string, unknown>
  ): string | Blob | null {
    try {
      return this.export(format, spec, options);
    } catch (error) {
      logger.warn('Safe export failed, returning null', {
        format,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * 여러 형식으로 내보내기
   */
  exportMultiple(
    formats: string[],
    spec: InfraSpec,
    options?: Record<string, unknown>
  ): Record<string, string | Blob | null> {
    const results: Record<string, string | Blob | null> = {};

    for (const format of formats) {
      results[format] = this.exportSafe(format, spec, options);
    }

    return results;
  }

  // ============================================================
  // Option Schema
  // ============================================================

  /**
   * 익스포터 옵션 스키마 조회
   */
  getOptionsSchema(format: string): ExporterOptionSchema[] | undefined {
    return this.exporters.get(format)?.optionsSchema;
  }

  /**
   * 기본 옵션 값 생성
   */
  getDefaultOptions(format: string): Record<string, unknown> {
    const schema = this.getOptionsSchema(format);
    if (!schema) return {};

    return Object.fromEntries(
      schema
        .filter((opt) => opt.defaultValue !== undefined)
        .map((opt) => [opt.name, opt.defaultValue])
    );
  }

  // ============================================================
  // Resource Mapping
  // ============================================================

  /**
   * 노드 타입별 리소스 매퍼 조회
   */
  getResourceMapper(
    format: string,
    nodeType: InfraNodeType | string
  ): ResourceMapper | undefined {
    const exporter = this.exporters.get(format);
    return exporter?.resourceMap?.[nodeType];
  }

  /**
   * 모든 지원 노드 타입 조회
   */
  getSupportedNodeTypes(format: string): string[] {
    const exporter = this.exporters.get(format);
    if (!exporter?.resourceMap) return [];
    return Object.keys(exporter.resourceMap);
  }
}

// ============================================================
// Default Instance
// ============================================================

export const exporterRegistry = ExporterRegistry.getInstance();

// ============================================================
// Helper Functions
// ============================================================

/**
 * 익스포터 확장 생성 헬퍼
 */
export function createExporterExtension(
  config: Omit<ExporterExtension, 'export'> & {
    exportFn: ExporterExtension['export'];
  }
): ExporterExtension {
  const { exportFn, ...rest } = config;
  return {
    ...rest,
    export: exportFn,
  };
}

/**
 * 리소스 맵 생성 헬퍼
 */
export function createResourceMap<T = string>(
  mappings: Array<{
    types: (InfraNodeType | string)[];
    mapper: ResourceMapper<T>;
  }>
): Record<string, ResourceMapper<T>> {
  const result: Record<string, ResourceMapper<T>> = {};

  for (const { types, mapper } of mappings) {
    for (const type of types) {
      result[type] = mapper;
    }
  }

  return result;
}

// ============================================================
// Type Guards
// ============================================================

/**
 * ExporterExtension 타입 가드
 */
export function isExporterExtension(obj: unknown): obj is ExporterExtension {
  if (typeof obj !== 'object' || obj === null) return false;

  const ext = obj as Partial<ExporterExtension>;
  return (
    typeof ext.name === 'string' &&
    typeof ext.format === 'string' &&
    typeof ext.fileExtension === 'string' &&
    typeof ext.export === 'function'
  );
}
