export function formatTripDateLabel(input: string): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  // Handles "YYYY:MM:DD" / "YYYY-MM-DD" and time suffix (keeps only date part).
  const datePart = raw.split(" ")[0] ?? raw;
  const m = /^(\d{4})[:-](\d{2})[:-](\d{2})$/.exec(datePart);
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

function parseYmd(
  input: unknown,
): { year: number; month: number; day: number } | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  const datePart = raw.split(" ")[0] ?? raw;
  const m = /^(\d{4})[:-](\d{2})[:-](\d{2})$/.exec(datePart);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  )
    return null;

  return { year, month, day };
}

function getDebugTripDateEnabled(): boolean {
  try {
    // NOTE: NEXT_PUBLIC_* is safe for client bundles; in prod builds this will be inlined.
    return process.env.NEXT_PUBLIC_DEBUG_TRIP_DATE === "1";
  } catch {
    return false;
  }
}

function debugTripDate(...args: any[]) {
  if (!getDebugTripDateEnabled()) return;
  console.debug("[formatTripDateRangeLabel]", ...args);
}

function stripTripPrefix(raw: string): string {
  return raw.replace(/^\s*trip\b\s*[:\-]?\s*/i, "").trim();
}

function stripTrailingYear(label: string): {
  label: string;
  year: number | null;
} {
  const m = /(.*?)(?:,?\s+)(\d{4})\s*$/.exec(label.trim());
  if (!m) return { label: label.trim(), year: null };
  return { label: m[1].trim(), year: Number(m[2]) };
}

function extractTwoMonthDayLabels(raw: string): string[] {
  // Extracts up to two occurrences like "Sep 21" / "Sep 21, 2025".
  const cleaned = stripTripPrefix(String(raw ?? "").trim());
  if (!cleaned) return [];

  const monthRe = "\\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\b";
  const re = new RegExp(`${monthRe}\\s+\\d{1,2}(?:,?\\s*\\d{4})?`, "g");

  const matches = Array.from(cleaned.matchAll(re)).map((m) => m[0].trim());
  if (matches.length >= 2) return [matches[0], matches[1]];

  // Handle "Sep 21 26" (second month omitted)
  const single = matches[0];
  if (single) {
    const m2 = new RegExp(
      `^(${monthRe})\\s+(\\d{1,2})(?:,?\\s*(\\d{4}))?$`,
    ).exec(single);
    const tailDay = /\b(\d{1,2})\b\s*$/.exec(cleaned);
    if (m2 && tailDay) {
      const month = m2[1];
      const d1 = Number(m2[2]);
      const d2 = Number(tailDay[1]);
      const year = m2[3] ? `, ${m2[3]}` : "";
      // Only treat as a range if there are two different days present.
      if (Number.isFinite(d1) && Number.isFinite(d2) && d1 !== d2) {
        return [`${month} ${d1}${year}`, `${month} ${d2}${year}`];
      }
    }
  }

  return matches.slice(0, 1);
}

function formatMonthShortDayUTC(ymd: {
  year: number;
  month: number;
  day: number;
}): string {
  const dt = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

function formatMonthShortDayYearUTC(ymd: {
  year: number;
  month: number;
  day: number;
}): string {
  const dt = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

export function formatTripDateRangeLabel(
  startInput: unknown,
  endInput: unknown,
  opts?: { includeYear?: boolean },
): string {
  const includeYear = opts?.includeYear ?? true;

  const start = parseYmd(startInput);
  const end = parseYmd(endInput);

  debugTripDate("inputs", { startInput, endInput, includeYear });
  debugTripDate("parsedYmd", { start, end });

  // Fallback: if API already sends "Sep 21" / "Sep 21, 2025" style labels (or a combined string like
  // "trip Sep 21 Sep 26"), preserve and format as a range instead of returning "".
  if (!start && !end) {
    const startRaw = stripTripPrefix(String(startInput ?? "").trim());
    const endRaw = stripTripPrefix(String(endInput ?? "").trim());

    const inferred =
      !endRaw && startRaw ? extractTwoMonthDayLabels(startRaw) : [];
    const a = inferred[0] ?? startRaw;
    const b = inferred[1] ?? endRaw;

    const aTrim = a.trim();
    const bTrim = b.trim();

    if (!aTrim && !bTrim) return "";
    if (aTrim && !bTrim) {
      debugTripDate("fallbackSingle", { label: aTrim });
      return aTrim;
    }
    if (!aTrim && bTrim) {
      debugTripDate("fallbackSingle", { label: bTrim });
      return bTrim;
    }
    if (aTrim === bTrim) {
      debugTripDate("fallbackSame", { label: aTrim });
      return aTrim;
    }

    if (!includeYear) {
      const aNo = stripTrailingYear(aTrim);
      const bNo = stripTrailingYear(bTrim);
      if (aNo.year != null && bNo.year != null && aNo.year === bNo.year) {
        const out = `${aNo.label} ~ ${bNo.label}`;
        debugTripDate("fallbackRangeStripYear", { out, year: aNo.year });
        return out;
      }
    }

    const out = `${aTrim} ~ ${bTrim}`;
    debugTripDate("fallbackRange", { out });
    return out;
  }
  if (start && !end) {
    const out = includeYear
      ? formatMonthShortDayYearUTC(start)
      : formatMonthShortDayUTC(start);
    debugTripDate("ymdSingle", { out });
    return out;
  }
  if (!start && end) {
    const out = includeYear
      ? formatMonthShortDayYearUTC(end)
      : formatMonthShortDayUTC(end);
    debugTripDate("ymdSingle", { out });
    return out;
  }

  // At this point: start && end
  if (
    start!.year === end!.year &&
    start!.month === end!.month &&
    start!.day === end!.day
  ) {
    const out = includeYear
      ? formatMonthShortDayYearUTC(start!)
      : formatMonthShortDayUTC(start!);
    debugTripDate("ymdSameDay", { out });
    return out;
  }

  // If the years differ, always include year on both sides (even if includeYear=false)
  if (start!.year !== end!.year) {
    const out = `${formatMonthShortDayYearUTC(start!)} ~ ${formatMonthShortDayYearUTC(end!)}`;
    debugTripDate("ymdDiffYear", { out });
    return out;
  }

  // Same year
  const left = formatMonthShortDayUTC(start!);
  const right = formatMonthShortDayUTC(end!);
  const out = includeYear
    ? `${left} ~ ${right}, ${start!.year}`
    : `${left} ~ ${right}`;
  debugTripDate("ymdRange", { out });
  return out;
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
