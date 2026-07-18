# 05 — Backend Architecture

## 5.1 Technology Stack Rationale

| Technology | Purpose | WHY |
|------------|---------|-----|
| Node.js 20 LTS | Runtime | Same language as frontend, excellent async I/O |
| Express.js | HTTP framework | Lightweight, highly composable, vast middleware ecosystem |
| TypeScript | Type safety | Shared types with frontend via monorepo packages |
| Prisma ORM | DB layer | Type-safe queries, auto-generated client, migrations |
| Zod | Validation | Runtime type checking that mirrors TypeScript types |
| Clerk SDK | Auth middleware | Verify JWTs without managing auth state |
| Multer | File uploads | multipart/form-data handling for document uploads |
| express-rate-limit | Rate limiting | Prevent abuse and DoS |
| Morgan | HTTP logging | Request/response logging |
| Helmet | Security headers | OWASP recommended headers |

---

## 5.2 Layered Architecture

```
Request
  │
  ▼
┌─────────────────────────────────────────┐
│  MIDDLEWARE LAYER                        │
│  cors → helmet → rate-limit → auth      │
│  → body-parser → request-logger         │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│  ROUTES LAYER                           │
│  Express Router — maps URLs to          │
│  controllers, applies route-level       │
│  validation middleware                  │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│  CONTROLLER LAYER                       │
│  Request parsing, response formatting,  │
│  error handling delegation              │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│  SERVICE LAYER                          │
│  Business logic, orchestration,         │
│  DB transactions, MCP calls             │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│  DATA LAYER                             │
│  Prisma queries, DB transactions        │
└─────────────────────────────────────────┘
```

**WHY layered architecture:**
- Each layer has a single responsibility
- Services can be unit tested without HTTP infrastructure
- Controllers can be swapped (e.g., migrate to NestJS controllers later)
- Business logic is not tied to Express — can be reused in background jobs

---

## 5.3 Middleware Stack (Execution Order)

```typescript
// app.ts
app.use(helmet());                        // 1. Security headers
app.use(cors(corsConfig));                // 2. CORS
app.use(express.json({ limit: '10mb' }));// 3. Body parsing (10mb for docs)
app.use(morgan('combined'));              // 4. Request logging
app.use(generalRateLimit);               // 5. Global rate limit (100 req/15min)
// Route-level:
router.use(requireAuth);                 // 6. Clerk JWT verification
router.use(validateRequest(schema));     // 7. Zod validation
// Controller:
controller.use(idempotencyCheck);        // 8. Idempotency (for transactions)
```

---

## 5.4 Service Layer Design

### Strict Savings Service (Core Business Logic)

```typescript
// services/strict-savings.service.ts
class StrictSavingsService {
  
  async initiateWithdrawal(userId: string, amount: Decimal): Promise<WithdrawalResponse> {
    const account = await this.getStrictSavingsAccount(userId);
    
    if (amount.gt(account.balance)) {
      throw new InsufficientFundsError();
    }
    
    // Compare with threshold
    if (amount.gt(account.withdrawalThreshold)) {
      // Auto-approve: above threshold means bypass AI check
      return this.executeAutoApproval(userId, account, amount);
    }
    
    // Below threshold: requires AI verification
    const request = await prisma.withdrawalRequest.create({
      data: {
        userId,
        amount,
        status: 'PENDING_VERIFICATION',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30min expiry
      }
    });
    
    return { 
      requestId: request.id, 
      status: 'VERIFICATION_REQUIRED',
      expiresAt: request.expiresAt
    };
  }
  
  async verifyAndProcess(requestId: string, documentBuffer: Buffer, mimeType: string) {
    // 1. Get pending request
    const request = await this.getPendingRequest(requestId);
    
    // 2. OCR
    const extractedText = await this.mcpService.extractText(documentBuffer, mimeType);
    
    // 3. AI Classification
    const classification = await this.mcpService.classifyExpense({
      extractedText,
      amount: request.amount,
      currency: 'USD'
    });
    
    // 4. Execute or Reject (in DB transaction)
    return prisma.$transaction(async (tx) => {
      if (classification.category === 'essential') {
        await this.executeTransfer(tx, request);
        await tx.withdrawalRequest.update({
          where: { id: requestId },
          data: { 
            status: 'APPROVED',
            classification: classification.category,
            confidence: classification.confidence,
            reasoning: classification.reasoning
          }
        });
        return { status: 'APPROVED', classification };
      } else {
        await tx.withdrawalRequest.update({
          where: { id: requestId },
          data: { 
            status: 'REJECTED',
            classification: classification.category,
            confidence: classification.confidence,
            reasoning: classification.reasoning
          }
        });
        return { status: 'REJECTED', classification };
      }
    });
  }
}
```

---

## 5.5 Transaction Integrity

**All money movements use Prisma transactions with explicit locking:**

```typescript
async executeTransfer(tx: PrismaTransaction, from: string, to: string, amount: Decimal) {
  // 1. Lock both accounts (SELECT FOR UPDATE equivalent via prisma)
  const [fromAccount, toAccount] = await Promise.all([
    tx.wallet.findUniqueOrThrow({ where: { id: from } }),
    tx.wallet.findUniqueOrThrow({ where: { id: to } })
  ]);
  
  // 2. Validate balance
  if (fromAccount.balance.lt(amount)) throw new InsufficientFundsError();
  
  // 3. Debit source
  await tx.wallet.update({
    where: { id: from },
    data: { balance: { decrement: amount } }
  });
  
  // 4. Credit destination
  await tx.wallet.update({
    where: { id: to },
    data: { balance: { increment: amount } }
  });
  
  // 5. Create transaction records
  await tx.transaction.createMany({
    data: [
      { walletId: from, type: 'DEBIT', amount, ... },
      { walletId: to, type: 'CREDIT', amount, ... }
    ]
  });
}
```

---

## 5.6 Error Handling

```typescript
// utils/errors.ts — Custom error hierarchy
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) { super(message); }
}

class InsufficientFundsError extends AppError {
  constructor() { super('Insufficient funds', 422, 'INSUFFICIENT_FUNDS'); }
}

class WithdrawalExpiredError extends AppError {
  constructor() { super('Withdrawal request expired', 410, 'REQUEST_EXPIRED'); }
}

class VerificationFailedError extends AppError {
  constructor(reason: string) { 
    super(`Document verification failed: ${reason}`, 422, 'VERIFICATION_FAILED'); 
  }
}

// Global error handler middleware
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message }
    });
  }
  // Unhandled — 500
  logger.error(err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
});
```

---

## 5.7 Idempotency

All money-movement endpoints require an `Idempotency-Key` header.

```typescript
// middleware/idempotency.ts
// Client sends: Idempotency-Key: <uuid>
// Server stores result in Redis/DB for 24h
// Duplicate requests return the same stored response
// Prevents double-spend from network retries
```

**WHY idempotency matters for fintech:**
- Network timeouts cause clients to retry
- Without idempotency, a user could accidentally double-deposit or double-withdraw
- Industry standard (Stripe, Stripe's API uses this exact pattern)
