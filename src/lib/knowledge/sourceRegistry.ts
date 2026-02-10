/**
 * Source Registry - Verified reference documents for infrastructure knowledge
 *
 * Every knowledge entry references sources from this registry.
 * Sources are organized by type and include full citation information.
 */

import type { KnowledgeSource, SourceType } from './types';

// ---------------------------------------------------------------------------
// Source factory helpers
// ---------------------------------------------------------------------------

function nist(
  id: string,
  title: string,
  url: string,
  publishedDate: string,
  section?: string,
): KnowledgeSource {
  return { type: 'nist', title: `NIST ${id}: ${title}`, url, section, publishedDate, accessedDate: '2026-02-09' };
}

function rfc(
  num: number,
  title: string,
  publishedDate: string,
  section?: string,
): KnowledgeSource {
  return {
    type: 'rfc',
    title: `RFC ${num}: ${title}`,
    url: `https://datatracker.ietf.org/doc/html/rfc${num}`,
    section,
    publishedDate,
    accessedDate: '2026-02-09',
  };
}

function cis(title: string, url: string, section?: string): KnowledgeSource {
  return { type: 'cis', title, url, section, accessedDate: '2026-02-09' };
}

function owasp(title: string, url: string, section?: string): KnowledgeSource {
  return { type: 'owasp', title, url, section, accessedDate: '2026-02-09' };
}

function vendor(title: string, url: string, section?: string): KnowledgeSource {
  return { type: 'vendor', title, url, section, accessedDate: '2026-02-09' };
}

function industry(title: string, url: string, section?: string): KnowledgeSource {
  return { type: 'industry', title, url, section, accessedDate: '2026-02-09' };
}

function itu(id: string, title: string, url: string, section?: string): KnowledgeSource {
  return { type: 'vendor', title: `ITU-T ${id}: ${title}`, url, section, accessedDate: '2026-02-09' };
}

function threeGpp(id: string, title: string, section?: string): KnowledgeSource {
  return {
    type: 'vendor',
    title: `3GPP ${id}: ${title}`,
    url: `https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=${id}`,
    section,
    accessedDate: '2026-02-09',
  };
}

function mef(id: string, title: string, url: string, section?: string): KnowledgeSource {
  return { type: 'industry', title: `${id}: ${title}`, url, section, accessedDate: '2026-02-09' };
}

// ---------------------------------------------------------------------------
// NIST Special Publications
// ---------------------------------------------------------------------------

export const NIST_800_41 = nist(
  'SP 800-41 Rev.1',
  'Guidelines on Firewalls and Firewall Policy',
  'https://csrc.nist.gov/pubs/sp/800/41/r1/final',
  '2009-09',
);

export const NIST_800_44 = nist(
  'SP 800-44 Ver.2',
  'Guidelines on Securing Public Web Servers',
  'https://csrc.nist.gov/pubs/sp/800/44/ver2/final',
  '2007-09',
);

export const NIST_800_53 = nist(
  'SP 800-53 Rev.5',
  'Security and Privacy Controls for Information Systems',
  'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final',
  '2020-09',
);

export const NIST_800_63B = nist(
  'SP 800-63B',
  'Digital Identity Guidelines - Authentication and Lifecycle Management',
  'https://csrc.nist.gov/pubs/sp/800/63b/upd2/final',
  '2017-06',
);

export const NIST_800_77 = nist(
  'SP 800-77 Rev.1',
  'Guide to IPsec VPNs',
  'https://csrc.nist.gov/pubs/sp/800/77/r1/final',
  '2020-06',
);

export const NIST_800_81 = nist(
  'SP 800-81-2',
  'Secure Domain Name System (DNS) Deployment Guide',
  'https://csrc.nist.gov/pubs/sp/800/81/2/final',
  '2013-09',
);

export const NIST_800_94 = nist(
  'SP 800-94',
  'Guide to Intrusion Detection and Prevention Systems (IDPS)',
  'https://csrc.nist.gov/pubs/sp/800/94/final',
  '2007-02',
);

export const NIST_800_123 = nist(
  'SP 800-123',
  'Guide to General Server Security',
  'https://csrc.nist.gov/pubs/sp/800/123/final',
  '2008-07',
);

export const NIST_800_144 = nist(
  'SP 800-144',
  'Guidelines on Security and Privacy in Public Cloud Computing',
  'https://csrc.nist.gov/pubs/sp/800/144/final',
  '2011-12',
);

export const NIST_800_125 = nist(
  'SP 800-125',
  'Guide to Security for Full Virtualization Technologies',
  'https://csrc.nist.gov/pubs/sp/800/125/final',
  '2011-01',
);

