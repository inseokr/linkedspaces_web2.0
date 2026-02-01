export function formatTripDateLabel(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  // Handles "YYYY:MM:DD" and "YYYY:MM:DD HH:mm:ss" (keeps only date part).
  const datePart = raw.split(" ")[0] ?? raw;
  const m = /^(\d{4}):(\d{2}):(\d{2})$/.exec(datePart);
  if (!m) return raw;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return raw;
  }

  // Use UTC to avoid timezone day-shift.
  const dt = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

export function formatTimeLabel(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  // Accepts "HH:mm" or "HH:mm:ss"
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  if (!m) return raw;

  const hh = Number(m[1]);
  const mm = Number(m[2]);

  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return raw;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return raw;

  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 || 12;
  return `${hour12}:${String(mm).padStart(2, "0")} ${period}`;
}
