# Node Vendor/Cloud Logo Badge — Design Document

> Date: 2026-02-22
> Status: Approved
> Author: AI + Hyunki

## Problem

노드에 벤더 제품이나 클라우드 서비스를 선택해도 시각적으로 어떤 회사 제품인지 알 수 없음. 이용자가 노드별로 어떤 회사 상품을 사야 하는지 한눈에 파악 불가.

## Solution: Logo Badge Overlay

BaseNode 우측 상단에 20×20px 로고 뱃지를 오버레이. 기존 노드 아이콘(타입 구분)은 유지.

### Approach: Option A — 로고 뱃지 오버레이

```
┌─────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  카테고리 바
│                    ┌──┐ │
│  🔥 Firewall      │🔷│ │  ← 벤더 로고 뱃지 (20×20)
│      DMZ 방화벽   └──┘ │
│      firewall           │
└─────────────────────────┘
```

- 제품 미선택 시 뱃지 미표시
- Policy indicator 있으면 로고는 좌측 상단으로 이동
- 호버 시 제품명 툴팁

## Data Model Changes

InfraNodeData 확장:
```typescript
export interface InfraNodeData {
  // existing fields...
  vendorId?: string;       // 'cisco' | 'fortinet' | 'paloalto' | 'arista'
  cloudProvider?: string;  // 'aws' | 'azure' | 'gcp'
  productName?: string;    // Display name of selected product
}
```

## Logo Assets

7 vendor/provider SVG logos in `public/logos/`:
- cisco.svg, fortinet.svg, paloalto.svg, arista.svg
- aws.svg, azure.svg, gcp.svg

## File Structure

```
public/logos/                          # 7 SVG logo files
src/lib/design/vendorLogos.ts          # Logo mapping utility
src/components/nodes/BaseNode.tsx      # Modified — add logo badge
src/types/infra.ts                     # Modified — add vendor fields
```
