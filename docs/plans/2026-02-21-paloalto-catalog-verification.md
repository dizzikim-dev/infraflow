# Palo Alto Networks Catalog Verification Report

**Date**: 2026-02-21
**Catalog File**: `/Users/hyunkikim/dev/infraflow/src/lib/knowledge/vendorCatalog/vendors/paloalto.ts`
**Current Stats**: 70 product nodes across 6 categories
**Last Crawled (claimed)**: 2026-02-20

---

## Executive Summary

The InfraFlow Palo Alto Networks catalog has **significant gaps and accuracy issues** that require attention. Two complete firewall series (PA-1400 and PA-3400) are missing, the VM-Series lifecycle status is incorrect, Prisma Cloud has been rebranded to Cortex Cloud, multiple source URLs return 404 errors, and several new products announced in 2025 are absent.

**Severity**: HIGH -- multiple missing products and incorrect lifecycle data could lead infrastructure professionals to recommend discontinued or unavailable equipment.

---

## 1. PA-Series Firewalls (nodeId: pan-pa-series)

### 1.1 URL Verification

| URL in Catalog | Status | Correct URL |
|---------------|--------|-------------|
| `.../next-generation-firewall/pa-series` | **404** | `.../next-generation-firewall-hardware` |
| `.../pa-series/pa-400` | **404** | URL structure changed |
| `.../pa-series/pa-800` | **404** | URL structure changed |
| `.../pa-series/pa-3200` | **404** | URL structure changed |
| `.../pa-series/pa-5200` | **404** | URL structure changed |
| `.../pa-series/pa-5400` | **404** | URL structure changed |
| `.../pa-series/pa-7000` | **404** | URL structure changed |
| `.../pa-series/pa-7500` | **404** | URL structure changed |

**Finding**: Palo Alto Networks restructured their website. The correct NGFW hardware page URL (from sitemap.xml) is: `https://www.paloaltonetworks.com/network-security/next-generation-firewall-hardware`

All individual series page URLs need to be updated or verified against the new site structure.

### 1.2 MISSING: PA-1400 Series (CRITICAL)

The PA-1400 Series is a new product line entirely absent from our catalog.

**Confirmed models from web verification:**

| Model | Firewall Throughput | Threat Prevention | IPSec VPN | Max Sessions | New Sessions/s | Interfaces |
|-------|-------------------|-------------------|-----------|-------------|---------------|------------|
| PA-1410 | 8.9 Gbps | 3.3 Gbps | 4.6 Gbps | 945,000 | 100,000 | 12x RJ45 (8x 1G, 4x 5G), 10x SFP+ (6x 1G, 4x 10G), PoE+ |
| PA-1420 | 9.9 Gbps | 5.2 Gbps | 6.9 Gbps | (not confirmed) | (not confirmed) | Multi-Gig ports, 450W AC PSU |

**Key characteristics:**
- 1U rack-mountable form factor
- ML-Powered Next-Generation Firewalls
- Designed for distributed enterprise branches and small campuses
- Features: PoE capability, UEFI secure boot, power redundancy, Multi-Gig ports, TPM module
- Lifecycle: **active**
- Architecture role: Enterprise Branch / Small Campus Edge

**Impact**: The PA-1400 fills the gap between PA-400 (desktop/branch) and PA-3400 (data center edge), a critical segment for enterprise branch deployments. Infrastructure professionals selecting mid-range branch firewalls would miss this option entirely.

### 1.3 MISSING: PA-3400 Series (CRITICAL)

The PA-3400 Series is another new product line absent from our catalog, replacing the end-of-sale PA-3200 Series.

**Confirmed models from web verification:**

