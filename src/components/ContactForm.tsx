"use client";

import { useState } from "react";

const ENQUIRY_INBOX = "enquiry@serviceapartment.hk";

export function ContactForm({
  subjects,
  source = "contact",
  defaultMessage = "",
  defaultSubject,
}: {
  subjects?: { value: string; label: string }[];
  source?: string;
  defaultMessage?: string;
  defaultSubject?: string;
}) {
  const [sent, setSent] = useState(false);
  const options = subjects ?? [
    { value: "booking", label: "Book a residence" },
    { value: "general", label: "General enquiry" },
    { value: "corporate", label: "Corporate mobility" },
    { value: "operators", label: "Operator listing" },
    { value: "press", label: "Press" },
  ];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const subject = String(data.get("subject") || source);
    const message = String(data.get("message") || "");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nSource: ${source}\n\n${message}`);
    window.location.href = `mailto:${ENQUIRY_INBOX}?subject=${encodeURIComponent("SAparts — " + subject)}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="paper p-8">
        <div className="section-mark">Received</div>
        <h3 className="display text-3xl mt-4">Your message is ready to send.</h3>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Your mail client should have opened addressed to SAparts. If it did not, write directly to {ENQUIRY_INBOX}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block">
        <span className="field-label">Name</span>
        <input className="field" name="name" required />
      </label>
      <label className="block">
        <span className="field-label">Email</span>
        <input className="field" name="email" type="email" required />
      </label>
      <label className="block">
        <span className="field-label">Subject</span>
        <select className="field" name="subject" defaultValue={defaultSubject ?? options[0]?.value}>
          {options.map((o) => (
            <option key={o.value} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="field-label">Message</span>
        <textarea className="field min-h-32" name="message" required defaultValue={defaultMessage} />
      </label>
      <button type="submit" className="btn-primary">
        Send enquiry
      </button>
    </form>
  );
}
