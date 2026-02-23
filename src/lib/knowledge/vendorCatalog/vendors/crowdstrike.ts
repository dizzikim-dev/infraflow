/**
 * CrowdStrike -- Full Product Catalog
 *
 * Hierarchical product tree covering Endpoint Security, Cloud Security,
 * Identity Protection, Security Operations, and Data Protection categories.
 *
 * Data sourced from https://www.crowdstrike.com/platform/
 * Last crawled: 2026-02-22
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// CrowdStrike Product Catalog
// ---------------------------------------------------------------------------

export const crowdstrikeCatalog: VendorCatalog = {
  vendorId: 'crowdstrike',
  vendorName: 'CrowdStrike',
  vendorNameKo: '크라우드스트라이크',
  headquarters: 'Austin, TX, USA',
  website: 'https://www.crowdstrike.com',
  productPageUrl: 'https://www.crowdstrike.com/platform/',
  depthStructure: ['category', 'product-line', 'module'],
  depthStructureKo: ['카테고리', '제품 라인', '모듈'],
  lastCrawled: '2026-02-22',
  crawlSource: 'https://www.crowdstrike.com/platform/',
  stats: { totalProducts: 32, maxDepth: 2, categoriesCount: 5 },
  products: [
    // =====================================================================
    // 1. Endpoint Security
    // =====================================================================
    {
      nodeId: 'crowdstrike-endpoint-security',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Endpoint Security',
      nameKo: '엔드포인트 보안',
      description:
        'AI-native endpoint protection platform providing next-gen antivirus, EDR/XDR, and device control through a single lightweight agent',
      descriptionKo:
        '단일 경량 에이전트를 통해 차세대 안티바이러스, EDR/XDR, 디바이스 제어를 제공하는 AI 네이티브 엔드포인트 보호 플랫폼',
      sourceUrl: 'https://www.crowdstrike.com/products/endpoint-security/',
      infraNodeTypes: ['firewall'],
      children: [
        // -- Falcon Prevent --
        {
          nodeId: 'crowdstrike-falcon-prevent',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Prevent',
          nameKo: 'Falcon Prevent',
          description:
            'Next-generation antivirus (NGAV) using AI/ML and behavioral analysis to stop malware, ransomware, and fileless attacks without signatures',
          descriptionKo:
            'AI/ML 및 행위 분석을 사용하여 시그니처 없이 악성코드, 랜섬웨어, 파일리스 공격을 차단하는 차세대 안티바이러스(NGAV)',
          sourceUrl: 'https://www.crowdstrike.com/products/endpoint-security/',
          infraNodeTypes: ['firewall'],
          architectureRole: 'Endpoint NGAV / Malware Prevention',
          architectureRoleKo: '엔드포인트 NGAV / 악성코드 방지',
          recommendedFor: [
            'Replacing legacy antivirus with AI-powered next-gen AV',
            'Preventing ransomware, fileless, and living-off-the-land attacks',
            'Enterprise endpoint protection across Windows, macOS, and Linux',
          ],
          recommendedForKo: [
            'AI 기반 차세대 AV로 레거시 안티바이러스 교체',
            '랜섬웨어, 파일리스, LOL(Living-off-the-Land) 공격 방지',
            'Windows, macOS, Linux 전반의 엔터프라이즈 엔드포인트 보호',
          ],
          securityCapabilities: [
            'AI/ML-powered malware detection',
            'Behavioral analysis and IOA-based prevention',
            'Ransomware prevention with file system containment',
            'Fileless attack prevention',
            'Exploit mitigation',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-prevent-ngav',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Prevent',
              nameKo: 'Falcon Prevent',
              description:
                'Cloud-native NGAV module delivering AI/ML-based malware prevention, behavioral IOA detection, and ransomware containment through the Falcon sensor',
              descriptionKo:
                'Falcon 센서를 통해 AI/ML 기반 악성코드 방지, 행위 IOA 탐지, 랜섬웨어 격리를 제공하는 클라우드 네이티브 NGAV 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/endpoint-security/',
              infraNodeTypes: ['firewall'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Next-Generation Antivirus (NGAV)',
              architectureRoleKo: '차세대 안티바이러스 (NGAV)',
              recommendedFor: [
                'Replacing signature-based legacy AV with AI-powered prevention',
                'Stopping ransomware with file system containment capabilities',
                'Unified endpoint prevention across Windows, macOS, and Linux',
              ],
              recommendedForKo: [
                'AI 기반 방지로 시그니처 기반 레거시 AV 교체',
                '파일 시스템 격리 기능으로 랜섬웨어 차단',
                'Windows, macOS, Linux 전반의 통합 엔드포인트 방지',
              ],
              securityCapabilities: [
                'AI/ML-powered malware detection (no signatures)',
                'Indicators of Attack (IOA) behavioral prevention',
                'Ransomware file system containment',
                'Fileless and living-off-the-land attack prevention',
                'Exploit mitigation and memory protection',
              ],
              specs: {
                'Deployment': 'Cloud-native (single lightweight sensor)',
                'Platform Support': 'Windows, macOS, Linux',
                'Detection Method': 'AI/ML + behavioral IOA analysis',
                'MITRE ATT&CK': '100% detection, 100% protection, zero false positives (2025 Round 5)',
                'Agent Footprint': 'Single lightweight Falcon sensor',
              },
              children: [],
            },
          ],
        },

        // -- Falcon Insight --
        {
          nodeId: 'crowdstrike-falcon-insight',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Insight',
          nameKo: 'Falcon Insight',
          description:
            'Extended Detection and Response (XDR) platform providing real-time endpoint visibility, threat detection, investigation, and automated response across domains',
          descriptionKo:
            '실시간 엔드포인트 가시성, 위협 탐지, 조사, 도메인 간 자동화된 대응을 제공하는 확장 탐지 및 대응(XDR) 플랫폼',
          sourceUrl: 'https://www.crowdstrike.com/products/endpoint-security/',
          infraNodeTypes: ['firewall'],
          architectureRole: 'Endpoint Detection & Response / XDR',
          architectureRoleKo: '엔드포인트 탐지 및 대응 / XDR',
          recommendedFor: [
            'Real-time endpoint detection and cross-domain threat correlation',
            'Automated incident triage and response with AI assistance',
            'SOC visibility across endpoints, cloud, and identity domains',
          ],
          recommendedForKo: [
            '실시간 엔드포인트 탐지 및 도메인 간 위협 상관분석',
            'AI 지원을 통한 자동화된 인시던트 분류 및 대응',
            '엔드포인트, 클라우드, ID 도메인 전반의 SOC 가시성',
          ],
          securityCapabilities: [
            'Real-time continuous endpoint monitoring',
            'Cross-domain XDR correlation',
            'AI-powered automated triage and investigation',
            'Threat graph visualization',
            'Rapid containment and remote remediation',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-insight-xdr',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Insight XDR',
              nameKo: 'Falcon Insight XDR',
              description:
                'Unified XDR module extending EDR with cross-domain detection and response across endpoints, cloud, identity, and third-party data sources',
              descriptionKo:
                '엔드포인트, 클라우드, ID, 서드파티 데이터 소스 전반에서 EDR을 확장한 도메인 간 탐지 및 대응을 제공하는 통합 XDR 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/endpoint-security/',
              infraNodeTypes: ['firewall', 'siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Extended Detection & Response (XDR)',
              architectureRoleKo: '확장 탐지 및 대응 (XDR)',
              recommendedFor: [
                'Unified detection and response across endpoint, cloud, and identity',
                'Cross-domain attack correlation with AI-powered analytics',
                'Accelerating SOC investigation with automated triage and threat graph',
              ],
              recommendedForKo: [
                '엔드포인트, 클라우드, ID 전반의 통합 탐지 및 대응',
                'AI 기반 분석을 통한 도메인 간 공격 상관분석',
                '자동화된 분류 및 위협 그래프를 통한 SOC 조사 가속화',
              ],
              securityCapabilities: [
                'Real-time continuous endpoint telemetry',
                'Cross-domain XDR detection and correlation',
                'AI-powered automated triage (Charlotte AI)',
                'Threat graph attack visualization',
                'Remote response and containment actions',
                'Third-party data source integration (10 GB/day free)',
              ],
              specs: {
                'Deployment': 'Cloud-native (single Falcon sensor)',
                'Platform Support': 'Windows, macOS, Linux',
                'Detection': 'AI/ML + behavioral IOA + cross-domain correlation',
                'Response': 'Remote containment, isolation, remediation',
                'Data Integration': '10 GB/day third-party data ingest (free with Next-Gen SIEM)',
              },
              children: [],
            },
          ],
        },

        // -- Falcon Device Control --
        {
          nodeId: 'crowdstrike-falcon-device-control',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Device Control',
          nameKo: 'Falcon Device Control',
          description:
            'USB and peripheral device control module enforcing granular policies on removable media to prevent data exfiltration and malware introduction',
          descriptionKo:
            '데이터 유출 및 악성코드 유입을 방지하기 위해 이동식 미디어에 대한 세분화된 정책을 적용하는 USB 및 주변 디바이스 제어 모듈',
          sourceUrl: 'https://www.crowdstrike.com/products/endpoint-security/',
          infraNodeTypes: ['firewall'],
          architectureRole: 'Endpoint Device Control / USB Policy',
          architectureRoleKo: '엔드포인트 디바이스 제어 / USB 정책',
          recommendedFor: [
            'Enforcing USB and removable media policies on endpoints',
            'Preventing data exfiltration through peripheral devices',
            'Compliance-driven device usage control in regulated industries',
          ],
          recommendedForKo: [
            '엔드포인트에서 USB 및 이동식 미디어 정책 적용',
            '주변 디바이스를 통한 데이터 유출 방지',
            '규제 산업에서의 컴플라이언스 기반 디바이스 사용 제어',
          ],
          securityCapabilities: [
            'Granular USB device policy enforcement',
            'Removable media read/write/execute control',
            'Device class and vendor-level restrictions',
            'Audit logging for USB activity',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-device-control-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Device Control',
              nameKo: 'Falcon Device Control',
              description:
                'Granular USB and peripheral device policy enforcement module integrated with the Falcon sensor for visibility and control over removable media',
              descriptionKo:
                '이동식 미디어에 대한 가시성 및 제어를 위해 Falcon 센서와 통합된 세분화된 USB 및 주변 디바이스 정책 적용 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/endpoint-security/',
              infraNodeTypes: ['firewall', 'dlp'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'USB/Peripheral Device Control',
              architectureRoleKo: 'USB/주변 디바이스 제어',
              recommendedFor: [
                'Blocking unauthorized USB and removable media usage',
                'Preventing data exfiltration through peripheral devices',
                'Compliance enforcement for USB device policies in regulated environments',
              ],
              recommendedForKo: [
                '비인가 USB 및 이동식 미디어 사용 차단',
                '주변 디바이스를 통한 데이터 유출 방지',
                '규제 환경에서 USB 디바이스 정책 컴플라이언스 적용',
              ],
              securityCapabilities: [
                'USB device read/write/execute policy enforcement',
                'Device class, vendor, and product-level restrictions',
                'Audit trail for all USB activity',
                'Integration with Falcon endpoint telemetry',
              ],
              specs: {
                'Deployment': 'Cloud-native (Falcon sensor integration)',
                'Platform Support': 'Windows, macOS, Linux',
                'Policy Granularity': 'Device class, vendor ID, product ID, serial number',
                'Actions': 'Allow, block, read-only, audit',
                'Compliance': 'USB usage audit logging and reporting',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. Cloud Security
    // =====================================================================
    {
      nodeId: 'crowdstrike-cloud-security',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Cloud Security',
      nameKo: '클라우드 보안',
      description:
        'Unified cloud-native application protection platform (CNAPP) combining CSPM, CWPP, CIEM, and container runtime security for multi-cloud environments',
      descriptionKo:
        '멀티클라우드 환경을 위해 CSPM, CWPP, CIEM, 컨테이너 런타임 보안을 결합한 통합 클라우드 네이티브 애플리케이션 보호 플랫폼(CNAPP)',
      sourceUrl: 'https://www.crowdstrike.com/products/cloud-security/',
      infraNodeTypes: ['kubernetes', 'container'],
      children: [
        // -- Falcon Cloud Security --
        {
          nodeId: 'crowdstrike-falcon-cloud-security',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Cloud Security',
          nameKo: 'Falcon Cloud Security',
          description:
            'Unified CNAPP platform providing cloud workload protection (CWPP), security posture management (CSPM), and identity entitlement management (CIEM) with real-time CDR',
          descriptionKo:
            '클라우드 워크로드 보호(CWPP), 보안 태세 관리(CSPM), ID 권한 관리(CIEM)를 실시간 CDR과 함께 제공하는 통합 CNAPP 플랫폼',
          sourceUrl: 'https://www.crowdstrike.com/products/cloud-security/',
          infraNodeTypes: ['kubernetes', 'container'],
          architectureRole: 'Cloud-Native Application Protection (CNAPP)',
          architectureRoleKo: '클라우드 네이티브 애플리케이션 보호 (CNAPP)',
          recommendedFor: [
            'Unified cloud security posture and workload protection across AWS, Azure, and GCP',
            'Cloud misconfiguration detection and automated remediation',
            'Real-time cloud detection and response (CDR) for runtime threats',
            'Container and Kubernetes workload runtime protection',
          ],
          recommendedForKo: [
            'AWS, Azure, GCP 전반의 통합 클라우드 보안 태세 및 워크로드 보호',
            '클라우드 잘못된 구성 탐지 및 자동화된 교정',
            '런타임 위협에 대한 실시간 클라우드 탐지 및 대응(CDR)',
            '컨테이너 및 Kubernetes 워크로드 런타임 보호',
          ],
          supportedProtocols: [
            'AWS API', 'Azure API', 'GCP API',
            'Kubernetes API', 'Docker API',
            'REST API', 'HTTPS',
          ],
          securityCapabilities: [
            'Cloud Security Posture Management (CSPM)',
            'Cloud Workload Protection Platform (CWPP)',
            'Cloud Infrastructure Entitlement Management (CIEM)',
            'Real-time Cloud Detection and Response (CDR)',
            'Kubernetes Admission Controller',
            'AI Security Posture Management (AI-SPM)',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-cloud-security-cnapp',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Cloud Security CNAPP',
              nameKo: 'Falcon Cloud Security CNAPP',
              description:
                'Comprehensive CNAPP module combining CSPM, CWPP, and CIEM with AI-driven risk prioritization and 90% automatic alert resolution',
              descriptionKo:
                'AI 기반 위험 우선순위 지정 및 90% 자동 알림 해결과 함께 CSPM, CWPP, CIEM을 결합한 포괄적인 CNAPP 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/cloud-security/',
              infraNodeTypes: ['kubernetes', 'container'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'CNAPP / CSPM + CWPP + CIEM',
              architectureRoleKo: 'CNAPP / CSPM + CWPP + CIEM',
              recommendedFor: [
                'Unified multi-cloud security posture and workload protection',
                'Cloud misconfiguration and excessive entitlement detection',
                'AI-driven risk prioritization with 98% critical vulnerability reduction',
              ],
              recommendedForKo: [
                '통합 멀티클라우드 보안 태세 및 워크로드 보호',
                '클라우드 잘못된 구성 및 과도한 권한 탐지',
                '98% 중요 취약점 감소를 달성하는 AI 기반 위험 우선순위 지정',
              ],
              securityCapabilities: [
                'CSPM with continuous posture monitoring',
                'CWPP with runtime workload protection',
                'CIEM with excessive permission detection',
                'AI-SPM for AI model and data security',
                'Pre-runtime image scanning and IaC security',
                'Compliance benchmarking (CIS, SOC 2, PCI-DSS, HIPAA)',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS + Falcon sensor',
                'Cloud Platforms': 'AWS, Azure, GCP',
                'Alert Resolution': '90% of alerts resolved automatically',
                'Vulnerability Reduction': '98% reduction in critical vulnerabilities',
                'Compliance': 'CIS Benchmarks, SOC 2, PCI-DSS, HIPAA, NIST',
              },
              children: [],
            },
            {
              nodeId: 'crowdstrike-falcon-container-security',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Container Security',
              nameKo: 'Falcon Container Security',
              description:
                'Runtime container and Kubernetes protection module providing image scanning, admission control, and real-time threat detection for containerized workloads',
              descriptionKo:
                '컨테이너화된 워크로드를 위한 이미지 스캐닝, 어드미션 제어, 실시간 위협 탐지를 제공하는 런타임 컨테이너 및 Kubernetes 보호 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/cloud-security/',
              infraNodeTypes: ['kubernetes', 'container'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Container & Kubernetes Runtime Security',
              architectureRoleKo: '컨테이너 및 Kubernetes 런타임 보안',
              recommendedFor: [
                'Runtime protection for Docker and Kubernetes workloads',
                'Container image vulnerability scanning in CI/CD pipelines',
                'Kubernetes Admission Controller for policy enforcement',
              ],
              recommendedForKo: [
                'Docker 및 Kubernetes 워크로드의 런타임 보호',
                'CI/CD 파이프라인에서의 컨테이너 이미지 취약점 스캐닝',
                '정책 적용을 위한 Kubernetes 어드미션 컨트롤러',
              ],
              securityCapabilities: [
                'Container image scanning and vulnerability detection',
                'Kubernetes Admission Controller',
                'Runtime threat detection for containers',
                'Drift prevention and image immutability enforcement',
                'Kubernetes service visibility and lateral movement detection',
              ],
              specs: {
                'Deployment': 'Cloud-native (Falcon sensor + sidecar)',
                'Container Platforms': 'Docker, Kubernetes, EKS, AKS, GKE, OpenShift',
                'Image Scanning': 'Pre-runtime CI/CD and registry scanning',
                'Admission Control': 'Kubernetes Admission Controller integration',
                'Response Time': '89% faster response times',
              },
              children: [],
            },
          ],
        },

        // -- Falcon Horizon --
        {
          nodeId: 'crowdstrike-falcon-horizon',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Horizon',
          nameKo: 'Falcon Horizon',
          description:
            'Cloud Security Posture Management (CSPM) solution providing continuous monitoring and assessment of cloud infrastructure configurations across multi-cloud environments',
          descriptionKo:
            '멀티클라우드 환경 전반에서 클라우드 인프라 구성의 지속적인 모니터링 및 평가를 제공하는 클라우드 보안 태세 관리(CSPM) 솔루션',
          sourceUrl: 'https://www.crowdstrike.com/products/cloud-security/',
          infraNodeTypes: ['kubernetes', 'container'],
          architectureRole: 'Cloud Security Posture Management (CSPM)',
          architectureRoleKo: '클라우드 보안 태세 관리 (CSPM)',
          recommendedFor: [
            'Continuous cloud security posture monitoring across AWS, Azure, and GCP',
            'Detecting and remediating cloud misconfigurations before exploitation',
            'Multi-cloud compliance monitoring against CIS, SOC 2, and PCI-DSS benchmarks',
          ],
          recommendedForKo: [
            'AWS, Azure, GCP 전반의 지속적인 클라우드 보안 태세 모니터링',
            '악용 전 클라우드 잘못된 구성 탐지 및 교정',
            'CIS, SOC 2, PCI-DSS 벤치마크 대비 멀티클라우드 컴플라이언스 모니터링',
          ],
          securityCapabilities: [
            'Continuous CSPM assessment',
            'Multi-cloud misconfiguration detection',
            'Compliance benchmark monitoring',
            'Risk-prioritized remediation guidance',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-horizon-cspm',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Horizon CSPM',
              nameKo: 'Falcon Horizon CSPM',
              description:
                'Agentless CSPM module for continuous assessment of cloud configurations with compliance benchmark mapping and guided remediation',
              descriptionKo:
                '컴플라이언스 벤치마크 매핑 및 가이드 교정과 함께 클라우드 구성의 지속적인 평가를 위한 에이전트리스 CSPM 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/cloud-security/',
              infraNodeTypes: ['kubernetes', 'container'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Cloud Security Posture Management (CSPM)',
              architectureRoleKo: '클라우드 보안 태세 관리 (CSPM)',
              recommendedFor: [
                'Agentless cloud misconfiguration detection and remediation',
                'Continuous compliance monitoring for multi-cloud environments',
                'Identifying and reducing excessive cloud permissions (CIEM)',
              ],
              recommendedForKo: [
                '에이전트리스 클라우드 잘못된 구성 탐지 및 교정',
                '멀티클라우드 환경의 지속적인 컴플라이언스 모니터링',
                '과도한 클라우드 권한 식별 및 축소 (CIEM)',
              ],
              securityCapabilities: [
                'Agentless cloud configuration assessment',
                'CIS Benchmark compliance checking',
                'Misconfiguration remediation guidance',
                'Excessive permission and entitlement detection',
                'Multi-cloud risk prioritization',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS (agentless)',
                'Cloud Platforms': 'AWS, Azure, GCP',
                'Assessment': 'Continuous agentless configuration scanning',
                'Compliance': 'CIS Benchmarks, SOC 2, PCI-DSS, HIPAA, GDPR',
                'Remediation': 'Guided remediation with risk prioritization',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Identity Protection
    // =====================================================================
    {
      nodeId: 'crowdstrike-identity-protection',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Identity Protection',
      nameKo: 'ID 보호',
      description:
        'Unified identity threat detection and response (ITDR) platform securing on-premises Active Directory and cloud identities with real-time behavioral analysis',
      descriptionKo:
        '실시간 행위 분석으로 온프레미스 Active Directory 및 클라우드 ID를 보호하는 통합 ID 위협 탐지 및 대응(ITDR) 플랫폼',
      sourceUrl: 'https://www.crowdstrike.com/products/identity-protection/',
      infraNodeTypes: ['iam', 'ldap-ad'],
      children: [
        // -- Falcon Identity Threat Detection --
        {
          nodeId: 'crowdstrike-falcon-itd',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Identity Threat Detection',
          nameKo: 'Falcon ID 위협 탐지',
          description:
            'AI-powered Active Directory threat detection providing real-time visibility into identity attacks, lateral movement, and credential misuse',
          descriptionKo:
            'ID 공격, 횡적 이동, 자격 증명 오용에 대한 실시간 가시성을 제공하는 AI 기반 Active Directory 위협 탐지',
          sourceUrl: 'https://www.crowdstrike.com/products/identity-protection/',
          infraNodeTypes: ['iam', 'ldap-ad'],
          architectureRole: 'Identity Threat Detection & Response (ITDR)',
          architectureRoleKo: 'ID 위협 탐지 및 대응 (ITDR)',
          recommendedFor: [
            'Detecting identity-based attacks across Active Directory and cloud IdPs',
            'Lateral movement detection across identity and endpoint domains',
            'Identifying stale accounts, excessive privileges, and AD misconfigurations',
          ],
          recommendedForKo: [
            'Active Directory 및 클라우드 IdP 전반의 ID 기반 공격 탐지',
            'ID 및 엔드포인트 도메인 간 횡적 이동 탐지',
            '비활성 계정, 과도한 권한, AD 잘못된 구성 식별',
          ],
          securityCapabilities: [
            'AI-powered identity threat detection (Charlotte AI)',
            'Active Directory attack path visibility',
            'Credential misuse and pass-the-hash detection',
            'Stale account and excessive privilege identification',
            'Cross-domain identity-endpoint correlation',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-itd-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Identity Threat Detection',
              nameKo: 'Falcon ID 위협 탐지',
              description:
                'Real-time Active Directory and cloud identity threat detection module using AI behavioral analysis to identify credential attacks and lateral movement',
              descriptionKo:
                'AI 행위 분석을 사용하여 자격 증명 공격 및 횡적 이동을 식별하는 실시간 Active Directory 및 클라우드 ID 위협 탐지 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/identity-protection/',
              infraNodeTypes: ['iam', 'ldap-ad'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Active Directory Threat Detection',
              architectureRoleKo: 'Active Directory 위협 탐지',
              recommendedFor: [
                'Real-time detection of identity attacks targeting Active Directory',
                'Identifying credential misuse and pass-the-hash/pass-the-ticket attacks',
                'AD security hygiene assessment and stale account cleanup',
              ],
              recommendedForKo: [
                'Active Directory를 대상으로 하는 ID 공격의 실시간 탐지',
                '자격 증명 오용 및 해시/티켓 전달 공격 식별',
                'AD 보안 위생 평가 및 비활성 계정 정리',
              ],
              securityCapabilities: [
                'AI-powered identity anomaly detection',
                'Pass-the-hash and pass-the-ticket detection',
                'Kerberoasting and golden ticket detection',
                'Active Directory attack path mapping',
                'Stale account and shadow admin identification',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Identity Sources': 'Active Directory, Entra ID, Okta',
                'Detection': 'AI behavioral analysis (Charlotte AI)',
                'Coverage': 'On-prem AD and cloud identity providers',
                'Integration': 'Unified with Falcon endpoint and cloud telemetry',
              },
              children: [],
            },
          ],
        },

        // -- Falcon Identity Threat Protection --
        {
          nodeId: 'crowdstrike-falcon-itp',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Identity Threat Protection',
          nameKo: 'Falcon ID 위협 보호',
          description:
            'Real-time identity security platform enforcing context-aware MFA, conditional access, and least-privilege policies across hybrid identity environments',
          descriptionKo:
            '하이브리드 ID 환경 전반에서 컨텍스트 인식 MFA, 조건부 접근, 최소 권한 정책을 적용하는 실시간 ID 보안 플랫폼',
          sourceUrl: 'https://www.crowdstrike.com/products/identity-protection/',
          infraNodeTypes: ['iam', 'ldap-ad', 'mfa'],
          architectureRole: 'Identity Threat Protection / Conditional Access',
          architectureRoleKo: 'ID 위협 보호 / 조건부 접근',
          recommendedFor: [
            'Enforcing context-aware MFA across hybrid identity environments',
            'Real-time identity-based conditional access for zero trust enforcement',
            'Preventing lateral movement with just-in-time privileged access',
          ],
          recommendedForKo: [
            '하이브리드 ID 환경에서 컨텍스트 인식 MFA 적용',
            '제로 트러스트 적용을 위한 실시간 ID 기반 조건부 접근',
            'Just-in-time 특권 접속으로 횡적 이동 방지',
          ],
          securityCapabilities: [
            'Context-aware MFA enforcement',
            'Conditional access policy engine',
            'Just-in-time privileged access',
            'Real-time identity risk scoring',
            'Lateral movement prevention',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-itp-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Identity Threat Protection',
              nameKo: 'Falcon ID 위협 보호',
              description:
                'Identity security enforcement module providing context-aware MFA, conditional access policies, and just-in-time privileged access across on-prem and cloud identities',
              descriptionKo:
                '온프레미스 및 클라우드 ID 전반에서 컨텍스트 인식 MFA, 조건부 접근 정책, Just-in-time 특권 접속을 제공하는 ID 보안 적용 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/identity-protection/',
              infraNodeTypes: ['iam', 'ldap-ad', 'mfa'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Real-Time Identity Security Enforcement',
              architectureRoleKo: '실시간 ID 보안 적용',
              recommendedFor: [
                'Enforcing phishing-resistant MFA across AD and cloud IdPs',
                'Zero trust identity verification with real-time risk scoring',
                'Just-in-time privileged access with automatic revocation',
              ],
              recommendedForKo: [
                'AD 및 클라우드 IdP 전반에서 피싱 방지 MFA 적용',
                '실시간 위험 점수를 통한 제로 트러스트 ID 인증',
                '자동 취소가 적용된 Just-in-time 특권 접속',
              ],
              securityCapabilities: [
                'Phishing-resistant MFA enforcement',
                'Context-aware conditional access',
                'Risk-based authentication decisions',
                'Just-in-time privileged access management',
                'Automatic privilege revocation',
                'Cross-domain identity-endpoint correlation',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Identity Sources': 'Active Directory, Entra ID, Okta',
                'MFA': 'Context-aware, phishing-resistant MFA',
                'Access Control': 'Conditional access, just-in-time PAM',
                'Integration': 'Unified with Falcon platform telemetry',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Security Operations
    // =====================================================================
    {
      nodeId: 'crowdstrike-security-operations',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Security Operations',
      nameKo: '보안 운영',
      description:
        'Unified SOC platform combining next-gen SIEM, managed threat hunting, managed detection & response, and exposure management for comprehensive security operations',
      descriptionKo:
        '포괄적인 보안 운영을 위해 차세대 SIEM, 관리형 위협 헌팅, 관리형 탐지 및 대응, 노출 관리를 결합한 통합 SOC 플랫폼',
      sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
      infraNodeTypes: ['siem', 'soar'],
      children: [
        // -- Falcon Next-Gen SIEM --
        {
          nodeId: 'crowdstrike-falcon-next-gen-siem',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Next-Gen SIEM',
          nameKo: 'Falcon 차세대 SIEM',
          description:
            'AI-native next-generation SIEM platform with petabyte-scale log management, 150x faster search, and unified SOC workflows replacing legacy SIEM solutions',
          descriptionKo:
            '페타바이트 규모 로그 관리, 150배 빠른 검색, 통합 SOC 워크플로우를 제공하며 레거시 SIEM 솔루션을 대체하는 AI 네이티브 차세대 SIEM 플랫폼',
          sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
          infraNodeTypes: ['siem'],
          architectureRole: 'Next-Generation SIEM / Unified SOC Platform',
          architectureRoleKo: '차세대 SIEM / 통합 SOC 플랫폼',
          recommendedFor: [
            'Replacing legacy SIEM with AI-native log management at petabyte scale',
            'Unified SOC platform consolidating detection, investigation, and response',
            'Cross-domain threat correlation across endpoint, cloud, and identity',
            'Reducing SIEM total cost with 80% savings over legacy solutions',
          ],
          recommendedForKo: [
            '페타바이트 규모의 AI 네이티브 로그 관리로 레거시 SIEM 교체',
            '탐지, 조사, 대응을 통합하는 통합 SOC 플랫폼',
            '엔드포인트, 클라우드, ID 전반의 도메인 간 위협 상관분석',
            '레거시 솔루션 대비 80% 비용 절감으로 SIEM 총 비용 감소',
          ],
          supportedProtocols: [
            'Syslog', 'CEF', 'LEEF', 'JSON',
            'REST API', 'HTTPS',
            'S3 (log ingestion)', 'Kafka',
          ],
          haFeatures: [
            'Cloud-native multi-tenant architecture',
            'Index-free search at petabyte scale',
            'Federated search across distributed data',
            'Active-active cloud infrastructure',
          ],
          securityCapabilities: [
            'AI-powered cross-domain threat detection',
            'Petabyte-scale log management (LogScale)',
            '150x faster search than legacy SIEM',
            'Automated correlation rule generation',
            'SOAR workflow automation (Falcon Fusion)',
            'Federated search across multiple data sources',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-logscale',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon LogScale',
              nameKo: 'Falcon LogScale',
              description:
                'Petabyte-scale log management and SIEM module with index-free architecture, 150x faster search, and 50% lower storage costs than legacy solutions',
              descriptionKo:
                '인덱스 프리 아키텍처, 150배 빠른 검색, 레거시 솔루션 대비 50% 낮은 스토리지 비용을 제공하는 페타바이트 규모 로그 관리 및 SIEM 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Log Management & SIEM (Petabyte Scale)',
              architectureRoleKo: '로그 관리 및 SIEM (페타바이트 규모)',
              recommendedFor: [
                'Petabyte-scale log management replacing legacy SIEM data lakes',
                'High-speed threat hunting and forensic investigation',
                'Consolidating multiple log aggregation tools into unified platform',
              ],
              recommendedForKo: [
                '레거시 SIEM 데이터 레이크를 대체하는 페타바이트 규모 로그 관리',
                '고속 위협 헌팅 및 포렌식 조사',
                '여러 로그 집계 도구를 통합 플랫폼으로 통합',
              ],
              securityCapabilities: [
                'Index-free log architecture',
                '150x faster search at petabyte scale',
                'Real-time streaming ingestion',
                'Federated search across distributed data',
                'Live dashboards and alerting',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Search Speed': '150x faster than legacy SIEM',
                'Storage Savings': '50% lower storage costs',
                'Architecture': 'Index-free, compression-optimized',
                'Data Streaming': '5x faster with Falcon Onum pipeline',
                'Scale': 'Petabyte-scale log management',
              },
              children: [],
            },
            {
              nodeId: 'crowdstrike-falcon-next-gen-siem-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Next-Gen SIEM',
              nameKo: 'Falcon 차세대 SIEM',
              description:
                'Unified SOC platform module combining AI-driven detection, investigation, and automated response with native cross-domain correlation and SOAR workflows',
              descriptionKo:
                '네이티브 도메인 간 상관분석 및 SOAR 워크플로우와 함께 AI 기반 탐지, 조사, 자동화된 대응을 결합한 통합 SOC 플랫폼 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
              infraNodeTypes: ['siem', 'soar'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Unified SOC Platform / Next-Gen SIEM',
              architectureRoleKo: '통합 SOC 플랫폼 / 차세대 SIEM',
              recommendedFor: [
                'Unified SOC operations replacing multiple point products',
                'AI-native detection with 95% false positive reduction',
                'Automated SOAR workflows with Falcon Fusion orchestration',
              ],
              recommendedForKo: [
                '여러 포인트 제품을 대체하는 통합 SOC 운영',
                '95% 오탐 감소를 달성하는 AI 네이티브 탐지',
                'Falcon Fusion 오케스트레이션을 통한 자동화된 SOAR 워크플로우',
              ],
              securityCapabilities: [
                'AI-driven cross-domain detection',
                'Automated correlation rule generation',
                'SOAR workflow automation (Falcon Fusion)',
                'Charlotte AI agentic investigation',
                '95% false positive reduction',
                'Centralized case management',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS',
                'Detection': 'AI-native cross-domain correlation',
                'False Positive Reduction': '95%',
                'Cost Savings': '80% over 3 years vs legacy SIEM',
                'Response Time': '70% faster with Falcon Onum pipeline',
              },
              children: [],
            },
          ],
        },

        // -- Falcon OverWatch --
        {
          nodeId: 'crowdstrike-falcon-overwatch',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon OverWatch',
          nameKo: 'Falcon OverWatch',
          description:
            '24/7 managed threat hunting service combining elite human hunters with AI-powered analytics to proactively identify sophisticated threats',
          descriptionKo:
            '정교한 위협을 사전에 식별하기 위해 엘리트 인간 헌터와 AI 기반 분석을 결합한 24/7 관리형 위협 헌팅 서비스',
          sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
          infraNodeTypes: ['siem'],
          architectureRole: 'Managed Threat Hunting (24/7)',
          architectureRoleKo: '관리형 위협 헌팅 (24/7)',
          recommendedFor: [
            '24/7 proactive threat hunting by CrowdStrike elite threat hunters',
            'Detecting advanced persistent threats that evade automated detection',
            'Augmenting internal SOC with expert-led continuous hunting',
          ],
          recommendedForKo: [
            'CrowdStrike 엘리트 위협 헌터에 의한 24/7 사전 위협 헌팅',
            '자동화된 탐지를 회피하는 고급 지속 위협 탐지',
            '전문가 주도 지속 헌팅으로 내부 SOC 보강',
          ],
          securityCapabilities: [
            '24/7 human-led threat hunting',
            'AI-assisted anomaly detection',
            'Advanced adversary tradecraft identification',
            'Real-time threat notifications',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-overwatch-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon OverWatch',
              nameKo: 'Falcon OverWatch',
              description:
                '24/7 managed threat hunting service providing continuous human-led proactive hunting across endpoint, cloud, and identity domains',
              descriptionKo:
                '엔드포인트, 클라우드, ID 도메인 전반에서 인간 주도의 사전 헌팅을 지속적으로 제공하는 24/7 관리형 위협 헌팅 서비스',
              sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: '24/7 Managed Threat Hunting Service',
              architectureRoleKo: '24/7 관리형 위협 헌팅 서비스',
              recommendedFor: [
                'Continuous proactive threat hunting by CrowdStrike experts',
                'Detecting stealthy adversary tradecraft and living-off-the-land attacks',
                'Cross-domain hunting across endpoint, cloud, and identity telemetry',
              ],
              recommendedForKo: [
                'CrowdStrike 전문가에 의한 지속적인 사전 위협 헌팅',
                '은밀한 공격자 기법 및 Living-off-the-Land 공격 탐지',
                '엔드포인트, 클라우드, ID 텔레메트리 전반의 도메인 간 헌팅',
              ],
              securityCapabilities: [
                '24/7 elite human threat hunters',
                'Cross-domain hunting (endpoint, cloud, identity)',
                'Advanced adversary tradecraft detection',
                'Real-time threat notifications and recommendations',
                'Threat intelligence enrichment',
              ],
              specs: {
                'Deployment': 'Cloud-native managed service',
                'Coverage': '24/7/365 continuous hunting',
                'Domains': 'Endpoint, cloud, identity',
                'Hunters': 'CrowdStrike elite threat hunting team',
                'Response': 'Real-time threat notifications with remediation guidance',
              },
              children: [],
            },
          ],
        },

        // -- Falcon Complete --
        {
          nodeId: 'crowdstrike-falcon-complete',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Complete',
          nameKo: 'Falcon Complete',
          description:
            'Managed Detection and Response (MDR) service providing turnkey 24/7 monitoring, detection, investigation, and remediation with breach prevention warranty',
          descriptionKo:
            '침해 방지 보증과 함께 턴키 24/7 모니터링, 탐지, 조사, 교정을 제공하는 관리형 탐지 및 대응(MDR) 서비스',
          sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
          infraNodeTypes: ['siem', 'soar'],
          architectureRole: 'Managed Detection & Response (MDR)',
          architectureRoleKo: '관리형 탐지 및 대응 (MDR)',
          recommendedFor: [
            'Turnkey 24/7 managed detection and response for resource-constrained teams',
            'Outsourced SOC operations with CrowdStrike expert analysts',
            'Breach prevention warranty with financial guarantee',
          ],
          recommendedForKo: [
            '리소스가 제한된 팀을 위한 턴키 24/7 관리형 탐지 및 대응',
            'CrowdStrike 전문 분석가를 통한 아웃소싱 SOC 운영',
            '금융 보증이 포함된 침해 방지 보증',
          ],
          securityCapabilities: [
            '24/7 managed detection and response',
            'Expert-led investigation and remediation',
            'Threat hunting integration',
            'Breach prevention warranty',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-complete-mdr',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Complete MDR',
              nameKo: 'Falcon Complete MDR',
              description:
                'Fully managed detection and response service delivering 24/7 expert monitoring, investigation, and surgical remediation with breach prevention warranty',
              descriptionKo:
                '침해 방지 보증과 함께 24/7 전문가 모니터링, 조사, 정밀 교정을 제공하는 완전 관리형 탐지 및 대응 서비스',
              sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
              infraNodeTypes: ['siem', 'soar'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Fully Managed MDR Service',
              architectureRoleKo: '완전 관리형 MDR 서비스',
              recommendedFor: [
                'Turnkey MDR for organizations without dedicated SOC staff',
                'Expert-led incident investigation and surgical remediation',
                'Breach prevention warranty for risk mitigation',
              ],
              recommendedForKo: [
                '전담 SOC 인력이 없는 조직을 위한 턴키 MDR',
                '전문가 주도 인시던트 조사 및 정밀 교정',
                '위험 경감을 위한 침해 방지 보증',
              ],
              securityCapabilities: [
                '24/7 expert monitoring and triage',
                'Surgical remote remediation',
                'Proactive threat hunting (OverWatch integration)',
                'Breach prevention warranty',
                'Average 7-minute response time',
              ],
              specs: {
                'Deployment': 'Cloud-native managed service',
                'Coverage': '24/7/365 monitoring and response',
                'Response Time': 'Average 7-minute response time',
                'Warranty': 'Breach prevention warranty (financial guarantee)',
                'Domains': 'Endpoint, cloud, identity coverage',
              },
              children: [],
            },
          ],
        },

        // -- Falcon Exposure Management --
        {
          nodeId: 'crowdstrike-falcon-exposure-management',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Exposure Management',
          nameKo: 'Falcon 노출 관리',
          description:
            'Exposure management platform combining vulnerability assessment and external attack surface management for comprehensive risk visibility',
          descriptionKo:
            '포괄적인 위험 가시성을 위해 취약점 평가와 외부 공격 표면 관리를 결합한 노출 관리 플랫폼',
          sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
          infraNodeTypes: ['siem'],
          architectureRole: 'Exposure Management / Vulnerability Assessment',
          architectureRoleKo: '노출 관리 / 취약점 평가',
          recommendedFor: [
            'Continuous vulnerability management with risk-based prioritization',
            'External attack surface discovery and monitoring',
            'Proactive exposure reduction before adversary exploitation',
          ],
          recommendedForKo: [
            '위험 기반 우선순위 지정을 통한 지속적인 취약점 관리',
            '외부 공격 표면 발견 및 모니터링',
            '공격자 악용 전 사전 노출 감소',
          ],
          securityCapabilities: [
            'AI-powered vulnerability prioritization',
            'External attack surface monitoring',
            'Risk-based patching recommendations',
            'Exposure trend analysis',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-spotlight',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Spotlight',
              nameKo: 'Falcon Spotlight',
              description:
                'Scanless vulnerability management module leveraging the Falcon sensor for real-time vulnerability assessment without additional scan infrastructure',
              descriptionKo:
                '추가 스캔 인프라 없이 실시간 취약점 평가를 위해 Falcon 센서를 활용하는 스캔리스 취약점 관리 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Scanless Vulnerability Management',
              architectureRoleKo: '스캔리스 취약점 관리',
              recommendedFor: [
                'Real-time vulnerability assessment without network scanning',
                'Risk-based vulnerability prioritization with exploit likelihood',
                'Eliminating scan infrastructure and reducing vulnerability management complexity',
              ],
              recommendedForKo: [
                '네트워크 스캐닝 없이 실시간 취약점 평가',
                '악용 가능성을 기반으로 한 위험 기반 취약점 우선순위 지정',
                '스캔 인프라 제거 및 취약점 관리 복잡성 감소',
              ],
              securityCapabilities: [
                'Scanless vulnerability detection via Falcon sensor',
                'ExPRT.AI risk-based prioritization',
                'Zero-day vulnerability assessment',
                'Patch recommendation with exploit likelihood',
              ],
              specs: {
                'Deployment': 'Cloud-native (Falcon sensor, no scanners)',
                'Assessment': 'Real-time scanless vulnerability detection',
                'Prioritization': 'ExPRT.AI risk-based scoring',
                'Coverage': 'All endpoints running Falcon sensor',
                'Integration': 'Unified with Falcon platform telemetry',
              },
              children: [],
            },
            {
              nodeId: 'crowdstrike-falcon-surface',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Surface',
              nameKo: 'Falcon Surface',
              description:
                'External Attack Surface Management (EASM) module discovering and monitoring internet-facing assets and exposures from an adversary perspective',
              descriptionKo:
                '공격자 관점에서 인터넷 노출 자산 및 취약점을 발견하고 모니터링하는 외부 공격 표면 관리(EASM) 모듈',
              sourceUrl: 'https://www.crowdstrike.com/products/next-gen-siem/',
              infraNodeTypes: ['siem'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'External Attack Surface Management (EASM)',
              architectureRoleKo: '외부 공격 표면 관리 (EASM)',
              recommendedFor: [
                'Discovering unknown internet-facing assets and shadow IT',
                'Monitoring external attack surface from adversary perspective',
                'Identifying exposed services, certificates, and misconfigurations',
              ],
              recommendedForKo: [
                '알 수 없는 인터넷 노출 자산 및 섀도우 IT 발견',
                '공격자 관점에서 외부 공격 표면 모니터링',
                '노출된 서비스, 인증서, 잘못된 구성 식별',
              ],
              securityCapabilities: [
                'Internet-facing asset discovery',
                'Shadow IT and unknown asset detection',
                'Exposed service and port monitoring',
                'Certificate and DNS monitoring',
                'Risk scoring and prioritization',
              ],
              specs: {
                'Deployment': 'Cloud-native SaaS (agentless)',
                'Discovery': 'Internet-wide asset scanning',
                'Monitoring': 'Continuous external exposure monitoring',
                'Risk Assessment': 'Adversary-perspective risk scoring',
                'Coverage': 'IPs, domains, certificates, cloud assets',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 5. Data Protection
    // =====================================================================
    {
      nodeId: 'crowdstrike-data-protection',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Data Protection',
      nameKo: '데이터 보호',
      description:
        'Endpoint data loss prevention platform protecting sensitive data across endpoints, browsers, and GenAI applications in real time',
      descriptionKo:
        '엔드포인트, 브라우저, GenAI 애플리케이션 전반에서 민감 데이터를 실시간으로 보호하는 엔드포인트 데이터 유출 방지 플랫폼',
      sourceUrl: 'https://www.crowdstrike.com/platform/',
      infraNodeTypes: ['dlp'],
      children: [
        // -- Falcon Data Protection --
        {
          nodeId: 'crowdstrike-falcon-data-protection',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Falcon Data Protection',
          nameKo: 'Falcon 데이터 보호',
          description:
            'Unified endpoint DLP module integrated with the Falcon sensor to detect and prevent sensitive data exfiltration across endpoints, browsers, and GenAI applications',
          descriptionKo:
            '엔드포인트, 브라우저, GenAI 애플리케이션 전반에서 민감 데이터 유출을 탐지하고 방지하기 위해 Falcon 센서와 통합된 통합 엔드포인트 DLP 모듈',
          sourceUrl: 'https://www.crowdstrike.com/platform/',
          infraNodeTypes: ['dlp'],
          architectureRole: 'Endpoint Data Loss Prevention',
          architectureRoleKo: '엔드포인트 데이터 유출 방지',
          recommendedFor: [
            'Preventing sensitive data exfiltration from endpoints',
            'Real-time GenAI data leak detection in browsers and applications',
            'Compliance-driven data protection for PII, PHI, and PCI data',
          ],
          recommendedForKo: [
            '엔드포인트에서의 민감 데이터 유출 방지',
            '브라우저 및 애플리케이션에서 실시간 GenAI 데이터 유출 탐지',
            'PII, PHI, PCI 데이터에 대한 컴플라이언스 기반 데이터 보호',
          ],
          securityCapabilities: [
            'Endpoint DLP with Falcon sensor integration',
            'GenAI data leak detection and prevention',
            'Browser-based data exfiltration blocking',
            'Sensitive data classification and content inspection',
            'Insider threat detection',
          ],
          children: [
            {
              nodeId: 'crowdstrike-falcon-data-protection-module',
              depth: 2,
              depthLabel: 'Module',
              depthLabelKo: '모듈',
              name: 'Falcon Data Protection',
              nameKo: 'Falcon 데이터 보호',
              description:
                'Cloud-native endpoint DLP module leveraging the Falcon sensor to detect and block sensitive data exfiltration across endpoints, browsers, local applications, and GenAI tools',
              descriptionKo:
                '엔드포인트, 브라우저, 로컬 애플리케이션, GenAI 도구 전반에서 민감 데이터 유출을 탐지하고 차단하기 위해 Falcon 센서를 활용하는 클라우드 네이티브 엔드포인트 DLP 모듈',
              sourceUrl: 'https://www.crowdstrike.com/platform/',
              infraNodeTypes: ['dlp'],
              lifecycle: 'active',
              formFactor: 'cloud',
              licensingModel: 'subscription',
              architectureRole: 'Endpoint DLP / GenAI Data Protection',
              architectureRoleKo: '엔드포인트 DLP / GenAI 데이터 보호',
              recommendedFor: [
                'Real-time endpoint data loss prevention with Falcon sensor',
                'GenAI data leak protection across browsers and local applications',
                'Insider threat detection with data exfiltration correlation',
              ],
              recommendedForKo: [
                'Falcon 센서를 활용한 실시간 엔드포인트 데이터 유출 방지',
                '브라우저 및 로컬 애플리케이션 전반의 GenAI 데이터 유출 보호',
                '데이터 유출 상관분석을 통한 내부자 위협 탐지',
              ],
              securityCapabilities: [
                'Endpoint DLP with content inspection',
                'GenAI data leak detection and blocking',
                'Browser data exfiltration prevention',
                'Sensitive data classification (PII, PHI, PCI)',
                'Insider threat data correlation',
                'USB and removable media data control',
              ],
              specs: {
                'Deployment': 'Cloud-native (Falcon sensor integration)',
                'Platform Support': 'Windows, macOS, Linux',
                'Channels': 'Endpoints, browsers, local applications, GenAI tools',
                'Classification': 'PII, PHI, PCI, intellectual property',
                'Compliance': 'GDPR, HIPAA, PCI-DSS, SOX',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