| Model | Firewall Throughput | Threat Prevention | IPSec VPN | Max Sessions | Interfaces |
|-------|-------------------|-------------------|-----------|-------------|------------|
| PA-3410 | 14 Gbps | 7.5 Gbps | (not confirmed) | (not confirmed) | 12x Multi-Gig (1G/2.5G/5G/10G), 10x SFP/SFP+ (1G/10G), 4x SFP28 (25G) |
| PA-3420 | 19 Gbps | 10 Gbps | (not confirmed) | (not confirmed) | Same as PA-3410 |
| PA-3430 | 29 Gbps | 15 Gbps | (not confirmed) | (not confirmed) | 12x Multi-Gig, SFP/SFP+, QSFP ports |
| PA-3440 | 35 Gbps | 20 Gbps | 14.5 Gbps | (not confirmed) | 12x Multi-Gig, SFP/SFP+, QSFP ports |

**SSL Decryption Performance (also verified):**
- PA-3410: 14.5 Gbps FW / 5.2 Gbps TP
- PA-3420: 20.8 Gbps FW / 7.6 Gbps TP
- PA-3430: 25.5 Gbps FW / 9.2 Gbps TP
- PA-3440: 30.2 Gbps FW / 11.0 Gbps TP

**Key characteristics:**
- 1U rack-mountable form factor
- 12x Multi-Gig (1G/2.5G/5G/10G) copper ports built-in
- Designed for internet gateway and data center edge deployments
- Zero Touch Provisioning (ZTP) support
- Panorama centralized management support
- Lifecycle: **active**
- Architecture role: Internet Gateway / Data Center Edge

**Impact**: The PA-3400 is the direct replacement for the end-of-sale PA-3200 series. Without it, our catalog has a critical throughput gap between the PA-400 series (up to 5.4 Gbps) and the PA-5400 series (53.5+ Gbps).

### 1.4 PA-400 Series -- Verification

| Field | Our Data | Verified | Status |
|-------|----------|----------|--------|
| Product name | PA-Series Firewalls | Correct | MATCH |
| infraNodeTypes | ['firewall'] | Correct | MATCH |
| architectureRole | Perimeter / Internal Segmentation / Data Center Edge | Reasonable | MATCH |
| PA-410 throughput | 2.4 Gbps FW | Cannot independently verify (SPA website) | UNVERIFIED |
| PA-415 throughput | 3.0 Gbps FW | Cannot independently verify | UNVERIFIED |
| PA-440 throughput | 3.7 Gbps FW | Cannot independently verify | UNVERIFIED |
| PA-445 throughput | 4.0 Gbps FW | Cannot independently verify | UNVERIFIED |
| PA-450 throughput | 5.2 Gbps FW | Cannot independently verify | UNVERIFIED |
| PA-460 throughput | 5.4 Gbps FW | Cannot independently verify | UNVERIFIED |
| PA-400 lifecycle | active | Likely correct | PLAUSIBLE |

**Note**: The PA-400 specs in our catalog appear consistent with publicly known data from my training knowledge. The individual model throughput progression (2.4/3.0/3.7/4.0/5.2/5.4 Gbps) follows the expected pattern.

### 1.5 PA-800 Series -- Lifecycle Issue

| Field | Our Data | Verified | Status |
|-------|----------|----------|--------|
| PA-820 lifecycle | end-of-sale | Correct | MATCH |
| PA-850 lifecycle | end-of-sale | Correct | MATCH |

**Note**: The PA-800 series is correctly marked as `end-of-sale`. The PA-1400 series appears to be its replacement for the mid-range branch segment.

### 1.6 PA-3200 Series -- Lifecycle Correct

| Field | Our Data | Verified | Status |
|-------|----------|----------|--------|
| PA-3220 lifecycle | end-of-sale | Correct | MATCH |
| PA-3250 lifecycle | end-of-sale | Correct | MATCH |
| PA-3260 lifecycle | end-of-sale | Correct | MATCH |

**Note**: Correctly marked. The PA-3400 is the replacement.

### 1.7 PA-5200 Series -- Lifecycle Correct

All PA-5200 models (PA-5220, PA-5250, PA-5260, PA-5280) are marked `end-of-sale`. This appears correct; the PA-5400 is the current-gen replacement.

### 1.8 PA-7000 Series -- Lifecycle Correct

PA-7050 and PA-7080 are marked `end-of-sale`. This appears correct; the PA-7500 is the replacement.

