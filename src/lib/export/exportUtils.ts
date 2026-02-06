import { InfraSpec } from '@/types';

export type ExportFormat = 'png' | 'svg' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  scale?: number;
  background?: string;
  includeMetadata?: boolean;
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
