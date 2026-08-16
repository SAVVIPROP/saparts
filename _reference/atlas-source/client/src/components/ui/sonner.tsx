import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      offset={24}
      toastOptions={{
        style: {
          background: "var(--ivory)",
          color: "var(--charcoal)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.78rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          padding: "14px 18px",
          boxShadow: "0 4px 24px rgba(27,27,25,0.10), 0 1px 4px rgba(27,27,25,0.06)",
          minWidth: "260px",
          maxWidth: "360px",
        },
        classNames: {
          title: "font-mono tracker",
          description: "text-muted-foreground",
          success: "border-l-2 border-l-[var(--forest)]",
          error: "border-l-2 border-l-destructive",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
