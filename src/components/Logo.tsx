type LogoSize = "sm" | "md" | "lg";

type LogoProps = {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
};

const imageClasses: Record<LogoSize, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-16",
};

const wordmarkClasses: Record<LogoSize, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export function Logo({ size = "md", showWordmark = true, className = "" }: LogoProps) {
  return (
    <span className={["inline-flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <img
        src="/logo.png"
        alt={showWordmark ? "" : "Inklet"}
        className={`${imageClasses[size]} w-auto`}
      />
      {showWordmark ? (
        <span className={`font-display tracking-tight text-ink ${wordmarkClasses[size]}`}>
          Inklet
        </span>
      ) : null}
    </span>
  );
}
