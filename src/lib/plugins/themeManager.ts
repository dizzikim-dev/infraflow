/**
 * Theme Manager
 *
 * 플러그인 테마 관리
 * - 테마 적용/해제
 * - CSS 변수 동적 주입
 * - 테마 전환 애니메이션
 */

import type { ThemeExtension, ThemeColors, CategoryStyle } from '@/types/plugin';

// ============================================================
// Types
// ============================================================

/**
 * 테마 관리자 옵션
 */
export interface ThemeManagerOptions {
  /** 기본 테마 ID */
  defaultThemeId?: string;
  /** 테마 전환 시 애니메이션 사용 */
  useTransition?: boolean;
  /** 전환 시간 (ms) */
  transitionDuration?: number;
  /** 로컬 스토리지 키 */
  storageKey?: string;
}

/**
 * CSS 변수 맵
 */
export type CSSVariableMap = Record<string, string>;

// ============================================================
// Theme Manager Class
// ============================================================

/**
 * 테마 관리자
 */
export class ThemeManager {
  private themes: Map<string, ThemeExtension> = new Map();
  private currentThemeId: string | null = null;
  private options: Required<ThemeManagerOptions>;
  private styleElement: HTMLStyleElement | null = null;

  constructor(options: ThemeManagerOptions = {}) {
    this.options = {
      defaultThemeId: options.defaultThemeId ?? '',
      useTransition: options.useTransition ?? true,
      transitionDuration: options.transitionDuration ?? 200,
      storageKey: options.storageKey ?? 'infraflow-theme',
    };
  }

  // ============================================================
  // Registration
  // ============================================================

  /**
   * 테마 등록
   */
  register(theme: ThemeExtension): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * 테마 해제
   */
  unregister(themeId: string): void {
    if (this.currentThemeId === themeId) {
      this.reset();
    }
    this.themes.delete(themeId);
  }

  /**
   * 여러 테마 등록
   */
  registerAll(themes: ThemeExtension[]): void {
    for (const theme of themes) {
      this.register(theme);
    }
  }

  // ============================================================
  // Query
  // ============================================================

  /**
   * 테마 조회
   */
  getTheme(themeId: string): ThemeExtension | undefined {
    return this.themes.get(themeId);
  }

  /**
   * 모든 테마 조회
   */
  getAllThemes(): ThemeExtension[] {
    return Array.from(this.themes.values());
  }

  /**
   * 현재 테마 조회
   */
  getCurrentTheme(): ThemeExtension | null {
    if (!this.currentThemeId) return null;
    return this.themes.get(this.currentThemeId) ?? null;
  }

  /**
   * 현재 테마 ID 조회
   */
  getCurrentThemeId(): string | null {
    return this.currentThemeId;
  }

  // ============================================================
  // Theme Application
  // ============================================================

  /**
   * 테마 적용
   */
  apply(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    if (!theme) {
      console.warn(`[ThemeManager] Theme not found: ${themeId}`);
      return false;
    }

    // 브라우저 환경 체크
    if (typeof window === 'undefined') {
      this.currentThemeId = themeId;
      return true;
    }

    // 전환 애니메이션 설정
    if (this.options.useTransition) {
      document.documentElement.style.setProperty(
        '--theme-transition',
        `${this.options.transitionDuration}ms ease`
      );
    }

    // CSS 변수 적용
    const variables = this.generateCSSVariables(theme);
    this.injectStyles(variables);

    // 상태 업데이트
    this.currentThemeId = themeId;

    // 로컬 스토리지 저장
    if (this.options.storageKey) {
      try {
        localStorage.setItem(this.options.storageKey, themeId);
      } catch {
        // 스토리지 접근 실패 무시
      }
    }

    return true;
  }

  /**
   * 테마 초기화 (기본 테마로 복원)
   */
  reset(): void {
    // CSS 변수 제거
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }

    this.currentThemeId = null;

