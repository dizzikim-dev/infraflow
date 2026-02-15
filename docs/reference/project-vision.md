# InfraFlow - Project Vision

> **프롬프트 한 줄로 인프라 아키텍처를 시각화하고, 데이터 흐름을 애니메이션으로 보여주는 플랫폼**

## 핵심 목표
1. **자연어 → 인프라 다이어그램**: 프롬프트로 복잡한 아키텍처 생성
2. **애니메이션 데이터 흐름**: 실시간으로 데이터가 어떻게 흐르는지 시각화
3. **보안 정책 시각화**: 방화벽, ACL, 라우팅 정책 등을 시각적으로 표현
4. **인터랙티브 편집**: 생성된 다이어그램을 드래그앤드롭으로 수정

## 인프라 구성요소 라이브러리

| 카테고리 | 구성요소 |
|----------|---------|
| 보안 장비 | Firewall, WAF, IDS/IPS, VPN Gateway, NAC, DLP |
| 네트워크 장비 | Router, Switch (L2/L3), Load Balancer, SD-WAN, DNS, CDN |
| 컴퓨팅/서버 | Web Server, App Server, DB Server, Container, VM, Kubernetes |
| 클라우드 서비스 | AWS VPC, Azure VNet, GCP Network, Private Cloud |
| 스토리지 | SAN/NAS, Object Storage, Backup, Cache (Redis) |
| 인증/접근 | LDAP/AD, SSO, MFA, IAM |

## 데이터 흐름 애니메이션

| 흐름 유형 | 시각화 |
|-----------|--------|
| Request Flow (요청) | 파란색 점선 이동 |
| Response Flow (응답) | 녹색 점선 이동 |
| Sync/Replication | 주황색 양방향 |
| Blocked/Denied | 빨간색 차단 표시 |
| Encrypted | 굵은 실선 (자물쇠 아이콘) |

## 정책 시각화

노드 클릭 시 보안 정책, ACL, 라우팅 규칙을 시각적 오버레이로 표시.
- 방화벽 규칙 (Allow/Deny)
- WAF 규칙 (SQL Injection Block, XSS Prevention, Rate Limiting)
- 라우팅 정책
