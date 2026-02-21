---
paths:
  - "src/lib/knowledge/vendorCatalog/**/*.ts"
---

# Vendor Catalog Crawling & Curation Rules

> **Rule ID**: `VENDOR-CATALOG`
> **Scope**: Vendor product catalog data collection and structuring
> **Priority**: High

---

## Core Philosophy

> InfraFlow helps infrastructure professionals answer: **"How does this equipment connect with other equipment/facilities, and where does it fit in the architecture?"**
> Structure data for **architecture decision-making**, not just spec listing.

---

## 1. Data Priority Tiers

### Tier 1: Architecture Decision Critical (must be in DB)

| Information | Why Needed | Field |
|-------------|-----------|-------|
| Port types/count | Physical connectivity assessment | `specs` |
| Switching capacity / forwarding rate | Traffic scale fitness | `specs` |
| Supported protocols | Network design pattern decisions | `supportedProtocols` |
| HA features | Redundancy architecture design | `haFeatures` |
| Security capabilities | Encryption segments / security zones | `securityCapabilities` |
| Scale numbers (MAC, routes, ACL) | Scale fitness assessment | `specs` |
| Architecture role | Where in the network this belongs | `architectureRole` |
| Recommended use cases | Which scenarios it fits | `recommendedFor` |

### Tier 2: Facility/Rack Design (summary level in DB)

- Power requirements, redundancy mode → `specs`
- Physical dimensions (RU), weight → `specs`
- Operating temperature, MTBF → `specs`

### Tier 3: Reference Only (link is sufficient)

- Country-specific power cables → `datasheetUrl`
- Individual part weights, BTU details → `datasheetUrl`
- Fan/cooling detailed specs → `datasheetUrl`
- RFID/asset management → excluded

---

## 2. Crawling Workflow

### VC-001: Two-Stage Crawling

All product series require both Overview and Datasheet pages:

```
Stage 1: Overview page → product summary, key features, architecture role
Stage 2: Datasheet page → detailed specs, per-model differences, performance numbers
```

### VC-002: Architecture-Centric Analysis

Extract information that answers:

```
Q1. Where in the network is this deployed? → architectureRole
Q2. What upstream/downstream devices connect to it? → supportedProtocols, specs (ports)
Q3. What design patterns does it fit? → recommendedFor
Q4. How is it protected against failure? → haFeatures
Q5. How does it meet security requirements? → securityCapabilities
Q6. What are its scale limits? → specs (scale numbers)
```

### VC-003: Proactive Field Suggestions

When crawling reveals important information that the current `ProductNode` schema cannot express:

1. Explain why the information matters for architecture decisions
2. Propose new field name, type, and JSDoc
3. Confirm backward compatibility (optional field)
4. Request user approval before modifying `types.ts`

Threshold: "Can an infrastructure professional make the right equipment choice without this info?" If no → suggest the field.

### VC-004: Model Hierarchy

Organize models under series by logical component groups:

```
Series (depth 2)
├── Chassis (depth 3)
├── Supervisor Engines (depth 3)
├── Line Cards (depth 3)
└── Power Supplies (depth 3)
```

Each model gets its own unique specs. Series level gets summary specs.

---

## 3. Data Quality Rules

### VC-005: Bilingual Required

All text fields must have English + Korean pairs:

```typescript
name / nameKo
description / descriptionKo
architectureRole / architectureRoleKo
recommendedFor / recommendedForKo
```

### VC-006: English-Based URLs

`sourceUrl` must use the English page URL:

```
Yes: https://www.cisco.com/c/en/us/products/...
No:  https://www.cisco.com/c/ko_kr/products/...
```

### VC-007: Specs Key Naming

`specs` keys use readable English labels:

```typescript
// Correct
specs: {
  'Switching Capacity': '25.6 Tbps',
  'Per-Slot Bandwidth': '6.4 Tbps',
  'MAC Addresses': '256,000',
}

// Wrong
specs: {
  'switchingCapacity': '25.6 Tbps',  // No camelCase
  'max_bw': '6.4 Tbps',              // No abbreviations
}
```

### VC-008: Stats Sync

When adding/removing products, keep `stats.totalProducts` in sync with actual node count. Validate with `computeStats()` helper.

### VC-009: Completeness Quality Gate

Products at depth 2 (Series) or deeper MUST have ALL of the following:

| Required Field | Criteria |
|----------------|----------|
| `infraNodeTypes` | At least 1 valid InfraNodeType |
| `lifecycle` | Set to 'active', 'end-of-sale', or 'end-of-life' |
| `architectureRole` / `architectureRoleKo` | Non-empty |
| `recommendedFor` / `recommendedForKo` | At least 3 entries |
| `specs` | At least 5 key-value pairs for Tier 1 products |

Products that do not meet this gate should be marked with a `// STUB` comment for future crawling.

### VC-010: Lifecycle Accuracy

- `lifecycle` values must be based on official vendor EOL/EOS announcements
- When a product is `end-of-life` or `end-of-sale`, set `replacedBy` to the nodeId of the successor product
- Example: PA-3200 series → `replacedBy: 'pan-pa-3400'`

### VC-011: URL Validation

When crawling:
- Verify `sourceUrl` and `datasheetUrl` return HTTP 200
- If 404: search for alternative URLs using vendor sitemap or product redirects
- Never leave known-broken URLs in the catalog

### VC-012: SPA Site Crawling

When WebFetch fails (e.g., SPA sites that block server-side rendering):

1. Check `sitemap.xml` for direct product page URLs
2. Try search engine cached versions
3. Look for direct PDF datasheet URLs (usually `/assets/data/pdf/` or `/content/dam/`)
4. Fall back to third-party review sites (ServeTheHome, PacketPushers, StorageReview)

### VC-013: New Field Checklist

When adding or updating products, verify these fields are populated:

- `licensingModel` — perpetual, subscription, credit-based, or as-a-service
- `maxThroughput` — primary throughput metric from specs
- `formFactor` — appliance, chassis, virtual, cloud, container, or rugged
- `replacedBy` — for EOL/EOS products, reference the successor nodeId

---

## 4. Checklist

### New Series Crawling

- [ ] Overview page collected
- [ ] Datasheet page collected
- [ ] `architectureRole` / `architectureRoleKo` set
- [ ] `recommendedFor` / `recommendedForKo` min 3 entries
- [ ] `supportedProtocols` extracted (if applicable)
- [ ] `haFeatures` extracted (if applicable)
- [ ] `securityCapabilities` extracted (if applicable)
- [ ] All Tier 1 specs in `specs`
- [ ] Model hierarchy structured
- [ ] Bilingual complete
- [ ] English-based URLs
- [ ] `datasheetUrl` set
- [ ] `lifecycle` set
- [ ] `infraNodeTypes` mapped
- [ ] `stats` updated
- [ ] Tests pass (`npx vitest run src/lib/knowledge/vendorCatalog`)
