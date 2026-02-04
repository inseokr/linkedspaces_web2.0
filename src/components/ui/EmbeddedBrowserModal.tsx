"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import { normalizeExternalUrl, openExternalUrl } from "@/utils/externalLinks";

function toEmbeddableUrl(normalizedUrl: string): string {
  // Many sites block iframing; we can only "work around" this when the provider
  // offers an explicit embed URL format (Google Maps does).
  try {
    const u = new URL(normalizedUrl);
    const host = u.hostname.toLowerCase();
    const isGoogleMapsHost =
      host === "www.google.com" ||
      host === "google.com" ||
      host === "maps.google.com";

    const isMapsPath = u.pathname.startsWith("/maps");
    if (!isGoogleMapsHost || !isMapsPath) return normalizedUrl;

    // Try to extract a useful query.
    const combined = `${u.pathname}${u.search}${u.hash}`;
    const atMatch = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(combined);
    const latLng = atMatch ? `${atMatch[1]},${atMatch[2]}` : null;

    const qParam =
      u.searchParams.get("q") ||
      u.searchParams.get("query") ||
      u.searchParams.get("destination") ||
      "";

    let q = (latLng || qParam).trim();

    if (!q) {
      const parts = u.pathname.split("/").filter(Boolean);
      const placeIdx = parts.indexOf("place");
      const searchIdx = parts.indexOf("search");
      if (placeIdx >= 0 && parts[placeIdx + 1]) {
        q = decodeURIComponent(parts[placeIdx + 1] ?? "").replace(/\+/g, " ");
      } else if (searchIdx >= 0 && parts[searchIdx + 1]) {
        q = decodeURIComponent(parts[searchIdx + 1] ?? "").replace(/\+/g, " ");
      }
    }

    // Use the classic embed-friendly form.
    // NOTE: Not all Google Maps content is embeddable, but this works far more often than /maps/place/... URLs.
    const base = "https://www.google.com/maps";
    const query = q ? `q=${encodeURIComponent(q)}` : "";
    const joiner = query ? "&" : "";
    return `${base}?${query}${joiner}output=embed`;
  } catch {
    return normalizedUrl;
  }
}

export default function EmbeddedBrowserModal({
  open,
  url,
  title = "Link",
  onClose,
}: {
  open: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}) {
  const canUseDOM = typeof document !== "undefined";
  const normalizedUrl = useMemo(() => normalizeExternalUrl(url), [url]);
  const iframeSrc = useMemo(
    () => (normalizedUrl ? toEmbeddableUrl(normalizedUrl) : null),
    [normalizedUrl],
  );

  // Keep the latest onClose (for keydown handler)
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // ESC to close (only while open)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const isLoading = !!open && !!iframeSrc && loadedUrl !== iframeSrc;
  // When the iframe is blocked by X-Frame-Options/CSP, onLoad often never fires.
  // We show a hint after a short delay. This state is keyed by the iframe src so
  // it "resets" automatically when the URL changes (no setState in effect body).
  const [hintReadyForSrc, setHintReadyForSrc] = useState<string | null>(null);

  // If the iframe is still "loading" after a short delay, it is often blocked by X-Frame-Options/CSP.
  // We can't reliably detect that, so we show a helpful hint + CTA.
  useEffect(() => {
    if (!open || !iframeSrc) return;
    const t = window.setTimeout(() => setHintReadyForSrc(iframeSrc), 2200);
    return () => window.clearTimeout(t);
  }, [open, iframeSrc]);

  const showEmbedTroubleHint = isLoading && hintReadyForSrc === iframeSrc;

  const handleCopy = async () => {
    if (!normalizedUrl) return;
    if (window.navigator.clipboard?.writeText) {
      await window.navigator.clipboard.writeText(normalizedUrl);
      return;
    }
    window.prompt("Copy this link:", normalizedUrl);
  };

  const handleOpenNewTab = () => {
    if (!normalizedUrl) return;
    // Mobile Chrome can sometimes "lose" the origin tab when returning from a new tab.
    // Default to same-tab navigation on mobile so the Back button works reliably.
    openExternalUrl(normalizedUrl);
  };

  // Important: don't render anything unless open.
  // (If we render while closed, the modal container can still be visible.)
  if (!open) return null;
  if (!canUseDOM) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483646] pointer-events-auto"
      aria-hidden={false}
    >
      {/* Backdrop */}
      <button
        type="button"
        className={[
          "absolute inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity",
          "opacity-100",
        ].join(" ")}
        aria-label="Close embedded browser"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal={open}
        className={[
          "absolute inset-x-0 bottom-0 top-0",
          "sm:inset-6 sm:bottom-6 sm:top-6",
          "mx-auto w-full sm:w-[min(1200px,92vw)]",
          "rounded-none sm:rounded-2xl",
          "overflow-hidden bg-white shadow-2xl",
          "flex flex-col",
          "transition-transform duration-200",
          "translate-y-0",
        ].join(" ")}
        onClick={(e) => {
          // Prevent clicks inside modal from reaching underlying UI.
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-black/80">
              {title}
            </div>
            <div className="truncate text-[12px] text-black/50">
              {normalizedUrl ?? "Invalid link"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-black/5 px-3 text-[13px] font-semibold text-black/70 hover:bg-black/10 disabled:opacity-40"
              onClick={handleCopy}
              disabled={!normalizedUrl}
              aria-label="Copy link"
            >
              Copy
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-black/5 px-3 text-[13px] font-semibold text-black/70 hover:bg-black/10 disabled:opacity-40"
              onClick={handleOpenNewTab}
              disabled={!normalizedUrl}
              aria-label="Open in browser"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black/70 hover:bg-black/10"
              aria-label="Close"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 bg-black/5">
          {iframeSrc ? (
            <>
              {isLoading ? (
                <div className="absolute left-4 top-4 z-10 rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold text-black/70 backdrop-blur">
                  Loading…
                </div>
              ) : null}

              {showEmbedTroubleHint ? (
                <div className="absolute left-4 top-14 z-10 max-w-[min(520px,calc(100vw-2rem))] rounded-2xl bg-white/90 px-4 py-3 text-[13px] font-semibold text-black/70 shadow-sm backdrop-blur">
                  This site may block embedded viewing. Use{" "}
                  <span className="font-extrabold">Open</span> to view it in a
                  browser.
                </div>
              ) : null}

              <iframe
                key={iframeSrc}
                src={iframeSrc}
                title={title}
                className="h-full w-full bg-white"
                onLoad={() => {
                  setLoadedUrl(iframeSrc);
                }}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center">
              <div className="max-w-[560px] space-y-3">
                <div className="text-[16px] font-extrabold text-black/80">
                  This link can’t be opened here.
                </div>
                <div className="text-[14px] text-black/60">
                  The URL looks invalid. You can close this window and try
                  again.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
