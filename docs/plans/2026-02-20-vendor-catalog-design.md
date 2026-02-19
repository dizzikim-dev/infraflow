# Vendor Catalog — Design Document

> 벤더 사이트 크롤링 기반 계층적 제품 DB 구축

**Date**: 2026-02-20
**Status**: Approved
**Module**: `src/lib/knowledge/vendorCatalog/`

---

## 1. 목표

InfraFlow 플랫폼의 노드(switch, firewall 등)에 실제 벤더 제품을 매핑할 수 있도록,
벤더 사이트를 크롤링하여 **계층적 제품 카탈로그 DB**를 구축한다.

### 핵심 요구사항
- 벤더 사이트 URL을 주면, 제품 계층 구조를 파악하여 DB화
- 벤더마다 계층 깊이가 다름 (Cisco: 5단계, 다른 벤더: 2~4단계)
- 한국어/영어 이중언어 지원
- 원본 페이지 URL(출처) 보존
- 기존 `vendorMappings` 모듈과 독립적으로 운영

### 기존 모듈과의 관계
| 모듈 | 관점 | 용도 |
|------|------|------|
| `vendorMappings` | 노드 중심 | "firewall 노드에 어떤 벤더/제품이 있나?" |
| `vendorCatalog` (신규) | 벤더 중심 | "Cisco에 어떤 제품 계층이 있나?" |
| 연결 고리 | `vendorName` + `infraNodeTypes` | 양방향 조회 가능 |

---

## 2. 데이터 모델

### 2.1 핵심 타입

```typescript
// src/lib/knowledge/vendorCatalog/types.ts

/** 벤더 전체 카탈로그 */
interface VendorCatalog {
  vendorId: string;                 // 'cisco', 'fortinet', 'paloalto'
  vendorName: string;               // 'Cisco Systems'
  vendorNameKo: string;             // '시스코 시스템즈'
  headquarters: string;             // 'San Jose, CA'
  website: string;                  // 'https://www.cisco.com'
  productPageUrl: string;           // 전체 제품 목록 페이지 URL
  depthStructure: string[];         // ['category','subcategory','family','series','model']
  depthStructureKo: string[];       // ['카테고리','하위카테고리','제품군','시리즈','모델']
  products: ProductNode[];          // 최상위 계층 노드들
  stats: CatalogStats;
  lastCrawled: string;              // ISO date
  crawlSource: string;              // 크롤링 시작 URL
}

/** 제품 계층 노드 — 재귀 트리 구조 */
interface ProductNode {
  nodeId: string;                   // 'networking', 'switches', 'catalyst-9200'
  depth: number;                    // 0=root category, 1, 2, ...
  depthLabel: string;               // 'category', 'family', 'series', 'model'
  depthLabelKo: string;             // '카테고리', '제품군', '시리즈', '모델'

  name: string;                     // 'Catalyst 9200 Series'
  nameKo: string;                   // 'Catalyst 9200 시리즈'
  description: string;
  descriptionKo: string;
  sourceUrl: string;                // 이 데이터가 추출된 벤더 페이지 URL

  infraNodeTypes?: InfraNodeType[]; // InfraFlow 노드 매핑 (해당 레벨에서 가능할 때)

  // 리프 노드(최하위 제품)에만 존재하는 필드
  specs?: Record<string, string>;   // { throughput: '480 Gbps', ports: '24-48' }
  datasheetUrl?: string;
  pricingInfo?: string;
  lifecycle?: 'active' | 'end-of-sale' | 'end-of-life';

  children: ProductNode[];          // 하위 계층 (빈 배열 = 리프)
}

/** 카탈로그 통계 */
interface CatalogStats {
  totalProducts: number;            // 리프 노드 수
  maxDepth: number;                 // 최대 계층 깊이
  categoriesCount: number;          // 최상위 카테고리 수
}
```

### 2.2 설계 원칙
- **재귀적 트리**: 고정 계층 수 없이, 벤더마다 다른 깊이를 자연스럽게 수용
- **depthStructure**: 해당 벤더의 계층 이름 정의 (메타데이터)
- **sourceUrl**: 모든 노드에 원본 URL 보존 → 출처 추적 가능
- **specs: Record<string, string>**: 제품 유형마다 스펙 항목이 다르므로 유연한 key-value
- **infraNodeTypes**: 특정 레벨에서 InfraFlow 노드와 매핑 (모든 레벨에 필수 아님)

