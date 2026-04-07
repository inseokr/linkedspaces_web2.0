"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  createPushRule,
  fetchPushRules,
  fetchPushRulesStats,
  purgeAnalyticsEvents,
  updatePushRule,
  type PushNotificationRuleDTO,
  type PushRulesStatsResponse,
  type PushRuleStatsByRuleRow,
} from "@/api/admin-dashboard";

type EventOption = {
  name: string;
  label: string;
  description: string;
  category: string;
};

// All events emitted by the iOS client (AnalyticsEventType.swift) plus
// server-side / legacy events still in use.
const EVENT_OPTIONS: EventOption[] = [
  // ── App-level ─────────────────────────────────────────────────────────────
  {
    category: "App",
    name: "App-Open",
    label: "App-Open",
    description: "App launched (cold start). Good trigger for re-engagement.",
  },
  {
    category: "App",
    name: "App-InAppCamera-Open",
    label: "App-InAppCamera-Open",
    description: "In-app camera opened.",
  },
  {
    category: "App",
    name: "App-InAppCamera-PhotoTaken",
    label: "App-InAppCamera-PhotoTaken",
    description: "Photo taken via in-app camera.",
  },
  {
    category: "App",
    name: "App-InAppCamera-VibeON",
    label: "App-InAppCamera-VibeON",
    description: "Vibe mode enabled in the camera.",
  },
  {
    category: "App",
    name: "App-InAppCamera-Caption",
    label: "App-InAppCamera-Caption",
    description: "Caption added via in-app camera.",
  },

  // ── Blog lifecycle ─────────────────────────────────────────────────────────
  {
    category: "Blog lifecycle",
    name: "Blog-Scan",
    label: "Blog-Scan",
    description:
      "User scans photos to create a blog. Start of the lifecycle — good trigger for a finish-up reminder.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Save",
    label: "Blog-Save",
    description:
      "User saves a blog. Strong cancel signal for draft-reminder rules.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Delete",
    label: "Blog-Delete",
    description:
      "Blog deleted. Use as a cancel signal to avoid sending push for deleted content.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Share-PDF",
    label: "Blog-Share-PDF",
    description: "Blog shared as a PDF.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Share-Nearby",
    label: "Blog-Share-Nearby",
    description: "Blog shared via Nearby.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Play-Slideshow",
    label: "Blog-Play-Slideshow",
    description: "Slideshow played for a blog.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Pick-CoverPhoto",
    label: "Blog-Pick-CoverPhoto",
    description: "User picked a cover photo.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Change-BlogTitle",
    label: "Blog-Change-BlogTitle",
    description: "Blog title changed.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Split",
    label: "Blog-Split",
    description: "Blog split into multiple blogs.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Merge",
    label: "Blog-Merge",
    description: "Blogs merged together.",
  },

  // ── Place actions ──────────────────────────────────────────────────────────
  {
    category: "Place actions",
    name: "Blog-Place-ChangeName",
    label: "Blog-Place-ChangeName",
    description: "Place name change initiated.",
  },
  {
    category: "Place actions",
    name: "Blog-Place-ChangeName-ClickPoi",
    label: "Blog-Place-ChangeName-ClickPoi",
    description: "Place renamed by tapping a POI suggestion.",
  },
  {
    category: "Place actions",
    name: "Blog-Place-ChangeName-Custom",
    label: "Blog-Place-ChangeName-Custom",
    description: "Place renamed with a custom text entry.",
  },
  {
    category: "Place actions",
    name: "Blog-Place-ChangeName-AutoComplete",
    label: "Blog-Place-ChangeName-AutoComplete",
    description: "Place renamed via autocomplete selection.",
  },
  {
    category: "Place actions",
    name: "Blog-Place-Photo-ManagePhoto",
    label: "Blog-Place-Photo-ManagePhoto",
    description: "Place photo management sheet opened.",
  },

  // ── Stories ────────────────────────────────────────────────────────────────
  {
    category: "Stories",
    name: "Blog-Place-Story",
    label: "Blog-Place-Story",
    description: "Story generated/viewed for a place.",
  },
  {
    category: "Stories",
    name: "Blog-Place-Photo-Story",
    label: "Blog-Place-Photo-Story",
    description: "Story generated/viewed for a specific photo.",
  },
  {
    category: "Stories",
    name: "Blog-Day-Story",
    label: "Blog-Day-Story",
    description: "Day-level story generated/viewed.",
  },
  {
    category: "Stories",
    name: "Blog-Story",
    label: "Blog-Story",
    description: "Full blog story generated/viewed.",
  },
  {
    category: "Stories",
    name: "Blog-Story-AIStory",
    label: "Blog-Story-AIStory",
    description: "AI story generated for a blog.",
  },
  {
    category: "Stories",
    name: "Blog-Sentiment-Adjustment",
    label: "Blog-Sentiment-Adjustment",
    description: "Blog sentiment adjusted by the user.",
  },

  // ── More Memories ──────────────────────────────────────────────────────────
  {
    category: "More Memories",
    name: "Blog-MoreMemories",
    label: "Blog-MoreMemories",
    description: "More Memories section opened.",
  },
  {
    category: "More Memories",
    name: "Blog-MoreMemories-CreateBlog",
    label: "Blog-MoreMemories-CreateBlog",
    description: "New blog created from More Memories.",
  },

  // ── Legacy / server-side ───────────────────────────────────────────────────
  {
    category: "Legacy",
    name: "blog_created",
    label: "blog_created",
    description:
      "Server-side: user creates a trip draft. Keep while server still emits this.",
  },
  {
    category: "Legacy",
    name: "blog_saved",
    label: "blog_saved",
    description:
      "Server-side: user saves a blog. Good cancel signal alongside Blog-Save.",
  },
  {
    category: "Legacy",
    name: "in_app_camera_used",
    label: "in_app_camera_used",
    description: "Server-side / legacy: in-app camera used.",
  },
];

