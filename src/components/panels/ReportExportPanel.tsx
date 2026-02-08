'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  FileText,
  Download,
  Shield,
  DollarSign,
  CheckSquare,
  Layers,
  Settings,
} from 'lucide-react';
import {
  generatePDFReport,
  downloadFile,
  generateFilename,
  generateShareableImage,
  type PDFReportOptions,
} from '@/lib/export';
import type { InfraSpec } from '@/types';
import type { CloudProvider } from '@/lib/cost';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('ReportExportPanel');

interface ReportExportPanelProps {
  spec: InfraSpec;
  canvasRef: React.RefObject<HTMLElement>;
  onClose: () => void;
}

export function ReportExportPanel({ spec, canvasRef, onClose }: ReportExportPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Report options
  const [title, setTitle] = useState('Infrastructure Architecture Report');
  const [author, setAuthor] = useState('');
  const [organization, setOrganization] = useState('');
  const [includeArchitecture, setIncludeArchitecture] = useState(true);
  const [includeSecurityAudit, setIncludeSecurityAudit] = useState(true);
  const [includeCompliance, setIncludeCompliance] = useState(true);
  const [includeCostEstimate, setIncludeCostEstimate] = useState(true);
  const [provider, setProvider] = useState<CloudProvider>('aws');
  const [currency, setCurrency] = useState<'USD' | 'KRW'>('KRW');
  const [includeDiagram, setIncludeDiagram] = useState(true);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setStatus(null);

    try {
      let diagramImage: string | undefined;

      if (includeDiagram && canvasRef.current) {
        try {
          diagramImage = await generateShareableImage(canvasRef.current);
        } catch (error) {
          logger.warn('Failed to generate diagram image for report', {
            error: error instanceof Error ? error.message : String(error),
          });
          // Continue without image
        }
      }

      const options: PDFReportOptions = {
        metadata: {
          title,
          author: author || undefined,
          organization: organization || undefined,
          version: '1.0',
          createdAt: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        includeArchitecture,
        includeSecurityAudit,
        includeCompliance,
        includeCostEstimate,
        provider,
        currency,
        diagramImage,
      };

      const blob = await generatePDFReport(spec, options);
      const filename = generateFilename('infraflow-report', 'pdf');
      downloadFile(blob, filename);

      setStatus({ type: 'success', message: 'PDF 보고서가 생성되었습니다' });
    } catch (error) {
      console.error('Report generation failed:', error);
      setStatus({ type: 'error', message: '보고서 생성에 실패했습니다' });
    }

    setIsGenerating(false);
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
        className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">상세 보고서 생성</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              보고서 정보
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">작성자</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="선택사항"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">조직</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="선택사항"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              포함 내용
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={includeDiagram}
                  onChange={(e) => setIncludeDiagram(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-white">아키텍처 다이어그램</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={includeArchitecture}
                  onChange={(e) => setIncludeArchitecture(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">구성요소 목록</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSecurityAudit}
                  onChange={(e) => setIncludeSecurityAudit(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-sm text-white">보안 감사 결과</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCompliance}
                  onChange={(e) => setIncludeCompliance(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
                <CheckSquare className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white">규정 준수 현황</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCostEstimate}
                  onChange={(e) => setIncludeCostEstimate(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">비용 산출</span>
              </label>
            </div>
          </div>

          {/* Cost Options */}
          {includeCostEstimate && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                비용 산출 옵션
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">클라우드 제공자</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as CloudProvider)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="aws">AWS</option>
                    <option value="azure">Azure</option>
                    <option value="gcp">GCP</option>
                    <option value="onprem">On-Premise</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">통화</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'USD' | 'KRW')}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="KRW">KRW (₩)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-700 space-y-3">
          {status && (
            <div className={`p-3 rounded-lg text-sm ${
              status.type === 'success'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? '✓' : '✕'} {status.message}
            </div>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              isGenerating
                ? 'bg-zinc-700 text-zinc-500 cursor-wait'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
                보고서 생성 중...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                PDF 보고서 생성
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            보고서에는 선택한 항목의 분석 결과가 포함됩니다
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
