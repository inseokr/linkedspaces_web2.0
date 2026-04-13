import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/**
 * Display date for "Last updated" on legal pages.
 * - Development: uses file mtime so edits show up without committing.
 * - Production build: prefers last git commit touching the file (accurate on CI).
 */
export function getLegalDocLastUpdated(
  relativePathFromRepoRoot: string,
): string {
  const fullPath = path.join(process.cwd(), relativePathFromRepoRoot);

  if (process.env.NODE_ENV === "development") {
    try {
      return formatLegalDate(fs.statSync(fullPath).mtime);
    } catch {
      return "Date unavailable";
    }
  }

  try {
    const iso = execSync(
      `git log -1 --format=%cI -- ${JSON.stringify(relativePathFromRepoRoot)}`,
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    if (iso) {
      return formatLegalDate(new Date(iso));
    }
  } catch {
    // not a git repo, shallow clone issue, or git unavailable
  }

  try {
    return formatLegalDate(fs.statSync(fullPath).mtime);
  } catch {
    return "Date unavailable";
  }
}

function formatLegalDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
