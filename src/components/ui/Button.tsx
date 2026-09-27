import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pending?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "rounded-full bg-gradient-to-b from-[#24272f] via-[#16181d] to-[#0d0e11] text-white border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),inset_0_-1px_2px_rgba(255,255,255,0.9),inset_0_-7px_16px_-2px_rgba(255,255,255,0.35),0_8px_24px_-2px_rgba(10,12,16,0.45),0_2px_6px_rgba(10,12,16,0.3)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.42),inset_0_-1px_2px_#ffffff,inset_0_-9px_22px_-2px_rgba(255,255,255,0.45),0_14px_34px_-4px_rgba(10,12,16,0.55)] active:translate-y-0.5 active:scale-[0.98] disabled:bg-[#1E2025]/40 disabled:text-white/60 disabled:shadow-none",
  secondary:
    "rounded-full border border-[#dcdfe4] bg-gradient-to-b from-white via-[#f9fafb] to-[#f1f2f4] text-[#1A1C1F] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(15,17,21,0.06)] hover:-translate-y-0.5 hover:border-[#cbd0d7] hover:shadow-[inset_0_1px_0_#ffffff,inset_0_-1px_2px_rgba(0,0,0,0.12),0_6px_16px_rgba(15,17,21,0.1)] active:translate-y-0.5 active:scale-[0.98] disabled:text-muted/60 disabled:border-hairline/60 disabled:shadow-none",
  ghost:
    "rounded-xl bg-transparent text-muted hover:bg-surface-hover hover:text-ink active:scale-[0.98] disabled:text-muted/50",
  destructive:
    "rounded-xl bg-transparent text-[#EF4444] hover:bg-red-50 hover:text-red-700 active:scale-[0.98] disabled:text-red-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs font-semibold",
  md: "px-5 py-2.5 text-sm font-semibold",
  lg: "px-6 py-3 text-base font-semibold",
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
        "tactile-press inline-flex cursor-pointer items-center justify-center gap-2 font-sans transition",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="ds-spinner size-4 animate-spin text-current" />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
