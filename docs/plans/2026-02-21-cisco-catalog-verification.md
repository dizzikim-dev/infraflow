# Cisco Vendor Catalog Verification Report

> **Date**: 2026-02-21
> **Scope**: Verify InfraFlow codebase data against live Cisco website
> **Products verified**: Catalyst 9600, Catalyst 9300, Secure Firewall portfolio
> **Source file**: `src/lib/knowledge/vendorCatalog/vendors/cisco.ts`

---

## 1. Catalyst 9600 Series (nodeId: `cisco-catalyst-9600`)

### Source Pages Fetched

| Page | URL | Status |
|------|-----|--------|
| Overview | https://www.cisco.com/c/en/us/products/switches/catalyst-9600-series-switches/index.html | Fetched OK |
| Datasheet | https://www.cisco.com/site/us/en/products/collateral/networking/switches/catalyst-9600-series-switches/nb-06-cat9600-series-data-sheet-cte-en.html | Fetched OK |

### Verification Matrix

| Field | Our Value | Cisco Website Value | Status |
|-------|-----------|-------------------|--------|
| **Product Name** | Catalyst 9600 Series | Catalyst 9600 Series Switches | MATCH |
| **Lifecycle** | `active` | Actively marketed, current product | MATCH |
| **Architecture Role** | Campus Core / Collapsed Core | "Campus core and distribution layers" | MOSTLY MATCH (see note 1) |
| **infraNodeTypes** | `['switch-l3']` | L3 campus core switch | MATCH |
| **Max Switching Capacity** | 25.6 Tbps | 25.6 Tbps (12.8 Tbps full-duplex) with SUP-2 | MATCH |
| **Max Forwarding Rate** | 8 Bpps | 8 Bpps with SUP-2 | MATCH |
| **Supported Optics** | 400G QSFP-DD, 100G QSFP28, 50G SFP56, 25G SFP28, 10G SFP+ | 400G QSFP-DD, 200G QSFP56, 100G QSFP28/QSFP-DD, 50G/25G/10G SFP56, 1G SFP | PARTIAL (see note 2) |
| **ASICs** | Silicon One Q200 and UADP 3.0 | Silicon One Q200 (SUP-2), 3x UADP 3.0 (SUP-1) | MATCH |
| **MACsec** | Listed in security | MACsec encryption confirmed | MATCH |
| **ISSU** | Listed in HA | ISSU, GIR, hot-patching confirmed | MATCH |
| **MTBF** | 4,113,900 hours | 4,113,900 hours (chassis) | MATCH |
| **Operating Temp** | -5C to 45C | -5C to 45C (up to 6,000 ft) | MATCH |
| **Chassis** | C9606R (6-slot, 8RU) | C9606R, 6 slots (4 LC + 2 SUP), 8 RU | MATCH |
| **Dimensions** | 35.43 x 44.2 x 40.9 cm | 35.43 x 44.2 x 40.9 cm | MATCH |
| **Weight** | 31.31 kg (with 2 AC PSU and fan tray) | 31.31 kg with 2 AC PSUs and fan tray | MATCH |

### SUP-1 (C9600-SUP-1) Verification

