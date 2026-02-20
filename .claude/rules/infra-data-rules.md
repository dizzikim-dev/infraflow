---
paths:
  - "src/types/infra.ts"
  - "src/lib/data/infrastructureDB.ts"
  - "src/lib/parser/patterns.ts"
---

# Infrastructure Data Management Rules

> **Rule ID**: `INFRA-DATA`
> **Scope**: Infrastructure component data (the generic component layer of the ontology)
> **Priority**: High

---

## 1. Data Integrity

### INFRA-DATA-001: Type Definition Required

Every component MUST have a type defined in `src/types/infra.ts`.

```typescript
// Correct
export type SecurityNodeType =
  | 'firewall'
  | 'waf'
  | 'new-security-device';

// Wrong: adding data without a type
infrastructureDB['undefined-device'] = { ... }; // ERROR!
```

**Violation**: TypeScript compilation error.

### INFRA-DATA-002: Database Completeness

Every entry in `infrastructureDB` must include all required fields:

- `id`: Unique identifier
- `name` / `nameKo`: English / Korean name
- `category`: Component category
- `description` / `descriptionKo`: English / Korean description
- `functions` / `functionsKo`: Feature list (min 3 each)
- `features` / `featuresKo`: Characteristics (min 2 each)
- `recommendedPolicies`: Policy recommendations (min 2)
- `tier`: Tier placement

**Violation**: Rendering errors or incomplete information display.

### INFRA-DATA-003: Parsing Pattern Registration

Every component MUST have a parsing pattern in `patterns.ts`:

```typescript
{
  pattern: /firewall|fw(?!\w)/i,       // English keywords (required)
  type: 'firewall',
  label: 'Firewall',
  labelKo: '방화벽'                     // Korean label (recommended)
}
```

Pattern rules:
- English keywords required
- Korean keywords recommended
- Case-insensitive (`i` flag)
- Abbreviations must check word boundaries (`(?!\w)`)

**Violation**: Component not recognized from natural language input.

### INFRA-DATA-004: 4-File Sync Rule

Component changes MUST update all 4 files simultaneously:

| Order | File | Action |
|-------|------|--------|
| 1 | `src/types/infra.ts` | Add/modify/remove type |
| 2 | `src/lib/data/infrastructureDB.ts` | Add/modify/remove data |
| 3 | `src/lib/parser/patterns.ts` | Add/modify/remove pattern |
| 4 | `docs/INFRASTRUCTURE_COMPONENTS.md` | Update documentation |

**Violation**: Runtime data inconsistency.

---

## 2. Naming Rules

### INFRA-DATA-005: ID Naming

```
Format: [lowercase]-[lowercase]
Examples: load-balancer, web-server, ids-ips, switch-l2
```

Constraints:
- `kebab-case` only
- Lowercase English only
- Hyphen word separator
- Max 20 characters
- Numbers only at the end (e.g., `switch-l2`)

### INFRA-DATA-006: Bilingual (Korean + English)

All text fields must be provided in English (`field`) and Korean (`fieldKo`) pairs:

```typescript
{
  name: 'Firewall',
  nameKo: '방화벽',
  description: 'Network security device...',
  descriptionKo: '네트워크 보안 장치...',
}
```

---

## 3. Category & Tier Rules

### INFRA-DATA-007: Category Classification

| Category | Component Types |
|----------|----------------|
| `security` | Firewall, WAF, IDS/IPS, VPN, NAC, DLP, SASE, ZTNA, CASB, SIEM, SOAR |
| `network` | Router, Switch, LB, DNS, CDN, SD-WAN |
| `compute` | Server, Container, VM, Kubernetes |
| `cloud` | AWS/Azure/GCP VPC, Private Cloud |
| `storage` | SAN/NAS, Object Storage, Cache, Backup |
| `auth` | LDAP/AD, SSO, MFA, IAM |
| `external` | User, Internet |

### INFRA-DATA-008: Tier Placement

| Category | Allowed Tiers |
|----------|--------------|
| security | dmz, internal |
| network | external, dmz, internal |
| compute | dmz, internal, data |
| cloud | internal |
| storage | internal, data |
| auth | internal |
| external | external |

---

## 4. Export Mapping

### INFRA-DATA-010: Export Mapping

Every component must be mapped in at least one export format:

| File | Purpose | Required |
|------|---------|----------|
| `plantUMLExport.ts` | PlantUML diagram | Required |
| `terraformExport.ts` | Terraform HCL | Recommended |
| `kubernetesExport.ts` | K8s YAML | Recommended |

---

## 5. Checklist

### Adding a Component

- [ ] Type added to `infra.ts`
- [ ] Data added to `infrastructureDB.ts` with all required fields
- [ ] Bilingual text complete (English + Korean)
- [ ] Parsing pattern added to `patterns.ts`
- [ ] Export mapping added
- [ ] Documentation updated
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run` passes

### Removing a Component

- [ ] Check for references in other files
- [ ] Remove export mappings
- [ ] Remove parsing pattern
- [ ] Remove database entry
- [ ] Remove type definition
- [ ] Update documentation
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run` passes
