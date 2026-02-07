/**
 * Export Utilities
 *
 * 다이어그램 및 인프라 스펙 내보내기 유틸리티
 *
 * 플러그인 시스템 지원:
 * - ExporterRegistry를 통한 플러그인 익스포터 지원
 * - 기존 이미지 내보내기 기능 유지
 */

import { InfraSpec } from '@/types';
import type { ExporterExtension } from '@/types/plugin';

export type ExportFormat = 'png' | 'svg' | 'json' | 'pdf';

/**
 * 확장 내보내기 형식 (플러그인 익스포터 포함)
 */
export type ExtendedExportFormat = ExportFormat | 'terraform' | 'kubernetes' | 'plantuml' | string;

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  scale?: number;
  background?: string;
  includeMetadata?: boolean;
}

export interface PluginExportOptions {
  format: ExtendedExportFormat;
  pluginOptions?: Record<string, unknown>;
}

/**
 * Export the current diagram as an image or file
 */
export async function exportDiagram(
  element: HTMLElement,
  options: ExportOptions
): Promise<Blob | string> {
  const { format, scale = 2, background = '#18181b' } = options;

  switch (format) {
    case 'png':
      return await exportAsPNG(element, scale, background);
    case 'svg':
      return await exportAsSVG(element);
    case 'json':
      throw new Error('Use exportAsJSON for JSON export');
    case 'pdf':
      return await exportAsPDF(element, scale, background);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Export as PNG using canvas
 */
async function exportAsPNG(
  element: HTMLElement,
  scale: number,
  background: string
): Promise<Blob> {
  // Dynamic import to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: background,
    logging: false,
    useCORS: true,
    allowTaint: true,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create PNG blob'));
      }
    }, 'image/png');
  });
}

/**
 * Export as SVG
 */
async function exportAsSVG(element: HTMLElement): Promise<string> {
  // Find the SVG element within React Flow
  const svgElement = element.querySelector('svg.react-flow__viewport');

  if (!svgElement) {
    throw new Error('SVG element not found');
  }

  // Clone and prepare SVG
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;

  // Add necessary styles
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .react-flow__node { font-family: system-ui, sans-serif; }
    .react-flow__edge-path { stroke-width: 2; }
  `;
  clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

  // Set viewBox and dimensions
  const bbox = (svgElement as SVGSVGElement).getBBox();
  clonedSvg.setAttribute('viewBox', `${bbox.x - 20} ${bbox.y - 20} ${bbox.width + 40} ${bbox.height + 40}`);
  clonedSvg.setAttribute('width', String(bbox.width + 40));
  clonedSvg.setAttribute('height', String(bbox.height + 40));

  // Serialize to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);

  return `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
}

/**
 * Export as PDF (using canvas and jsPDF)
 */
async function exportAsPDF(
  element: HTMLElement,
  scale: number,
  background: string
): Promise<Blob> {
  // Dynamic imports
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: background,
    logging: false,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

  return pdf.output('blob');
}

/**
 * Export infrastructure spec as JSON
 */
export function exportAsJSON(spec: InfraSpec, pretty = true): string {
  return JSON.stringify(spec, null, pretty ? 2 : 0);
}

/**
 * Download a blob or string as a file
 */
export function downloadFile(
  data: Blob | string,
  filename: string,
  mimeType?: string
): void {
  const blob = typeof data === 'string'
    ? new Blob([data], { type: mimeType || 'text/plain' })
    : data;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename with timestamp
 */
export function generateFilename(base: string, extension: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `${base}-${timestamp}.${extension}`;
}

/**
 * Copy image to clipboard
 */
export async function copyImageToClipboard(element: HTMLElement): Promise<void> {
  const blob = await exportDiagram(element, { format: 'png', scale: 2 }) as Blob;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
  } catch {
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Generate shareable data URL
 */
export async function generateShareableImage(element: HTMLElement): Promise<string> {
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
    scale: 1,
    backgroundColor: '#18181b',
    logging: false,
  });

  return canvas.toDataURL('image/png');
}

// ============================================================
// Plugin Exporter Integration
// ============================================================

