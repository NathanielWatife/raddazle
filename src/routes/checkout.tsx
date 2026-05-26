import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — SOUVENIR" }] }),
  component: Checkout,
});

const steps = ["Address", "Shipping", "Payment"] as const;

function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const shipping = cartTotal > 150 ? 0 : 12;
  const total = cartTotal + shipping;

  return (
    <div className="mx-auto max-w-[1400px] px-5 lg:px-10 py-10 lg:py-16">
      <Link to="/" className="font-serif text-2xl tracking-[0.2em] uppercase block text-center mb-10">Souvenir</Link>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 mb-12 text-[11px] uppercase tracking-[0.2em]">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span className={`h-6 w-6 grid place-items-center rounded-full text-[10px] tabular-nums ${i <= step ? "bg-foreground text-background" : "bg-secondary"}`}>
              {i < step ? <Check className="h-3 w-3" strokeWidth={2} /> : i + 1}
            </span>
            <span className={i === step ? "" : "text-muted-foreground"}>{s}</span>
            {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) setStep(step + 1);
            else {
              toast.success("Order placed — confirmation sent.");
              clearCart();
              navigate({ to: "/track" });
            }
          }}
          className="lg:col-span-7"
        >
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {step === 0 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-4xl">Where shall we send it?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First name" required />
                    <Field label="Last name" required />
                  </div>
                  <Field label="Email" type="email" required />
                  <Field label="Address" required />
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="City" required />
                    <Field label="Postal code" required />
                    <Field label="Country" required />
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-4xl">How shall we send it?</h2>
                  <div className="space-y-3">
                    {[
                      { n: "Standard", d: "3–5 working days", p: shipping },
                      { n: "Express", d: "1–2 working days", p: 24 },
                      { n: "Hand delivery", d: "Lisbon city only", p: 0 },
                    ].map((s, i) => (
                      <label key={s.n} className="flex items-center gap-4 border hairline p-4 cursor-pointer hover:bg-secondary/50">
                        <input type="radio" name="ship" defaultChecked={i === 0} className="accent-foreground" />
                        <div className="flex-1">
                          <p className="font-serif text-xl">{s.n}</p>
                          <p className="text-xs text-muted-foreground">{s.d}</p>
                        </div>
                        <p className="tabular-nums">{s.p === 0 ? "Free" : `€${s.p}`}</p>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-4xl">A safe place to pay.</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="h-3 w-3" strokeWidth={1.5} /> Encrypted, never stored.</div>
                  <Field label="Card number" placeholder="1234 5678 9012 3456" required />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry" placeholder="MM / YY" required />
                    <Field label="CVC" placeholder="123" required />
                  </div>
                  <Field label="Name on card" required />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex gap-3">
            {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="border hairline px-6 py-3 text-[11px] uppercase tracking-[0.25em] hover:bg-secondary">← Back</button>}
            <button type="submit" className="flex-1 bg-foreground text-background py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground/90">
              {step < 2 ? "Continue →" : `Pay €${total} →`}
            </button>
          </div>
        </form>

        {/* Order summary */}
        <aside className="lg:col-span-5">
          <div className="border hairline p-6 lg:p-8 lg:sticky lg:top-28">
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-5">Your order</h3>
            <ul className="space-y-4">
              {cart.map((i) => (
                <li key={i.product.id} className="flex gap-4">
                  <div className="relative w-16 h-20 bg-secondary shrink-0 overflow-hidden">
                    <img src={i.product.images[0]} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[10px] h-5 w-5 grid place-items-center rounded-full tabular-nums">{i.quantity}</span>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-serif text-base">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">{i.product.origin}</p>
                  </div>
                  <p className="text-sm tabular-nums">€{i.product.price * i.quantity}</p>
                </li>
              ))}
              {cart.length === 0 && <p className="text-sm text-muted-foreground">Your cart is empty.</p>}
            </ul>
            <div className="mt-6 pt-5 border-t hairline space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">€{cartTotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="tabular-nums">{shipping === 0 ? "Free" : `€${shipping}`}</span></div>
              <div className="flex justify-between font-serif text-2xl items-baseline pt-3"><span>Total</span><span className="tabular-nums">€{total}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input {...rest} className="mt-1.5 w-full bg-transparent border-b hairline py-2.5 text-sm outline-none focus:border-foreground transition-colors" />
    </label>
  );
}
