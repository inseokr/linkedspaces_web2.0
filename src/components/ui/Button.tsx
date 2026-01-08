import { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

type Radius = "md" | "full";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  asChild?: boolean;
  radius?: Radius;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  children,
  className,
  type = "button",
  asChild = false,
  radius = "md",
  ...props
}: ButtonProps) {
  const radiusClass = radius === "full" ? "rounded-full" : "rounded-[15px]";

  const classes = cn(
    "inline-flex items-center justify-center",
    radiusClass,
    "font-bold transition-colors [font-family:var(--font-poppins)]",
    "bg-[var(--color-main)] text-white hover:bg-[#85aded]",
    "disabled:opacity-50 disabled:pointer-events-none",
    className,
  );

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
