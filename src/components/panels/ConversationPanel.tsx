'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  History,
  Lightbulb,
  ChevronRight,
  Trash2,
  Clock,
} from 'lucide-react';
import type { InfraSpec } from '@/types';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: number;
  success?: boolean;
}

interface ConversationPanelProps {
  messages: ConversationMessage[];
  currentSpec: InfraSpec | null;
  onSelectPrompt: (prompt: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

// Follow-up suggestions based on current architecture
function generateFollowUpSuggestions(spec: InfraSpec | null): string[] {
  if (!spec || spec.nodes.length === 0) {
    return [
      '3티어 웹 아키텍처 보여줘',
      'VDI + 내부망 LLM 구조 보여줘',
      '쿠버네티스 클러스터 아키텍처',
      '하이브리드 클라우드 구조',
    ];
  }

  const suggestions: string[] = [];
  const nodeTypes = new Set(spec.nodes.map((n) => n.type));

  // Security suggestions
  if (!nodeTypes.has('waf') && nodeTypes.has('web-server')) {
    suggestions.push('WAF 추가해줘');
  }
  if (!nodeTypes.has('ids-ips')) {
    suggestions.push('IDS/IPS 추가해줘');
  }
  if (!nodeTypes.has('mfa') && (nodeTypes.has('ldap-ad') || nodeTypes.has('sso'))) {
    suggestions.push('MFA 추가해줘');
  }
  if (!nodeTypes.has('dlp')) {
    suggestions.push('DLP 추가해줘');
  }

  // Availability suggestions
  if (!nodeTypes.has('load-balancer') && nodeTypes.has('web-server')) {
    suggestions.push('로드밸런서 추가해줘');
  }
  if (!nodeTypes.has('backup')) {
    suggestions.push('백업 시스템 추가해줘');
  }
  if (!nodeTypes.has('cdn') && nodeTypes.has('web-server')) {
    suggestions.push('CDN 추가해줘');
  }

  // Query suggestions
  suggestions.push('현재 아키텍처의 보안 취약점 분석해줘');
  suggestions.push('비용 산출해줘');
  suggestions.push('규정 준수 상태 확인해줘');

  // Modification suggestions
  if (spec.nodes.length > 3) {
    suggestions.push('DB 서버 이중화해줘');
    suggestions.push('웹 서버 제거해줘');
  }

  return suggestions.slice(0, 6);
}

// Format timestamp
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;

  if (diff < 60000) {
    return '방금 전';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}분 전`;
  } else if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }
}

export function ConversationPanel({
  messages,
  currentSpec,
  onSelectPrompt,
  onClearHistory,
  onClose,
}: ConversationPanelProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'suggestions'>('suggestions');

  const suggestions = useMemo(
    () => generateFollowUpSuggestions(currentSpec),
    [currentSpec]
  );

  const userMessages = useMemo(
    () => messages.filter((m) => m.type === 'user').reverse(),
    [messages]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed top-0 left-0 h-full w-[380px] bg-zinc-900/95 backdrop-blur-sm border-r border-white/10 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">대화 컨텍스트</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'suggestions'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Lightbulb className="w-4 h-4" />
            제안
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <History className="w-4 h-4" />
            기록 ({userMessages.length})
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-3"
            >
              {/* Context Info */}
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-sm font-medium text-blue-400 mb-2">현재 상태</h3>
                {currentSpec ? (
                  <div className="text-sm text-gray-300">
                    <p>{currentSpec.nodes.length}개의 노드, {currentSpec.connections.length}개의 연결</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Array.from(new Set(currentSpec.nodes.map((n) => n.type)))
                        .slice(0, 5)
                        .map((type) => (
                          <span
                            key={type}
                            className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400"
                          >
                            {type}
                          </span>
                        ))}
                      {new Set(currentSpec.nodes.map((n) => n.type)).size > 5 && (
                        <span className="px-2 py-0.5 text-xs text-gray-500">
                          +{new Set(currentSpec.nodes.map((n) => n.type)).size - 5}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">아직 생성된 아키텍처가 없습니다</p>
                )}
              </div>

              {/* Follow-up Suggestions */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  {currentSpec ? '다음 작업 제안' : '시작하기'}
                </h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectPrompt(suggestion)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-blue-500/30 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm text-white flex-1">{suggestion}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              {currentSpec && currentSpec.nodes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">빠른 분석</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectPrompt('보안 감사 실행해줘')}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      <span className="text-sm text-red-400">보안 감사</span>
                    </button>
                    <button
                      onClick={() => onSelectPrompt('비용 산출해줘')}
                      className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                    >
                      <span className="text-sm text-green-400">비용 산출</span>
                    </button>
                    <button
                      onClick={() => onSelectPrompt('규정 준수 확인해줘')}
                      className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                    >
                      <span className="text-sm text-yellow-400">규정 준수</span>
                    </button>
                    <button
                      onClick={() => onSelectPrompt('아키텍처 최적화 제안해줘')}
                      className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                    >
                      <span className="text-sm text-purple-400">최적화 제안</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4"
            >
              {userMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>대화 기록이 없습니다</p>
                  <p className="text-sm mt-1">프롬프트를 입력하면 여기에 기록됩니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userMessages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => onSelectPrompt(message.content)}
                      className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          message.success !== false ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{message.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {activeTab === 'history' && userMessages.length > 0 && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClearHistory}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            기록 삭제
          </button>
        </div>
      )}
    </motion.div>
  );
}
