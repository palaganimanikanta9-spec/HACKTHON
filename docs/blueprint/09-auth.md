# 09 — Authentication Architecture

## 9.1 Clerk Integration Overview

**Clerk** handles the entire authentication lifecycle:

```
Registration → Email Verification → Sign In → Session Management → Sign Out
     │                                 │
     ▼                                 ▼
  Clerk UI              JWT issued, stored in httpOnly cookie
     │                                 │
     ▼                                 ▼
Clerk Webhook          Middleware verifies JWT on every API request
  → Create User DB record
```

**WHY Clerk over Auth.js/Supabase Auth:**
- Pre-built, beautiful UI components (sign-in, sign-up, user profile)
- Multi-factor authentication (MFA) out of the box
- Social login (Google, GitHub) with zero additional code
- Webhook system for syncing user data to our DB
- `clerkMiddleware` for Next.js App Router with zero config
- React hooks (`useUser`, `useAuth`, `useClerk`) ready to use
- Free tier is generous for a hackathon

---

## 9.2 Authentication Flow

### Web (Next.js)

```
1. User visits /wallet (protected route)
2. middleware.ts checks auth state via Clerk
3. If unauthenticated → redirect to /sign-in
4. If authenticated → serve page

// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});
```

### API Server

```
1. Frontend calls API with Bearer token (Clerk JWT)
   Headers: Authorization: Bearer <clerk_jwt>

2. Express middleware verifies token
   // middleware/auth.ts
   import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
   router.use(ClerkExpressRequireAuth());

3. Middleware attaches user info to req
   req.auth.userId → Clerk user ID
   req.auth.sessionId → Session ID

4. Controller looks up DB user by clerkId
   const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });
```

---

## 9.3 User Sync Architecture

When Clerk creates a user, we need a corresponding record in our PostgreSQL database. This is handled via Clerk webhooks:

```typescript
// app/api/webhooks/clerk/route.ts

import { Webhook } from 'svix';  // Clerk uses svix for webhook signature verification

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
  
  // Verify webhook signature (CRITICAL — prevents fake webhook attacks)
  const wh = new Webhook(webhookSecret);
  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };
  
  const event = wh.verify(payload, headers) as ClerkWebhookEvent;
  
  switch (event.type) {
    case 'user.created':
      await handleUserCreated(event.data);
      break;
    case 'user.updated':
      await handleUserUpdated(event.data);
      break;
    case 'user.deleted':
      await handleUserDeleted(event.data);
      break;
  }
  
  return new Response('OK', { status: 200 });
}

async function handleUserCreated(data: ClerkUser) {
  // Create user + all three wallet/savings accounts atomically
  await prisma.$transaction([
    prisma.user.create({
      data: {
        clerkId: data.id,
        email: data.email_addresses[0].email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.image_url,
      }
    }),
    // Main wallet, Normal Savings, Strict Savings created automatically
    // via Prisma's cascade/create from User relation... or explicit creates
  ]);
}
```

---

## 9.4 JWT Claims & User Context

```typescript
// The Clerk JWT contains:
{
  "sub": "user_2abc123",        // Clerk user ID
  "sid": "sess_xyz",            // Session ID  
  "email": "user@example.com",
  "iat": 1720000000,
  "exp": 1720003600,
  "iss": "https://clerk.smartsave.app"
}

// Our API extracts userId from the JWT and looks up our internal user ID:
// clerkId → userId → wallet access
```

---

## 9.5 Authorization Model

**Current model:** Simple user-scoped access. Every resource query is scoped by `userId`.

```typescript
// Example: Always scope to authenticated user
const wallet = await prisma.mainWallet.findUnique({
  where: {
    userId: req.dbUser.id  // NEVER accept userId from request body
  }
});
```

**WHY this matters:** Never trust client-provided user IDs. Always derive the user from the verified JWT → DB user lookup. This prevents horizontal privilege escalation (user A accessing user B's wallet).

---

## 9.6 Session Management

| Aspect | Implementation |
|--------|---------------|
| Session storage | Clerk managed (httpOnly cookies on web) |
| Session expiry | Clerk default: 7 days, configurable |
| JWT expiry | Short-lived (1 hour), auto-refreshed by Clerk |
| Token rotation | Handled by Clerk SDK automatically |
| Sign out | `clerk.signOut()` → invalidates session server-side |
| Multi-device | Clerk supports concurrent sessions |

---

## 9.7 Environment Variables

```bash
# .env.local (Frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/wallet
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# .env (Backend)
CLERK_SECRET_KEY=sk_live_...
```

---

## 9.8 Onboarding Flow (Post-Sign-Up)

```
Sign Up Complete
      │
      ▼
Clerk Webhook: user.created fires
      │
      ▼
DB: Create User + MainWallet + NormalSavings + StrictSavings
(all start at $0 balance)
      │
      ▼
Frontend redirects to /onboarding
      │
      ▼
Onboarding page:
  - Welcome message + product tour
  - Set Strict Savings threshold (default: $500)
  - Fund Main Wallet (simulated: add demo funds)
  - Complete onboarding → redirect to /wallet
```
