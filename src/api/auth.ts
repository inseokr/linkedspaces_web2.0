// src/api/auth.ts
import { apiFetch } from "@/api/client";
import type { User } from "@/api/user";

export type LoginSuccess = {
  message: "ok";
  token: string;
  user: User;
};

export type LoginFail = {
  message: string; // e.g. "error"
};

export type LoginResponse = LoginSuccess | LoginFail;

export function isLoginSuccess(res: LoginResponse): res is LoginSuccess {
  return res.message === "ok";
}

export function loginWithGoogle(idToken: string) {
  return apiFetch<LoginResponse>("/oauth/google", {
    method: "POST",
    body: { idToken },
  });
}

export function loginWithJwt(username: string, password: string) {
  return apiFetch<LoginResponse>("/jwt_login_v1", {
    method: "POST",
    body: { username, password },
  });
}

export type ForgotPasswordResponse =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export type ForgotPasswordPayload = {
  username?: string;
  email?: string;
};

/**
 * Request a password reset email.
 * Backend: pocketverse POST /auth/request-reset with { email?, username? }.
 * Sends both when provided; backend finds user by either or both.
 */
export async function requestPasswordReset(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  const raw = await apiFetch<{
    result?: string;
    message?: string;
    reason?: string;
  }>("/auth/request-reset", { method: "POST", body: payload });
  if (raw?.result === "OK") return { ok: true, message: raw.message };
  return {
    ok: false,
    message: raw?.reason || raw?.message || "Request failed.",
  };
}
