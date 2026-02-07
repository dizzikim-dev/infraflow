/**
 * Export Module Index
 *
 * 내보내기 관련 모든 기능의 진입점
 *
 * 플러그인 시스템 지원:
 * - ExporterRegistry를 통한 동적 익스포터 등록
 * - exportUnified를 통한 통합 내보내기
 */

// ============================================================
// Export Utilities
// ============================================================

export {
  exportDiagram,
  exportAsJSON,
  downloadFile,
  generateFilename,
  copyImageToClipboard,
  generateShareableImage,
  // Plugin integration
  exportWithPlugin,
  getSupportedPluginFormats,
  hasPluginExporter,
  getPluginExporter,
  getAllPluginExporters,
  exportUnified,
  exportMultipleFormats,
  getExporterFileExtension,
  // Types
  type ExportFormat,
  type ExtendedExportFormat,
  type ExportOptions,
  type PluginExportOptions,
} from './exportUtils';

// ============================================================
// Exporter Registry
// ============================================================

export {
  ExporterRegistry,
  exporterRegistry,
  createExporterExtension,
  createResourceMap,
  isExporterExtension,
} from './ExporterRegistry';

// ============================================================
// Built-in Exporters
// ============================================================

export {
  exportToTerraform,
  type TerraformExportOptions,
} from './terraformExport';

export {
  exportToKubernetes,
  type KubernetesExportOptions,
} from './kubernetesExport';

export {
  exportToPlantUML,
  type PlantUMLExportOptions,
} from './plantUMLExport';

export {
  generatePDFReport,
  getDefaultReportOptions,
  type PDFReportOptions,
  type ReportMetadata,
  type ReportSection,
  type ReportTable,
} from './pdfReportGenerator';
