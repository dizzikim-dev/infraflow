# InfraFlow Team Agent Workflow

## Method 1: Built-in Agent Teams (Auto-Parallel)

### Activation Check
```bash
# Already configured
cat .claude/settings.json | grep AGENT_TEAMS
# → "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
```

### Usage Examples

```bash
# 1. Team review
/team-review src/lib/parser/

# Runs in parallel:
# - @security-reviewer: Security vulnerability scan
# - Performance Analyst: N+1 queries, memory leaks
# - Test Validator: Test coverage check

# 2. Parallel development
/parallel Add new Firewall node

# Distributes:
# - Agent A: FirewallNode.tsx component
# - Agent B: patterns.ts parsing pattern
# - Agent C: firewall.test.ts tests
```

---

## Method 2: tmux Manual Parallel Sessions (Advanced)

### Start Session

```bash
./.claude/scripts/tmux-team.sh
```

### Session Structure

```
┌─────────────────────────────────────────────────────────────┐
│  infraflow-team (tmux session)                               │
├─────────────────────────────────────────────────────────────┤
│  [0:main]      Orchestration (planning)                      │
│  [1:frontend]  React/UI work                                 │
│  [2:backend]   Parser/Logic work                             │
│  [3:test]      Test writing/running                          │
│  [4:review]    Code review                                   │
└─────────────────────────────────────────────────────────────┘
```

### tmux Shortcuts

| Key | Action |
|----|--------|
| `Ctrl+b 0~4` | Switch to window 0~4 |
| `Ctrl+b c` | Create new window |
| `Ctrl+b ,` | Rename window |
| `Ctrl+b d` | Detach session |
| `Ctrl+b [` | Scroll mode (q to exit) |
| `Ctrl+b "` | Horizontal split |
| `Ctrl+b %` | Vertical split |
| `Ctrl+b arrow` | Move between panes |

### Session Management

```bash
# Detach (keeps running)
Ctrl+b d

# Reattach later
tmux attach -t infraflow-team

# List sessions
tmux ls

# Kill session
tmux kill-session -t infraflow-team
```

## Recommended Workflow

| Scenario | Method | Reason |
|----------|--------|--------|
| Single large task | Built-in Agent Teams | Auto-parallel, integrated results |
| Multiple independent tasks | tmux manual | Separate context per task |
| Code review | `/team-review` | Automated multi-agent review |
| Long task monitoring | tmux | Background execution, reattachable |
| Test watch mode | tmux | Real-time monitoring in separate window |

## Tips

1. **Each window is an independent Claude Code session** — no context conflicts
2. **Test window**: Run `npx vitest run --watch` for real-time feedback
3. **Review window**: Run `@pessimist`, `@security-reviewer` during development
4. **Main window is the orchestrator** — planning, final integration, commits
5. **Custom session names**: `infraflow-feature-a`, `infraflow-feature-b` for parallel features
