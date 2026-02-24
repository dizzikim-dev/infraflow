/**
 * Core Plugin
 *
 * 기본 인프라 컴포넌트를 제공하는 핵심 플러그인
 * - 56개 기본 노드 (42 + 14 AI)
 * - 노드 타입 패턴
 * - 기본 카테고리 스타일
 */

import type {
  InfraFlowPlugin,
  NodeExtension,
  ParserExtension,
  NodeTypePattern,
  CategoryStyle,
} from '@/types/plugin';
import type { NodeCategory } from '@/types/infra';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('CorePlugin');

// ============================================================
// Category Styles
// ============================================================

/**
 * 카테고리별 스타일 정의
 */
export const coreCategoryStyles: Record<NodeCategory | 'external' | 'zone', CategoryStyle> = {
  security: {
    gradient: 'from-red-500/20 to-rose-600/20',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    border: 'border-red-500/30',
    shadow: 'shadow-red-500/20',
    glowColor: '#ef4444',
  },
  network: {
    gradient: 'from-blue-500/20 to-cyan-600/20',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/20',
    glowColor: '#3b82f6',
  },
  compute: {
    gradient: 'from-emerald-500/20 to-green-600/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    border: 'border-emerald-500/30',
    shadow: 'shadow-emerald-500/20',
    glowColor: '#10b981',
  },
  cloud: {
    gradient: 'from-violet-500/20 to-purple-600/20',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    border: 'border-violet-500/30',
    shadow: 'shadow-violet-500/20',
    glowColor: '#8b5cf6',
  },
  storage: {
    gradient: 'from-amber-500/20 to-orange-600/20',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    border: 'border-amber-500/30',
    shadow: 'shadow-amber-500/20',
    glowColor: '#f59e0b',
  },
  auth: {
    gradient: 'from-pink-500/20 to-rose-600/20',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
    border: 'border-pink-500/30',
    shadow: 'shadow-pink-500/20',
    glowColor: '#ec4899',
  },
  external: {
    gradient: 'from-slate-500/20 to-gray-600/20',
    iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
    border: 'border-slate-500/30',
    shadow: 'shadow-slate-500/20',
    glowColor: '#64748b',
  },
  zone: {
    gradient: 'from-slate-500/20 to-gray-600/20',
    iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
    border: 'border-slate-500/30',
    shadow: 'shadow-slate-500/20',
    glowColor: '#64748b',
  },
  telecom: {
    gradient: 'from-teal-500/20 to-cyan-600/20',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    border: 'border-teal-500/30',
    shadow: 'shadow-teal-500/20',
    glowColor: '#14b8a6',
  },
  wan: {
    gradient: 'from-indigo-500/20 to-blue-600/20',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    border: 'border-indigo-500/30',
    shadow: 'shadow-indigo-500/20',
    glowColor: '#6366f1',
  },
  'ai-compute': {
    gradient: 'from-orange-500/20 to-amber-600/20',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    border: 'border-orange-500/30',
    shadow: 'shadow-orange-500/20',
    glowColor: '#f97316',
  },
  'ai-service': {
    gradient: 'from-cyan-500/20 to-sky-600/20',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',
    border: 'border-cyan-500/30',
    shadow: 'shadow-cyan-500/20',
    glowColor: '#06b6d4',
  },
};

// ============================================================
// Node Extensions
// ============================================================

/**
 * 코어 노드 확장 목록
 */
