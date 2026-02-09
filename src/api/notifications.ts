import { apiFetch } from "@/api/client";

function getAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const t = window.localStorage.getItem("token");
    if (t) return t;
  } catch {
    // ignore
  }
  try {
    return window.sessionStorage.getItem("token") ?? undefined;
  } catch {
    return undefined;
  }
}

export type NotificationItem = Record<string, unknown> & {
  _id?: string;
  id?: string;
  read?: boolean;
  notified?: boolean;
  createdAt?: string;
  notificationType?: string;
  notificationCaption?: string;
};

export type GetNotificationsResponse =
  | { result: "OK"; notifications: NotificationItem[] }
  | Record<string, unknown>;

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const token = getAuthToken();
  const res = await apiFetch<GetNotificationsResponse>("/notification", {
    method: "GET",
    token,
  });
  const notifications = (res as any)?.notifications;
  return Array.isArray(notifications)
    ? (notifications as NotificationItem[])
    : [];
}

export type UpdateNotificationReadStatusPayload = {
  notificationId: string;
  read: boolean;
};

export async function updateNotificationReadStatus(
  payload: UpdateNotificationReadStatusPayload,
): Promise<unknown> {
  const token = getAuthToken();
  return apiFetch("/notification/updateReadStatus", {
    method: "POST",
    token,
    body: payload,
  });
}
