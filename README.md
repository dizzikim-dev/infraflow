# InfraFlow

> AI-powered infrastructure visualization platform - 프롬프트 한 줄로 인프라 아키텍처를 시각화하고, 데이터 흐름을 애니메이션으로 보여주는 플랫폼

![InfraFlow](https://img.shields.io/badge/version-0.1.0--alpha-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React Flow](https://img.shields.io/badge/React%20Flow-12-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### Core Features
- **Natural Language to Diagram** - 자연어로 인프라 아키텍처 생성
- **Smart Commands** - "WAF 추가해줘", "방화벽 삭제해줘" 등 수정 명령 지원
- **Animated Data Flow** - 5가지 애니메이션 시나리오 (요청/응답, 차단, 동기화 등)
- **Template Gallery** - 10개 내장 템플릿 + 사용자 정의 템플릿 저장
- **LLM Integration** - Claude/OpenAI API를 통한 자연어 파싱 (선택 사항)
- **Export** - PNG, SVG, PDF, JSON 형식 내보내기

### Supported Components (24 Types)

| Category | Components |
|----------|------------|
| Security | Firewall, WAF, IDS/IPS, VPN Gateway, NAC, DLP |
| Network | Router, Switch (L2/L3), Load Balancer, SD-WAN, DNS, CDN |
| Compute | Web Server, App Server, DB Server, Container, VM, Kubernetes |
| Cloud | AWS VPC, Azure VNet, GCP Network, Private Cloud |
| Storage | SAN/NAS, Object Storage, Backup, Cache |
| Auth | LDAP/AD, SSO, MFA, IAM |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd infraflow

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage Examples

```
# Create architectures
"3티어 웹 아키텍처 보여줘"
"VPN으로 내부망 접속하는 구조"
"쿠버네티스 클러스터 아키텍처"

# Modify diagrams
"WAF 추가해줘"
"방화벽 삭제해줘"
"로드밸런서랑 웹서버 연결해줘"
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── nodes/             # 24 infrastructure node components
│   ├── edges/             # Animated edge components
│   ├── panels/            # UI panels (8 components)
│   └── shared/            # Shared components
├── lib/
│   ├── parser/            # Prompt parsing (basic + smart)
│   ├── layout/            # Auto-layout engine
│   ├── animation/         # Animation engine
│   ├── templates/         # Template management
│   └── export/            # Export utilities
├── hooks/                 # React hooks
└── types/                 # TypeScript types
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Diagram**: React Flow 12
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS 4
- **Export**: html2canvas, jsPDF

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Built-in Templates

| Template | Description | Components |
|----------|-------------|------------|
| 3-Tier Web | Standard 3-tier web architecture | CDN, WAF, LB, Web/App/DB Server |
| VPN | VPN-based internal network access | VPN Gateway, Firewall, Router |
| Kubernetes | K8s cluster architecture | Ingress, Service, Pods, PV |
| Simple WAF | Basic WAF + Load Balancer | WAF, LB, Web Servers |
| Hybrid Cloud | AWS + On-premise hybrid | AWS VPC, VPN, On-prem resources |
| Microservices | MSA with API Gateway | API Gateway, Services, Message Queue |
| Zero Trust | ZTNA security model | IdP, MFA, ZTNA, DLP |
| Disaster Recovery | Active-Standby HA | Primary/DR Sites, Replication |
| API Backend | REST API architecture | WAF, Rate Limiter, API Gateway, Cache |
| IoT | IoT data pipeline | MQTT, Stream Processor, TimeSeries DB |

## LLM Configuration (Optional)

InfraFlow can use LLM APIs for enhanced natural language parsing. Copy `.env.example` to `.env.local` and configure:

```bash
# Claude API (Recommended)
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-api-key

# Or OpenAI API
NEXT_PUBLIC_OPENAI_API_KEY=your-api-key
```

Without API keys, InfraFlow uses built-in template matching which works great for common patterns.

## Roadmap

- [x] Phase 1: Foundation (MVP)
- [x] Phase 2: Animation
- [x] Phase 3: Intelligence
- [x] Phase 4: LLM Integration (Claude/OpenAI API)
- [ ] Phase 5: Collaboration (Real-time editing, sharing)
- [ ] Phase 6: Enterprise (SSO, audit logs, RBAC)

## Deploy on Vercel

The easiest way to deploy InfraFlow is to use [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT License

---

Built with [Next.js](https://nextjs.org/) and [React Flow](https://reactflow.dev/)
