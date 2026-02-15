---
paths:
  - "src/lib/knowledge/**/*.ts"
---

# Knowledge Module Rules

- 새 source 추가 시 `sourceRegistry`에 등록 필수
- relationship 추가 시 양방향 확인 (A→B이면 B→A도 존재)
- test 파일 필수 동반 (`__tests__/` 디렉토리)
- knowledge 데이터 변경 시 버전 번호 증가
- 순환 참조 방지 확인