export const coreNodeExtensions: NodeExtension[] = [
  // ============================================================
  // Security Nodes
  // ============================================================
  {
    config: { id: 'firewall', name: 'Firewall', category: 'security', color: 'red', icon: '🔥' },
    categoryStyle: coreCategoryStyles.security,
  },
  {
    config: { id: 'waf', name: 'WAF', category: 'security', color: 'red', icon: '🛡️' },
  },
  {
    config: { id: 'ids-ips', name: 'IDS/IPS', category: 'security', color: 'red', icon: '👁️' },
  },
  {
    config: { id: 'vpn-gateway', name: 'VPN Gateway', category: 'security', color: 'red', icon: '🔐' },
  },
  {
    config: { id: 'nac', name: 'NAC', category: 'security', color: 'red', icon: '🚧' },
  },
  {
    config: { id: 'dlp', name: 'DLP', category: 'security', color: 'red', icon: '📋' },
  },

  // ============================================================
  // Network Nodes
  // ============================================================
  {
    config: { id: 'router', name: 'Router', category: 'network', color: 'blue', icon: '📡' },
    categoryStyle: coreCategoryStyles.network,
  },
  {
    config: { id: 'switch-l2', name: 'Switch L2', category: 'network', color: 'blue', icon: '🔀' },
  },
  {
    config: { id: 'switch-l3', name: 'Switch L3', category: 'network', color: 'blue', icon: '🔀' },
  },
  {
    config: { id: 'load-balancer', name: 'Load Balancer', category: 'network', color: 'blue', icon: '⚖️' },
  },
  {
    config: { id: 'sd-wan', name: 'SD-WAN', category: 'network', color: 'blue', icon: '🌐' },
  },
  {
    config: { id: 'dns', name: 'DNS', category: 'network', color: 'blue', icon: '📖' },
  },
  {
    config: { id: 'cdn', name: 'CDN', category: 'network', color: 'blue', icon: '🌍' },
  },

  // ============================================================
  // Compute Nodes
  // ============================================================
  {
    config: { id: 'web-server', name: 'Web Server', category: 'compute', color: 'green', icon: '🌐' },
    categoryStyle: coreCategoryStyles.compute,
  },
  {
    config: { id: 'app-server', name: 'App Server', category: 'compute', color: 'green', icon: '⚙️' },
  },
  {
    config: { id: 'db-server', name: 'DB Server', category: 'compute', color: 'green', icon: '🗄️' },
  },
  {
    config: { id: 'container', name: 'Container', category: 'compute', color: 'green', icon: '📦' },
  },
  {
    config: { id: 'vm', name: 'VM', category: 'compute', color: 'green', icon: '💻' },
  },
  {
    config: { id: 'kubernetes', name: 'Kubernetes', category: 'compute', color: 'green', icon: '☸️' },
  },

  // ============================================================
  // Cloud Nodes
  // ============================================================
  {
    config: { id: 'aws-vpc', name: 'AWS VPC', category: 'cloud', color: 'purple', icon: '☁️' },
    categoryStyle: coreCategoryStyles.cloud,
  },
  {
    config: { id: 'azure-vnet', name: 'Azure VNet', category: 'cloud', color: 'purple', icon: '☁️' },
  },
  {
    config: { id: 'gcp-network', name: 'GCP Network', category: 'cloud', color: 'purple', icon: '☁️' },
  },
  {
    config: { id: 'private-cloud', name: 'Private Cloud', category: 'cloud', color: 'purple', icon: '🏢' },
  },

  // ============================================================
  // Storage Nodes
  // ============================================================
  {
    config: { id: 'san-nas', name: 'SAN/NAS', category: 'storage', color: 'amber', icon: '💽' },
    categoryStyle: coreCategoryStyles.storage,
  },
  {
    config: { id: 'object-storage', name: 'Object Storage', category: 'storage', color: 'amber', icon: '📦' },
  },
  {
    config: { id: 'backup', name: 'Backup', category: 'storage', color: 'amber', icon: '💾' },
  },
  {
    config: { id: 'cache', name: 'Cache', category: 'storage', color: 'amber', icon: '⚡' },
  },
  {
    config: { id: 'storage', name: 'Storage', category: 'storage', color: 'amber', icon: '💾' },
  },

  // ============================================================
  // Auth Nodes
  // ============================================================
  {
    config: { id: 'ldap-ad', name: 'LDAP/AD', category: 'auth', color: 'pink', icon: '🔑' },
    categoryStyle: coreCategoryStyles.auth,
  },
  {
    config: { id: 'sso', name: 'SSO', category: 'auth', color: 'pink', icon: '🎫' },
  },
  {
    config: { id: 'mfa', name: 'MFA', category: 'auth', color: 'pink', icon: '📱' },
  },
  {
    config: { id: 'iam', name: 'IAM', category: 'auth', color: 'pink', icon: '👥' },
  },

  // ============================================================
  // External Nodes
  // ============================================================
  {
    config: { id: 'user', name: 'User', category: 'external', color: 'gray', icon: '👤' },
    categoryStyle: coreCategoryStyles.external,
  },
  {
    config: { id: 'internet', name: 'Internet', category: 'external', color: 'gray', icon: '🌏' },
  },

  // ============================================================
  // AI Compute Nodes
  // ============================================================
  {
    config: { id: 'gpu-server', name: 'GPU Server', category: 'ai-compute', color: 'orange', icon: '🖥️' },
    categoryStyle: coreCategoryStyles['ai-compute'],
  },
  {
    config: { id: 'ai-accelerator', name: 'AI Accelerator', category: 'ai-compute', color: 'orange', icon: '⚡' },
  },
  {
    config: { id: 'edge-device', name: 'Edge Device', category: 'ai-compute', color: 'orange', icon: '📱' },
  },
  {
    config: { id: 'mobile-device', name: 'Mobile Device', category: 'ai-compute', color: 'orange', icon: '📲' },
  },
  {
    config: { id: 'ai-cluster', name: 'AI Cluster', category: 'ai-compute', color: 'orange', icon: '🔧' },
  },
  {
    config: { id: 'model-registry', name: 'Model Registry', category: 'ai-compute', color: 'orange', icon: '📋' },
  },

  // ============================================================
  // AI Service Nodes
  // ============================================================
  {
    config: { id: 'inference-engine', name: 'Inference Engine', category: 'ai-service', color: 'cyan', icon: '🧠' },
    categoryStyle: coreCategoryStyles['ai-service'],
  },
  {
    config: { id: 'vector-db', name: 'Vector DB', category: 'ai-service', color: 'cyan', icon: '🔢' },
  },
  {
    config: { id: 'ai-gateway', name: 'AI Gateway', category: 'ai-service', color: 'cyan', icon: '🚪' },
  },
  {
    config: { id: 'ai-orchestrator', name: 'AI Orchestrator', category: 'ai-service', color: 'cyan', icon: '🎯' },
  },
  {
    config: { id: 'embedding-service', name: 'Embedding Service', category: 'ai-service', color: 'cyan', icon: '🔤' },
  },
  {
    config: { id: 'training-platform', name: 'Training Platform', category: 'ai-service', color: 'cyan', icon: '🎓' },
  },
  {
    config: { id: 'prompt-manager', name: 'Prompt Manager', category: 'ai-service', color: 'cyan', icon: '💬' },
  },
  {
    config: { id: 'ai-monitor', name: 'AI Monitor', category: 'ai-service', color: 'cyan', icon: '📊' },
  },

  // ============================================================
  // Zone
  // ============================================================
  {
    config: { id: 'zone', name: 'Zone', category: 'zone', color: 'gray', icon: '📦' },
    categoryStyle: coreCategoryStyles.zone,
  },
];

