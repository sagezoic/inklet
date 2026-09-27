import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-[20px] md:rounded-[24px] border border-[#E5E7EB] bg-white shadow-sm transition",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
