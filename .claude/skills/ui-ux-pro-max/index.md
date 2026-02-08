# UI UX Pro Max Skills Index

## Overview
AI 기반 UI/UX 디자인 시스템 생성 스킬 모음입니다.

## Available Skills

| Skill | Command | Description |
|-------|---------|-------------|
| [Design System](./design-system.md) | `/design-system` | 완전한 디자인 시스템 생성 |
| [UI Styles](./ui-styles.md) | `/ui-style` | 67개 UI 스타일 적용 |
| [Color Palettes](./color-palettes.md) | `/color-palette` | 96개 색상 팔레트 적용 |

## Quick Reference

### Design Workflow
```
1. /design-system         → 디자인 시스템 생성
2. /ui-style [스타일]     → UI 스타일 선택
3. /color-palette [테마]  → 색상 팔레트 적용
```

### InfraFlow Preset
```
스타일: Dark Mode + Minimalism + AI Native
팔레트: Tech Infrastructure Dark
폰트: Inter + JetBrains Mono
```

## InfraFlow Design Tokens

### Node Colors
| Category | Color | Hex |
|----------|-------|-----|
| Security | Red | `#ef4444` |
| Network | Blue | `#3b82f6` |
| Compute | Green | `#22c55e` |
| Cloud | Purple | `#8b5cf6` |
| Storage | Amber | `#f59e0b` |
| Auth | Pink | `#ec4899` |

### Flow Colors
| Type | Color | Hex |
|------|-------|-----|
| Request | Light Blue | `#60a5fa` |
| Response | Light Green | `#4ade80` |
| Blocked | Light Red | `#f87171` |
| Encrypted | Light Purple | `#a78bfa` |
| Sync | Light Orange | `#fb923c` |

## Integration with InfraFlow

```
UI UX Pro Max Skill        InfraFlow Component
───────────────────        ───────────────────
design-system         ←──→ 전체 UI 구조
ui-styles             ←──→ 노드/엣지 컴포넌트
color-palettes        ←──→ 테마 시스템
```

## Anti-Patterns

```
❌ 7개 이상의 색상 사용
❌ 낮은 대비 (4.5:1 미만)
❌ 일관성 없는 여백
❌ 과도한 애니메이션
❌ 너무 작은 폰트 (12px 미만)
```

## Source

Based on [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
