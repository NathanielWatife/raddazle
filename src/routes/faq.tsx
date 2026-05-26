import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — SOUVENIR" }] }),
  component: FAQ,
});

const faqs = [
  { q: "Where do you ship?", a: "Worldwide. EU orders dispatch within 24 hours, the rest of the world within 48. Express options at checkout." },
  { q: "How are things wrapped?", a: "Unbleached paper from a mill in the Algarve, a wax seal, a hand-written note for gifts. No plastic, ever." },
  { q: "Can I return something?", a: "Of course. Thirty quiet days. We pay return shipping within the EU; we'll send you a label." },
  { q: "Are objects truly hand-made?", a: "Every single one. We name the maker and the workshop on the label, and we visit them at least once a year." },
  { q: "Do you sell wholesale?", a: "To a small handful of stockists we love. Write to us — wholesale@souvenir.shop." },
  { q: "Why are some things 'editioned'?", a: "Many of our pieces are produced in numbered runs of 40 to 200 — once a batch sells out, that exact edition does not return." },
  { q: "Can I commission something?", a: "Sometimes. Tell us what you're imagining and we'll see who we know." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 lg:py-32">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground text-center">Frequently asked</p>
      <h1 className="mt-4 font-serif text-6xl lg:text-7xl text-center leading-[0.95]">Small <em className="italic">questions</em>.</h1>

      <div className="mt-16 border-t hairline">
        {faqs.map((f, i) => (
          <div key={i} className="border-b hairline">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full py-6 flex justify-between items-center text-left gap-6">
              <span className="font-serif text-xl lg:text-2xl">{f.q}</span>
              {open === i ? <Minus className="h-4 w-4 shrink-0" strokeWidth={1.25} /> : <Plus className="h-4 w-4 shrink-0" strokeWidth={1.25} />}
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="pb-6 pr-12 text-muted-foreground leading-relaxed">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
