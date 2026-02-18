"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCachedUser, type User } from "@/api/user";
import { getHomeDirectFriendUsernames } from "@/lib/homeNetworkData";
import { getUserVisitHistory, getFriendsTrips } from "@/api/lsHomeApi";
import type { LsFriendsVisitEntry, LsTrip } from "@/api/lsHomeApi";

export interface FriendsNetworkState {
  /** Raw visit history entries from all direct friends. null = not loaded yet. */
  visitEntries: LsFriendsVisitEntry[] | null;
  /** Friends' trips for recap. null = not loaded yet. */
  trips: LsTrip[] | null;
  loading: boolean;
}

const initialState: FriendsNetworkState = {
  visitEntries: null,
  trips: null,
  loading: false,
};

const FriendsNetworkContext = createContext<FriendsNetworkState>(initialState);

function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;
  const workers = new Array(Math.min(limit, items.length))
    .fill(0)
    .map(async () => {
      while (true) {
        const i = idx++;
        if (i >= items.length) return;
        results[i] = await fn(items[i]);
      }
    });
  return Promise.all(workers).then(() => results);
}

export function FriendsNetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<FriendsNetworkState>(initialState);

  useEffect(() => {
    queueMicrotask(() => setUser(getCachedUser()));
  }, []);

  useEffect(() => {
    if (!user?.username) {
      queueMicrotask(() =>
        setState((s) =>
          s.visitEntries === null && s.trips === null
            ? s
            : { ...initialState, loading: false },
        ),
      );
      return;
    }

    const friendUsernames = getHomeDirectFriendUsernames(user);
    const normalized = friendUsernames
      .map((u) =>
        String(u ?? "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
    const allowed = normalized.length > 0 ? new Set(normalized) : null;
    const friendUsernamesUnique = Array.from(
      friendUsernames.reduce((acc, u) => {
        const t = String(u ?? "").trim();
        if (!t) return acc;
        const key = t.toLowerCase();
        if (!acc.has(key)) acc.set(key, t);
        return acc;
      }, new Map<string, string>()),
    ).map(([, v]) => v);

    if (friendUsernamesUnique.length === 0) {
      queueMicrotask(() =>
        setState({
          visitEntries: [],
          trips: [],
          loading: false,
        }),
      );
      return;
    }

    let cancelled = false;
    queueMicrotask(() => setState((s) => ({ ...s, loading: true })));

    (async () => {
      const bulkTripsPromise = getFriendsTrips(user.username!);
      const perFriend = await mapWithConcurrency(
        friendUsernamesUnique,
        4,
        async (friendUsername) => {
          const visitRes = await getUserVisitHistory(friendUsername, {
            showAll: true,
          });
          return { friendUsername, visitRes };
        },
      );

      if (cancelled) return;

      const tripsRes = await bulkTripsPromise;
      if (cancelled) return;

      const visitEntries = perFriend.flatMap((r) =>
        r.visitRes.success
          ? r.visitRes.data.map((e) => ({
              ...e,
              username:
                String(e?.username ?? r.friendUsername ?? "unknown").trim() ||
                "unknown",
            }))
          : [],
      );
      const visitEntriesFiltered =
        allowed != null
          ? visitEntries.filter((e) =>
              allowed.has(
                String(e?.username ?? "")
                  .trim()
                  .toLowerCase(),
              ),
            )
          : visitEntries;

      const trips = tripsRes.success ? tripsRes.data : [];
      const tripsFiltered =
        allowed != null
          ? trips.filter((t) => {
              const owner = String(
                (t as any)?.username ?? (t as any)?.owner ?? "",
              )
                .trim()
                .toLowerCase();
              return owner ? allowed.has(owner) : false;
            })
          : trips;

      if (!cancelled) {
        setState({
          visitEntries: visitEntriesFiltered,
          trips: tripsFiltered,
          loading: false,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <FriendsNetworkContext.Provider value={state}>
      {children}
    </FriendsNetworkContext.Provider>
  );
}

export function useFriendsNetwork(): FriendsNetworkState {
  const value = useContext(FriendsNetworkContext);
  return value ?? initialState;
}
