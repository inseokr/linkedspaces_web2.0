"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Button from "./Button";

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
  // ESC / Enter
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

  // danger일 때는 Button variant가 없으니 클래스 오버라이드
  const confirmOverride =
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
        className="relative h-[344px] w-[420px] rounded-[13px] bg-[#F6F7F9] shadow-2xl"
      >
        {/* Inner card */}
        <div className="h-full w-full rounded-[13px] bg-white p-4">
          {/* Header (logo + title) */}
          <div className="mt-10 flex items-center justify-start pl-10 gap-3">
            <div className="relative h-[57px] w-[57px]">
              <Image
                src={logoSrc}
                alt="LinkedSpaces"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-[32px] font-bold text-black">{title}</div>
          </div>

          {/* Message */}
          <div className="mt-14 px-8 text-center text-[17px] whitespace-pre-wrap leading-[1.5] text-black">
            {message}
          </div>

          {/* Buttons */}
          <div className="mt-10 flex items-center justify-between px-8">
            <Button
              type="button"
              radius="full"
              variant="neutral"
              className="h-[44px] w-[120px] text-[14px] font-semibold text-black/70"
              onClick={onClose}
            >
              {cancelText}
            </Button>

            <Button
              type="button"
              radius="full"
              variant="main"
              className={`h-[44px] w-[120px] text-[14px] font-semibold ${confirmOverride}`}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
