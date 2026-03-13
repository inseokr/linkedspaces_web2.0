"use client";

import { useState } from "react";
import type { WaitlistEntry } from "@/api/waitlist";
import { updateUserLevel } from "@/api/waitlist";

type ActionState = "idle" | "loading" | "done" | "error";

type RowAction = {
  state: ActionState;
  label: string; // what was done: "Allowed" | "Rejected"
  error?: string;
};

type Props = {
  waitlist: WaitlistEntry[];
  premiumCount: number;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function DashboardWaitlist({
  waitlist,
  premiumCount,
  loading,
  error,
  onRefresh,
}: Props) {
  // Per-row action states keyed by email (unique in waitlist)
  const [rowActions, setRowActions] = useState<Record<string, RowAction>>({});

  function setRowAction(email: string, action: RowAction) {
    setRowActions((prev) => ({ ...prev, [email]: action }));
  }

  async function handleAllow(entry: WaitlistEntry) {
    setRowAction(entry.email, { state: "loading", label: "Allowing…" });
    try {
      await updateUserLevel(entry.userName, entry.email, "premium");
      setRowAction(entry.email, { state: "done", label: "Allowed" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to allow user";
      setRowAction(entry.email, { state: "error", label: "Error", error: msg });
    }
  }

  async function handleReject(entry: WaitlistEntry) {
    setRowAction(entry.email, { state: "loading", label: "Rejecting…" });
    try {
      await updateUserLevel(entry.userName, entry.email, "normal");
      setRowAction(entry.email, { state: "done", label: "Rejected" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject user";
      setRowAction(entry.email, { state: "error", label: "Error", error: msg });
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Premium Service Waitlist
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage requests for cloud / web premium access
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
          <div className="text-xs font-medium text-gray-500">In Waitlist</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {loading ? "—" : waitlist.length}
          </div>
          <div className="text-xs text-gray-400">Pending requests</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
          <div className="text-xs font-medium text-gray-500">
            Premium Accounts
          </div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {loading ? "—" : premiumCount}
          </div>
          <div className="text-xs text-gray-400">Currently active</div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Waitlist table */}
      <div className="mt-4">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">
            Loading waitlist…
          </div>
        ) : waitlist.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
            No one in the waitlist yet.
          </div>
        ) : (
          /* max-h ~25vh, scrollable */
          <div
            className="overflow-auto rounded-lg border border-gray-200"
            style={{ maxHeight: "25vh" }}
          >
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Registered
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {waitlist.map((entry) => {
                  const row = rowActions[entry.email];
                  const isDone = row?.state === "done";
                  const isLoading = row?.state === "loading";
                  const isError = row?.state === "error";

                  return (
                    <tr
                      key={entry.email}
                      className={isDone ? "bg-gray-50 opacity-60" : ""}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-gray-900">
                        {entry.userName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                        {entry.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
                        {formatDate(entry.registeredAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        {isDone ? (
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              row.label === "Allowed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {row.label}
                          </span>
                        ) : isError ? (
                          <span
                            className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"
                            title={row.error}
                          >
                            Error
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleAllow(entry)}
                              className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              {isLoading ? "…" : "Allow"}
                            </button>
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleReject(entry)}
                              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {isLoading ? "…" : "Reject"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
