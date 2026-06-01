import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const wished = inWishlist(product.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to="/shop/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative overflow-hidden bg-secondary aspect-[4/5] rounded-2xl">
          <img src={product.images[0]} alt={product.name} loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]" />
          {product.images[1] && (
            <img src={product.images[1]} alt="" aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          )}

          {product.badge && (
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.2em] bg-accent text-accent-foreground px-3 py-1.5 rounded-lg font-semibold">
              {product.badge}
            </span>
          )}

          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); toast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
            className="absolute top-4 right-4 h-10 w-10 grid place-items-center bg-background/95 backdrop-blur hover:bg-background transition-all rounded-full shadow-md hover:shadow-lg"
            aria-label="Save"
          >
            <Heart className={`h-4 w-4 transition-all ${wished ? "fill-secondary text-secondary" : ""}`} strokeWidth={1.25} />
          </button>

          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <button
              onClick={(e) => { e.preventDefault(); addToCart(product); toast.success(`${product.name} added`); }}
              className="w-full bg-foreground text-background text-[11px] uppercase tracking-[0.25em] py-3 hover:bg-foreground/90 rounded-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Quick add
            </button>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-start gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{product.origin}</p>
            <h3 className="font-serif text-xl mt-1 leading-tight truncate group-hover:italic transition-all">{product.name}</h3>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-current" strokeWidth={0} />
              <span className="tabular-nums">{product.rating.toFixed(1)}</span>
              <span>· {product.reviewCount}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="tabular-nums">€{product.price}</p>
            {product.compareAt && <p className="text-xs text-muted-foreground line-through tabular-nums">€{product.compareAt}</p>}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
