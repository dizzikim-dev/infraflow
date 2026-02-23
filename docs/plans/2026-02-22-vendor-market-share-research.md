# Infrastructure Vendor Market Share Research

> **Date**: 2026-02-22
> **Purpose**: Identify top vendors by market share across 24 infrastructure categories for vendor catalog expansion
> **Sources**: Gartner, IDC, Forrester, 6sense, PeerSpot, DB-Engines, MarketsandMarkets (2025-2026 data)

---

## Summary: Priority Vendors to Add

Based on market dominance, breadth across categories, and complementarity to existing catalog (Cisco, Fortinet, Palo Alto, Arista):

| Priority | Vendor | Categories Covered | Rationale |
|----------|--------|-------------------|-----------|
| 1 | **Schneider Electric (APC)** | UPS/Power | #1 in data center UPS, no overlap with existing catalog |
| 2 | **Dell Technologies** | Server, Storage, Backup | #1 in servers and storage, broad enterprise presence |
| 3 | **CrowdStrike** | EDR/Endpoint, XDR | #2 endpoint security, pure-play security leader |
| 4 | **Zscaler** | Proxy/SWG, VPN/ZTNA, DDoS | #1 in SSE/SWG, growing SASE leader |
| 5 | **F5 Networks** | Load Balancer/ADC | #1 in ADC for 8+ years, complementary to existing network vendors |
| 6 | **Cloudflare** | CDN, DDoS, DNS | #2 CDN, top-2 DDoS, fast-growing multi-category player |
| 7 | **Veeam** | Backup & DR | #1 in backup/data protection, no overlap |
| 8 | **Okta** | IAM | Top-3 IAM leader, dominant in workforce identity |
| 9 | **VMware (Broadcom)** | Virtualization, SD-WAN | ~80% hypervisor installed base, despite Broadcom disruption |
| 10 | **Datadog** | Monitoring/Observability | Leading observability platform, 47K+ customers |

---

## Detailed Category Analysis

### 1. Load Balancer / ADC

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **F5 Networks** | ~30-35% (enterprise) | Gartner Leader 8+ consecutive years; 58% revenue now software; AI Gateway for inference pipelines |
| 2 | **Citrix/NetScaler** | ~8-10% | Gartner Leader (only 2 leaders); Cloud Software Group ownership; F5 displacing NetScaler estates |
| 3 | **AWS ELB** | ~68% (cloud LB) | Dominates cloud-native load balancing; not enterprise ADC |

**Best to add first**: **F5 Networks** -- Undisputed enterprise ADC leader with broadest feature set and hardware+software+SaaS options.

---

### 2. Server / Compute

| Rank | Vendor | Market Share (Q3 2025) | Notes |
|------|--------|----------------------|-------|
| 1 | **Dell Technologies** | 8.3% revenue share | Leading OEM; strong in accelerated/AI servers |
| 2 | **Supermicro** | 4.0% revenue share | Surging on AI server demand; GPU-optimized platforms |
| 3 | **Lenovo** | 3.6% revenue share | Tied for 3rd with IEIT Systems (3.7%) |
| 4 | **HPE** | 3.0% revenue share | Dropped to 5th; pivoting to AI/edge |

Market context: $112.4B in Q3 2025 (61% YoY growth). GPU servers > 50% of total revenue. Note: ODM/hyperscaler direct accounts for majority of market, hence low OEM percentages.

**Best to add first**: **Dell Technologies** -- #1 server OEM with broadest portfolio (PowerEdge, AI-optimized, HPC).

---

### 3. Storage (SAN/NAS/Object)

| Rank | Vendor | Market Share (Q3 2025) | Notes |
|------|--------|----------------------|-------|
| 1 | **Dell Technologies** | 22.7% | Dominant; PowerStore, PowerScale, ECS |
| 2 | **Huawei** | 12.0% | Strong in APAC; limited in US market |
| 3 | **NetApp** | 9.4% | ONTAP ecosystem; strong in hybrid cloud |
| 4 | **Pure Storage** | 6.8% | Fastest growing (+15.5% YoY); all-flash pioneer |
| 5 | **HPE** | 5.6% | Alletra, Nimble, 3PAR legacy |