// ---------------------------------------------------------------------------
// IETF RFCs
// ---------------------------------------------------------------------------

export const RFC_7230 = rfc(7230, 'HTTP/1.1 Message Syntax and Routing', '2014-06', 'Section 2.3 - Intermediaries');
export const RFC_8446 = rfc(8446, 'The Transport Layer Security (TLS) Protocol Version 1.3', '2018-08');
export const RFC_1034 = rfc(1034, 'Domain Names - Concepts and Facilities', '1987-11');
export const RFC_2818 = rfc(2818, 'HTTP Over TLS', '2000-05');
export const RFC_7540 = rfc(7540, 'Hypertext Transfer Protocol Version 2 (HTTP/2)', '2015-05');

// ---------------------------------------------------------------------------
// CIS Controls
// ---------------------------------------------------------------------------

export const CIS_V8 = cis(
  'CIS Controls v8',
  'https://www.cisecurity.org/controls/v8',
);

export const CIS_V8_12 = cis(
  'CIS Controls v8 - Control 12: Network Infrastructure Management',
  'https://www.cisecurity.org/controls/v8',
  '12.2 - Establish and Maintain a Secure Network Architecture',
);

export const CIS_V8_13 = cis(
  'CIS Controls v8 - Control 13: Network Monitoring and Defense',
  'https://www.cisecurity.org/controls/v8',
  '13.3 - Deploy a Network Intrusion Detection Solution',
);

// ---------------------------------------------------------------------------
// OWASP
// ---------------------------------------------------------------------------

export const OWASP_TOP10 = owasp(
  'OWASP Top 10 (2021)',
  'https://owasp.org/Top10/',
);

export const OWASP_WSTG = owasp(
  'OWASP Web Security Testing Guide',
  'https://owasp.org/www-project-web-security-testing-guide/',
);

export const OWASP_API_TOP10 = owasp(
  'OWASP API Security Top 10 (2023)',
  'https://owasp.org/API-Security/',
);

// ---------------------------------------------------------------------------
// Vendor Documentation
// ---------------------------------------------------------------------------

export const AWS_WAF_REL = vendor(
  'AWS Well-Architected Framework - Reliability Pillar',
  'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/',
);

export const AWS_WAF_SEC = vendor(
  'AWS Well-Architected Framework - Security Pillar',
  'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/',
);

export const AWS_WAF_PERF = vendor(
  'AWS Well-Architected Framework - Performance Efficiency Pillar',
  'https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/',
);

export const AZURE_CAF = vendor(
  'Azure Cloud Adoption Framework',
  'https://learn.microsoft.com/azure/cloud-adoption-framework/',
);

// ---------------------------------------------------------------------------
// Industry Guides
// ---------------------------------------------------------------------------

export const SANS_CIS_TOP20 = industry(
  'SANS/CIS Top 20 Critical Security Controls',
  'https://www.sans.org/critical-security-controls/',
);

export const CNCF_SECURITY = industry(
  'CNCF Cloud Native Security Whitepaper',
  'https://github.com/cncf/tag-security/blob/main/security-whitepaper/v2/cloud-native-security-whitepaper.md',
);

export const SANS_FIREWALL = industry(
  'SANS: Firewall Best Practices',
  'https://www.sans.org/white-papers/1117/',
);

// ---------------------------------------------------------------------------
// Telecom Standards
// ---------------------------------------------------------------------------

export const RFC_3031 = rfc(3031, 'Multiprotocol Label Switching Architecture', '2001-01');
export const RFC_4364 = rfc(4364, 'BGP/MPLS IP Virtual Private Networks (VPNs)', '2006-02');
export const RFC_5036 = rfc(5036, 'LDP Specification', '2007-10');
export const RFC_7348 = rfc(7348, 'VXLAN: Virtual eXtensible LAN', '2014-08');
export const RFC_4381 = rfc(4381, 'Analysis of the Security of BGP/MPLS IP VPNs', '2006-02');
export const ITU_G984 = itu('G.984', 'GPON - Gigabit-capable Passive Optical Networks', 'https://www.itu.int/rec/T-REC-G.984.1');
export const ITU_Y3183 = itu('Y.3183', 'Framework for network slicing', 'https://www.itu.int/rec/T-REC-Y.3183');
export const THREEGPP_23002 = threeGpp('23.002', 'Network Architecture', 'Section 4');
export const THREEGPP_38401 = threeGpp('38.401', 'NG-RAN Architecture', 'Section 6');
export const MEF_4 = mef('MEF 4', 'Metro Ethernet Network Architecture Framework', 'https://www.mef.net/resources/technical-specifications/');
export const ETSI_NFV_MAN = vendor('ETSI GS NFV-MAN 001: Network Functions Virtualisation Management', 'https://www.etsi.org/deliver/etsi_gs/NFV-MAN/001_099/001/');
export const KT_5G_ARCH = vendor('KT 5G Network Architecture Reference (Netmanias)', 'https://www.netmanias.com/en/post/reports/14808/5g-kt-kt-5g-network-architecture');

