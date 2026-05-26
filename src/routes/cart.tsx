import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — SOUVENIR" }] }),
  component: Cart,
});

function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal } = useStore();
  const shipping = cartTotal > 150 ? 0 : 12;
  const total = cartTotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <ShoppingBag className="h-10 w-10 mx-auto opacity-30" strokeWidth={1} />
        <h1 className="mt-8 font-serif text-5xl">Your cart is empty.</h1>
        <p className="mt-4 text-muted-foreground">Nothing kept yet — go find something worth bringing home.</p>
        <Link to="/shop" className="mt-10 inline-block bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90">Enter the shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-12 lg:py-20">
      <header className="mb-12 border-b hairline pb-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Step 1 of 3</p>
        <h1 className="mt-3 font-serif text-5xl lg:text-7xl">Your <em className="italic">cart</em>.</h1>
      </header>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-8">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div key={item.product.id}
                layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex gap-5 lg:gap-8 py-6 border-b hairline"
              >
                <Link to="/shop/$slug" params={{ slug: item.product.slug }} className="shrink-0 w-24 lg:w-32 aspect-[4/5] bg-secondary overflow-hidden">
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{item.product.origin}</p>
                      <Link to="/shop/$slug" params={{ slug: item.product.slug }} className="font-serif text-2xl lg:text-3xl mt-1 block hover:italic">{item.product.name}</Link>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="p-1 opacity-60 hover:opacity-100" aria-label="Remove"><X className="h-4 w-4" strokeWidth={1.25} /></button>
                  </div>
                  <div className="mt-auto pt-4 flex items-end justify-between gap-4">
                    <div className="flex items-center border hairline">
                      <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="h-9 w-9 grid place-items-center hover:bg-secondary"><Minus className="h-3 w-3" strokeWidth={1.5} /></button>
                      <span className="w-8 text-center tabular-nums text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="h-9 w-9 grid place-items-center hover:bg-secondary"><Plus className="h-3 w-3" strokeWidth={1.5} /></button>
                    </div>
                    <p className="font-serif text-2xl tabular-nums">€{item.product.price * item.quantity}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28 border hairline p-8">
            <h2 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">€{cartTotal}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : `€${shipping}`}</dd></div>
              <div className="flex justify-between text-muted-foreground"><dt>Tax</dt><dd>at checkout</dd></div>
            </dl>
            <div className="border-t hairline mt-5 pt-5 flex justify-between items-baseline">
              <span className="text-[11px] uppercase tracking-[0.25em]">Total</span>
              <span className="font-serif text-3xl tabular-nums">€{total}</span>
            </div>
            <Link to="/checkout" className="mt-6 block text-center bg-foreground text-background py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90">Proceed to checkout</Link>
            <Link to="/shop" className="mt-3 block text-center text-[11px] uppercase tracking-[0.25em] link-underline">Continue shopping</Link>

            <div className="mt-8 pt-6 border-t hairline text-xs text-muted-foreground space-y-2">
              <p>· Hand-wrapped in unbleached paper</p>
              <p>· Carbon-paid worldwide</p>
              <p>· 30-day quiet returns</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
