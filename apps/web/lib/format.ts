// ═══════════════════════════════════════════════════════════════════
// FORMATTING UTILITIES
// Currency, numbers, dates, percentages
// ═══════════════════════════════════════════════════════════════════

// ── Currency Formatter ────────────────────────────────────────────

const DEFAULT_CURRENCY = "USD";
const DEFAULT_LOCALE = "en-US";

export function formatCurrency(
  amount: number | string,
  options?: {
    currency?: string;
    showCents?: boolean;
    compact?: boolean;
    locale?: string;
  }
): string {
  const {
    currency = DEFAULT_CURRENCY,
    showCents = true,
    compact = false,
    locale = DEFAULT_LOCALE,
  } = options ?? {};

  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) return "$0.00";

  if (compact && num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (compact && num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(num);
}

// Format just the number part (no currency symbol)
export function formatAmount(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0.00";
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// ── Date Formatters ───────────────────────────────────────────────

export function formatDate(date: Date | string, format: "short" | "long" | "relative" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "relative") {
    return formatRelativeDate(d);
  }

  if (format === "long") {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(d);
  }

  // Short
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today, ${formatTime(d)}`;
  }
  if (isYesterday) {
    return `Yesterday, ${formatTime(d)}`;
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: "short",
    day: "numeric",
  }).format(date);
}

// ── Percentage ────────────────────────────────────────────────────

export function formatPercentage(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

// ── Mask sensitive data ───────────────────────────────────────────

export function maskBalance(amount: string): string {
  return "••••••";
}

// ── Transaction sign ──────────────────────────────────────────────

export function getTransactionSign(type: "credit" | "debit"): "+" | "-" {
  return type === "credit" ? "+" : "-";
}

// ── Parse currency input ──────────────────────────────────────────

export function parseCurrencyInput(value: string): string {
  // Remove non-numeric except decimal point
  const cleaned = value.replace(/[^0-9.]/g, "");
  // Prevent multiple decimal points
  const parts = cleaned.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  // Limit to 2 decimal places
  if (parts[1] !== undefined && parts[1].length > 2) {
    return parts[0] + "." + parts[1].slice(0, 2);
  }
  return cleaned;
}

// ── Format countdown ──────────────────────────────────────────────

export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
