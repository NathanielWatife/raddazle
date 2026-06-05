import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { getImageUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/lib/services";
import { Button } from "@/components/ui/button";

const PLACEHOLDER = "/img/product-placeholder.jpg";

export function ProductCard({
  product,
  onAddToCart,
  index = 0,
}: {
  product: Product;
  onAddToCart?: (p: Product) => void | Promise<void>;
  index?: number;
}) {
  const [src, setSrc] = useState(getImageUrl(product.image));
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAddToCart) return;
    setAdding(true);
    try {
      await onAddToCart(product);
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2) }}
    >
      <Link
        to="/shop/$id"
        params={{ id: product._id }}
        className="group block overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-elevated"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            onError={() => setSrc(PLACEHOLDER)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {typeof product.category === "object" && product.category?.name && (
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">
              {product.category.name}
            </span>
          )}
        </div>
        <div className="p-4">
          {product.brand && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.brand}
            </p>
          )}
          <h3 className="mt-1 line-clamp-1 font-display text-base font-semibold text-foreground">
            {product.name}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="font-display text-lg font-bold text-foreground">
              {formatCurrency(product.price)}
            </span>
            {onAddToCart && (
              <Button
                onClick={handleAdd}
                disabled={adding}
                size="sm"
                className="rounded-full"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Add
              </Button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
