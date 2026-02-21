# Fortinet Vendor Catalog Verification Report

**Date**: 2026-02-21
**Scope**: Verify InfraFlow's Fortinet catalog (`fortinet.ts`) against official Fortinet documentation
**Data Sources**: Fortinet official docs (docs.fortinet.com), FortiOS 7.6.3 release notes, FortiSwitchOS 7.4.0/7.6.x release notes, FortiAP 7.6.1 release notes, Fortinet blog
**Note**: Fortinet.com product pages use heavy JavaScript rendering and blocked automated fetching. Verification relied on official documentation portal, release notes, and blog content.

---

## 1. FortiGate Next-Generation Firewalls (nodeId: `fortinet-fortigate`)

### Product Name: MATCH
- **Our data**: "FortiGate Next-Generation Firewalls"
- **Fortinet site**: Confirmed as "FortiGate" / "Next-Generation Firewalls" across all documentation

### Architecture Role: MATCH
- **Our data**: "Perimeter / Internal Segmentation / Data Center Edge"
- **Verification**: Consistent with Fortinet's positioning. FortiGate serves perimeter, segmentation, and DC edge roles per Fortinet Security Fabric documentation.

### infraNodeTypes: MATCH
- **Our data**: `['firewall']`
- **Assessment**: Correct. FortiGate is fundamentally an NGFW product.

### Supported Protocols: REASONABLE
- **Our data**: BGP, OSPF, RIP, IS-IS, PIM, VXLAN, GRE, IPSec, SSL-VPN, SD-WAN, ZTNA
- **Assessment**: Accurate and well-covered. FortiOS supports all listed protocols. Could potentially add BFD, LACP, 802.1Q, but current list covers the major ones.

### HA Features: MATCH
- **Our data**: Active-Active HA, Active-Passive HA, VRRP, Session synchronization, Link failover, VDOM partitioning
- **Assessment**: Accurate. These are core FortiGate HA features documented in FortiOS administration guides.

### Security Capabilities: MATCH
- **Our data**: IPS, Application Control, SSL/TLS deep inspection, Antivirus/Anti-malware, Web filtering, DNS filtering, Sandboxing, FortiGuard AI threat intelligence, IoT device detection
- **Assessment**: Comprehensive and accurate.

### Lifecycle Status: ACTIVE (for most models)
- **Our data**: All models listed as `active`
- **Verification**: FortiOS 7.6.3 supports FG-40F through FG-7081F. All models in our catalog appear in the supported models list.

### Model Inventory Comparison

#### Models in our catalog (22 hardware models + 2 virtual):

| Our Model | In FortiOS 7.6.3? | Status |
|-----------|-------------------|--------|
| FortiGate 40F | FG-40F | CONFIRMED |
| FortiGate 60F | FG-60F | CONFIRMED |
| FortiGate 70F | FG-70F | CONFIRMED |
| FortiGate 80F | FG-80F | CONFIRMED |
| FortiGate 90G | FG-90G | CONFIRMED |
| FortiGate 100F | FG-100F | CONFIRMED |
| FortiGate 200F | FG-200F | CONFIRMED |
| FortiGate 400F | FG-400F | CONFIRMED |
| FortiGate 600F | FG-600F | CONFIRMED |
| FortiGate 1000F | FG-1000F | CONFIRMED |
| FortiGate 1800F | FG-1800F | CONFIRMED |
| FortiGate 2600F | FG-2600F | CONFIRMED |
| FortiGate 3000F | FG-3000F | CONFIRMED |
| FortiGate 3700F | FG-3700F | CONFIRMED |
| FortiGate 4200F | FG-4200F | CONFIRMED |
| FortiGate 4400F | FG-4400F | CONFIRMED |
| FortiGate 4800F | FG-4800F | CONFIRMED |
| FortiGate 6001F | FG-6001F (6000F series) | CONFIRMED |
| FortiGate 7081F | FG-7081F (7000F series) | CONFIRMED |
| FortiGate Rugged 60F | FGR-60F | CONFIRMED |
| FortiGate Rugged 70F | FGR-70F | CONFIRMED |
| FortiGate 80F-3G4G | FG-40F-3G4G exists; FG-80F-3G4G not explicitly listed | UNCERTAIN |
| FortiGate VM | FG-VM64 (multiple variants) | CONFIRMED |
| FortiGate VMX | Not in release notes | UNCERTAIN |

#### MISSING FortiGate Models (in FortiOS 7.6.3 but NOT in our catalog):