---

## 3. 크롤링 방법론

### 3.1 프로세스 (3단계 대화형)

#### Step 1: 사이트 구조 탐색 (Discovery)
```
사용자: "https://www.cisco.com/site/kr/ko/products/index.html 크롤링해줘"
Claude Code:
  1. WebFetch로 메인 제품 페이지 접근
  2. 페이지에서 카테고리 목록 + 하위 링크 추출
  3. 1~2개 카테고리 샘플 탐색으로 계층 깊이 파악
  4. 사용자에게 구조 보고:
     "Cisco 제품 페이지 분석 결과:
      - 6개 카테고리: Networking, Security, Collaboration, ...
      - 계층 깊이: 5단계 (카테고리 → 하위카테고리 → 제품군 → 시리즈 → 모델)
      - 예상 제품 수: ~150개 시리즈
      전체/부분 크롤링 선택해주세요."
```

#### Step 2: 계층별 크롤링 (Crawling)
```
사용자: "Networking만 해줘"
Claude Code:
  1. 카테고리 페이지 → 하위 카테고리 목록 + URL 추출
  2. 각 하위 카테고리 → 제품군 목록 + URL 추출
  3. 각 제품군 → 시리즈 목록 + 설명 + URL 추출
  4. 각 시리즈 → 모델/스펙/데이터시트 URL 추출
  5. 중간 진행 보고 (카테고리 단위)
```

#### Step 3: 데이터 정규화 + 저장
```
Claude Code:
  1. 추출 데이터를 ProductNode 트리로 구조화
  2. 한국어 사이트 → 영어 사이트 매칭 (또는 반대)
  3. InfraNodeType 매핑 추론
  4. TS 파일 생성: src/lib/knowledge/vendorCatalog/vendors/cisco.ts
  5. 테스트 파일 생성: __tests__/vendors/cisco.test.ts
  6. 결과 보고
```

### 3.2 WebFetch 전략
- **한국어 사이트 우선**: `/kr/ko/` URL이 있으면 한국어 먼저
- **영어 사이트 교차**: 같은 제품의 영어 페이지로 전환하여 영문 설명 추출
- **데이터시트**: 최하위 모델 페이지에서 datasheet PDF/페이지 링크 수집
- **SPA 한계**: JavaScript 렌더링이 필요한 페이지는 정적 HTML만 가능 → 사용자에게 고지

### 3.3 벤더별 적용
| 벤더 | 예상 깊이 | 한국어 사이트 | 특이사항 |
|------|----------|-------------|---------|
| Cisco | 5 | /kr/ko/ | 매우 체계적 계층 |
| Fortinet | 3~4 | /ko/ | 제품군 중심 |
| Palo Alto | 3 | 영어만 | 솔루션 중심 분류 |
| Juniper | 4 | 영어만 | 시리즈 중심 |
| 한국 벤더 | 2~3 | 기본 한국어 | 벤더마다 상이 |

---

## 4. 파일 구조

```
src/lib/knowledge/vendorCatalog/
├── types.ts                    # VendorCatalog, ProductNode 타입
├── vendors/
│   ├── cisco.ts                # Cisco 제품 카탈로그
│   ├── fortinet.ts             # Fortinet 제품 카탈로그
│   └── ...                     # 벤더 추가 시 파일 추가
├── index.ts                    # 통합 쿼리 API + 벤더 merge
├── queryHelpers.ts             # 트리 순회, 검색, 필터링 유틸
└── __tests__/
    ├── types.test.ts           # 타입/데이터 무결성 테스트
    ├── queryHelpers.test.ts    # 쿼리 유틸 테스트
    └── vendors/
        └── cisco.test.ts       # 벤더별 데이터 검증
```

---

## 5. 쿼리 API

```typescript
// src/lib/knowledge/vendorCatalog/index.ts

// 벤더 조회
getVendorList(): VendorCatalog[]
getVendor(vendorId: string): VendorCatalog | undefined

// 제품 조회 (InfraFlow 노드 기반)
getProductsByNodeType(nodeType: InfraNodeType): {
  vendorId: string;
  vendorName: string;
  products: ProductNode[];
}[]

// 트리 탐색
getChildren(vendorId: string, nodeId: string): ProductNode[]
getLeafProducts(vendorId: string, categoryId?: string): ProductNode[]
getProductPath(vendorId: string, nodeId: string): ProductNode[]  // root → target 경로

// 검색 (한/영)
searchProducts(query: string, options?: {
  vendorId?: string;
  nodeType?: InfraNodeType;
  leafOnly?: boolean;
}): SearchResult[]

// 통계
getCatalogStats(): {
  vendors: number;
  totalProducts: number;
  byVendor: Record<string, number>;
}
```

