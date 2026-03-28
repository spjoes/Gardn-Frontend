"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function ModalButton({
  type = "button",
  disabled,
  onClick,
  children,
  className = "",
}: {
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`brand-gradient flex w-full cursor-pointer items-center justify-center rounded-2xl px-8 py-4 text-sm font-medium tracking-wide text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {children}
    </button>
  );
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 cursor-pointer bg-ink/10 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="ambient-panel relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#fdfaeb] p-8 sm:p-10"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-medium tracking-tight lowercase">{title}</h2>
          <button 
            onClick={onClose}
            className="group relative h-8 w-8 cursor-pointer rounded-full bg-surface-container-highest transition-colors hover:bg-surface-high"
          >
            <span className="sr-only">Close</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-px rotate-45 bg-ink transition-transform group-hover:scale-110" />
              <div className="h-4 w-px -rotate-45 bg-ink transition-transform group-hover:scale-110" />
            </div>
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
}