### 1.9 PA-5400 Series -- Generally Correct

The PA-5400 series (PA-5410 through PA-5450) is marked `active` with detailed specs. The data appears consistent with known specifications, though exact numbers could not be independently verified due to the SPA website limitation.

### 1.10 PA-7500 Series -- Data Appears Correct

The PA-7500 with 1.5 Tbps App-ID performance and FE400 NPU is consistent with known launch data. Lifecycle `active` is correct.

---

## 2. VM-Series (nodeId: pan-vm-series)

### 2.1 LIFECYCLE ERROR (CRITICAL)

**Our catalog**: All VM-Series models (VM-50 through VM-700) marked as `lifecycle: 'active'`

**Verified reality**: According to the official Palo Alto Networks End-of-Life Summary page:
- **End-of-Sale**: July 31, 2021
- **End-of-Life**: July 31, 2024
- **Replacement**: Software NGFW Credits licensing model

**All VM-Series fixed-license models should be marked `end-of-life`**, not `active`. The traditional VM-50/100/300/500/700 model naming with fixed licenses has been discontinued and replaced by a credit-based licensing model ("Software NGFW Credits").

**Impact**: This is a critical data quality issue. Recommending VM-50 through VM-700 as active products would mislead infrastructure professionals. They need to know about the Software NGFW Credits model instead.

### 2.2 URL Verification

| URL in Catalog | Status | Correct URL |
|---------------|--------|-------------|
| `.../next-generation-firewall/vm-series` | **404** | `.../vm-series-virtual-next-generation-firewall` |

The VM-Series URL needs updating to: `https://www.paloaltonetworks.com/network-security/vm-series-virtual-next-generation-firewall`

### 2.3 MISSING: Software NGFW Credits Model

The new licensing model for virtual firewalls (Software NGFW Credits) is not represented in our catalog. This is the current way customers purchase and deploy VM-Series virtual firewalls.

---

## 3. CN-Series (nodeId: pan-cn-series)

| Field | Our Data | Verified | Status |
|-------|----------|----------|--------|
| URL | `.../cn-series` | Exists in sitemap | MATCH |
| Description | Kubernetes-native container NGFWs | Consistent | MATCH |
| infraNodeTypes | ['firewall', 'kubernetes'] | Reasonable | MATCH |

CN-Series URL is valid per the sitemap. The product appears still active.

---

## 4. Cloud NGFW (nodeId: pan-cloud-ngfw)

| Field | Our Data | Verified | Status |
|-------|----------|----------|--------|
| Description | Cloud-managed NGFW-as-a-service for AWS and Azure | Consistent | MATCH |
| Children | AWS and Azure variants | Correct | MATCH |
| URL | Not in main sitemap but product exists | PLAUSIBLE |

---

## 5. SASE & SD-WAN (nodeId: pan-sase)

### 5.1 Prisma Access -- Needs URL Verification

The Prisma Access product appears to still be active and sold under that name. However, the URL structure needs verification.

| Field | Our Data | Status |
|-------|----------|--------|
| Name | Prisma Access | Still current |
| Description | ZTNA 2.0, SWG, CASB, FWaaS, DLP | Consistent |
| Prisma Access Browser | Listed as child | Appears correct |
| ADEM | Listed as child | Appears correct |

### 5.2 Prisma SD-WAN -- ION Appliances

The ION series appliance data (ION 1200, 2000, 3200, 9000) could not be independently verified via web crawling. The product line appears still active.

### 5.3 GlobalProtect -- Correct

GlobalProtect as a VPN/endpoint protection solution appears accurate and still active.

---

## 6. Cloud Security (nodeId: pan-cloud-security)

### 6.1 MAJOR CHANGE: Prisma Cloud --> Cortex Cloud (CRITICAL)

**Our catalog**: Lists "Prisma Cloud" as a standalone product line under Cloud Security with children: CSPM, CWPP, Code Security, CIEM.

