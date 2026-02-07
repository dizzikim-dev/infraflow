/**
 * Plugin Registry
 *
 * 플러그인 등록, 관리, 조회를 담당하는 중앙 레지스트리
 */

import type { NodeConfig } from '@/components/nodes/nodeConfig';
import type {
  InfraFlowPlugin,
  PluginState,
  PluginStatus,
  NodeExtension,
  ParserExtension,
  ExporterExtension,
  PanelExtension,
  ThemeExtension,
  CategoryStyle,
  NodeTypePattern,
  RegistryEvent,
  RegistryEventType,
  RegistryEventListener,
  ValidationResult,
} from '@/types/plugin';
import type { InfraSpec, NodeCategory } from '@/types/infra';

/**
 * 플러그인 레지스트리 클래스
 *
 * 싱글톤 패턴으로 구현되어 앱 전체에서 하나의 인스턴스만 사용
 */
export class PluginRegistry {
  private static instance: PluginRegistry | null = null;

  // 플러그인 상태 저장
  private plugins: Map<string, PluginState> = new Map();

  // 확장별 캐시 (성능 최적화)
  private nodeExtensionsCache: Map<string, NodeExtension> = new Map();
  private parserExtensionsCache: ParserExtension[] = [];
  private exporterExtensionsCache: Map<string, ExporterExtension> = new Map();
  private panelExtensionsCache: Map<string, PanelExtension> = new Map();
  private themeExtensionsCache: Map<string, ThemeExtension> = new Map();

  // 카테고리 스타일 캐시
  private categoryStylesCache: Map<string, CategoryStyle> = new Map();

  // 이벤트 리스너
  private eventListeners: Set<RegistryEventListener> = new Set();

  // 캐시 유효성 플래그
  private cacheValid = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * 테스트용: 인스턴스 초기화
   */
  static resetInstance(): void {
    PluginRegistry.instance = null;
  }

  // ============================================================
  // Plugin Lifecycle
  // ============================================================

  /**
   * 플러그인 등록
   */
  async register(plugin: InfraFlowPlugin): Promise<void> {
    const { id } = plugin.metadata;

    // 중복 체크
    if (this.plugins.has(id)) {
      throw new Error(`Plugin '${id}' is already registered`);
    }

    // 의존성 체크
    if (plugin.metadata.dependencies) {
      for (const depId of plugin.metadata.dependencies) {
        if (!this.plugins.has(depId)) {
          throw new Error(
            `Plugin '${id}' depends on '${depId}' which is not registered`
          );
        }
      }
    }

    // 상태 생성
    const state: PluginState = {
      plugin,
      status: 'installed',
      loadedAt: Date.now(),
    };

    this.plugins.set(id, state);
    this.invalidateCache();

    // 이벤트 발생
    this.emit({
      type: 'plugin:registered',
      pluginId: id,
      timestamp: Date.now(),
    });
  }

  /**
   * 플러그인 활성화
   */
  async activate(pluginId: string): Promise<void> {
    const state = this.plugins.get(pluginId);
    if (!state) {
      throw new Error(`Plugin '${pluginId}' is not registered`);
    }

    if (state.status === 'active') {
      return; // Already active
    }

    try {
      // onLoad 훅 호출
      if (state.plugin.onLoad) {
        await state.plugin.onLoad();
      }

      state.status = 'active';
      this.invalidateCache();

      this.emit({
        type: 'plugin:activated',
        pluginId,
        timestamp: Date.now(),
      });
    } catch (error) {
      state.status = 'error';
      state.error = error instanceof Error ? error.message : String(error);

      this.emit({
        type: 'plugin:error',
        pluginId,
        timestamp: Date.now(),
        data: { error: state.error },
      });

      throw error;
    }
  }

