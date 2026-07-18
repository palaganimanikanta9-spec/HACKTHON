# 01 — Project Vision & Product Strategy

## 1.1 Executive Summary

**SmartSave AI Wallet** is a next-generation personal finance application that combines intelligent spending guardrails with AI-powered document verification to help users build healthy financial habits. It is designed as a consumer-first product — not a bank — that sits on top of existing financial infrastructure and adds a behavioral intelligence layer.

The core insight: most people fail at saving not because they lack income, but because they lack friction at the point of spending. SmartSave creates *intentional friction* for protected savings while keeping everyday spending frictionless.

---

## 1.2 Problem Statement

| Problem | Current Reality | SmartSave Solution |
|---------|-----------------|-------------------|
| Impulsive spending | No friction between savings and spending | Strict Savings with AI verification |
| Weak savings discipline | Easy to withdraw from savings anytime | Tiered savings with behavioral locks |
| No spending justification | Users never justify withdrawals | Mandatory document-upload + OCR + LLM classification |
| Poor financial visibility | Fragmented view of money | Unified wallet dashboard |

---

## 1.3 Product Vision

> *"SmartSave is the financial accountability partner that lives in your pocket — it knows when to let money flow freely and when to make you prove your spending is worth it."*

**Mission:** Empower users to build lasting wealth by creating smart, AI-enforced boundaries around their savings.

**Target Users:**
- Millennials and Gen Z (ages 18–35) who struggle with saving consistently
- Working professionals who want automated savings discipline
- Anyone who has broken their savings commitment in the past

---

## 1.4 Core Value Propositions

1. **Frictionless Daily Spending** — Main Wallet operates like a modern digital wallet (Revolut/Google Pay UX)
2. **Flexible Savings** — Normal Savings for accessible, interest-bearing savings with no restrictions
3. **AI-Enforced Strict Savings** — The flagship feature: document-upload → OCR → LLM classification → approve/reject withdrawal
4. **Premium Experience** — Feels like a fintech unicorn, not a hackathon demo

---

## 1.5 Key Differentiators

| Feature | SmartSave | Traditional Bank | Revolut | Monzo |
|---------|-----------|-----------------|---------|-------|
| AI Withdrawal Verification | ✅ | ❌ | ❌ | ❌ |
| OCR Document Verification | ✅ | ❌ | ❌ | ❌ |
| Strict Savings Locks | ✅ | ❌ | ✅ (Basic) | ✅ (Basic) |
| Behavioral AI | ✅ | ❌ | ❌ | ❌ |
| Threshold-Based Auto Transfer | ✅ | ❌ | ❌ | ❌ |

---

## 1.6 Business Model (Post-Hackathon Roadmap)

- **Freemium:** Free for core features, premium for advanced AI analytics
- **Revenue Share:** Interest spread on Normal Savings (via banking-as-a-service partner)
- **Premium Subscriptions:** Advanced AI reports, custom spending rules, multiple strict savings vaults
- **B2B:** White-label the AI verification engine for enterprise HR savings plans

---

## 1.7 Success Metrics

| Metric | Definition | Target (3 months) |
|--------|-----------|-------------------|
| DAU/MAU | Daily vs Monthly active users | >40% |
| Savings Retention | Users who keep money in Strict Savings >30 days | >65% |
| AI Verification Accuracy | % of correct essential/non-essential classifications | >92% |
| Withdrawal Rejection Rate | % of non-essential withdrawals correctly blocked | >85% |
| Onboarding Completion | % of users who complete setup | >80% |

---

## 1.8 Product Scope (Hackathon v1.0)

### In Scope
- [x] User registration & authentication (Clerk)
- [x] Main Wallet: balance, send, receive, transaction history
- [x] Normal Savings: deposit, withdraw (no restrictions)
- [x] Strict Savings: deposit, AI-gated withdrawal
- [x] OCR MCP Server: document text extraction
- [x] AI Verification MCP Server: expense classification
- [x] Real-time transaction ledger
- [x] Premium dark/light mode UI

### Out of Scope (v1.0)
- [ ] Real banking integrations (Plaid, Stripe)
- [ ] Interest calculations
- [ ] Multi-currency
- [ ] Push notifications
- [ ] Mobile apps (iOS/Android)
- [ ] Admin dashboard
