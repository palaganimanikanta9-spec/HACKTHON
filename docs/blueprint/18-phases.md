# 18 — Development Phases & Roadmap

## 18.1 Hackathon Sprint Plan (3-Day Timeline)

### Day 1: Foundation & Infrastructure

**Morning (Hours 1–4): Project Setup**
```
[ ] Initialize Turborepo monorepo
[ ] Create Next.js 15 app (apps/web)
[ ] Create Express API app (apps/api)
[ ] Create MCP server apps (mcp-ocr, mcp-ai-verification)
[ ] Set up shared packages (types, validators, db)
[ ] Configure TypeScript, ESLint, Prettier
[ ] Configure Tailwind CSS + shadcn/ui init
[ ] Set up Clerk (create app, get keys)
[ ] Set up Railway PostgreSQL database
[ ] Apply Prisma schema + initial migration
[ ] Set up Vercel project
```

**Afternoon (Hours 4–8): Auth + DB + Core UI Shell**
```
[ ] Implement Clerk authentication (sign-in, sign-up pages)
[ ] Implement Clerk webhook → user creation in DB
[ ] Create DashboardLayout (TopBar + BottomNavigation + PageWrapper)
[ ] Implement theme system (CSS variables, ThemeProvider)
[ ] Create design system tokens (globals.css)
[ ] Implement API middleware (auth, error handling, rate limiting)
[ ] Create Prisma service singleton
[ ] Set up TanStack Query + Zustand stores
[ ] Create API client (axios wrapper with auth interceptors)
```

**Evening (Hours 8–12): Main Wallet Feature**
```
[ ] WalletCard component (glassmorphism, balance display)
[ ] WalletActions component (Send/Receive/History buttons)
[ ] GET /api/v1/wallet endpoint
[ ] POST /api/v1/wallet/send endpoint
[ ] POST /api/v1/wallet/receive endpoint
[ ] TransactionItem + TransactionList components
[ ] GET /api/v1/wallet/transactions endpoint
[ ] useWallet hook + TanStack Query integration
[ ] Send money form + UI flow
[ ] Receive money QR display
[ ] Page animations (Framer Motion variants)
```

---

### Day 2: Savings Features + AI Backend

**Morning (Hours 12–16): Normal Savings**
```
[ ] NormalSavings data model (already in Prisma schema)
[ ] SavingsCard component (green gradient)
[ ] DepositForm + WithdrawForm components
[ ] GET/POST /api/v1/savings/normal endpoints
[ ] useNormalSavings hook
[ ] Deposit/Withdraw transaction logic with DB transactions
[ ] Normal savings transaction history
```

**Afternoon (Hours 16–20): MCP Servers**
```
[ ] Set up MCP SDK in both servers
[ ] OCR MCP Server:
    [ ] extract_document_text tool implementation
    [ ] Google Cloud Vision API integration
    [ ] Tesseract.js fallback
    [ ] Text cleaning utilities
[ ] AI Verification MCP Server:
    [ ] classify_expense tool implementation
    [ ] OpenAI GPT-4o integration (structured output)
    [ ] Classification prompt engineering
    [ ] Zod response validation
    [ ] Prompt injection safeguards
[ ] HTTP transport setup for both MCP servers
[ ] MCP client integration in Express API
[ ] API key authentication between API and MCP servers
[ ] Test OCR with sample receipts
[ ] Test AI classification with various expense types
```

**Evening (Hours 20–24): Strict Savings + Verification Flow**
```
[ ] StrictSavings data model (already in Prisma schema)
[ ] StrictSavingsCard component (dark gradient + shimmer)
[ ] POST /api/v1/savings/strict/withdraw/initiate endpoint
    [ ] Threshold comparison logic
    [ ] Auto-approval path
    [ ] Verification-required path (create WithdrawalRequest)
[ ] POST /api/v1/savings/strict/withdraw/verify endpoint
    [ ] Multer file upload handling
    [ ] Magic bytes validation
    [ ] MCP orchestration (OCR → AI)
    [ ] DB transaction (approve/reject + transfer)
[ ] GET /api/v1/savings/strict/withdraw/requests/:id endpoint
[ ] WithdrawalForm component (Step 1: amount input)
[ ] Threshold display logic ("Auto-approve above $X")
```

---

### Day 3: Verification UI + Polish + Deploy

**Morning (Hours 24–28): Verification UI Flow**
```
[ ] DocumentUpload component (drag-and-drop, preview)
[ ] VerificationStatus component (3-step animated status)
[ ] ApprovalResult component (success animation)
[ ] RejectionResult component (shake animation + reasoning)
[ ] ExpiryCountdown component (30-minute timer)
[ ] useStrictSavingsWithdrawal hook (full flow orchestration)
[ ] Verification flow routing (/withdraw → /verify → /result)
[ ] Request status polling (TanStack Query refetchInterval)
[ ] Verification store persistence (survive page refresh)
```

**Afternoon (Hours 28–32): Settings + Onboarding**
```
[ ] Onboarding wizard page
    [ ] Welcome + product intro
    [ ] Set strict savings threshold
    [ ] Add demo funds to main wallet
[ ] Settings page
    [ ] Threshold adjustment
    [ ] Theme toggle
    [ ] User profile (Clerk UserProfile component)
[ ] PATCH /api/v1/savings/strict/threshold endpoint
```

