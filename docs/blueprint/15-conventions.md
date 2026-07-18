# 15 — Naming Conventions & Coding Standards

## 15.1 File Naming Conventions

| Type | Convention | Examples |
|------|-----------|---------|
| React Components | PascalCase `.tsx` | `WalletCard.tsx`, `TransactionItem.tsx` |
| Pages (Next.js) | lowercase `page.tsx` | `page.tsx`, `layout.tsx` |
| Hooks | camelCase `use-*.ts` | `use-wallet.ts`, `use-strict-savings.ts` |
| Utilities | kebab-case `.ts` | `api-client.ts`, `format.ts` |
| Types | kebab-case `.types.ts` | `wallet.types.ts`, `api.types.ts` |
| Validators | kebab-case `.validators.ts` | `strict-savings.validators.ts` |
| Stores | kebab-case `.store.ts` | `wallet-store.ts`, `ui-store.ts` |
| Constants | kebab-case `.constants.ts` | `app.constants.ts` |
| API routes | kebab-case `.routes.ts` | `wallet.routes.ts` |
| Services | kebab-case `.service.ts` | `wallet.service.ts`, `mcp.service.ts` |
| Controllers | kebab-case `.controller.ts` | `wallet.controller.ts` |
| Middleware | kebab-case `.middleware.ts` | `auth.middleware.ts` |
| Prisma Schema | `schema.prisma` | (singular, one file) |
| Migrations | Prisma auto-generated | `20240101_initial_migration` |
| Tests | `*.test.ts` / `*.spec.ts` | `wallet.service.test.ts` |

---

## 15.2 Folder Naming Conventions

| Type | Convention | Examples |
|------|-----------|---------|
| App route folders | lowercase, kebab-case | `strict-savings/`, `wallet/` |
| Component folders | PascalCase | `WalletCard/`, `TransactionItem/` |
| Feature folders | camelCase | `wallet/`, `savings/`, `strictSavings/` |
| Package folders | kebab-case | `mcp-ocr/`, `mcp-ai-verification/` |
| Utility folders | camelCase | `utils/`, `lib/`, `hooks/` |
| Config folders | camelCase | `configs/`, `middleware/` |

---

## 15.3 TypeScript Conventions

### Type Naming

```typescript
// Interfaces: PascalCase, describe shape
interface WalletBalance { balance: string; currency: string; }

// Types/Unions: PascalCase
type TransactionType = 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAWAL';

// Enums: PascalCase with SCREAMING_SNAKE members
enum WalletAction { SEND = 'SEND', RECEIVE = 'RECEIVE' }

// Generic type parameters: single capital letter or descriptive
type ApiResponse<TData> = { success: true; data: TData } | { success: false; error: ApiError };

// DTOs (Data Transfer Objects): suffix with Dto
interface CreateWithdrawalDto { amount: string; requestId: string; }

// Props interfaces: suffix with Props
interface WalletCardProps { balance: string; isVisible: boolean; }

// Zod schemas: suffix with Schema
const withdrawalSchema = z.object({ amount: z.string() });
type WithdrawalInput = z.infer<typeof withdrawalSchema>;
```

### Import Order

```typescript
// 1. React/Next.js core
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Shield, ArrowUp } from 'lucide-react';

// 3. Internal packages (@smartsave/*)
import type { StrictSavings } from '@smartsave/types';
import { withdrawalSchema } from '@smartsave/validators';

// 4. App-level imports (absolute paths)
import { useStrictSavings } from '@/hooks/use-strict-savings';
import { StrictSavingsCard } from '@/components/strict-savings/StrictSavingsCard';

// 5. Relative imports
import { VerificationStatus } from './VerificationStatus';

// 6. Styles (if not using Tailwind)
import styles from './StrictSavingsPage.module.css';
```

---

## 15.4 React Component Standards

### Component Template

```typescript
// components/wallet/WalletCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cardVariants, cardTransition } from '@/lib/animations';

// 1. Props interface (always explicit)
interface WalletCardProps {
  balance: string;
  currency?: string;        // Optional with default
  isLoading?: boolean;
  className?: string;       // Always accept className for composability
}

// 2. Component (named export, not default for better tree-shaking)
export function WalletCard({
  balance,
  currency = 'USD',
  isLoading = false,
  className,
}: WalletCardProps) {
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);
  
  // 3. All hooks at the top
  // 4. Derived values next
  const formattedBalance = isBalanceVisible ? formatCurrency(balance) : '••••••';
  
  // 5. Handlers after derived values
  const handleToggleVisibility = () => setIsBalanceVisible(v => !v);
  
  // 6. Return JSX
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={cardTransition}
      className={cn('wallet-card p-5 rounded-2xl', className)}
    >
      {/* JSX */}
    </motion.div>
  );
}

// 7. Default export at the bottom (optional — named exports preferred)
export default WalletCard;
```

### Rules

- **No barrel exports (`index.ts`) in component folders** — causes circular dependency issues with Next.js
- **No default exports in hooks** — named exports only
- **No any types** — use `unknown` and type guards
- **No non-null assertions (`!`)** — use proper nullish coalescing and type guards
- **Always type async functions' return values**

---

## 15.5 API/Backend Standards

### Controller Pattern

```typescript
// controllers/wallet.controller.ts

class WalletController {
  getBalance = async (req: AuthRequest, res: Response) => {
    // 1. Extract validated input (Zod middleware runs before controller)
    const { userId } = req.auth;
    
    // 2. Call service
    const balance = await this.walletService.getBalance(userId);
    
    // 3. Return standardized response
    return res.json(successResponse(balance));
  };
}

// All controllers: one method per endpoint, thin logic, delegate to service
```

### Service Standards

```typescript
// services/wallet.service.ts

class WalletService {
  // 1. All public methods have explicit return types
  async getBalance(userId: string): Promise<WalletBalance> {
    // 2. Service validates DB existence (not controller's job)
    const wallet = await prisma.mainWallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) throw new NotFoundError('Main wallet not found');
    
    // 3. Return domain objects, not raw Prisma types
    return {
      id: wallet.id,
      balance: wallet.balance.toString(),
      currency: wallet.currency,
    };
  }
}
```

---

## 15.6 Git Conventions

### Branch Naming

```
feature/wallet-send-flow
feature/strict-savings-withdrawal
fix/balance-decimal-precision
chore/add-rate-limiting
docs/update-api-contracts
```

### Commit Messages (Conventional Commits)

```
feat(strict-savings): add AI verification step UI
fix(api): correct decimal precision in withdrawal amount
feat(mcp): implement OCR text extraction tool
fix(auth): handle clerk webhook signature verification
chore(deps): upgrade framer-motion to v11
docs(api): document withdrawal verification endpoints
test(services): add wallet service unit tests
```

### Pull Request Rules

- Require at least 1 review before merge
- All CI checks must pass (lint, type-check, build)
- No PR merges on Friday (fintech ops principle)
- Include screenshots for UI changes

---

## 15.7 Code Quality Tooling

```json
// .eslintrc.json (root)
{
  "extends": ["@smartsave/config/eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

```json
// turbo.json pipeline
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "lint": {},
    "type-check": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

---

## 15.8 Environment Variable Conventions

```bash
# Naming: SCREAMING_SNAKE_CASE
# Public (browser-exposed): NEXT_PUBLIC_ prefix
# Secrets: Never prefixed with NEXT_PUBLIC_

NEXT_PUBLIC_API_URL=https://api.smartsave.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Sensitive — server only
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
GOOGLE_VISION_API_KEY=...
MCP_API_KEY=...
```
