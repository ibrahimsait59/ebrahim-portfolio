"use client";

import { useState, useCallback } from "react";

type CopyLinkProps = {
  value: string;
  label: string;
  children: React.ReactNode;
};

export function CopyLink({ value, label, children }: CopyLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  return (
    <span className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Copy ${label}`}
        className="text-dim hover:text-accent transition-colors cursor-pointer"
      >
        {children}
      </button>

      {copied && (
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 whitespace-nowrap rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground shadow-lg">
          <span className="text-accent">{value}</span>
          <span className="text-success ml-2">✓ copied</span>
        </span>
      )}
    </span>
  );
}