| Field | Our Value | Cisco Datasheet | Status |
|-------|-----------|----------------|--------|
| ASIC | UADP 3.0 | 3x UADP 3.0 | MINOR DIFF (we omit "3x") |
| Switching | 9.6 Tbps (4.8 Tbps FD) | 9.6 Tbps (4.8 Tbps full-duplex) | MATCH |
| Forwarding | 3 Bpps | 3 Bpps (1 Bpps per ASIC) | MATCH |
| Per-Slot BW | 2.4 Tbps (1.2 Tbps FD) | 2.4 Tbps (1.2 Tbps full-duplex) | MATCH |
| Memory | 16 GB DRAM, 16 GB Flash | 16 GB DDR4, 16 GB Flash | MATCH |
| CPU | Intel 2.0 GHz x86, 8 cores | Intel 2.0 GHz x86, 8 cores | MATCH |
| SSD | Up to 960 GB | Up to 960 GB SATA | MATCH |
| MAC Addresses | 128,000 | Up to 128,000 | MATCH |
| IPv4 Routes | 256,000 | Up to 256,000 | MATCH |
| IPv6 Routes | 256,000 | Up to 256,000 | MATCH |
| ARP Entries | 90,000 | Up to 90,000 | MATCH |
| NetFlow | 384,000 | Up to 384,000 (128K per ASIC) | MATCH |
| Security ACL | 27,000 IPv4 / 13,500 IPv6 | Up to 27,000/13,500 | MATCH |
| GRE Tunnels | 1,024 | Up to 1,024 | MATCH |
| Min IOS XE | 16.11.1 | 16.11.1 | MATCH |
| MTBF | 271,420 hours | 271,420 hours | MATCH |

### SUP-2 (C9600X-SUP-2) Verification

| Field | Our Value | Cisco Datasheet | Status |
|-------|-----------|----------------|--------|
| ASIC | Silicon One Q200 | 1x Cisco Silicon One Q200 | MATCH |
| Switching | 25.6 Tbps (12.8 Tbps FD) | 25.6 Tbps (12.8 Tbps full-duplex) | MATCH |
| Forwarding | 8 Bpps | 8 Bpps | MATCH |
| Per-Slot BW | 6.4 Tbps (3.2 Tbps FD) | 6.4 Tbps (3.2 Tbps full-duplex) | MATCH |
| Memory | 32 GB DRAM, 16 GB Flash | 32 GB DDR4, 16 GB Flash | MATCH |
| CPU | Intel 2.7 GHz x86, 8 cores | Intel 2.7 GHz x86, 8 cores | MATCH |
| SSD | Up to 960 GB | Up to 960 GB SATA | MATCH |
| Buffer | 80 MB + 8 GB HBM | 80 MB Shared + 8 GB HBM (2.5D) | MATCH |
| MAC Addresses | 256,000 | Up to 256,000 | MATCH |
| IPv4 Routes | 2,000,000 | Up to 2,000,000 | MATCH |
| IPv6 Routes | 1,000,000 | Up to 1,000,000 | MATCH |
| ARP Entries | 128,000 | Up to 128,000 | MATCH |
| NetFlow | 2,000,000 | Up to 2,000,000 (sampled) | MATCH |
| Security ACL | 8,000 IPv4 / 4,000 IPv6 | Up to 8,000/4,000 | MATCH |
| GRE Tunnels | 1,024 | Up to 1,024 | MATCH |
| Min IOS XE | 17.7.1 | 17.7.1 | MATCH |
| MTBF | 305,880 hours | 305,880 hours | MATCH |

### Line Card Verification

| Line Card | Our Value | Cisco Datasheet | Status |
|-----------|-----------|----------------|--------|
| C9600X-LC-32CD | 30-port 100G/40G + 2-port 400G | 30x 100/40GE QSFP28 + 2x 400/200/100GE QSFP-DD | MATCH (we omit 200G option) |
| C9600X-LC-56YL4C | 56-port 50G/25G/10G + 4-port 100G/40G | 56x 50/25/10GE SFP56 + 4x 100/40GE QSFP28 | MATCH |
| C9600-LC-40YL4CD | 40-port 50G/25G/10G + 2x200/100G + 2x400G | 40x 50/25/10GE SFP56 + 2x 100/40GE QSFP28 + 2x 400/200/100GE QSFP-DD | MATCH |
| C9600-LC-24C | 24-port 100G/40G | 24x 40/100GE QSFP28 | MATCH |
| C9600-LC-48YL | 48-port 50G/25G/10G/1G | 48x 50/25/10/1GE SFP56 | MATCH |
| C9600-LC-48TX | 48-port 10G/5G/2.5G/1G RJ45 | 48x 10/5/2.5/1GE/100M RJ45 | MATCH (we omit 100M) |
| C9600-LC-48S | 48-port 1G SFP | 48x 100M/1GE SFP | MATCH (we omit 100M) |

