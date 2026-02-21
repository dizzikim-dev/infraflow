---
paths:
  - "src/lib/knowledge/cloudCatalog/**/*.ts"
---

# Cloud Catalog Rules

> **Rule ID**: `CLOUD-CATALOG`
> **Scope**: Cloud service catalog data collection and structuring
> **Priority**: High

---

## CC-001: Flat Structure

Cloud services use a flat `CloudService[]` array — no hierarchy or children.
Each service is one entry. Provider separation is at the file level (`providers/aws.ts`, etc.).

## CC-002: Three-Provider Parity

When adding a service for one provider, flag if the equivalent is missing for the other two.
Use `// PARITY-GAP: {provider} missing` comments for tracking.

Example: Adding AWS SQS requires checking for Azure Service Bus and GCP Pub/Sub.

## CC-003: Architecture Fields Required for "Complete" Services

A service is "complete" when it has ALL of:
- `serviceCategory` / `serviceCategoryKo`
- `architectureRole` / `architectureRoleKo`
- `recommendedFor` / `recommendedForKo` (min 3 entries)
- `features` (min 3 entries)
- `sla`

Services without these are "basic" and remain valid but are enrichment targets.

## CC-004: Bilingual Required

All text fields must have English + Korean pairs:

```typescript
serviceName / serviceNameKo
serviceCategory / serviceCategoryKo
architectureRole / architectureRoleKo
recommendedFor / recommendedForKo
features / featuresKo
integrationsWith / integrationsWithKo
```

## CC-005: ID Convention

Format: `CS-{CATEGORY}-{PROVIDER}-{SEQ}`

| Provider | Code |
|----------|------|
| AWS | `AWS` |
| Azure | `AZ` |
| GCP | `GCP` |

Categories: `FW`, `WAF`, `LB`, `WEB`, `APP`, `DB`, `DNS`, `CDN`, `K8S`, `CONT`, `CACHE`, `OBJ`, `BK`, `VPN`, `IAM`, `SIEM`, `IDS`, `SDWAN`, `MFA`, `VPC`, `SLS`, `MQ`, `MON`, `SRCH`, `STOR`, `APIGW`, `NOSQL`, `DLP`, `NAC`, `SSO`, `LDAP`, `AIML`

Sequence: 3-digit, zero-padded, starting at 001.

## CC-006: Documentation URL

`documentationUrl` should point to the official docs page (not marketing page).
Must be accessible (HTTP 200). Prefer English-language URLs.

Patterns:
- AWS: `https://docs.aws.amazon.com/{service}/`
- Azure: `https://learn.microsoft.com/en-us/azure/{service}/`
- GCP: `https://cloud.google.com/{service}/docs/`

## CC-007: Completeness Quality Gate

Before declaring a service "enriched":

| Field | Criteria |
|-------|----------|
| `features` | At least 3 entries |
| `architectureRole` | Non-empty, architecture-relevant |
| `recommendedFor` | At least 3 deployment scenarios |
| `sla` | Percentage string (e.g., '99.99%') |
| `deploymentModel` | One of: managed, serverless, self-managed, hybrid |

## CC-008: Deprecation Tracking

When a service status changes to `deprecated` or `end-of-life`:
- Set `successor` and `successorKo` to the replacement service name
- Ensure `getAlternatives()` can find active replacements
- Add to `getDeprecationWarnings()` coverage

## CC-009: Trust Metadata

All services use `svcTrust(provider)` for trust metadata.
Provider-specific trust URLs:
- AWS: `https://aws.amazon.com/products/`
- Azure: `https://azure.microsoft.com/products/`
- GCP: `https://cloud.google.com/products`

## CC-010: Stats Sync

After adding/removing services:
1. Update test count assertions in `__tests__/types.test.ts`
2. Update provider test count assertions in `__tests__/providers/*.test.ts`
3. Verify `CLOUD_SERVICES.length` matches sum of provider arrays
4. Run `npx vitest run src/lib/knowledge/cloudCatalog`
