"use client";

import type { ReactNode } from "react";

export interface EmptyStateCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function EmptyStateCard({
  title,
  description,
  actions,
  className = "",
}: EmptyStateCardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--card-border)] border-dashed bg-gray-50/80 p-6 text-center ${className}`}
    >
      <h3 className="text-base font-semibold text-[var(--card-text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--card-text-muted)]">
          {description}
        </p>
      )}
      {actions && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