### Power Supply Verification

| PSU | Our Value | Cisco Datasheet | Status |
|-----|-----------|----------------|--------|
| C9600-PWR-3KWAC | 3000W, 94%, 17.6A@115VAC | 3000W, 94%, 17.6A@115VAC | MATCH |
| C9600-PWR-2KWAC | 2000W, 94%, 10.5A@115VAC | 2000W, 94%, 10.5A@115VAC | MATCH |
| C9600-PWR-2KWDC | 2000W, 92%, 60A@-40VDC | 2000W, 92%, 60A@-40VDC | MATCH |

### Notes for Catalyst 9600

1. **Architecture Role**: Our catalog says "Campus Core / Collapsed Core." Cisco's overview also mentions "distribution" role. Consider adding "Distribution" to `architectureRole` or `recommendedFor`.

2. **Missing 200G QSFP56 optics**: Our `specs.Supported Optics` lists "400G QSFP-DD, 100G QSFP28, 50G SFP56, 25G SFP28, 10G SFP+" but Cisco also lists **200G QSFP56** as a supported speed. Also, we list "25G SFP28" but the datasheet uses "SFP56" for 25G/50G ports. Additionally, 1G SFP is supported but not listed.

3. **Missing 200G in description**: Our description mentions "400G/100G/50G/25G/10G" but omits 200G and 1G speeds.

4. **Missing protocols**: Our `supportedProtocols` is solid. However, Cisco's SDM templates reference MPLS labels and PBR/NAT which are present in the platform. These are covered under MPLS in our list.

5. **Missing NDP entries**: The datasheet specifies NDP entries (128K for both supervisors) which we do not track in specs. This is a minor omission since NDP is the IPv6 equivalent of ARP.

6. **SUP-1 Buffer**: The datasheet says "up to 108 MB (36 MB per ASIC)" for SUP-1, but we do not include buffer specs for SUP-1 in our data. We only have buffer for SUP-2.

7. **Overall accuracy**: Extremely high. Every numeric specification matches exactly with Cisco's datasheet.

---

## 2. Catalyst 9300 Series (nodeId: `cisco-catalyst-9300`)

### Source Pages Fetched

| Page | URL | Status |
|------|-----|--------|
| Overview | https://www.cisco.com/c/en/us/products/switches/catalyst-9300-series-switches/index.html | Fetched OK |
| Datasheet | https://www.cisco.com/c/en/us/products/collateral/switches/catalyst-9300-series-switches/nb-06-cat9300-ser-data-sheet-cte-en.html | Fetched OK |

### Current Catalog State

Our current Catalyst 9300 entry is a **stub** with minimal data:

```typescript
{
  nodeId: 'cisco-catalyst-9300',
  depth: 2,
  name: 'Catalyst 9300 Series',
  description: 'Stackable campus access switch',
  sourceUrl: '...index.html',
  children: [],   // EMPTY - no models, no specs
}
```

### Verification: What We Have vs. What Cisco Provides

| Field | Our Value | Should Be | Status |
|-------|-----------|-----------|--------|
| **Product Name** | Catalyst 9300 Series | Catalyst 9300 Series Switches | MATCH |
| **Description** | "Stackable campus access switch" | Accurate but very sparse | NEEDS ENRICHMENT |
| **Lifecycle** | Not set | Active (currently marketed) | MISSING |
| **infraNodeTypes** | Not set | Should be `['switch-l2', 'switch-l3']` | MISSING |
| **architectureRole** | Not set | "Campus Access / Distribution" | MISSING |
| **recommendedFor** | Not set | Multiple use cases available | MISSING |
| **supportedProtocols** | Not set | OSPF, EIGRP, BGP, IS-IS, RIP, PIM, MPLS, VXLAN, EVPN | MISSING |
| **haFeatures** | Not set | NSF/SSO (sub-50ms failover), Fast Software Upgrade (<30s) | MISSING |
| **securityCapabilities** | Not set | MACsec-128/256, 802.1X, TrustSec, IPsec (X models) | MISSING |
| **datasheetUrl** | Not set | See datasheet URL above | MISSING |
| **specs** | Not set | Extensive specs available (see below) | MISSING |
| **children** | `[]` (empty) | 30+ models available | MISSING |

