# InfraFlow 인프라 장비/솔루션 현황

> **문서 버전**: 1.0.0
> **최종 수정일**: 2026-02-06
> **관리 담당**: Infrastructure Data Agent

---

## 목차

1. [개요](#1-개요)
2. [장비 카테고리](#2-장비-카테고리)
3. [보안 장비 (Security)](#3-보안-장비-security)
4. [네트워크 장비 (Network)](#4-네트워크-장비-network)
5. [컴퓨팅/서버 (Compute)](#5-컴퓨팅서버-compute)
6. [클라우드 서비스 (Cloud)](#6-클라우드-서비스-cloud)
7. [스토리지 (Storage)](#7-스토리지-storage)
8. [인증/접근 관리 (Auth)](#8-인증접근-관리-auth)
9. [외부 요소 (External)](#9-외부-요소-external)
10. [티어 구조](#10-티어-구조)
11. [데이터 관리 가이드](#11-데이터-관리-가이드)
12. [변경 이력](#12-변경-이력)

---

## 1. 개요

### 1.1 목적

이 문서는 InfraFlow 플랫폼에서 지원하는 모든 인프라 장비 및 솔루션의 현황을 정의합니다. 각 장비의 기능, 특징, 권장 정책, 벤더 정보를 포함합니다.

### 1.2 관련 파일

| 파일 | 용도 |
|------|------|
| `src/types/infra.ts` | 타입 정의 (InfraNodeType 등) |
| `src/lib/data/infrastructureDB.ts` | 장비 상세 정보 데이터베이스 |
| `src/lib/parser/patterns.ts` | 자연어 파싱 패턴 |

### 1.3 현황 요약

| 카테고리 | 장비 수 | 비고 |
|----------|---------|------|
| Security | 6개 | 방화벽, WAF, IDS/IPS 등 |
| Network | 7개 | 라우터, 스위치, LB 등 |
| Compute | 6개 | 서버, 컨테이너, K8s 등 |
| Cloud | 4개 | AWS, Azure, GCP, Private |
| Storage | 5개 | SAN/NAS, 오브젝트, 캐시 등 |
| Auth | 4개 | LDAP/AD, SSO, MFA, IAM |
| External | 2개 | 사용자, 인터넷 |
| **총합** | **34개** | Zone 타입 포함 시 35개 |

---

## 2. 장비 카테고리

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        장비 카테고리 구조                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🔒 Security (6)        🌐 Network (7)          🖥️ Compute (6)          │
│  ─────────────          ─────────────           ─────────────           │
│  • firewall             • router                • web-server            │
│  • waf                  • switch-l2             • app-server            │
│  • ids-ips              • switch-l3             • db-server             │
│  • vpn-gateway          • load-balancer         • container             │
│  • nac                  • sd-wan                • vm                    │
│  • dlp                  • dns                   • kubernetes            │
│                         • cdn                                           │
│                                                                         │
│  ☁️ Cloud (4)           📦 Storage (5)          🔐 Auth (4)             │
│  ─────────────          ─────────────           ─────────────           │
│  • aws-vpc              • storage               • ldap-ad               │
│  • azure-vnet           • san-nas               • sso                   │
│  • gcp-network          • object-storage        • mfa                   │
│  • private-cloud        • cache                 • iam                   │
│                         • backup                                        │
│                                                                         │
│  👤 External (2)                                                        │
│  ─────────────                                                          │
│  • user                                                                 │
│  • internet                                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 보안 장비 (Security)

### 3.1 Firewall (방화벽)

| 항목 | 내용 |
|------|------|
| **ID** | `firewall` |
| **영문명** | Firewall |
| **한국어명** | 방화벽 |
| **카테고리** | Security |
| **티어** | DMZ |
| **포트** | All |
| **프로토콜** | TCP, UDP, ICMP |

#### 주요 기능
- IP, 포트, 프로토콜 기반 패킷 필터링
- 연결 상태 기반 검사 (Stateful Inspection)
- NAT (네트워크 주소 변환)
- VPN 종단점 역할
- 애플리케이션 레이어 필터링

#### 특징
- L3/L4 계층 보호
- 영역 기반 보안
- 고가용성 클러스터링
- 로깅 및 리포팅

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 기본 차단 정책 | Critical | Access | 모든 트래픽 기본 차단, 화이트리스트만 허용 |
| 로깅 활성화 | High | Monitoring | 모든 트래픽에 대한 포괄적 로깅 활성화 |
| 정기 규칙 검토 | Medium | Compliance | 분기별 방화벽 규칙 검토 및 감사 |
| 지역 차단 | Medium | Security | 고위험 국가에서의 트래픽 차단 |

#### 대표 벤더
- Palo Alto Networks
- Fortinet FortiGate
- Cisco ASA
- Check Point
- Juniper SRX

---

### 3.2 WAF (웹 애플리케이션 방화벽)

| 항목 | 내용 |
|------|------|
| **ID** | `waf` |
| **영문명** | Web Application Firewall |
| **한국어명** | 웹 애플리케이션 방화벽 |
| **카테고리** | Security |
| **티어** | DMZ |
| **포트** | 80, 443 |
| **프로토콜** | HTTP, HTTPS, WebSocket |

#### 주요 기능
- SQL 인젝션 방지
- XSS (크로스사이트 스크립팅) 차단
- CSRF 보호
- 봇 탐지 및 완화
- 요청 제한 (Rate Limiting)
- OWASP Top 10 취약점 보호

#### 특징
- L7 (애플리케이션) 계층 보호
- SSL/TLS 종료
- 커스텀 룰 생성
- 가상 패칭

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| OWASP 핵심 규칙셋 | Critical | Security | OWASP CRS 적용 |
| 봇 차단 | High | Security | 봇 탐지 및 CAPTCHA 활성화 |
| 요청 제한 | High | Performance | IP/세션당 요청 제한 |
| 민감정보 마스킹 | Medium | Compliance | 로그에서 민감정보 마스킹 |

#### 대표 벤더
- AWS WAF
- Cloudflare WAF
- Imperva
- F5 Advanced WAF
- Akamai Kona

---

### 3.3 IDS/IPS (침입 탐지/방지 시스템)

| 항목 | 내용 |
|------|------|
| **ID** | `ids-ips` |
| **영문명** | Intrusion Detection/Prevention System |
| **한국어명** | 침입 탐지/방지 시스템 |
| **카테고리** | Security |
| **티어** | DMZ |
| **포트** | All |
| **프로토콜** | All |

#### 주요 기능
- 시그니처 기반 탐지
- 이상 행위 기반 탐지
- 프로토콜 분석
- 트래픽 상관관계 분석
- 위협 자동 차단

#### 특징
- 실시간 위협 탐지
- 제로데이 공격 방지
- 네트워크 포렌식
- SIEM 연동

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 시그니처 업데이트 | Critical | Security | 일일 시그니처 DB 업데이트 |
| 알림 임계값 설정 | High | Monitoring | 적절한 알림 임계값 구성 |
| 오탐 튜닝 | Medium | Monitoring | 정기적 오탐 검토 및 튜닝 |

#### 대표 벤더
- Snort
- Suricata
- Cisco Firepower
- Palo Alto Networks
- McAfee NSP

---

### 3.4 VPN Gateway (VPN 게이트웨이)

| 항목 | 내용 |
|------|------|
| **ID** | `vpn-gateway` |
| **영문명** | VPN Gateway |
| **한국어명** | VPN 게이트웨이 |
| **카테고리** | Security |
| **티어** | DMZ |
| **포트** | 443, 500, 4500 |
| **프로토콜** | IPSec, SSL/TLS, IKEv2, OpenVPN |

#### 주요 기능
- IPSec VPN 터널링
- 원격 접속용 SSL VPN
- Site-to-Site VPN
- 스플릿 터널링
- 다중 인증 (MFA)

#### 특징
- AES-256 암호화
- 인증서 기반 인증
- 상시 VPN 연결
- 피어 장애 감지

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 강력한 암호화 | Critical | Security | AES-256, SHA-256 최소 |
| MFA 필수 | Critical | Access | 다중 인증 필수 |
| 세션 타임아웃 | High | Security | 유휴 타임아웃 후 자동 연결 해제 |
| 스플릿 터널 정책 | Medium | Access | VPN 통과 트래픽 정의 |

#### 대표 벤더
- Cisco AnyConnect
- Palo Alto GlobalProtect
- OpenVPN
- WireGuard
- Fortinet SSL VPN

---

### 3.5 NAC (네트워크 접근 제어)

| 항목 | 내용 |
|------|------|
| **ID** | `nac` |
| **영문명** | Network Access Control |
| **한국어명** | 네트워크 접근제어 |
| **카테고리** | Security |
| **티어** | Internal |
| **포트** | 1812, 1813 |
| **프로토콜** | RADIUS, 802.1X, TACACS+ |

#### 주요 기능
- 장치 인증 (802.1X)
- 보안 상태 평가 (Posture Assessment)
- 게스트 네트워크 관리
- VLAN 할당
- 비준수 장치 격리

#### 특징
- 에이전트/에이전트리스 모드
- BYOD 지원
- IoT 장치 프로파일링
- IAM 연동

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 802.1X 적용 | Critical | Access | 모든 유선 연결에 802.1X 필수 |
| 보안상태 정책 | High | Compliance | AV, 패치, 암호화 상태 확인 |
| 게스트 격리 | High | Security | 게스트 네트워크 내부망 분리 |

#### 대표 벤더
- Cisco ISE
- Aruba ClearPass
- Forescout
- Portnox

---

### 3.6 DLP (정보유출방지)

| 항목 | 내용 |
|------|------|
| **ID** | `dlp` |
| **영문명** | Data Loss Prevention |
| **한국어명** | 정보유출방지 |
| **카테고리** | Security |
| **티어** | Internal |
| **프로토콜** | SMTP, HTTP/HTTPS, SMB |

#### 주요 기능
- 콘텐츠 검사
- 데이터 분류
- 이메일/웹 필터링
- USB/프린트 제어
- 클라우드 앱 모니터링

#### 특징
- 패턴 매칭 (정규식, 키워드)
- 머신러닝 분류
- 핑거프린팅
- 엔드포인트/네트워크 DLP

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 개인정보 탐지 | Critical | Compliance | PII 탐지 및 보호 (주민번호, 카드번호) |
| 분류 레이블 | High | Compliance | 문서에 데이터 분류 필수 |
| 외부 전송 차단 | High | Security | 개인 이메일/클라우드로 민감정보 전송 차단 |

#### 대표 벤더
- Microsoft Purview
- Symantec DLP
- Digital Guardian
- Forcepoint DLP

---

## 4. 네트워크 장비 (Network)

### 4.1 Router (라우터)

| 항목 | 내용 |
|------|------|
| **ID** | `router` |
| **영문명** | Router |
| **한국어명** | 라우터 |
| **카테고리** | Network |
| **티어** | Internal |
| **프로토콜** | OSPF, BGP, EIGRP, RIP |

#### 주요 기능
- 네트워크 간 패킷 라우팅
- 동적 라우팅 프로토콜 (OSPF, BGP)
- 정적 라우팅
- NAT/PAT
- ACL (접근 제어 리스트)

#### 특징
- L3 포워딩
- QoS (서비스 품질)
- MPLS 지원
- 고가용성 (HSRP/VRRP)

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 라우팅 프로토콜 보안 | Critical | Security | 라우팅 프로토콜 인증 활성화 |
| ACL 적용 | High | Access | 원치 않는 트래픽 필터링 |
| 미사용 서비스 비활성화 | High | Security | CDP, HTTP 서버 등 비활성화 |

#### 대표 벤더
- Cisco
- Juniper Networks
- Arista
- Huawei
- MikroTik

---

### 4.2 L2 Switch (L2 스위치)

| 항목 | 내용 |
|------|------|
| **ID** | `switch-l2` |
| **영문명** | Layer 2 Switch |
| **한국어명** | L2 스위치 |
| **카테고리** | Network |
| **티어** | Internal |
| **프로토콜** | Ethernet, 802.1Q, STP/RSTP |

#### 주요 기능
- MAC 주소 학습
- 프레임 포워딩
- VLAN 태깅 (802.1Q)
- 스패닝 트리 프로토콜
- 포트 미러링

#### 특징
- 회선 속도 포워딩
- PoE (이더넷 전원 공급)
- 링크 어그리게이션 (LACP)
- 스톰 제어

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 포트 보안 | High | Security | 포트당 MAC 주소 제한 |
| VLAN 분리 | High | Security | 기능/보안영역별 네트워크 분리 |
| BPDU Guard | Medium | Security | STP 공격 방어 |

#### 대표 벤더
- Cisco Catalyst
- HPE Aruba
- Juniper EX
- Dell
- Extreme Networks

---

### 4.3 L3 Switch (L3 스위치)

| 항목 | 내용 |
|------|------|
| **ID** | `switch-l3` |
| **영문명** | Layer 3 Switch |
| **한국어명** | L3 스위치 |
| **카테고리** | Network |
| **티어** | Internal |
| **프로토콜** | Ethernet, 802.1Q, OSPF, BGP |

#### 주요 기능
- VLAN 간 라우팅
- 하드웨어 기반 라우팅
- DHCP 릴레이
- IP 멀티캐스트 라우팅
- 정책 기반 라우팅

#### 특징
- ASIC 기반 포워딩
- 대규모 라우팅 테이블 지원
- 스태킹 기능
- 가상 스위칭

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| VLAN ACL | High | Access | VLAN 간 ACL 적용 |
| DHCP 스누핑 | High | Security | 불량 DHCP 서버 방지 |
| 동적 ARP 검사 | Medium | Security | ARP 스푸핑 방지 |

#### 대표 벤더
- Cisco Catalyst
- Arista
- Juniper EX Series
- HPE

---

### 4.4 Load Balancer (로드밸런서)

| 항목 | 내용 |
|------|------|
| **ID** | `load-balancer` |
| **영문명** | Load Balancer |
| **한국어명** | 로드밸런서 |
| **카테고리** | Network |
| **티어** | DMZ |
| **포트** | 80, 443 |
| **프로토콜** | HTTP, HTTPS, TCP, UDP |

#### 주요 기능
- 트래픽 분산 (라운드로빈, 최소 연결)
- 헬스 체크
- SSL/TLS 오프로딩
- 세션 유지 (Sticky Session)
- 콘텐츠 기반 라우팅

#### 특징
- L4/L7 로드밸런싱
- 글로벌 서버 로드밸런싱 (GSLB)
- DDoS 방어
- 압축

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 헬스체크 설정 | Critical | Monitoring | 적절한 헬스체크 간격 구성 |
| SSL 정책 | Critical | Security | TLS 1.2+ 및 강력한 암호화 사용 |
| 연결 제한 | High | Performance | 서버당 최대 연결 수 설정 |

#### 대표 벤더
- F5 BIG-IP
- Citrix ADC (NetScaler)
- HAProxy
- NGINX Plus
- AWS ALB/NLB

---

### 4.5 SD-WAN

| 항목 | 내용 |
|------|------|
| **ID** | `sd-wan` |
| **영문명** | Software-Defined WAN |
| **한국어명** | SD-WAN |
| **카테고리** | Network |
| **티어** | DMZ |
| **프로토콜** | IPSec, MPLS, Broadband |

#### 주요 기능
- 동적 경로 선택
- WAN 최적화
- 제로터치 프로비저닝
- 애플리케이션 인식 라우팅
- 다중 링크 통합

#### 특징
- 중앙 집중식 관리
- 종단간 암호화
- SaaS 가속
- 대역폭 통합

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 애플리케이션 우선순위 | High | Performance | 비즈니스 크리티컬 앱 우선순위 |
| 암호화 | Critical | Security | 모든 트래픽 IPSec 활성화 |
| 페일오버 정책 | High | Performance | 자동 페일오버 구성 |

#### 대표 벤더
- Cisco Viptela
- VMware VeloCloud
- Fortinet SD-WAN
- Palo Alto Prisma SD-WAN

---

### 4.6 DNS Server (DNS 서버)

| 항목 | 내용 |
|------|------|
| **ID** | `dns` |
| **영문명** | DNS Server |
| **한국어명** | DNS 서버 |
| **카테고리** | Network |
| **티어** | Internal |
| **포트** | 53 |
| **프로토콜** | DNS, DoH, DoT |

#### 주요 기능
- 이름 해석
- 영역 호스팅 (권한있는 DNS)
- 재귀 쿼리
- 캐싱
- DNS 로드밸런싱

#### 특징
- DNSSEC 지원
- 분할 DNS (Split-horizon)
- 지역 기반 라우팅
- 페일오버 지원

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| DNSSEC 적용 | High | Security | 영역 서명을 위한 DNSSEC 활성화 |
| 요청 제한 | High | Security | 증폭 공격 방지를 위한 쿼리 제한 |
| 영역 전송 제한 | Critical | Access | 보조 DNS로만 영역 전송 허용 |

#### 대표 벤더
- BIND
- Microsoft DNS
- Infoblox
- Cloudflare DNS
- AWS Route53

---

### 4.7 CDN

| 항목 | 내용 |
|------|------|
| **ID** | `cdn` |
| **영문명** | Content Delivery Network |
| **한국어명** | CDN |
| **카테고리** | Network |
| **티어** | External |
| **포트** | 80, 443 |
| **프로토콜** | HTTP/2, HTTP/3, QUIC |

#### 주요 기능
- 정적 콘텐츠 캐싱
- 동적 콘텐츠 가속
- 엣지 컴퓨팅
- DDoS 완화
- 엣지에서 SSL/TLS

#### 특징
- 글로벌 PoP 네트워크
- 실시간 분석
- 즉시 캐시 제거 (Purge)
- 오리진 보호

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 캐시 정책 | High | Performance | 적절한 캐시 TTL 정의 |
| 오리진 보호 | Critical | Security | CDN만 오리진 접근 허용 |
| HTTPS 전용 | Critical | Security | 모든 콘텐츠 HTTPS 강제 |

#### 대표 벤더
- Cloudflare
- Akamai
- AWS CloudFront
- Fastly
- Azure CDN

---

## 5. 컴퓨팅/서버 (Compute)

### 5.1 Web Server (웹 서버)

| 항목 | 내용 |
|------|------|
| **ID** | `web-server` |
| **영문명** | Web Server |
| **한국어명** | 웹 서버 |
| **카테고리** | Compute |
| **티어** | DMZ |
| **포트** | 80, 443 |
| **프로토콜** | HTTP/1.1, HTTP/2, HTTP/3 |

#### 주요 기능
- HTTP/HTTPS 요청 처리
- 정적 파일 서빙
- 리버스 프록시
- URL 재작성
- 압축 (gzip/brotli)

#### 특징
- 가상 호스팅
- SSL/TLS 종료
- 접근 로깅
- 캐싱

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| HTTPS 전용 | Critical | Security | HTTP를 HTTPS로 리다이렉트 |
| 보안 헤더 | High | Security | HSTS, CSP, X-Frame-Options 설정 |
| 접근 로깅 | High | Monitoring | 포괄적 접근 로깅 활성화 |
| 요청 제한 | Medium | Security | IP당 요청 제한 |

#### 대표 벤더
- NGINX
- Apache HTTP Server
- Microsoft IIS
- Caddy
- LiteSpeed

---

### 5.2 App Server (애플리케이션 서버)

| 항목 | 내용 |
|------|------|
| **ID** | `app-server` |
| **영문명** | Application Server |
| **한국어명** | 애플리케이션 서버 |
| **카테고리** | Compute |
| **티어** | Internal |
| **포트** | 8080, 8443 |
| **프로토콜** | HTTP, gRPC, WebSocket |

#### 주요 기능
- 애플리케이션 호스팅
- 비즈니스 로직 처리
- API 서빙
- 세션 관리
- 트랜잭션 처리

#### 특징
- 클러스터링 지원
- 연결 풀링
- JMX 모니터링
- 핫 디플로이

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 내부 전용 | Critical | Access | 웹 티어에서만 접근 가능 |
| 시큐어 코딩 | Critical | Security | OWASP 시큐어 코딩 가이드라인 준수 |
| 리소스 제한 | High | Performance | 메모리, CPU 제한 설정 |

#### 대표 벤더
- Apache Tomcat
- JBoss/WildFly
- Oracle WebLogic
- IBM WebSphere
- Node.js

---

### 5.3 Database Server (데이터베이스 서버)

| 항목 | 내용 |
|------|------|
| **ID** | `db-server` |
| **영문명** | Database Server |
| **한국어명** | 데이터베이스 서버 |
| **카테고리** | Compute |
| **티어** | Data |
| **포트** | 3306, 5432, 1433, 27017 |
| **프로토콜** | MySQL, PostgreSQL, MSSQL, MongoDB |

#### 주요 기능
- 데이터 저장 및 검색
- 쿼리 처리 (SQL/NoSQL)
- 트랜잭션 관리 (ACID)
- 복제
- 백업 및 복구

#### 특징
- 고가용성 클러스터링
- 읽기 복제본
- 특정 시점 복구 (PITR)
- 쿼리 최적화

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 저장 시 암호화 | Critical | Security | 데이터베이스 파일 및 백업 암호화 |
| 네트워크 격리 | Critical | Access | 앱 서버 연결만 허용 |
| 정기 백업 | Critical | Compliance | 일일 백업, 주간 전체 백업 |
| 감사 로깅 | High | Compliance | 모든 데이터 접근 및 변경 로깅 |

#### 대표 벤더
- MySQL
- PostgreSQL
- Oracle Database
- Microsoft SQL Server
- MongoDB

---

### 5.4 Container (컨테이너)

| 항목 | 내용 |
|------|------|
| **ID** | `container` |
| **영문명** | Container |
| **한국어명** | 컨테이너 |
| **카테고리** | Compute |
| **티어** | Internal |

#### 주요 기능
- 애플리케이션 격리
- 마이크로서비스 배포
- 일관된 환경
- 빠른 스케일링
- CI/CD 통합

#### 특징
- 이미지 기반 배포
- 리소스 제한 (cgroups)
- 네임스페이스 격리
- 레이어 캐싱

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 비root 사용자 | Critical | Security | 비root 사용자로 컨테이너 실행 |
| 이미지 스캔 | Critical | Security | 취약점 이미지 스캔 |
| 리소스 제한 | High | Performance | CPU, 메모리 제한 설정 |
| 읽기 전용 파일시스템 | High | Security | 읽기 전용 루트 파일시스템 사용 |

#### 대표 벤더
- Docker
- containerd
- CRI-O
- Podman

---

### 5.5 Virtual Machine (가상머신)

| 항목 | 내용 |
|------|------|
| **ID** | `vm` |
| **영문명** | Virtual Machine |
| **한국어명** | 가상머신 |
| **카테고리** | Compute |
| **티어** | Internal |

#### 주요 기능
- 완전한 OS 가상화
- 하드웨어 추상화
- 스냅샷 및 복제
- 라이브 마이그레이션
- 리소스 할당

#### 특징
- 하이퍼바이저 기반 격리
- 템플릿 기반 배포
- 동적 리소스 스케일링
- HA 클러스터링

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 강화된 템플릿 | High | Security | 강화된 OS 템플릿 사용 |
| 정기 패치 | Critical | Security | 월간 OS 및 소프트웨어 패치 |
| 백업 정책 | High | Compliance | 정기 VM 백업 및 스냅샷 |

#### 대표 벤더
- VMware vSphere
- Microsoft Hyper-V
- KVM
- Proxmox
- Nutanix AHV

---

### 5.6 Kubernetes (쿠버네티스)

| 항목 | 내용 |
|------|------|
| **ID** | `kubernetes` |
| **영문명** | Kubernetes |
| **한국어명** | 쿠버네티스 |
| **카테고리** | Compute |
| **티어** | Internal |
| **포트** | 6443, 10250 |

#### 주요 기능
- 컨테이너 오케스트레이션
- 자동 스케일링 (HPA/VPA)
- 자가 치유 (Self-healing)
- 서비스 디스커버리
- 롤링 업데이트

#### 특징
- 선언적 구성
- 인그레스 관리
- 시크릿 관리
- 리소스 쿼터

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| RBAC | Critical | Access | 역할 기반 접근 제어 활성화 |
| 네트워크 정책 | Critical | Security | 파드간 네트워크 정책 정의 |
| 파드 보안 표준 | Critical | Security | 파드 보안 정책 적용 |
| 리소스 쿼터 | High | Performance | 네임스페이스 리소스 제한 설정 |

#### 대표 벤더
- Kubernetes (CNCF)
- Red Hat OpenShift
- Rancher
- AWS EKS
- Azure AKS
- Google GKE

---

## 6. 클라우드 서비스 (Cloud)

### 6.1 AWS VPC

| 항목 | 내용 |
|------|------|
| **ID** | `aws-vpc` |
| **영문명** | Amazon Virtual Private Cloud |
| **한국어명** | AWS VPC |
| **카테고리** | Cloud |
| **티어** | Internal |

#### 주요 기능
- 네트워크 격리
- 서브넷 관리
- 라우트 테이블 구성
- 인터넷/NAT 게이트웨이
- VPC 피어링

#### 특징
- 보안 그룹 (Security Groups)
- 네트워크 ACL
- VPC 엔드포인트
- 트랜짓 게이트웨이

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 프라이빗 서브넷 | Critical | Security | 워크로드를 프라이빗 서브넷에 배치 |
| 보안 그룹 | Critical | Access | 최소 권한 보안 그룹 사용 |
| VPC 플로우 로그 | High | Monitoring | VPC 플로우 로그 활성화 |

---

### 6.2 Azure VNet

| 항목 | 내용 |
|------|------|
| **ID** | `azure-vnet` |
| **영문명** | Azure Virtual Network |
| **한국어명** | Azure VNet |
| **카테고리** | Cloud |
| **티어** | Internal |

#### 주요 기능
- 네트워크 격리
- 서브넷 분할
- 라우트 테이블
- VNet 피어링
- 서비스 엔드포인트

#### 특징
- 네트워크 보안 그룹 (NSG)
- 애플리케이션 보안 그룹 (ASG)
- Azure Firewall 연동
- ExpressRoute 지원

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| NSG 규칙 | Critical | Security | 서브넷별 NSG 규칙 구성 |
| 프라이빗 엔드포인트 | High | Security | PaaS에 프라이빗 엔드포인트 사용 |
| DDoS 보호 | High | Security | Azure DDoS Protection 활성화 |

---

### 6.3 GCP Network

| 항목 | 내용 |
|------|------|
| **ID** | `gcp-network` |
| **영문명** | Google Cloud Platform VPC |
| **한국어명** | GCP 네트워크 |
| **카테고리** | Cloud |
| **티어** | Internal |

#### 주요 기능
- 글로벌 VPC
- 서브넷 관리
- Cloud NAT
- Cloud Router
- 공유 VPC

#### 특징
- 방화벽 규칙
- 프라이빗 Google 접근
- VPC 서비스 제어
- Cloud Interconnect

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 방화벽 규칙 | Critical | Security | 대상 태그를 사용한 방화벽 규칙 |
| 프라이빗 접근 | High | Security | Private Google Access 활성화 |
| VPC 로깅 | High | Monitoring | VPC 플로우 로그 활성화 |

---

### 6.4 Private Cloud (프라이빗 클라우드)

| 항목 | 내용 |
|------|------|
| **ID** | `private-cloud` |
| **영문명** | Private Cloud |
| **한국어명** | 프라이빗 클라우드 |
| **카테고리** | Cloud |
| **티어** | Internal |

#### 주요 기능
- 셀프 서비스 프로비저닝
- 리소스 풀링
- 가상화
- 자동화된 관리
- 멀티 테넌시

#### 특징
- 완전한 데이터 주권
- 커스텀 보안 제어
- 하드웨어 커스터마이징
- 규제 준수

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 보안 강화 | Critical | Security | 모든 클라우드 구성요소 하드닝 |
| 접근 제어 | Critical | Access | 클라우드 관리용 RBAC 구현 |
| 정기 감사 | High | Compliance | 보안 감사 수행 |

#### 대표 벤더
- VMware vCloud
- OpenStack
- Microsoft Azure Stack
- Nutanix

---

## 7. 스토리지 (Storage)

### 7.1 Storage (스토리지)

| 항목 | 내용 |
|------|------|
| **ID** | `storage` |
| **영문명** | Storage |
| **한국어명** | 스토리지 |
| **카테고리** | Storage |
| **티어** | Data |
| **프로토콜** | iSCSI, FC, NFS, SMB, S3 |

#### 주요 기능
- 블록 스토리지 (SAN)
- 파일 스토리지 (NAS)
- 객체 스토리지
- 계층형 스토리지
- 데이터 중복제거

#### 특징
- RAID 보호
- 스냅샷
- 복제
- 씬 프로비저닝

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 암호화 | Critical | Security | 저장 시 암호화 활성화 |
| 접근 제어 | Critical | Access | 호스트/네트워크별 접근 제한 |
| 백업 정책 | Critical | Compliance | 정기 스냅샷 및 원격지 백업 |

#### 대표 벤더
- NetApp
- Dell EMC
- Pure Storage
- HPE
- Hitachi Vantara

---

### 7.2 SAN/NAS Storage

| 항목 | 내용 |
|------|------|
| **ID** | `san-nas` |
| **영문명** | SAN/NAS Storage |
| **한국어명** | SAN/NAS 스토리지 |
| **카테고리** | Storage |
| **티어** | Data |
| **프로토콜** | FC, iSCSI, NFS, SMB |

#### 주요 기능
- 고성능 I/O
- 멀티 프로토콜 지원
- 스토리지 가상화
- 서비스 품질 (QoS)
- 어레이 기반 복제

#### 특징
- 듀얼 컨트롤러 HA
- 올플래시/하이브리드 티어
- 인라인 압축
- 무중단 업그레이드

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 존닝 | Critical | Access | SAN 패브릭 존닝 구현 |
| LUN 마스킹 | Critical | Access | 호스트별 LUN 접근 제한 |
| 모니터링 | High | Monitoring | 용량 및 성능 모니터링 |

#### 대표 벤더
- NetApp ONTAP
- Dell PowerStore
- Pure FlashArray
- HPE Primera

---

### 7.3 Object Storage (오브젝트 스토리지)

| 항목 | 내용 |
|------|------|
| **ID** | `object-storage` |
| **영문명** | Object Storage |
| **한국어명** | 오브젝트 스토리지 |
| **카테고리** | Storage |
| **티어** | Data |
| **프로토콜** | S3, Swift |

#### 주요 기능
- RESTful API 접근 (S3)
- 메타데이터 관리
- 버전 관리
- 수명주기 정책
- 리전 간 복제

#### 특징
- 무한 확장성
- 지역 분산
- 불변성 (WORM)
- 비용 최적화

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 버킷 정책 | Critical | Access | 버킷별 접근 정책 정의 |
| 암호화 | Critical | Security | 서버사이드 암호화 활성화 |
| 수명주기 규칙 | High | Compliance | 데이터 보존 및 아카이빙 규칙 설정 |

#### 대표 벤더
- AWS S3
- Azure Blob Storage
- Google Cloud Storage
- MinIO
- Ceph

---

### 7.4 Cache (캐시)

| 항목 | 내용 |
|------|------|
| **ID** | `cache` |
| **영문명** | Cache |
| **한국어명** | 캐시 |
| **카테고리** | Storage |
| **티어** | Internal |
| **포트** | 6379, 11211 |
| **프로토콜** | Redis, Memcached |

#### 주요 기능
- 키-값 저장
- 세션 저장
- 쿼리 결과 캐싱
- Pub/Sub 메시징
- 요청 제한 (Rate Limiting)

#### 특징
- 밀리초 미만 지연시간
- 데이터 영속성 옵션
- 클러스터링/복제
- TTL 지원

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 인증 | Critical | Security | AUTH/비밀번호 보호 활성화 |
| 비공개 접근 | Critical | Access | 내부 네트워크 접근만 허용 |
| 제거 정책 | High | Performance | 적절한 제거 정책 구성 |

#### 대표 벤더
- Redis
- Memcached
- AWS ElastiCache
- Azure Cache for Redis

---

### 7.5 Backup Storage (백업 스토리지)

| 항목 | 내용 |
|------|------|
| **ID** | `backup` |
| **영문명** | Backup Storage |
| **한국어명** | 백업 스토리지 |
| **카테고리** | Storage |
| **티어** | Data |
| **프로토콜** | NFS, SMB, S3, Tape |

#### 주요 기능
- 증분 백업
- 중복제거
- 압축
- 원격지 복제
- 특정 시점 복구

#### 특징
- 불변 백업
- 랜섬웨어 보호
- 테이프 연동
- 클라우드 계층화

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 3-2-1 규칙 | Critical | Compliance | 3개 복사본, 2가지 미디어, 1개 원격지 |
| 암호화 | Critical | Security | 백업 데이터 암호화 |
| 복구 테스트 | High | Compliance | 정기 복구 테스트 |

#### 대표 벤더
- Veeam
- Commvault
- Rubrik
- Cohesity
- Dell Data Protection

---

## 8. 인증/접근 관리 (Auth)

### 8.1 LDAP/AD

| 항목 | 내용 |
|------|------|
| **ID** | `ldap-ad` |
| **영문명** | LDAP/Active Directory |
| **한국어명** | LDAP/AD |
| **카테고리** | Auth |
| **티어** | Internal |
| **포트** | 389, 636, 3268, 3269 |
| **프로토콜** | LDAP, LDAPS, Kerberos |

#### 주요 기능
- 사용자 인증
- 그룹 멤버십
- 디렉토리 조회
- 비밀번호 정책
- 인증서 서비스 (PKI)

#### 특징
- Kerberos 인증
- 그룹 정책 개체 (GPO)
- 다중 도메인 지원
- 복제

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| LDAPS 사용 | Critical | Security | SSL(포트 636) 통한 LDAP 사용 |
| 비밀번호 정책 | Critical | Security | 강력한 비밀번호 요구사항 적용 |
| 계정 잠금 | High | Security | 실패 시도 후 계정 잠금 |

#### 대표 벤더
- Microsoft Active Directory
- OpenLDAP
- FreeIPA
- 389 Directory Server

---

### 8.2 SSO (통합인증)

| 항목 | 내용 |
|------|------|
| **ID** | `sso` |
| **영문명** | Single Sign-On |
| **한국어명** | SSO (통합인증) |
| **카테고리** | Auth |
| **티어** | Internal |
| **포트** | 443 |
| **프로토콜** | SAML, OAuth 2.0, OIDC |

#### 주요 기능
- 중앙 집중식 인증
- 세션 관리
- 페더레이션 (SAML, OIDC)
- 소셜 로그인 연동
- 애플리케이션 프로비저닝

#### 특징
- SAML 2.0 지원
- OAuth 2.0/OIDC
- 실시간 프로비저닝 (JIT)
- 적응형 인증

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| MFA 연동 | Critical | Security | SSO 로그인에 MFA 필수 |
| 세션 타임아웃 | High | Security | 적절한 세션 타임아웃 구성 |
| 접근 검토 | Medium | Compliance | 정기적 애플리케이션 접근 검토 |

#### 대표 벤더
- Okta
- Azure AD
- Ping Identity
- Auth0
- Keycloak

---

### 8.3 MFA (다중인증)

| 항목 | 내용 |
|------|------|
| **ID** | `mfa` |
| **영문명** | Multi-Factor Authentication |
| **한국어명** | MFA (다중인증) |
| **카테고리** | Auth |
| **티어** | Internal |
| **프로토콜** | TOTP, FIDO2, WebAuthn |

#### 주요 기능
- TOTP (시간 기반 OTP)
- 푸시 알림
- SMS/음성 검증
- 하드웨어 토큰
- 생체 인증

#### 특징
- 위험 기반 인증
- 비밀번호 없는 인증
- 셀프 서비스 등록
- 오프라인 인증

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| MFA 필수 | Critical | Security | 모든 사용자에게 MFA 필수 |
| SMS 비허용 | High | Security | SMS보다 앱 기반 선호 |
| 복구 코드 | High | Security | 안전한 복구 옵션 제공 |

#### 대표 벤더
- Duo Security
- Google Authenticator
- Microsoft Authenticator
- YubiKey
- RSA SecurID

---

### 8.4 IAM (ID/접근관리)

| 항목 | 내용 |
|------|------|
| **ID** | `iam` |
| **영문명** | Identity and Access Management |
| **한국어명** | IAM (ID/접근관리) |
| **카테고리** | Auth |
| **티어** | Internal |

#### 주요 기능
- ID 수명주기 관리
- 접근 프로비저닝
- 역할 기반 접근 제어 (RBAC)
- 권한있는 접근 관리 (PAM)
- 접근 인증

#### 특징
- 셀프 서비스 포털
- 워크플로우 자동화
- 직무 분리 (SoD)
- 감사 및 컴플라이언스 리포팅

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 최소 권한 | Critical | Access | 최소 필요 접근권한만 부여 |
| 정기 검토 | High | Compliance | 분기별 접근 재인증 |
| 직무 분리 | High | Compliance | SoD 정책 적용 |

#### 대표 벤더
- SailPoint
- Saviynt
- IBM Security Verify
- CyberArk
- AWS IAM

---

## 9. 외부 요소 (External)

### 9.1 User (사용자)

| 항목 | 내용 |
|------|------|
| **ID** | `user` |
| **영문명** | User |
| **한국어명** | 사용자 |
| **카테고리** | External |
| **티어** | External |

#### 주요 기능
- 시스템 접근
- 데이터 입/출력
- 애플리케이션 사용

#### 특징
- 다중 장치 접근
- 브라우저 기반 접근
- 모바일 앱 접근

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 강력한 인증 | Critical | Security | 강력한 인증 필수 |
| 세션 보안 | High | Security | 안전한 세션 관리 |

---

### 9.2 Internet (인터넷)

| 항목 | 내용 |
|------|------|
| **ID** | `internet` |
| **영문명** | Internet |
| **한국어명** | 인터넷 |
| **카테고리** | External |
| **티어** | External |

#### 주요 기능
- 외부 연결
- 공용 접근점

#### 특징
- 글로벌 연결
- 신뢰할 수 없는 네트워크

#### 권장 정책

| 정책명 | 우선순위 | 분류 | 설명 |
|--------|---------|------|------|
| 경계 방어 | Critical | Security | 엣지 보안 배포 (FW, WAF) |
| DDoS 방어 | Critical | Security | DDoS 완화 활성화 |

---

## 10. 티어 구조

### 10.1 티어 정의

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          네트워크 티어 구조                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  External (외부)     DMZ              Internal (내부망)    Data (데이터) │
│  ───────────────    ─────            ─────────────────    ───────────── │
│                                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐ │
│  │             │   │             │   │             │   │             │ │
│  │  Internet   │──▶│  Firewall   │──▶│  App Server │──▶│  Database   │ │
│  │  User       │   │  WAF        │   │  Cache      │   │  Storage    │ │
│  │  CDN        │   │  LB         │   │  K8s        │   │  Backup     │ │
│  │             │   │  IDS/IPS    │   │  IAM        │   │             │ │
│  │             │   │  VPN        │   │             │   │             │ │
│  │             │   │  Web Server │   │             │   │             │ │
│  │             │   │             │   │             │   │             │ │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘ │
│                                                                         │
│  신뢰도: 낮음        신뢰도: 중간      신뢰도: 높음       신뢰도: 최고    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 티어별 장비 배치

| 티어 | 색상 | 장비 목록 |
|------|------|----------|
| **External** | 회색 (#6b7280) | user, internet, cdn |
| **DMZ** | 주황색 (#f59e0b) | firewall, waf, ids-ips, vpn-gateway, load-balancer, sd-wan, web-server |
| **Internal** | 녹색 (#10b981) | router, switch-l2, switch-l3, dns, nac, dlp, app-server, container, vm, kubernetes, cache, ldap-ad, sso, mfa, iam, aws-vpc, azure-vnet, gcp-network, private-cloud |
| **Data** | 보라색 (#8b5cf6) | db-server, storage, san-nas, object-storage, backup |

---

## 11. 데이터 관리 가이드

### 11.1 장비 추가 절차

새로운 장비/솔루션을 추가할 때 다음 파일들을 수정해야 합니다:

1. **타입 정의** (`src/types/infra.ts`)
   ```typescript
   // 해당 카테고리의 NodeType에 추가
   export type SecurityNodeType =
     | 'firewall'
     | 'waf'
     | 'new-device'  // 새 장비 추가
     // ...
   ```

2. **데이터베이스** (`src/lib/data/infrastructureDB.ts`)
   ```typescript
   'new-device': {
     id: 'new-device',
     name: 'New Device',
     nameKo: '새 장비',
     category: 'security',
     description: 'English description',
     descriptionKo: '한국어 설명',
     functions: [...],
     functionsKo: [...],
     features: [...],
     featuresKo: [...],
     recommendedPolicies: [...],
     tier: 'dmz',
     ports: [...],
     protocols: [...],
     vendors: [...],
   }
   ```

3. **파싱 패턴** (`src/lib/parser/patterns.ts`)
   ```typescript
   {
     pattern: /new-device|새장비|신규장비/i,
     type: 'new-device',
     label: 'New Device',
     labelKo: '새 장비'
   },
   ```

4. **노드 컴포넌트** (필요시)
   - `src/components/nodes/` 하위에 새 컴포넌트 추가

5. **내보내기 매핑** (필요시)
   - `src/lib/export/terraformExport.ts`
   - `src/lib/export/kubernetesExport.ts`
   - `src/lib/export/plantUMLExport.ts`

6. **이 문서 업데이트**

### 11.2 장비 수정 절차

1. `infrastructureDB.ts`에서 해당 장비 데이터 수정
2. 이 문서의 해당 섹션 업데이트
3. 변경 이력 추가

### 11.3 장비 삭제 절차

1. 모든 관련 파일에서 참조 제거
2. 타입 정의에서 삭제
3. 데이터베이스에서 삭제
4. 파싱 패턴에서 삭제
5. 이 문서에서 삭제
6. 변경 이력 추가

### 11.4 검증 체크리스트

- [ ] TypeScript 빌드 오류 없음
- [ ] 모든 테스트 통과
- [ ] 한/영 레이블 모두 존재
- [ ] 권장 정책 최소 2개 이상
- [ ] 티어 정보 정확
- [ ] 이 문서와 코드 동기화 확인

---

## 12. 변경 이력

| 날짜 | 버전 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 2026-02-06 | 1.0.0 | Claude | 초기 문서 작성 |

---

*이 문서는 InfraFlow 인프라 데이터 관리 에이전트에 의해 관리됩니다.*
*문의: Infrastructure Data Agent (@InfraDataAgent)*
