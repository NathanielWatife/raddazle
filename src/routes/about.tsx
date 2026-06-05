import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Award, Truck, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Raddazle" },
      {
        name: "description",
        content:
          "Raddazle curates 100% authentic luxury fragrances and daily essentials for people who care about quality.",
      },
      { property: "og:title", content: "About Raddazle" },
      {
        property: "og:description",
        content: "Our story, our values, and why we exist.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    desc: "Every product is sourced directly from authorized channels. No counterfeits, ever.",
  },
  {
    icon: Award,
    title: "Curated Quality",
    desc: "We test, we vet, we choose. Only pieces that earn a place on our shelves make the cut.",
  },
  {
    icon: Truck,
    title: "Fast & Tracked",
    desc: "Carefully packed and shipped nationwide with tracking included on every order.",
  },
  {
    icon: Heart,
    title: "Customer First",
    desc: "Real humans, real support. We're here before, during, and after your purchase.",
  },
];

function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.06]" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-primary" /> Our story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-6xl"
          >
            Luxury that feels
            <br />
            <span className="text-primary">personal.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Raddazle was born from a simple belief: the things you wear, spray, and reach for every
            day should feel exceptional. We bring authentic luxury within reach.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-secondary">
            <img
              src="/img/hero-imag-1.png"
              alt="Raddazle curated picks"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why we exist
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              A quieter, kinder kind of luxury.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We started Raddazle because the fragrance and essentials market had become noisy,
              confusing, and full of fakes. We wanted a place where every bottle is real, every
              recommendation is honest, and every customer is treated like a regular.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Today, we serve thousands across Nigeria and beyond — pairing global icons with
              quietly excellent everyday picks. We're small, intentional, and proud of it.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              What we stand for
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Our values</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
