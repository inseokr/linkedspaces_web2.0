"use client";

import React, { useEffect } from "react";
import Image from "next/image";

type Variant = "default" | "danger";

export default function ConfirmModal({
  open,
  title = "LinkedSpaces",
  message,
  confirmText = "Yes",
  cancelText = "No",
  variant = "default",
  onClose,
  onConfirm,
  logoSrc = "/images/LS_blue.png",
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  onClose: () => void;
  onConfirm: () => void;
  logoSrc?: string;
}) {
  // ESC 닫기
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  const yesBtn =
    variant === "danger"
      ? "bg-[#FF4D4F] text-white hover:brightness-95"
      : "bg-[#2F7BFF] text-white hover:brightness-95";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close modal"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-[420px] h-[344px] rounded-[13px] bg-[#F6F7F9] shadow-2xl"
      >
        {/* Inner card */}
        <div className="h-full w-full rounded-[13px] bg-white p-4">
          {/* Header (logo + title) */}
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src={logoSrc}
                alt="LinkedSpaces"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-[22px] font-extrabold text-black">{title}</div>
          </div>

          {/* Message */}
          <div className="mt-8 px-8 text-center text-[14px] leading-[1.5] text-black/70">
            {message}
          </div>

          {/* Buttons */}
          <div className="mt-10 flex items-center justify-between px-10">
            <button
              type="button"
              className="h-[44px] w-[120px] rounded-full bg-[#D9D9D9] text-[14px] font-semibold text-black/70 hover:brightness-95"
              onClick={onClose}
            >
              {cancelText}
            </button>

            <button
              type="button"
              className={`h-[44px] w-[120px] rounded-full text-[14px] font-semibold ${yesBtn}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
