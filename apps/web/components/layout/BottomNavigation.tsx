"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Wallet,
  PiggyBank,
  Shield,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    match: /^\/$/,
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: Wallet,
    match: /^\/wallet/,
  },
  {
    label: "Savings",
    href: "/savings",
    icon: PiggyBank,
    match: /^\/savings/,
  },
  {
    label: "Strict",
    href: "/strict-savings",
    icon: Shield,
    match: /^\/strict-savings/,
    badge: "AI",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    match: /^\/(settings|profile|history)/,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app z-nav">
      {/* Gradient fade above nav */}
      <div className="h-6 bg-gradient-to-t from-bg-base to-transparent pointer-events-none" />

      <div
        className={cn(
          "px-2 pb-safe-bottom",
          "bg-bg-surface/90 backdrop-blur-xl",
          "border-t border-border-subtle",
          "h-bottom-nav"
        )}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <ul className="flex items-center h-full">
          {navItems.map((item) => {
            const isActive = item.match.test(pathname);
            const Icon = item.icon;

            return (
              <li key={item.href} className="flex-1">
                <Link href={item.href} className="relative flex flex-col items-center gap-1 py-2 group">
                  {/* Active dot indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-accent-primary"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon container */}
                  <motion.div
                    className="relative"
                    animate={{ y: isActive ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {/* AI badge */}
                    {item.badge && (
                      <span className="absolute -top-1 -right-3 text-2xs font-bold leading-none px-1 py-0.5 rounded-full bg-accent-primary text-white">
                        {item.badge}
                      </span>
                    )}
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={cn(
                        "transition-colors duration-200",
                        isActive
                          ? "text-accent-primary"
                          : "text-text-tertiary group-hover:text-text-secondary"
                      )}
                    />
                  </motion.div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-2xs font-medium transition-colors duration-200",
                      isActive ? "text-accent-primary" : "text-text-tertiary"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
