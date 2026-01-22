"use client";

import type { CountryVisited } from "@/api/user";

type Props = {
  countries?: CountryVisited[];
};

const EMOJI_FONT =
  '"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji","Twemoji Mozilla",sans-serif';

function country2flag(countryCode?: string): string {
  if (!countryCode || typeof countryCode !== "string") {
    return "🌍";
  }

  const trimmed = countryCode.trim();
  if (trimmed.length !== 2) {
    return "🌍";
  }

  try {
    const upper = trimmed.toUpperCase();
    const flag = upper
      .split("")
      .map((char) => {
        const codePoint = char.charCodeAt(0) + 0x1f1a5;
        return String.fromCodePoint(codePoint);
      })
      .join("");

    // 검증: 이모지가 제대로 생성되었는지 확인
    if (!flag || flag.length === 0 || flag === upper) {
      console.warn(
        "Flag emoji generation failed for:",
        countryCode,
        "got:",
        flag,
      );
      return "🌍";
    }

    return flag;
  } catch (error) {
    console.error("Error in country2flag:", error, { countryCode });
    return "🌍";
  }
}

function getCountryName(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "Unknown";
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(countryCode.toUpperCase()) || countryCode;
  } catch {
    return countryCode;
  }
}

function CountryPill({ country }: { country: CountryVisited }) {
  const countryCode = country?.countryCode;
  const flag = country2flag(countryCode);
  const countryName = getCountryName(countryCode);

  // 디버깅: 브라우저 콘솔에서 확인
  if (typeof window !== "undefined") {
    console.log("CountryPill Debug:", {
      countryCode,
      flag,
      flagType: typeof flag,
      flagLength: flag?.length,
      flagCharCodes: flag ? [...flag].map((c) => c.codePointAt(0)) : null,
      testUS: country2flag("US"),
      testKR: country2flag("KR"),
    });
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-[26px] bg-[#F6F6F6] py-[7px] px-[15px] ">
      <span
        className="text-2xl leading-none select-none"
        style={{
          fontFamily: EMOJI_FONT,
          lineHeight: "1",
          display: "inline-block",
          fontSize: "1.5rem",
        }}
        role="img"
        aria-label={`Flag of ${countryName}`}
      >
        {flag || "🌍"}
      </span>

      <span className="text-xs text-[#3C3E41] leading-normal tracking-[-0.5px] font-semibold truncate">
        {countryName}
      </span>
    </div>
  );
}

export default function TopCountries({ countries = [] }: Props) {
  if (!countries.length) return null;

  return (
    <div className="mt-3">
      <div className="text-xs font-medium text-gray-500">Top countries:</div>
      <div className="mt-2 flex gap-3">
        {countries.map((c) => (
          <CountryPill
            key={c._id ?? `${c.country}-${c.countryCode}`}
            country={c}
          />
        ))}
      </div>
    </div>
  );
}
