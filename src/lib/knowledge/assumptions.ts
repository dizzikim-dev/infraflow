/**
 * Required Assumptions per node type / category.
 *
 * Each definition maps to a question that should be asked
 * if not already answered by the project profile.
 */

export interface AssumptionDef {
  key: string;
  label: string;
  labelKo: string;
  priority: 'required' | 'optional';
  /** Profile field that answers this assumption (for auto-fill) */
  profileField?: string;
}

export const REQUIRED_ASSUMPTIONS: Record<string, AssumptionDef[]> = {
  'db-server': [
    { key: 'rpo', label: 'RPO (Recovery Point)', labelKo: 'RPO (복구 시점 목표)', priority: 'required' },
    { key: 'rto', label: 'RTO (Recovery Time)', labelKo: 'RTO (복구 시간 목표)', priority: 'required' },
    { key: 'pii', label: 'Contains PII?', labelKo: '개인정보 포함 여부', priority: 'required', profileField: 'dataClassification' },
    { key: 'writeRatio', label: 'Write/read ratio', labelKo: '쓰기/읽기 비율', priority: 'optional' },
    { key: 'encryptionAtRest', label: 'Encryption at rest', labelKo: '저장 암호화 필요', priority: 'optional' },
  ],
  'waf': [
    { key: 'trafficRegion', label: 'Traffic region', labelKo: '트래픽 유입 지역', priority: 'required' },
    { key: 'compliance', label: 'Compliance framework', labelKo: '적용 컴플라이언스', priority: 'required', profileField: 'regulations' },
    { key: 'threatModel', label: 'Threat model', labelKo: '위협 모델', priority: 'optional' },
  ],
  'firewall': [
    { key: 'compliance', label: 'Compliance framework', labelKo: '적용 컴플라이언스', priority: 'required', profileField: 'regulations' },
    { key: 'throughput', label: 'Expected throughput', labelKo: '예상 처리량', priority: 'optional' },
  ],
  'load-balancer': [
    { key: 'peakQps', label: 'Peak QPS', labelKo: '피크 초당 요청 수', priority: 'required' },
    { key: 'stickySession', label: 'Sticky sessions?', labelKo: '세션 고정 필요', priority: 'optional' },
    { key: 'sla', label: 'SLA target', labelKo: 'SLA 목표', priority: 'required', profileField: 'slaTarget' },
  ],
  'kubernetes': [
    { key: 'clusterSize', label: 'Cluster size', labelKo: '클러스터 규모', priority: 'required' },
    { key: 'multiTenant', label: 'Multi-tenancy?', labelKo: '멀티테넌시 필요', priority: 'optional' },
  ],
  'vpn-gateway': [
    { key: 'userCount', label: 'Concurrent users', labelKo: '동시 접속 사용자 수', priority: 'required' },
    { key: 'siteToSite', label: 'Site-to-site?', labelKo: '사이트 간 연결 필요', priority: 'required' },
  ],
  'gpu-server': [
    { key: 'workloadType', label: 'Training or inference?', labelKo: '학습용/추론용', priority: 'required' },
    { key: 'modelSize', label: 'Model size (params)', labelKo: '모델 크기 (파라미터)', priority: 'required' },
    { key: 'batchSize', label: 'Batch size', labelKo: '배치 크기', priority: 'optional' },
  ],
  'vector-db': [
    { key: 'documentCount', label: 'Document count', labelKo: '문서 수', priority: 'required' },
    { key: 'queryLatency', label: 'Query latency SLA', labelKo: '쿼리 지연 SLA', priority: 'optional' },
  ],
};