**Evening (Hours 32–36): Polish + Deploy**
```
[ ] Skeleton loading states for all async components
[ ] Empty states for all lists
[ ] Error boundaries at page level
[ ] Mobile responsiveness audit (375px, 390px, 428px)
[ ] Dark mode → light mode switch
[ ] Page transition animations
[ ] Balance counter animations
[ ] Final UI polish (spacing, typography, shadows)
[ ] Deploy API to Railway
[ ] Deploy MCP servers to Railway
[ ] Deploy frontend to Vercel
[ ] Set all environment variables in production
[ ] End-to-end testing of full strict savings flow
[ ] Record demo video of AI verification in action
```

---

## 18.2 Feature Priority Matrix

| Feature | Priority | Day | Effort |
|---------|----------|-----|--------|
| Auth (Clerk) | P0 | 1 | Low |
| Main Wallet UI | P0 | 1 | Medium |
| Send/Receive Money | P0 | 1 | Medium |
| Transaction History | P0 | 1 | Low |
| Normal Savings | P1 | 2 | Low |
| OCR MCP Server | P0 | 2 | Medium |
| AI Verification MCP | P0 | 2 | High |
| Strict Savings Withdrawal | P0 | 2-3 | High |
| Document Upload UI | P0 | 3 | Medium |
| Verification Status UI | P0 | 3 | Medium |
| Approval/Rejection Result | P0 | 3 | Low |
| Onboarding | P1 | 3 | Low |
| Settings | P2 | 3 | Low |
| Animations | P1 | 3 | Medium |
| Dark/Light Mode | P1 | 3 | Low |

---

## 18.3 Demo Scenario Script

For the hackathon demo, the following scenario showcases all features:

```
1. SIGN UP
   → User registers with email
   → Completes onboarding, sets threshold at $200
   → Main Wallet shows $0 balance

2. FUND THE WALLET (Demo)
   → Simulate receiving $1,000 to Main Wallet
   → Transaction appears in history with animation

3. SAVE MONEY
   → Deposit $300 to Normal Savings
   → Deposit $500 to Strict Savings
   → Show both savings cards with balances

4. NORMAL WITHDRAWAL (No restrictions)
   → Withdraw $50 from Normal Savings
   → Instantly transfers to Main Wallet
   → Balance updates with animation

5. STRICT SAVINGS — AUTO APPROVE (Amount > $200 threshold)
   → Try to withdraw $300 from Strict Savings
   → Since $300 > $200 threshold: auto-approved instantly
   → Money appears in Main Wallet

6. STRICT SAVINGS — AI VERIFICATION (Amount <= $200 threshold)
   → Try to withdraw $150 from Strict Savings
   → System says: "Verification required"
   → SCENARIO A (Essential): Upload a hospital bill
     → OCR extracts text
     → AI classifies: "Essential — Medical expense"
     → Approved! Money transferred
   → SCENARIO B (Non-Essential): Upload a restaurant receipt
     → OCR extracts text
     → AI classifies: "Non-Essential — Dining/Entertainment"
     → Rejected with reason displayed

7. THEME TOGGLE
   → Switch between dark and light mode
```

---

## 18.4 Post-Hackathon Roadmap

### v1.1 (Week 2-4)
- [ ] Real-time balance updates via WebSocket
- [ ] Push notifications (Expo Notifications prep)
- [ ] Multiple Strict Savings vaults
- [ ] Savings goals with progress tracking
- [ ] Spending analytics charts

### v1.2 (Month 2)
- [ ] Banking integration (Plaid for account linking)
- [ ] Real money movement (Stripe Treasury)
- [ ] Interest on savings (partnership with NBFC)
- [ ] Budget categories

### v2.0 (Month 3-6)
- [ ] Mobile app (React Native + Expo)
- [ ] AI spending insights ("You spent 40% more on food this month")
- [ ] Group savings (save together with friends)
- [ ] Gamification (savings streaks, badges)
- [ ] B2B white-label API for employers

---

## 18.5 Definition of Done (Per Feature)

A feature is only "done" when:
- [ ] API endpoint is tested (curl or Postman)
- [ ] UI renders correctly at 375px (iPhone SE)
- [ ] Loading state (skeleton) is implemented
- [ ] Error state is implemented
- [ ] Empty state is implemented (for lists)
- [ ] Animations are smooth (no jank)
- [ ] Works in both dark mode and light mode
- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes with zero errors

---

## 18.6 Environment Setup Checklist

```bash
# Required accounts and API keys before starting:

[ ] Clerk account + application (free tier OK)
    → NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    → CLERK_SECRET_KEY
    → CLERK_WEBHOOK_SECRET (set up webhook to /api/webhooks/clerk)

[ ] Railway account
    → PostgreSQL database (free trial)
    → DATABASE_URL

[ ] OpenAI API account
    → OPENAI_API_KEY (GPT-4o access needed)

[ ] Google Cloud Platform account
    → Enable Cloud Vision API
    → GOOGLE_VISION_API_KEY

[ ] Vercel account (connect GitHub repo)
    → NEXT_PUBLIC_API_URL (Railway API URL)

# Generate:
[ ] MCP_API_KEY (generate with: node -e "console.log(require('crypto').randomUUID())")
```