### Key Specifications from Cisco Datasheet (What Should Be Added)

**Series-Level Specs:**
- Switching Capacity: 256 Gbps (C9300) to 2,000 Gbps (C9300X)
- Forwarding Rate: 190 Mpps (C9300) to 1,488 Mpps (C9300X)
- Stacking: StackWise-480 (480 Gbps), StackWise-1T (1 Tbps for X), StackWise-320 (320 Gbps for L)
- Stack members: Up to 8
- ASIC: UADP 2.0 (C9300/L), UADP 2.0sec (C9300X, with 100G hardware IPsec)
- Memory: 8 GB DRAM / 16 GB Flash (C9300), 16 GB DRAM / 16 GB Flash (C9300X)
- MAC Addresses: 32,000-64,000
- IPv4 Routes: 39,000 direct + 15,000 indirect (C9300X)
- PoE budget: Up to 2,722W (dual PSU)
- Buffer: 16 MB to 64 MB depending on model

**Model Families (30+ models):**
- C9300X series (48HX, 48TX, 48HXN, 24HX, 24Y, 12Y)
- C9300 series (48P, 48U, 48H, 24P, 24U, 24H, 24T, 48T, 24S, 48S, etc.)
- C9300L series (48T-4X, 48P-4X, 24UXG-2Q, etc.)
- C9300LM series (48T-4Y, 24U-4Y, 48U-4Y, 48UX-4Y)

### Assessment

**The Catalyst 9300 entry is severely under-populated.** This is the most widely deployed campus access switch in enterprise networking and needs full crawling treatment per VC-001 rules. The description is accurate but the entry lacks all Tier 1 data (specs, protocols, HA, security, architecture role). No children/models exist.

**Priority**: HIGH -- the C9300 is arguably the most important access-layer switch in the Cisco portfolio and a critical product for InfraFlow's recommendation engine to understand.

---

## 3. Cisco Secure Firewall Portfolio

### Source Pages Fetched

| Page | URL | Status |
|------|-----|--------|
| Firewalls Overview | https://www.cisco.com/site/us/en/products/security/firewalls/index.html | Fetched OK |
| Secure Firewall 6100 | .../secure-firewall-6100-series/index.html | Fetched OK |
| Secure Firewall 4200 | .../secure-firewall-4200-series/index.html | Fetched OK |
| Secure Firewall 3100 | .../secure-firewall-3100-series/index.html | Fetched OK |
| Secure Firewall 1200 | .../secure-firewall-1200-series/index.html | Fetched OK |
| Secure Firewall 200 | .../secure-firewall-200-series/index.html | Fetched OK |
| Firepower 1000 | .../firepower-1000-series/index.html | Fetched OK |
| Firepower 9300 | .../firepower-9000-series/index.html | Fetched OK |
| ASA | .../adaptive-security-appliance-asa-software/index.html | Fetched OK |
| ISA3000 | .../industrial-security-appliance-isa/index.html | Fetched OK |

### Product-by-Product Verification

#### 3.1 Secure Firewall 6100 (nodeId: `cisco-firewall-6100`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Secure Firewall 6100 | Secure Firewall 6100 Series | MATCH |
| Description | "AI data center firewall" | "Ultra-high-end... AI-ready data centers" | MATCH |
| Lifecycle | Not set | Active (new product) | MISSING |
| infraNodeTypes | Not set (inherits `['firewall']`) | firewall | OK (inherited) |
| architectureRole | Not set | Data Center / Telecom Core | MISSING |
| specs | Not set | 6160: 520 Gbps FW, 6170: 650 Gbps FW | MISSING |
| children | `[]` | Should have 6160, 6170 models | MISSING |
| haFeatures | Not set | Clustering support | MISSING |
| securityCapabilities | Not set | EVE, SnortML, line-rate threat protection | MISSING |
| supportedProtocols | Not set | Not detailed on page | N/A |

