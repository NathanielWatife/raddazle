import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Minus, Plus, Star, Truck, RefreshCw, Award } from "lucide-react";
import { getProduct, products } from "@/data/products";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.name} — SOUVENIR` },
      { name: "description", content: loaderData.product.description },
      { property: "og:title", content: `${loaderData.product.name} — SOUVENIR` },
      { property: "og:description", content: loaderData.product.description },
      { property: "og:image", content: loaderData.product.images[0] },
    ] : [],
  }),
  component: ProductPage,
  notFoundComponent: () => <div className="py-32 text-center font-serif text-3xl">Not found.</div>,
  errorComponent: ({ error, reset }) => <div className="py-32 text-center"><p>{error.message}</p><button onClick={reset}>Retry</button></div>,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const wished = inWishlist(product.id);
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
        <Link to="/" className="hover:opacity-60">Home</Link><span>/</span>
        <Link to="/shop" className="hover:opacity-60">Shop</Link><span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-10 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7 grid grid-cols-12 gap-3">
            <div className="col-span-2 hidden lg:flex flex-col gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`aspect-square overflow-hidden bg-secondary ${active === i ? "ring-1 ring-foreground" : "opacity-60 hover:opacity-100"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="col-span-12 lg:col-span-10">
              <motion.div
                key={active}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                className="relative aspect-[4/5] bg-secondary overflow-hidden cursor-zoom-in"
                onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)}
              >
                <img src={product.images[active]} alt={product.name}
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${zoom ? "scale-150" : "scale-100"}`} />
              </motion.div>
              <div className="grid grid-cols-3 gap-3 mt-3 lg:hidden">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`aspect-square bg-secondary overflow-hidden ${active === i ? "ring-1 ring-foreground" : "opacity-60"}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{product.origin} · Edition Nº {product.id}</p>
            <h1 className="mt-4 font-serif text-5xl lg:text-6xl leading-[1.0]">{product.name}</h1>
            <div className="mt-4 flex items-center gap-3 text-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-foreground" : "text-muted-foreground"}`} strokeWidth={0} />
                ))}
              </div>
              <span className="text-muted-foreground">{product.rating} · {product.reviewCount} reviews</span>
            </div>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-serif text-3xl tabular-nums">€{product.price}</span>
              {product.compareAt && <span className="text-muted-foreground line-through tabular-nums">€{product.compareAt}</span>}
              {product.compareAt && <span className="text-xs uppercase tracking-[0.2em] text-destructive">−{Math.round((1 - product.price / product.compareAt) * 100)}%</span>}
            </div>

            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Quantity + CTA */}
            <div className="mt-10 flex gap-3">
              <div className="flex items-center border hairline">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-12 w-12 grid place-items-center hover:bg-secondary"><Minus className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
                <span className="w-10 text-center tabular-nums text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="h-12 w-12 grid place-items-center hover:bg-secondary"><Plus className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
              </div>
              <button
                onClick={() => { addToCart(product, qty); toast.success(`${product.name} added to cart`); }}
                className="flex-1 bg-foreground text-background text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90 transition-colors"
              >Add to cart — €{product.price * qty}</button>
              <button onClick={() => toggleWishlist(product)} className="h-12 w-12 border hairline grid place-items-center hover:bg-secondary" aria-label="Wishlist">
                <Heart className={`h-4 w-4 ${wished ? "fill-foreground" : ""}`} strokeWidth={1.25} />
              </button>
            </div>

            <Link to="/checkout" className="mt-3 block w-full text-center border border-foreground py-3.5 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-colors">
              Buy it now
            </Link>

            {/* Details */}
            <div className="mt-10 border-t hairline pt-6">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Particulars</p>
              <ul className="space-y-2 text-sm">
                {product.details.map((d) => <li key={d} className="flex gap-3"><span className="text-muted-foreground">—</span>{d}</li>)}
              </ul>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <div className="flex flex-col items-center text-center gap-2"><Truck className="h-4 w-4" strokeWidth={1.25} /> Free EU shipping</div>
              <div className="flex flex-col items-center text-center gap-2"><RefreshCw className="h-4 w-4" strokeWidth={1.25} /> 30-day returns</div>
              <div className="flex flex-col items-center text-center gap-2"><Award className="h-4 w-4" strokeWidth={1.25} /> Hand-numbered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-4xl">What people say.</h2>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-serif text-6xl">{product.rating}</span>
                <div>
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-foreground" strokeWidth={0} />)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Based on {product.reviewCount} reviews</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
              {[
                { n: "Eloise R.", t: "Better than the photographs.", b: "It arrived wrapped in paper that felt like a letter. The piece itself is small, considered, and somehow makes the whole shelf feel intentional." },
                { n: "Tomás A.", t: "A real, made thing.", b: "You can feel the hand of the maker. The kind of object you keep moving from one apartment to the next." },
                { n: "Hana K.", t: "Quietly perfect.", b: "Bought it as a gift and immediately wanted to keep it. Ordered a second the next day." },
              ].map((r) => (
                <div key={r.n} className="border-b hairline pb-8">
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-foreground" strokeWidth={0} />)}</div>
                  <p className="font-serif text-2xl italic mt-3">"{r.t}"</p>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{r.b}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] mt-4 text-muted-foreground">— {r.n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-[1400px] px-5 lg:px-10 py-20">
        <h2 className="font-serif text-4xl lg:text-5xl mb-10">Also <em className="italic">handsome</em>.</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-5 lg:px-10 pb-16">
        <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] link-underline">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back to shop
        </Link>
      </div>
    </div>
  );
}
