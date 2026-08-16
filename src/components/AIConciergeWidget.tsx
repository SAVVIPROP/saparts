"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, Send, X } from "./icons";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AIConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages]);

  const greeting = (): ChatMessage => ({
    role: "assistant",
    content:
      "Good evening. I am the SAparts Global Concierge. I can help you shortlist the right residence for a long stay — by city, neighbourhood, commute, kitchen quality, or budget. An LLM is not connected on this public site; I will point you to the directory and the Contact desk.",
  });

  const replyFor = (text: string): string => {
    const city = pathname.match(/^\/cities\/([\w-]+)/)?.[1];
    const prop = pathname.match(/^\/properties\/([\w-]+)/)?.[1];
    const place = city ? `the ${city.replace(/-/g, " ")} dossier` : prop ? "this residence page" : "the directory";
    return `Noted: “${text}”. The concierge is UI-only until an LLM key is connected. From ${place}, use Search to filter the register, or write to hello@saparts.com with city, stay length, and unit mix.`;
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: replyFor(text) }]);
    setInput("");
  };

  const suggestions = [
    "Best 2-bed residences near Canary Wharf",
    "Family-friendly apartments in Singapore",
    "Where should a consultant stay in Hong Kong for 3 months?",
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            if (messages.length === 0) setMessages([greeting()]);
            setOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 btn-brass shadow-lg !py-3 !px-5 flex items-center gap-2"
          aria-label="Open concierge"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Concierge</span>
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[80vh] max-h-[640px] bg-card border border-border rounded-sm shadow-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-4 bg-charcoal-deep text-ivory flex items-center justify-between">
            <div>
              <div className="eyebrow text-brass">SAparts</div>
              <div className="font-serif text-lg leading-tight">Global Concierge</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-ivory/70 hover:text-ivory" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-background">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-sm ${
                    m.role === "user" ? "bg-charcoal text-ivory" : "bg-white border border-border text-charcoal"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {messages.length <= 1 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setMessages((prev) => [...prev, { role: "user", content: s }, { role: "assistant", content: replyFor(s) }]);
                    }}
                    className="pill text-left hover:border-brass-deep hover:text-brass-deep"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-border p-3 bg-card">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask the concierge…"
                className="flex-1 bg-background border border-border rounded-sm px-3 py-2.5 text-sm outline-none focus:border-brass-deep"
              />
              <button onClick={send} disabled={!input.trim()} className="btn-primary !py-2.5 !px-3 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
