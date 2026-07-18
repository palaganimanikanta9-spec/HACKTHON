# 11 — State Management Architecture

## 11.1 State Taxonomy

State in SmartSave is divided into four categories with different management strategies:

| Category | Type | Manager | Examples |
|----------|------|---------|---------|
| **Server State** | Async, remote | TanStack Query | Balances, transactions, user profile |
| **UI State** | Ephemeral, local | Zustand | Modal open/closed, loading indicators |
| **Flow State** | Multi-step, session | Zustand | Withdrawal verification steps |
| **URL State** | Persistent, shareable | URL params | Current step, requestId |
| **Auth State** | External, managed | Clerk hooks | userId, isSignedIn, session |
| **Theme State** | Persistent | Zustand + localStorage | dark/light mode preference |

---

## 11.2 Server State (TanStack Query)

**WHY TanStack Query over custom fetch + useState:**
- Automatic caching with staleTime configuration
- Background refetching (balance auto-updates when window refocuses)
- Optimistic updates (show new balance immediately, roll back on error)
- Request deduplication (two components requesting balance → one network call)
- Built-in loading/error/success states
- Proper invalidation after mutations

```typescript
// Key Query Patterns

// 1. Wallet balance (stale after 30s, refetch on focus)
const useWalletBalance = () => useQuery({
  queryKey: ['wallet'],
  queryFn: () => api.get('/v1/wallet'),
  staleTime: 30_000,
  refetchOnWindowFocus: true,
});

// 2. Transactions (infinite pagination)
const useTransactions = (walletType: WalletType) => useInfiniteQuery({
  queryKey: ['transactions', walletType],
  queryFn: ({ pageParam }) => api.get(`/v1/${walletType}/transactions?page=${pageParam}`),
  getNextPageParam: (last) => last.meta.hasMore ? last.meta.page + 1 : undefined,
  staleTime: 60_000,
});

// 3. Withdrawal request status (fast polling during verification)
const useWithdrawalStatus = (requestId: string | null) => useQuery({
  queryKey: ['withdrawal-request', requestId],
  queryFn: () => api.get(`/v1/savings/strict/withdraw/requests/${requestId}`),
  enabled: !!requestId,
  refetchInterval: (data) => {
    // Poll every 2s while verifying, stop when done
    if (data?.status === 'VERIFYING') return 2_000;
    return false;
  },
});

// 4. Deposit mutation with optimistic update
const useDeposit = () => useMutation({
  mutationFn: (params: DepositParams) => api.post('/v1/savings/normal/deposit', params),
  onMutate: async (params) => {
    // Optimistic: immediately update displayed balance
    await queryClient.cancelQueries(['savings-normal']);
    const prev = queryClient.getQueryData(['savings-normal']);
    queryClient.setQueryData(['savings-normal'], (old: any) => ({
      ...old,
      balance: (parseFloat(old.balance) + parseFloat(params.amount)).toFixed(2)
    }));
    return { prev };
  },
  onError: (err, vars, ctx) => {
    // Roll back on error
    queryClient.setQueryData(['savings-normal'], ctx?.prev);
  },
  onSettled: () => {
    // Always refetch to get server truth
    queryClient.invalidateQueries(['savings-normal']);
    queryClient.invalidateQueries(['transactions', 'normal-savings']);
  }
});
```

---

## 11.3 UI Store (Zustand)

```typescript
// store/ui-store.ts

interface UIState {
  // Modal states
  isSendModalOpen: boolean;
  isReceiveModalOpen: boolean;
  isDepositModalOpen: boolean;
  isConfirmDialogOpen: boolean;
  confirmDialogConfig: ConfirmDialogConfig | null;
  
  // Toast notifications
  toasts: Toast[];
  
  // Loading states (for full-page loaders)
  isPageLoading: boolean;
  
  // Actions
  openSendModal: () => void;
  closeSendModal: () => void;
  openReceiveModal: () => void;
  closeReceiveModal: () => void;
  showConfirmDialog: (config: ConfirmDialogConfig) => void;
  hideConfirmDialog: () => void;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  setPageLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSendModalOpen: false,
  isReceiveModalOpen: false,
  isDepositModalOpen: false,
  isConfirmDialogOpen: false,
  confirmDialogConfig: null,
  toasts: [],
  isPageLoading: false,
  
  openSendModal: () => set({ isSendModalOpen: true }),
  closeSendModal: () => set({ isSendModalOpen: false }),
  // ...
  
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}));
```

