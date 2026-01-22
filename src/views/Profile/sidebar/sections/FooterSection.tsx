"use client";

type Props = {
  onMinimize?: () => void;
  onLogout?: () => void;
  className?: string;
};

export default function FooterSection({
  onMinimize,
  onLogout,
  className,
}: Props) {
  return (
    <div className={className ?? "p-3"}>
      <button
        type="button"
        onClick={onLogout}
        className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      >
        Log out
      </button>
    </div>
  );
}
