// src/utils/countryName.ts
export function getCountryName(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "Unknown";
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(countryCode.toUpperCase()) || countryCode;
  } catch {
    return countryCode ?? "Unknown";
  }
}