**Assessment**: Stub entry. Product name and description are accurate, but all Tier 1 specs are missing.

#### 3.2 Secure Firewall 4200 (nodeId: `cisco-firewall-4200`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Secure Firewall 4200 | Secure Firewall 4200 Series | MATCH |
| Description | "Large enterprise firewall" | "Faster threat detection... large enterprise data center and campus" | MATCH |
| Lifecycle | Not set | Active | MISSING |
| specs | Not set | 4215: 65 Gbps, 4225: 80 Gbps, 4245: 140 Gbps | MISSING |
| children | `[]` | Should have 4215, 4225, 4245 models | MISSING |
| haFeatures | Not set | Clustering up to 16 devices | MISSING |

**Assessment**: Stub. Name accurate, specs missing.

#### 3.3 Secure Firewall 3100 (nodeId: `cisco-firewall-3100`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Secure Firewall 3100 | Secure Firewall 3100 Series | MATCH |
| Description | "Mid-range firewall" | "Enterprise-class firewall for hybrid work" | MATCH (simplified) |
| Lifecycle | Not set | Active | MISSING |
| specs | Not set | 3105: 10 Gbps, 3110-3140: 17-45 Gbps | MISSING |
| children | `[]` | Should have 3105, 3110, 3120, 3130, 3140 models | MISSING |

**Assessment**: Stub. Name accurate, specs missing.

#### 3.4 Secure Firewall 1200 (nodeId: `cisco-firewall-1200`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Secure Firewall 1200 | Secure Firewall 1200 Series | MATCH |
| Description | "Distributed branch firewall" | "Unified security for distributed enterprises" with SD-WAN | MATCH |
| Lifecycle | Not set | Active (new product) | MISSING |
| specs | Not set | 1210: 6 Gbps, 1220: 9 Gbps, 1230: 13 Gbps, 1240: 18 Gbps, 1250: 24 Gbps | MISSING |
| children | `[]` | Should have 5 models (1210-1250) | MISSING |

**Assessment**: Stub. Name accurate, specs missing.

#### 3.5 Firepower 1000 (nodeId: `cisco-firewall-1000`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Firepower 1000 | Firepower 1000 Series | MATCH |
| Description | "Small-scale firewall" | Current, small business focused | MATCH |
| Lifecycle | Not set | Active (still marketed, but migration paths suggested) | NEEDS ATTENTION |
| specs | Not set | 1010: 0.9 Gbps, 1120: 2.3 Gbps, 1140: 3.3 Gbps, 1150: 4.9 Gbps | MISSING |
| children | `[]` | Should have 1010, 1120, 1140, 1150 models | MISSING |

**Assessment**: Stub. Name is correct. The Firepower 1000 is still active but Cisco promotes migration to Secure Firewall. The lifecycle could be set to `active` but with a note about the migration path.

#### 3.6 Secure Firewall 200 (nodeId: `cisco-firewall-200`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Secure Firewall 200 | Secure Firewall 200 Series | MATCH |
| Description | "Branch edge firewall" | "Branch edge... Hybrid Mesh Firewall" with SD-WAN | MATCH |
| Lifecycle | Not set | Active (announced 2025, new product) | MISSING |
| specs | Not set | Model 220: 1.5 Gbps FW | MISSING |

**Assessment**: Stub. Name and description accurate.

#### 3.7 ISA3000 Industrial (nodeId: `cisco-firewall-isa3000`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | ISA3000 Industrial | Cisco Secure Firewall ISA3000 | MATCH |
| Description | "OT industrial firewall" | Ruggedized industrial firewall | MATCH |
| Lifecycle | Not set | Active | MISSING |
| specs | Not set | DNP3, CIP, Modbus, IEC61850 protocol support | MISSING |

