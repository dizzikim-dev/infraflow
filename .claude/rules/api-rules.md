---
paths:
  - "src/app/api/**/*.ts"
---

# API Route Rules

- CSRF Origin 헤더 체크 필수
- Rate limiter 적용 필수
- Prisma model 접근 시 `ALLOWED_MODELS` 화이트리스트 확인
- 모든 사용자 입력은 서버사이드에서 검증
- API 응답은 일관된 형식 사용: `{ success: boolean, data?: T, error?: string }`
- 민감한 데이터 (비밀번호, 토큰) 로깅 금지
- 에러 응답에 내부 구현 세부사항 노출 금지
