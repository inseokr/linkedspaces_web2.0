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

  const baseField =
    "w-full rounded-[18px] border border-transparent bg-[#F0F0F0] outline-none focus:ring-2 focus:ring-black/10";

  const fieldSize = isTitle
    ? "px-6 py-5 text-[40px] font-bold leading-[1.1]"
    : "px-5 py-4 text-[16px] leading-[1.5]";

  return (
    <div>
      {label ? (
        <div
          className={
            isTitle
              ? "mb-3 text-2xl font-semibold"
              : "mb-3 text-sm font-semibold"
          }
        >
          {label}
        </div>
      ) : null}

      <FieldTag
        className={[
          baseField,
          fieldSize,
          multiline ? "min-h-[150px] resize-none" : "",
        ].join(" ")}
        value={value}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        onChange={(e: any) => onChange(e.target.value)}
      />
    </div>
  );
}
