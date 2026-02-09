"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getCachedUser } from "@/api/user";
import {
  fetchFriendList,
  fetchMyProfileSummary,
  fetchNetworkInfo,
  type ProfileSummary,
} from "@/api/mynetwork";
import { fetchNotifications, type NotificationItem } from "@/api/notifications";

function asString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function pick<T extends Record<string, unknown>>(
  obj: T | undefined,
  keys: string[],
): string | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = asString(obj[k]);
    if (v) return v;
  }
  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(
    null,
  );
  const [networkInfo, setNetworkInfo] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [friendList, setFriendList] = useState<unknown[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(
    null,
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    // Avoid synchronous setState directly in effect body (lint rule).
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });

    Promise.all([
      fetchMyProfileSummary(),
      fetchNetworkInfo(),
      fetchFriendList(),
      fetchNotifications(),
    ])
      .then(([ps, ni, fl, noti]) => {
        if (cancelled) return;
        setProfileSummary(ps);
        setNetworkInfo(ni as Record<string, unknown>);
        setFriendList(fl);
        setNotifications(noti);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg =
          e instanceof Error
            ? e.message
            : typeof e === "string"
              ? e
              : "Failed to load dashboard.";
        setError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, router]);

  const cachedUser = useMemo(() => getCachedUser(), []);
  const username =
    cachedUser?.username ??
    pick(profileSummary?.basicInfo, ["username", "userName", "name"]) ??
    "User";

  const statsPairs = useMemo(() => {
    const stats = profileSummary?.stats ?? {};
    if (!stats || typeof stats !== "object") return [];
    const entries = Object.entries(stats as Record<string, unknown>)
      .filter(([, v]) => typeof v === "string" || typeof v === "number")
      .slice(0, 8);
    return entries as Array<[string, string | number]>;
  }, [profileSummary?.stats]);

  const recentTrips = Array.isArray(profileSummary?.recentTrips)
    ? profileSummary?.recentTrips
    : [];
  const recentPlaces = Array.isArray(profileSummary?.recentPlaces)
    ? profileSummary?.recentPlaces
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Signed in as <span className="font-semibold">{username}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to app
            </Link>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {(authLoading || loading) && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              <p className="mt-3 text-sm text-gray-600">Loading dashboard…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">
                Profile summary
              </h2>
              {statsPairs.length === 0 ? (
                <p className="mt-2 text-sm text-gray-600">
                  No stats returned from backend.
                </p>
              ) : (
                <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {statsPairs.map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        {k}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                        {String(v)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900">
                  Recent trips
                </h2>
                {recentTrips.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">
                    No recent trips found.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {recentTrips.slice(0, 5).map((t, idx) => {
                      const o = (t ?? {}) as Record<string, unknown>;
                      const title =
                        pick(o, ["title", "tripTitle"]) ?? `Trip #${idx + 1}`;
                      const when =
                        pick(o, ["endTimeString", "startTimeString"]) ??
                        pick(o, ["endTimestamp", "startTimestamp"]);
                      return (
                        <li
                          key={`${title}-${idx}`}
                          className="rounded-xl border border-gray-100 px-3 py-2"
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            {title}
                          </div>
                          {when && (
                            <div className="text-xs text-gray-600">{when}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900">
                  Recent places
                </h2>
                {recentPlaces.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">
                    No recent places found.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {recentPlaces.slice(0, 10).map((p, idx) => {
                      const o = (p ?? {}) as Record<string, unknown>;
                      const name =
                        pick(o, ["placeName", "name", "title"]) ??
                        `Place #${idx + 1}`;
                      const city =
                        pick(o, ["visitedCity", "city"]) ??
                        pick(o, ["country", "countryCode"]);
                      const when = pick(o, [
                        "visitedTime",
                        "visitedTimeDigitized",
                      ]);
                      return (
                        <li
                          key={`${name}-${idx}`}
                          className="rounded-xl border border-gray-100 px-3 py-2"
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            {name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {[city, when].filter(Boolean).join(" • ")}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900">
                  Network
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {networkInfo
                    ? "Loaded /mynetwork/networkinfo."
                    : "No network info."}
                </p>
                {networkInfo && (
                  <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-gray-50 p-3 text-[11px] text-gray-700">
                    {JSON.stringify(networkInfo, null, 2)}
                  </pre>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900">
                  Notifications
                </h2>
                {notifications == null ? (
                  <p className="mt-2 text-sm text-gray-600">
                    No notifications loaded.
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">
                    You have no notifications.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {notifications.slice(0, 20).map((n, idx) => {
                      const id =
                        asString((n as any)?._id) ??
                        asString((n as any)?.id) ??
                        String(idx);
                      const caption =
                        asString((n as any)?.notificationCaption) ??
                        asString((n as any)?.caption) ??
                        asString((n as any)?.notificationType) ??
                        "Notification";
                      const createdAt = asString((n as any)?.createdAt);
                      const read = Boolean((n as any)?.read);
                      return (
                        <li
                          key={id}
                          className={[
                            "rounded-xl border px-3 py-2",
                            read
                              ? "border-gray-100 bg-white"
                              : "border-blue-100 bg-blue-50",
                          ].join(" ")}
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            {caption}
                          </div>
                          {createdAt && (
                            <div className="text-xs text-gray-600">
                              {createdAt}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">
                Friends (direct)
              </h2>
              {friendList == null ? (
                <p className="mt-2 text-sm text-gray-600">
                  No friend list loaded.
                </p>
              ) : friendList.length === 0 ? (
                <p className="mt-2 text-sm text-gray-600">
                  No friends returned.
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-600">
                  Loaded {friendList.length} friends from{" "}
                  <code className="text-xs">/mynetwork/friend_list</code>.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
