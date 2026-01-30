import { normalizeImageSrc } from "@/utils/normalizeImageSrc";

type Resolved = { src: string; unoptimized?: boolean };

const mem = new Map<string, Resolved>();

const KEY = "blogImgResolved:v1";
const TTL_MS = 1000 * 60 * 60 * 24; // 24h

type Stored = { at: number; value: Resolved };
type Store = Record<string, Stored>;

function readStore(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function writeStore(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getBlogImageResolved(url: string): Resolved {
  if (!url) return { src: "" };

  // 1) memory
  const hit = mem.get(url);
  if (hit) return hit;

  // 2) localStorage
  if (typeof window !== "undefined") {
    const store = readStore();
    const item = store[url];
    if (item && Date.now() - item.at < TTL_MS) {
      mem.set(url, item.value);
      return item.value;
    }
  }

  // 3) compute
  const resolved = normalizeImageSrc(url);
  mem.set(url, resolved);

  if (typeof window !== "undefined") {
    const store = readStore();
    store[url] = { at: Date.now(), value: resolved };
    writeStore(store);
  }

  return resolved;
}