**Best to add first**: **Dell Technologies** (already #1 in servers) or **NetApp** as pure-play storage leader.

---

### 4. Wireless / WiFi

| Rank | Vendor | Market Share (Q2 2025) | Notes |
|------|--------|----------------------|-------|
| 1 | **Cisco (Meraki + Catalyst)** | 37.8% (~$996M) | Dominant; Meraki for SMB/mid, Catalyst for enterprise |
| 2 | **HPE Aruba Networking** | 14.3% (~$376M) | Gartner Leader; acquired Juniper Networks (July 2025) |
| 3 | **Ubiquiti** | 11.9% (~$312M) | Strong in SMB/prosumer; cost-effective |
| 4 | **Huawei** | 9.0% (~$236M) | Growing rapidly; limited in US |
| 5 | **Juniper Networks** | 5.4% (~$142M) | Now part of HPE |

Market: $7.86B in 2025, projected $8.37B in 2026.

**Best to add first**: **Cisco already in catalog**. Next: **HPE Aruba** (combined with Juniper = ~20% share).

---

### 5. DNS / DHCP / IPAM (DDI)

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **Infoblox** | ~35%+ (enterprise) | Dominant; acquired EfficientIP DDI unit (Sept 2023) |
| 2 | **BlueCat Networks** | ~10-15% | 1,000+ enterprise customers; strong in NA telecom (50%+) |
| 3 | **Cisco** | ~5-8% | Bundled with networking; not pure-play |

Market: $16.75B in 2026. Cloud deployment = 65% of market.

**Best to add first**: **Infoblox** -- Clear market leader with 35%+ share and growing via acquisition.

---

### 6. WAN Optimization / SD-WAN

| Rank | Vendor | Market Position | Notes |
|------|--------|----------------|-------|
| 1 | **Fortinet** | Gartner Leader #1 (4 consecutive years) | 40,000+ enterprise SD-WAN clients; integrated security |
| 2 | **Cisco** | Gartner Leader | Dual offerings: Catalyst SD-WAN + Meraki SD-WAN; 55,000 customers |
| 3 | **Broadcom/VMware VeloCloud** | Gartner Leader | 21,000 enterprise customers; VeloCloud sold to Arista (July 2025) |
| 4 | **HPE** | Gartner Leader | Via Aruba EdgeConnect |
| 5 | **Palo Alto Networks** | Gartner Leader | Prisma SD-WAN |

Market trend: 60% of new SD-WAN acquisitions will be SASE-integrated by 2026.

**Best to add first**: **Fortinet already in catalog**. Cisco also covered. Consider **Arista** (now owns VeloCloud, already in catalog).

---

### 7. Network Monitoring / Observability

| Rank | Vendor | Revenue/Position | Notes |
|------|--------|-----------------|-------|
| 1 | **Datadog** | $3.3B revenue (2025) | 47,431+ customers; 15x Gartner Leader; acquisitions of Eppo, Metaplane |
| 2 | **Dynatrace** | ~$1.5B revenue | 4.6 stars Gartner (1,745 reviews); 750+ integrations; highest "Ability to Execute" |
| 3 | **Splunk (Cisco)** | ~$3.5B (pre-acquisition) | Acquired by Cisco (March 2024); log analytics + SIEM convergence |
| 4 | **New Relic** | ~$900M revenue | 16,000+ paid customers; generous free tier |

Market: $28.5B in 2025, projected $34.1B in 2026.

**Best to add first**: **Datadog** -- Revenue leader with broadest platform (APM, logs, metrics, security, DORA).

---

### 8. Endpoint Security / EDR

| Rank | Vendor | Market Share (2024) | Notes |
|------|--------|-------------------|-------|
| 1 | **Microsoft Defender** | 28.6% (IDC) | #1 for 3 consecutive years; bundled with E5/M365 |
| 2 | **CrowdStrike** | ~14-15% | Falcon platform; 100% detection in enterprise EDR tests |
| 3 | **SentinelOne** | ~10-18% (growing rapidly) | Projected 18% by end of 2026; XDR integration |

Gartner EPP Leaders: Microsoft, SentinelOne, CrowdStrike (top 3).

**Best to add first**: **CrowdStrike** -- Pure-play security leader, strongest brand in EDR/XDR.

---

### 9. Email Security

| Rank | Vendor | Market Position | Notes |
|------|--------|----------------|-------|
| 1 | **Proofpoint** | ~43% (among dedicated email security) | Gartner Leader (#1 in Execution) 2 consecutive years; 4.6 stars |
| 2 | **Microsoft** | Gartner Leader (2025) | Defender for Office 365; bundled with M365 |
| 3 | **Mimecast** | ~10-15% | 4.5 stars; strong in archiving + awareness training |

Market: $5.9B in 2025, $6.5B in 2026.

**Best to add first**: **Proofpoint** -- Dominant in dedicated email security with highest execution score.

---

### 10. Identity & Access Management (IAM)

| Rank | Vendor | Market Position | Notes |
|------|--------|----------------|-------|
| 1 | **Microsoft Entra ID** | Gartner Leader; largest installed base | Deep M365/Azure integration; Entra ID + conditional access |
| 2 | **Ping Identity** | Gartner Leader | Advanced federation, adaptive auth, hybrid identity |
| 3 | **Okta** | Gartner Leader | Developer-friendly CIAM; workforce + customer identity |
| 4 | **IBM** | Gartner Leader | Verify platform; strong in regulated industries |

Market: $25.96B in 2025, projected $42.61B by 2030.

**Best to add first**: **Okta** -- Pure-play identity leader, de facto standard for workforce IAM.

---

### 11. SIEM / SOAR

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **Splunk (Cisco)** | ~47% (brand awareness); 5.18% (new deployments) | Legacy leader; acquired by Cisco 2024 |
| 2 | **Microsoft Sentinel** | ~15% (new deployments, growing fast) | Cloud-native SIEM+SOAR; Gartner Leader 2024; 5,217+ new adopters |
| 3 | **IBM QRadar** | ~9.4% | Being sold to Palo Alto Networks; legacy on-prem strength |

Market trend: Cloud-native SIEM (Sentinel, Google Chronicle) gaining rapidly vs. traditional.

**Best to add first**: **Splunk** is now Cisco (already in catalog). Consider dedicated entry or **Microsoft Sentinel** for cloud-native.

---

### 12. Backup & Disaster Recovery

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **Veeam** | 15.1% (#1 IDC worldwide) | Gartner Leader 9 consecutive years; $1.5B revenue |
| 2 | **Commvault** | Gartner Leader | Strong in enterprise hybrid cloud backup |
| 3 | **Rubrik** | Gartner Leader | IPO 2024; cyber-recovery focus |
| 4 | **Cohesity** | Gartner Leader | Acquired Veritas data protection business |
| 5 | **Dell Technologies** | Sliding from Leaders | PowerProtect; legacy strengths |

Market: $50B in 2025, projected $120B by 2033 (12% CAGR).

**Best to add first**: **Veeam** -- #1 worldwide in data protection market share.

---

### 13. Virtualization / Hypervisor

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **VMware (Broadcom)** | ~70-84% installed base | Dominant but disrupted by Broadcom subscription-only model (+300% price hikes) |
| 2 | **Microsoft Hyper-V** | ~5-10% | Gaining from VMware refugees |
| 3 | **Nutanix AHV** | ~6% (doubled from 3%) | 40% of FY2025 bookings = VMware displacement |
| 4 | **Proxmox** | Growing (open source) | Strong community adoption post-Broadcom pricing |

Market: $110.21B in 2026.

**Best to add first**: **VMware (Broadcom)** -- Still 70%+ installed base despite disruption; essential for enterprise catalog.

---

### 14. Container / Kubernetes

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **Amazon EKS** | ~42% (managed K8s) | Dominant in cloud-managed Kubernetes |
| 2 | **Google GKE** | ~27% (managed K8s) | Kubernetes originator; strong developer experience |
| 3 | **Azure AKS** | ~23% (managed K8s) | Fast growing; tight Azure integration |
| 4 | **Red Hat OpenShift** | Leading enterprise platform | IBM-backed; strongest on-prem/hybrid enterprise K8s |
| 5 | **Rancher (SUSE)** | Significant enterprise share | Multi-cluster management; acquired by SUSE |

Market: $2.57B in 2025, projected $8.41B by 2031 (21.85% CAGR). 92% of orgs use containers in production.

**Best to add first**: **Red Hat OpenShift** -- Leading enterprise on-prem/hybrid Kubernetes platform.

---

### 15. API Gateway

| Rank | Vendor | Market Position | Notes |
|------|--------|----------------|-------|
| 1 | **Kong** | Gartner Leader 6 consecutive years | Furthest "Completeness of Vision" 2x; $175M Series E; service mesh integration |
| 2 | **Google Apigee** | Gartner Leader | AI auto-classification; deep GCP integration |
| 3 | **MuleSoft (Salesforce)** | Gartner Leader; largest by revenue (2023) | Full integration platform (iPaaS + API) |
| 4 | **AWS API Gateway** | Largest cloud-native volume | 2T+ calls/month (Azure); bundled with cloud |

Market: $6.85B in 2025, projected $32.48B by 2032 (24.9% CAGR).

**Best to add first**: **Kong** -- Pure-play API gateway leader; open-source + enterprise editions.

---

### 16. Database

| Rank | Vendor | Revenue/Position | Notes |
|------|--------|-----------------|-------|
| 1 | **Microsoft** | #1 by DBMS revenue | SQL Server + Azure SQL + Cosmos DB |
| 2 | **AWS** | #2 (within $65M of Microsoft) | Aurora, RDS, DynamoDB, Redshift |
| 3 | **Oracle** | #3 by revenue | Oracle DB + Autonomous DB; leads IDC MarketScape for analytical DB |
| 4 | **PostgreSQL** | #1 developer adoption (55.6% StackOverflow) | Open source; fastest growing RDBMS |
| 5 | **MongoDB** | Leading NoSQL | 47,800+ customers; Atlas cloud growing 30%+ |

Market: $119.7B in 2024 (+13.4% YoY). Cloud = 64% of spend.

**Best to add first**: **Oracle** -- #1 in enterprise on-prem DBMS revenue; essential for infrastructure consulting.

---

### 17. Message Queue / Event Streaming

| Rank | Vendor | Market Position | Notes |
|------|--------|----------------|-------|
| 1 | **Confluent (Kafka)** | IDC Leader; 150,000+ Kafka orgs | $286M Q3 subscription revenue; IBM acquiring for $11B (Dec 2025) |
| 2 | **RabbitMQ (VMware/Broadcom)** | Most deployed message broker | Open source; lightweight; transactional messaging |
| 3 | **AWS Kinesis / MSK** | Dominant in cloud-native streaming | Managed Kafka (MSK) + proprietary (Kinesis) |
| 4 | **Redis Streams** | Growing in low-latency messaging | Redis Ltd; pub/sub + streams |

Market: $100B TAM (Confluent estimate, 2025).

**Best to add first**: **Confluent** -- De facto standard for enterprise event streaming; soon part of IBM.

---

### 18. CDN

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **Akamai** | ~30-40% | #1 by global reach; $3.8B revenue; edge compute + security |
| 2 | **Cloudflare** | ~15-25% | $1.3B revenue (+30% YoY); integrated security/zero-trust; aggressive POP expansion |
| 3 | **Amazon CloudFront** | ~15-20% | Bundled with AWS; dominant for AWS workloads |
| 4 | **Fastly** | ~5-10% | Edge computing focus; developer-centric |

Market: $31.52B in 2025, projected $37.38B in 2026.

**Best to add first**: **Cloudflare** -- Fastest growing; multi-category (CDN + DDoS + DNS + ZTNA + edge compute).

---

### 19. DDoS Protection

| Rank | Vendor | Market Position | Notes |
|------|--------|----------------|-------|
| 1 | **Cloudflare** | Top-2; 4.5 stars Gartner | $1.3B revenue; largest anycast network; bundled with CDN |
| 2 | **Akamai** | Top-2; 4.5 stars Gartner | $3.8B revenue; Prolexic + Kona WAF; enterprise focus |
| 3 | **Netscout (Arbor)** | ~5-8% | Arbor TMS; on-prem DDoS mitigation leader; enhanced AI/ML (Feb 2025) |
| 4 | **Radware** | Significant share | Cloud DDoS + WAF; strong in hybrid deployments |

Market: $5.80B in 2025, projected $10.39B by 2030.

**Best to add first**: **Cloudflare** (same as CDN) -- covers CDN + DDoS + DNS + more.

---

### 20. Network Access Control (NAC)

| Rank | Vendor | Mindshare (PeerSpot 2026) | Notes |
|------|--------|--------------------------|-------|
| 1 | **Cisco ISE** | 21.7% | Market leader; deep integration with Cisco switching/wireless |
| 2 | **Aruba ClearPass (HPE)** | 21.2% | Strong in healthcare, education; multi-vendor support |
| 3 | **Fortinet FortiNAC** | 15.5% | Integrated with FortiGate ecosystem |
| 4 | **Forescout** | Top-5 | Agentless discovery; IoT/OT specialization |

Market: projected ~$15.4B by 2025.

**Best to add first**: **Cisco ISE already covered** (Cisco in catalog). **Forescout** for agentless/IoT niche.

---

### 21. Data Loss Prevention (DLP)

| Rank | Vendor | Market Position | Notes |
|------|--------|----------------|-------|
| 1 | **Symantec (Broadcom)** | Market leader | Comprehensive endpoint + network + cloud DLP; largest installed base |
| 2 | **Forcepoint** | Strong #2 | Acquired Getvisibility; Data Security Cloud platform; contextual protection |
| 3 | **Microsoft Purview** | Fast growing | Bundled with M365 E5; integrated with Defender ecosystem |
| 4 | **Proofpoint** | Growing via acquisition | AI-driven data classification; email + cloud focus |

Market: Growing at 21.18% CAGR.

**Best to add first**: **Broadcom/Symantec** -- Legacy leader with broadest DLP coverage (endpoint + network + cloud).

---

### 22. VPN

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **Cisco AnyConnect** | ~29% | Market leader; transitioning to Cisco Secure Client |
| 2 | **Cisco VPN (site-to-site)** | ~25% | Combined Cisco VPN share ~54% |
| 3 | **Palo Alto GlobalProtect** | ~10-15% (estimated) | Part of Prisma Access SASE; strong enterprise adoption |
| 4 | **Fortinet FortiClient** | Significant | Integrated with FortiGate; SD-WAN convergence |
| 5 | **Zscaler Private Access** | Growing (ZTNA) | ZTNA projected to reach 20% of VPN market |

Market: $68.25B in 2025, projected $234.86B by 2032.

**Best to add first**: **Cisco + Palo Alto already in catalog**. **Zscaler** for ZTNA (next-gen VPN replacement).

---

### 23. Proxy / Secure Web Gateway (SWG)

| Rank | Vendor | Market Position | Notes |
|------|--------|----------------|-------|
| 1 | **Zscaler** | Gartner SSE Leader; 4.7 stars (1,122 reviews) | Cloud-native SWG + ZTNA + CASB; ZIA platform |
| 2 | **Netskope** | Gartner SSE Leader; 4.5 stars (581 reviews) | CASB-origin; strong data protection + SWG |
| 3 | **Palo Alto Networks** | Gartner SSE Leader (new in 2025) | Prisma Access; integrated with NGFW |
| 4 | **Broadcom (Symantec)** | Gartner Niche Player (declining) | Legacy ProxySG/WSS; losing to cloud-native |

Market: $16.88B in 2025, projected $57.4B by 2031.

**Best to add first**: **Zscaler** -- #1 cloud-native SWG/SSE; covers proxy + VPN(ZTNA) + DDoS categories.

---

### 24. UPS / Power

| Rank | Vendor | Market Share | Notes |
|------|--------|-------------|-------|
| 1 | **Schneider Electric (APC)** | ~15-18% (leading) | Galaxy VXL (500-1,250kW, up to 5MW); 99% efficiency; broadest portfolio |
| 2 | **Vertiv** | ~12-15% | OneCore modular platform (5MW+); hydrogen fuel cell UPS partnership |
| 3 | **Eaton** | ~10-12% | Acquired Resilient Power Systems (solid-state transformer tech, July 2025) |
| 4 | **ABB** | ~5-8% | Strong in industrial/utility-scale |
| 5 | **Huawei** | Growing | Smart UPS; strong in APAC |

Market: $8.76B in 2025, projected $12.47B by 2030. Top 5 vendors hold ~40-42% combined.

**Best to add first**: **Schneider Electric (APC)** -- #1 in data center UPS; synonymous with enterprise power protection.

---

## Cross-Category Vendor Frequency

Vendors appearing in multiple categories (higher = more valuable to catalog):

| Vendor | # Categories | Categories |
|--------|-------------|------------|
| **Microsoft** | 6 | Endpoint, Email, IAM, SIEM, Database, DLP |
| **Cisco** (already in catalog) | 6 | WiFi, SD-WAN, NAC, VPN, Observability (Splunk), SIEM |
| **Palo Alto** (already in catalog) | 4 | SD-WAN, VPN, Proxy/SWG, SIEM (QRadar acquisition) |
| **Cloudflare** | 3 | CDN, DDoS, DNS/Proxy |
| **Dell Technologies** | 3 | Server, Storage, Backup |
| **Broadcom** | 3 | Virtualization (VMware), DLP (Symantec), Proxy (Symantec) |
| **Fortinet** (already in catalog) | 3 | SD-WAN, NAC, VPN |
| **HPE/Aruba** | 3 | WiFi, Server, SD-WAN |
| **Zscaler** | 3 | Proxy/SWG, VPN/ZTNA, DDoS |

---

## Recommended Vendor Addition Roadmap

### Phase 1: High-Impact, No-Overlap Vendors (6 vendors)
1. **F5 Networks** -- ADC/Load Balancer (#1)
2. **Dell Technologies** -- Server (#1) + Storage (#1) + Backup
3. **Schneider Electric (APC)** -- UPS/Power (#1)
4. **Veeam** -- Backup & DR (#1)
5. **Cloudflare** -- CDN (#2) + DDoS (#1-2) + DNS
6. **Zscaler** -- SWG/Proxy (#1) + ZTNA/VPN + SSE

### Phase 2: Security & Identity Specialists (4 vendors)
7. **CrowdStrike** -- Endpoint Security/EDR (#2)
8. **Okta** -- IAM (#3, pure-play leader)
9. **Proofpoint** -- Email Security (#1)
10. **Infoblox** -- DDI (#1, 35%+ share)

### Phase 3: Platform & Software (4 vendors)
11. **VMware (Broadcom)** -- Virtualization (#1, 70%+ installed base)
12. **Datadog** -- Observability (#1 by revenue)
13. **Red Hat (IBM)** -- Kubernetes/OpenShift (enterprise #1)
14. **Oracle** -- Database (#3 by revenue, #1 enterprise on-prem)

### Phase 4: Complementary (4 vendors)
15. **HPE/Aruba** -- WiFi (#2) + Server (#5) + SD-WAN
16. **NetApp** -- Storage (#3, pure-play)
17. **Confluent (IBM)** -- Event Streaming/Kafka (#1)
18. **Kong** -- API Gateway (#1 Gartner Leader)

---

## Notes

- Microsoft appears in 6 categories but is primarily a cloud/software platform vendor, not an infrastructure hardware vendor. Consider adding Microsoft products selectively (Entra ID, Defender, Sentinel) rather than as a full vendor catalog entry.
- IBM is acquiring Confluent ($11B, Dec 2025) and already owns Red Hat -- these could be grouped.
- Broadcom owns VMware + Symantec -- consider a single Broadcom vendor entry with product lines.
- HPE acquired Juniper Networks (July 2025) -- combined WiFi+networking share ~20%.
- Arista (already in catalog) acquired VeloCloud from Broadcom (July 2025) -- add SD-WAN products to existing Arista catalog.

---

## Sources

- [IDC Worldwide Server Market Q3 2025](https://my.idc.com/getdoc.jsp?containerId=prUS54034325)
- [IDC Worldwide External ESS Market Q3 2025](https://my.idc.com/getdoc.jsp?containerId=prUS54034425)
- [IDC Enterprise WLAN Market Q2 2025](https://my.idc.com/getdoc.jsp?containerId=prUS53799225)
- [Gartner Peer Insights - ADC](https://www.gartner.com/reviews/market/application-delivery-controllers)
- [Gartner Peer Insights - Email Security](https://www.gartner.com/reviews/market/email-security-platforms)
- [Gartner Peer Insights - Observability](https://www.gartner.com/reviews/market/observability-platforms)
- [Gartner Peer Insights - Endpoint Protection](https://www.gartner.com/reviews/market/endpoint-protection-platforms)
- [Gartner Peer Insights - SIEM](https://www.gartner.com/reviews/market/security-information-event-management)
- [Gartner Peer Insights - NAC](https://www.gartner.com/reviews/market/network-access-control)
- [Gartner Peer Insights - SSE](https://www.gartner.com/reviews/market/security-service-edge)
- [Gartner Peer Insights - Backup](https://www.gartner.com/reviews/market/backup-and-data-protection-platforms)
- [Gartner SD-WAN Magic Quadrant](https://www.gartner.com/en/documents/5806615)
- [Microsoft Endpoint Security #1 Three Years](https://www.microsoft.com/en-us/security/blog/2025/08/27/microsoft-ranked-number-one-in-modern-endpoint-security-market-share-third-year-in-a-row/)
- [Veeam Gartner Leader 9 Years](https://www.veeam.com/gartner-magic-quadrant.html)
- [Kong Gartner Leader 6 Years](https://konghq.com/blog/news/gartner-magic-quadrant-lifecycle-api-management-leader)
- [6sense SIEM Market Share](https://6sense.com/tech/security-information-and-event-management-siem/azure-sentinel-market-share)
- [6sense Virtualization Market Share](https://6sense.com/tech/virtualization/microsoft-hyperv-market-share)
- [DB-Engines Database Rankings](https://db-engines.com/en/ranking)
- [MarketsandMarkets Data Center UPS](https://www.marketsandmarkets.com/Market-Reports/data-center-ups-market-182806703.html)
- [MarketsandMarkets IAM](https://www.marketsandmarkets.com/Market-Reports/identity-access-management-iam-market-1168.html)
- [MarketsandMarkets NAC](https://www.marketsandmarkets.com/ResearchInsight/data-center-ups-market.asp)
- [Mordor Intelligence DDI Market](https://www.mordorintelligence.com/industry-reports/ddi-dns-dhcp-and-ipam-solutions-market)
- [Mordor Intelligence DLP Market](https://www.mordorintelligence.com/industry-reports/data-loss-prevention-market)
- [CDN Market Share - T4](https://www.t4.ai/industry/cdn-market-share)
- [Container Platform Market Share - T4](https://www.t4.ai/industries/container-platform-market-share)
- [Confluent Q3 2025 Earnings](https://investors.confluent.io/static-files/a2cf1818-192e-48c0-bcc5-2b85b1be3b6d)
- [IBM to Acquire Confluent](https://www.confluent.io/press-release/ibm-to-acquire-confluent-to-create-smart-data-platform-for-enterprise/)
- [Proofpoint 2025 Gartner MQ Leader](https://www.proofpoint.com/us/blog/email-and-cloud-threats/proofpoint-named-leader-again-2025-gartner-magic-quadrant-email)
- [Fortinet SD-WAN Tops Cisco, Broadcom](https://www.sdxcentral.com/analysis/fortinet-sd-wan-tops-cisco-broadcom-in-evolving-market/)
- [Cloudflare Statistics 2026](https://www.demandsage.com/cloudflare-statistics/)
- [PeerSpot NAC Rankings 2026](https://www.peerspot.com/categories/network-access-control-nac)
