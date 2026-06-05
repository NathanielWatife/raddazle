import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { formatCurrency } from "@/lib/currency";
import { getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const PLACEHOLDER = "/img/product-placeholder.jpg";
const SHIPPING = 3;

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Your Cart · Raddazle" }, { name: "robots", content: "noindex" }],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, fetched, fetchCart, updateItem, removeItem, subtotal } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    if (initialized && isAuthenticated && !fetched) fetchCart();
  }, [initialized, isAuthenticated, fetched, fetchCart]);

  if (initialized && !isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view your cart"
        description="Your cart is saved to your account so you can pick up where you left off."
        actionLabel="Sign in"
        onAction={() => navigate({ to: "/login" })}
      />
    );
  }

  if (loading || !fetched) {
    return (
      <div className="container mx-auto grid gap-8 px-4 py-16 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the collection and add something special to get started."
        actionLabel="Continue shopping"
        onAction={() => navigate({ to: "/shop" })}
      />
    );
  }

  const sub = subtotal();
  const total = sub + SHIPPING;

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Your selection
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">
            Shopping cart
          </h1>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <ul className="space-y-4">
            {cart.items.map((item, i) => (
              <CartLine
                key={item._id}
                item={item}
                index={i}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </ul>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold text-foreground">Order summary</h2>

              <div className="mt-5 space-y-3 text-sm">
                <Row label="Subtotal" value={formatCurrency(sub)} />
                <Row label="Shipping" value={formatCurrency(SHIPPING)} />
              </div>

              <Separator className="my-5" />
              <Row label="Total" value={formatCurrency(total)} bold />

              <div className="mt-6 space-y-2">
                <Input placeholder="Discount code" className="h-11" />
                <Button variant="outline" className="w-full rounded-full">
                  Apply code
                </Button>
              </div>

              <Button
                onClick={() => navigate({ to: "/checkout" })}
                size="lg"
                className="mt-6 w-full rounded-full"
              >
                Proceed to checkout <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Shipping & taxes calculated at checkout
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span
        className={
          bold ? "font-display text-base font-semibold text-foreground" : "text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          bold
            ? "font-display text-base font-semibold text-foreground"
            : "font-medium text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function CartLine({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: {
    _id: string;
    quantity: number;
    product: {
      _id: string;
      name: string;
      price: number;
      image?: string;
      brand?: string;
    };
  };
  index: number;
  onUpdate: (id: string, q: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [src, setSrc] = useState(getImageUrl(item.product.image));
  const [busy, setBusy] = useState(false);

  const change = async (delta: number) => {
    const next = item.quantity + delta;
    if (next < 1) return;
    setBusy(true);
    try {
      await onUpdate(item._id, next);
    } catch {
      toast.error("Could not update quantity");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await onRemove(item._id);
      toast.success("Removed from cart");
    } catch {
      toast.error("Could not remove item");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <Link
        to="/shop/$id"
        params={{ id: item.product._id }}
        className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28"
      >
        <img
          src={src}
          alt={item.product.name}
          className="h-full w-full object-cover"
          onError={() => setSrc(PLACEHOLDER)}
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.product.brand && (
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {item.product.brand}
              </p>
            )}
            <Link
              to="/shop/$id"
              params={{ id: item.product._id }}
              className="block font-display text-base font-semibold text-foreground hover:text-primary"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCurrency(item.product.price)} each
            </p>
          </div>
          <button
            onClick={remove}
            disabled={busy}
            aria-label="Remove item"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-border">
            <button
              onClick={() => change(-1)}
              disabled={busy || item.quantity <= 1}
              className="grid h-9 w-9 place-items-center rounded-l-full transition hover:bg-secondary disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => change(1)}
              disabled={busy}
              className="grid h-9 w-9 place-items-center rounded-r-full transition hover:bg-secondary"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="font-display text-base font-bold text-foreground">
            {formatCurrency(item.product.price * item.quantity)}
          </span>
        </div>
      </div>
    </motion.li>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button onClick={onAction} size="lg" className="mt-6 rounded-full">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
