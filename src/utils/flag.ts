export const EMOJI_FONT =
  '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji","Twemoji Mozilla",sans-serif';

export function countryCodeToFlagEmoji(countryCode?: string): string {
  if (!countryCode || typeof countryCode !== "string") return "🌍";

  const trimmed = countryCode.trim();
  if (trimmed.length !== 2) return "🌍";

  try {
    const upper = trimmed.toUpperCase();
    const flag = upper
      .split("")
      .map((char) => {
        const codePoint = char.charCodeAt(0) + 0x1f1a5;
        return String.fromCodePoint(codePoint);
      })
      .join("");

    if (!flag || flag.length === 0 || flag === upper) return "🌍";
    return flag;
  } catch {
    return "🌍";
  }
}