---

## 11.4 Verification Flow Store (Zustand)

The strict savings withdrawal is a multi-step, stateful process:

```typescript
// store/verification-store.ts

type VerificationStep = 
  | 'idle'
  | 'entering-amount'
  | 'pending-upload'
  | 'uploading'
  | 'verifying'
  | 'approved'
  | 'rejected'
  | 'auto-approved';

interface VerificationState {
  step: VerificationStep;
  amount: string;
  requestId: string | null;
  expiresAt: string | null;
  
  // Results
  transactionId: string | null;
  classification: ClassificationResult | null;
  
  // Actions
  setAmount: (amount: string) => void;
  setRequestId: (id: string, expiresAt: string) => void;
  setStep: (step: VerificationStep) => void;
  setResult: (result: VerificationResult) => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      step: 'idle',
      amount: '',
      requestId: null,
      expiresAt: null,
      transactionId: null,
      classification: null,
      
      setAmount: (amount) => set({ amount, step: 'entering-amount' }),
      setRequestId: (requestId, expiresAt) => set({ requestId, expiresAt, step: 'pending-upload' }),
      setStep: (step) => set({ step }),
      setResult: (result) => set({
        step: result.status === 'APPROVED' ? 'approved' : 'rejected',
        transactionId: result.transactionId ?? null,
        classification: result.classification ?? null,
      }),
      reset: () => set({ step: 'idle', amount: '', requestId: null, expiresAt: null }),
    }),
    {
      name: 'verification-flow',
      partialize: (state) => ({ 
        step: state.step,
        requestId: state.requestId,
        expiresAt: state.expiresAt,
        amount: state.amount,
      }),
    }
  )
);
```

**WHY persist verification state:** If the user accidentally navigates away during upload, they can return to the same verification step without starting over.

---

## 11.5 Theme Store

```typescript
// store/ui-store.ts (theme slice)
type Theme = 'dark' | 'light' | 'system';

const useThemeStore = create<{ theme: Theme; setTheme: (t: Theme) => void }>()(
  persist(
    (set) => ({
      theme: 'dark',  // Default: dark mode (premium feel)
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', 
          theme === 'system' 
            ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            : theme
        );
      },
    }),
    { name: 'smartsave-theme' }
  )
);
```

---

## 11.6 State Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      Component Layer                      │
│  WalletPage  │  SavingsPage  │  StrictSavingsWithdraw   │
└──────┬───────┴───────┬───────┴──────────────┬────────────┘
       │               │                      │
       ▼               ▼                      ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ TanStack     │ │ Zustand      │ │ Zustand              │
│ Query        │ │ UI Store     │ │ Verification Store   │
│              │ │              │ │                      │
│ - wallet     │ │ - modals     │ │ - step               │
│ - savings    │ │ - toasts     │ │ - requestId          │
│ - txns       │ │ - loading    │ │ - result             │
│ - requests   │ │ - theme      │ │ (persisted)          │
│              │ │              │ │                      │
│ (network)    │ │ (ephemeral)  │ │ (sessionStorage)     │
└──────┬───────┘ └──────────────┘ └──────────────────────┘
       │
       ▼
   API Server
```

---

## 11.7 Query Key Strategy

Consistent, hierarchical query keys for proper invalidation:

```typescript
export const queryKeys = {
  wallet: () => ['wallet'] as const,
  walletTransactions: (filters?: TransactionFilters) => ['wallet', 'transactions', filters] as const,
  
  normalSavings: () => ['savings', 'normal'] as const,
  normalSavingsTransactions: () => ['savings', 'normal', 'transactions'] as const,
  
  strictSavings: () => ['savings', 'strict'] as const,
  strictSavingsTransactions: () => ['savings', 'strict', 'transactions'] as const,
  withdrawalRequest: (id: string) => ['savings', 'strict', 'withdrawal', id] as const,
  
  user: () => ['user'] as const,
} as const;

// Invalidate all savings data at once:
queryClient.invalidateQueries({ queryKey: ['savings'] }); // Matches all savings queries
```
