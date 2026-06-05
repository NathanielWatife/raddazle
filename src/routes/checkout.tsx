import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Landmark, Truck, Lock, MapPin } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { orderService, paymentService, userService } from "@/lib/services";
import { formatCurrency } from "@/lib/currency";
import { getImageUrl } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void };
    };
    FlutterwaveCheckout?: (opts: Record<string, unknown>) => void;
  }
}

const PLACEHOLDER = "/img/product-placeholder.jpg";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout · Raddazle" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutPage,
});

type SavedAddress = {
  _id: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
};

type PaymentMethod = "cod" | "paystack" | "bank-transfer";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useAuthStore((s) => s.initialized);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [bankInfo, setBankInfo] = useState<{
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    instructions?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    mobile: "",
    email: "",
    paymentMethod: "cod" as PaymentMethod,
    bankRef: "",
  });

  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

  // Redirect when no cart
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (initialized && isAuthenticated && cart && (!cart.items || cart.items.length === 0)) {
      navigate({ to: "/cart" });
    }
  }, [initialized, isAuthenticated, cart, navigate]);

  // Load Paystack inline script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.PaystackPop) return;
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const profile = (await userService.getProfile()) as {
        user?: Record<string, unknown>;
      } & Record<string, unknown>;
      const u = (profile.user ?? profile) as {
        firstName?: string;
        lastName?: string;
        name?: string;
        email?: string;
        phoneNumber?: string;
        shippingAddress?: SavedAddress[];
      };
      const addresses = u.shippingAddress ?? [];
      setSavedAddresses(addresses);
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setFormData((p) => ({
        ...p,
        firstName: u.firstName ?? u.name?.split(" ")[0] ?? "",
        lastName: u.lastName ?? u.name?.split(" ").slice(1).join(" ") ?? "",
        email: u.email ?? "",
        mobile: u.phoneNumber ?? "",
        ...(def
          ? {
              address: def.street ?? "",
              city: def.city ?? "",
              state: def.state ?? "",
              country: def.country ?? "",
            }
          : {}),
      }));
      if (def) setSelectedAddressId(def._id);
      else setUseNewAddress(true);
    } catch {
      setUseNewAddress(true);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (initialized && isAuthenticated) loadProfile();
  }, [initialized, isAuthenticated, loadProfile]);

  useEffect(() => {
    paymentService
      .getBankInfo()
      .then((r: { bank?: typeof bankInfo }) => setBankInfo(r.bank ?? null))
      .catch(() => {});
  }, []);

  const handleAddressSelect = (id: string) => {
    const a = savedAddresses.find((x) => x._id === id);
    if (!a) return;
    setSelectedAddressId(id);
    setUseNewAddress(false);
    setFormData((p) => ({
      ...p,
      address: a.street ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      country: a.country ?? "",
    }));
  };

  const handleUseNew = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setFormData((p) => ({
      ...p,
      address: "",
      city: "",
      state: "",
      country: "",
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const orderPaymentMethod =
        formData.paymentMethod === "paystack" ? "card" : formData.paymentMethod;
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          mobile: formData.mobile,
        },
        paymentMethod: orderPaymentMethod,
      };

      const orderRes = (await orderService.create(orderData)) as {
        order?: { _id: string };
        data?: { order?: { _id: string } };
        _id?: string;
      };
      const order = orderRes?.order ?? orderRes?.data?.order ?? (orderRes as { _id: string });

      if (formData.paymentMethod === "cod") {
        await clearCart();
        toast.success("Order placed successfully");
        navigate({ to: "/orders" });
        return;
      }

      if (formData.paymentMethod === "paystack") {
        const init = (await paymentService.initPaystack(order._id)) as {
          reference: string;
          email: string;
          amount: number;
          authorizationUrl?: string;
        };
        if (window.PaystackPop && paystackPublicKey) {
          const handler = window.PaystackPop.setup({
            key: paystackPublicKey,
            email: init.email,
            amount: Math.round((init.amount || 0) * 100),
            ref: init.reference,
            currency: "NGN",
            callback: () => {
              paymentService
                .verifyPaystack(init.reference, order._id)
                .then(async () => {
                  await clearCart();
                  toast.success("Payment successful");
                  navigate({ to: "/orders" });
                })
                .catch((err: { response?: { data?: { message?: string } }; message?: string }) => {
                  toast.error(err.response?.data?.message ?? err.message ?? "Verification failed");
                });
            },
            onClose: () => {
              toast.info("Payment closed. You can retry from Orders.");
              navigate({ to: "/orders" });
            },
          });
          handler.openIframe();
        } else if (init.authorizationUrl) {
          window.location.href = init.authorizationUrl;
        } else {
          toast.error("Unable to start Paystack payment");
        }
        return;
      }

      if (formData.paymentMethod === "bank-transfer") {
        await paymentService.submitBankTransfer({
          orderId: order._id,
          reference: formData.bankRef || `BANK_${order._id}`,
        });
        await clearCart();
        toast.info("Order placed. Awaiting bank transfer verification.");
        navigate({ to: "/orders" });
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const sub = subtotal();
  const total = sub;

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Checkout</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">
            Almost there
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review your order and complete payment securely.
          </p>
        </header>

        {loadingProfile ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <Skeleton className="h-[500px] rounded-3xl" />
            <Skeleton className="h-[500px] rounded-3xl" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <section className="rounded-3xl border border-border bg-card p-6">
                  <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-primary" /> Shipping address
                  </h2>
                  <div className="mt-4 space-y-3">
                    {savedAddresses.map((addr) => {
                      const active = selectedAddressId === addr._id && !useNewAddress;
                      return (
                        <button
                          type="button"
                          key={addr._id}
                          onClick={() => handleAddressSelect(addr._id)}
                          className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-foreground bg-secondary/40 shadow-soft" : "border-border bg-background hover:border-foreground/30"}`}
                        >
                          <span
                            className={`mt-1 grid h-4 w-4 place-items-center rounded-full border-2 ${active ? "border-foreground bg-foreground text-background" : "border-border"}`}
                          >
                            {active && <Check className="h-2.5 w-2.5" />}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {addr.street}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {addr.city}, {addr.state} {addr.postalCode}
                                </p>
                                <p className="text-xs text-muted-foreground">{addr.country}</p>
                              </div>
                              {addr.isDefault && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleUseNew}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${useNewAddress ? "border-foreground bg-secondary/40" : "border-dashed border-border bg-background hover:border-foreground/30"}`}
                    >
                      <span
                        className={`grid h-4 w-4 place-items-center rounded-full border-2 ${useNewAddress ? "border-foreground bg-foreground text-background" : "border-border"}`}
                      >
                        {useNewAddress && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        Use a different address
                      </span>
                    </button>
                  </div>
                </section>
              )}

              {/* Address form */}
              {(savedAddresses.length === 0 || useNewAddress) && (
                <section className="rounded-3xl border border-border bg-card p-6">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Shipping address
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      required
                      className="sm:col-span-2"
                    />
                    <Field
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    <Field
                      label="State / Province"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                    <Field
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="sm:col-span-2"
                    />
                  </div>
                </section>
              )}

              {/* Contact */}
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Contact</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <Field
                    label="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Field
                    label="Mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
              </section>

              {/* Payment method */}
              <section className="rounded-3xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Payment method
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <PaymentOption
                    active={formData.paymentMethod === "cod"}
                    icon={Truck}
                    label="Cash on Delivery"
                    note="Pay when it arrives"
                    onClick={() => setFormData((p) => ({ ...p, paymentMethod: "cod" }))}
                  />
                  <PaymentOption
                    active={formData.paymentMethod === "paystack"}
                    icon={CreditCard}
                    label="Paystack"
                    note="Card, bank, USSD"
                    onClick={() => setFormData((p) => ({ ...p, paymentMethod: "paystack" }))}
                  />
                  <PaymentOption
                    active={formData.paymentMethod === "bank-transfer"}
                    icon={Landmark}
                    label="Bank Transfer"
                    note="Manual confirmation"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        paymentMethod: "bank-transfer",
                      }))
                    }
                  />
                </div>

                {formData.paymentMethod === "bank-transfer" && (
                  <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-5">
                    <p className="text-sm">
                      <span className="font-medium">Bank:</span> {bankInfo?.bankName ?? "—"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Account name:</span>{" "}
                      {bankInfo?.accountName ?? "—"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Account number:</span>{" "}
                      {bankInfo?.accountNumber ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {bankInfo?.instructions ?? "Use your Order ID as payment reference."}
                    </p>
                    <div className="mt-4">
                      <Field
                        label="Transfer reference"
                        name="bankRef"
                        value={formData.bankRef}
                        onChange={handleChange}
                        placeholder="Mobile app reference"
                      />
                    </div>
                  </div>
                )}
              </section>
            </motion.div>

            {/* Summary */}
            <motion.aside
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold text-foreground">Order summary</h2>

                <ul className="mt-5 space-y-3">
                  {cart.items.map((item) => (
                    <SummaryItem key={item._id} item={item} />
                  ))}
                </ul>

                <Separator className="my-5" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatCurrency(sub)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-emerald-700">Free</span>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="flex justify-between">
                  <span className="font-display text-base font-semibold text-foreground">
                    Total
                  </span>
                  <span className="font-display text-base font-bold text-foreground">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={placing}
                  className="mt-6 w-full rounded-full"
                >
                  <Lock className="h-4 w-4" />
                  {placing ? "Placing order…" : "Place order"}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  By placing your order you agree to our{" "}
                  <Link to="/terms" className="underline">
                    Terms
                  </Link>
                  .
                </p>
              </div>
            </motion.aside>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className={className}>
      <Label htmlFor={props.name} className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
        {props.required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      <Input id={props.name} {...props} className="h-11" />
    </div>
  );
}

function PaymentOption({
  active,
  icon: Icon,
  label,
  note,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${active ? "border-foreground bg-secondary/40 shadow-soft" : "border-border bg-background hover:border-foreground/30"}`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${active ? "bg-foreground text-background" : "bg-secondary text-foreground"}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{note}</span>
    </button>
  );
}

function SummaryItem({
  item,
}: {
  item: {
    _id: string;
    quantity: number;
    product: { name: string; image?: string; price: number };
  };
}) {
  const [src, setSrc] = useState(getImageUrl(item.product.image));
  return (
    <li className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img
          src={src}
          alt={item.product.name}
          className="h-full w-full object-cover"
          onError={() => setSrc(PLACEHOLDER)}
        />
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
          {item.quantity}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
        <p className="text-xs text-muted-foreground">{formatCurrency(item.product.price)}</p>
      </div>
      <span className="text-sm font-semibold text-foreground">
        {formatCurrency(item.product.price * item.quantity)}
      </span>
    </li>
  );
}
