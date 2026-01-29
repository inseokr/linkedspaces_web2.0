const ASSET_HOST = "https://pocketverse.herokuapp.com"; // 실제 이미지 서빙 도메인

export function normalizeImageSrc(src?: string) {
  if (!src) return { src: "", unoptimized: false };

  // 1) /public 제거
  let normalized = src.startsWith("/public/")
    ? src.replace("/public", "")
    : src;

  // 2) 절대 URL이면 그대로
  const isAbsolute = /^https?:\/\//i.test(normalized);

  // 3) 상대경로(/user_resources/...)면 백엔드 도메인 붙이기
  if (!isAbsolute && normalized.startsWith("/")) {
    normalized = `${ASSET_HOST}${normalized}`;
  }

  const lower = normalized.toLowerCase();
  const isHeic = lower.endsWith(".heic") || lower.endsWith(".heif");

  // user_resources면 next/image optimizer를 피하는 게 안전 (그리고 HEIC는 더더욱)
  const unoptimized = isHeic || lower.includes("/user_resources/");

  return { src: normalized, unoptimized };
}
