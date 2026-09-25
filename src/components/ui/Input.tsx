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
      <span className="font-sans text-xs tracking-wide text-muted uppercase">
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
          "w-full rounded-lg border bg-surface px-3 py-2.5 font-serif text-ink",
          "placeholder:text-muted/70",
          "disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted",
          error ? "border-red-700/50" : "border-hairline",
        ].join(" ")}
        {...props}
      />
      {hint && !error ? (
        <span
          id={inputId ? `${inputId}-hint` : undefined}
          className="font-sans text-xs text-muted"
        >
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          id={inputId ? `${inputId}-error` : undefined}
          className="font-sans text-sm text-red-800"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
