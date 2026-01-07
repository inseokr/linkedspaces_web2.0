import { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  asChild?: boolean;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function SemiRoundButton({
  children,
  className,
  type = "button",
  asChild = false,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-[15px]",
    "font-bold transition-colors [font-family:var(--font-poppins)]",
    "bg-[var(--color-main)] text-white hover:bg-[#85aded]",
    "disabled:opacity-50 disabled:pointer-events-none",
    className,
  );

  // Link 같은 걸 children으로 넘길 때(예: <Link/>)
  if (
    asChild &&
    typeof children === "object" &&
    children !== null &&
    "type" in (children as any)
  ) {
    const child = children as ReactElement<any>;
    return (child as any).type
      ? ((
          // child에 className 합쳐서 반환
          <child.type
            {...child.props}
            className={cn(classes, child.props?.className)}
          />
        ) as any)
      : null;
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
