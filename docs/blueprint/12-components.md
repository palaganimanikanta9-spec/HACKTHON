# 12 — Component Hierarchy

## 12.1 Component Tree Overview

```
<AppProviders>                        ← ClerkProvider + QueryProvider + ThemeProvider
  <RootLayout>                        ← HTML + fonts + global CSS
    
    // Auth Group
    <AuthLayout>                      ← Centered, branded background
      <SignInPage>
        <ClerkSignIn />               ← Pre-built Clerk component
      </SignInPage>
      <SignUpPage>
        <ClerkSignUp />
      </SignUpPage>
    </AuthLayout>
    
    // Dashboard Group
    <DashboardLayout>                 ← App shell
      <TopBar>
        <BalanceSummaryChip />        ← Total portfolio value
        <ThemeToggle />
        <UserAvatarButton />          ← Clerk UserButton
      </TopBar>
      
      <PageWrapper>                   ← AnimatePresence wrapper
        {/* Slot: current page */}
      </PageWrapper>
      
      <BottomNavigation>
        <NavItem icon={Wallet} />
        <NavItem icon={PiggyBank} />
        <NavItem icon={Shield} badge="AI" />
        <NavItem icon={Settings} />
      </BottomNavigation>
    </DashboardLayout>
  </RootLayout>
</AppProviders>
```

---

## 12.2 Main Wallet Page Components

```
<WalletPage>
  <WalletCard>                        ← Hero card with glassmorphism
    <WalletCard.Background />         ← Animated gradient background
    <WalletCard.Label />              ← "Main Wallet"
    <WalletCard.Balance              
      amount={balance}
      isVisible={showBalance} />      ← Toggle visibility (eye icon)
    <WalletCard.Currency />           ← "USD"
    <WalletCard.ToggleVisibility />   ← 👁 button
  </WalletCard>
  
  <WalletActions>                     ← Action buttons row
    <ActionButton icon={Send} href="/wallet/send" />
    <ActionButton icon={Download} href="/wallet/receive" />
    <ActionButton icon={History} href="/wallet/history" />
  </WalletActions>
  
  <TransactionList limit={5}>
    <TransactionList.Header>
      Recent Transactions
      <Link href="/wallet/history">See all</Link>
    </TransactionList.Header>
    <TransactionList.Loading />       ← Skeleton state
    <TransactionList.Empty />         ← Empty state
    <TransactionList.Items>
      <TransactionItem
        type="SEND"
        amount="-$50.00"
        counterparty="John Doe"
        date="Today, 2:30 PM"
        status="COMPLETED"
      />
    </TransactionList.Items>
  </TransactionList>
</WalletPage>
```

---

## 12.3 Strict Savings Page Components

```
<StrictSavingsPage>
  <StrictSavingsCard>                 ← Premium dark card with shield
    <StrictSavingsCard.Header>
      <ShieldIcon />
      <AIBadge />                     ← "AI Protected" badge
    </StrictSavingsCard.Header>
    <StrictSavingsCard.Balance />
    <StrictSavingsCard.ThresholdInfo>
      <ThresholdBadge threshold={threshold} />
      <ThresholdTooltip />            ← Explains the threshold
    </StrictSavingsCard.ThresholdInfo>
  </StrictSavingsCard>
  
  <StrictSavingsActions>
    <ActionButton label="Deposit" icon={Plus} />
    <ActionButton label="Withdraw" icon={ArrowUp} variant="outlined" />
  </StrictSavingsActions>
  
  <HowItWorks>                        ← Collapsible explainer
    <HowItWorks.Step icon={DollarSign} title="Enter Amount" />
    <HowItWorks.Step icon={Upload} title="Upload Document" />
    <HowItWorks.Step icon={Brain} title="AI Verifies" />
    <HowItWorks.Step icon={CheckCircle} title="Get Approved" />
  </HowItWorks>
  
  <TransactionList />
</StrictSavingsPage>
```

---

## 12.4 Strict Savings Withdrawal Flow Components

