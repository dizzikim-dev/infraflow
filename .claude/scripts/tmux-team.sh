#!/bin/bash
# InfraFlow 팀 에이전트 tmux 세션 스크립트

SESSION="infraflow-team"
PROJECT_DIR="/Users/hyunkikim/dev/infraflow"

# 기존 세션이 있으면 종료
tmux has-session -t $SESSION 2>/dev/null
if [ $? -eq 0 ]; then
    echo "기존 세션 종료 중..."
    tmux kill-session -t $SESSION
fi

# 새 세션 생성
cd $PROJECT_DIR
tmux new-session -d -s $SESSION -n "main"

# Window 0: Main (전체 작업)
tmux send-keys -t $SESSION:0 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION:0 "clear" C-m
tmux send-keys -t $SESSION:0 "echo '=== Main Session: 전체 조율 ===' && echo ''" C-m
tmux send-keys -t $SESSION:0 "# /plan [기능] 으로 작업 시작" C-m

# Window 1: Frontend Agent
tmux new-window -t $SESSION:1 -n "frontend"
tmux send-keys -t $SESSION:1 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION:1 "clear" C-m
tmux send-keys -t $SESSION:1 "echo '=== Frontend Agent: React/UI 작업 ===' && echo ''" C-m
tmux send-keys -t $SESSION:1 "# 작업: src/components/, src/hooks/" C-m

# Window 2: Backend Agent
tmux new-window -t $SESSION:2 -n "backend"
tmux send-keys -t $SESSION:2 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION:2 "clear" C-m
tmux send-keys -t $SESSION:2 "echo '=== Backend Agent: Parser/Logic 작업 ===' && echo ''" C-m
tmux send-keys -t $SESSION:2 "# 작업: src/lib/parser/, src/lib/data/" C-m

# Window 3: Test/QA Agent
tmux new-window -t $SESSION:3 -n "test"
tmux send-keys -t $SESSION:3 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION:3 "clear" C-m
tmux send-keys -t $SESSION:3 "echo '=== Test Agent: 테스트 작성/실행 ===' && echo ''" C-m
tmux send-keys -t $SESSION:3 "# npx vitest run --watch" C-m

# Window 4: Review Agent
tmux new-window -t $SESSION:4 -n "review"
tmux send-keys -t $SESSION:4 "cd $PROJECT_DIR" C-m
tmux send-keys -t $SESSION:4 "clear" C-m
tmux send-keys -t $SESSION:4 "echo '=== Review Agent: 코드 리뷰 ===' && echo ''" C-m
tmux send-keys -t $SESSION:4 "# @pessimist, @optimist, @security-reviewer 사용" C-m

# Window 0으로 돌아가기
tmux select-window -t $SESSION:0

echo ""
echo "✅ tmux 세션 '$SESSION' 생성 완료"
echo ""
echo "사용법:"
echo "  tmux attach -t $SESSION    # 세션 접속"
echo ""
echo "tmux 단축키:"
echo "  Ctrl+b 0~4    # 윈도우 전환"
echo "  Ctrl+b c      # 새 윈도우"
echo "  Ctrl+b ,      # 윈도우 이름 변경"
echo "  Ctrl+b d      # 세션 분리 (detach)"
echo "  Ctrl+b [      # 스크롤 모드 (q로 종료)"
echo ""
echo "각 윈도우에서 Claude Code 실행:"
echo "  claude code chat"
echo ""

# 자동 접속
tmux attach -t $SESSION
