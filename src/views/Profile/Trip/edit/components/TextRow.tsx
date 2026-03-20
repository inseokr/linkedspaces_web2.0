"use client";

type Variant = "default" | "title";

export default function TextRow({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  variant = "default",
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  variant?: Variant;
}) {
  const FieldTag: any = multiline ? "textarea" : "input";

  const isTitle = variant === "title";

  const baseField = isTitle
    ? "w-full bg-transparent outline-none focus:ring-0 text-center placeholder:text-slate-300 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-900"
    : "w-full rounded-[18px] border border-transparent bg-[#F0F0F0] outline-none focus:ring-2 focus:ring-black/10 px-5 py-4 text-[16px] leading-[1.5]";

  return (
    <div className={isTitle ? "w-full" : ""}>
      {label && !isTitle ? (
        <div className="mb-2 text-sm font-semibold">{label}</div>
      ) : null}

      {multiline ? (
        <div className="relative">
          <FieldTag
            className={[baseField, "min-h-[150px] resize-y overflow-auto"].join(
              " ",
            )}
            value={value}
            placeholder={placeholder}
            rows={3}
            onChange={(e: any) => onChange(e.target.value)}
          />
          {/* Visual resize-grip hint — sits on top of the browser's native resize handle */}
          <span
            className="pointer-events-none absolute bottom-[5px] right-[5px] flex flex-col gap-[3px] opacity-30"
            aria-hidden="true"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="flex gap-[3px]"
                style={{ marginLeft: i * 3 }}
              >
                {Array.from({ length: 3 - i }).map((_, j) => (
                  <span
                    key={j}
                    className="block h-[2.5px] w-[2.5px] rounded-full bg-slate-500"
                  />
                ))}
              </span>
            ))}
          </span>
        </div>
      ) : (
        <FieldTag
          className={baseField}
          value={value}
          placeholder={placeholder}
          onChange={(e: any) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