**Verified reality**: As of **February 13, 2025**, Palo Alto Networks merged Prisma Cloud with Cortex CDR to form **Cortex Cloud**.

Key changes:
- Prisma Cloud is no longer a standalone product
- It has been merged into the Cortex platform as "Cortex Cloud"
- Combines CNAPP (from Prisma Cloud) with CDR (from Cortex)
- Existing Prisma Cloud customers were transitioned automatically in Q3 FY2025
- Cortex Cloud integrates with the Cortex XSIAM platform
- **Cortex Cloud 2.0** was announced in October 2025

**Impact**: Our catalog's entire Cloud Security category structure needs restructuring. Prisma Cloud should either be marked as deprecated/rebranded or moved under the Security Operations (Cortex) category as "Cortex Cloud."

### 6.2 SaaS Security -- Likely Still Active

The SaaS Security product appears to still be active, though it may now be positioned differently within the Palo Alto Networks portfolio.

---

## 7. Security Operations (nodeId: pan-secops)

### 7.1 Cortex Products

| Product | Our Data | Verified Status | Notes |
|---------|----------|----------------|-------|
| Cortex XDR | Active | Active | Still available |
| Cortex XSOAR | Active | Needs verification | May be consolidated into XSIAM |
| Cortex XSIAM | Active | Active | Primary SOC platform |
| Cortex Xpanse | Active | Active | Attack surface management |
| Unit 42 | Active | Active | Threat intelligence team |

### 7.2 MISSING: Cortex Cloud

The new Cortex Cloud product (merged from Prisma Cloud + CDR) should be added under this category. It combines cloud security posture management with cloud detection and response.

### 7.3 MISSING: Cortex AgentiX

A new product announced in October 2025 for AI-powered security automation. May need representation in the catalog.

---

## 8. Advanced Threat Prevention (nodeId: pan-threat-prevention)

| Product | Our Data | Status |
|---------|----------|--------|
| Advanced Threat Prevention | Correct | MATCH |
| Advanced URL Filtering | Correct | MATCH |
| WildFire | Correct | MATCH |
| DNS Security | Correct | MATCH |
| IoT Security | Correct | MATCH |

### 8.1 MISSING: OT Security

The sitemap shows a dedicated OT Security Solution URL: `https://www.paloaltonetworks.com/network-security/ot-security-solution`. This is a distinct product from IoT Security focused on industrial/operational technology environments. It should be considered for addition.

### 8.2 MISSING: 5G Security

The sitemap shows a 5G Security URL: `https://www.paloaltonetworks.com/network-security/5g-security`. This is a specialized offering that may be relevant for telecom/service provider architectures.

### 8.3 MISSING: Precision AI Security

Identified in the sitemap as a new AI-driven security category: `https://www.paloaltonetworks.com/precision-ai-security`. Sub-products include:
- Secure AI by Design
- Copilots

This appears to be a significant new product category focused on securing AI workloads and using AI for security operations.

### 8.4 MISSING: Prisma AIRS (AI Runtime Security)

Announced alongside Cortex Cloud 2.0 in October 2025, Prisma AIRS 2.0 addresses agentic AI security and integrates capabilities from the Protect AI acquisition.

---

## 9. Management (nodeId: pan-management)

### 9.1 Panorama -- Needs Verification

| Field | Our Data | Status |
|-------|----------|--------|
| M-600 specs | Up to 10,000 FW, 16TB, 2RU | Plausible but unverified |
| M-300 specs | Up to 5,000 FW, 8TB, 1RU | Plausible but unverified |
| Virtual appliance | Listed | Correct |
| URL | `.../panorama` | Valid per sitemap | MATCH |

**Note**: Could not verify if there is a newer M-700 model. The M-300 and M-600 data appears consistent with known information.

### 9.2 Strata Cloud Manager -- Correct

The product is listed and appears active. This is the cloud-based management platform that complements Panorama.

---

## Summary of Findings

### Critical Issues (Must Fix)

