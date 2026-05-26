import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Atelier — SOUVENIR" },
      { name: "description", content: "A small atelier in Lisbon collecting honest objects from the people who make them." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="mx-auto max-w-[1400px] px-5 lg:px-10 py-20 lg:py-32 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Est. 2021 · Lisbon</p>
        </div>
        <div className="lg:col-span-7">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
            className="font-serif text-6xl lg:text-8xl leading-[0.95]"
          >
            We collect <em className="italic">honest</em> things from the people who still make them.
          </motion.h1>
        </div>
      </section>

      <section className="relative h-[60vh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=2000&q=85" alt="" className="absolute inset-0 h-full w-full object-cover" />
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 lg:py-32 space-y-8 text-lg leading-relaxed">
        <p className="font-serif text-3xl italic text-center">— A small story —</p>
        <p>SOUVENIR began in a wood-panelled flat in Alfama. A weaver from Oaxaca, a glassblower from Marrakech, a Florentine bookbinder — friends and friends-of-friends — kept sending us things that felt too good to keep to ourselves.</p>
        <p>So we built a small shop. Not a marketplace. A shelf. Edited carefully, kept honestly, and shipped wrapped in unbleached paper from a mill in the Algarve.</p>
        <p>We don't carry anything we wouldn't keep ourselves. We pay our makers properly, we travel to meet them, and we name them on the label. That's the whole thing.</p>
        <p className="text-center pt-8 text-muted-foreground">— Inês & Pedro, founders</p>
      </section>

      <section className="bg-secondary/40 border-y hairline py-20 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { v: "47", l: "Makers" },
            { v: "12", l: "Countries" },
            { v: "200+", l: "Editions" },
            { v: "100%", l: "Hand-made" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-serif text-6xl lg:text-8xl tabular-nums">{s.v}</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mt-3">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