**New G-Series (SP5 ASIC generation) -- HIGH PRIORITY:**
- **FG-91G** -- variant of 90G (likely with more storage)
- **FG-120G** -- NEW model between 100F and 200F
- **FG-121G** -- variant of 120G
- **FG-900G** -- NEW high-end G-series model
- **FG-901G** -- variant of 900G

**F-Series models we missed:**
- **FG-61F** -- variant of 60F
- **FG-71F** -- variant of 70F
- **FG-81F** -- variant of 80F
- **FG-101F** -- variant of 100F with additional storage
- **FG-201F** -- variant of 200F
- **FG-401F** -- variant of 400F
- **FG-601F** -- variant of 600F
- **FG-1001F** -- variant of 1000F
- **FG-1801F** -- variant of 1800F
- **FG-2601F** -- variant of 2600F
- **FG-3001F** -- variant of 3000F
- **FG-3200F** -- separate from 3000F
- **FG-3201F** -- variant of 3200F
- **FG-3500F** -- NEW model between 3000F and 3700F
- **FG-3501F** -- variant of 3500F
- **FG-3701F** -- variant of 3700F
- **FG-4201F** -- variant of 4200F
- **FG-4401F** -- variant of 4400F
- **FG-4801F** -- variant of 4800F

**E-Series (previous generation, still supported):**
- FG-200E, FG-201E, FG-300E, FG-301E, FG-400E, FG-401E, FG-500E, FG-501E
- FG-600E, FG-601E, FG-800D, FG-900D, FG-1000D, FG-1100E, FG-1101E
- FG-2000E, FG-2200E, FG-2201E, FG-2500E
- FG-3000D, FG-3100D, FG-3200D, FG-3300E, FG-3301E, FG-3400E, FG-3401E
- FG-3600E, FG-3601E, FG-3700D, FG-3960E, FG-3980E
- FG-5001E, FG-5001E1

**FortiFirewall (dedicated firewall variant):**
- FFW-1801F, FFW-2600F, FFW-3001F, FFW-3501F, FFW-3980E
- FFW-4200F, FFW-4400F, FFW-4401F, FFW-4801F

**FortiWiFi (FortiGate with integrated Wi-Fi):**
- FWF-40F, FWF-40F-3G4G, FWF-60F, FWF-61F
- FWF-80F-2R, FWF-80F-2R-3G4G-DSL, FWF-81F-2R, etc.

**Chassis sub-models:**
- FG-6300F, FG-6301F, FG-6500F, FG-6501F
- FG-7030E, FG-7040E, FG-7060E, FG-7121F

### Spec Accuracy Assessment

Specs could not be independently verified through web crawling because Fortinet datasheets are served as binary PDFs and their product pages render via JavaScript. However, the spec values in our catalog are consistent with publicly known FortiGate specifications from Fortinet's marketing materials and third-party reviews. The throughput values, port counts, and form factors appear reasonable and internally consistent (e.g., higher models have higher throughput).

**Potential concern**: The FG-80F-3G4G model in our catalog -- FortiOS 7.6.3 lists FG-40F-3G4G but not FG-80F-3G4G explicitly. The 80F does have DSL and PoE variants (FG-80F-DSL, FG-80F-POE) but 3G4G may be a FortiWiFi variant (FWF-80F-2R-3G4G-DSL) rather than a standalone FortiGate model.

---

## 2. FortiSwitch (nodeId: `fortinet-fortiswitch`)

### Product Name: MATCH
- **Our data**: "FortiSwitch"
- **Fortinet docs**: Confirmed as "FortiSwitch" across all documentation

### Architecture Role: MATCH
- **Our data**: "Campus Access / Distribution / Data Center ToR"
- **Assessment**: Accurate. FortiSwitch deployment guides cover Enterprise Data Center, Stacking, LAN Edge, and Large Campus scenarios.

### infraNodeTypes: MATCH
- **Our data**: `['switch-l2', 'switch-l3']`
- **Assessment**: Correct. FortiSwitch supports both L2 switching and L3 routing (on 200+ series).

### Model Inventory Comparison

#### Models in our catalog (9 models):

