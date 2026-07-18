# 06 — Database Architecture & Schema

## 6.1 Database Choice Rationale

**PostgreSQL** was chosen over alternatives:

| Criterion | PostgreSQL | MySQL | MongoDB |
|----------|-----------|-------|---------|
| ACID Compliance | ✅ Full | ✅ Full | ⚠️ Partial |
| Decimal precision | ✅ NUMERIC(20,8) | ✅ | ⚠️ Float issues |
| Row-level locking | ✅ | ✅ | ❌ |
| JSON support | ✅ JSONB | ⚠️ Basic | ✅ |
| Full-text search | ✅ | ⚠️ | ✅ |
| Prisma support | ✅ Excellent | ✅ Good | ✅ |

**WHY ACID compliance is critical:**
Money is never eventually consistent. Every balance update must be atomic, consistent, isolated, and durable. A partial write that debits but fails to credit is catastrophic.

---

## 6.2 Prisma Schema

```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────
model User {
  id              String   @id @default(cuid())
  clerkId         String   @unique  // Clerk user ID
  email           String   @unique
  firstName       String?
  lastName        String?
  avatarUrl       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  mainWallet      MainWallet?
  normalSavings   NormalSavings?
  strictSavings   StrictSavings?
  
  @@map("users")
  @@index([clerkId])
}

// ─────────────────────────────────────────────────────────────
// MAIN WALLET
// ─────────────────────────────────────────────────────────────
model MainWallet {
  id              String   @id @default(cuid())
  userId          String   @unique
  balance         Decimal  @default(0) @db.Decimal(20, 8)
  currency        String   @default("USD")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions    Transaction[]
  
  @@map("main_wallets")
}

// ─────────────────────────────────────────────────────────────
// NORMAL SAVINGS
// ─────────────────────────────────────────────────────────────
model NormalSavings {
  id              String   @id @default(cuid())
  userId          String   @unique
  balance         Decimal  @default(0) @db.Decimal(20, 8)
  currency        String   @default("USD")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions    Transaction[]
  
  @@map("normal_savings")
}

// ─────────────────────────────────────────────────────────────
// STRICT SAVINGS
// ─────────────────────────────────────────────────────────────
model StrictSavings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  balance               Decimal  @default(0) @db.Decimal(20, 8)
  currency              String   @default("USD")
  
  // Withdrawal configuration
  withdrawalThreshold   Decimal  @default(500) @db.Decimal(20, 8)
  // Amounts ABOVE this threshold bypass AI and auto-transfer
  // Amounts BELOW this threshold require AI document verification
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  // Relations
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions          Transaction[]
  withdrawalRequests    WithdrawalRequest[]
  
  @@map("strict_savings")
}

// ─────────────────────────────────────────────────────────────
// TRANSACTION (Unified ledger for all wallet types)
// ─────────────────────────────────────────────────────────────
model Transaction {
  id                String            @id @default(cuid())
  
  // Source wallet (nullable per wallet type)
  mainWalletId      String?
  normalSavingsId   String?
  strictSavingsId   String?
  
  type              TransactionType
  direction         TransactionDirection
  amount            Decimal           @db.Decimal(20, 8)
  balanceAfter      Decimal           @db.Decimal(20, 8)  // Snapshot balance
  currency          String            @default("USD")
  
  // Optional metadata
  description       String?
  reference         String?           // External reference (send/receive)
  counterpartyName  String?           // Who sent/received
  counterpartyId    String?           // Their user ID if internal
  
  // AI Verification metadata (for strict savings)
  withdrawalRequestId String?
  
  status            TransactionStatus @default(COMPLETED)
  createdAt         DateTime          @default(now())
  
  // Relations
  mainWallet        MainWallet?       @relation(fields: [mainWalletId], references: [id])
  normalSavings     NormalSavings?    @relation(fields: [normalSavingsId], references: [id])
  strictSavings     StrictSavings?    @relation(fields: [strictSavingsId], references: [id])
  withdrawalRequest WithdrawalRequest? @relation(fields: [withdrawalRequestId], references: [id])
  
  @@map("transactions")
  @@index([mainWalletId, createdAt])
  @@index([normalSavingsId, createdAt])
  @@index([strictSavingsId, createdAt])
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  SEND
  RECEIVE
  TRANSFER_IN
  TRANSFER_OUT
  AUTO_TRANSFER    // Threshold-based auto transfer
}

enum TransactionDirection {
  CREDIT
  DEBIT
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REVERSED
}

// ─────────────────────────────────────────────────────────────
// WITHDRAWAL REQUEST (Strict Savings AI Verification Flow)
// ─────────────────────────────────────────────────────────────
model WithdrawalRequest {
  id                String                @id @default(cuid())
  strictSavingsId   String
  userId            String
  
  amount            Decimal               @db.Decimal(20, 8)
  status            WithdrawalRequestStatus @default(PENDING_VERIFICATION)
  
  // Document data
  documentUrl       String?               // Stored in cloud storage
  documentMimeType  String?
  extractedText     String?               // OCR output (stored for audit)
  
  // AI Classification result
  classification    ExpenseClassification?
  confidence        Float?                // 0.0 - 1.0
  reasoning         String?               // LLM explanation
  
  // Timing
  expiresAt         DateTime              // Request must complete before this
  processedAt       DateTime?
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt
  
  // Relations
  strictSavings     StrictSavings         @relation(fields: [strictSavingsId], references: [id])
  transactions      Transaction[]
  
  @@map("withdrawal_requests")
  @@index([userId, status])
  @@index([strictSavingsId])
}

enum WithdrawalRequestStatus {
  PENDING_VERIFICATION  // Waiting for document upload
  VERIFYING             // OCR + AI in progress
  APPROVED              // Essential - transfer executed
  REJECTED              // Non-essential - rejected
  EXPIRED               // 30min window passed
  CANCELLED             // User cancelled
}

enum ExpenseClassification {
  ESSENTIAL
  NON_ESSENTIAL
}

// ─────────────────────────────────────────────────────────────
// IDEMPOTENCY KEYS (Prevent duplicate transactions)
// ─────────────────────────────────────────────────────────────
model IdempotencyKey {
  id            String   @id @default(cuid())
  key           String   @unique
  userId        String
  endpoint      String
  responseBody  Json
  createdAt     DateTime @default(now())
  expiresAt     DateTime // 24 hours
  
  @@map("idempotency_keys")
  @@index([key])
  @@index([expiresAt])  // For cleanup jobs
}
```

