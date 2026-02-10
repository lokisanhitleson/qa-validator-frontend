"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, id, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground outline-none transition-colors ${
          error
            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-input-border bg-input-bg focus:border-primary focus:ring-2 focus:ring-primary/20"
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