---

## 6. 구현 계획 (개요)

| 단계 | 작업 | 산출물 |
|------|------|--------|
| PR-1 | 타입 정의 + 쿼리 API + 테스트 | types.ts, queryHelpers.ts, index.ts |
| PR-2 | 첫 번째 벤더 크롤링 (Cisco 등) | vendors/cisco.ts + 테스트 |
| PR-3+ | 추가 벤더 크롤링 | vendors/*.ts (벤더별) |

---

## 7. 예시: Cisco 크롤링 결과 (예상)

```typescript
// src/lib/knowledge/vendorCatalog/vendors/cisco.ts
export const ciscoCatalog: VendorCatalog = {
  vendorId: 'cisco',
  vendorName: 'Cisco Systems',
  vendorNameKo: '시스코 시스템즈',
  headquarters: 'San Jose, CA, USA',
  website: 'https://www.cisco.com',
  productPageUrl: 'https://www.cisco.com/site/kr/ko/products/index.html',
  depthStructure: ['category', 'subcategory', 'family', 'series'],
  depthStructureKo: ['카테고리', '하위 카테고리', '제품군', '시리즈'],
  products: [
    {
      nodeId: 'networking',
      depth: 0,
      depthLabel: 'category',
      depthLabelKo: '카테고리',
      name: 'Networking',
      nameKo: '네트워킹',
      description: 'Enterprise networking solutions including switches, routers, and wireless',
      descriptionKo: '스위치, 라우터, 무선을 포함한 엔터프라이즈 네트워킹 솔루션',
      sourceUrl: 'https://www.cisco.com/site/kr/ko/products/networking/index.html',
      children: [
        {
          nodeId: 'switches',
          depth: 1,
          depthLabel: 'subcategory',
          depthLabelKo: '하위 카테고리',
          name: 'Switches',
          nameKo: '스위치',
          description: 'Campus, data center, and industrial switches',
          descriptionKo: '캠퍼스, 데이터센터, 산업용 스위치',
          sourceUrl: 'https://www.cisco.com/site/kr/ko/products/networking/switches/index.html',
          infraNodeTypes: ['switch-l2', 'switch-l3'],
          children: [
            {
              nodeId: 'catalyst-9000',
              depth: 2,
              depthLabel: 'family',
              depthLabelKo: '제품군',
              name: 'Catalyst 9000 Series Switches',
              nameKo: 'Catalyst 9000 시리즈 스위치',
              description: 'Next-generation campus and branch switches',
              descriptionKo: '차세대 캠퍼스 및 지점 스위치',
              sourceUrl: 'https://www.cisco.com/site/kr/ko/products/networking/switches/catalyst-9000-switches/index.html',
              children: [
                {
                  nodeId: 'catalyst-9200',
                  depth: 3,
                  depthLabel: 'series',
                  depthLabelKo: '시리즈',
                  name: 'Catalyst 9200 Series',
                  nameKo: 'Catalyst 9200 시리즈',
                  description: 'Entry-level enterprise-class access switches',
                  descriptionKo: '엔트리급 엔터프라이즈 클래스 액세스 스위치',
                  sourceUrl: 'https://www.cisco.com/site/kr/ko/products/networking/switches/catalyst-9200-series-switches/index.html',
                  datasheetUrl: 'https://www.cisco.com/c/en/us/products/collateral/switches/catalyst-9200-series-switches/nb-06-cat9200-ser-data-sheet-cte-en.html',
                  specs: {
                    switchingCapacity: 'Up to 480 Gbps',
                    ports: '24/48 ports (1G/mGig)',
                    poeSupport: 'PoE+ (up to 740W)',
                    stackingBandwidth: '160 Gbps',
                    operatingSystem: 'IOS-XE'
                  },
                  lifecycle: 'active',
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  stats: { totalProducts: 0, maxDepth: 4, categoriesCount: 6 },
  lastCrawled: '2026-02-20',
  crawlSource: 'https://www.cisco.com/site/kr/ko/products/index.html'
};
```
