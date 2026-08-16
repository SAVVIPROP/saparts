import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export default function AIConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [location] = useLocation();
  const chat = trpc.concierge.chat.useMutation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const context = (() => {
    const cityMatch = location.match(/^\/cities\/([\w-]+)/);
    const propMatch = location.match(/^\/properties\/([\w-]+)/);
    if (propMatch) return { propertySlug: propMatch[1] };
    if (cityMatch) return { citySlug: cityMatch[1] };
    return undefined;
  })();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages, chat.isPending]);

  const greeting = (): ChatMessage => ({
    role: "assistant",
    content:
      "Good evening. I am the **SAparts Global Concierge**. I can help you shortlist the right residence for a long stay — by city, neighbourhood, commute, kitchen quality, or budget. How may I help?",
  });

  const openAndGreet = () => {
    if (!open && messages.length === 0) setMessages([greeting()]);
    setOpen(true);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || chat.isPending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    try {
      const resp = await chat.mutateAsync({
        messages: next.filter((m) => m.role !== "system"),
        context,
      });
      setMessages([...next, { role: "assistant", content: resp.reply || "" }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "I apologise — the concierge is briefly unavailable." },
      ]);
    }
  };

  const suggestions = [
    "Best 2-bed residences near Canary Wharf under $9k/month",
    "Family-friendly serviced apartments in Singapore near international schools",
    "Where should a consultant stay in Hong Kong for 3 months?",
  ];

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={openAndGreet}
          className="fixed bottom-6 right-6 z-40 btn-brass shadow-lg !py-3 !px-5 flex items-center gap-2"
          aria-label="Open concierge"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Concierge</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[80vh] max-h-[640px] bg-card border border-border rounded-sm shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-charcoal-deep text-ivory flex items-center justify-between">
            <div>
              <div className="eyebrow text-brass">SAparts</div>
              <div className="font-serif text-lg leading-tight">Global Concierge</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-ivory/70 hover:text-ivory">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-background">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-sm ${
                    m.role === "user"
                      ? "bg-charcoal text-ivory"
                      : "bg-white border border-border text-charcoal"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&_p]:my-1 [&_strong]:text-charcoal [&_a]:text-brass-deep">
                      <Streamdown>{m.content}</Streamdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {chat.isPending && (
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-sm text-sm text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            {messages.length <= 1 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      setTimeout(() => {
                        setMessages((prev) => [...prev, { role: "user", content: s }]);
                        setInput("");
                        chat
                          .mutateAsync({
                            messages: [...messages, { role: "user", content: s }],
                            context,
                          })
                          .then((r) =>
                            setMessages((prev) => [
                              ...prev,
                              { role: "assistant", content: r.reply || "" },
                            ]),
                          )
                          .catch(() => {});
                      }, 10);
                    }}
                    className="pill text-left hover:border-brass-deep hover:text-brass-deep"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 bg-card">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask the concierge…"
                className="flex-1 bg-background border border-border rounded-sm px-3 py-2.5 text-sm outline-none focus:border-brass-deep"
              />
              <button
                onClick={send}
                disabled={chat.isPending || !input.trim()}
                className="btn-primary !py-2.5 !px-3 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
