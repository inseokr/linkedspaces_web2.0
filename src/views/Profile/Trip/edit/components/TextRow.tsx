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

      <FieldTag
        className={[
          baseField,
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
