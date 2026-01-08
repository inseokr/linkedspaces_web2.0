import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function SignUpButton({ children, className, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "w-full h-[41px] px-3 py-4 rounded-full",
        "inline-flex items-center justify-center text-center",
        "text-base font-bold",
        "bg-[var(--color-main)] text-white",
        "border border-transparent",
        "transition-colors duration-200",
        "hover:bg-white hover:text-black hover:font-normal",
        "active:opacity-90",
        "disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  );
}