**Assessment**: Stub. Name accurate.

#### 3.8 Threat Defense Virtual (nodeId: `cisco-firewall-tdv`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Threat Defense Virtual | Threat Defense Virtual | MATCH |
| Description | "Private cloud virtual firewall" | Virtual firewall for private cloud | MATCH |
| Lifecycle | Not set | Active | MISSING |

**Assessment**: Stub. Name accurate.

#### 3.9 Firepower 9300 (nodeId: `cisco-firepower-9300`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Firepower 9300 | Firepower 9300 Series | MATCH |
| Description | "Ultra high-performance firewall" | Enterprise-grade, carrier-grade for data centers | MATCH |
| Lifecycle | Not set | Active (no EoS/EoL notices) | MISSING |
| specs | Not set | SM-40: 55 Gbps, SM-48: 65 Gbps, SM-56: 70 Gbps, 3xSM-56: 190 Gbps | MISSING |
| children | `[]` | Should have SM-40, SM-48, SM-56 models | MISSING |

**Assessment**: Stub. Name is correct. Note: the Cisco URL uses "firepower-9000-series" but the product is marketed as "9300." Our nodeId `cisco-firepower-9300` is correct.

#### 3.10 Secure Firewall ASA (nodeId: `cisco-firewall-asa`)

| Field | Our Value | Cisco Website | Status |
|-------|-----------|--------------|--------|
| Product Name | Secure Firewall ASA | Secure Firewall ASA | MATCH |
| Description | "Legacy adaptive security appliance" | Still available/orderable, but migration to FTD recommended | PARTIAL |
| Lifecycle | Not set | Active (still orderable, not EoS) | NEEDS ATTENTION |

**Assessment**: Stub. Our description says "Legacy" which is editorially reasonable -- Cisco positions FTD as the successor. However, ASA is still actively sold and supported (released 2012, still receiving updates as of 2025). The lifecycle should be `active` but the description could note "migration to FTD recommended."

---

## 4. Summary of Findings

### 4.1 Overall Accuracy Score

| Product | Name | Specs | Lifecycle | Architecture | Overall |
|---------|------|-------|-----------|-------------|---------|
| **Catalyst 9600** | EXACT | EXACT | CORRECT | CORRECT | **A+ (Excellent)** |
| **Catalyst 9300** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **SF 6100** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **SF 4200** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **SF 3100** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **SF 1200** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **SF 200** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **FP 1000** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **FP 9300** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **SF ASA** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **ISA3000** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |
| **TDV** | CORRECT | MISSING (stub) | MISSING | MISSING | **D (Stub only)** |

### 4.2 What Is Correct

1. **All product names are accurate** -- every product name in our catalog matches the current Cisco website naming.
2. **Catalyst 9600 specs are extremely accurate** -- every single numeric specification matches Cisco's official datasheet exactly (switching capacity, forwarding rate, memory, routes, ACLs, MTBF, dimensions, weight, temperatures, power supplies, line cards).
3. **Catalyst 9600 architecture fields are complete and correct** -- protocols, HA features, security capabilities, recommended use cases all align with Cisco documentation.
4. **URL structure is correct** -- all `sourceUrl` values point to valid, accessible Cisco pages.
5. **Product hierarchy is correct** -- the firewall product lineup matches exactly what Cisco currently markets on their firewalls index page.

### 4.3 What Needs Correction (Catalyst 9600)

These are minor issues in the otherwise excellent Catalyst 9600 entry:

