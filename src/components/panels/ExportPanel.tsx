'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  exportDiagram,
  exportAsJSON,
  downloadFile,
  generateFilename,
  copyImageToClipboard,
  ExportFormat,
} from '@/lib/export';
import { InfraSpec } from '@/types';
import { createLogger } from '@/lib/utils/logger';
import { trackActivity } from '@/lib/activity/trackActivity';

const log = createLogger('ExportPanel');

interface ExportPanelProps {
  onClose: () => void;
  canvasRef: React.RefObject<HTMLElement>;
  currentSpec: InfraSpec | null;
}

interface ExportOption {
  format: ExportFormat;
  label: string;
  icon: string;
  description: string;
}

const exportOptions: ExportOption[] = [
  {
    format: 'png',
    label: 'PNG 이미지',
    icon: '🖼️',
    description: '고해상도 이미지로 저장',
  },
  {
    format: 'svg',
    label: 'SVG 벡터',
    icon: '📐',
    description: '확대해도 깨지지 않는 벡터 형식',
  },
  {
    format: 'pdf',
    label: 'PDF 문서',
    icon: '📄',
    description: '인쇄용 문서로 저장',
  },
  {
    format: 'json',
    label: 'JSON 데이터',
    icon: '📋',
    description: '구조 데이터를 JSON으로 저장',
  },
];

export function ExportPanel({ onClose, canvasRef, currentSpec }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!canvasRef.current && format !== 'json') {
      setExportStatus({ type: 'error', message: '캔버스를 찾을 수 없습니다' });
      return;
    }

    if (format === 'json' && !currentSpec) {
      setExportStatus({ type: 'error', message: '내보낼 데이터가 없습니다' });
      return;
    }

    setIsExporting(true);
    setExportStatus(null);

    try {
      let data: Blob | string;
      let filename: string;
      let mimeType: string | undefined;

      if (format === 'json') {
        data = exportAsJSON(currentSpec!);
        filename = generateFilename('infraflow', 'json');
        mimeType = 'application/json';
      } else {
        data = await exportDiagram(canvasRef.current!, { format });
        const ext = format === 'pdf' ? 'pdf' : format;
        filename = generateFilename('infraflow', ext);

        if (format === 'svg') {
          mimeType = 'image/svg+xml';
        }
      }

      downloadFile(data, filename, mimeType);
      trackActivity('export', {
        detail: { format, filename },
      });
      setExportStatus({ type: 'success', message: `${format.toUpperCase()} 파일이 다운로드되었습니다` });
    } catch (error) {
      log.error('Export failed', error instanceof Error ? error : undefined);
      setExportStatus({ type: 'error', message: '내보내기에 실패했습니다' });
    }

    setIsExporting(false);
  };

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) {
      setExportStatus({ type: 'error', message: '캔버스를 찾을 수 없습니다' });
      return;
    }

    setIsExporting(true);
    setExportStatus(null);

    try {
      await copyImageToClipboard(canvasRef.current);
      setExportStatus({ type: 'success', message: '클립보드에 복사되었습니다' });
    } catch (error) {
      log.error('Copy failed', error instanceof Error ? error : undefined);
      setExportStatus({ type: 'error', message: '복사에 실패했습니다' });
    }

    setIsExporting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <h2 className="text-xl font-bold text-white">내보내기</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-3">
          {exportOptions.map((option) => (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={isExporting}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border transition-all
                ${isExporting
                  ? 'bg-zinc-800 border-zinc-700 cursor-wait opacity-50'
                  : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-blue-500/50'
                }
              `}
            >
              <span className="text-2xl">{option.icon}</span>
              <div className="text-left">
                <div className="text-white font-medium">{option.label}</div>
                <div className="text-zinc-400 text-sm">{option.description}</div>
              </div>
            </button>
          ))}

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-zinc-500 text-sm">또는</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopyToClipboard}
            disabled={isExporting}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl border transition-all
              ${isExporting
                ? 'bg-zinc-800 border-zinc-700 cursor-wait opacity-50'
                : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
              }
            `}
          >
            <span className="text-2xl">📋</span>
            <div className="text-left">
              <div className="text-blue-400 font-medium">클립보드에 복사</div>
              <div className="text-blue-400/70 text-sm">이미지를 클립보드에 복사합니다</div>
            </div>
          </button>
        </div>

        {/* Status Message */}
        {exportStatus && (
          <div className={`
            mx-6 mb-6 p-3 rounded-lg text-sm
            ${exportStatus.type === 'success'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
            }
          `}>
            {exportStatus.type === 'success' ? '✓' : '✕'} {exportStatus.message}
          </div>
        )}

        {/* Loading Indicator */}
        {isExporting && (
          <div className="mx-6 mb-6 flex items-center justify-center gap-2 text-zinc-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            <span>내보내는 중...</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
