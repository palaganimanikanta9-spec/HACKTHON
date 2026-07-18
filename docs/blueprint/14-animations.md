# 14 — Animation System

## 14.1 Animation Philosophy

Animations in SmartSave serve three purposes:
1. **Reinforce meaning** — Money moving should feel like it's moving
2. **Communicate status** — AI verification steps should feel live
3. **Delight** — The experience should feel alive and premium

**Rules:**
- Never animate for more than 400ms (users want to use the app, not watch it)
- Always respect `prefers-reduced-motion`
- Entrance animations play once per session (not on every re-render)
- Error states animate to draw attention, not celebrate

---

## 14.2 Framer Motion Variant Library

```typescript
// lib/animations.ts

import { Variants, Transition } from 'framer-motion';

// ── Transitions ────────────────────────────────────────────

export const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} satisfies Transition;

export const smooth = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],  // Material Design standard easing
  duration: 0.25,
} satisfies Transition;

export const snappy = {
  type: 'tween',
  ease: [0.4, 0, 0.6, 1],
  duration: 0.15,
} satisfies Transition;

// ── Page Transitions ───────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
};

export const pageTransition: Transition = {
  duration: 0.20,
  ease: [0.4, 0, 0.2, 1],
};

// ── Card Entrance ──────────────────────────────────────────

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const cardTransition: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],  // Expo ease-out
};

// ── Stagger Children ───────────────────────────────────────

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: smooth },
};

// ── List Items ─────────────────────────────────────────────

export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 16 },
};

// ── Balance Reveal ─────────────────────────────────────────

export const balanceVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)', scale: 0.95 },
  visible: { opacity: 1, filter: 'blur(0px)', scale: 1 },
};

export const balanceMaskedVariants: Variants = {
  visible: { opacity: 1, filter: 'blur(0px)' },
  hidden:  { opacity: 0.3, filter: 'blur(6px)' },
};

// ── Modal ──────────────────────────────────────────────────

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, y: '100%' },         // Slides up from bottom (mobile sheet)
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: '100%' },
};

export const modalTransition: Transition = {
  type: 'spring',
  damping: 30,
  stiffness: 300,
};

// ── Approval / Success ─────────────────────────────────────

export const successVariants: Variants = {
  initial: { scale: 0, opacity: 0, rotate: -10 },
  animate: { 
    scale: 1, opacity: 1, rotate: 0,
    transition: { type: 'spring', stiffness: 400, damping: 20 }
  },
};

// ── Rejection ──────────────────────────────────────────────

export const rejectionVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
};

export const shakeVariants: Variants = {
  shake: {
    x: [-8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

// ── Verification Steps ─────────────────────────────────────

export const stepVariants: Variants = {
  pending:    { opacity: 0.4, scale: 0.97 },
  active:     { opacity: 1, scale: 1 },
  completed:  { opacity: 1, scale: 1 },
};

// ── Tab / Navigation ───────────────────────────────────────

export const navItemVariants: Variants = {
  inactive: { scale: 1 },
  active:   { scale: 1.05 },
};

export const navIndicatorVariants: Variants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: { scaleX: 1, opacity: 1 },
  exit:    { scaleX: 0, opacity: 0 },
};

// ── Number Counting ────────────────────────────────────────
// Use useMotionValue + useSpring for smooth balance animations
// balance changes animate from old value to new value
```

---

## 14.3 Micro-Interactions Inventory

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Balance visibility toggle | blur-out/blur-in | 250ms | ease-in-out |
| Balance update (after transaction) | count up/down with spring | 800ms | spring(300, 30) |
| Card swipe (between wallet types) | horizontal slide + scale | 300ms | expo ease-out |
| Action button press | scale: 0.96 | 100ms | ease-out |
| Transaction item hover | background fade + translateX(4px) | 150ms | ease-out |
| Successful deposit | checkmark bounce | 400ms | spring |
| Withdrawal rejection | horizontal shake | 500ms | ease-in-out |
| Document drag-over | border glow + scale(1.01) | 100ms | ease |
| AI verification steps | sequential glow pulse | 2s loop | ease-in-out |
| Navigation tab switch | indicator slide | 200ms | spring |
| Number input focus | border glow expand | 200ms | ease-out |
| Page enter | fade up from y:16 | 200ms | ease-out |
| Modal sheet open | slide up from bottom | 300ms | spring(300, 30) |

---

## 14.4 Loading State Animations

```typescript
// Skeleton shimmer (CSS)
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    var(--bg-overlay) 50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// Framer Motion pulse for AI verification
const pulseVariants: Variants = {
  pulse: {
    opacity: [0.4, 1, 0.4],
    scale: [0.98, 1, 0.98],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
};
```

---

## 14.5 The Strict Savings Card Shimmer

The Strict Savings card gets a special animated shimmer to convey AI protection:

```css
@keyframes strict-shimmer {
  0%   { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(300%) rotate(30deg); }
}

.strict-savings-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 30%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(139, 92, 246, 0.15),
    transparent
  );
  animation: strict-shimmer 4s ease-in-out infinite;
  pointer-events: none;
}
```

---

## 14.6 Reduced Motion Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```typescript
// In Framer Motion components
import { useReducedMotion } from 'framer-motion';

function AnimatedCard() {
  const shouldReduce = useReducedMotion();
  
  return (
    <motion.div
      variants={shouldReduce ? {} : cardVariants}
      initial="initial"
      animate="animate"
    />
  );
}
```

---

## 14.7 AI Verification Step Animation

The three-step verification process uses a sequential animation:

```typescript
// VerificationStatus.tsx
const steps = [
  { id: 'ocr', label: 'Reading document (OCR)', icon: FileSearch },
  { id: 'ai', label: 'AI analyzing expense', icon: Brain },
  { id: 'decision', label: 'Making decision', icon: Scale },
];

// Each step glows and pulses when active
// Previous steps show a check mark with a satisfying spring animation
// The final step either shows ✅ (approved) or ❌ (rejected) with distinct animations
```
