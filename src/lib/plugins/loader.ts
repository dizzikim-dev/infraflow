/**
 * Plugin Loader
 *
 * 플러그인 동적 로딩을 위한 유틸리티
 * - 매니페스트 기반 로딩
 * - URL/파일 시스템에서 로딩
 * - 의존성 해결
 */

import type { InfraFlowPlugin, PluginMetadata } from '@/types/plugin';
import { pluginRegistry } from './registry';
import { validatePlugin } from './validator';

// ============================================================
// Types
// ============================================================

/**
 * 플러그인 매니페스트
 */
export interface PluginManifest {
  /** 플러그인 ID */
  id: string;
  /** 플러그인 진입점 (상대 경로 또는 URL) */
  entry: string;
  /** 의존하는 플러그인 ID 목록 */
  dependencies?: string[];
  /** 로딩 우선순위 (높을수록 먼저 로드) */
  priority?: number;
  /** 자동 활성화 여부 */
  autoActivate?: boolean;
  /** 플러그인 설정 */
  config?: Record<string, unknown>;
}

/**
 * 플러그인 로드 결과
 */
export interface PluginLoadResult {
  success: boolean;
  pluginId: string;
  error?: string;
  plugin?: InfraFlowPlugin;
}

/**
 * 로더 옵션
 */
export interface LoaderOptions {
  /** 의존성 자동 해결 */
  resolveDependencies?: boolean;
  /** 검증 건너뛰기 */
  skipValidation?: boolean;
  /** 자동 활성화 */
  autoActivate?: boolean;
  /** 로드 실패 시 계속 진행 */
  continueOnError?: boolean;
}

// ============================================================
// Plugin Loader Class
// ============================================================

/**
 * 플러그인 로더
 */
export class PluginLoader {
  private loadedPlugins: Map<string, InfraFlowPlugin> = new Map();
  private loading: Set<string> = new Set();

