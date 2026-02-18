"use client";

import Button from "@/components/ui/Button";
import { Users } from "lucide-react";

export interface ExploreEmptyStateProps {
  onFindFriends?: () => void;
}

export default function ExploreEmptyState({
  onFindFriends,
}: ExploreEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-main)]/15 text-[var(--color-main)]">
        <Users className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-[var(--card-text)]">
        Follow friends to see their Moments here
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--card-text-muted)]">
        When your friends share places and recaps, they’ll show up here so you
        can discover what’s trending in your network.
      </p>
      {onFindFriends && (
        <Button
          type="button"
          variant="main"
          radius="full"
          className="mt-6"
          onClick={onFindFriends}
        >
          Find Friends
        </Button>
      )}
    </div>
  );
}
