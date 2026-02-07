# Infrastructure Data Management Rules

> **규칙 ID**: `INFRA-DATA`
> **적용 범위**: 인프라 장비/솔루션 데이터
> **우선순위**: High

---

## 1. 데이터 무결성 규칙

### INFRA-DATA-001: 타입 정의 필수

**규칙**: 모든 장비는 `src/types/infra.ts`에 타입이 정의되어야 합니다.

```typescript
// 올바른 예
export type SecurityNodeType =
  | 'firewall'
  | 'waf'
  | 'new-security-device'; // 새 장비 추가

// 잘못된 예: 타입 없이 데이터만 추가
infrastructureDB['undefined-device'] = { ... }; // ERROR!
```

**위반 시**: TypeScript 컴파일 오류 발생

---

### INFRA-DATA-002: 데이터베이스 완전성

**규칙**: `infrastructureDB`의 모든 항목은 필수 필드를 포함해야 합니다.

**필수 필드**:
- `id`: 고유 식별자
- `name`: 영문명
- `nameKo`: 한국어명
- `category`: 카테고리
- `description`: 영문 설명
- `descriptionKo`: 한국어 설명
- `functions`: 기능 목록 (최소 3개)
- `functionsKo`: 한국어 기능 목록 (최소 3개)
- `features`: 특징 목록 (최소 2개)
- `featuresKo`: 한국어 특징 목록 (최소 2개)
- `recommendedPolicies`: 권장 정책 (최소 2개)
- `tier`: 티어 위치

**위반 시**: 렌더링 오류 또는 불완전한 정보 표시

---

### INFRA-DATA-003: 파싱 패턴 등록

**규칙**: 모든 장비는 `patterns.ts`에 파싱 패턴이 등록되어야 합니다.

```typescript
// 올바른 예
{
  pattern: /firewall|방화벽|fw(?!\w)/i,
  type: 'firewall',
  label: 'Firewall',
  labelKo: '방화벽'
},

// 패턴 작성 규칙
// - 영문 키워드 필수
// - 한국어 키워드 권장
// - 대소문자 무시 (i 플래그)
// - 약어 처리 시 단어 경계 확인 (?!\w)
```

**위반 시**: 자연어 입력에서 해당 장비 인식 실패

---

### INFRA-DATA-004: 4-파일 동기화 규칙

**규칙**: 장비 변경 시 반드시 4개 파일을 동시에 수정해야 합니다.

| 순서 | 파일 | 작업 |
|------|------|------|
| 1 | `src/types/infra.ts` | 타입 추가/수정/삭제 |
| 2 | `src/lib/data/infrastructureDB.ts` | 데이터 추가/수정/삭제 |
| 3 | `src/lib/parser/patterns.ts` | 패턴 추가/수정/삭제 |
| 4 | `docs/INFRASTRUCTURE_COMPONENTS.md` | 문서 업데이트 |

**위반 시**: 데이터 불일치로 인한 런타임 오류

---

## 2. 네이밍 규칙

### INFRA-DATA-005: ID 네이밍

**규칙**: 장비 ID는 다음 규칙을 따릅니다.

```
형식: [영문소문자]-[영문소문자]
예시: load-balancer, web-server, ids-ips
```

**제약 사항**:
- `kebab-case` 사용
- 영문 소문자만 사용
- 하이픈으로 단어 구분
- 최대 20자
- 숫자는 뒤에만 허용 (예: `switch-l2`)

```typescript
// 올바른 예
'load-balancer'
'web-server'
'switch-l2'
'ids-ips'

// 잘못된 예
'LoadBalancer'    // camelCase 금지
'web_server'      // underscore 금지
'웹서버'          // 한국어 금지
'LB'              // 너무 짧음
```

---

### INFRA-DATA-006: 한/영 이중 언어

**규칙**: 모든 텍스트 필드는 영문(`field`)과 한국어(`fieldKo`) 쌍으로 제공합니다.

```typescript
// 올바른 예
{
  name: 'Firewall',
  nameKo: '방화벽',
  description: 'Network security device...',
  descriptionKo: '네트워크 보안 장치...',
  functions: ['Packet filtering', ...],
  functionsKo: ['패킷 필터링', ...],
}
```

**위반 시**: UI에서 번역 누락 표시

---

## 3. 카테고리 규칙

### INFRA-DATA-007: 카테고리 분류

**규칙**: 장비는 정확한 카테고리에 분류되어야 합니다.

| 카테고리 | 포함 장비 유형 |
|----------|---------------|
| `security` | 보안 장비: 방화벽, WAF, IDS/IPS, VPN, NAC, DLP |
| `network` | 네트워크 장비: 라우터, 스위치, LB, DNS, CDN, SD-WAN |
| `compute` | 컴퓨팅: 서버, 컨테이너, VM, K8s |
| `cloud` | 클라우드: AWS/Azure/GCP VPC, Private Cloud |
| `storage` | 스토리지: SAN/NAS, 오브젝트, 캐시, 백업 |
| `auth` | 인증: LDAP/AD, SSO, MFA, IAM |
| `external` | 외부: 사용자, 인터넷 |

