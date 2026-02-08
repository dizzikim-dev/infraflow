# Verification Before Completion Skill

## Overview
작업 완료 전 체계적인 검증을 수행합니다.

## Activation
- `/verify` 명령으로 활성화
- 작업 완료 선언 전 자동 실행

## Verification Checklist

### 1. 코드 품질
```
□ 모든 테스트 통과
  $ npm test
  $ npm run test:e2e

□ 타입 에러 없음
  $ npm run type-check

□ 린트 에러 없음
  $ npm run lint

□ 빌드 성공
  $ npm run build
```

### 2. 기능 검증
```
□ 요구사항 충족 확인
  - [ ] 기능 1: [상태]
  - [ ] 기능 2: [상태]
  - [ ] 기능 3: [상태]

□ 엣지 케이스 테스트
  - [ ] 빈 입력
  - [ ] 최대 입력
  - [ ] 잘못된 형식

□ 에러 처리 확인
  - [ ] 에러 메시지 명확
  - [ ] 복구 가능
```

### 3. 성능 검증
```
□ 성능 기준 충족
  - [ ] 응답 시간: < [X]ms
  - [ ] 메모리 사용: < [Y]MB
  - [ ] CPU 사용: < [Z]%

□ 대용량 데이터 테스트
  - [ ] 100개 항목
  - [ ] 1000개 항목
```

### 4. 보안 검증
```
□ 입력 검증
  - [ ] XSS 방지
  - [ ] SQL 인젝션 방지
  - [ ] CSRF 토큰 확인

□ 인증/인가
  - [ ] 권한 확인
  - [ ] 세션 관리
```

### 5. 문서 검증
```
□ 코드 문서화
  - [ ] 복잡한 로직 주석
  - [ ] 공개 API 문서

□ 사용자 문서
  - [ ] README 업데이트
  - [ ] 변경사항 기록
```

## InfraFlow 적용

### 검증 스크립트
```bash
#!/bin/bash
# verify.sh

echo "=== InfraFlow Verification ==="

echo "\n[1/5] Type Check..."
npm run type-check || exit 1

echo "\n[2/5] Lint..."
npm run lint || exit 1

echo "\n[3/5] Unit Tests..."
npm test || exit 1

echo "\n[4/5] Build..."
npm run build || exit 1

echo "\n[5/5] E2E Tests..."
npm run test:e2e || exit 1

echo "\n✅ All verifications passed!"
```

### 기능별 검증

#### 파서 검증
```typescript
// 파서 검증 체크리스트
const parserVerification = {
  '기본 파싱': [
    '3티어 아키텍처',
    'VDI 인프라',
    '방화벽 추가'
  ],
  '복합 파싱': [
    '3티어에 WAF랑 CDN 붙여줘',
    'DB 이중화 구성'
  ],
  '엣지 케이스': [
    '',           // 빈 문자열
    '   ',        // 공백만
    'asdfasdf'    // 무의미한 입력
  ]
};
```

#### 렌더링 검증
```typescript
// 렌더링 검증 체크리스트
const renderVerification = {
  '노드 렌더링': [
    '모든 노드 타입 표시',
    '올바른 위치',
    '올바른 스타일'
  ],
  '엣지 렌더링': [
    '연결선 표시',
    '방향 표시',
    '레이블 표시'
  ],
  '인터랙션': [
    '드래그 앤 드롭',
    '줌 인/아웃',
    '노드 선택'
  ]
};
```

#### 애니메이션 검증
```typescript
// 애니메이션 검증 체크리스트
const animationVerification = {
  '기본 동작': [
    '재생/일시정지',
    '속도 조절',
    '리셋'
  ],
  '성능': [
    '60fps 유지 (10노드)',
    '메모리 누수 없음'
  ]
};
```

## Verification Report Template

```markdown
# Verification Report

## Summary
- **Date**: YYYY-MM-DD
- **Feature**: [기능명]
- **Status**: ✅ PASSED / ❌ FAILED

## Results

### Code Quality
| Check | Status | Notes |
|-------|--------|-------|
| Tests | ✅ | 45/45 passed |
| Types | ✅ | No errors |
| Lint | ✅ | No warnings |
| Build | ✅ | 2.3s |

### Functionality
| Requirement | Status | Notes |
|-------------|--------|-------|
| 요구사항 1 | ✅ | 동작 확인 |
| 요구사항 2 | ✅ | 동작 확인 |

### Performance
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Response | <100ms | 45ms | ✅ |
| Memory | <50MB | 32MB | ✅ |

### Issues Found
- None

## Approval
- [ ] Ready for merge
```

## Rules

### MUST DO
- 모든 테스트 실행
- 빌드 성공 확인
- 성능 기준 확인
- 문서 업데이트 확인

### MUST NOT
- 실패한 테스트 무시
- 경고 무시
- 수동 테스트만 의존
- 검증 없이 완료 선언