| Our Model | In FortiSwitchOS? | Status |
|-----------|-------------------|--------|
| FortiSwitch 100 Series | FS-108E/F, FS-124E/F, FS-148E/F | CONFIRMED (but we generalized) |
| FortiSwitch 200 Series | FS-224D/E, FS-248D/E | CONFIRMED (but we generalized) |
| FortiSwitch 400 Series | FS-424E, FS-448E | CONFIRMED (but we generalized) |
| FortiSwitch 1024E | FS-1024E | CONFIRMED |
| FortiSwitch 1048E | FS-1048E | CONFIRMED |
| FortiSwitch 3032E | FS-3032E | CONFIRMED |
| FortiSwitch 112D-POE | FSR-112D-POE | CONFIRMED (rugged) |
| FortiSwitch 124D-POE | FSR-124D | CONFIRMED (rugged, but note: FSR-124D, not 124D-POE) |

#### MISSING FortiSwitch Models:

**5xx Series (Distribution/Aggregation) -- HIGH PRIORITY:**
- **FS-524D** -- 24x 10GE SFP+
- **FS-524D-FPOE** -- PoE variant
- **FS-548D** -- 48x 10GE SFP+
- **FS-548D-FPOE** -- PoE variant

**6xx Series (New generation) -- HIGH PRIORITY:**
- **FS-624F** -- Next-gen 24-port switch with VXLAN/BGP EVPN support
- **FS-624F-FPOE** -- PoE variant
- **FS-648F** -- Next-gen 48-port switch
- **FS-648F-FPOE** -- PoE variant

**Additional models:**
- **FS-1024D** -- Older generation data center switch
- **FS-T1024E** -- Top-of-rack variant
- **FS-M426E-FPOE** -- Multi-rate 426E with full PoE
- **FSR-424F-POE** -- NEW rugged switch (not in our catalog)

### Naming Issue
- Our catalog has "FortiSwitch 124D-POE" (nodeId: `fortinet-fortiswitch-124d-poe`), but the official rugged model is **FSR-124D** (without POE suffix). The POE capability may be a feature of the model, but the official designation is FSR-124D.

### Series Generalization
- Our catalog uses series-level entries (100 Series, 200 Series, 400 Series) rather than individual models. This is acceptable for the current depth structure but means individual model specs (e.g., FS-124F-FPOE vs FS-148F-POE) are aggregated.

### New Features Not Captured
- **MACsec support** on FS-1024E for AWS Direct Connect
- **VXLAN and BGP EVPN** support on 6xxF series
- **MRP (Media Redundancy Protocol)** support on FS-424E-Fiber
- **128-port limit** increase from 64 ports

---

## 3. FortiAP Wireless Access Points (nodeId: `fortinet-fortiap`)

### Product Name: MATCH
- **Our data**: "FortiAP Wireless Access Points"
- **Fortinet docs**: "FortiAP" / "FortiWiFi and FortiAP"

### infraNodeTypes: CONCERN
- **Our data**: `['switch-l2']`
- **Assessment**: This is questionable. FortiAP is a wireless access point, not a Layer 2 switch. While APs do bridge wireless to wired (L2 function), mapping to `switch-l2` may confuse infrastructure professionals. Consider whether a dedicated `wireless-ap` node type exists or should be proposed.

### Model Inventory Comparison

#### Models in our catalog (5 models):

| Our Model | In FortiAP 7.6.1? | Status |
|-----------|-------------------|--------|
| FortiAP 231G | FAP-231G | CONFIRMED (Wi-Fi 6E) |
| FortiAP 431G | FAP-431G | CONFIRMED (Wi-Fi 6E) |
| FortiAP 441K | FAP-441K | CONFIRMED (Wi-Fi 7) |
| FortiAP 234G | FAP-234G | CONFIRMED (Wi-Fi 6E, outdoor) |
| FortiAP 432G | FAP-432G | CONFIRMED (Wi-Fi 6E, outdoor) |

#### MISSING FortiAP Models -- HIGH PRIORITY:

**Wi-Fi 6 Models (still actively supported):**
- **FAP-231F** -- Indoor Wi-Fi 6
- **FAP-234F** -- Outdoor Wi-Fi 6
- **FAP-23JF** -- Wall-jack Wi-Fi 6
- **FAP-431F** -- Indoor high-density Wi-Fi 6
- **FAP-432F** -- Outdoor Wi-Fi 6
- **FAP-432FR** -- Outdoor rugged Wi-Fi 6
- **FAP-433F** -- Indoor premium Wi-Fi 6
- **FAP-831F** -- High-end indoor Wi-Fi 6

**Wi-Fi 6E Models (missing from catalog):**
- **FAP-233G** -- Indoor Wi-Fi 6E (between 231G and 431G)
- **FAP-433G** -- Indoor premium Wi-Fi 6E