// ---------------------------------------------------------------------------
// Cloud & Container Standards
// ---------------------------------------------------------------------------

export const AWS_WAF_OPS = vendor(
  'AWS Well-Architected Framework - Operational Excellence Pillar',
  'https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/',
);

export const GCP_ARCH_FRAMEWORK = vendor(
  'Google Cloud Architecture Framework',
  'https://cloud.google.com/architecture/framework',
);

export const NIST_800_145 = nist(
  'SP 800-145',
  'The NIST Definition of Cloud Computing',
  'https://csrc.nist.gov/pubs/sp/800/145/final',
  '2011-09',
);

export const CIS_KUBERNETES = cis(
  'CIS Kubernetes Benchmark v1.8',
  'https://www.cisecurity.org/benchmark/kubernetes',
  '5.2 - Pod Security Standards',
);

export const K8S_DOCS = vendor(
  'Kubernetes Official Documentation - Security Best Practices',
  'https://kubernetes.io/docs/concepts/security/',
);

export const NIST_800_207 = nist(
  'SP 800-207',
  'Zero Trust Architecture',
  'https://csrc.nist.gov/pubs/sp/800/207/final',
  '2020-08',
);

// ---------------------------------------------------------------------------
// Vulnerability / CVE Sources
// ---------------------------------------------------------------------------

export const NIST_NVD = nist(
  'NVD',
  'National Vulnerability Database',
  'https://nvd.nist.gov/',
  '2024-01',
);

export const MITRE_CVE = industry(
  'MITRE CVE Program',
  'https://cve.mitre.org/',
);

export const GITHUB_ADVISORY = vendor(
  'GitHub Security Advisories',
  'https://github.com/advisories',
);

// ---------------------------------------------------------------------------
// Cloud Service Catalog Sources
// ---------------------------------------------------------------------------

export const AWS_SERVICE_CATALOG = vendor(
  'AWS Service Catalog & Pricing',
  'https://aws.amazon.com/products/',
);

export const AZURE_SERVICE_CATALOG = vendor(
  'Azure Service Catalog & Pricing',
  'https://azure.microsoft.com/products/',
);

export const GCP_SERVICE_CATALOG = vendor(
  'Google Cloud Service Catalog & Pricing',
  'https://cloud.google.com/products',
);

// ---------------------------------------------------------------------------
// Utility: get source with section override
// ---------------------------------------------------------------------------

export function withSection(source: KnowledgeSource, section: string): KnowledgeSource {
  return { ...source, section };
}

// ---------------------------------------------------------------------------
// All sources for validation
// ---------------------------------------------------------------------------

export const ALL_SOURCES: KnowledgeSource[] = [
  NIST_800_41, NIST_800_44, NIST_800_53, NIST_800_63B, NIST_800_77,
  NIST_800_81, NIST_800_94, NIST_800_123, NIST_800_144, NIST_800_125,
  NIST_800_145, NIST_800_207,
  RFC_7230, RFC_8446, RFC_1034, RFC_2818, RFC_7540,
  RFC_3031, RFC_4364, RFC_5036, RFC_7348, RFC_4381,
  CIS_V8, CIS_V8_12, CIS_V8_13, CIS_KUBERNETES,
  OWASP_TOP10, OWASP_WSTG, OWASP_API_TOP10,
  AWS_WAF_REL, AWS_WAF_SEC, AWS_WAF_PERF, AWS_WAF_OPS, AZURE_CAF,
  GCP_ARCH_FRAMEWORK, K8S_DOCS,
  SANS_CIS_TOP20, CNCF_SECURITY, SANS_FIREWALL,
  ITU_G984, ITU_Y3183, THREEGPP_23002, THREEGPP_38401,
  MEF_4, ETSI_NFV_MAN, KT_5G_ARCH,
  NIST_NVD, MITRE_CVE, GITHUB_ADVISORY,
  AWS_SERVICE_CATALOG, AZURE_SERVICE_CATALOG, GCP_SERVICE_CATALOG,
];

/** Validate that a source type maps to a known confidence level */
export function isOfficialSource(type: SourceType): boolean {
  return ['rfc', 'nist', 'cis', 'owasp'].includes(type);
}

/** Validate that a source type is user-contributed */
export function isUserSource(type: SourceType): boolean {
  return type === 'user_verified' || type === 'user_unverified';
}
