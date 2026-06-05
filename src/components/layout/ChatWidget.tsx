import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Msg {
  from: "bot" | "user";
  text: string;
}

const greeting: Msg = {
  from: "bot",
  text: "Hi! 👋 I'm here to help with orders, shipping, and product questions. What can I help with?",
};

const replies: { match: RegExp; reply: string }[] = [
  {
    match: /ship|delivery|when|arrive/i,
    reply:
      "Lagos delivery: 1–2 days. Other states: 2–5 days. Free shipping on orders above ₦50,000.",
  },
  {
    match: /return|refund/i,
    reply:
      "We offer 7-day returns on unopened items. See our Return Policy or email returns@raddazle.com.",
  },
  {
    match: /authentic|fake|real|original/i,
    reply: "100% authentic, guaranteed. We source directly from authorized channels.",
  },
  {
    match: /pay|payment|paystack|transfer/i,
    reply: "We accept card (Paystack), bank transfer, and cash on delivery.",
  },
  {
    match: /track|order/i,
    reply: "Sign in and visit My Orders to track in real-time.",
  },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const reply =
      replies.find((r) => r.match.test(text))?.reply ||
      "Thanks for reaching out! For specific help, email hello@raddazle.com and we'll respond within 24 hours.";
    setMsgs((m) => [...m, { from: "user", text }, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow transition hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-50 flex h-[440px] w-[340px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevated"
          >
            <div className="border-b border-border bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
              <p className="font-display font-semibold">Raddazle Support</p>
              <p className="text-xs opacity-80">We typically reply in minutes</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.from === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="h-10 rounded-full"
              />
              <Button type="submit" size="icon" className="h-10 w-10 rounded-full shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
