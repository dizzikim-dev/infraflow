/**
 * Red Hat (IBM) -- Full Product Catalog
 *
 * Hierarchical product tree covering Linux Platform, Cloud & Container Platform,
 * Automation, Storage, and Cloud Services categories.
 *
 * Data sourced from https://www.redhat.com/en/technologies/all-products
 * Last crawled: 2026-02-22
 */

import type { VendorCatalog } from '../types';

// ---------------------------------------------------------------------------
// Red Hat Product Catalog
// ---------------------------------------------------------------------------

export const redhatCatalog: VendorCatalog = {
  vendorId: 'red-hat',
  vendorName: 'Red Hat',
  vendorNameKo: '레드햇',
  headquarters: 'Raleigh, NC, USA',
  website: 'https://www.redhat.com',
  productPageUrl: 'https://www.redhat.com/en/technologies/all-products',
  depthStructure: ['category', 'product-line', 'edition'],
  depthStructureKo: ['카테고리', '제품 라인', '에디션'],
  lastCrawled: '2026-02-22',
  crawlSource: 'https://www.redhat.com/en/technologies/all-products',
  stats: { totalProducts: 32, maxDepth: 2, categoriesCount: 5 },
  products: [
    // =====================================================================
    // 1. Linux Platform
    // =====================================================================
    {
      nodeId: 'redhat-linux-platform',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Linux Platform',
      nameKo: '리눅스 플랫폼',
      description:
        'Enterprise Linux operating system family for servers, cloud, edge, and AI workloads with long-term lifecycle support',
      descriptionKo:
        '서버, 클라우드, 엣지, AI 워크로드를 위한 장기 라이프사이클 지원 엔터프라이즈 리눅스 운영체제 제품군',
      sourceUrl: 'https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux',
      infraNodeTypes: ['web-server', 'app-server', 'db-server', 'vm'],
      children: [
        // -- Red Hat Enterprise Linux --
        {
          nodeId: 'redhat-enterprise-linux',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Red Hat Enterprise Linux',
          nameKo: 'Red Hat 엔터프라이즈 리눅스',
          description:
            'Industry-leading enterprise Linux platform with 10-year lifecycle support, SELinux mandatory access control, and certification across all major hardware and cloud providers',
          descriptionKo:
            '10년 라이프사이클 지원, SELinux 강제 접근 제어, 주요 하드웨어 및 클라우드 제공자 인증을 갖춘 업계 최고의 엔터프라이즈 리눅스 플랫폼',
          sourceUrl: 'https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux',
          infraNodeTypes: ['web-server', 'app-server', 'db-server', 'vm'],
          architectureRole: 'Server OS / Compute Foundation',
          architectureRoleKo: '서버 OS / 컴퓨트 기반',
          recommendedFor: [
            'Enterprise data center server standardization',
            'Mission-critical application hosting (Oracle, SAP, SQL Server)',
            'Hybrid cloud workloads across on-premises and public cloud',
            'Regulatory-compliant environments (FIPS 140-2/3, CC EAL4+)',
            'Virtualization host (KVM hypervisor)',
          ],
          recommendedForKo: [
            '엔터프라이즈 데이터센터 서버 표준화',
            '미션 크리티컬 애플리케이션 호스팅 (Oracle, SAP, SQL Server)',
            '온프레미스 및 퍼블릭 클라우드의 하이브리드 클라우드 워크로드',
            '규제 준수 환경 (FIPS 140-2/3, CC EAL4+)',
            '가상화 호스트 (KVM 하이퍼바이저)',
          ],
          supportedProtocols: [
            'TCP/IP', 'NFS', 'SMB/CIFS', 'iSCSI', 'Fibre Channel',
            'SSH', 'TLS 1.3', 'LDAP', 'Kerberos', 'SNMP',
            'HTTP/HTTPS', 'DNS', 'DHCP',
          ],
          haFeatures: [
            'Pacemaker/Corosync high availability clustering',
            'GFS2 cluster file system',
            'DLM (Distributed Lock Manager)',
            'Fencing/STONITH for split-brain prevention',
            'Active-active and active-passive clustering',
            'Automatic failover with quorum-based decisions',
          ],
          securityCapabilities: [
            'SELinux mandatory access control',
            'FIPS 140-2/3 validated cryptographic modules',
            'Common Criteria EAL4+ certification',
            'System-wide cryptographic policies',
            'Integrity Measurement Architecture (IMA)',
            'Secure Boot and UEFI support',
            'SCAP/OpenSCAP security compliance scanning',
            'Audit subsystem (auditd) for comprehensive logging',
            'Firewalld zone-based firewall with nftables',
          ],
          children: [
            {
              nodeId: 'redhat-rhel-standard',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat Enterprise Linux Standard',
              nameKo: 'RHEL 스탠다드',
              description:
                'General-purpose enterprise Linux with 10-year support lifecycle, automated patching, and broad hardware/cloud certification',
              descriptionKo:
                '10년 지원 라이프사이클, 자동 패치 적용, 광범위한 하드웨어/클라우드 인증을 갖춘 범용 엔터프라이즈 리눅스',
              sourceUrl: 'https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'Supported Architectures': 'x86_64, ARM64 (aarch64), IBM Power (ppc64le), IBM Z (s390x)',
                'Lifecycle Support': '10 years Full Support + Extended Life Cycle Support (ELS)',
                'Kernel': 'Linux 6.x (RHEL 9.x), real-time kernel optional',
                'Container Runtime': 'Podman, Buildah, Skopeo (rootless containers)',
                'Package Manager': 'DNF/YUM with AppStream modular repositories',
                'Virtualization': 'KVM hypervisor with libvirt management',
                'File Systems': 'XFS (default), ext4, GFS2 (clustered), NFS, Stratis',
                'Security Framework': 'SELinux, FIPS 140-2/3, OpenSCAP, Firewalld',
                'Management Integration': 'Red Hat Insights, Satellite, Ansible',
              },
              children: [],
            },
            {
              nodeId: 'redhat-rhel-sap',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat Enterprise Linux for SAP Solutions',
              nameKo: 'RHEL for SAP 솔루션',
              description:
                'SAP-certified RHEL with tuned profiles, HANA-optimized memory management, and integrated SAP cluster automation',
              descriptionKo:
                'SAP 인증 RHEL로 튜닝된 프로파일, HANA 최적화 메모리 관리, 통합 SAP 클러스터 자동화 제공',
              sourceUrl: 'https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux/sap',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'SAP Certification': 'SAP HANA, SAP NetWeaver, SAP S/4HANA certified',
                'Update Services': 'E4S (Extended Update Support) for SAP, 4-year minor release support',
                'Memory Optimization': 'HANA-tuned huge pages, NUMA-aware scheduling',
                'HA for SAP': 'Pacemaker-based SAP HANA System Replication automation (SAPHanaSR)',
                'SAP System Roles': 'Ansible roles for SAP HANA, NetWeaver, cluster deployment',
                'Max Memory': 'Up to 24 TB RAM for SAP HANA scale-up',
                'Supported Platforms': 'Bare metal, VMware, AWS, Azure, GCP, IBM Power',
                'Business Continuity': 'SAP HANA multitarget system replication with auto-failover',
              },
              children: [],
            },
            {
              nodeId: 'redhat-rhel-edge',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat Enterprise Linux for Edge',
              nameKo: 'RHEL for 엣지',
              description:
                'Lightweight immutable RHEL for edge deployments with image-based updates, rpm-ostree transactions, and fleet management',
              descriptionKo:
                '이미지 기반 업데이트, rpm-ostree 트랜잭션, 플릿 관리를 갖춘 엣지 배포용 경량 불변 RHEL',
              sourceUrl: 'https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux/edge-computing',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'Update Model': 'Image-based (rpm-ostree) with atomic rollback',
                'Min Resources': '1 CPU, 2 GB RAM, 5 GB disk (minimal edge image)',
                'Image Builder': 'Composer-based custom OS image creation (ISO, QCOW2, AMI, raw)',
                'Fleet Management': 'FDO (FIDO Device Onboarding) for zero-touch provisioning',
                'Container Support': 'Podman with auto-update and systemd integration',
                'Architectures': 'x86_64, ARM64 (aarch64)',
                'Security': 'SELinux enforcing, Secure Boot, dm-verity filesystem integrity',
                'Connectivity': 'NetworkManager, WiFi, Cellular (ModemManager), Bluetooth',
              },
              children: [],
            },
            {
              nodeId: 'redhat-rhel-ai',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat Enterprise Linux AI',
              nameKo: 'RHEL AI',
              description:
                'RHEL optimized for AI/ML workloads with GPU driver integration, InstructLab model alignment, and bootable container delivery',
              descriptionKo:
                'GPU 드라이버 통합, InstructLab 모델 정렬, 부팅 가능한 컨테이너 제공 방식의 AI/ML 워크로드 최적화 RHEL',
              sourceUrl: 'https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux/ai',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'GPU Support': 'NVIDIA CUDA (A100, H100, L40S), AMD ROCm, Intel Gaudi',
                'AI Toolkit': 'InstructLab for LLM fine-tuning and alignment',
                'Delivery Model': 'Bootable container image (rpm-ostree based)',
                'ML Frameworks': 'PyTorch, TensorFlow, vLLM inference server pre-integrated',
                'Model Serving': 'vLLM-based inference with OpenAI-compatible API endpoint',
                'Foundation Models': 'IBM Granite family pre-packaged',
                'Supported Platforms': 'Bare metal, AWS, Azure, GCP, IBM Cloud',
                'Deployment': 'Single-node AI appliance or OpenShift AI integration',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 2. Cloud & Container Platform
    // =====================================================================
    {
      nodeId: 'redhat-cloud-container',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Cloud & Container Platform',
      nameKo: '클라우드 및 컨테이너 플랫폼',
      description:
        'Enterprise Kubernetes, virtualization, and AI/ML platforms for hybrid and multi-cloud container orchestration',
      descriptionKo:
        '하이브리드 및 멀티클라우드 컨테이너 오케스트레이션을 위한 엔터프라이즈 쿠버네티스, 가상화, AI/ML 플랫폼',
      sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift',
      infraNodeTypes: ['kubernetes', 'container'],
      children: [
        // -- OpenShift Container Platform --
        {
          nodeId: 'redhat-openshift-container-platform',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'OpenShift Container Platform',
          nameKo: 'OpenShift 컨테이너 플랫폼',
          description:
            'Enterprise Kubernetes platform with integrated CI/CD, service mesh, serverless, and developer tools for hybrid cloud container orchestration',
          descriptionKo:
            '통합 CI/CD, 서비스 메시, 서버리스, 개발자 도구를 갖춘 하이브리드 클라우드 컨테이너 오케스트레이션용 엔터프라이즈 쿠버네티스 플랫폼',
          sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/container-platform',
          infraNodeTypes: ['kubernetes', 'container'],
          architectureRole: 'Container Orchestration Platform',
          architectureRoleKo: '컨테이너 오케스트레이션 플랫폼',
          recommendedFor: [
            'Enterprise Kubernetes standardization across hybrid cloud',
            'Cloud-native application development with integrated CI/CD (Tekton, ArgoCD)',
            'Microservices architecture with service mesh (Istio-based OpenShift Service Mesh)',
            'Multi-cluster management with Advanced Cluster Management',
            'Regulated industries requiring FIPS-compliant container platform',
          ],
          recommendedForKo: [
            '하이브리드 클라우드 전반의 엔터프라이즈 쿠버네티스 표준화',
            '통합 CI/CD(Tekton, ArgoCD)를 활용한 클라우드 네이티브 애플리케이션 개발',
            '서비스 메시(Istio 기반 OpenShift 서비스 메시)를 활용한 마이크로서비스 아키텍처',
            'Advanced Cluster Management를 통한 멀티클러스터 관리',
            'FIPS 준수 컨테이너 플랫폼이 필요한 규제 산업',
          ],
          supportedProtocols: [
            'HTTP/HTTPS', 'gRPC', 'TCP/UDP', 'TLS 1.3',
            'OAuth 2.0', 'OIDC', 'LDAP', 'SAML',
            'OVN-Kubernetes (Geneve)', 'OpenShift SDN (VXLAN)',
            'MetalLB (BGP/L2)', 'Multus (SR-IOV, Macvlan)',
          ],
          haFeatures: [
            'Control plane HA with etcd quorum (3+ master nodes)',
            'Pod disruption budgets and anti-affinity scheduling',
            'Automatic node health checking and machine remediation',
            'Multi-zone and multi-region deployment support',
            'In-place cluster upgrades with zero downtime (rolling updates)',
            'Operator Lifecycle Manager for automated operator updates',
          ],
          securityCapabilities: [
            'Security Context Constraints (SCC) for pod security',
            'FIPS 140-2 compliant mode',
            'Network policies with OVN-Kubernetes',
            'Built-in OAuth server with RBAC',
            'Image signing and verification (Sigstore/cosign)',
            'Compliance operator for CIS benchmarks and NIST profiles',
            'eBPF-based runtime threat detection',
            'Encryption at rest for etcd secrets',
          ],
          children: [
            {
              nodeId: 'redhat-ocp-self-managed',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'OpenShift Container Platform',
              nameKo: 'OpenShift 컨테이너 플랫폼 (자체 관리)',
              description:
                'Self-managed enterprise Kubernetes for on-premises, bare metal, VMware, and cloud IaaS with full operational control',
              descriptionKo:
                '온프레미스, 베어메탈, VMware, 클라우드 IaaS에서 완전한 운영 제어를 제공하는 자체 관리형 엔터프라이즈 쿠버네티스',
              sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/container-platform',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'Kubernetes Version': '1.28+ (OpenShift 4.15+)',
                'Supported Platforms': 'Bare metal, VMware vSphere, AWS, Azure, GCP, IBM Cloud, OpenStack, RHV',
                'Networking': 'OVN-Kubernetes (default), OpenShift SDN, Multus for secondary networks',
                'Storage': 'CSI drivers, ODF (Ceph), Local Storage Operator, NFS',
                'CI/CD': 'OpenShift Pipelines (Tekton), OpenShift GitOps (ArgoCD)',
                'Service Mesh': 'OpenShift Service Mesh (Istio-based) with mTLS',
                'Registry': 'Integrated container image registry with image streams',
                'Max Nodes': '2,000 nodes per cluster (tested at scale)',
                'Max Pods': '150,000 pods per cluster, 250 pods per node',
              },
              children: [],
            },
            {
              nodeId: 'redhat-openshift-dedicated',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'OpenShift Dedicated',
              nameKo: 'OpenShift 데디케이티드',
              description:
                'Red Hat-managed OpenShift clusters on AWS or GCP with SRE team operations, 99.95% SLA, and single-tenant isolation',
              descriptionKo:
                'AWS 또는 GCP에서 SRE 팀 운영, 99.95% SLA, 단일 테넌트 격리를 제공하는 Red Hat 관리형 OpenShift 클러스터',
              sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/dedicated',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'cloud',
              specs: {
                'Cloud Providers': 'AWS, GCP',
                'Management': 'Red Hat SRE team-managed control plane and infrastructure',
                'SLA': '99.95% uptime',
                'Tenancy': 'Single-tenant dedicated cluster',
                'Billing': 'Hourly or annual subscription via Red Hat or cloud marketplace',
                'Compliance': 'SOC 2 Type II, ISO 27001, PCI DSS, HIPAA ready',
                'Scaling': 'Auto-scaling worker nodes (machine autoscaler)',
                'Networking': 'AWS PrivateLink / GCP Private Service Connect',
              },
              children: [],
            },
            {
              nodeId: 'redhat-rosa',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat OpenShift Service on AWS (ROSA)',
              nameKo: 'ROSA (AWS 기반 Red Hat OpenShift 서비스)',
              description:
                'AWS-native managed OpenShift with joint Red Hat and AWS support, consolidated AWS billing, and deep AWS service integration',
              descriptionKo:
                'Red Hat과 AWS 공동 지원, AWS 통합 빌링, 심층 AWS 서비스 통합을 제공하는 AWS 네이티브 관리형 OpenShift',
              sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/aws',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'cloud',
              specs: {
                'Cloud Provider': 'AWS (native integration)',
                'Management': 'Jointly managed by Red Hat SRE and AWS',
                'SLA': '99.95% uptime for multi-AZ, 99.5% for single-AZ',
                'AWS Integration': 'IAM STS, VPC, EBS/EFS, ALB/NLB, PrivateLink, CloudWatch',
                'Billing': 'Pay-as-you-go via AWS Marketplace or annual commit',
                'Compliance': 'SOC 2, ISO 27001, PCI DSS, HIPAA, FedRAMP (HPC variant)',
                'Control Plane': 'Hosted Control Planes (HCP) option for reduced overhead',
                'Max Workers': 'Up to 180 worker nodes per cluster',
              },
              children: [],
            },
          ],
        },

        // -- OpenShift Virtualization --
        {
          nodeId: 'redhat-openshift-virtualization',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'OpenShift Virtualization',
          nameKo: 'OpenShift 가상화',
          description:
            'KubeVirt-based VM management on OpenShift for running traditional VMs alongside containers, enabling VMware migration to Kubernetes',
          descriptionKo:
            'OpenShift에서 컨테이너와 함께 기존 VM을 실행하고 VMware에서 쿠버네티스로의 마이그레이션을 지원하는 KubeVirt 기반 VM 관리',
          sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/virtualization',
          infraNodeTypes: ['vm'],
          architectureRole: 'VM-on-Kubernetes Convergence',
          architectureRoleKo: '쿠버네티스 기반 VM 통합',
          recommendedFor: [
            'VMware to Kubernetes migration (vSphere replacement)',
            'Unified container and VM management on single platform',
            'Legacy application modernization (lift-and-shift to K8s)',
            'Dev/test environments requiring mixed VM and container workloads',
            'Cost reduction through infrastructure consolidation',
          ],
          recommendedForKo: [
            'VMware에서 쿠버네티스로의 마이그레이션 (vSphere 대체)',
            '단일 플랫폼에서 통합 컨테이너 및 VM 관리',
            '레거시 애플리케이션 모더나이제이션 (K8s로 리프트 앤 시프트)',
            'VM과 컨테이너 워크로드가 혼합된 개발/테스트 환경',
            '인프라 통합을 통한 비용 절감',
          ],
          supportedProtocols: [
            'KubeVirt API', 'virtctl CLI', 'VNC', 'RDP', 'SSH',
            'OVN-Kubernetes', 'SR-IOV', 'Bridge networking',
            'iSCSI', 'NFS', 'Fibre Channel',
          ],
          haFeatures: [
            'Live migration of VMs between nodes',
            'Automatic VM restart on node failure',
            'Node drain with graceful VM live migration',
            'Anti-affinity rules for VM high availability',
          ],
          securityCapabilities: [
            'SELinux isolation for VMs',
            'Dedicated CPU and NUMA pinning',
            'Encrypted VM disks via LUKS',
            'Network policies for VM traffic segmentation',
          ],
          children: [
            {
              nodeId: 'redhat-openshift-virt-edition',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'OpenShift Virtualization',
              nameKo: 'OpenShift 가상화',
              description:
                'KubeVirt-based VM runtime integrated into OpenShift for running Windows, Linux, and legacy VMs on Kubernetes clusters',
              descriptionKo:
                'OpenShift에 통합된 KubeVirt 기반 VM 런타임으로 쿠버네티스 클러스터에서 Windows, Linux, 레거시 VM 실행',
              sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/virtualization',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'Hypervisor': 'KubeVirt (KVM-based) on OpenShift',
                'Guest OS': 'RHEL, Windows Server, CentOS, Ubuntu, SUSE, Fedora',
                'Migration Tool': 'Migration Toolkit for Virtualization (MTV) from VMware/RHV/OpenStack',
                'Live Migration': 'Zero-downtime VM live migration between worker nodes',
                'Storage': 'CSI-based PVCs, ODF (Ceph), local disks, NFS',
                'Networking': 'OVN-Kubernetes, SR-IOV, Linux Bridge, Multus',
                'GPU Passthrough': 'Supported (NVIDIA vGPU and passthrough)',
                'Max VMs per Node': 'Dependent on node resources (tested 100+ VMs per node)',
              },
              children: [],
            },
          ],
        },

        // -- OpenShift AI --
        {
          nodeId: 'redhat-openshift-ai',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'OpenShift AI',
          nameKo: 'OpenShift AI',
          description:
            'MLOps platform on OpenShift for the full AI/ML lifecycle including model training, serving, monitoring, and collaborative data science notebooks',
          descriptionKo:
            '모델 학습, 서빙, 모니터링, 협업 데이터 사이언스 노트북을 포함한 전체 AI/ML 라이프사이클을 위한 OpenShift 기반 MLOps 플랫폼',
          sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai',
          infraNodeTypes: ['kubernetes', 'container'],
          architectureRole: 'MLOps / AI Platform',
          architectureRoleKo: 'MLOps / AI 플랫폼',
          recommendedFor: [
            'Enterprise MLOps with model lifecycle management',
            'Data scientist collaboration with JupyterHub notebooks',
            'GPU-accelerated model training at scale (distributed training)',
            'Model serving with autoscaling inference endpoints',
            'AI/ML pipeline orchestration and experiment tracking',
          ],
          recommendedForKo: [
            '모델 라이프사이클 관리를 통한 엔터프라이즈 MLOps',
            'JupyterHub 노트북을 통한 데이터 사이언티스트 협업',
            '대규모 GPU 가속 모델 학습 (분산 학습)',
            '자동 확장 추론 엔드포인트를 통한 모델 서빙',
            'AI/ML 파이프라인 오케스트레이션 및 실험 추적',
          ],
          supportedProtocols: [
            'REST API', 'gRPC', 'S3-compatible', 'OAuth 2.0',
            'KServe (KFServing)', 'MLflow',
          ],
          haFeatures: [
            'Distributed training with multiple GPU nodes',
            'Model serving with horizontal pod autoscaling',
            'Pipeline retry and checkpoint resumption',
          ],
          securityCapabilities: [
            'RBAC for notebook and model access',
            'Network-isolated data science projects',
            'Model registry with access controls',
            'Secure model serving with TLS',
          ],
          children: [
            {
              nodeId: 'redhat-openshift-ai-edition',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'OpenShift AI',
              nameKo: 'OpenShift AI',
              description:
                'MLOps platform with JupyterHub, model serving (KServe), data science pipelines, and GPU scheduling on OpenShift',
              descriptionKo:
                'OpenShift에서 JupyterHub, 모델 서빙(KServe), 데이터 사이언스 파이프라인, GPU 스케줄링을 제공하는 MLOps 플랫폼',
              sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'container',
              specs: {
                'Notebook Environment': 'JupyterHub with pre-built data science images (PyTorch, TensorFlow)',
                'Model Serving': 'KServe (single/multi-model), ModelMesh for high-density serving',
                'Pipelines': 'Data Science Pipelines (Kubeflow-based) with Elyra integration',
                'GPU Scheduling': 'NVIDIA GPU Operator, time-slicing, MIG support',
                'Distributed Training': 'KubeRay, PyTorchJob, DeepSpeed integration',
                'Model Registry': 'MLflow-compatible model versioning and lineage tracking',
                'Monitoring': 'Model performance monitoring with drift detection',
                'Supported GPUs': 'NVIDIA A100, H100, L40S, T4; AMD Instinct MI series',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 3. Automation
    // =====================================================================
    {
      nodeId: 'redhat-automation',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Automation',
      nameKo: '자동화',
      description:
        'Enterprise IT automation platform for configuration management, orchestration, and system lifecycle management',
      descriptionKo:
        '구성 관리, 오케스트레이션, 시스템 라이프사이클 관리를 위한 엔터프라이즈 IT 자동화 플랫폼',
      sourceUrl: 'https://www.redhat.com/en/technologies/management/ansible',
      infraNodeTypes: ['app-server'],
      children: [
        // -- Ansible Automation Platform --
        {
          nodeId: 'redhat-ansible-automation-platform',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Ansible Automation Platform',
          nameKo: 'Ansible 자동화 플랫폼',
          description:
            'Enterprise-scale IT automation with event-driven automation, centralized execution environments, and AI-assisted playbook generation',
          descriptionKo:
            '이벤트 기반 자동화, 중앙 집중식 실행 환경, AI 지원 플레이북 생성을 갖춘 엔터프라이즈 규모 IT 자동화',
          sourceUrl: 'https://www.redhat.com/en/technologies/management/ansible',
          infraNodeTypes: ['app-server'],
          architectureRole: 'IT Automation & Orchestration',
          architectureRoleKo: 'IT 자동화 및 오케스트레이션',
          recommendedFor: [
            'Multi-tier application deployment automation',
            'Network device configuration management (Cisco, Arista, Juniper)',
            'Cloud infrastructure provisioning (AWS, Azure, GCP, OpenStack)',
            'Security compliance remediation and patch management',
            'Event-driven runbook automation (EDA) for incident response',
          ],
          recommendedForKo: [
            '멀티 티어 애플리케이션 배포 자동화',
            '네트워크 장비 구성 관리 (Cisco, Arista, Juniper)',
            '클라우드 인프라 프로비저닝 (AWS, Azure, GCP, OpenStack)',
            '보안 규정 준수 자동 수정 및 패치 관리',
            '사고 대응을 위한 이벤트 기반 런북 자동화 (EDA)',
          ],
          supportedProtocols: [
            'SSH', 'WinRM', 'REST API', 'NETCONF', 'SNMP',
            'HTTP/HTTPS', 'LDAP', 'SAML', 'OAuth 2.0',
          ],
          haFeatures: [
            'Automation controller clustering (active-active)',
            'Execution environment isolation with containers',
            'Hop node mesh for distributed automation networks',
            'Database replication for automation controller HA',
          ],
          securityCapabilities: [
            'Credential vaulting with HashiCorp Vault integration',
            'RBAC with team-based access controls',
            'Automation content signing and verification',
            'LDAP/SAML/OIDC authentication',
            'Audit logging of all automation executions',
          ],
          children: [
            {
              nodeId: 'redhat-ansible-platform',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Ansible Automation Platform',
              nameKo: 'Ansible 자동화 플랫폼',
              description:
                'Enterprise IT automation with automation controller, Event-Driven Ansible, private automation hub, and execution environments',
              descriptionKo:
                '자동화 컨트롤러, 이벤트 기반 Ansible, 프라이빗 자동화 허브, 실행 환경을 갖춘 엔터프라이즈 IT 자동화',
              sourceUrl: 'https://www.redhat.com/en/technologies/management/ansible',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'Core Components': 'Automation Controller, Event-Driven Ansible, Private Automation Hub',
                'Execution Model': 'Containerized execution environments (EE) with Podman',
                'Automation Mesh': 'Distributed hop/execution nodes for multi-site automation',
                'Event-Driven': 'EDA Controller with rulebook-based event processing',
                'Content': 'Certified Content Collections from 100+ partners via Automation Hub',
                'Platforms Managed': 'Linux, Windows, Network (IOS, EOS, JunOS, NX-OS), Cloud (AWS, Azure, GCP)',
                'API': 'Full REST API for integration with ServiceNow, Jira, PagerDuty',
                'Scaling': 'Clustered automation controller with horizontal execution node scaling',
              },
              children: [],
            },
            {
              nodeId: 'redhat-ansible-lightspeed',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Ansible Lightspeed with IBM watsonx Code Assistant',
              nameKo: 'Ansible Lightspeed (IBM watsonx 코드 어시스턴트)',
              description:
                'AI-powered automation content generation that translates natural language prompts into Ansible playbooks and roles using IBM watsonx',
              descriptionKo:
                'IBM watsonx를 활용하여 자연어 프롬프트를 Ansible 플레이북 및 역할로 변환하는 AI 기반 자동화 콘텐츠 생성',
              sourceUrl: 'https://www.redhat.com/en/technologies/management/ansible/ansible-lightspeed',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'cloud',
              specs: {
                'AI Model': 'IBM watsonx Code Assistant for Red Hat Ansible',
                'Input': 'Natural language task descriptions',
                'Output': 'YAML Ansible playbooks, roles, and task recommendations',
                'IDE Integration': 'VS Code extension with inline suggestions',
                'Content Matching': 'Source attribution and license transparency for generated content',
                'Training Data': 'Trained on Ansible Galaxy, certified collections, and Red Hat documentation',
                'Post-Processing': 'Ansible Lint validation on generated content',
                'Deployment': 'SaaS (cloud-hosted) or on-premises with IBM watsonx',
              },
              children: [],
            },
          ],
        },

        // -- Red Hat Satellite --
        {
          nodeId: 'redhat-satellite',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Red Hat Satellite',
          nameKo: 'Red Hat Satellite',
          description:
            'System lifecycle management platform for provisioning, patching, content management, and compliance auditing of RHEL and Linux infrastructure at scale',
          descriptionKo:
            'RHEL 및 리눅스 인프라의 대규모 프로비저닝, 패치 적용, 콘텐츠 관리, 규정 준수 감사를 위한 시스템 라이프사이클 관리 플랫폼',
          sourceUrl: 'https://www.redhat.com/en/technologies/management/satellite',
          infraNodeTypes: ['app-server'],
          architectureRole: 'System Lifecycle Management',
          architectureRoleKo: '시스템 라이프사이클 관리',
          recommendedFor: [
            'Large-scale RHEL fleet management (1,000+ hosts)',
            'Air-gapped and disconnected environment content delivery',
            'Security compliance auditing with OpenSCAP policies',
            'Automated provisioning and bare-metal deployment',
            'Patch management with content views and lifecycle environments',
          ],
          recommendedForKo: [
            '대규모 RHEL 플릿 관리 (1,000대 이상 호스트)',
            '에어갭 및 단절된 환경의 콘텐츠 배포',
            'OpenSCAP 정책을 활용한 보안 규정 준수 감사',
            '자동화된 프로비저닝 및 베어메탈 배포',
            '콘텐츠 뷰 및 라이프사이클 환경을 통한 패치 관리',
          ],
          supportedProtocols: [
            'HTTP/HTTPS', 'SSH', 'DHCP', 'TFTP', 'PXE',
            'DNS', 'LDAP', 'Kerberos', 'SCAP',
          ],
          haFeatures: [
            'Capsule servers for geographically distributed content delivery',
            'Smart proxy architecture for load distribution',
            'PostgreSQL database replication',
          ],
          securityCapabilities: [
            'OpenSCAP compliance policy enforcement',
            'Errata-based vulnerability management',
            'Content view versioning for controlled rollouts',
            'RBAC with organizational context',
            'GPG-signed content verification',
          ],
          children: [
            {
              nodeId: 'redhat-satellite-edition',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat Satellite',
              nameKo: 'Red Hat Satellite',
              description:
                'Centralized system management for provisioning, patching, content management, and compliance of RHEL hosts across distributed environments',
              descriptionKo:
                '분산 환경 전반에서 RHEL 호스트의 프로비저닝, 패치 적용, 콘텐츠 관리, 규정 준수를 위한 중앙 집중식 시스템 관리',
              sourceUrl: 'https://www.redhat.com/en/technologies/management/satellite',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'Architecture': 'Satellite Server + Capsule Servers (hub-spoke model)',
                'Content Management': 'Content views, lifecycle environments, composite content views',
                'Provisioning': 'PXE, DHCP, DNS, TFTP, kickstart, cloud-init for bare-metal and cloud',
                'Patch Management': 'Errata-based, with content view promotion workflows',
                'Compliance': 'OpenSCAP integration with NIST, PCI-DSS, DISA STIG profiles',
                'Scale': 'Up to 100,000 managed hosts per Satellite Server',
                'Ansible Integration': 'Ansible playbook execution, role import from Automation Hub',
                'Remote Execution': 'SSH-based remote command execution via REX',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 4. Storage
    // =====================================================================
    {
      nodeId: 'redhat-storage',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Storage',
      nameKo: '스토리지',
      description:
        'Software-defined storage solutions for Kubernetes persistent storage and standalone object/block/file storage',
      descriptionKo:
        '쿠버네티스 영구 스토리지 및 독립형 객체/블록/파일 스토리지를 위한 소프트웨어 정의 스토리지 솔루션',
      sourceUrl: 'https://www.redhat.com/en/technologies/storage',
      infraNodeTypes: ['storage', 'object-storage'],
      children: [
        // -- OpenShift Data Foundation --
        {
          nodeId: 'redhat-openshift-data-foundation',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'OpenShift Data Foundation',
          nameKo: 'OpenShift 데이터 파운데이션',
          description:
            'Ceph-based software-defined persistent storage for OpenShift with block, file, and object storage delivered as Kubernetes-native services',
          descriptionKo:
            '블록, 파일, 객체 스토리지를 쿠버네티스 네이티브 서비스로 제공하는 Ceph 기반 소프트웨어 정의 영구 스토리지',
          sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift-data-foundation',
          infraNodeTypes: ['storage', 'san-nas'],
          architectureRole: 'Kubernetes Persistent Storage',
          architectureRoleKo: '쿠버네티스 영구 스토리지',
          recommendedFor: [
            'OpenShift persistent volume provisioning (RWO, RWX, RWO-P)',
            'Database workloads on Kubernetes (PostgreSQL, MySQL, MongoDB)',
            'S3-compatible object storage for cloud-native applications',
            'Multi-cloud data replication across OpenShift clusters',
            'Disaster recovery with async mirroring and regional failover',
          ],
          recommendedForKo: [
            'OpenShift 영구 볼륨 프로비저닝 (RWO, RWX, RWO-P)',
            '쿠버네티스의 데이터베이스 워크로드 (PostgreSQL, MySQL, MongoDB)',
            '클라우드 네이티브 애플리케이션을 위한 S3 호환 객체 스토리지',
            'OpenShift 클러스터 간 멀티클라우드 데이터 복제',
            '비동기 미러링 및 리전 장애 조치를 통한 재해 복구',
          ],
          supportedProtocols: [
            'S3', 'iSCSI', 'NFS', 'CephFS', 'RBD (RADOS Block Device)',
            'CSI (Container Storage Interface)',
          ],
          haFeatures: [
            'Triple replication by default',
            'Erasure coding for space-efficient protection',
            'Automated self-healing on disk/node failure',
            'Metro-DR and Regional-DR with Ramen operator',
          ],
          securityCapabilities: [
            'Encryption at rest (LUKS) and in transit (TLS)',
            'Multi-tenancy with namespace-scoped storage classes',
            'RBAC for storage administration',
            'Immutable object locking for compliance',
          ],
          children: [
            {
              nodeId: 'redhat-odf-edition',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'OpenShift Data Foundation',
              nameKo: 'OpenShift 데이터 파운데이션',
              description:
                'Ceph-based persistent storage operator for OpenShift providing block (RBD), file (CephFS), and object (S3) storage via CSI',
              descriptionKo:
                'CSI를 통해 블록(RBD), 파일(CephFS), 객체(S3) 스토리지를 제공하는 OpenShift용 Ceph 기반 영구 스토리지 오퍼레이터',
              sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift-data-foundation',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'container',
              specs: {
                'Storage Backend': 'Ceph (Rook-Ceph Operator)',
                'Access Modes': 'ReadWriteOnce (RBD), ReadWriteMany (CephFS), S3 Object (NooBaa/MCG)',
                'Min Nodes': '3 storage nodes (recommended)',
                'Max Capacity': 'Petabyte-scale (tested to multi-PB)',
                'Replication': 'Triple replication or erasure coding (configurable)',
                'CSI Driver': 'Ceph CSI with snapshot, clone, and volume expansion',
                'Disaster Recovery': 'Metro-DR (sync) and Regional-DR (async) with Ramen operator',
                'Platforms': 'Bare metal, AWS, Azure, GCP, VMware (internal or external mode)',
              },
              children: [],
            },
          ],
        },

        // -- Red Hat Ceph Storage --
        {
          nodeId: 'redhat-ceph-storage',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Red Hat Ceph Storage',
          nameKo: 'Red Hat Ceph 스토리지',
          description:
            'Standalone software-defined storage cluster providing scalable object, block, and file storage for enterprise and service provider environments',
          descriptionKo:
            '엔터프라이즈 및 서비스 제공자 환경을 위한 확장 가능한 객체, 블록, 파일 스토리지를 제공하는 독립형 소프트웨어 정의 스토리지 클러스터',
          sourceUrl: 'https://www.redhat.com/en/technologies/storage/ceph',
          infraNodeTypes: ['object-storage', 'storage'],
          architectureRole: 'Software-Defined Storage Cluster',
          architectureRoleKo: '소프트웨어 정의 스토리지 클러스터',
          recommendedFor: [
            'Large-scale object storage for media, archival, and analytics',
            'OpenStack Cinder/Glance/Manila backend storage',
            'S3-compatible object gateway for cloud-native workloads',
            'High-throughput block storage for databases and VMs',
            'Multi-site geo-replication for disaster recovery',
          ],
          recommendedForKo: [
            '미디어, 아카이브, 분석을 위한 대규모 객체 스토리지',
            'OpenStack Cinder/Glance/Manila 백엔드 스토리지',
            '클라우드 네이티브 워크로드를 위한 S3 호환 객체 게이트웨이',
            '데이터베이스 및 VM을 위한 고처리량 블록 스토리지',
            '재해 복구를 위한 멀티사이트 지오 복제',
          ],
          supportedProtocols: [
            'S3', 'Swift', 'iSCSI', 'NFS (via NFS-Ganesha)',
            'CephFS', 'RBD', 'librados',
          ],
          haFeatures: [
            'CRUSH algorithm for automatic data distribution',
            'Self-healing on OSD/node failure',
            'Multi-site active-active and active-passive replication',
            'Erasure coding for fault-tolerant space efficiency',
          ],
          securityCapabilities: [
            'Encryption at rest (dm-crypt/LUKS per OSD)',
            'Encryption in transit (msgr2 protocol with TLS)',
            'S3 bucket policies and IAM-compatible access control',
            'Audit logging via ceph-log',
          ],
          children: [
            {
              nodeId: 'redhat-ceph-storage-edition',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat Ceph Storage',
              nameKo: 'Red Hat Ceph 스토리지',
              description:
                'Enterprise Ceph distribution with cephadm orchestrator, dashboard, S3 RADOS Gateway, and long-term support lifecycle',
              descriptionKo:
                'cephadm 오케스트레이터, 대시보드, S3 RADOS 게이트웨이, 장기 지원 라이프사이클을 갖춘 엔터프라이즈 Ceph 배포판',
              sourceUrl: 'https://www.redhat.com/en/technologies/storage/ceph',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'virtual',
              specs: {
                'Orchestrator': 'cephadm (container-based deployment and lifecycle management)',
                'Object Gateway': 'RADOS Gateway (RGW) with S3 and Swift API compatibility',
                'Block Storage': 'RBD (RADOS Block Device) with thin provisioning and snapshots',
                'File Storage': 'CephFS with MDS (Metadata Server) for POSIX-compliant file access',
                'Min Nodes': '3 OSD nodes + 3 MON/MGR (co-located in small clusters)',
                'Max Scale': 'Exabyte-scale storage (thousands of OSDs)',
                'Dashboard': 'Ceph Dashboard with Grafana/Prometheus monitoring integration',
                'Multi-Site': 'Active-active or active-passive geo-replication for RGW',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // =====================================================================
    // 5. Cloud Services
    // =====================================================================
    {
      nodeId: 'redhat-cloud-services',
      depth: 0,
      depthLabel: 'Category',
      depthLabelKo: '카테고리',
      name: 'Cloud Services',
      nameKo: '클라우드 서비스',
      description:
        'Managed cloud services for Kubernetes cluster management, developer portals, and hosted OpenShift on major cloud providers',
      descriptionKo:
        '쿠버네티스 클러스터 관리, 개발자 포털, 주요 클라우드 제공자의 호스팅 OpenShift를 위한 관리형 클라우드 서비스',
      sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift',
      infraNodeTypes: ['kubernetes'],
      children: [
        // -- Red Hat Cloud Services --
        {
          nodeId: 'redhat-cloud-services-line',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Red Hat Cloud Services',
          nameKo: 'Red Hat 클라우드 서비스',
          description:
            'Managed OpenShift and developer services deployed on major cloud providers including IBM Cloud, AWS, and Azure',
          descriptionKo:
            'IBM Cloud, AWS, Azure 등 주요 클라우드 제공자에 배포되는 관리형 OpenShift 및 개발자 서비스',
          sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift',
          infraNodeTypes: ['kubernetes'],
          architectureRole: 'Managed Kubernetes / Developer Platform',
          architectureRoleKo: '관리형 쿠버네티스 / 개발자 플랫폼',
          recommendedFor: [
            'IBM Cloud Kubernetes workloads with OpenShift',
            'Internal developer portal for platform engineering teams',
            'Centralized service catalog and software templates (Backstage)',
            'Multi-cloud Kubernetes with consistent OpenShift experience',
          ],
          recommendedForKo: [
            'OpenShift 기반 IBM Cloud 쿠버네티스 워크로드',
            '플랫폼 엔지니어링 팀을 위한 내부 개발자 포털',
            '중앙 서비스 카탈로그 및 소프트웨어 템플릿 (Backstage)',
            '일관된 OpenShift 경험을 제공하는 멀티클라우드 쿠버네티스',
          ],
          supportedProtocols: [
            'HTTP/HTTPS', 'gRPC', 'OAuth 2.0', 'OIDC',
            'REST API', 'TLS 1.3',
          ],
          haFeatures: [
            'IBM Cloud multi-zone region deployment',
            'Managed control plane with automated upgrades',
            'Integrated IBM Cloud monitoring and logging',
          ],
          securityCapabilities: [
            'IBM Cloud IAM integration',
            'VPC-based network isolation',
            'Encryption at rest and in transit',
            'SOC 2, ISO 27001, HIPAA compliance',
          ],
          children: [
            {
              nodeId: 'redhat-openshift-ibm-cloud',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat OpenShift on IBM Cloud',
              nameKo: 'IBM Cloud 기반 Red Hat OpenShift',
              description:
                'IBM-managed OpenShift service on IBM Cloud with integrated IBM Cloud Pak ecosystem, VPC networking, and IBM Security services',
              descriptionKo:
                'IBM Cloud Pak 에코시스템, VPC 네트워킹, IBM 보안 서비스가 통합된 IBM Cloud의 IBM 관리형 OpenShift 서비스',
              sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/openshift/ibm',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'cloud',
              specs: {
                'Cloud Provider': 'IBM Cloud (native integration)',
                'Management': 'IBM-managed control plane with automated patching',
                'SLA': '99.99% for multi-zone deployments',
                'IBM Integration': 'IBM Cloud Paks (Data, Integration, Automation, Security)',
                'Networking': 'IBM Cloud VPC, private/public ALB, VPN, Direct Link',
                'Storage': 'IBM Cloud Block/File/Object, Portworx, ODF',
                'Compliance': 'SOC 2, ISO 27001, PCI DSS, HIPAA, FS Cloud, C5',
                'Billing': 'Pay-as-you-go or reserved via IBM Cloud billing',
              },
              children: [],
            },
            {
              nodeId: 'redhat-developer-hub',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat Developer Hub',
              nameKo: 'Red Hat 개발자 허브',
              description:
                'Enterprise-supported internal developer portal based on Backstage.io for service catalog, software templates, and developer self-service',
              descriptionKo:
                '서비스 카탈로그, 소프트웨어 템플릿, 개발자 셀프서비스를 위한 Backstage.io 기반 엔터프라이즈 지원 내부 개발자 포털',
              sourceUrl: 'https://www.redhat.com/en/technologies/cloud-computing/developer-hub',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'container',
              specs: {
                'Base Framework': 'Backstage.io (CNCF project)',
                'Service Catalog': 'Centralized registry of APIs, services, and documentation',
                'Software Templates': 'Golden Path templates for consistent project scaffolding',
                'Plugins': 'Kubernetes, ArgoCD, Tekton, GitHub, GitLab, Jira, PagerDuty',
                'Authentication': 'OIDC, SAML, GitHub/GitLab OAuth',
                'Deployment': 'OpenShift Operator or Helm chart',
                'TechDocs': 'Built-in technical documentation rendering (docs-as-code)',
                'RBAC': 'Role-based access to catalog entities and templates',
              },
              children: [],
            },
          ],
        },

        // -- Advanced Cluster Management --
        {
          nodeId: 'redhat-acm',
          depth: 1,
          depthLabel: 'Product Line',
          depthLabelKo: '제품 라인',
          name: 'Advanced Cluster Management',
          nameKo: 'Advanced Cluster Management',
          description:
            'Multi-cluster Kubernetes lifecycle management with centralized governance, observability, and application deployment across hybrid cloud',
          descriptionKo:
            '하이브리드 클라우드 전반의 중앙 거버넌스, 옵저버빌리티, 애플리케이션 배포를 갖춘 멀티클러스터 쿠버네티스 라이프사이클 관리',
          sourceUrl: 'https://www.redhat.com/en/technologies/management/advanced-cluster-management',
          infraNodeTypes: ['kubernetes'],
          architectureRole: 'Multi-Cluster Kubernetes Management',
          architectureRoleKo: '멀티클러스터 쿠버네티스 관리',
          recommendedFor: [
            'Multi-cluster Kubernetes governance across hybrid cloud',
            'Centralized policy enforcement (security, configuration, network)',
            'Fleet-wide application deployment with placement strategies',
            'Cluster lifecycle management (create, upgrade, destroy)',
            'Multi-cluster observability and compliance auditing',
          ],
          recommendedForKo: [
            '하이브리드 클라우드 전반의 멀티클러스터 쿠버네티스 거버넌스',
            '중앙 정책 시행 (보안, 구성, 네트워크)',
            '배치 전략을 통한 플릿 전체 애플리케이션 배포',
            '클러스터 라이프사이클 관리 (생성, 업그레이드, 삭제)',
            '멀티클러스터 옵저버빌리티 및 규정 준수 감사',
          ],
          supportedProtocols: [
            'Kubernetes API', 'REST API', 'gRPC',
            'OAuth 2.0', 'OIDC', 'Webhook',
          ],
          haFeatures: [
            'Hub-of-hubs architecture for large-scale management',
            'Managed cluster auto-import and discovery',
            'Observability with Thanos-based multi-cluster metrics',
            'Submarine addon for cross-cluster service connectivity',
          ],
          securityCapabilities: [
            'Policy-based governance (CIS benchmarks, NIST, custom)',
            'Certificate management across clusters',
            'Cluster-scoped RBAC with managed cluster sets',
            'Compliance history and audit reporting',
          ],
          children: [
            {
              nodeId: 'redhat-acm-edition',
              depth: 2,
              depthLabel: 'Edition',
              depthLabelKo: '에디션',
              name: 'Red Hat Advanced Cluster Management for Kubernetes',
              nameKo: 'Red Hat ACM for Kubernetes',
              description:
                'Hub-spoke multi-cluster management platform with policy engine, application lifecycle, and observability for OpenShift and non-OpenShift clusters',
              descriptionKo:
                'OpenShift 및 비-OpenShift 클러스터를 위한 정책 엔진, 애플리케이션 라이프사이클, 옵저버빌리티를 갖춘 허브-스포크 멀티클러스터 관리 플랫폼',
              sourceUrl: 'https://www.redhat.com/en/technologies/management/advanced-cluster-management',
              lifecycle: 'active',
              licensingModel: 'subscription',
              formFactor: 'container',
              specs: {
                'Architecture': 'Hub cluster + managed clusters (spoke) via Klusterlet agent',
                'Cluster Providers': 'OpenShift, EKS, AKS, GKE, bare-metal K8s, RKE, K3s',
                'Policy Engine': 'Configuration, certificate, IAM, network, and custom policies',
                'Application Deployment': 'Subscription-based (Git/Helm/ObjectBucket) with PlacementRules',
                'Observability': 'Multi-cluster metrics (Thanos), alerting, and dashboards',
                'Cluster Lifecycle': 'Create, import, upgrade, hibernate, and destroy clusters',
                'Scale': 'Tested with 2,000+ managed clusters per hub',
                'Submariner': 'Cross-cluster pod-to-pod and service-to-service connectivity',
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};