// Curated list for the trigger dropdown — only events that make sense as
// a push notification trigger (i.e. a meaningful user intent moment).
const TRIGGER_EVENT_OPTIONS: EventOption[] = [
  {
    category: "Blog lifecycle",
    name: "Blog-Scan",
    label: "Blog-Scan",
    description:
      "User scans photos to start a blog. Best trigger for a 'finish your blog' reminder.",
  },
  {
    category: "Blog lifecycle",
    name: "blog_created",
    label: "blog_created",
    description:
      "Server-side: user creates a trip draft. Start of the blog lifecycle.",
  },
  {
    category: "Blog lifecycle",
    name: "Blog-Save",
    label: "Blog-Save",
    description:
      "User saves a blog. Trigger for a follow-up nudge (e.g. share or complete).",
  },
  {
    category: "In-app camera",
    name: "App-InAppCamera-Open",
    label: "App-InAppCamera-Open",
    description:
      "In-app camera opened. Good trigger for a 'turn your photos into a blog' reminder.",
  },
  {
    category: "In-app camera",
    name: "App-InAppCamera-PhotoTaken",
    label: "App-InAppCamera-PhotoTaken",
    description:
      "Photo taken via in-app camera. More specific engagement signal than camera open.",
  },
];

const TRIGGER_EVENT_CATEGORIES = Array.from(
  new Set(TRIGGER_EVENT_OPTIONS.map((e) => e.category)),
);

const EVENT_CATEGORIES = Array.from(
  new Set(EVENT_OPTIONS.map((e) => e.category)),
);

const ALL_EVENT_OPTIONS_BY_NAME = new Map(
  [...TRIGGER_EVENT_OPTIONS, ...EVENT_OPTIONS].map((e) => [e.name, e] as const),
);

function formatDelay(ms: number): string {
  if (ms >= 86400000) {
    const d = ms / 86400000;
    return `${d % 1 === 0 ? d : d.toFixed(1)} d`;
  }
  if (ms >= 3600000) {
    const h = ms / 3600000;
    return `${h % 1 === 0 ? h : h.toFixed(1)} h`;
  }
  if (ms >= 60000) return `${Math.round(ms / 60000)} min`;
  return `${ms} ms`;
}

function formatLocalDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function formatRemainingUntilSend(
  pendingCount: number,
  nextRemainingMs: number | null | undefined,
  nextSendAt: string | null | undefined,
): string {
  if (!pendingCount) return "—";
  if (nextRemainingMs != null) {
    if (nextRemainingMs <= 0) {
      if (nextSendAt) {
        const t = new Date(nextSendAt).getTime();
        if (!Number.isNaN(t) && t < Date.now()) return "overdue (pending)";
      }
      return "due now";
    }
    return `in ${formatDelay(nextRemainingMs)}`;
  }
  return "—";
}

export default function DashboardPushRules() {
  const [rules, setRules] = useState<PushNotificationRuleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState<PushRulesStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsDays, setStatsDays] = useState(30);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const [purgeBeforeDays, setPurgeBeforeDays] = useState("90");
  const [purgeEventName, setPurgeEventName] = useState("");
  const [purgeUserId, setPurgeUserId] = useState("");
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [triggerEvent, setTriggerEvent] = useState<string>("blog_created");
  const [delayHours, setDelayHours] = useState(72);
  const [titleTemplate, setTitleTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [cancelEventNames, setCancelEventNames] = useState<string[]>([
    "blog_saved",
    "Blog-Save",
  ]);
  const [correlationProperty, setCorrelationProperty] =
    useState("sourceTripId");
  const [deepLinkJson, setDeepLinkJson] = useState("");
  const [deliveryWindowEnabled, setDeliveryWindowEnabled] = useState(false);
  const [deliveryWindowStartHour, setDeliveryWindowStartHour] = useState(21);
  const [deliveryWindowEndHour, setDeliveryWindowEndHour] = useState(23);

  const loadRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPushRules();
      if (res.result !== "OK") throw new Error("Failed to load rules");
      setRules(res.rules ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load push rules");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetchPushRulesStats({ days: statsDays, userLimit: 10 });
      if (res.result !== "OK") throw new Error("Failed to load push stats");
      setStats(res);
    } catch (e) {
      setStatsError(
        e instanceof Error ? e.message : "Failed to load push stats",
      );
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [statsDays]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadRules(), loadStats()]);
  }, [loadRules, loadStats]);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const statsByRuleId = useMemo(() => {
    const m = new Map<string, PushRuleStatsByRuleRow>();
    for (const row of stats?.rules ?? []) {
      m.set(row.ruleId, row);
    }
    return m;
  }, [stats]);

  function resetForm() {
    setEditingRuleId(null);
    setName("");
    setTriggerEvent("blog_created");
    setDelayHours(72);
    setTitleTemplate("");
    setBodyTemplate("");
    setCancelEventNames(["blog_saved", "Blog-Save"]);
    setCorrelationProperty("sourceTripId");
    setDeepLinkJson("");
    setDeliveryWindowEnabled(false);
    setDeliveryWindowStartHour(21);
    setDeliveryWindowEndHour(23);
  }

  function startEdit(rule: PushNotificationRuleDTO) {
    setEditingRuleId(rule._id);
    setName(rule.name ?? "");
    setTriggerEvent(rule.triggerEvent ?? "blog_created");
    setDelayHours(rule.delayMs != null ? rule.delayMs / 3600000 : 0);
    setTitleTemplate(rule.titleTemplate ?? "");
    setBodyTemplate(rule.bodyTemplate ?? "");
    setCancelEventNames(
      Array.isArray(rule.cancelEventNames) ? rule.cancelEventNames : [],
    );
    setCorrelationProperty(rule.correlationProperty ?? "");
    setDeepLinkJson(
      rule.deepLinkPayload ? JSON.stringify(rule.deepLinkPayload, null, 2) : "",
    );
    setDeliveryWindowEnabled(rule.deliveryWindowEnabled ?? false);
    setDeliveryWindowStartHour(rule.deliveryWindowStartHour ?? 21);
    setDeliveryWindowEndHour(rule.deliveryWindowEndHour ?? 23);
    // Move focus to the form area for faster edits.
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document.getElementById("push-rule-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  function toggleCancelEvent(name: string) {
    setCancelEventNames((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const delayMs = Math.round(Number(delayHours) * 3600000);
      if (!Number.isFinite(delayMs) || delayMs < 0) {
        throw new Error("Invalid delay");
      }
      let deepLinkPayload: Record<string, unknown> | undefined;
      if (deepLinkJson.trim()) {
        deepLinkPayload = JSON.parse(deepLinkJson) as Record<string, unknown>;
      }

      const baseBody = {
        name: name.trim(),
        triggerEvent: triggerEvent.trim(),
        delayMs,
        titleTemplate: titleTemplate.trim(),
        bodyTemplate: bodyTemplate.trim(),
        userType: "bloggo",
        cancelEventNames,
        correlationProperty:
          correlationProperty.trim() === "" ? null : correlationProperty.trim(),
        deepLinkPayload,
        deliveryWindowEnabled,
        deliveryWindowStartHour,
        deliveryWindowEndHour,
      } as const;

      if (editingRuleId) {
        // Enhancement: allow updating existing rules (timer + title/body, etc.)
        await updatePushRule(editingRuleId, {
          ...baseBody,
        });
      } else {
        await createPushRule({
          ...baseBody,
          enabled: true,
        });
      }

      resetForm();
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save rule");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(rule: PushNotificationRuleDTO) {
    setSaving(true);
    setError(null);
    try {
      await updatePushRule(rule._id, { enabled: !rule.enabled });
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function purgeFiltersBody(): {
    beforeDays?: number;
    eventName?: string;
    userId?: string;
  } {
    const beforeDays =
      purgeBeforeDays.trim() === ""
        ? undefined
        : Math.round(Number(purgeBeforeDays));
    const eventName = purgeEventName.trim() || undefined;
    const userId = purgeUserId.trim() || undefined;
    const out: { beforeDays?: number; eventName?: string; userId?: string } =
      {};
    if (beforeDays != null && Number.isFinite(beforeDays) && beforeDays > 0) {
      out.beforeDays = beforeDays;
    }
    if (eventName) out.eventName = eventName;
    if (userId) out.userId = userId;
    return out;
  }

  async function runPurgePreview() {
    setPurgeMessage(null);
    setPurging(true);
    try {
      const filters = purgeFiltersBody();
      if (filters.beforeDays == null && !filters.eventName && !filters.userId) {
        throw new Error(
          "Set at least one filter: Before (days), Event name, or User ID",
        );
      }
      const res = await purgeAnalyticsEvents({ ...filters, dryRun: true });
      if (res.result !== "OK") {
        throw new Error(res.reason ?? "Purge preview failed");
      }
      setPurgeMessage(
        `Dry run: ${res.matched} event(s) would be deleted. Confirm below to execute.`,
      );
    } catch (e) {
      setPurgeMessage(e instanceof Error ? e.message : "Purge preview failed");
    } finally {
      setPurging(false);
    }
  }

  async function runPurgeExecute() {
    setPurgeMessage(null);
    setPurging(true);
    try {
      const filters = purgeFiltersBody();
      if (filters.beforeDays == null && !filters.eventName && !filters.userId) {
        throw new Error(
          "Set at least one filter: Before (days), Event name, or User ID",
        );
      }
      const ok = window.confirm(
        `Delete up to matched analytics events for filter ${JSON.stringify(filters)}? This cannot be undone.`,
      );
      if (!ok) return;
      const res = await purgeAnalyticsEvents({ ...filters, dryRun: false });
      if (res.result !== "OK") {
        throw new Error(res.reason ?? "Purge failed");
      }
      setPurgeMessage(`Deleted ${res.deleted} event(s).`);
    } catch (e) {
      setPurgeMessage(e instanceof Error ? e.message : "Purge failed");
    } finally {
      setPurging(false);
    }
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-1">
        Delayed push notification rules
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Rules are evaluated on analytics events (
        <code className="bg-gray-100 px-1 rounded">POST /analytics/events</code>
        ). Use{" "}
        <code className="bg-gray-100 px-1 rounded">{"{{blogTitle}}"}</code>{" "}
        style placeholders from event properties. Correlation: set{" "}
        <code className="bg-gray-100 px-1">sourceTripId</code> to scope cancel
        to the same blog; leave empty to cancel all pending jobs for this rule
        when a cancel event fires.
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-3" role="alert">
          {error}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
        <div className="text-xs text-gray-600">
          <span className="font-medium text-gray-800">
            Scheduled push stats
          </span>
          <span className="text-gray-400"> · </span>
          <span>
            Window: jobs created in the last{" "}
            <label className="inline-flex items-center gap-1">
              <select
                value={statsDays}
                onChange={(e) => setStatsDays(Number(e.target.value))}
                className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs"
              >
                {[7, 30, 90].map((d) => (
                  <option key={d} value={d}>
                    {d}d
                  </option>
                ))}
              </select>
            </label>
            . “Fired” = APNs send attempted (
            <code className="rounded bg-white px-1">sent</code> /{" "}
            <code className="rounded bg-white px-1">failed</code>
            ).
          </span>
        </div>
        <button
          type="button"
          disabled={statsLoading || saving}
          onClick={() => void loadStats()}
          className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          {statsLoading ? "Refreshing stats…" : "Refresh stats"}
        </button>
      </div>

      {statsError && (
        <p className="text-sm text-amber-700 mb-3" role="status">
          {statsError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 py-4">Loading rules…</p>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Trigger</th>
                <th className="py-2 pr-3">Delay</th>
                <th className="py-2 pr-3">Correlation</th>
                <th className="py-2 pr-3">Window</th>
                <th className="py-2 pr-3">Enabled</th>
                <th className="py-2"> </th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-gray-400">
                    No rules yet.
                  </td>
                </tr>
              ) : (
                rules.map((r) => {
                  return (
                    <tr key={r._id} className="border-b border-gray-100">
                      <td className="py-2 pr-3 font-medium text-gray-900">
                        {r.name}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {r.triggerEvent}
                      </td>
                      <td className="py-2 pr-3">{formatDelay(r.delayMs)}</td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {r.correlationProperty ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-xs whitespace-nowrap">
                        {r.deliveryWindowEnabled ? (
                          <span className="text-indigo-700 font-medium">
                            {r.deliveryWindowStartHour}–
                            {r.deliveryWindowEndHour}h local
                          </span>
                        ) : (
                          <span className="text-gray-400">off</span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {r.enabled ? (
                          <span className="text-green-700">yes</span>
                        ) : (
                          <span className="text-gray-400">no</span>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => startEdit(r)}
                            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void toggleEnabled(r)}
                            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                          >
                            {r.enabled ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && stats && stats.events.length > 0 && (
        <div className="mb-6 overflow-x-auto rounded-lg border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-800">
            By trigger event (aggregated across rules)
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 px-3">Event</th>
                <th className="py-2 pr-3">
                  <span className="whitespace-nowrap">Pending jobs</span>
                </th>
                <th className="py-2 pr-3">
                  <span className="whitespace-nowrap">Send attempts</span>
                </th>
                <th className="py-2 pr-3">Users (pending)</th>
                <th className="py-2 pr-3">
                  <span className="whitespace-nowrap">Next pending job</span>
                </th>
                <th className="py-2 pr-3">
                  <span className="whitespace-nowrap">Time to next</span>
                </th>
                <th className="py-2 pr-3"> </th>
              </tr>
            </thead>
            <tbody>
              {stats.events.map((ev) => {
                const fired = ev.counts.sent + ev.counts.failed;
                const open = expandedEvent === ev.triggerEvent;
                return (
                  <Fragment key={ev.triggerEvent}>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3 font-mono text-xs">
                        {ev.triggerEvent}
                      </td>
                      <td className="py-2 pr-3">{ev.counts.pending}</td>
                      <td className="py-2 pr-3">{fired}</td>
                      <td className="py-2 pr-3">{ev.uniqueUsersPending}</td>
                      <td className="py-2 pr-3 text-xs whitespace-nowrap">
                        {formatLocalDateTime(ev.nextSendAt)}
                      </td>
                      <td className="py-2 pr-3 text-xs">
                        {formatRemainingUntilSend(
                          ev.counts.pending,
                          ev.nextRemainingMs,
                          ev.nextSendAt,
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <button
                          type="button"
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() =>
                            setExpandedEvent(open ? null : ev.triggerEvent)
                          }
                        >
                          {open ? "Hide users" : "Per-user"}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan={7}
                          className="px-3 py-2 text-xs text-gray-600"
                        >
                          <div className="font-medium text-gray-800 mb-1">
                            Top users (pending / sent / failed / cancelled)
                          </div>
                          {ev.topUsers.length === 0 ? (
                            <p>No user breakdown in this window.</p>
                          ) : (
                            <ul className="space-y-1 font-mono text-[11px]">
                              {ev.topUsers.map((u) => (
                                <li key={u.userId}>
                                  {u.username ?? "—"} (
                                  {u.userId.length > 12
                                    ? `${u.userId.slice(0, 8)}…`
                                    : u.userId}
                                  ) · pending {u.pending}, sent {u.sent}, failed{" "}
                                  {u.failed}, cancelled {u.cancelled}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-red-200 bg-red-50/60 p-4">
        <h3 className="text-sm font-semibold text-red-900">
          Danger zone: purge analytics events
        </h3>
        <p className="mt-1 text-xs text-red-800/90">
          Deletes rows from the analytics event store. Requires at least one
          filter. Use <strong>Preview (dry run)</strong> first. Backend:{" "}
          <code className="rounded bg-white px-1">
            POST /admin/dashboard/analytics/purge
          </code>
          .
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block text-xs text-gray-700">
            Older than (days)
            <input
              value={purgeBeforeDays}
              onChange={(e) => setPurgeBeforeDays(e.target.value)}
              placeholder="e.g. 90"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-xs text-gray-700">
            Event name (optional)
            <input
              value={purgeEventName}
              onChange={(e) => setPurgeEventName(e.target.value)}
              placeholder="e.g. blog_created"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm font-mono"
            />
          </label>
          <label className="block text-xs text-gray-700">
            User ID (optional)
            <input
              value={purgeUserId}
              onChange={(e) => setPurgeUserId(e.target.value)}
              placeholder="Mongo userId"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm font-mono"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={purging}
            onClick={() => void runPurgePreview()}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            Preview (dry run)
          </button>
          <button
            type="button"
            disabled={purging}
            onClick={() => void runPurgeExecute()}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Purge for real
          </button>
        </div>
        {purgeMessage && (
          <p className="mt-2 text-xs text-red-900" role="status">
            {purgeMessage}
          </p>
        )}
      </div>

      <form
        id="push-rule-form"
        onSubmit={handleSubmit}
        className="space-y-3 border-t border-gray-100 pt-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-800">
            {editingRuleId ? "Edit rule" : "Create rule"}
          </h3>
          {editingRuleId && (
            <button
              type="button"
              disabled={saving}
              onClick={() => resetForm()}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel edit
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-gray-600">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="Finish blog reminder"
            />
          </label>
          <label className="block text-xs text-gray-600">
            Trigger event
            <select
              required
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono bg-white"
            >
              {TRIGGER_EVENT_CATEGORIES.map((cat) => (
                <optgroup key={cat} label={cat}>
                  {TRIGGER_EVENT_OPTIONS.filter(
                    (ev) => ev.category === cat,
                  ).map((ev) => (
                    <option key={ev.name} value={ev.name}>
                      {ev.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-gray-500">
              {ALL_EVENT_OPTIONS_BY_NAME.get(triggerEvent)?.description ?? ""}
            </span>
          </label>
        </div>
        <label className="block text-xs text-gray-600">
          Delay (hours)
          <input
            type="number"
            min={0}
            step={0.5}
            required
            value={delayHours}
            onChange={(e) => setDelayHours(Number(e.target.value))}
            className="mt-1 w-full max-w-xs rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs text-gray-600">
          Title template
          <input
            required
            value={titleTemplate}
            onChange={(e) => setTitleTemplate(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="Your blog is waiting to be told"
          />
        </label>
        <label className="block text-xs text-gray-600">
          Body template
          <textarea
            required
            rows={2}
            value={bodyTemplate}
            onChange={(e) => setBodyTemplate(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="Finish your blog from {{locationLabel}} before the details fade."
          />
        </label>
        <div className="block text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>Cancel events</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => setCancelEventNames([])}
              className="text-[11px] text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="mt-1 space-y-3">
            {EVENT_CATEGORIES.map((cat) => (
              <div key={cat}>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {cat}
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {EVENT_OPTIONS.filter((ev) => ev.category === cat).map(
                    (ev) => (
                      <label
                        key={ev.name}
                        className="flex gap-2 rounded border border-gray-200 px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={cancelEventNames.includes(ev.name)}
                          onChange={() => toggleCancelEvent(ev.name)}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="min-w-0">
                          <span className="block font-mono text-[12px] text-gray-800">
                            {ev.label}
                          </span>
                          <span className="block text-[11px] text-gray-500">
                            {ev.description}
                          </span>
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
          <span className="mt-2 block text-[11px] text-gray-500">
            Cancel events are evaluated for the same user. If{" "}
            <code className="bg-gray-100 px-1 rounded">
              correlationProperty
            </code>{" "}
            is set, cancellation will also require matching that property value
            (e.g. same{" "}
            <code className="bg-gray-100 px-1 rounded">sourceTripId</code>
            ).
          </span>
        </div>
        <label className="block text-xs text-gray-600">
          Correlation property (empty = cancel all pending for user on cancel
          event)
          <input
            value={correlationProperty}
            onChange={(e) => setCorrelationProperty(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
            placeholder="sourceTripId"
          />
        </label>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-gray-800">
                Delivery window
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                When enabled,{" "}
                <code className="bg-white px-1 rounded">sendAt</code> is snapped
                forward to the next occurrence of the window in the user&apos;s
                local timezone (sent by the device). Ideal for 9–11 PM downtime
                delivery.
              </p>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0 ml-3">
              <input
                type="checkbox"
                checked={deliveryWindowEnabled}
                onChange={(e) => setDeliveryWindowEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
              <span className="text-xs text-gray-700">Enable</span>
            </label>
          </div>
          {deliveryWindowEnabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-gray-600">
                Window start (local hour, 0–23)
                <input
                  type="number"
                  min={0}
                  max={23}
                  step={1}
                  value={deliveryWindowStartHour}
                  onChange={(e) =>
                    setDeliveryWindowStartHour(Number(e.target.value))
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
                <span className="mt-1 block text-[11px] text-gray-400">
                  e.g. 21 = 9 PM
                </span>
              </label>
              <label className="block text-xs text-gray-600">
                Window end (local hour, 1–24)
                <input
                  type="number"
                  min={1}
                  max={24}
                  step={1}
                  value={deliveryWindowEndHour}
                  onChange={(e) =>
                    setDeliveryWindowEndHour(Number(e.target.value))
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
                <span className="mt-1 block text-[11px] text-gray-400">
                  e.g. 23 = 11 PM (exclusive upper bound)
                </span>
              </label>
            </div>
          )}
        </div>

        <label className="block text-xs text-gray-600">
          Deep link payload (optional JSON, merged into APNs data)
          <textarea
            rows={2}
            value={deepLinkJson}
            onChange={(e) => setDeepLinkJson(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
            placeholder='{"screen":"editor"}'
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : editingRuleId ? "Update rule" : "Create rule"}
        </button>
      </form>
    </section>
  );
}
