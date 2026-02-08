"use client";

import Button from "@/components/ui/Button";

export interface PulseCardProps {
  onInviteFriends?: () => void;
}

export default function PulseCard({ onInviteFriends }: PulseCardProps) {
  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-[var(--card-text)]">
        Invited Pulses
      </h2>
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-white shadow-sm"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          background:
            "linear-gradient(135deg, rgba(7,152,255,0.04) 0%, rgba(255,255,255,1) 50%)",
        }}
      >
        <div className="relative p-6 sm:p-8">
          <h3 className="text-xl font-bold text-[var(--card-text)]">
            Introducing Pulse
          </h3>
          <p className="mt-2 text-[var(--card-text-muted)]">
            Follow friends&apos; trips in real time. Travel together, no matter
            where you are.
          </p>
          <p className="mt-4 text-sm text-[var(--card-text-muted)]">
            No Pulse invitations yet! Wait for friends to invite you to their
            adventures.
          </p>
          <div className="mt-6">
            <Button
              type="button"
              onClick={onInviteFriends}
              variant="main"
              radius="md"
              className="px-5 py-2.5"
            >
              Invite Friends
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
