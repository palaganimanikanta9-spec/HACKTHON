# 10 — Routing & Navigation Architecture

## 10.1 Route Map

```
/                           → Redirect to /wallet (if auth'd) or /sign-in
/sign-in                    → Clerk sign-in component
/sign-up                    → Clerk sign-up component
/onboarding                 → First-time setup wizard
/wallet                     → Main Wallet dashboard
/wallet/send                → Send money form
/wallet/receive             → Receive money (QR code)
/wallet/history             → Full transaction history
/savings                    → Normal Savings dashboard
/savings/deposit            → Deposit to Normal Savings
/savings/withdraw           → Withdraw from Normal Savings
/strict-savings             → Strict Savings dashboard
/strict-savings/deposit     → Deposit to Strict Savings
/strict-savings/withdraw    → Step 1: Enter withdrawal amount
/strict-savings/withdraw/verify   → Step 2: Upload document
/strict-savings/withdraw/result   → Step 3: Approval/Rejection result
/settings                   → User settings (threshold, profile)
```

---

## 10.2 Next.js App Router Layout Hierarchy

```
RootLayout (layout.tsx)
├── Providers (ClerkProvider, ThemeProvider, QueryProvider)
├── (auth) Layout (centered, no nav)
│   ├── /sign-in   → <SignIn />
│   └── /sign-up   → <SignUp />
└── (dashboard) Layout (app shell with navigation)
    ├── TopBar (balance summary, user avatar)
    ├── Page content (slot)
    └── BottomNavigation (wallet, savings, strict, settings)
```

**WHY Route Groups (`(auth)` and `(dashboard)`):**
- Auth pages need a completely different layout (centered, no navigation)
- Dashboard pages share the full app shell
- Route groups let Next.js apply different layouts to different URL segments without affecting the URLs themselves (`(auth)` doesn't appear in the URL)

---

## 10.3 Bottom Navigation Structure

```
┌────────────────────────────────────────┐
│                                        │
│           Page Content                 │
│                                        │
├────────────────────────────────────────┤
│  🪙 Wallet  │  💰 Savings │  🔐 Strict │ ⚙️ Settings │
└────────────────────────────────────────┘

Active states:
- /wallet/*         → Wallet tab active
- /savings/*        → Savings tab active  
- /strict-savings/* → Strict tab active
- /settings         → Settings tab active
```

---

## 10.4 Strict Savings Withdrawal — Multi-Step Routing

The withdrawal flow uses URL-based step management:

```
/strict-savings/withdraw
  → User enters amount → clicks "Withdraw"
  → API: initiateWithdrawal()
  
  IF auto-approved (amount > threshold):
    router.push('/strict-savings/withdraw/result?status=auto_approved&txId=...')
    
  IF verification required:
    router.push('/strict-savings/withdraw/verify?requestId=...')
    
/strict-savings/withdraw/verify?requestId=xxx
  → User uploads document
  → API: verifyWithdrawal()
  → router.push('/strict-savings/withdraw/result?requestId=...')
  
/strict-savings/withdraw/result?requestId=xxx
  → Poll API for final status
  → Show Approved or Rejected UI
```

**WHY URL-based step navigation:**
- Browser back button works correctly
- Deep-linkable (share specific step URL)
- State is preserved on page refresh via URL params
- No complex in-memory state machine needed

---

## 10.5 Protected Route Implementation

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

## 10.6 Navigation Component

```typescript
// components/layout/BottomNavigation.tsx

const navItems = [
  {
    label: 'Wallet',
    href: '/wallet',
    icon: Wallet,
    activeIcon: WalletFilled,
    match: /^\/wallet/,
  },
  {
    label: 'Savings',
    href: '/savings',
    icon: PiggyBank,
    activeIcon: PiggyBankFilled,
    match: /^\/savings/,
  },
  {
    label: 'Strict',
    href: '/strict-savings',
    icon: Shield,
    activeIcon: ShieldFilled,
    match: /^\/strict-savings/,
    badge: 'AI',  // AI badge on the strict savings tab
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    activeIcon: SettingsFilled,
    match: /^\/settings/,
  },
];
```

---

## 10.7 Page Transitions

All route changes use Framer Motion `AnimatePresence` for smooth page transitions:

```typescript
// app/(dashboard)/layout.tsx

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

---

## 10.8 Redirect Logic

```typescript
// app/page.tsx (root)
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const { userId } = await auth();
  
  if (userId) {
    // Check if onboarding is completed
    const user = await getUserByClerkId(userId);
    if (!user?.onboardingCompleted) {
      redirect('/onboarding');
    }
    redirect('/wallet');
  }
  
  redirect('/sign-in');
}
```

---

## 10.9 Error Pages

```
app/not-found.tsx     → 404 page with "Return to Wallet" button
app/error.tsx         → React error boundary, shows error with retry
app/(dashboard)/error.tsx → Dashboard-level error (keeps navigation visible)
```
