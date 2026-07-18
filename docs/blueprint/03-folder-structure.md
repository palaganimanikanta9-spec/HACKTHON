# 03 — Full Folder & File Structure

## 3.1 Monorepo Root

```
smartsave-ai-wallet/                     # Monorepo root
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                       # CI pipeline (lint, test, build)
│   │   ├── deploy-frontend.yml          # Vercel deployment
│   │   └── deploy-backend.yml           # Railway deployment
│   └── pull_request_template.md
├── apps/
│   ├── web/                             # Next.js 15 frontend
│   ├── api/                             # Express.js backend
│   ├── mcp-ocr/                         # OCR MCP Server
│   └── mcp-ai-verification/             # AI Verification MCP Server
├── packages/
│   ├── db/                              # Prisma schema + client
│   ├── types/                           # Shared TypeScript types/DTOs
│   ├── validators/                      # Shared Zod schemas
│   └── config/                          # Shared config (eslint, tsconfig)
├── .env.example                         # Environment variable template
├── .gitignore
├── package.json                         # Root workspace config
├── turbo.json                           # Turborepo pipeline config
├── BLUEPRINT.md                         # This blueprint index
└── README.md
```

---

## 3.2 Frontend App (`apps/web/`)

```
apps/web/
├── public/
│   ├── icons/
│   │   ├── wallet.svg
│   │   ├── savings.svg
│   │   └── strict-savings.svg
│   ├── images/
│   │   └── onboarding/
│   └── manifest.json                    # PWA manifest
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── (auth)/                      # Route group: auth pages
│   │   │   ├── sign-in/
│   │   │   │   └── [[...sign-in]]/
│   │   │   │       └── page.tsx
│   │   │   ├── sign-up/
│   │   │   │   └── [[...sign-up]]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx               # Centered auth layout
│   │   ├── (dashboard)/                 # Route group: main app
│   │   │   ├── layout.tsx               # App shell (nav + sidebar)
│   │   │   ├── page.tsx                 # Dashboard / Home → redirects to /wallet
│   │   │   ├── wallet/
│   │   │   │   ├── page.tsx             # Main Wallet screen
│   │   │   │   ├── send/
│   │   │   │   │   └── page.tsx         # Send money flow
│   │   │   │   ├── receive/
│   │   │   │   │   └── page.tsx         # Receive money flow
│   │   │   │   └── history/
│   │   │   │       └── page.tsx         # Full transaction history
│   │   │   ├── savings/
│   │   │   │   ├── page.tsx             # Normal Savings screen
│   │   │   │   ├── deposit/
│   │   │   │   │   └── page.tsx         # Deposit flow
│   │   │   │   └── withdraw/
│   │   │   │       └── page.tsx         # Withdraw flow (no restriction)
│   │   │   ├── strict-savings/
│   │   │   │   ├── page.tsx             # Strict Savings screen
│   │   │   │   ├── deposit/
│   │   │   │   │   └── page.tsx         # Deposit to strict savings
│   │   │   │   └── withdraw/
│   │   │   │       ├── page.tsx         # Withdrawal initiation
│   │   │   │       ├── verify/
│   │   │   │       │   └── page.tsx     # Document upload + AI verification
│   │   │   │       └── result/
│   │   │   │           └── page.tsx     # Approval / Rejection result
│   │   │   ├── settings/
│   │   │   │   └── page.tsx             # User settings & threshold config
│   │   │   └── onboarding/
│   │   │       └── page.tsx             # First-time user setup
│   │   ├── api/                         # Next.js API routes (thin proxies)
│   │   │   └── webhooks/
│   │   │       └── clerk/
│   │   │           └── route.ts         # Clerk webhook handler
│   │   ├── layout.tsx                   # Root layout (fonts, providers)
│   │   ├── globals.css                  # Global CSS + CSS custom properties
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── components/
│   │   ├── ui/                          # shadcn/ui generated components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   ├── layout/                      # App shell components
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageWrapper.tsx
│   │   ├── wallet/                      # Main Wallet feature components
│   │   │   ├── WalletCard.tsx           # Hero balance card
│   │   │   ├── WalletActions.tsx        # Send/Receive/History buttons
│   │   │   ├── TransactionItem.tsx      # Single transaction row
│   │   │   ├── TransactionList.tsx      # Scrollable transaction list
│   │   │   ├── SendMoneyForm.tsx
│   │   │   └── ReceiveMoneyQR.tsx
│   │   ├── savings/                     # Normal Savings components
│   │   │   ├── SavingsCard.tsx          # Balance card
│   │   │   ├── DepositForm.tsx
│   │   │   └── WithdrawForm.tsx
│   │   ├── strict-savings/              # Strict Savings components
│   │   │   ├── StrictSavingsCard.tsx    # Hero card with lock icon
│   │   │   ├── WithdrawalForm.tsx       # Amount input + threshold check
│   │   │   ├── DocumentUpload.tsx       # Drag-and-drop file uploader
│   │   │   ├── VerificationStatus.tsx   # OCR + AI status steps
│   │   │   ├── ApprovalResult.tsx       # Success state
│   │   │   └── RejectionResult.tsx      # Rejection state with reason
│   │   ├── shared/                      # Cross-feature reusable components
│   │   │   ├── AmountInput.tsx          # Formatted currency input
│   │   │   ├── BalanceDisplay.tsx       # Masked/visible balance
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── StepIndicator.tsx        # Multi-step flow progress
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── EmptyState.tsx
│   │   └── providers/
│   │       ├── AppProviders.tsx         # Composes all providers
│   │       ├── ThemeProvider.tsx
│   │       └── QueryProvider.tsx        # TanStack Query
│   ├── hooks/
│   │   ├── use-wallet.ts                # Wallet balance + actions
│   │   ├── use-savings.ts               # Normal savings state
│   │   ├── use-strict-savings.ts        # Strict savings state + withdrawal flow
│   │   ├── use-transactions.ts          # Transaction history
│   │   ├── use-verification.ts          # AI verification polling
│   │   ├── use-theme.ts                 # Dark/light mode
│   │   └── use-currency-format.ts       # Number formatting
│   ├── lib/
│   │   ├── api-client.ts                # Typed axios/fetch wrapper
│   │   ├── utils.ts                     # shadcn utility + general utils
│   │   ├── constants.ts                 # App-wide constants
│   │   ├── format.ts                    # Currency, date formatters
│   │   └── animations.ts                # Shared Framer Motion variants
│   ├── store/
│   │   ├── wallet-store.ts              # Zustand wallet store
│   │   ├── savings-store.ts             # Zustand savings store
│   │   ├── ui-store.ts                  # UI state (modals, loading, etc.)
│   │   └── verification-store.ts        # Withdrawal verification flow state
│   ├── types/
│   │   └── index.ts                     # Re-exports from @smartsave/types
│   └── middleware.ts                    # Clerk auth middleware
├── .env.local
├── .env.local.example
├── components.json                      # shadcn/ui config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3.3 Backend API (`apps/api/`)

```
apps/api/
├── src/
│   ├── index.ts                         # Entry point
│   ├── app.ts                           # Express app factory
│   ├── config/
│   │   ├── env.ts                       # Zod-validated env vars
│   │   ├── cors.ts
│   │   └── rate-limit.ts
│   ├── middleware/
│   │   ├── auth.ts                      # Clerk JWT verification
│   │   ├── error-handler.ts             # Global error handler
│   │   ├── request-logger.ts
│   │   ├── validate.ts                  # Zod validation middleware
│   │   └── idempotency.ts               # Idempotency key middleware
│   ├── routes/
│   │   ├── index.ts                     # Route registration
│   │   ├── health.routes.ts
│   │   ├── user.routes.ts
│   │   ├── wallet.routes.ts
│   │   ├── savings.routes.ts
│   │   ├── strict-savings.routes.ts
│   │   └── transactions.routes.ts
│   ├── controllers/
│   │   ├── user.controller.ts
│   │   ├── wallet.controller.ts
│   │   ├── savings.controller.ts
│   │   ├── strict-savings.controller.ts
│   │   └── transactions.controller.ts
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── wallet.service.ts
│   │   ├── savings.service.ts
│   │   ├── strict-savings.service.ts
│   │   ├── transaction.service.ts
│   │   └── mcp.service.ts               # MCP client orchestration
│   ├── mcp-clients/
│   │   ├── ocr.client.ts                # OCR MCP Server client
│   │   └── ai-verification.client.ts    # AI Verification MCP client
│   ├── db/
│   │   └── prisma.ts                    # Prisma singleton
│   └── utils/
│       ├── errors.ts                    # Custom error classes
│       ├── response.ts                  # Standardized response format
│       └── logger.ts
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 3.4 OCR MCP Server (`apps/mcp-ocr/`)

