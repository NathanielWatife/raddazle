import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — SOUVENIR" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <Heart className="h-10 w-10 mx-auto opacity-30" strokeWidth={1} />
        <h1 className="mt-8 font-serif text-5xl">Nothing saved yet.</h1>
        <p className="mt-4 text-muted-foreground">Tap the heart on anything you'd like to keep an eye on.</p>
        <Link to="/shop" className="mt-10 inline-block bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-12 lg:py-20">
      <header className="mb-12 border-b hairline pb-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Saved · {wishlist.length}</p>
        <h1 className="mt-3 font-serif text-5xl lg:text-7xl">Your <em className="italic">wishlist</em>.</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        <AnimatePresence>
          {wishlist.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-background p-6 flex gap-5">
              <Link to="/shop/$slug" params={{ slug: p.slug }} className="shrink-0 w-32 aspect-[4/5] bg-secondary overflow-hidden">
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.origin}</p>
                    <Link to="/shop/$slug" params={{ slug: p.slug }} className="font-serif text-2xl mt-1 block hover:italic">{p.name}</Link>
                    <p className="mt-2 tabular-nums">€{p.price}</p>
                  </div>
                  <button onClick={() => toggleWishlist(p)} className="opacity-60 hover:opacity-100 p-1"><X className="h-4 w-4" strokeWidth={1.25} /></button>
                </div>
                <button
                  onClick={() => { addToCart(p); toast.success(`${p.name} added`); }}
                  className="mt-auto inline-flex items-center justify-center gap-2 bg-foreground text-background py-3 text-[11px] uppercase tracking-[0.25em] hover:bg-foreground/90"
                >
                  <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.25} /> Add to cart
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
