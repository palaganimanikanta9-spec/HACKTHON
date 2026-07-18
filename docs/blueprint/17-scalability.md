# 17 — Scalability Considerations

## 17.1 Current Scale (Hackathon v1.0)

Expected load:
- ~100 concurrent users
- ~1,000 transactions/day
- ~50 AI verifications/day
- Single region deployment

The architecture is designed so that **none of these constraints require code changes to scale** — only infrastructure changes.

---

## 17.2 Database Scalability

### Connection Pooling

```
Railway PostgreSQL → PgBouncer → Prisma connections

// WHY:
// PostgreSQL has a limited connection limit (~100 by default)
// Express servers create one connection per Prisma client
// PgBouncer multiplexes many application connections into fewer DB connections
// This allows 500+ concurrent API requests with a 20-connection DB pool
```

### Read Replicas (Scale Step 2)

```typescript
// Prisma supports read replicas via @prisma/extension-read-replicas
const prisma = new PrismaClient().$extends(readReplicas({
  url: process.env.DATABASE_REPLICA_URL
}));

// Read-heavy queries (balance, history) → replica
// Write queries (transactions) → primary
```

### Query Performance

- All queries are O(1) or O(log n) via indexed columns
- Transaction history uses cursor-based pagination (not offset — doesn't degrade with data volume)
- No N+1 queries — Prisma `include` used for related data in a single query

---

## 17.3 API Server Scalability

### Stateless Design

```typescript
// ✅ GOOD: Express API is completely stateless
// - No in-memory session state
// - No local file storage
// - Auth via Clerk JWT (verified on each request)
// - DB via Prisma connection pool
// This means the API can be horizontally scaled to N instances instantly
```

### Railway Horizontal Scaling

```yaml
# railway.toml
[deploy]
  numReplicas = 3          # 3 instances for redundancy
  healthcheckPath = "/api/health"
  healthcheckTimeout = 30
```

---

## 17.4 MCP Server Scalability

The OCR and AI Verification MCP servers are the most compute-intensive components:

| Bottleneck | Solution |
|------------|---------|
| OCR processing is slow | Google Vision API is async — non-blocking |
| AI classification is expensive | OpenAI calls are async — no thread blocking |
| Many concurrent verifications | Scale MCP servers independently from API |
| Cost of AI calls | Cache classification for identical documents (hash-based) |

### Future: Queue-Based Architecture

```
API → Bull Queue (Redis) → Worker Processes → OCR + AI MCP
                          ↑
                     Can scale workers independently
                     Retry failed jobs automatically
                     Rate limit AI API calls precisely
```

---

## 17.5 Frontend Scalability

### Vercel Edge Network

- Static assets served from 100+ edge locations globally
- Next.js ISR (Incremental Static Regeneration) for any static content
- Image optimization via Vercel's image CDN

### Bundle Optimization

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Route-level code splitting is automatic with App Router
  // Dynamic imports for heavy components:
};

// Dynamic import example
const DocumentUpload = dynamic(() => import('@/components/strict-savings/DocumentUpload'), {
  loading: () => <UploadSkeleton />,
  ssr: false,
});
```

---

## 17.6 Data Volume Planning

| Table | Row Size | 1 Year Estimate | Storage |
|-------|---------|-----------------|---------|
| users | ~500 bytes | 10,000 users | ~5 MB |
| transactions | ~400 bytes | 500,000 txns | ~200 MB |
| withdrawal_requests | ~2 KB (OCR text) | 5,000 requests | ~10 MB |
| idempotency_keys | ~200 bytes | 1M keys | ~200 MB |

PostgreSQL handles this volume comfortably. Database archival becomes relevant at ~100M transactions.

---

## 17.7 Caching Strategy

| Data | Cache | TTL | Reason |
|------|-------|-----|--------|
| User balance | TanStack Query client cache | 30s | Frequently accessed, changes rarely |
| Transaction history | TanStack Query client cache | 60s | Rarely changes mid-session |
| User profile | TanStack Query client cache | 5min | Very rarely changes |
| Withdrawal threshold | TanStack Query client cache | 5min | Set-and-forget |
| API responses | No server-side cache (v1) | N/A | Financial data must be fresh |

---

## 17.8 Post-Hackathon Scaling Roadmap

```
Phase 1 (0-1K users): Current architecture
  - Single Railway PostgreSQL
  - 1-2 API instances
  - Direct API → MCP calls

Phase 2 (1K-10K users):
  - Add Redis for idempotency keys and session caching
  - Add Bull queue for async AI verification jobs
  - Database read replica
  - PgBouncer connection pooling

Phase 3 (10K-100K users):
  - Dedicated VPS for MCP servers (GPU-equipped for local LLM option)
  - Database sharding by user ID
  - CDN for all API responses
  - Multi-region deployment (US + EU + APAC)

Phase 4 (100K+ users):
  - Full microservices split
  - Kafka for event streaming (transaction events)
  - Separate read model (CQRS pattern)
  - Banking-as-a-service integration (Stripe Treasury, Synapse)
  - SOC 2 Type II audit
```

---

## 17.9 Monitoring & Observability

### Tools (Recommended)

| Tool | Purpose |
|------|---------|
| Railway Metrics | CPU, memory, request rate (built-in) |
| Vercel Analytics | Web vitals, page performance |
| Sentry | Error tracking (frontend + backend) |
| Pino | Structured JSON logging (backend) |
| OpenTelemetry | Distributed tracing (MCP calls) |

### Key Metrics to Track

```
Financial Health:
- Transaction success rate > 99.9%
- AI verification accuracy (human review sample)
- Average verification time (target: <5s)
- Withdrawal rejection rate by classification

System Health:
- API p50/p95/p99 response times
- Error rate < 0.1%
- MCP server response times
- Database query performance

Business Health:
- DAU/MAU ratio
- Savings retention rate
- Onboarding completion rate
```