    // 로컬 스토리지에서 제거
    if (this.options.storageKey && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.options.storageKey);
      } catch {
        // 스토리지 접근 실패 무시
      }
    }
  }

  /**
   * 저장된 테마 복원
   */
  restore(): boolean {
    if (typeof window === 'undefined') return false;

    if (this.options.storageKey) {
      try {
        const savedThemeId = localStorage.getItem(this.options.storageKey);
        if (savedThemeId && this.themes.has(savedThemeId)) {
          return this.apply(savedThemeId);
        }
      } catch {
        // 스토리지 접근 실패 무시
      }
    }

    // 기본 테마 적용
    if (this.options.defaultThemeId) {
      return this.apply(this.options.defaultThemeId);
    }

    return false;
  }

  // ============================================================
  // CSS Generation
  // ============================================================

  /**
   * 테마에서 CSS 변수 생성
   */
  private generateCSSVariables(theme: ThemeExtension): CSSVariableMap {
    const variables: CSSVariableMap = {};

    // 색상 변수
    if (theme.colors) {
      for (const [key, value] of Object.entries(theme.colors)) {
        const varName = `--theme-${this.kebabCase(key)}`;
        variables[varName] = value;
      }
    }

    // 카테고리 스타일
    if (theme.categoryStyles) {
      for (const [category, style] of Object.entries(theme.categoryStyles)) {
        const prefix = `--theme-category-${this.kebabCase(category)}`;

        if (style.gradient) {
          variables[`${prefix}-gradient`] = style.gradient;
        }
        if (style.iconBg) {
          variables[`${prefix}-icon-bg`] = style.iconBg;
        }
        if (style.border) {
          variables[`${prefix}-border`] = style.border;
        }
        if (style.shadow) {
          variables[`${prefix}-shadow`] = style.shadow;
        }
        if (style.glowColor) {
          variables[`${prefix}-glow`] = style.glowColor;
        }
      }
    }

    return variables;
  }

  /**
   * 스타일 주입
   */
  private injectStyles(variables: CSSVariableMap): void {
    if (typeof window === 'undefined') return;

    // 기존 스타일 제거
    if (this.styleElement) {
      this.styleElement.remove();
    }

    // 새 스타일 요소 생성
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'infraflow-theme-variables';

    // CSS 생성
    const css = `:root {\n${Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')}\n}`;

    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);
  }

  /**
   * kebab-case 변환
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}

// ============================================================
// Default Instance & Helper Functions
// ============================================================

/**
 * 기본 테마 관리자 인스턴스
 */
export const themeManager = new ThemeManager();

/**
 * 테마 적용 (헬퍼 함수)
 */
export function applyTheme(themeId: string): boolean {
  return themeManager.apply(themeId);
}

/**
 * 현재 테마 조회 (헬퍼 함수)
 */
export function getCurrentTheme(): ThemeExtension | null {
  return themeManager.getCurrentTheme();
}

/**
 * 모든 테마 조회 (헬퍼 함수)
 */
export function getAllThemes(): ThemeExtension[] {
  return themeManager.getAllThemes();
}

/**
 * 테마 색상을 CSS 변수로 변환
 */
export function themeColorsToCSSVariables(colors: ThemeColors): CSSVariableMap {
  const variables: CSSVariableMap = {};

  for (const [key, value] of Object.entries(colors)) {
    const varName = `--theme-${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
    variables[varName] = value;
  }

  return variables;
}

/**
 * 카테고리 스타일을 CSS 변수로 변환
 */
export function categoryStylesToCSSVariables(
  styles: Record<string, CategoryStyle>
): CSSVariableMap {
  const variables: CSSVariableMap = {};

  for (const [category, style] of Object.entries(styles)) {
    const prefix = `--theme-category-${category.toLowerCase()}`;

    if (style.gradient) variables[`${prefix}-gradient`] = style.gradient;
    if (style.iconBg) variables[`${prefix}-icon-bg`] = style.iconBg;
    if (style.border) variables[`${prefix}-border`] = style.border;
    if (style.shadow) variables[`${prefix}-shadow`] = style.shadow;
    if (style.glowColor) variables[`${prefix}-glow`] = style.glowColor;
  }

  return variables;
}
