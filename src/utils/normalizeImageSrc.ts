// utils/normalizeImageSrc.ts

// 1. S3 저장소 주소로 변경 (예전 해결 방식의 핵심)
const ASSET_ORIGIN = "https://s3-us-west-1.amazonaws.com/linkedspaces.fs";

export function normalizeImageSrc(src?: string) {
  if (!src) return { src: "/images/hero/fallback.jpg", unoptimized: false };

  // 이미 절대 주소(http...)인 경우 그대로 반환
  if (/^https?:\/\//i.test(src)) return { src, unoptimized: false };

  let normalized = src;

  // 2. 예전 로직의 핵심: 경로 재조합
  // API 응답이 "/public/..."으로 올 때 -> S3주소 + "/public/..."
  if (normalized.startsWith("/public/")) {
    normalized = `${ASSET_ORIGIN}${normalized}`;
  }
  // API 응답이 "/user_resources/..."로 올 때 -> S3주소 + "/public/user_resources/..."
  else if (normalized.startsWith("/user_resources/")) {
    normalized = `${ASSET_ORIGIN}/public${normalized}`;
  }
  // 기타 상대 경로 처리
  else if (normalized.startsWith("/")) {
    normalized = `${ASSET_ORIGIN}${normalized}`;
  } else {
    normalized = `${ASSET_ORIGIN}/${normalized}`;
  }

  const lower = normalized.toLowerCase();
  const isHeic = lower.endsWith(".heic") || lower.endsWith(".heif");

  // HEIC 파일이나 외부 리소스는 Next.js 최적화를 끄는 것이 안전함
  return {
    src: normalized,
    unoptimized: isHeic || normalized.includes("amazonaws.com"),
  };
}
