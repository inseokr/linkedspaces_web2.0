/**
 * Public support contact form → Pocketverse LS_API.
 * POST /LS_API/public/support/contact
 */

import { apiFetch, type ApiError } from "@/api/client";

export type SupportContactSource = "bloggo" | "linkedspaces";

export type SupportContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: SupportContactSource;
};

type SupportContactResponse = {
  result: string;
  reason?: string;
};

export async function submitSupportContact(
  payload: SupportContactPayload,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await apiFetch<SupportContactResponse>(
      "/public/support/contact",
      {
        method: "POST",
        body: payload,
      },
    );
    if (res.result === "OK") return { ok: true };
    return { ok: false, message: res.reason ?? "Something went wrong." };
  } catch (err) {
    const ae = err as ApiError;
    let message = ae.message;
    if (ae.detail) {
      try {
        const parsed = JSON.parse(ae.detail) as { reason?: string };
        if (parsed.reason) message = parsed.reason;
      } catch {
        /* keep message */
      }
    }
    return { ok: false, message };
  }
}
