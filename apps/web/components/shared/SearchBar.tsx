"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({
  className,
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  ...props
}: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={cn(
          "w-full h-12 pl-11 pr-4 rounded-2xl text-sm",
          "bg-bg-surface border border-border-subtle",
          "text-text-primary placeholder:text-text-tertiary",
          "focus:outline-none focus:border-accent-primary",
          "transition-colors duration-200"
        )}
        {...props}
      />
    </div>
  );
}
