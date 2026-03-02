"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Dismissible popup that explains how to enable hardware graphics acceleration.
 * Shown only when a Mapbox / WebGL map fails to initialise.
 *
 * Usage:
 *   <WebGLHelpPopup open={!!initError} onClose={() => setShowPopup(false)} />
 */
export default function WebGLHelpPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [isBrave, setIsBrave] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return typeof (navigator as any).brave?.isBrave === "function";
  });

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  const browserName = isBrave ? "Brave" : "Chrome";
  const settingsUrl = isBrave
    ? "brave://settings/system"
    : "chrome://settings/system";

  const steps = [
    {
      num: "1",
      title: "Open System Settings",
      desc: (
        <>
          In <strong>{browserName}</strong>, go to{" "}
          <strong>Settings &gt; System</strong>.
          <br />
          <span style={{ fontSize: 13, color: "rgba(0,0,0,0.5)" }}>
            Or paste this into your address bar: <strong>{settingsUrl}</strong>
          </span>
        </>
      ),
    },
    {
      num: "2",
      title: "Enable Graphics Acceleration",
      desc: (
        <>
          Turn <strong>ON</strong> {'"'}Use graphics acceleration when available
          {'"'}.
        </>
      ),
    },
    {
      num: "3",
      title: "Relaunch & Reload",
      desc: "Click Relaunch to restart your browser, then reload this page.",
    },
  ];

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
    >
      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "relative",
          width: "min(460px, 92vw)",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Orange accent bar */}
        <div
          style={{
            height: 5,
            background: "linear-gradient(90deg, #f97316, #fb923c)",
          }}
        />

        <div style={{ padding: "28px 32px 32px" }}>
          {/* Close X */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 28,
              height: 28,
              border: "none",
              background: "rgba(0,0,0,0.06)",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "rgba(0,0,0,0.45)",
              lineHeight: 1,
            }}
          >
            &#x2715;
          </button>

          {/* Title */}
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: -0.2,
              lineHeight: "26px",
            }}
          >
            Almost there! Enable Graphics Acceleration
          </h2>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: 14,
              lineHeight: "21px",
              color: "rgba(0,0,0,0.55)",
            }}
          >
            Enable graphics acceleration to render the interactive map:
          </p>

          {/* Steps */}
          <ol
            style={{
              margin: "22px 0 0",
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {steps.map((step) => (
              <li
                key={step.num}
                style={{ display: "flex", gap: 14, alignItems: "start" }}
              >
                {/* Number badge */}
                <span
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f97316, #fb923c)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step.num}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#0f172a",
                      lineHeight: "20px",
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(0,0,0,0.5)",
                      lineHeight: "18px",
                      marginTop: 3,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* Brave-specific tip */}
          {isBrave && (
            <div
              style={{
                marginTop: 20,
                padding: "12px 14px",
                background: "rgba(249,115,22,0.07)",
                borderRadius: 10,
                fontSize: 13,
                lineHeight: "18px",
                color: "rgba(0,0,0,0.55)",
              }}
            >
              <strong style={{ color: "rgba(0,0,0,0.7)" }}>Still blank?</strong>{" "}
              Click the <strong>Shields icon</strong> (lion) and set{" "}
              <strong>Block fingerprinting</strong> to <strong>Allow</strong>.
            </div>
          )}

          {/* Got it */}
          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: 24,
              width: "100%",
              height: 46,
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg, #f97316, #fb923c)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.3,
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