---

## 6.3 Database Indexes Strategy

| Table | Index | Reason |
|-------|-------|--------|
| `users` | `clerkId` | Auth lookup on every request |
| `transactions` | `(mainWalletId, createdAt)` | Paginated history query |
| `transactions` | `(normalSavingsId, createdAt)` | Same |
| `transactions` | `(strictSavingsId, createdAt)` | Same |
| `withdrawal_requests` | `(userId, status)` | Find pending requests by user |
| `idempotency_keys` | `key` | Idempotency check |
| `idempotency_keys` | `expiresAt` | Cleanup job |

---

## 6.4 Decimal Precision Strategy

**All monetary values use `NUMERIC(20, 8)` (Decimal in Prisma):**
- 20 total digits, 8 decimal places
- Supports up to $999,999,999,999.99999999 (future-proof)
- **Never use `FLOAT` for money** — floating point arithmetic causes rounding errors (e.g., 0.1 + 0.2 ≠ 0.3)
- On the JS side, use the `decimal.js` library for all arithmetic

---

## 6.5 Data Retention & Audit Trail

- Transactions are **never deleted** — they are immutable ledger entries
- `status: REVERSED` is used for refunds/reversals, not deletion
- `WithdrawalRequest` stores the full OCR text and AI reasoning for compliance audit
- Soft deletes are used for user accounts (`deletedAt` field) — data retained 7 years

---

## 6.6 Connection Pooling

```typescript
// packages/db/src/index.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      // Railway PostgreSQL uses connection pooling via PgBouncer
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**WHY singleton pattern:** Prevents connection pool exhaustion in serverless environments. Next.js hot-reload creates new module instances — singleton prevents creating hundreds of Prisma connections.