```
apps/mcp-ocr/
├── src/
│   ├── index.ts                         # MCP server entry point
│   ├── server.ts                        # MCP server definition
│   ├── tools/
│   │   └── extract-text.tool.ts         # OCR tool definition
│   ├── services/
│   │   └── vision.service.ts            # Google Cloud Vision / Tesseract
│   └── utils/
│       ├── file-processor.ts            # Buffer → base64 → Vision API
│       └── text-cleaner.ts              # Clean/normalize extracted text
├── .env
├── tsconfig.json
└── package.json
```

---

## 3.5 AI Verification MCP Server (`apps/mcp-ai-verification/`)

```
apps/mcp-ai-verification/
├── src/
│   ├── index.ts
│   ├── server.ts
│   ├── tools/
│   │   └── classify-expense.tool.ts     # Expense classification tool
│   ├── services/
│   │   └── llm.service.ts               # OpenAI API client
│   ├── prompts/
│   │   └── classification.prompt.ts     # System + user prompt templates
│   └── utils/
│       └── parser.ts                    # Parse LLM JSON response
├── .env
├── tsconfig.json
└── package.json
```

---

## 3.6 Shared Packages

```
packages/
├── db/                                  # Prisma package
│   ├── prisma/
│   │   ├── schema.prisma                # Database schema
│   │   └── migrations/                  # Auto-generated migrations
│   ├── src/
│   │   └── index.ts                     # Export PrismaClient singleton
│   ├── package.json
│   └── tsconfig.json
├── types/                               # Shared TypeScript types
│   ├── src/
│   │   ├── index.ts
│   │   ├── user.types.ts
│   │   ├── wallet.types.ts
│   │   ├── savings.types.ts
│   │   ├── transaction.types.ts
│   │   ├── verification.types.ts
│   │   └── api.types.ts                 # Request/Response DTOs
│   ├── package.json
│   └── tsconfig.json
├── validators/                          # Shared Zod schemas
│   ├── src/
│   │   ├── index.ts
│   │   ├── wallet.validators.ts
│   │   ├── savings.validators.ts
│   │   └── strict-savings.validators.ts
│   ├── package.json
│   └── tsconfig.json
└── config/                              # Shared tooling config
    ├── eslint/
    │   └── index.js
    ├── tsconfig/
    │   ├── base.json
    │   ├── nextjs.json
    │   └── node.json
    └── package.json
```
