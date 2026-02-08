# Agent Prompts

이 디렉토리에는 프로젝트에서 사용하는 에이전트별 프롬프트 템플릿이 포함되어 있습니다.

## 사용법

각 에이전트 프롬프트 파일을 참조하여 일관된 작업을 수행합니다.

```
agents/
├── architecture.md    # 아키텍처 설계 에이전트
├── security.md        # 보안 분석 에이전트
├── tech-review.md     # 기술 검토 에이전트
├── document.md        # 문서/시각화 에이전트
├── meeting.md         # 미팅 준비 에이전트
└── isp-alignment.md   # ISP 정합성 에이전트
```

## 에이전트 호출 예시

Claude에게 다음과 같이 요청하면 해당 에이전트 역할로 작업합니다:

- `@Architecture: VDI 아키텍처 설계해줘`
- `@Security: 보안 위협 분석해줘`
- `@TechReview: OpenClaw 기술 검토해줘`
- `@Document: 인포그래픽 만들어줘`
- `@Meeting: 미팅 아젠다 준비해줘`
- `@ISP: ISP 정합성 확인해줘`


# Agent Prompts

이 디렉토리에는 프로젝트에서 사용하는 에이전트별 프롬프트 템플릿이 포함되어 있습니다.

## 에이전트 목록

```
agents/
├── README.md              # 이 파일
│
├── # 설계/분석 에이전트
├── architecture.md        # 아키텍처 설계
├── security.md            # 보안 분석
├── tech-review.md         # 기술 검토
│
├── # 문서/커뮤니케이션 에이전트
├── document.md            # 문서/시각화
├── meeting.md             # 미팅 준비
├── isp-alignment.md       # ISP 정합성
│
├── # 피드백 & 개선 에이전트
├── pessimist.md           # 비관적 검토
├── optimist.md            # 낙관적 검토
├── feedback-analyzer.md   # 피드백 종합 분석
└── planner.md             # 실행 계획 수립
```

## 에이전트 호출 방법

Claude에게 다음과 같이 요청하면 해당 에이전트 역할로 작업합니다:

### 설계/분석
```
@Architecture: VDI 아키텍처 설계해줘
@Security: 보안 위협 분석해줘
@TechReview: OpenClaw 기술 검토해줘
```

### 문서/커뮤니케이션
```
@Document: 인포그래픽 만들어줘
@Meeting: 미팅 아젠다 준비해줘
@ISP: ISP 정합성 확인해줘
```

### 피드백 & 개선
```
@Pessimist: 리스크 분석해줘
@Optimist: 기회 분석해줘
@FeedbackAnalyzer: 피드백 종합해줘
@Planner: PR 단위 계획 세워줘
```

## 피드백 워크플로우

전체 피드백 프로세스를 실행하려면:

```
@Feedback: 현재 아키텍처 검토하고 개선 계획 세워줘
```

워크플로우 순서:
1. `@Pessimist` - 리스크/문제점 분석
2. `@Optimist` - 기회/장점 분석
3. `@FeedbackAnalyzer` - 종합 분석 및 우선순위화
4. `@Planner` - PR 단위 실행 계획 수립
5. 문서화 - `reports/` 디렉토리에 리포트 저장

## 에이전트 상세 설명

| 에이전트 | 역할 | 출력물 |
|---------|------|--------|
| **Architecture** | 시스템/네트워크 구조 설계 | 아키텍처 다이어그램, 명세 |
| **Security** | 보안 분석, 위협 모델링 | 5계층 보안 분석, 리스크 레지스터 |
| **Tech Review** | 기술 스택 검토, 비교 | 기술 비교표, PoC 범위 |
| **Document** | 제안서, 시각화 자료 | 마크다운, HTML 인포그래픽 |
| **Meeting** | 미팅 준비, 회의록 | 아젠다, 질문 리스트, 브리핑 |
| **ISP Alignment** | ISP 정합성 검토 | 정합성 분석, 인용 근거 |
| **Pessimist** | 비관적 관점 분석 | 리스크 목록, 최악 시나리오 |
| **Optimist** | 낙관적 관점 분석 | 기회 목록, 최선 시나리오 |
| **Feedback Analyzer** | 피드백 종합 분석 | 우선순위, 의존성 맵 |
| **Planner** | 실행 계획 수립 | PR 목록, 병렬 스트림, 마일스톤 |

## 피드백 리포트 저장

피드백 분석 결과는 `reports/` 디렉토리에 저장합니다:

```
reports/
├── TEMPLATE_feedback_report.md           # 템플릿
├── 2026-02-04_architecture_feedback.md   # 실제 리포트
└── ...
```

파일 명명 규칙: `{YYYY-MM-DD}_{주제}_feedback.md`

## 관련 문서

- `/.claude/CLAUDE.md` - 프로젝트 규칙 및 컨텍스트
- `/reports/` - 피드백 리포트 저장소
