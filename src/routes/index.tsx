import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Quote, Sparkles } from "lucide-react";
import { products, categories } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOUVENIR — Objects worth keeping." },
      { name: "description", content: "A curated atelier of travel keepsakes, editioned objects, and small luxuries from Kyoto to Lisbon." },
    ],
  }),
  component: Home,
});

const heroImg = "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=1800&q=85";
const editorialImg = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85";

function Home() {
  const featured = products.slice(0, 4);
  const bestsellers = products.slice(2, 6);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative">
        <div className="grid lg:grid-cols-12 min-h-[88vh]">
          <div className="lg:col-span-5 px-5 lg:px-10 py-16 lg:py-0 flex items-end lg:items-center order-2 lg:order-1">
            <div className="max-w-md">
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
              >
                — Volume Nº 04 · Autumn
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-serif text-[clamp(3rem,6.5vw,5.75rem)] leading-[0.95]"
              >
                Objects with a <em className="italic">passport</em>, a maker, a story.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
                className="mt-6 text-[15px] leading-relaxed text-muted-foreground"
              >
                Souvenir is a small atelier collecting honest things from the people who still make them — by hand, in small editions, in places where craft is a verb.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link to="/shop" className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90 transition-all rounded-xl shadow-lg hover:shadow-xl">
                  Enter the shop
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </Link>
                <Link to="/about" className="text-[12px] uppercase tracking-[0.25em] link-underline px-4 py-2">The atelier →</Link>
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2 min-h-[60vh] lg:min-h-0 bg-secondary overflow-hidden">
            <motion.img
              src={heroImg} alt="Editioned objects, hand arranged"
              initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent" />
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 bg-background px-5 py-4 max-w-xs"
            >
              <p className="font-serif italic text-sm">Oaxaca, Mexico</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Backstrap-loomed, 60 hrs of work</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INDEX / META ─────────────────────────── */}
      <section className="border-y hairline">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" strokeWidth={1.25} /> Hand-numbered editions</div>
          <div>Shipped within 48 hours</div>
          <div>Hand-wrapped in Lisbon</div>
          <div>Carbon-paid worldwide</div>
        </div>
      </section>

      {/* ── FEATURED ─────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 lg:px-10 py-20 lg:py-32">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-secondary font-semibold mb-3">✨ Index Nº 01</p>
            <h2 className="font-serif text-5xl lg:text-7xl leading-[0.95]">New <em className="italic">arrivals</em>.</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.25em] border border-foreground/30 rounded-lg hover:border-foreground/60 hover:bg-muted transition-all">
            See all 64 objects →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────── */}
      <section className="bg-gradient-to-b from-muted/20 to-background border-y hairline">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-20 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-secondary font-semibold mb-3">✨ Index Nº 02</p>
              <h2 className="font-serif text-5xl lg:text-6xl leading-[0.95]">Browse by <em className="italic">discipline</em>.</h2>
              <p className="mt-6 text-muted-foreground max-w-sm">Five small worlds — each one a quiet conversation between a maker and a material.</p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((c, i) => {
                const cover = products.find((p) => p.category === c.slug)?.images[0];
                return (
                  <Link key={c.slug} to="/shop" search={{ category: c.slug }}
                    className="group bg-background p-6 flex items-center justify-between gap-4 relative overflow-hidden rounded-xl border border-border hover:border-foreground/40 transition-all hover:shadow-md">
                    <div className="relative z-10">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Nº 0{i + 1}</p>
                      <p className="font-serif text-3xl mt-2 group-hover:italic transition-all">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 tabular-nums">{c.count} objects</p>
                    </div>
                    <div className="relative z-10 h-20 w-20 overflow-hidden bg-secondary rounded-lg shrink-0">
                      {cover && <img src={cover} alt={c.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                    </div>
                    <ArrowUpRight className="absolute top-5 right-5 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.25} />
                  </Link>
                );
              })}
              <Link to="/shop" className="bg-secondary text-secondary-foreground p-6 flex items-center justify-between group rounded-xl hover:shadow-lg transition-all">
                <p className="font-serif text-3xl">All objects</p>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.25} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMO / EDITORIAL ────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 lg:px-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 relative aspect-[4/3] overflow-hidden bg-secondary">
            <img src={editorialImg} alt="Editorial" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="lg:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Edition Nº 12 · Oaxaca</p>
            <h2 className="mt-4 font-serif text-5xl lg:text-6xl leading-[0.95]">
              The weavers of <em className="italic">San Pedro</em>.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              We spent ten days with the Vasquez family in the Sierra Norte — natural indigo, cochineal red, six generations of looms. The throws are limited to forty pieces.
            </p>
            <Link to="/shop" search={{ category: "textiles" }} className="mt-8 inline-flex items-center gap-3 border-b border-foreground pb-1 text-[11px] uppercase tracking-[0.25em]">
              Shop the edition <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BESTSELLERS ──────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 lg:px-10 pb-20 lg:pb-32">
        <div className="flex items-end justify-between mb-10 gap-6">
          <h2 className="font-serif text-4xl lg:text-5xl">Most kept.</h2>
          <Link to="/shop" className="text-[11px] uppercase tracking-[0.25em] link-underline">See all →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {bestsellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section className="bg-gradient-to-r from-foreground to-foreground/95 text-background py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-10 text-center">
          <Quote className="h-8 w-8 mx-auto opacity-50" strokeWidth={1} />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="mt-8 font-serif text-3xl md:text-5xl leading-[1.1] italic"
          >
            "The kind of small luxuries you didn't know you were looking for — and then can't imagine the shelf without."
          </motion.p>
          <p className="mt-10 text-[11px] uppercase tracking-[0.3em] opacity-70">— Cereal Magazine</p>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-5 gap-8 opacity-60 text-[11px] uppercase tracking-[0.3em]">
            {["Kinfolk", "Cereal", "Apartamento", "Monocle", "Wallpaper*"].map((n) => <div key={n}>{n}</div>)}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 lg:px-10 py-20 lg:py-32">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">@souvenir.atelier</p>
          <h2 className="font-serif text-4xl lg:text-5xl">From the field.</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {products.slice(0, 6).map((p, i) => (
            <motion.a key={p.id} href="#"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="aspect-square bg-secondary overflow-hidden group relative">
              <img src={p.images[0]} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors" />
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
}