---

### INFRA-DATA-008: 티어 배치

**규칙**: 카테고리에 따라 허용된 티어에만 배치합니다.

| 카테고리 | 허용 티어 | 설명 |
|----------|----------|------|
| `security` | dmz, internal | 보안 장비는 DMZ 또는 내부망 |
| `network` | external, dmz, internal | 네트워크는 모든 위치 가능 |
| `compute` | dmz, internal, data | 컴퓨팅은 외부 제외 |
| `cloud` | internal | 클라우드 VPC는 내부망 |
| `storage` | internal, data | 스토리지는 내부망 또는 데이터 티어 |
| `auth` | internal | 인증은 내부망 |
| `external` | external | 외부 요소는 외부 티어 |

---

## 4. 정책 규칙

### INFRA-DATA-009: 권장 정책 품질

**규칙**: 각 장비는 최소 2개의 권장 정책을 포함해야 하며, 다음 형식을 따릅니다.

```typescript
{
  name: 'Default Deny',           // 영문명
  nameKo: '기본 차단 정책',       // 한국어명
  description: 'Block all...',    // 설명
  priority: 'critical',           // 우선순위: critical|high|medium|low
  category: 'access'              // 분류: access|security|monitoring|compliance|performance
}
```

**우선순위 가이드**:
- `critical`: 보안 필수 사항, 미적용 시 심각한 위험
- `high`: 강력 권장, 일반적인 보안 요구사항
- `medium`: 권장, 추가 보안 강화
- `low`: 선택적, 모범 사례

---

## 5. 내보내기 규칙

### INFRA-DATA-010: 내보내기 매핑

**규칙**: 모든 장비는 최소 하나의 내보내기 형식에 매핑되어야 합니다.

| 파일 | 용도 | 필수 여부 |
|------|------|----------|
| `terraformExport.ts` | Terraform HCL 생성 | 권장 |
| `kubernetesExport.ts` | K8s YAML 생성 | 권장 |
| `plantUMLExport.ts` | PlantUML 다이어그램 | 필수 |

```typescript
// plantUMLExport.ts 예시
const c4ElementMap: Record<InfraNodeType, {...}> = {
  'new-device': { stereotype: 'Security', shape: 'Container' },
  // ...
};
```

**위반 시**: 내보내기 시 해당 장비 누락

---

## 6. 문서화 규칙

### INFRA-DATA-011: 문서 동기화

**규칙**: `docs/INFRASTRUCTURE_COMPONENTS.md`는 코드와 항상 동기화되어야 합니다.

**업데이트 시점**:
- 장비 추가 시: 해당 카테고리 섹션에 추가
- 장비 수정 시: 해당 정보 업데이트
- 장비 삭제 시: 문서에서 제거
- 변경 이력 섹션 업데이트 필수

---

### INFRA-DATA-012: 변경 이력 기록

**규칙**: 모든 변경은 문서의 변경 이력에 기록합니다.

```markdown
## 12. 변경 이력

| 날짜 | 버전 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 2026-02-06 | 1.0.0 | Claude | 초기 문서 작성 |
| 2026-02-07 | 1.1.0 | Claude | SIEM 장비 추가 |
```

---

## 7. 검증 체크리스트

### 장비 추가 시 체크리스트

- [ ] `infra.ts`에 타입 추가됨
- [ ] `infrastructureDB.ts`에 데이터 추가됨
- [ ] 모든 필수 필드 포함됨
- [ ] 한/영 이중 언어 완료
- [ ] `patterns.ts`에 파싱 패턴 추가됨
- [ ] 내보내기 파일에 매핑 추가됨
- [ ] 문서 업데이트됨
- [ ] 변경 이력 추가됨
- [ ] TypeScript 빌드 성공
- [ ] 테스트 통과

### 장비 수정 시 체크리스트

- [ ] 데이터 수정됨
- [ ] 문서 업데이트됨
- [ ] 변경 이력 추가됨
- [ ] TypeScript 빌드 성공
- [ ] 테스트 통과

### 장비 삭제 시 체크리스트

- [ ] 참조 확인 (다른 파일에서 사용 여부)
- [ ] 내보내기 매핑 삭제됨
- [ ] 파싱 패턴 삭제됨
- [ ] 데이터베이스에서 삭제됨
- [ ] 타입 정의에서 삭제됨
- [ ] 문서에서 삭제됨
- [ ] 변경 이력 추가됨
- [ ] TypeScript 빌드 성공
- [ ] 테스트 통과

---

## 8. 위반 대응

| 규칙 위반 | 심각도 | 대응 |
|----------|--------|------|
| 타입 미정의 | Critical | 즉시 타입 추가 |
| 필수 필드 누락 | High | 누락 필드 추가 |
| 파싱 패턴 누락 | Medium | 패턴 추가 |
| 문서 불일치 | Medium | 문서 동기화 |
| 네이밍 규칙 위반 | Low | ID 수정 |
| 내보내기 누락 | Low | 매핑 추가 |

---

*이 규칙은 InfraFlow 인프라 데이터의 품질과 일관성을 보장하기 위해 적용됩니다.*