```
// Step 1: /strict-savings/withdraw
<WithdrawPage>
  <PageHeader title="Withdraw from Strict Savings" />
  
  <StrictSavingsBalanceDisplay balance={balance} />
  
  <WithdrawalForm onSubmit={handleInitiate}>
    <AmountInput 
      value={amount}
      currency="USD"
      maxAmount={balance}
      onChange={setAmount}
    />
    <ThresholdInfo amount={amount} threshold={threshold} />
    {/* Shows: "Amounts above $500 are auto-approved" */}
    
    <SubmitButton loading={isLoading}>
      {amount > threshold ? 'Auto-Withdraw' : 'Request Withdrawal'}
    </SubmitButton>
  </WithdrawalForm>
</WithdrawPage>

// Step 2: /strict-savings/withdraw/verify
<VerifyPage>
  <PageHeader title="Verify Your Expense" />
  
  <VerificationExplainer />           ← Short explanation of what to upload
  
  <DocumentUpload
    accept="image/*,application/pdf"
    maxSize={10_485_760}             // 10MB
    onFileSelect={handleFileSelect}
    preview={true}                   ← Show preview of selected file
  >
    <DocumentUpload.Dropzone />
    <DocumentUpload.Preview />
    <DocumentUpload.Requirements>
      <Requirement>Clearly shows amount paid</Requirement>
      <Requirement>Date must be recent (within 30 days)</Requirement>
      <Requirement>Must be a legitimate business document</Requirement>
    </DocumentUpload.Requirements>
  </DocumentUpload>
  
  <ExpiryCountdown expiresAt={expiresAt} />  ← "⏱ 28:45 remaining"
  
  <SubmitButton loading={isUploading}>
    Submit for AI Verification
  </SubmitButton>
</VerifyPage>

// Step 3: /strict-savings/withdraw/result
<ResultPage>
  // Verifying state (polling)
  <VerificationStatus>
    <VerificationStatus.Step 
      label="Extracting document text (OCR)"
      status="completed"
    />
    <VerificationStatus.Step 
      label="AI analyzing expense"
      status="in-progress"
    />
    <VerificationStatus.Step 
      label="Making decision"
      status="pending"
    />
  </VerificationStatus>
  
  // Approved state
  <ApprovalResult>
    <SuccessAnimation />              ← Lottie or Framer Motion animation
    <ApprovalResult.Amount />
    <ApprovalResult.Reason classification={classification} />
    <ApprovalResult.TransactionId />
    <Button href="/wallet">View in Wallet</Button>
  </ApprovalResult>
  
  // Rejected state
  <RejectionResult>
    <RejectionAnimation />
    <RejectionResult.Title>Withdrawal Rejected</RejectionResult.Title>
    <RejectionResult.Reason reasoning={reasoning} />
    <RejectionResult.ClassificationBadge />  ← "Non-Essential"
    <RejectionResult.Actions>
      <Button variant="outline" onClick={retry}>Try Again</Button>
      <Button href="/strict-savings">Back to Savings</Button>
    </RejectionResult.Actions>
  </RejectionResult>
</ResultPage>
```

---

## 12.5 Shared Component Specifications

### AmountInput

```typescript
interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;           // Default: "USD"
  maxAmount?: Decimal;
  label?: string;
  error?: string;
  disabled?: boolean;
}
// Features:
// - Formats with comma separators as user types
// - Shows "Max" button to fill with available balance
// - Validates: positive, max 2 decimal places, not exceeding balance
// - Animated currency symbol
```

### TransactionItem

```typescript
interface TransactionItemProps {
  id: string;
  type: TransactionType;
  direction: 'CREDIT' | 'DEBIT';
  amount: string;
  balanceAfter: string;
  counterpartyName?: string;
  description?: string;
  status: TransactionStatus;
  createdAt: string;
  classification?: ExpenseClassification;  // For strict savings
}
// Features:
// - Color-coded: green for credits, red for debits
// - Animated entry (slide in from bottom)
// - Expandable to show full details on tap
// - AI badge for verified strict savings transactions
```

### DocumentUpload

```typescript
interface DocumentUploadProps {
  accept: string;
  maxSize: number;
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  preview?: boolean;
  disabled?: boolean;
}
// Features:
// - Drag and drop with visual feedback
// - File type validation with friendly error messages
// - Image preview for images, PDF icon for PDFs
// - Upload progress bar
// - Animated border on drag over
```

---

## 12.6 Component Design Principles

1. **Single Responsibility** — Each component does one thing
2. **Props over Context** — Pass data down via props except for truly global state
3. **Composition over Inheritance** — Use compound components for complex UI
4. **Accessible by Default** — All interactive elements have `aria-label`, keyboard navigation
5. **Mobile First** — All components designed for 375px width, scale up to 768px+
6. **Loading States Always** — Every async component has a skeleton fallback
7. **Error States Always** — Every async component has an error fallback
8. **Empty States Always** — Every list component has a meaningful empty state
