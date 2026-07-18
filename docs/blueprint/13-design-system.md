# 13 — Design System

## 13.1 Design Philosophy

SmartSave's design is inspired by **CRED**, **Revolut**, and **Apple Wallet** — premium, dark, minimal, and trustworthy. Every pixel communicates financial security and intelligence.

**Core Principles:**
- **Trust through Clarity** — Financial data is always legible and unambiguous
- **Premium through Restraint** — Less is more; every element earns its place
- **Intelligence through Subtlety** — AI features feel like natural extensions, not gimmicks
- **Delight through Motion** — Animations reinforce meaning, not distract

---

## 13.2 Color Palette

### Dark Mode (Default — Primary Experience)

```css
:root {
  /* ── Background Layers ──────────────────── */
  --bg-base:          #09090B;   /* Zinc 950 — page background */
  --bg-surface:       #18181B;   /* Zinc 900 — cards, panels */
  --bg-elevated:      #27272A;   /* Zinc 800 — dropdowns, modals */
  --bg-overlay:       #3F3F46;   /* Zinc 700 — hover states */
  
  /* ── Border / Dividers ──────────────────── */
  --border-subtle:    #27272A;   /* Zinc 800 */
  --border-default:   #3F3F46;   /* Zinc 700 */
  --border-strong:    #71717A;   /* Zinc 500 */
  
  /* ── Text ──────────────────────────────── */
  --text-primary:     #FAFAFA;   /* Zinc 50 — primary content */
  --text-secondary:   #A1A1AA;   /* Zinc 400 — secondary/labels */
  --text-tertiary:    #71717A;   /* Zinc 500 — placeholder, hints */
  --text-inverse:     #09090B;   /* On accent backgrounds */
  
  /* ── Accent / Brand ─────────────────────── */
  --accent-primary:   #8B5CF6;   /* Violet 500 — primary CTA */
  --accent-primary-h: #7C3AED;   /* Violet 600 — hover */
  --accent-primary-l: #A78BFA;   /* Violet 400 — lighter variant */
  --accent-secondary: #06B6D4;   /* Cyan 500 — secondary accent */
  
  /* ── Semantic Colors ────────────────────── */
  --success:          #10B981;   /* Emerald 500 — approved, credit */
  --success-bg:       rgba(16, 185, 129, 0.10);
  --success-border:   rgba(16, 185, 129, 0.30);
  
  --error:            #EF4444;   /* Red 500 — rejected, error, debit */
  --error-bg:         rgba(239, 68, 68, 0.10);
  --error-border:     rgba(239, 68, 68, 0.30);
  
  --warning:          #F59E0B;   /* Amber 500 — pending, caution */
  --warning-bg:       rgba(245, 158, 11, 0.10);
  --warning-border:   rgba(245, 158, 11, 0.30);
  
  --info:             #3B82F6;   /* Blue 500 — informational */
  --info-bg:          rgba(59, 130, 246, 0.10);
  
  /* ── Glassmorphism ──────────────────────── */
  --glass-bg:         rgba(255, 255, 255, 0.04);
  --glass-border:     rgba(255, 255, 255, 0.08);
  --glass-shadow:     0 8px 32px rgba(0, 0, 0, 0.4);
  
  /* ── Wallet Card Gradients ──────────────── */
  /* Main Wallet: Deep violet to indigo */
  --gradient-wallet:  linear-gradient(135deg, #4C1D95 0%, #312E81 50%, #1E1B4B 100%);
  
  /* Normal Savings: Teal to emerald */
  --gradient-savings: linear-gradient(135deg, #134E4A 0%, #065F46 50%, #064E3B 100%);
  
  /* Strict Savings: Near-black with subtle violet */
  --gradient-strict:  linear-gradient(135deg, #0D0D1A 0%, #1A0938 50%, #0D0D1A 100%);
  /* + animated shimmer overlay */
  
  /* AI Verification: Indigo to purple */
  --gradient-ai:      linear-gradient(135deg, #312E81 0%, #4C1D95 100%);
}
```

### Light Mode

```css
[data-theme="light"] {
  --bg-base:          #F8FAFC;   /* Slate 50 */
  --bg-surface:       #FFFFFF;   /* White */
  --bg-elevated:      #F1F5F9;   /* Slate 100 */
  --bg-overlay:       #E2E8F0;   /* Slate 200 */
  
  --border-subtle:    #E2E8F0;
  --border-default:   #CBD5E1;
  --border-strong:    #94A3B8;
  
  --text-primary:     #0F172A;   /* Slate 900 */
  --text-secondary:   #64748B;   /* Slate 500 */
  --text-tertiary:    #94A3B8;   /* Slate 400 */
  
  --glass-bg:         rgba(255, 255, 255, 0.70);
  --glass-border:     rgba(255, 255, 255, 0.90);
  --glass-shadow:     0 8px 32px rgba(15, 23, 42, 0.08);
}
```

---

## 13.3 Typography

### Font Stack

```css
/* Heading: Inter — clean, modern, financial authority */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* Monospace: JetBrains Mono — for amounts, transaction IDs */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
```

### Type Scale

```css
/* Type Scale: Major Third (1.25x) */

--text-xs:    0.75rem;    /* 12px — labels, badges, timestamps */
--text-sm:    0.875rem;   /* 14px — secondary content, descriptions */
--text-base:  1rem;       /* 16px — body text, form inputs */
--text-lg:    1.125rem;   /* 18px — emphasized body, card titles */
--text-xl:    1.25rem;    /* 20px — section headers */
--text-2xl:   1.5rem;     /* 24px — page headers */
--text-3xl:   1.875rem;   /* 30px — sub-hero content */
--text-4xl:   2.25rem;    /* 36px — wallet balance (main display) */
--text-5xl:   3rem;       /* 48px — hero amounts */
--text-6xl:   3.75rem;    /* 60px — full-screen balance display */
```

