"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  fetchManualPushRecipients,
  sendManualPush,
  type ManualPushRecipient,
} from "@/api/admin-dashboard";

const COMMON_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function defaultTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function parseHttpUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export default function DashboardManualPush() {
  const [recipients, setRecipients] = useState<ManualPushRecipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [schedule, setSchedule] = useState<"immediate" | "scheduled">(
    "immediate",
  );
  const [localDate, setLocalDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [localTime, setLocalTime] = useState("10:00");
  const [timezone, setTimezone] = useState(defaultTimeZone);
  const [deliveryWindowEnabled, setDeliveryWindowEnabled] = useState(false);
  const [windowStartHour, setWindowStartHour] = useState(9);
  const [windowEndHour, setWindowEndHour] = useState(21);
  /** Shown as iOS notification thumbnail (requires app Notification Service Extension). */
  const [notificationImageUrl, setNotificationImageUrl] = useState("");
  const [deepLinkJson, setDeepLinkJson] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadRecipients = useCallback(async (q: string) => {
    setRecipientsLoading(true);
    setRecipientsError(null);
    try {
      const res = await fetchManualPushRecipients({
        q: q.trim() || undefined,
        limit: 2000,
      });
      if (res.result !== "OK") {
        throw new Error((res as { reason?: string }).reason || "Load failed");
      }
      setRecipients(res.users);
    } catch (e) {
      setRecipientsError(e instanceof Error ? e.message : "Load failed");
      setRecipients([]);
    } finally {
      setRecipientsLoading(false);
    }
  }, []);

  const searchBoot = useRef(true);
  useEffect(() => {
    if (searchBoot.current) {
      searchBoot.current = false;
      void loadRecipients("");
      return;
    }
    const t = setTimeout(() => {
      void loadRecipients(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search, loadRecipients]);

  const allIds = useMemo(
    () => new Set(recipients.map((r) => r.userId)),
    [recipients],
  );

  const allSelected =
    recipients.length > 0 && recipients.every((r) => selected.has(r.userId));

  function toggleUser(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(recipients.map((r) => r.userId)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (selected.size === 0) {
      setError("Select at least one user.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }

    let pushData: Record<string, unknown> = {};
    if (deepLinkJson.trim()) {
      try {
        const parsed = JSON.parse(deepLinkJson) as unknown;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          setError("Custom data JSON must be an object.");
          return;
        }
        pushData = { ...(parsed as Record<string, unknown>) };
      } catch {
        setError("Deep link JSON is invalid.");
        return;
      }
    }

    const imageUrl = parseHttpUrl(notificationImageUrl);
    if (notificationImageUrl.trim() && !imageUrl) {
      setError(
        "Notification image URL must be a valid http(s) URL (direct link to an image).",
      );
      return;
    }
    if (imageUrl) {
      pushData.imageUrl = imageUrl;
    }

    const hasPushData = Object.keys(pushData).length > 0;

    setSubmitting(true);
    try {
      const payload = {
        userIds: Array.from(selected),
        title: title.trim(),
        body: body.trim(),
        schedule,
        ...(schedule === "scheduled"
          ? {
              localDate: localDate.trim(),
              localTime: localTime.trim(),
              timezone: timezone.trim(),
              ...(deliveryWindowEnabled
                ? {
                    deliveryWindowEnabled: true,
                    deliveryWindowStartHour: windowStartHour,
                    deliveryWindowEndHour: windowEndHour,
                  }
                : {}),
            }
          : {}),
        ...(hasPushData ? { pushData } : {}),
      };

      const res = await sendManualPush(payload);
      if (res.result !== "OK") {
        throw new Error(res.reason || "Request failed");
      }

      if (res.schedule === "immediate") {
        setSuccess(
          `Sent to ${res.sent ?? 0} device(s). Targeted ${res.targeted ?? 0}; skipped (no token / not found): ${res.skippedNoToken ?? 0}.`,
        );
      } else {
        setSuccess(
          `Scheduled ${res.scheduled ?? 0} job(s) for ${res.sendAt ?? "—"} (${res.timezone ?? timezone}). Skipped: ${res.skippedNoToken ?? 0}.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-1">
        Manual push notification
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Only users with an{" "}
        <code className="rounded bg-gray-100 px-1">iosPushToken</code> appear
        below. Choose one or more recipients, set title and body, then send
        immediately or schedule using a local date, time, and IANA timezone.
        Optional delivery window snaps the send time into a local hour range
        (same behavior as delayed rules). An optional{" "}
        <strong>notification image</strong> is sent as{" "}
        <code className="rounded bg-gray-100 px-1">imageUrl</code> in the APNs
        payload with{" "}
        <code className="rounded bg-gray-100 px-1">mutable-content</code> so the
        iOS app can show a thumbnail next to the body (your app needs a
        Notification Service Extension that downloads this URL and attaches it).
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-3" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 mb-3" role="status">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Recipients ({selected.size} selected)
            </label>
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Filter by username…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm w-48"
              />
              <button
                type="button"
                onClick={selectAllVisible}
                disabled={recipients.length === 0}
                className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
              >
                Select visible
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </div>
          {recipientsError && (
            <p className="text-sm text-amber-700 mb-2">{recipientsError}</p>
          )}
          {recipientsLoading ? (
            <p className="text-sm text-gray-400 py-4">Loading recipients…</p>
          ) : (
            <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 space-y-1">
              {recipients.length === 0 ? (
                <p className="text-sm text-gray-400 py-2 px-1">
                  No users with an iOS push token match this filter.
                </p>
              ) : (
                recipients.map((r) => (
                  <label
                    key={r.userId}
                    className="flex items-center gap-2 text-sm text-gray-800 py-1 px-1 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(r.userId)}
                      onChange={() => toggleUser(r.userId)}
                      className="rounded border-gray-300"
                    />
                    <span className="font-medium">{r.username ?? "—"}</span>
                    {r.email ? (
                      <span className="text-gray-500 text-xs truncate">
                        {r.email}
                      </span>
                    ) : null}
                    <span className="text-gray-400 text-xs font-mono ml-auto shrink-0">
                      {r.userId.slice(-6)}
                    </span>
                  </label>
                ))
              )}
            </div>
          )}
          {recipients.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Showing {recipients.length} user(s).{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => {
                  if (allSelected) clearSelection();
                  else setSelected(new Set(allIds));
                }}
              >
                {allSelected ? "Deselect all visible" : "Select all visible"}
              </button>
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              maxLength={120}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification image URL (optional)
            </label>
            <input
              type="url"
              inputMode="url"
              placeholder="https://…/photo.jpg"
              value={notificationImageUrl}
              onChange={(e) => setNotificationImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Direct HTTPS link to an image (JPEG/PNG). iOS shows it beside the
              text like other rich notifications once the app implements a
              Notification Service Extension reading{" "}
              <code className="rounded bg-gray-100 px-0.5">imageUrl</code>.
              Prefer HTTPS and a URL that does not require cookies.
            </p>
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            Schedule
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="sched"
              checked={schedule === "immediate"}
              onChange={() => setSchedule("immediate")}
            />
            Send immediately
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="sched"
              checked={schedule === "scheduled"}
              onChange={() => setSchedule("scheduled")}
            />
            Schedule (local time + timezone)
          </label>
        </fieldset>

        {schedule === "scheduled" && (
          <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Local date
                </label>
                <input
                  type="date"
                  value={localDate}
                  onChange={(e) => setLocalDate(e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                  required={schedule === "scheduled"}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Local time
                </label>
                <input
                  type="time"
                  value={localTime}
                  onChange={(e) => setLocalTime(e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                  required={schedule === "scheduled"}
                />
              </div>
              <div className="min-w-[200px] flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Timezone (IANA)
                </label>
                <input
                  list="manual-push-tz"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-mono"
                  required={schedule === "scheduled"}
                />
                <datalist id="manual-push-tz">
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz} />
                  ))}
                </datalist>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={deliveryWindowEnabled}
                onChange={(e) => setDeliveryWindowEnabled(e.target.checked)}
              />
              Snap into delivery window (local hours, half-open interval [
              start, end) )
            </label>
            {deliveryWindowEnabled && (
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-600">
                    Start hour
                  </label>
                  <select
                    value={windowStartHour}
                    onChange={(e) => setWindowStartHour(Number(e.target.value))}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600">
                    End hour
                  </label>
                  <select
                    value={windowEndHour}
                    onChange={(e) => setWindowEndHour(Number(e.target.value))}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            APNs custom data (optional JSON)
          </label>
          <textarea
            value={deepLinkJson}
            onChange={(e) => setDeepLinkJson(e.target.value)}
            rows={2}
            placeholder='{"screen":"home"}'
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || recipientsLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting
            ? "Working…"
            : schedule === "immediate"
              ? "Send push"
              : "Schedule push"}
        </button>
      </form>
    </section>
  );
}
