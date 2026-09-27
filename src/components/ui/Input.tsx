import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function Input({
  label,
  error,
  hint,
  id,
  type = "text",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="flex flex-col gap-1.5 text-left" htmlFor={inputId}>
      <span className="font-sans text-xs font-semibold text-[#5C6068]">
        {label}
      </span>
      <input
        id={inputId}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error && inputId
            ? `${inputId}-error`
            : hint && inputId
              ? `${inputId}-hint`
              : undefined
        }
        className={[
          "h-11 w-full rounded-[14px] border bg-white px-3.5 font-sans text-sm text-[#1A1C1F] transition",
          "placeholder:text-[#8B909A]",
          "focus:outline-none",
          "disabled:cursor-not-allowed disabled:bg-[#F8F9FA] disabled:text-[#8B909A]",
          error
            ? "border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.25)]"
            : "border-[#E5E7EB] focus:border-[#93C5FD] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.25)]",
        ].join(" ")}
        {...props}
      />
      {hint && !error ? (
        <span
          id={inputId ? `${inputId}-hint` : undefined}
          className="font-sans text-xs text-[#8B909A]"
        >
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          id={inputId ? `${inputId}-error` : undefined}
          className="font-sans text-xs font-medium text-[#B91C1C]"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
