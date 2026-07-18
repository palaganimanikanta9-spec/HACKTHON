# 02 — Software & System Architecture

## 2.1 Architectural Style

**Chosen Pattern:** Modular Monorepo with Microservice-Ready Separation

**WHY:**
- A monorepo (Turborepo) lets a small hackathon team share types, utilities, and configs without the operational overhead of a full microservices deployment
- Each `app/` is independently deployable — the backend can be extracted to a true microservice post-hackathon with zero code changes
- Shared `packages/` enforce type safety across frontend ↔ backend ↔ MCP servers (single source of truth for DTOs)

---

## 2.2 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          Next.js 15 App (Vercel)                        │    │
│  │  • App Router  • React Server Components                │    │
│  │  • Clerk Auth  • Framer Motion  • shadcn/ui             │    │
│  └──────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS / REST + WebSocket
┌─────────────────────────────▼───────────────────────────────────┐
│                        API LAYER                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          Express.js API Server (Railway)                 │    │
│  │  • TypeScript  • Prisma ORM  • Zod Validation           │    │
│  │  • Clerk Middleware  • Rate Limiting  • CORS             │    │
│  └──────┬───────────────────────────┬────────────────────  ┘    │
└─────────┼───────────────────────────┼────────────────────────── ┘
          │                           │
          │ Prisma                    │ MCP Protocol (stdio/HTTP)
┌─────────▼──────┐         ┌──────────▼─────────────────────────┐ │
│   PostgreSQL   │         │         MCP SERVER LAYER            │ │
│   (Railway)    │         │  ┌──────────────┐ ┌─────────────┐  │ │
│                │         │  │  OCR MCP     │ │  AI Verify  │  │ │
│  • Prisma ORM  │         │  │  Server      │ │  MCP Server │  │ │
│  • Migrations  │         │  │  (Tesseract/ │ │  (LLM API)  │  │ │
│  • Connection  │         │  │   Vision AI) │ │             │  │ │
│    Pooling     │         │  └──────────────┘ └─────────────┘  │ │
└────────────────┘         └────────────────────────────────────┘ │
                                                                    │
          External Services                                         │
          ┌──────────────────────────────────────────┐             │
          │  Clerk Auth │ Google Vision │ OpenAI API  │             │
          └──────────────────────────────────────────┘             │
```

---

## 2.3 Data Flow Architecture

### Strict Savings Withdrawal Flow (The Flagship Feature)

```
User submits withdrawal request
         │
         ▼
Frontend validates form (Zod schema)
         │
         ▼
POST /api/strict-savings/withdraw
         │
         ▼
API: Fetch user's strict savings balance & threshold
         │
         ├── amount > threshold? ──YES──► Auto-approve
         │                               Transfer to Main Wallet
         │                               Create transaction record
         │                               Return 200 { status: "auto_approved" }
         │
         └── amount <= threshold?
                    │
                    ▼
           API: Create pending withdrawal request
           Return 200 { requestId, status: "verification_required" }
                    │
                    ▼
           Frontend: Show document upload UI
                    │
                    ▼
           User uploads document (image/PDF)
                    │
                    ▼
           Frontend: POST /api/strict-savings/verify
           (multipart/form-data with document + requestId)
                    │
                    ▼
           API: Call OCR MCP Server
           ┌─────────────────────────────┐
           │  OCR MCP Server             │
           │  Input: raw file buffer     │
           │  Process: Tesseract / Vision│
           │  Output: extracted_text     │
           └──────────────┬──────────────┘
                          │
                          ▼
           API: Call AI Verification MCP Server
           ┌─────────────────────────────┐
           │  AI Verification MCP Server │
           │  Input: extracted_text +    │
           │         amount + context    │
           │  Process: LLM prompt        │
           │  Output: {                  │
           │    classification: "essential" │
           │    | "non-essential",       │
           │    confidence: 0.0–1.0,     │
           │    reasoning: string        │
           │  }                          │
           └──────────────┬──────────────┘
                          │
                ┌─────────┴──────────┐
                │                    │
            Essential?          Non-Essential?
                │                    │
                ▼                    ▼
         Approve                  Reject
         Transfer money           Return rejection
         to Main Wallet           with reasoning
         Create txn record