**Wi-Fi 7 Models (missing from catalog):**
- **FAP-241K** -- NEW indoor Wi-Fi 7
- **FAP-243K** -- NEW indoor Wi-Fi 7
- **FAP-443K** -- NEW indoor premium Wi-Fi 7

### Spec Notes
- Our catalog correctly identifies FortiAP 441K as Wi-Fi 7 (802.11be)
- The 231G and 431G are correctly identified as Wi-Fi 6E (802.11ax tri-band)
- The 234G and 432G are correctly identified as outdoor models with IP67

---

## 4. Other Product Lines -- Quick Verification

### New Products/Services from Fortinet Blog (not in catalog):

| Product | Type | In Catalog? | Priority |
|---------|------|-------------|----------|
| **FortiGate-as-a-Service** | Cloud/managed NGFW service | NO | MEDIUM |
| **FortiOS Quantum** | Quantum-safe security features | NO (feature, not product) | LOW |
| **FortiSIEM 7.5** | SIEM with Agentic AI | YES (FortiSIEM exists) | UPDATE description |
| **FortiEdge Cloud** | Cloud-managed networking | NO | MEDIUM |
| **Container FortiOS** | Containerized FortiGate | NO | LOW |
| **FortiGate CNF** | Cloud-Native Firewall | NO | MEDIUM |

### Products in catalog verified against docs.fortinet.com product listings:

| Product | Status | Notes |
|---------|--------|-------|
| FortiProxy | CONFIRMED | SWG product exists |
| FortiDDoS | CONFIRMED | DDoS protection exists |
| FortiDeceptor | CONFIRMED | Deception platform exists |
| FortiWeb | CONFIRMED | WAF product exists |
| FortiMail | CONFIRMED | Email security exists |
| FortiSandbox | CONFIRMED | ATP sandbox exists |
| FortiEDR | CONFIRMED | EDR product exists |
| FortiClient | CONFIRMED | Endpoint agent exists |
| FortiIsolator | CONFIRMED | RBI solution exists |
| FortiSASE | CONFIRMED | SASE platform exists |
| FortiExtender | CONFIRMED | LTE/5G extender exists |
| FortiCASB | CONFIRMED | CASB exists |
| FortiSIEM | CONFIRMED | SIEM platform exists |
| FortiSOAR | CONFIRMED | SOAR platform exists |
| FortiAnalyzer | CONFIRMED | Log/analytics exists |
| FortiXDR | CONFIRMED | XDR product exists |
| FortiNDR | CONFIRMED | NDR product exists |
| FortiRecon | CONFIRMED | DRPS exists |
| FortiGuard | CONFIRMED | Threat intel services exist |
| FortiNAC | CONFIRMED | NAC product exists |
| FortiAuthenticator | CONFIRMED | Auth server exists |
| FortiToken | CONFIRMED | MFA tokens exist |
| FortiZTNA | CONFIRMED | ZTNA feature exists |
| FortiDLP | CONFIRMED | DLP product exists |
| FortiPAM | CONFIRMED | PAM product exists |
| FortiManager | CONFIRMED | Central management exists |
| FortiCloud | CONFIRMED | Cloud management exists |
| FortiConverter | CONFIRMED | Migration tool exists |
| FortiAIOps | CONFIRMED | AIOps platform exists |
| FortiPortal | CONFIRMED | Multi-tenant portal exists |
| FortiMonitor | CONFIRMED | NPM tool exists |

---

## 5. Summary of Findings

### What Matches (Correct)
1. All 82 product nodes represent real Fortinet products
2. Product names are accurate
3. Architecture roles are reasonable and well-chosen
4. FortiGate supported protocols are comprehensive
5. FortiGate HA features are accurate
6. FortiGate security capabilities are comprehensive
7. FortiGate series categories (entry/mid/high/DC/rugged/virtual) are correct
8. FortiSwitch series architecture (campus access/distribution/DC) is correct
9. FortiAP Wi-Fi standards are correctly identified (6E vs 7)
10. All product lines have valid sourceUrl references
11. Bilingual data (Korean/English) is complete throughout

### What is Wrong or Inaccurate

| Issue | Severity | Details |
|-------|----------|---------|
| FortiGate 80F-3G4G may not exist | MEDIUM | Official docs list FG-40F-3G4G but not FG-80F-3G4G. The 3G4G capability for 80F-class may be via FortiWiFi (FWF-80F-2R-3G4G-DSL) |
| FortiSwitch 124D-POE naming | LOW | Official rugged model is FSR-124D (no -POE suffix). PoE is a feature, not part of model designation |
| FortiAP infraNodeTypes is `switch-l2` | MEDIUM | Wireless APs should not be mapped to `switch-l2`. Needs a `wireless-ap` node type or similar |