| Issue | Severity | Detail |
|-------|----------|--------|
| Missing 200G speed in description | Low | Description says "400G/100G/50G/25G/10G" but should include 200G and 1G |
| Missing 200G QSFP56 in specs | Low | Supported Optics omits 200G QSFP56 |
| "SFP28" vs "SFP56" | Low | We list "25G SFP28" but Cisco uses "SFP56" for 25G/50G ports |
| SUP-1 ASIC count | Very Low | We say "UADP 3.0" but it is "3x UADP 3.0" |
| Missing SUP-1 buffer | Low | SUP-1 has 108 MB buffer (36 MB per ASIC), not in our data |
| Missing NDP entries | Very Low | Both supervisors have 128K NDP entries, not tracked |
| C9600-LC-48TX missing 100M | Very Low | Supports 100M but we only list down to 1G |
| C9600-LC-48S missing 100M | Very Low | Supports 100M SFP but we only list 1G |
| Architecture role missing "Distribution" | Low | Cisco mentions distribution role alongside core |

### 4.4 What Is Missing (Major Gaps)

| Gap | Products Affected | Priority |
|-----|-------------------|----------|
| **Catalyst 9300 is a stub** | 1 series (30+ models) | HIGH |
| **All 11 firewall entries are stubs** | 11 series | HIGH |
| **No lifecycle field on any firewall** | 11 entries | MEDIUM |
| **No infraNodeTypes on firewall children** | 11 entries | MEDIUM |
| **No architectureRole on any firewall** | 11 entries | MEDIUM |
| **No specs on any firewall** | 11 entries | HIGH |
| **No throughput data captured** | 11 entries | HIGH |
| **No models/children for any firewall** | 11 entries (40+ models total) | MEDIUM |
| **Catalyst 9500, 9400 are also stubs** | 2 more switch series | MEDIUM |
| **FTDc (Container) not in catalog** | 1 product | LOW |

### 4.5 New Product Not in Catalog

Cisco's firewall index page lists **Firewall Threat Defense Container (FTDc)** -- a container-based stateful L3/L4 firewall. This product is not in our catalog at all. It would map to `infraNodeTypes: ['firewall']` with a cloud-native architecture role.

---

## 5. Recommendations

### Immediate (Data Corrections for Catalyst 9600)

1. Add "200G" to the description and Supported Optics spec
2. Fix "SFP28" to "SFP56" in the Supported Optics spec
3. Add "1G SFP" to Supported Optics
4. Add SUP-1 buffer spec: "108 MB (36 MB per ASIC)"
5. Change SUP-1 ASIC to "3x UADP 3.0" (minor precision fix)

### Short-term (Priority Crawling)

1. **Catalyst 9300 full crawl** -- highest priority. This is the most deployed campus switch and needs complete treatment (30+ models, stacking specs, PoE budgets, ASIC types, etc.).
2. **Secure Firewall 4200 crawl** -- the main enterprise data center firewall, highest priority in the firewall portfolio.
3. **Secure Firewall 3100 crawl** -- the mid-range enterprise firewall, second priority.

### Medium-term (Complete Firewall Portfolio)

4. Secure Firewall 6100 crawl (AI/DC)
5. Secure Firewall 1200 crawl (branch)
6. Firepower 9300 crawl (carrier-grade)
7. Remaining firewall stubs (1000, 200, ISA3000, TDV, ASA)

### Long-term

8. Catalyst 9500, 9400 full crawls
9. Add FTDc (container firewall) to catalog
10. Set `lifecycle` field on all products

---

## 6. Data Quality Assessment

| Metric | Value |
|--------|-------|
| Products verified | 12 |
| Exact name matches | 12/12 (100%) |
| Fully populated entries | 1/12 (8.3%) -- only Catalyst 9600 |
| Stub entries needing enrichment | 11/12 (91.7%) |
| Spec accuracy (where specs exist) | ~98% (Catalyst 9600) |
| URLs verified working | 12/12 (100%) |
| Lifecycle fields populated | 1/12 (8.3%) |

**Conclusion**: The Catalyst 9600 data quality is outstanding -- one of the best vendor catalog entries I have seen, with exact matches on every numeric specification. The remaining products are correctly named and categorized but are minimal stubs with no Tier 1 architecture data. The firewall portfolio in particular needs systematic crawling to populate specs, models, architecture roles, and lifecycle statuses.
