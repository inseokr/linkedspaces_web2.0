"use client";

import { useState } from "react";
import { countryCodeToFlagEmoji, EMOJI_FONT } from "@/utils/flag";

type Props = {
  countryCode?: string;
  alt?: string;
  size?: number; // px
};

export default function Flag({ countryCode, alt, size = 24 }: Props) {
  const cc = (countryCode ?? "").toUpperCase();
  const [imgFailed, setImgFailed] = useState(false);

  const flagUrl = cc ? `https://flagcdn.com/w40/${cc.toLowerCase()}.png` : "";

  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      {!imgFailed && flagUrl ? (
        <img
          src={flagUrl}
          alt={alt ?? `Flag ${cc}`}
          style={{ width: size }}
          className="object-cover "
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span style={{ fontFamily: EMOJI_FONT, lineHeight: 1 }}>
          {countryCodeToFlagEmoji(cc)}
        </span>
      )}
    </div>
  );
}
