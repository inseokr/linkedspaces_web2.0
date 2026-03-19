// Handles Apple's POST redirect after Sign in with Apple (redirect mode).
// Apple POSTs application/x-www-form-urlencoded with: id_token, code, user (JSON), state.
//
// The middleware rewrites bloggo.linkedspaces.com/auth/apple/callback → /bloggo/auth/apple/callback
// so this file lives at /bloggo/auth/apple/callback/route.ts.

import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pocketverse.herokuapp.com/LS_API";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const idToken = formData.get("id_token") as string | null;
    const userJson = formData.get("user") as string | null;

    if (!idToken) {
      return NextResponse.redirect(
        new URL("/sign-in?error=apple_no_token", request.url),
      );
    }

    let fullName: string | undefined;
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson) as {
          name?: { firstName?: string; lastName?: string };
        };
        const parts = [
          parsed.name?.firstName ?? "",
          parsed.name?.lastName ?? "",
        ].filter(Boolean);
        if (parts.length) fullName = parts.join(" ");
      } catch {
        // ignore malformed user JSON
      }
    }

    const backendRes = await fetch(`${API_BASE}/oauth/apple`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_token: idToken,
        full_name: fullName,
        userType: "bloggo",
      }),
    });

    const data = (await backendRes.json()) as {
      message: string;
      token?: string;
      user?: { username?: string };
    };

    if (data.message === "ok" && data.token) {
      const username = data.user?.username ?? "";
      const params = new URLSearchParams({ token: data.token });
      if (username) params.set("username", username);
      return NextResponse.redirect(
        new URL(`/auth/apple/done?${params.toString()}`, request.url),
      );
    }

    return NextResponse.redirect(
      new URL("/sign-in?error=apple_auth_failed", request.url),
    );
  } catch (err) {
    console.error("[apple-callback] error:", err);
    return NextResponse.redirect(
      new URL("/sign-in?error=apple_error", request.url),
    );
  }
}
