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
  RFC_7230, RFC_8446, RFC_1034, RFC_2818, RFC_7540,
  CIS_V8, CIS_V8_12, CIS_V8_13,
  OWASP_TOP10, OWASP_WSTG, OWASP_API_TOP10,
  AWS_WAF_REL, AWS_WAF_SEC, AWS_WAF_PERF, AZURE_CAF,
  SANS_CIS_TOP20, CNCF_SECURITY, SANS_FIREWALL,
];

/** Validate that a source type maps to a known confidence level */
export function isOfficialSource(type: SourceType): boolean {
  return ['rfc', 'nist', 'cis', 'owasp'].includes(type);
}

/** Validate that a source type is user-contributed */
export function isUserSource(type: SourceType): boolean {
  return type === 'user_verified' || type === 'user_unverified';
}
