---
name: color-palette
description: "InfraFlow color palette application and management. Node categories, flow animations, status colors."
user-invocable: true
---

## Color Palette: $ARGUMENTS

### Tech Infrastructure Dark Palette

#### Background Gradient
| Token | Hex | Usage |
|-------|-----|-------|
| bg-primary | #0f172a | Canvas background |
| bg-secondary | #1e293b | Cards, nodes, sidebar |
| bg-tertiary | #334155 | Input fields |
| bg-hover | #475569 | Hover state |

#### Node Category Colors
| Category | Hex | Tailwind |
|----------|-----|---------|
| Security | #ef4444 | `infra-node-security` |
| Network | #3b82f6 | `infra-node-network` |
| Compute | #22c55e | `infra-node-compute` |
| Cloud | #8b5cf6 | `infra-node-cloud` |
| Storage | #f59e0b | `infra-node-storage` |
| Auth | #ec4899 | `infra-node-auth` |

#### Flow Animation Colors
| Type | Hex | Tailwind |
|------|-----|---------|
| Request | #60a5fa | `infra-flow-request` |
| Response | #4ade80 | `infra-flow-response` |
| Blocked | #f87171 | `infra-flow-blocked` |
| Encrypted | #a78bfa | `infra-flow-encrypted` |
| Sync | #fb923c | `infra-flow-sync` |

#### Status Colors
| Status | Hex | Usage |
|--------|-----|-------|
| Success | #22c55e | Connected, active |
| Warning | #f59e0b | High load, attention |
| Error | #ef4444 | Failed, blocked |
| Info | #3b82f6 | Selected, info |

### Accessibility Compliance
- `#f8fafc` on `#0f172a` = 15.8:1 (pass)
- `#f8fafc` on `#1e293b` = 12.1:1 (pass)
- `#94a3b8` on `#0f172a` = 6.3:1 (pass)