```

---

## 2.4 Monorepo Structure Philosophy

**WHY Turborepo:**
- Incremental builds — only rebuild what changed
- Shared packages cached across apps
- Single `npm install` at root
- Pipeline orchestration (build order, test order)
- Zero config for most setups

**WHY separate MCP servers from main API:**
- MCP servers are stateless compute workers — they can scale independently
- Clean separation of concerns: API handles business logic, MCP handles AI computation
- MCP protocol is language-agnostic — servers can be rewritten in Python for ML libraries without touching the API
- Easier to swap AI providers (OpenAI → Anthropic → Gemini) without API changes

---

## 2.5 Communication Protocols

| Connection | Protocol | Format | Auth |
|------------|----------|--------|------|
| Browser → Next.js | HTTP/2 (Vercel) | RSC + JSON | Clerk session |
| Next.js → API | REST over HTTPS | JSON | Clerk JWT |
| API → PostgreSQL | TCP (Prisma) | Binary Protocol | DB credentials |
| API → OCR MCP | HTTP (internal) | JSON-RPC | API key |
| API → AI MCP | HTTP (internal) | JSON-RPC | API key |
| OCR MCP → Vision AI | HTTPS | JSON | API key |
| AI MCP → LLM API | HTTPS | JSON | API key |

---

## 2.6 Deployment Architecture

```
Vercel (Frontend)                Railway (Backend)
┌──────────────────┐            ┌──────────────────────────────┐
│  Next.js App     │   HTTPS    │  Express API    │  PostgreSQL │
│  • Edge Runtime  │ ─────────► │  (Railway svc)  │  (Railway)  │
│  • ISR/SSR       │            │                 │             │
│  • Image Optim   │            │  OCR MCP Server │             │
│  • CDN           │            │  (Railway svc)  │             │
└──────────────────┘            │                 │             │
                                │  AI Verify MCP  │             │
                                │  (Railway svc)  │             │
                                └──────────────────────────────┘
```

**WHY Vercel for Frontend:**
- Zero-config Next.js deployment (same team builds both)
- Edge network for global performance
- Automatic preview deployments per PR
- Built-in image optimization

**WHY Railway for Backend:**
- Simple container-based deployment (no Kubernetes overhead)
- Native PostgreSQL addon with automatic backups
- Private networking between services (API ↔ MCP servers on internal network)
- Easy environment variable management

---

## 2.7 Architectural Decisions Log (ADL)

| Decision | Options Considered | Chosen | Reason |
|----------|-------------------|--------|--------|
| Frontend framework | Next.js, Remix, Vite+React | Next.js 15 | App Router + RSC + Vercel native |
| Backend framework | Express, Fastify, NestJS, Hono | Express + TypeScript | Team familiarity, extensive ecosystem |
| ORM | Prisma, Drizzle, TypeORM | Prisma | Type-safe queries, excellent DX, migrations |
| Database | PostgreSQL, MySQL, MongoDB | PostgreSQL | ACID compliance for financial data |
| Auth | Clerk, Auth.js, Supabase Auth | Clerk | Fastest integration, pre-built UI components |
| AI API | OpenAI, Anthropic, Gemini | OpenAI (GPT-4o) | Best instruction-following for classification |
| OCR | Tesseract.js, Google Vision API | Google Cloud Vision | Higher accuracy on receipts/documents |
| State Management | Zustand, Redux, Jotai, Context | Zustand | Minimal boilerplate, TypeScript-first |
| Styling | Tailwind + shadcn/ui | Tailwind + shadcn/ui | Speed + consistency + accessibility |
| Animation | Framer Motion, GSAP, CSS | Framer Motion | React-native, declarative, powerful |
