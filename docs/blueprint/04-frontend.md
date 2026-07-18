# 04 — Frontend Architecture

## 4.1 Technology Stack Rationale

| Technology | Version | Purpose | WHY |
|------------|---------|---------|-----|
| Next.js | 15 | React framework | App Router + RSC + Vercel native |
| TypeScript | 5.x | Type safety | Catch errors at compile time |
| Tailwind CSS | 3.x | Styling | Utility-first, no CSS file sprawl |
| shadcn/ui | latest | UI components | Accessible, unstyled base, copy-paste |
| Framer Motion | 11.x | Animations | Declarative, physics-based, React-first |
| Lucide React | latest | Icons | Consistent, tree-shakable icon library |
| TanStack Query | 5.x | Server state | Caching, invalidation, optimistic updates |
| Zustand | 4.x | Client state | Minimal, TypeScript-first |
| Clerk | latest | Auth UI | Pre-built components, hooks |
| Axios | 1.x | HTTP client | Interceptors, typed responses |

---

## 4.2 Next.js App Router Architecture

### Route Groups Strategy

```
app/
├── (auth)/           ← Route group: no app shell, centered layout
│   ├── sign-in/
│   └── sign-up/
└── (dashboard)/      ← Route group: full app shell with navigation
    ├── wallet/
    ├── savings/
    ├── strict-savings/
    └── settings/
```

**WHY route groups:**
- Different layouts for auth vs. app screens without URL pollution
- `(auth)` shows a minimal centered layout for sign-in/sign-up
- `(dashboard)` wraps all app screens with `BottomNavigation` + `TopBar`

### Server Components vs. Client Components

| Component Type | When to Use | Examples |
|---------------|-------------|---------|
| React Server Components (RSC) | Static data, no interactivity, no browser APIs | Page layouts, SEO content |
| Client Components (`"use client"`) | Interactivity, hooks, animations, browser APIs | Forms, modals, animated cards |
| Server Actions | Form mutations that don't need a full API route | Settings updates |

**Rule:** Default to Server Components. Only add `"use client"` when needed.

---

## 4.3 Data Fetching Strategy

### Server-Side (RSC)
```typescript
// app/(dashboard)/wallet/page.tsx
// Fetch initial balance server-side for instant paint
async function WalletPage() {
  const wallet = await fetchWallet(); // Direct DB or API call
  return <WalletClient initialData={wallet} />;
}
```

### Client-Side (TanStack Query)
```typescript
// hooks/use-wallet.ts
// After initial load, all real-time updates via TanStack Query
export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiClient.get('/api/wallet'),
    staleTime: 30_000, // 30s - balance refreshes every 30s
    refetchOnWindowFocus: true,
  });
}
```

**WHY TanStack Query:**
- Automatic background refetching
- Optimistic updates for instant UI feedback on transactions
- Request deduplication
- Proper loading/error states with no boilerplate

---

## 4.4 Rendering Modes

| Route | Rendering Mode | Reason |
|-------|---------------|--------|
| `/wallet` | SSR + Client hydration | Balance must be fresh, not cached |
| `/savings` | SSR + Client hydration | Same |
| `/strict-savings` | SSR + Client hydration | Same |
| `/strict-savings/withdraw/verify` | CSR only | Real-time upload + verification status |
| `/settings` | SSR | User settings rarely change |

---

## 4.5 Component Architecture Principles

### Compound Component Pattern (for complex UI)

```typescript
// Usage example: StrictSavingsCard compound
<StrictSavingsCard>
  <StrictSavingsCard.Header />
  <StrictSavingsCard.Balance />
  <StrictSavingsCard.Actions />
  <StrictSavingsCard.ProtectionBadge />
</StrictSavingsCard>
```

### Container/Presenter Pattern

```
containers/         ← Data fetching, business logic, state
  WalletContainer.tsx
    └── renders → WalletCard.tsx (pure display, receives props)
```

### Custom Hooks as the Logic Layer

All business logic lives in custom hooks — components are "dumb" presenters:

```typescript
// Hook owns all logic
function useStrictSavingsWithdrawal() {
  const [step, setStep] = useState<'amount' | 'upload' | 'verifying' | 'result'>('amount');
  const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest | null>(null);
  
  const initiateWithdrawal = useMutation(/* ... */);
  const uploadDocument = useMutation(/* ... */);
  
  return { step, withdrawalRequest, initiateWithdrawal, uploadDocument };
}

// Component is a thin presenter
function WithdrawPage() {
  const hook = useStrictSavingsWithdrawal();
  // Renders based on hook state only
}
```

---

## 4.6 Error Handling Strategy

```typescript
// Three-layer error handling:

// Layer 1: Error Boundaries (catches React render errors)
<ErrorBoundary fallback={<ErrorPage />}>
  <WalletPage />
</ErrorBoundary>

// Layer 2: TanStack Query error states
const { data, error, isError } = useWallet();
if (isError) return <ErrorState message={error.message} />;

// Layer 3: Form-level errors (Zod validation)
const { errors } = useForm({ resolver: zodResolver(withdrawSchema) });
```

---

## 4.7 Performance Strategy

| Technique | Application |
|----------|-------------|
| `next/image` | All images with automatic WebP conversion |
| Dynamic imports | Heavy components (DocumentUpload, VerificationStatus) |
| `React.memo` | TransactionItem (list item rendered many times) |
| `useCallback` + `useMemo` | Expensive formatters, event handlers in lists |
| Skeleton loading | All async data shows skeletons, never blank |
| Optimistic updates | Deposit/withdraw shows updated balance immediately |
| Prefetching | `router.prefetch()` on hover for key routes |

---

## 4.8 Theming Architecture

```css
/* globals.css - CSS Custom Properties Strategy */
:root {
  /* Light mode tokens */
  --color-background: 0 0% 100%;
  --color-surface: 0 0% 98%;
  --color-text-primary: 222 47% 11%;
  --color-accent-primary: 262 83% 58%;
  /* ... full design tokens */
}

[data-theme="dark"] {
  /* Dark mode overrides */
  --color-background: 222 47% 7%;
  --color-surface: 222 47% 11%;
  --color-text-primary: 210 40% 98%;
  --color-accent-primary: 262 83% 70%;
}
```

**WHY CSS Custom Properties over JS theme objects:**
- Zero JS overhead — native browser feature
- Works with server rendering without flash
- Framer Motion can animate CSS variables directly
- shadcn/ui already uses this pattern