| # | Issue | Impact | Action |
|---|-------|--------|--------|
| 1 | **PA-1400 Series missing** | Missing 2 active models for enterprise branch | Add PA-1410, PA-1420 |
| 2 | **PA-3400 Series missing** | Missing 4 active models for data center edge | Add PA-3410, PA-3420, PA-3430, PA-3440 |
| 3 | **VM-Series lifecycle wrong** | All models marked active, actually end-of-life since July 2024 | Change to `end-of-life` |
| 4 | **Prisma Cloud --> Cortex Cloud** | Major product rebranding/merge in Feb 2025 | Restructure Cloud Security category |
| 5 | **All PA-Series source URLs broken** | Every `sourceUrl` under PA-Series returns 404 | Update all URLs |

### High Priority Issues

| # | Issue | Impact | Action |
|---|-------|--------|--------|
| 6 | VM-Series URL incorrect | Returns 404 | Update to new URL |
| 7 | Software NGFW Credits model missing | New VM-Series licensing not represented | Add new product node |
| 8 | Cortex Cloud product missing | New combined cloud security product | Add under SecOps |
| 9 | Cortex AgentiX missing | New AI automation product (Oct 2025) | Add under SecOps |

### Medium Priority Issues

| # | Issue | Impact | Action |
|---|-------|--------|--------|
| 10 | OT Security product missing | Dedicated OT/ICS security offering | Add under Threat Prevention |
| 11 | 5G Security product missing | Telecom-specific security | Add under Threat Prevention |
| 12 | Precision AI Security missing | New AI security category | Add as new top-level category |
| 13 | Prisma AIRS missing | AI Runtime Security (Oct 2025) | Add under appropriate category |

### Data Quality Summary

| Metric | Count |
|--------|-------|
| Products verified as correct | ~45 (categories, descriptions, roles) |
| Products with wrong lifecycle | 5 (all VM-Series fixed-license models) |
| Products with broken URLs | ~25 (all PA-Series models + VM-Series) |
| Missing product series | 2 (PA-1400, PA-3400 = 6 models) |
| Missing individual products | 4+ (Cortex Cloud, AgentiX, OT Security, etc.) |
| Major rebranding missed | 1 (Prisma Cloud --> Cortex Cloud) |

---

## Crawling Limitations

The Palo Alto Networks website (`paloaltonetworks.com`) is a fully JavaScript-rendered Single Page Application (SPA). The WebFetch tool cannot extract meaningful content from any product page because the pages only contain jQuery/JS framework code without server-side rendered HTML.

**Successful data sources:**
- `paloaltonetworks.com/sitemap.xml` -- revealed correct URL structure
- `paloaltonetworks.com/services/support/end-of-life-announcements/end-of-life-summary` -- confirmed VM-Series EOL
- Brave Search results -- confirmed PA-1400 and PA-3400 series existence and specs
- Brave Search results -- confirmed Prisma Cloud to Cortex Cloud transition

**Recommendation**: For future crawling of Palo Alto Networks products, use:
1. Brave Search as a secondary data source
2. Official datasheets (PDF downloads if available)
3. The `docs.paloaltonetworks.com` documentation portal (also partially SPA-rendered)
4. Reseller/partner sites that may have crawlable product listings

---

## Proposed Field Suggestions

### 1. `replacedBy` field

**Rationale**: With PA-800 being replaced by PA-1400, PA-3200 by PA-3400, PA-5200 by PA-5400, and VM-Series fixed models by Software NGFW Credits, infrastructure professionals need to know the upgrade path.

```typescript
/** nodeId of the replacement product (for end-of-sale/end-of-life products) */
replacedBy?: string;
```

### 2. `licensingModel` field

**Rationale**: The shift from fixed-license VM-Series to credit-based Software NGFW Credits fundamentally changes procurement decisions. An infrastructure professional needs to know whether they are buying a fixed SKU or a credit-based subscription.

```typescript
/** Licensing model: 'perpetual' | 'subscription' | 'credit-based' | 'as-a-service' */
licensingModel?: 'perpetual' | 'subscription' | 'credit-based' | 'as-a-service';
```

Both fields are optional and backward compatible.
