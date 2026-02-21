---
paths:
  - "src/lib/knowledge/**/*.ts"
---

# Knowledge Graph & Ontology Rules

> The knowledge graph is InfraFlow's core differentiator — it transforms a drawing tool into an infrastructure intelligence platform.

## KG-001: Ontology Hierarchy

All infrastructure knowledge follows a three-level hierarchy:

```
Generic Component Type (e.g., "firewall")
  ↓ maps to
Architecture Role (e.g., "perimeter firewall", "internal segmentation firewall")
  ↓ maps to
Vendor Product (e.g., "Fortinet FortiGate 600F", "Cisco Firepower 2130")
```

Every vendor product MUST map back to a generic component type via `infraNodeTypes`.

## KG-002: Relationship Integrity

When adding a relationship:

- **Bidirectional check**: If A → B exists, verify whether B → A should also exist
- **Required fields**: `sourceType`, `targetType`, `relationshipType`, `strength` (0.0-1.0), `direction`
- **Evidence**: Every relationship must reference a source (RFC, vendor doc, best practice)
- **No orphans**: Every component type must have at least one relationship

```typescript
// Valid relationship
{
  id: 'REL-XXX-NNN',
  sourceType: 'load-balancer',
  targetType: 'web-server',
  relationshipType: 'forwards-to',
  strength: 0.9,
  direction: 'unidirectional',
  description: 'LB distributes traffic to web server pool',
  descriptionKo: 'LB가 웹 서버 풀로 트래픽 분산',
}
```

## KG-003: Pattern Quality

Architecture patterns must include:

- **Detection function**: `(spec) => boolean` that checks if a diagram matches the pattern
- **Required components**: Minimum set of component types
- **Relationships**: Which connections define this pattern
- **Anti-pattern references**: Link to related anti-patterns (what NOT to do)

## KG-004: Anti-Pattern Severity

Anti-patterns use a 4-level severity scale. Severity determines UI treatment:

| Severity | Meaning | UI |
|----------|---------|-----|
| `critical` | Security breach or data loss risk | Red alert, blocks export |
| `high` | Significant performance or reliability impact | Orange warning |
| `medium` | Suboptimal design, should fix | Yellow notice |
| `low` | Minor improvement opportunity | Info tooltip |

Detection functions must be pure: `(spec: InfraSpec) => boolean`.

## KG-005: Source Registry

Every knowledge entry must trace back to a verified source:

- Register in `sourceRegistry.ts` before referencing
- Required fields: `id`, `title`, `type` (RFC, NIST, CIS, OWASP, Vendor, Industry, ITU, 3GPP, MEF), `url`, `confidence`
- Confidence reflects source authority: RFC/NIST (0.9+), Vendor (0.7-0.8), Community (0.3-0.5)

## KG-006: Vendor Catalog Mapping

When adding vendor products to the catalog:

- Every `ProductNode` MUST have `infraNodeTypes` linking to generic types
- `architectureRole` describes WHERE in the network this product sits
- `recommendedFor` lists specific deployment scenarios (min 3)
- Follow `.claude/rules/vendor-catalog-rules.md` for crawling workflow
- `lifecycle` is required for all products at depth 2+
- When `lifecycle` is 'end-of-life', `replacedBy` must reference the successor product nodeId

## KG-007: Version and Sync

- Increment knowledge version number when modifying data
- Run `npx vitest run src/lib/knowledge` after any knowledge change
- Circular reference check: no A → B → C → A relationship chains
- Test file required for every knowledge source file (`__tests__/` directory)

## KG-008: ProductNode Completeness

- Products that lack complete data must be marked with a `// STUB` comment at the node definition
- Stub products are priority targets for vendor-catalog-crawler agent enrichment
- Minimum viable product data: `name`, `nameKo`, `description`, `descriptionKo`, `sourceUrl`, `infraNodeTypes`, `lifecycle`, `children`
- Products meeting VC-009 quality gate are considered "complete"
