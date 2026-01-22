"use client";

import { useAuth } from "@/hooks/useAuth";

// Define the Props type clearly to resolve the 'unresolved' error
interface FooterSectionProps {
  className?: string;
  onLogout?: () => void;
}

export default function FooterSection({
  className,
  onLogout,
}: FooterSectionProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (onLogout) onLogout(); // Run parent logic if exists
    logout(); // Core logout logic from useAuth.ts
  };

  return (
    <div className={className ?? "p-3"}>
      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      >
        Log out
      </button>
    </div>
  );
}
