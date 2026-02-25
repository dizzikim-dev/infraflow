---
paths:
  - "src/lib/knowledge/productIntelligence/**/*.ts"
---

# Product Intelligence Rules

## PI-001: Required Fields
Every ProductIntelligence entry must have: id, productId, name, nameKo, category, sourceUrl, deploymentProfiles (>=1), embeddingText, embeddingTextKo.

## PI-002: Deployment Profile Completeness
Each DeploymentProfile must have: platform, os (>=1), installMethod, infraComponents (>=1).

## PI-003: Bilingual Requirement
All user-facing strings must have English and Korean versions.

## PI-004: InfraComponent Validity
All infraComponents values must be valid InfraNodeType values from infrastructureDB.

## PI-005: EmbeddingText Quality
embeddingText must combine: product name + description + key platforms + primary use cases. Minimum 20 characters.

## PI-006: Source URL
sourceUrl must be a valid URL (https:// preferred) pointing to official product page or repository.
