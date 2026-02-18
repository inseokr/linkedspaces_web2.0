"use client";

import Sidebar from "@/views/Profile/sidebar/Sidebar";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { useParams, usePathname } from "next/navigation";

import {
  LayoutModeProvider,
  useLayoutMode,
} from "@/components/layout/LayoutModeContext";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/api/client";

function ProfileLayoutInner({ children }: { children: React.ReactNode }) {
  const { layoutMode, fullScreenMapActive } = useLayoutMode();

  // --- (추가) 현재 라우트가 Trip Recap인지 판별 ---
  const pathname = usePathname();
  const isTripRecapRoute = useMemo(() => {
    // 너희 라우트가 /trip/... 형태라는 가정. 다르면 여기만 바꿔.
    return pathname?.startsWith("/trip/");
  }, [pathname]);

  // --- (추가) trip route params에서 페이지 소유자 userId 가져오기 ---
  const params = useParams<Record<string, string>>();
  const pageUserId = params?.userId; // 폴더명이 [userId] 여야 함

  // --- (추가) viewer(현재 로그인 유저) 가져오기 ---
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [viewerResolved, setViewerResolved] = useState(false);

  useEffect(() => {
    // Trip recap 페이지가 아니면 이 로직 불필요
    if (!isTripRecapRoute) {
      setViewerId(null);
      setViewerResolved(true);
      return;
    }

    // userId param이 없으면 안전하게 게스트 취급 (사이드바 숨김)
    if (!pageUserId) {
      setViewerId(null);
      setViewerResolved(true);
      return;
    }

    // auth 로딩 중엔 판단 보류 => 깜빡임 방지 위해 resolved false 유지
    if (authLoading) {
      setViewerResolved(false);
      return;
    }

    let cancelled = false;
    setViewerResolved(false);

    (async () => {
      // 로그인 안 했으면 => 게스트
      if (!isAuthenticated) {
        if (!cancelled) {
          setViewerId(null);
          setViewerResolved(true);
        }
        return;
      }

      try {
        // "현재 로그인 유저" API
        const me = await apiFetch<{ id: string }>("/ls-beta-test/me");
        if (cancelled) return;
        setViewerId(me?.id ?? null);
      } catch {
        if (cancelled) return;
        setViewerId(null);
      } finally {
        if (cancelled) return;
        setViewerResolved(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isTripRecapRoute, pageUserId, authLoading, isAuthenticated]);

  // --- (추가) guest 판별 ---
  const isGuestOnTripRecap = useMemo(() => {
    if (!isTripRecapRoute) return false;
    if (!pageUserId) return true;

    // 판별 중이면 sidebar 숨김 유지(깜빡임 방지)
    if (!viewerResolved) return true;

    // 로그인 안 했거나 viewerId를 못 얻으면 게스트
    if (!isAuthenticated || !viewerId) return true;

    // 소유자 불일치도 게스트
    return String(viewerId) !== String(pageUserId);
  }, [isTripRecapRoute, pageUserId, viewerResolved, isAuthenticated, viewerId]);

  // --- 최종 hideSidebar ---
  // layoutMode(bare) OR (trip recap에서 guest)
  // Also: sidebar should exist only for authenticated users.
  // While auth is loading, keep it hidden to avoid flicker/layout shift.
  const hideSidebar =
    layoutMode === "bare" ||
    isGuestOnTripRecap ||
    authLoading ||
    !isAuthenticated;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const SIDEBAR_WIDTH = "320px";
  const mainScrollRef = useRef<HTMLElement>(null);

  const sidebarVisible = !hideSidebar && !fullScreenMapActive;

  // On route change, scroll to top so the page header is not hidden under the main site header.
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-offset",
      !sidebarVisible ? "0px" : isSidebarOpen ? SIDEBAR_WIDTH : "0px",
    );

    return () => {
      document.documentElement.style.removeProperty("--sidebar-offset");
    };
  }, [isSidebarOpen, sidebarVisible]);

  // 사이드바를 안 띄우고 싶을 때 (document/window scroll). fullScreenMapActive uses same tree but hides sidebar via CSS.
  if (hideSidebar) {
    return (
      <main className="min-h-screen w-full bg-white">
        <div className="w-full min-h-full flex flex-col">{children}</div>
        <ScrollToTopButton />
      </main>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        forceHidden={fullScreenMapActive}
      />

      {sidebarVisible && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-0 top-[135px] z-[60] flex items-center justify-center bg-white rounded-r-md border border-l-0 border-gray-200 shadow-md w-10 h-10 transition-all duration-300 ease-in-out hover:bg-gray-50"
        >
          <Image
            src="/icons/leftPanel.png"
            alt="toggle sidebar"
            width={20}
            height={20}
            className="rotate-180 transition-transform duration-300"
          />
        </button>
      )}

      <main
        ref={mainScrollRef}
        className="flex-1 h-full overflow-y-auto transition-all duration-300 ease-in-out bg-white min-w-0"
        style={{
          paddingLeft: fullScreenMapActive
            ? "0px"
            : isSidebarOpen
              ? SIDEBAR_WIDTH
              : "0px",
        }}
      >
        <div className="w-full min-h-full flex flex-col">{children}</div>
      </main>
      <ScrollToTopButton scrollContainerRef={mainScrollRef} showAfterPx={400} />
    </div>
  );
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutModeProvider>
      <ProfileLayoutInner>{children}</ProfileLayoutInner>
    </LayoutModeProvider>
  );
}
