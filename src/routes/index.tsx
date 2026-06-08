import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Headphones,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { productService, type Product } from "@/lib/services";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raddazle — Luxury Scents & Daily Essentials" },
      {
        name: "description",
        content: "100% authentic luxury fragrances and daily essentials, delivered.",
      },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On orders over ₦50,000 nationwide.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "Encrypted checkout with Paystack & Flutterwave.",
  },
  {
    icon: RefreshCcw,
    title: "30-Day Returns",
    desc: "Easy refunds, no questions asked.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Real humans, ready when you need us.",
  },
];

function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => productService.getAll({ limit: 8 }),
  });

  const products: Product[] = data?.products ?? [];

  const addToCart = useCartStore((s) => s.addToCart);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  const handleAdd = async (p: Product) => {
    if (!isAuthed) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }
    try {
      await addToCart(p._id, 1);
      toast.success(`${p.name} added to cart`);
    } catch {
      toast.error("Could not add to cart.");
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-x-0 -top-32 -z-10 mx-auto h-[640px] max-w-7xl">
          <div className="absolute left-1/2 top-0 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> New season drop · 2026
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl">
              Luxury scents,{" "}
              <span className="bg-gradient-to-r from-primary to-[oklch(0.6_0.2_350)] bg-clip-text text-transparent">
                100% authentic.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              Hand-picked fragrances and daily essentials from the houses you love. Shipped fast,
              priced fair, guaranteed real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" className="rounded-full shadow-glow">
                  Shop the collection <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="rounded-full">
                  Our story
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-primary/10"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Loved by 12k+ customers</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 -rotate-6 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/0" />
              <div className="absolute inset-0 rotate-3 rounded-[2.5rem] bg-card shadow-elevated" />
              <img
                src="/img/hero-imag-1.png"
                alt="Featured fragrance"
                className="relative h-full w-full rounded-[2.5rem] object-contain p-8"
              />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -left-4 bottom-8 hidden rounded-2xl border border-border bg-card/90 p-3 shadow-elevated backdrop-blur sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Authenticity verified</p>
                    <p className="text-[10px] text-muted-foreground">Batch #RDZ-2026</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="absolute -right-4 top-8 hidden rounded-2xl border border-border bg-card/90 p-3 shadow-elevated backdrop-blur sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Ships in 24h</p>
                    <p className="text-[10px] text-muted-foreground">Across Nigeria</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="bg-surface p-8">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Featured</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Your perfect choice, every day.
            </h2>
          </div>
          <Link to="/shop">
            <Button variant="ghost" className="rounded-full">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-border bg-card">
                <div className="aspect-square animate-pulse bg-muted" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
              No products available yet.
            </div>
          ) : (
            products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} onAddToCart={handleAdd} />
            ))
          )}
        </div>
      </section>

      
    </>
  );
}
