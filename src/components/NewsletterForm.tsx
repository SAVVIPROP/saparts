"use client";

import { useState } from "react";

export function NewsletterForm({
  variant = "light",
  source = "home",
}: {
  variant?: "light" | "dark";
  source?: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const dark = variant === "dark";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.includes("@")) return;
        const subject = encodeURIComponent("The SAparts Review — subscribe");
        const body = encodeURIComponent(`Please add ${email} to The SAparts Review.\n\nSource: ${source}`);
        window.location.href = `mailto:hello@saparts.com?subject=${subject}&body=${body}`;
        setDone(true);
        setEmail("");
      }}
    >
      <div className={`tracker-muted ${dark ? "text-ivory/70" : ""}`}>Your email</div>
      <div
        className={`mt-2 flex items-center gap-3 border-b py-2 ${
          dark ? "border-white/25 focus-within:border-brass" : "border-charcoal/30 focus-within:border-forest"
        }`}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@institution.edu"
          className={`flex-1 bg-transparent outline-none py-1 ${
            dark ? "text-ivory placeholder:text-ivory/40" : "text-charcoal placeholder:text-charcoal/40"
          }`}
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}
        />
        <button type="submit" className={`tracker ${dark ? "text-ivory hover:text-brass" : "hover:text-forest"}`}>
          {done ? "Sent ↗︎" : "Subscribe ↗︎"}
        </button>
      </div>
      <div className={`tracker-muted mt-3 ${dark ? "text-ivory/50" : ""}`}>
        Opens your mail client. No marketing list is stored on this site.
      </div>
    </form>
  );
}