// ============================================================
// Parser Patterns
// ============================================================

/**
 * 코어 노드 타입 패턴
 */
export const coreNodeTypePatterns: NodeTypePattern[] = [
  // External
  { pattern: /user|사용자|유저|client|클라이언트/i, type: 'user', label: 'User', labelKo: '사용자' },
  { pattern: /internet|인터넷|외부망/i, type: 'internet', label: 'Internet', labelKo: '인터넷' },

  // Security - DMZ
  { pattern: /waf|웹방화벽|웹 ?애플리케이션 ?방화벽/i, type: 'waf', label: 'WAF', labelKo: '웹방화벽' },
  { pattern: /firewall|방화벽|fw(?!\w)/i, type: 'firewall', label: 'Firewall', labelKo: '방화벽' },
  { pattern: /ids|ips|침입.*탐지|침입.*방지|intrusion/i, type: 'ids-ips', label: 'IDS/IPS', labelKo: 'IDS/IPS' },
  { pattern: /vpn|가상사설망/i, type: 'vpn-gateway', label: 'VPN Gateway', labelKo: 'VPN 게이트웨이' },
  { pattern: /nac|네트워크.*접근.*제어/i, type: 'nac', label: 'NAC', labelKo: 'NAC' },
  { pattern: /dlp|데이터.*유출.*방지/i, type: 'dlp', label: 'DLP', labelKo: 'DLP' },

  // Network
  { pattern: /cdn|content.*delivery/i, type: 'cdn', label: 'CDN', labelKo: 'CDN' },
  { pattern: /load ?balancer|로드 ?밸런서|lb(?!\w)|부하분산/i, type: 'load-balancer', label: 'Load Balancer', labelKo: '로드밸런서' },
  { pattern: /router|라우터/i, type: 'router', label: 'Router', labelKo: '라우터' },
  { pattern: /switch.*l3|l3.*switch|레이어 ?3|스위치.*l3/i, type: 'switch-l3', label: 'L3 Switch', labelKo: 'L3 스위치' },
  { pattern: /switch|스위치/i, type: 'switch-l2', label: 'L2 Switch', labelKo: 'L2 스위치' },
  { pattern: /sd-?wan|software.*defined.*wan/i, type: 'sd-wan', label: 'SD-WAN', labelKo: 'SD-WAN' },
  { pattern: /dns|도메인.*네임/i, type: 'dns', label: 'DNS', labelKo: 'DNS' },

  // Compute
  { pattern: /web ?server|웹 ?서버/i, type: 'web-server', label: 'Web Server', labelKo: '웹서버' },
  { pattern: /app ?server|앱 ?서버|애플리케이션.*서버|was/i, type: 'app-server', label: 'App Server', labelKo: '앱서버' },
  { pattern: /db|database|데이터베이스|디비/i, type: 'db-server', label: 'Database', labelKo: '데이터베이스' },
  { pattern: /kubernetes|k8s|쿠버네티스/i, type: 'kubernetes', label: 'Kubernetes', labelKo: '쿠버네티스' },
  { pattern: /container|컨테이너|docker|도커/i, type: 'container', label: 'Container', labelKo: '컨테이너' },
  { pattern: /vm|virtual.*machine|가상.*머신|가상.*서버/i, type: 'vm', label: 'VM', labelKo: '가상머신' },

  // Cloud
  { pattern: /aws.*vpc|vpc.*aws/i, type: 'aws-vpc', label: 'AWS VPC', labelKo: 'AWS VPC' },
  { pattern: /azure.*vnet|vnet.*azure/i, type: 'azure-vnet', label: 'Azure VNet', labelKo: 'Azure VNet' },
  { pattern: /gcp|google.*cloud/i, type: 'gcp-network', label: 'GCP Network', labelKo: 'GCP 네트워크' },
  { pattern: /private.*cloud|사설.*클라우드/i, type: 'private-cloud', label: 'Private Cloud', labelKo: '프라이빗 클라우드' },

  // Storage
  { pattern: /san|nas|스토리지.*영역|네트워크.*스토리지/i, type: 'san-nas', label: 'SAN/NAS', labelKo: 'SAN/NAS' },
  { pattern: /object.*storage|오브젝트.*스토리지|s3/i, type: 'object-storage', label: 'Object Storage', labelKo: '오브젝트 스토리지' },
  { pattern: /backup|백업/i, type: 'backup', label: 'Backup', labelKo: '백업' },
  { pattern: /cache|캐시|redis|memcached/i, type: 'cache', label: 'Cache', labelKo: '캐시' },
  { pattern: /storage|스토리지|저장소/i, type: 'storage', label: 'Storage', labelKo: '스토리지' },

  // Auth
  { pattern: /ldap|ad|active.*directory|액티브.*디렉토리/i, type: 'ldap-ad', label: 'LDAP/AD', labelKo: 'LDAP/AD' },
  { pattern: /sso|single.*sign.*on|싱글.*사인온/i, type: 'sso', label: 'SSO', labelKo: 'SSO' },
  { pattern: /mfa|multi.*factor|다중.*인증/i, type: 'mfa', label: 'MFA', labelKo: 'MFA' },
  { pattern: /iam|identity.*access/i, type: 'iam', label: 'IAM', labelKo: 'IAM' },
];

/**
 * 코어 파서 확장
 */
export const coreParserExtension: ParserExtension = {
  patterns: coreNodeTypePatterns,
  priority: 0, // 기본 우선순위
};

// ============================================================
// Core Plugin Definition
// ============================================================

/**
 * InfraFlow 코어 플러그인
 *
 * 기본 인프라 컴포넌트와 파서 패턴을 제공
 */
export const corePlugin: InfraFlowPlugin = {
  metadata: {
    id: 'core',
    name: 'InfraFlow Core',
    version: '1.0.0',
    author: 'InfraFlow Team',
    description: 'Built-in infrastructure components and patterns',
    license: 'MIT',
  },

  nodes: coreNodeExtensions,

  parsers: coreParserExtension,

  // 라이프사이클 훅
  onLoad: async () => {
    log.info('Core plugin loaded');
  },

  onUnload: async () => {
    log.info('Core plugin unloaded');
  },
};

/**
 * 기본 내보내기
 */
export default corePlugin;
