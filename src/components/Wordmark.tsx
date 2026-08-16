export function Wordmark({
  variant = "default",
  suffix = true,
  size = "md",
}: {
  variant?: "default" | "light" | "dark";
  suffix?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const color =
    variant === "light" ? "text-ivory" : variant === "dark" ? "text-charcoal-deep" : "text-charcoal";
  const markBg = variant === "light" ? "var(--ivory)" : "var(--forest)";
  const markFg = variant === "light" ? "var(--charcoal)" : "var(--ivory)";
  const sizeClass =
    size === "sm" ? "text-[1.1rem]" : size === "lg" ? "text-[1.85rem] lg:text-[2.1rem]" : "text-[1.4rem] lg:text-[1.55rem]";
  const markSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

  return (
    <div className={`flex items-center gap-2 select-none ${color}`}>
      <span
        aria-hidden
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: markSize, height: markSize, background: markBg, color: markFg, borderRadius: 2 }}
      >
        <svg
          width={markSize - 8}
          height={markSize - 8}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="square"
        >
          <rect x="1" y="1" width="10" height="10" />
          <path d="M6 1 V11 M1 6 H11" />
        </svg>
      </span>
      <span className={`leading-none tracking-[-0.01em] ${sizeClass}`} style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}>
        SAparts
      </span>
      {suffix && (
        <span
          className="hidden sm:inline-flex items-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: variant === "light" ? "rgba(244,239,223,0.7)" : "var(--muted-foreground)",
            paddingLeft: "0.5rem",
            marginLeft: "0.5rem",
            borderLeft: `1px solid ${variant === "light" ? "rgba(244,239,223,0.25)" : "var(--border)"}`,
          }}
        >
          The Atlas · MMXXVI
        </span>
      )}
    </div>
  );
}