  /**
   * 단일 플러그인 로드
   */
  async loadPlugin(
    manifest: PluginManifest,
    options: LoaderOptions = {}
  ): Promise<PluginLoadResult> {
    const {
      resolveDependencies = true,
      skipValidation = false,
      autoActivate = manifest.autoActivate ?? true,
    } = options;

    // 순환 의존성 체크
    if (this.loading.has(manifest.id)) {
      return {
        success: false,
        pluginId: manifest.id,
        error: `Circular dependency detected: ${manifest.id}`,
      };
    }

    // 이미 로드된 경우
    if (this.loadedPlugins.has(manifest.id)) {
      return {
        success: true,
        pluginId: manifest.id,
        plugin: this.loadedPlugins.get(manifest.id),
      };
    }

    this.loading.add(manifest.id);

    try {
      // 의존성 해결
      if (resolveDependencies && manifest.dependencies) {
        for (const depId of manifest.dependencies) {
          const depLoaded = this.loadedPlugins.has(depId) || pluginRegistry.getPlugin(depId);
          if (!depLoaded) {
            return {
              success: false,
              pluginId: manifest.id,
              error: `Missing dependency: ${depId}`,
            };
          }
        }
      }

      // 플러그인 로드
      const plugin = await this.loadFromEntry(manifest.entry);

      // 검증
      if (!skipValidation) {
        const validation = validatePlugin(plugin);
        if (!validation.valid) {
          return {
            success: false,
            pluginId: manifest.id,
            error: `Validation failed: ${validation.errors.join(', ')}`,
          };
        }
      }

      // 레지스트리에 등록
      await pluginRegistry.register(plugin);

      // 자동 활성화
      if (autoActivate) {
        await pluginRegistry.activate(plugin.metadata.id);
      }

      this.loadedPlugins.set(manifest.id, plugin);

      return {
        success: true,
        pluginId: manifest.id,
        plugin,
      };
    } catch (error) {
      return {
        success: false,
        pluginId: manifest.id,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      this.loading.delete(manifest.id);
    }
  }

  /**
   * 여러 플러그인 로드
   */
  async loadPlugins(
    manifests: PluginManifest[],
    options: LoaderOptions = {}
  ): Promise<PluginLoadResult[]> {
    const { continueOnError = true } = options;
    const results: PluginLoadResult[] = [];

    // 우선순위로 정렬
    const sorted = [...manifests].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    for (const manifest of sorted) {
      const result = await this.loadPlugin(manifest, options);
      results.push(result);

      if (!result.success && !continueOnError) {
        break;
      }
    }

    return results;
  }

  /**
   * 진입점에서 플러그인 로드
   */
  private async loadFromEntry(entry: string): Promise<InfraFlowPlugin> {
    // URL인 경우
    if (entry.startsWith('http://') || entry.startsWith('https://')) {
      return this.loadFromURL(entry);
    }

    // 상대 경로인 경우 동적 import
    // 브라우저 환경에서는 직접 import 불가
    // 서버 환경에서만 파일 시스템 로드 가능
    if (typeof window === 'undefined') {
      return this.loadFromFile(entry);
    }

    throw new Error(`Cannot load plugin from path in browser: ${entry}`);
  }

  /**
   * URL에서 플러그인 로드
   */
  private async loadFromURL(url: string): Promise<InfraFlowPlugin> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch plugin: ${response.statusText}`);
    }

    // JSON 형식 플러그인
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return this.parsePluginData(data);
    }

    // JavaScript 모듈
    const code = await response.text();
    return this.evaluatePluginCode(code);
  }

  /**
   * 파일에서 플러그인 로드 (서버 전용)
   */
  private async loadFromFile(path: string): Promise<InfraFlowPlugin> {
    // 동적 import 사용
    // 실제로는 빌드 시스템과 통합 필요
    try {
      const module = await import(/* webpackIgnore: true */ path);
      return module.default || module.plugin || module;
    } catch (error) {
      throw new Error(`Failed to load plugin from file: ${path}`);
    }
  }

  /**
   * JSON 데이터를 플러그인으로 파싱
   */
  private parsePluginData(data: unknown): InfraFlowPlugin {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid plugin data: not an object');
    }

    const obj = data as Record<string, unknown>;

    if (!obj.metadata || typeof obj.metadata !== 'object') {
      throw new Error('Invalid plugin data: missing metadata');
    }

    // 필수 필드 확인
    const metadata = obj.metadata as Partial<PluginMetadata>;
    if (!metadata.id || !metadata.name || !metadata.version) {
      throw new Error('Invalid plugin metadata: missing required fields');
    }

    return data as InfraFlowPlugin;
  }

  /**
   * JavaScript 코드를 플러그인으로 평가
   *
   * 주의: 보안상 위험할 수 있음. 신뢰할 수 있는 소스에서만 사용
   */
  private evaluatePluginCode(code: string): InfraFlowPlugin {
    // 샌드박스 환경에서 실행 (기본 구현)
    // 실제 프로덕션에서는 더 안전한 방법 필요
    const exports: Record<string, unknown> = {};
    const module = { exports };

    // eslint-disable-next-line no-new-func
    const fn = new Function('module', 'exports', code);
    fn(module, exports);

    const exported: unknown = module.exports;

    if (!exported || typeof exported !== 'object') {
      throw new Error('Plugin code did not export a valid object');
    }

    const obj = exported as Record<string, unknown>;

    if (!obj.metadata || typeof obj.metadata !== 'object') {
      throw new Error('Plugin code did not export a valid plugin');
    }

    const metadata = obj.metadata as Partial<PluginMetadata>;
    if (!metadata.id || !metadata.name || !metadata.version) {
      throw new Error('Plugin code exported invalid metadata: missing required fields');
    }

    return exported as InfraFlowPlugin;
  }

  /**
   * 로드된 플러그인 조회
   */
  getLoadedPlugin(id: string): InfraFlowPlugin | undefined {
    return this.loadedPlugins.get(id);
  }

  /**
   * 로드된 모든 플러그인 조회
   */
  getAllLoadedPlugins(): InfraFlowPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * 플러그인 언로드
   */
  async unloadPlugin(id: string): Promise<void> {
    const plugin = this.loadedPlugins.get(id);
    if (!plugin) return;

    await pluginRegistry.unregister(id);
    this.loadedPlugins.delete(id);
  }

  /**
   * 모든 플러그인 언로드
   */
  async unloadAll(): Promise<void> {
    for (const id of this.loadedPlugins.keys()) {
      await this.unloadPlugin(id);
    }
  }

  /**
   * 로더 초기화
   */
  reset(): void {
    this.loadedPlugins.clear();
    this.loading.clear();
  }
}

// ============================================================
// Default Instance & Helper Functions
// ============================================================

/**
 * 기본 플러그인 로더 인스턴스
 */
export const pluginLoader = new PluginLoader();

/**
 * 매니페스트에서 플러그인 로드 (헬퍼 함수)
 */
export async function loadPlugin(
  manifest: PluginManifest,
  options?: LoaderOptions
): Promise<PluginLoadResult> {
  return pluginLoader.loadPlugin(manifest, options);
}

/**
 * 여러 매니페스트에서 플러그인 로드 (헬퍼 함수)
 */
export async function loadPlugins(
  manifests: PluginManifest[],
  options?: LoaderOptions
): Promise<PluginLoadResult[]> {
  return pluginLoader.loadPlugins(manifests, options);
}

/**
 * URL에서 플러그인 로드 (헬퍼 함수)
 */
export async function loadPluginFromURL(
  url: string,
  options?: LoaderOptions
): Promise<PluginLoadResult> {
  const manifest: PluginManifest = {
    id: url,
    entry: url,
  };
  return pluginLoader.loadPlugin(manifest, options);
}
