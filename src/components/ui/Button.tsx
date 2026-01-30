import { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

type Radius = "md" | "full";
type Variant = "main" | "sub" | "neutral";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  asChild?: boolean;
  radius?: Radius;
  variant?: Variant; // Add variant prop
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

const VARIANT_CLASSES: Record<Variant, string> = {
  main: "bg-[var(--color-main)] text-white hover:bg-[#85aded]",
  sub: "bg-[var(--color-sub)] text-white hover:opacity-90",
  neutral: "bg-[var(--color-neutral)] text-black hover:bg-black/10",
};

export default function Button({
  children,
  className,
  type = "button",
  asChild = false,
  radius = "md",
  variant = "main", // Default variant
  ...props
}: ButtonProps) {
  const radiusClass = radius === "full" ? "rounded-full" : "rounded-[15px]";

  const classes = cn(
    "inline-flex items-center justify-center",
    radiusClass,
    "transition-colors",
    VARIANT_CLASSES[variant], // Use selected variant
    "disabled:opacity-50 disabled:pointer-events-none",
    className,
  );

  // Render as the child element (e.g., Link) while merging className
  if (
    asChild &&
    typeof children === "object" &&
    children !== null &&
    "type" in (children as any)
  ) {
    const child = children as ReactElement<any>;
    return (child as any).type ? (
      <child.type
        {...child.props}
        className={cn(classes, child.props?.className)}
      />
    ) : null;
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
