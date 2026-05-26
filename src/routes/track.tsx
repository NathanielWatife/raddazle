import { createFileRoute } from "@tanstack/react-router";
import { Check, Package, Truck, Home } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track order — SOUVENIR" }] }),
  component: Track,
});

const steps = [
  { i: Check, l: "Order placed", d: "12 Sep, 14:32", done: true },
  { i: Package, l: "Wrapped in Lisbon", d: "13 Sep, 09:12", done: true },
  { i: Truck, l: "In transit", d: "Now — Madrid hub", done: true, active: true },
  { i: Home, l: "Out for delivery", d: "Expected 16 Sep", done: false },
];

function Track() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Order SVN-04219</p>
      <h1 className="mt-3 font-serif text-5xl lg:text-6xl">Your parcel is <em className="italic">moving</em>.</h1>
      <p className="mt-4 text-muted-foreground">Three objects, hand-wrapped, on their way from our atelier in Lisbon.</p>

      <div className="mt-14 relative">
        <div className="absolute left-6 top-6 bottom-6 w-px bg-border" />
        <div className="space-y-10">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex gap-6 relative">
              <div className={`h-12 w-12 grid place-items-center rounded-full shrink-0 ${s.done ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"} ${s.active ? "ring-4 ring-foreground/10" : ""}`}>
                <s.i className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="pt-2">
                <p className="font-serif text-2xl">{s.l}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-16 border hairline p-6 flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Carrier</p>
          <p className="font-serif text-xl mt-1">Correos Express</p>
        </div>
        <button className="border hairline px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] hover:bg-secondary">Copy tracking →</button>
      </div>
    </div>
  );
}
