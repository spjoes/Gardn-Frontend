"use client";

import { motion } from "motion/react";

interface AddButtonProps {
  onClick: () => void;
  label: string;
}

export default function AddButton({ onClick, label }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest transition-all hover:scale-105 hover:bg-surface-high shadow-sm"
    >
      <span className="sr-only">{label}</span>
      <div className="relative h-6 w-6">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-ink transition-transform group-hover:rotate-90" />
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-ink transition-transform group-hover:rotate-90" />
      </div>
    </button>
  );
}
