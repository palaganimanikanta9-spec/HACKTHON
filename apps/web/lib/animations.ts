// ═══════════════════════════════════════════════════════════════════
// SMARTSAVE AI WALLET — ANIMATION LIBRARY
// All Framer Motion variants used across the application
// ═══════════════════════════════════════════════════════════════════

import { type Variants, type Transition } from "framer-motion";

// ── Transitions ───────────────────────────────────────────────────

export const transitions = {
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } satisfies Transition,

  springBouncy: {
    type: "spring",
    stiffness: 400,
    damping: 20,
  } satisfies Transition,

  smooth: {
    type: "tween",
    ease: [0.4, 0, 0.2, 1],
    duration: 0.25,
  } satisfies Transition,

  snappy: {
    type: "tween",
    ease: [0.4, 0, 0.6, 1],
    duration: 0.15,
  } satisfies Transition,

  expoOut: {
    type: "tween",
    ease: [0.22, 1, 0.36, 1],
    duration: 0.35,
  } satisfies Transition,

  slow: {
    type: "tween",
    ease: [0.4, 0, 0.2, 1],
    duration: 0.5,
  } satisfies Transition,
};

// ── Page Transitions ──────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ...transitions.smooth, duration: 0.22 },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { ...transitions.snappy },
  },
};

export const pageSlideVariants: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: transitions.expoOut },
  exit: { opacity: 0, x: -40, transition: transitions.snappy },
};

// ── Card Animations ───────────────────────────────────────────────

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.expoOut,
  },
};

export const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.015,
    y: -2,
    transition: transitions.spring,
  },
  tap: { scale: 0.98, y: 0, transition: transitions.snappy },
};

// ── Stagger Lists ─────────────────────────────────────────────────

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerFastContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

export const staggerItemLeft: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

// ── Balance / Number ──────────────────────────────────────────────

export const balanceRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    scale: 0.95,
    transition: transitions.smooth,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: transitions.smooth,
  },
};

// ── Buttons ───────────────────────────────────────────────────────

export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.96, transition: transitions.snappy },
};

export const fabVariants: Variants = {
  initial: { scale: 0, opacity: 0, rotate: -10 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: transitions.springBouncy,
  },
  exit: {
    scale: 0,
    opacity: 0,
    rotate: 10,
    transition: transitions.snappy,
  },
};

// ── Modals & Overlays ─────────────────────────────────────────────

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transitions.snappy,
  },
};

export const drawerVariants: Variants = {
  initial: { y: "100%", opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 35 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.6, 1] },
  },
};

// ── Toast ─────────────────────────────────────────────────────────

export const toastVariants: Variants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: transitions.snappy,
  },
};

// ── Success / Error ───────────────────────────────────────────────

export const successVariants: Variants = {
  initial: { scale: 0, opacity: 0, rotate: -15 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      delay: 0.1,
    },
  },
};

export const errorShakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-8, 8, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.5 },
  },
};

// ── Navigation ────────────────────────────────────────────────────

export const navItemVariants: Variants = {
  inactive: { scale: 1, y: 0 },
  active: {
    scale: 1,
    y: -2,
    transition: transitions.spring,
  },
};

export const navIndicatorVariants: Variants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: 1,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    scaleX: 0,
    opacity: 0,
    transition: transitions.snappy,
  },
};

// ── Loading ───────────────────────────────────────────────────────

export const loadingDotVariants: Variants = {
  initial: { opacity: 0.4, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export const pulseVariants: Variants = {
  pulse: {
    opacity: [0.4, 1, 0.4],
    scale: [0.97, 1, 0.97],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ── Verification Steps ────────────────────────────────────────────

export const stepVariants: Variants = {
  pending: { opacity: 0.35, scale: 0.97 },
  active: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  completed: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
};

// ── Floating Action Button ────────────────────────────────────────

export const floatingVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: transitions.snappy,
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: transitions.spring,
  },
  tap: { scale: 0.94 },
};

// ── Insight Card ──────────────────────────────────────────────────

export const insightVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.expoOut,
  },
};

// ── Scroll-triggered fade ─────────────────────────────────────────

export const fadeInUpVariants: Variants = {
  offscreen: { opacity: 0, y: 24 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: { ...transitions.expoOut, duration: 0.4 },
  },
};