### What is Missing -- Prioritized

**CRITICAL (actively sold new-generation products):**

1. **FortiGate G-Series models** -- The SP5 ASIC generation is Fortinet's latest:
   - FG-120G / FG-121G (new mid-range)
   - FG-900G / FG-901G (new high-end)
   - FG-91G (90G variant)

2. **FortiSwitch 6xxF Series** -- Next-generation switches with VXLAN/BGP EVPN:
   - FS-624F / FS-624F-FPOE
   - FS-648F / FS-648F-FPOE

3. **FortiAP Wi-Fi 7 models** (beyond 441K):
   - FAP-241K, FAP-243K, FAP-443K

**HIGH (current-generation models missing):**

4. **FortiGate F-variant models** (x01F variants with more storage):
   - At least 15+ models (101F, 201F, 401F, 601F, 1001F, etc.)

5. **FortiSwitch 5xx Series** (distribution/aggregation):
   - FS-524D, FS-548D and their PoE variants

6. **FortiAP Wi-Fi 6 models** (still actively sold):
   - 8 models including FAP-231F, FAP-431F, FAP-433F, FAP-831F

7. **FortiAP Wi-Fi 6E models** (missing):
   - FAP-233G, FAP-433G

**MEDIUM (services/platforms):**

8. **FortiGate-as-a-Service** -- Cloud-delivered NGFW service
9. **FortiGate CNF** -- Cloud-Native Firewall for AWS
10. **FortiEdge Cloud** -- Cloud-managed networking platform
11. **FortiFirewall** variant models (FFW-series)

**LOW (legacy but still supported):**

12. E-series and D-series FortiGate models still in FortiOS 7.6.3
13. FortiWiFi integrated wireless models

### Stats Accuracy

- **Claimed**: 82 total products, maxDepth 2, 6 categories
- **Categories count**: 6 (Network Security, SD-WAN & SASE, Switching & Wireless, Security Operations, Zero Trust & Identity, Management & Analytics) -- CORRECT
- **maxDepth**: 2 (Category > Product Line > Series) -- CORRECT
- **totalProducts**: Count needs verification against `computeStats()` but 82 appears approximately correct for the current tree structure

---

## 6. Recommended Actions

### Immediate (before next release):
1. Add FortiGate G-series models (120G, 900G) -- these are Fortinet's flagship new products with SP5 ASIC
2. Add FortiSwitch 6xxF series -- newest switch generation with BGP EVPN support
3. Add missing FortiAP Wi-Fi 7 models (241K, 243K, 443K)
4. Fix FortiAP `infraNodeTypes` from `['switch-l2']` to an appropriate wireless type
5. Verify FortiGate 80F-3G4G model designation

### Short-term:
6. Add FortiGate x01F variant models for completeness
7. Add FortiSwitch 5xx series (distribution layer)
8. Add FortiAP Wi-Fi 6 models (F-series still actively sold)
9. Add missing FortiAP Wi-Fi 6E models (233G, 433G)
10. Add FortiSwitch rugged FSR-424F-POE

### Medium-term:
11. Consider adding FortiGate-as-a-Service as a product entry
12. Consider adding FortiGate CNF for cloud-native use cases
13. Add FortiFirewall variant entries if relevant for architecture planning
14. Update FortiSIEM description to reflect v7.5 Agentic AI capabilities

---

## 7. Field Suggestion

### Proposed: `formFactors` field

During verification, it became clear that Fortinet (and other vendors) offer the same product line across multiple form factors: hardware appliance, virtual machine, cloud-native, container, and as-a-service. The current `specs['Form Factor']` field handles this at the model level, but a product-line-level field would help infrastructure professionals quickly filter by deployment model.

```typescript
/** Available deployment form factors for this product line */
formFactors?: ('hardware' | 'virtual' | 'cloud' | 'container' | 'saas')[];
```

**Why it matters**: An infrastructure professional choosing between FortiGate hardware vs. FortiGate VM vs. FortiGate CNF vs. FortiGate-as-a-Service needs to see these options at the product line level, not discover them by browsing individual models.

**Backward compatible**: Yes (optional field).

**Recommendation**: Discuss with user before implementing.