  /**
   * 플러그인 비활성화
   */
  async deactivate(pluginId: string): Promise<void> {
    const state = this.plugins.get(pluginId);
    if (!state) {
      throw new Error(`Plugin '${pluginId}' is not registered`);
    }

    if (state.status !== 'active') {
      return; // Not active
    }

    try {
      // onUnload 훅 호출
      if (state.plugin.onUnload) {
        await state.plugin.onUnload();
      }

      state.status = 'inactive';
      this.invalidateCache();

      this.emit({
        type: 'plugin:deactivated',
        pluginId,
        timestamp: Date.now(),
      });
    } catch (error) {
      state.status = 'error';
      state.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * 플러그인 해제
   */
  async unregister(pluginId: string): Promise<void> {
    const state = this.plugins.get(pluginId);
    if (!state) {
      return; // Not registered
    }

    // 활성 상태면 먼저 비활성화
    if (state.status === 'active') {
      await this.deactivate(pluginId);
    }

    this.plugins.delete(pluginId);
    this.invalidateCache();

    this.emit({
      type: 'plugin:unregistered',
      pluginId,
      timestamp: Date.now(),
    });
  }

  // ============================================================
  // Plugin Queries
  // ============================================================

  /**
   * 플러그인 조회
   */
  getPlugin(pluginId: string): InfraFlowPlugin | undefined {
    return this.plugins.get(pluginId)?.plugin;
  }

  /**
   * 플러그인 상태 조회
   */
  getPluginState(pluginId: string): PluginState | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 모든 플러그인 조회
   */
  getAllPlugins(): InfraFlowPlugin[] {
    return Array.from(this.plugins.values()).map((state) => state.plugin);
  }

  /**
   * 활성 플러그인만 조회
   */
  getActivePlugins(): InfraFlowPlugin[] {
    return Array.from(this.plugins.values())
      .filter((state) => state.status === 'active')
      .map((state) => state.plugin);
  }

  /**
   * 플러그인 상태 목록 조회
   */
  getAllPluginStates(): PluginState[] {
    return Array.from(this.plugins.values());
  }

  // ============================================================
  // Node Extensions
  // ============================================================

  /**
   * 모든 노드 설정 조회
   */
  getAllNodeConfigs(): NodeConfig[] {
    this.rebuildCacheIfNeeded();
    return Array.from(this.nodeExtensionsCache.values()).map((ext) => ext.config);
  }

  /**
   * 노드 설정 조회
   */
  getNodeConfig(nodeId: string): NodeConfig | undefined {
    this.rebuildCacheIfNeeded();
    return this.nodeExtensionsCache.get(nodeId)?.config;
  }

  /**
   * 노드 확장 조회
   */
  getNodeExtension(nodeId: string): NodeExtension | undefined {
    this.rebuildCacheIfNeeded();
    return this.nodeExtensionsCache.get(nodeId);
  }

  /**
   * 카테고리별 노드 설정 조회
   */
  getNodeConfigsByCategory(category: NodeConfig['category']): NodeConfig[] {
    return this.getAllNodeConfigs().filter((config) => config.category === category);
  }

  /**
   * 카테고리 스타일 조회
   */
  getCategoryStyles(): Record<string, CategoryStyle> {
    this.rebuildCacheIfNeeded();
    return Object.fromEntries(this.categoryStylesCache);
  }

  /**
   * 특정 카테고리 스타일 조회
   */
  getCategoryStyle(category: string): CategoryStyle | undefined {
    this.rebuildCacheIfNeeded();
    return this.categoryStylesCache.get(category);
  }

  // ============================================================
  // Parser Extensions
  // ============================================================

  /**
   * 모든 파서 확장 조회
   */
  getParserExtensions(): ParserExtension[] {
    this.rebuildCacheIfNeeded();
    return this.parserExtensionsCache;
  }

  /**
   * 모든 노드 타입 패턴 조회
   */
  getAllPatterns(): NodeTypePattern[] {
    this.rebuildCacheIfNeeded();
    return this.parserExtensionsCache.flatMap((ext) => ext.patterns);
  }

  /**
   * 모든 템플릿 조회
   */
  getAllTemplates(): Record<string, InfraSpec> {
    this.rebuildCacheIfNeeded();
    return this.parserExtensionsCache.reduce(
      (acc, ext) => ({ ...acc, ...ext.templates }),
      {} as Record<string, InfraSpec>
    );
  }

  // ============================================================
  // Exporter Extensions
  // ============================================================

  /**
   * 익스포터 조회
   */
  getExporter(format: string): ExporterExtension | undefined {
    this.rebuildCacheIfNeeded();
    return this.exporterExtensionsCache.get(format);
  }

  /**
   * 모든 익스포터 조회
   */
  getAllExporters(): ExporterExtension[] {
    this.rebuildCacheIfNeeded();
    return Array.from(this.exporterExtensionsCache.values());
  }

  /**
   * 지원 형식 목록
   */
  getSupportedExportFormats(): string[] {
    return this.getAllExporters().map((exp) => exp.format);
  }

  // ============================================================
  // Panel Extensions
  // ============================================================

  /**
   * 패널 조회
   */
  getPanel(panelId: string): PanelExtension | undefined {
    this.rebuildCacheIfNeeded();
    return this.panelExtensionsCache.get(panelId);
  }

  /**
   * 모든 패널 조회
   */
  getAllPanels(): PanelExtension[] {
    this.rebuildCacheIfNeeded();
    return Array.from(this.panelExtensionsCache.values());
  }

  /**
   * 위치별 패널 조회
   */
  getPanelsByPosition(position: PanelExtension['position']): PanelExtension[] {
    return this.getAllPanels()
      .filter((panel) => panel.position === position)
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  // ============================================================
  // Theme Extensions
  // ============================================================

  /**
   * 테마 조회
   */
  getTheme(themeId: string): ThemeExtension | undefined {
    this.rebuildCacheIfNeeded();
    return this.themeExtensionsCache.get(themeId);
  }

  /**
   * 모든 테마 조회
   */
  getAllThemes(): ThemeExtension[] {
    this.rebuildCacheIfNeeded();
    return Array.from(this.themeExtensionsCache.values());
  }

  // ============================================================
  // Event System
  // ============================================================

  /**
   * 이벤트 리스너 등록
   */
  addEventListener(listener: RegistryEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * 이벤트 발생
   */
  private emit(event: RegistryEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Plugin registry event listener error:', error);
      }
    }
  }

  // ============================================================
  // Cache Management
  // ============================================================

  /**
   * 캐시 무효화
   */
  private invalidateCache(): void {
    this.cacheValid = false;
  }

  /**
   * 캐시 재구축 (필요한 경우)
   */
  private rebuildCacheIfNeeded(): void {
    if (this.cacheValid) {
      return;
    }

    // 캐시 초기화
    this.nodeExtensionsCache.clear();
    this.parserExtensionsCache = [];
    this.exporterExtensionsCache.clear();
    this.panelExtensionsCache.clear();
    this.themeExtensionsCache.clear();
    this.categoryStylesCache.clear();

    // 활성 플러그인에서 확장 수집
    for (const state of this.plugins.values()) {
      if (state.status !== 'active') {
        continue;
      }

      const plugin = state.plugin;

      // 노드 확장
      if (plugin.nodes) {
        for (const node of plugin.nodes) {
          this.nodeExtensionsCache.set(node.config.id, node);

          // 카테고리 스타일 등록
          if (node.categoryStyle) {
            this.categoryStylesCache.set(node.config.category, node.categoryStyle);
          }
        }
      }

      // 파서 확장
      if (plugin.parsers) {
        this.parserExtensionsCache.push(plugin.parsers);
      }

      // 익스포터 확장
      if (plugin.exporters) {
        for (const exporter of plugin.exporters) {
          this.exporterExtensionsCache.set(exporter.format, exporter);
        }
      }

      // 패널 확장
      if (plugin.panels) {
        for (const panel of plugin.panels) {
          this.panelExtensionsCache.set(panel.id, panel);
        }
      }

      // 테마 확장
      if (plugin.themes) {
        for (const theme of plugin.themes) {
          this.themeExtensionsCache.set(theme.id, theme);

          // 테마의 카테고리 스타일 등록
          if (theme.categoryStyles) {
            for (const [category, style] of Object.entries(theme.categoryStyles)) {
              if (style) {
                this.categoryStylesCache.set(category, style);
              }
            }
          }
        }
      }
    }

    // 파서 확장 우선순위 정렬
    this.parserExtensionsCache.sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );

    this.cacheValid = true;
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * 플러그인 설정 업데이트
   */
  updatePluginConfig(pluginId: string, config: Record<string, unknown>): void {
    const state = this.plugins.get(pluginId);
    if (!state) {
      throw new Error(`Plugin '${pluginId}' is not registered`);
    }

    state.config = { ...state.config, ...config };

    // onConfigChange 훅 호출
    if (state.plugin.onConfigChange) {
      state.plugin.onConfigChange(state.config);
    }
  }

  /**
   * 플러그인 설정 조회
   */
  getPluginConfig(pluginId: string): Record<string, unknown> | undefined {
    return this.plugins.get(pluginId)?.config;
  }

  /**
   * 레지스트리 상태 요약
   */
  getSummary(): {
    totalPlugins: number;
    activePlugins: number;
    totalNodes: number;
    totalExporters: number;
    totalPanels: number;
    totalThemes: number;
  } {
    this.rebuildCacheIfNeeded();
    return {
      totalPlugins: this.plugins.size,
      activePlugins: this.getActivePlugins().length,
      totalNodes: this.nodeExtensionsCache.size,
      totalExporters: this.exporterExtensionsCache.size,
      totalPanels: this.panelExtensionsCache.size,
      totalThemes: this.themeExtensionsCache.size,
    };
  }
}

/**
 * 기본 레지스트리 인스턴스
 */
export const pluginRegistry = PluginRegistry.getInstance();
