import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merger ─────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Random ID generator ───────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ── Clamp number ──────────────────────────────────────────────────
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ── Sleep ─────────────────────────────────────────────────────────
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Truncate string ───────────────────────────────────────────────
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "…" : str;
}

// ── Get initials from name ────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Debounce ──────────────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
