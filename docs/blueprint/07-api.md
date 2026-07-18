# 07 — API Architecture & Contracts

## 7.1 API Design Principles

- **RESTful** resource-based URLs
- **Consistent response envelope** — every response has the same shape
- **Versioned** — `/api/v1/` prefix for future compatibility
- **Idempotent** money operations via `Idempotency-Key` header
- **Zod-validated** inputs on every endpoint
- **JWT-authenticated** via Clerk on all routes except `/health`

---

## 7.2 Standard Response Envelope

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {           // Optional: pagination, etc.
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",     // Machine-readable code
    "message": "Insufficient funds in your Strict Savings account.",
    "details": { ... }               // Optional: field-level errors
  }
}
```

---

## 7.3 Error Code Registry

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INSUFFICIENT_FUNDS` | 422 | Balance less than withdrawal amount |
| `VERIFICATION_REQUIRED` | 200 | Amount below threshold, upload needed |
| `REQUEST_EXPIRED` | 410 | 30-minute verification window elapsed |
| `VERIFICATION_FAILED` | 422 | Document rejected or unreadable |
| `NON_ESSENTIAL_EXPENSE` | 422 | AI classified as non-essential |
| `DUPLICATE_REQUEST` | 409 | Idempotency key already used |
| `RATE_LIMITED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 7.4 API Endpoints

### Health

```
GET  /api/health
→ { status: "ok", timestamp: ISO8601, version: "1.0.0" }
```

---

### User

```
POST  /api/v1/users/sync            ← Called after Clerk webhook on user creation
GET   /api/v1/users/me              ← Get current user profile
PATCH /api/v1/users/me              ← Update profile (name, avatar)
```

---

### Main Wallet

```
GET   /api/v1/wallet
→ {
    id: string,
    balance: string,       // Decimal as string to preserve precision
    currency: string,
    updatedAt: ISO8601
  }

POST  /api/v1/wallet/send
Headers: Idempotency-Key: <uuid>
Body: {
  recipientId: string,    // Target user ID
  amount: string,         // "100.00"
  description?: string
}
→ { transactionId: string, balanceAfter: string, status: "COMPLETED" }

POST  /api/v1/wallet/receive
Body: {
  senderId: string,
  amount: string,
  reference?: string
}
→ { transactionId: string, balanceAfter: string }

GET   /api/v1/wallet/transactions
Query: ?page=1&pageSize=20&type=SEND,RECEIVE&from=ISO&to=ISO
→ {
    transactions: TransactionItem[],
    meta: { page, pageSize, total }
  }

GET   /api/v1/wallet/transactions/:id
→ TransactionItem
```

---

### Normal Savings

```
GET   /api/v1/savings/normal
→ { id, balance, currency, updatedAt }

POST  /api/v1/savings/normal/deposit
Headers: Idempotency-Key: <uuid>
Body: { amount: string, sourceWalletId?: string }
→ { transactionId, balanceAfter, status }

POST  /api/v1/savings/normal/withdraw
Headers: Idempotency-Key: <uuid>
Body: { amount: string, destinationWalletId?: string }
→ { transactionId, balanceAfter, status }

GET   /api/v1/savings/normal/transactions
Query: ?page=1&pageSize=20
→ { transactions: TransactionItem[], meta }
```

---

### Strict Savings

```
GET   /api/v1/savings/strict
→ {
    id, balance, currency,
    withdrawalThreshold: string,
    updatedAt
  }

POST  /api/v1/savings/strict/deposit
Headers: Idempotency-Key: <uuid>
Body: { amount: string }
→ { transactionId, balanceAfter, status }

PATCH /api/v1/savings/strict/threshold
Body: { threshold: string }
→ { threshold: string, updatedAt: ISO8601 }

GET   /api/v1/savings/strict/transactions
Query: ?page=1&pageSize=20
→ { transactions: TransactionItem[], meta }
```

---

### Strict Savings — Withdrawal Flow (The Core Feature)

```
Step 1: Initiate withdrawal
POST  /api/v1/savings/strict/withdraw/initiate
Headers: Idempotency-Key: <uuid>
Body: { amount: string }
→ One of:
   {
     status: "AUTO_APPROVED",
     transactionId: string,
     balanceAfter: string
   }
   OR
   {
     status: "VERIFICATION_REQUIRED",
     requestId: string,
     expiresAt: ISO8601,
     threshold: string,
     message: "Please upload a document proving this is an essential expense."
   }

Step 2: Upload document for verification
POST  /api/v1/savings/strict/withdraw/verify
Content-Type: multipart/form-data
Body:
  requestId: string
  document: File (image/jpeg, image/png, application/pdf, max 10MB)
→ One of:
   {
     status: "APPROVED",
     transactionId: string,
     balanceAfter: string,
     classification: {
       category: "essential",
       confidence: 0.95,
       reasoning: "Document appears to be a medical bill from..."
     }
   }
   OR
   {
     status: "REJECTED",
     classification: {
       category: "non_essential",
       confidence: 0.88,
       reasoning: "Document appears to be for entertainment purchase..."
     },
     error: { code: "NON_ESSENTIAL_EXPENSE", message: "..." }
   }

Step 3: Check request status (polling fallback)
GET   /api/v1/savings/strict/withdraw/requests/:requestId
→ {
    id: string,
    status: WithdrawalRequestStatus,
    amount: string,
    classification?: ExpenseClassification,
    confidence?: number,
    reasoning?: string,
    expiresAt: ISO8601,
    createdAt: ISO8601
  }
```

---

## 7.5 Request Validation (Zod Schemas)

```typescript
// packages/validators/src/strict-savings.validators.ts

export const initiateWithdrawalSchema = z.object({
  body: z.object({
    amount: z
      .string()
      .regex(/^\d+(\.\d{1,8})?$/, 'Amount must be a valid decimal number')
      .refine(val => parseFloat(val) > 0, 'Amount must be positive')
      .refine(val => parseFloat(val) <= 1_000_000, 'Amount too large')
  })
});

export const verifyWithdrawalSchema = z.object({
  body: z.object({
    requestId: z.string().cuid()
  }),
  file: z.object({
    mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    size: z.number().max(10 * 1024 * 1024) // 10MB
  })
});
```

---

## 7.6 Rate Limiting Configuration

| Endpoint Group | Rate Limit | Window |
|---------------|-----------|--------|
| All endpoints (general) | 100 req | 15 min |
| `/wallet/send` | 10 req | 1 min |
| `/savings/*/deposit` | 10 req | 1 min |
| `/savings/*/withdraw` | 5 req | 1 min |
| `/savings/strict/withdraw/verify` | 3 req | 10 min |
| `/users/sync` | 5 req | 1 min |

**WHY stricter limits on verification:** Document uploads + AI calls are expensive. Rate limiting prevents abuse and cost overruns.

---

## 7.7 Webhook Endpoint (Clerk)

```
POST /api/webhooks/clerk
Signature: svix-id, svix-timestamp, svix-signature headers

Events handled:
  user.created  → Create user + MainWallet + NormalSavings + StrictSavings records
  user.updated  → Sync name/email changes
  user.deleted  → Soft delete user + anonymize data
```
