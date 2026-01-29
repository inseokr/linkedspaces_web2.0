"use client";

import React from "react";

export default function TextRow({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>

      {multiline ? (
        <textarea
          className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
