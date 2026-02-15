# InfraFlow 팀 에이전트 워크플로우

## 방법 1: Claude Code 내장 Agent Teams (자동 병렬)

### 활성화 확인
```bash
# 이미 설정되어 있음
cat .claude/settings.json | grep AGENT_TEAMS
# → "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
```

### 사용 예시

```bash
# 1. 팀 리뷰 실행
/team-review src/lib/parser/

# 내부적으로 병렬 실행:
# - @security-reviewer: 보안 취약점 검사
# - Performance Analyst: N+1 쿼리, 메모리 누수 검토
# - Test Validator: 테스트 커버리지 확인

# 2. 병렬 개발 (Parallel skill 사용)
/parallel 새로운 Firewall 노드 추가

# 분배:
# - Agent A: FirewallNode.tsx 컴포넌트
# - Agent B: patterns.ts 파싱 패턴
# - Agent C: firewall.test.ts 테스트
```

---

## 방법 2: tmux 수동 병렬 세션 (고급 사용자)

### 세션 시작

```bash
# tmux 세션 실행
./.claude/scripts/tmux-team.sh
```

### 세션 구조

```
┌─────────────────────────────────────────────────────────────┐
│  infraflow-team (tmux 세션)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [0:main]      전체 조율 (계획 수립)                        │
│  [1:frontend]  React/UI 작업                                │
│  [2:backend]   Parser/Logic 작업                            │
│  [3:test]      테스트 작성/실행                             │
│  [4:review]    코드 리뷰                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### tmux 단축키

| 키 | 동작 |
|----|------|
| `Ctrl+b 0~4` | 윈도우 0~4로 전환 |
| `Ctrl+b c` | 새 윈도우 생성 |
| `Ctrl+b ,` | 윈도우 이름 변경 |
| `Ctrl+b d` | 세션 분리 (detach) |
| `Ctrl+b [` | 스크롤 모드 (q로 종료) |
| `Ctrl+b "` | 가로 분할 |
| `Ctrl+b %` | 세로 분할 |
| `Ctrl+b 방향키` | 패널 이동 |

### 워크플로우 예시

#### 1. 새 기능 개발 (Frontend + Backend 병렬)

```bash
# [0:main] 윈도우에서
/plan WAF 노드 추가

# [1:frontend] 윈도우에서
claude code chat
# → 프롬프트: "WafNode.tsx 컴포넌트 생성, 디자인 시스템 준수"

# [2:backend] 윈도우에서
claude code chat
# → 프롬프트: "WAF 파싱 패턴 추가, infrastructureDB에 데이터 추가"

# [3:test] 윈도우에서
npx vitest run --watch
# 실시간 테스트 모니터링

# [4:review] 윈도우에서
claude code chat
# → 프롬프트: "@security-reviewer WAF 구현 보안 검토"
```

#### 2. 버그 수정 (디버깅 + 리뷰)

```bash
# [0:main] 윈도우에서
/debug 파싱 오류

# [2:backend] 윈도우에서
# 디버깅 작업 수행

# [3:test] 윈도우에서
# 회귀 테스트 작성

# [4:review] 윈도우에서
@pessimist
# 수정 사항 리스크 분석
```

---

## 권장 워크플로우 비교

| 시나리오 | 권장 방법 | 이유 |
|----------|----------|------|
| 단일 큰 작업 | 내장 Agent Teams | 자동 병렬, 결과 통합 |
| 독립적인 여러 작업 | tmux 수동 | 각 작업을 별도 컨텍스트로 관리 |
| 코드 리뷰 | `/team-review` | 자동화된 multi-agent 리뷰 |
| 긴 작업 모니터링 | tmux | 백그라운드 실행, 재접속 가능 |
| 테스트 watch 모드 | tmux | 별도 윈도우에서 실시간 모니터링 |

---

## 실전 예시: 새 기능 개발

### 1단계: 계획 수립 (main 윈도우)

```bash
# tmux 세션 시작
./.claude/scripts/tmux-team.sh

# [0:main] 윈도우에서
claude code chat
# 프롬프트: "/plan VPN Gateway 노드 추가"
```

### 2단계: 병렬 개발

```bash
# Ctrl+b 1 (frontend 윈도우로 전환)
claude code chat
# 프롬프트: "VpnGatewayNode.tsx 컴포넌트 생성, /tdd 적용"

# Ctrl+b 2 (backend 윈도우로 전환)
claude code chat
# 프롬프트: "@infra-data VPN Gateway 장비 추가"

# Ctrl+b 3 (test 윈도우로 전환)
npx vitest run --watch
```

### 3단계: 통합 & 리뷰

```bash
# Ctrl+b 4 (review 윈도우로 전환)
claude code chat
# 프롬프트: "/team-review src/components/nodes/VpnGatewayNode.tsx"

# 검증
npx tsc --noEmit && npx vitest run
```

### 4단계: 커밋

```bash
# [0:main] 윈도우로 돌아가기 (Ctrl+b 0)
git add .
git commit -m "feat: add VPN Gateway node component"
```

---

## 세션 관리

```bash
# 세션 분리 (작업 계속 실행)
Ctrl+b d

# 나중에 재접속
tmux attach -t infraflow-team

# 세션 목록 확인
tmux ls

# 세션 종료
tmux kill-session -t infraflow-team
```

---

## Tips

1. **각 윈도우는 독립적인 Claude Code 세션**
   - 컨텍스트가 분리되어 있어 충돌 없음
   - 각 세션에서 다른 파일 작업 가능

2. **Test 윈도우 활용**
   - `npx vitest run --watch` 실행해두면 실시간 피드백
   - 다른 윈도우에서 코드 수정 시 자동 테스트

3. **Review 윈도우 활용**
   - 작업 중간중간 `@pessimist`, `@security-reviewer` 실행
   - 문제 조기 발견

4. **Main 윈도우는 조율자**
   - 전체 계획 관리
   - 최종 통합 및 커밋

5. **세션 이름 커스터마이즈**
   - 여러 기능 동시 개발 시: `infraflow-feature-a`, `infraflow-feature-b`
