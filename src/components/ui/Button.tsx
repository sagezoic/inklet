import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pending?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent/90 disabled:bg-accent/50",
  secondary:
    "bg-surface text-ink border border-hairline hover:bg-paper disabled:text-muted",
  ghost: "bg-transparent text-ink hover:bg-hairline/60 disabled:text-muted",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-base",
  lg: "px-5 py-3 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  pending = false,
  disabled,
  className = "",
  type = "button",
  children,
  ref,
  ...props
}: ButtonProps) {
  const isDisabled = disabled === true || pending;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={pending || undefined}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-serif transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-70",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
