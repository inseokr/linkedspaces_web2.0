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