/**
 * ExporterRegistry에서 익스포터 가져오기
 */
function getExporterRegistry() {
  try {
    const { exporterRegistry } = require('./ExporterRegistry');
    return exporterRegistry;
  } catch {
    return null;
  }
}

/**
 * 플러그인 익스포터를 사용하여 내보내기
 *
 * ExporterRegistry에 등록된 익스포터를 사용합니다.
 */
export function exportWithPlugin(
  format: string,
  spec: InfraSpec,
  options?: Record<string, unknown>
): string | Blob | null {
  const registry = getExporterRegistry();
  if (!registry) {
    console.error('[exportUtils] ExporterRegistry not available');
    return null;
  }

  return registry.exportSafe(format, spec, options);
}

/**
 * 지원되는 플러그인 익스포터 형식 목록
 */
export function getSupportedPluginFormats(): string[] {
  const registry = getExporterRegistry();
  if (!registry) {
    return [];
  }
  return registry.getSupportedFormats();
}

/**
 * 플러그인 익스포터 존재 여부 확인
 */
export function hasPluginExporter(format: string): boolean {
  const registry = getExporterRegistry();
  if (!registry) {
    return false;
  }
  return registry.has(format);
}

/**
 * 플러그인 익스포터 정보 조회
 */
export function getPluginExporter(format: string): ExporterExtension | undefined {
  const registry = getExporterRegistry();
  if (!registry) {
    return undefined;
  }
  return registry.get(format);
}

/**
 * 모든 플러그인 익스포터 조회
 */
export function getAllPluginExporters(): ExporterExtension[] {
  const registry = getExporterRegistry();
  if (!registry) {
    return [];
  }
  return registry.getAll();
}

/**
 * 통합 내보내기 함수
 *
 * 형식에 따라 적절한 내보내기 방식 선택:
 * - 이미지 형식(png, svg, pdf): 기존 exportDiagram 사용
 * - json: exportAsJSON 사용
 * - 플러그인 형식: ExporterRegistry 사용
 */
export async function exportUnified(
  format: ExtendedExportFormat,
  spec: InfraSpec,
  options?: {
    element?: HTMLElement;
    scale?: number;
    background?: string;
    pluginOptions?: Record<string, unknown>;
  }
): Promise<string | Blob | null> {
  const { element, scale = 2, background = '#18181b', pluginOptions } = options || {};

  // 이미지/PDF 형식은 element가 필요
  if (['png', 'svg', 'pdf'].includes(format)) {
    if (!element) {
      console.error(`[exportUtils] Element required for ${format} export`);
      return null;
    }
    try {
      return await exportDiagram(element, {
        format: format as ExportFormat,
        scale,
        background,
      });
    } catch (error) {
      console.error(`[exportUtils] Failed to export as ${format}:`, error);
      return null;
    }
  }

  // JSON 형식
  if (format === 'json') {
    return exportAsJSON(spec, true);
  }

  // 플러그인 익스포터
  return exportWithPlugin(format, spec, pluginOptions);
}

/**
 * 여러 형식으로 동시에 내보내기
 */
export async function exportMultipleFormats(
  formats: ExtendedExportFormat[],
  spec: InfraSpec,
  options?: {
    element?: HTMLElement;
    scale?: number;
    background?: string;
    pluginOptions?: Record<string, unknown>;
  }
): Promise<Record<string, string | Blob | null>> {
  const results: Record<string, string | Blob | null> = {};

  for (const format of formats) {
    results[format] = await exportUnified(format, spec, options);
  }

  return results;
}

/**
 * 익스포터 파일 확장자 가져오기
 */
export function getExporterFileExtension(format: string): string {
  // 기본 형식
  const defaultExtensions: Record<string, string> = {
    png: 'png',
    svg: 'svg',
    pdf: 'pdf',
    json: 'json',
  };

  if (defaultExtensions[format]) {
    return defaultExtensions[format];
  }

  // 플러그인 익스포터에서 확장자 가져오기
  const exporter = getPluginExporter(format);
  if (exporter) {
    return exporter.fileExtension;
  }

  // 기본값
  return format;
}