### Font Weight Usage

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Hint text, very secondary |
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, navigation items |
| Semibold | 600 | Card titles, button text |
| Bold | 700 | Section headers, emphasis |
| ExtraBold | 800 | Balance amounts |
| Black | 900 | Hero numbers (never body text) |

### Typography Examples

```css
/* Wallet Balance Display */
.balance-hero {
  font-family: var(--font-mono);   /* Monospace for number alignment */
  font-size: var(--text-5xl);
  font-weight: 800;
  letter-spacing: -0.02em;         /* Tight tracking for large numbers */
  font-variant-numeric: tabular-nums; /* Even digit spacing */
}

/* Transaction Amount */
.transaction-amount {
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Card Label */
.card-label {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.1em;           /* Wide tracking for labels */
  text-transform: uppercase;
}
```

---

## 13.4 Spacing System

8px base unit. All spacing is multiples of 4px.

```css
--space-0:    0;
--space-1:    0.25rem;   /* 4px */
--space-2:    0.5rem;    /* 8px */
--space-3:    0.75rem;   /* 12px */
--space-4:    1rem;      /* 16px — base unit */
--space-5:    1.25rem;   /* 20px */
--space-6:    1.5rem;    /* 24px */
--space-8:    2rem;      /* 32px */
--space-10:   2.5rem;    /* 40px */
--space-12:   3rem;      /* 48px */
--space-16:   4rem;      /* 64px */
--space-20:   5rem;      /* 80px */
--space-24:   6rem;      /* 96px */
```

### Layout Spacing

```
Mobile Screen (375px):
  Page padding:     --space-4 (16px)
  Card padding:     --space-5 (20px)
  Section gap:      --space-6 (24px)
  Component gap:    --space-3 (12px)
  Item gap:         --space-2 (8px)
  Bottom nav height: 72px (--space-18)
  Top bar height:    56px

Tablet/Desktop (768px+):
  Page padding:     --space-6 (24px)
  Max content width: 480px (centered)
```

---

## 13.5 Border Radius System

```css
--radius-sm:   0.25rem;  /* 4px — badges, chips */
--radius-md:   0.5rem;   /* 8px — inputs, buttons */
--radius-lg:   0.75rem;  /* 12px — cards */
--radius-xl:   1rem;     /* 16px — modal, sheets */
--radius-2xl:  1.5rem;   /* 24px — hero cards */
--radius-full: 9999px;   /* Pills, avatars, circular buttons */
```

---

## 13.6 Shadow System

```css
/* Elevation levels — dark mode optimized */
--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md:   0 4px 6px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.5), 0 8px 10px rgba(0, 0, 0, 0.3);

/* Colored glow shadows for hero elements */
--shadow-violet: 0 0 40px rgba(139, 92, 246, 0.25);
--shadow-emerald: 0 0 40px rgba(16, 185, 129, 0.20);
--shadow-cyan: 0 0 40px rgba(6, 182, 212, 0.20);
```

---

## 13.7 Glassmorphism Card System

```css
/* Base glass card */
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--glass-shadow);
}

/* Wallet-specific cards */
.wallet-card {
  background: var(--gradient-wallet);
  border: 1px solid rgba(139, 92, 246, 0.30);
  box-shadow: var(--shadow-xl), var(--shadow-violet);
}

.savings-card {
  background: var(--gradient-savings);
  border: 1px solid rgba(16, 185, 129, 0.30);
  box-shadow: var(--shadow-xl), var(--shadow-emerald);
}

.strict-savings-card {
  background: var(--gradient-strict);
  border: 1px solid rgba(139, 92, 246, 0.20);
  box-shadow: var(--shadow-xl), var(--shadow-violet);
  position: relative;
  overflow: hidden;
}

/* Animated shimmer on strict savings card */
.strict-savings-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(139, 92, 246, 0.06) 50%,
    transparent 60%
  );
  animation: shimmer 3s infinite;
}
```

---

## 13.8 Component Tokens

```css
/* Buttons */
--btn-primary-bg:      var(--accent-primary);
--btn-primary-hover:   var(--accent-primary-h);
--btn-primary-text:    #FFFFFF;
--btn-primary-radius:  var(--radius-full);
--btn-height-sm:       36px;
--btn-height-md:       44px;  /* Minimum touch target */
--btn-height-lg:       52px;

/* Inputs */
--input-bg:            var(--bg-elevated);
--input-border:        var(--border-default);
--input-focus-border:  var(--accent-primary);
--input-radius:        var(--radius-lg);
--input-height:        52px;  /* Large for mobile usability */

/* Navigation */
--nav-height:          72px;
--nav-bg:              var(--bg-surface);
--nav-border:          var(--border-subtle);
--nav-active-color:    var(--accent-primary);
--nav-inactive-color:  var(--text-tertiary);
```

---

## 13.9 Iconography

**Library:** Lucide React (consistent stroke width = 1.5)

| Context | Size | Weight |
|---------|------|--------|
| Navigation | 24px | Stroke 1.5 |
| Action buttons | 20px | Stroke 1.5 |
| Inline / status | 16px | Stroke 2 |
| Hero/feature | 32px | Stroke 1.5 |
| Decorative | 48px+ | Stroke 1 |

Key icons:
- `Wallet` → Main Wallet navigation
- `PiggyBank` → Normal Savings
- `Shield` → Strict Savings
- `Brain` / `Sparkles` → AI features
- `ArrowUpRight` → Send/debit
- `ArrowDownLeft` → Receive/credit
- `Lock` → Protected/restricted
- `FileCheck` → Document verified
- `Eye` / `EyeOff` → Balance toggle
