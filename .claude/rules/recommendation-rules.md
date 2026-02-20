---
paths:
  - "src/lib/knowledge/**/*.ts"
  - "src/lib/recommendation/**/*.ts"
---

# Recommendation Engine Rules

> Rules for Layer 3 (RECOMMEND): matching vendor products to infrastructure requirements.

## REC-001: Recommendation Pipeline

Every recommendation follows this pipeline:

```
User Requirements (natural language or structured)
  ↓
Architecture Pattern Matching (knowledge graph patterns)
  ↓
Component Role Identification (which generic types are needed)
  ↓
Vendor Product Filtering (catalog query by role + constraints)
  ↓
Scoring & Ranking (fit score based on requirements)
  ↓
Output: Ranked product suggestions with rationale
```

## REC-002: Input Requirements

Recommendations require at minimum:

| Field | Example | Required |
|-------|---------|----------|
| Scale | "500 users", "10K concurrent" | Yes |
| Purpose | "web hosting", "VDI", "IoT gateway" | Yes |
| Security level | "PCI-DSS", "basic", "government" | Recommended |
| Budget range | "$10K-50K/month" | Optional |
| Existing vendors | "We already use Cisco switches" | Optional |
| Cloud preference | "AWS preferred", "on-prem only" | Optional |

## REC-003: Scoring Criteria

Product recommendations are scored on:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Role fit | 30% | Does the product match the required architecture role? |
| Scale match | 25% | Can the product handle the required capacity? |
| Protocol compatibility | 20% | Does it support required protocols/integrations? |
| Vendor ecosystem | 15% | Does it fit with existing vendor products? |
| Cost efficiency | 10% | Price-performance ratio |

Scores are normalized to 0-100. Only products scoring 60+ are recommended.

## REC-004: Multi-Vendor Fairness

- NEVER favor a single vendor unless the user explicitly requests it
- Always present at least 2 vendor options when available
- Clearly state when a recommendation is based on ecosystem compatibility vs technical merit
- If only one vendor product fits, explain why alternatives don't qualify

## REC-005: Recommendation Output

Every recommendation must include:

```typescript
{
  product: ProductNode;           // The recommended product
  score: number;                  // 0-100 fit score
  role: string;                   // Architecture role this fills
  rationale: string;              // Why this product (in English)
  rationaleKo: string;            // Why this product (in Korean)
  alternatives: ProductNode[];    // Other options considered
  caveats: string[];              // Limitations or trade-offs
}
```

## REC-006: Consulting Workflow Integration

When used in consulting mode:

1. **Assess**: Analyze current infrastructure (if provided)
2. **Design**: Propose architecture pattern based on requirements
3. **Select**: Recommend specific products for each component role
4. **Validate**: Check for anti-patterns, compliance gaps, single points of failure
5. **Report**: Generate a structured recommendation report

## REC-007: Knowledge Graph Dependency

Recommendations MUST be grounded in the knowledge graph:

- Architecture patterns come from `patterns.ts`
- Component roles come from `relationships.ts`
- Product data comes from `vendorCatalog/`
- Compliance requirements come from `industryCompliance.ts`
- Do NOT hallucinate products or specs not in the catalog
