import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Package, MapPin, CreditCard, X } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { orderService } from "@/lib/services";
import { formatCurrency } from "@/lib/currency";
import { getImageUrl } from "@/lib/api";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [{ title: "Order · Raddazle" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: () => (
    <ProtectedRoute>
      <OrderDetailPage />
    </ProtectedRoute>
  ),
});

interface OrderItem {
  product?: { _id?: string; name?: string; image?: string; price?: number } | null;
  name?: string;
  image?: string;
  quantity: number;
  price: number;
}
interface OrderDetail {
  _id: string;
  orderNumber?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  totalAmount: number;
  subtotal?: number;
  itemsPrice?: number;
  shippingFee?: number;
  shippingPrice?: number;
  tax?: number;
  taxPrice?: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    mobile?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

const statusVariant = (s: string) => {
  const k = s?.toLowerCase();
  if (k === "delivered" || k === "completed" || k === "paid")
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (k === "cancelled" || k === "failed")
    return "bg-destructive/10 text-destructive border-destructive/20";
  if (k === "shipped" || k === "processing")
    return "bg-blue-500/10 text-blue-700 border-blue-500/20";
  return "bg-amber-500/10 text-amber-700 border-amber-500/20";
};

function OrderDetailPage() {
  const { id } = useParams({ from: "/orders/$id" });
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      const data = await orderService.getById(id);
      setOrder(data.order || data);
    } catch {
      toast.error("Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [id]);

  const onCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancel(id);
      toast.success("Order cancelled");
      await load();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not cancel order";
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Order not found</h1>
        <Link to="/">
          <Button variant="outline" className="mt-4 rounded-full">
            Back to orders
          </Button>
        </Link>
      </div>
    );
  }

  const canCancel = ["pending", "processing"].includes(order.status?.toLowerCase());
  const subtotal = order.subtotal ?? order.itemsPrice ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = order.shippingFee ?? order.shippingPrice;
  const tax = order.tax ?? order.taxPrice;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Order</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              dateStyle: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusVariant(order.status)}>
            {order.status}
          </Badge>
          {order.paymentStatus && (
            <Badge variant="outline" className={statusVariant(order.paymentStatus)}>
              Paid: {order.paymentStatus}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Items</h2>
            </div>
            <div className="mt-4 divide-y divide-border">
              {order.items.map((it, idx) => {
                // image/name can come from the populated product ref OR the flat stored fields
                const imgSrc = it.product?.image || it.image || "";
                const itemName = it.product?.name || it.name || "Product";
                return (
                  <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                      {imgSrc && (
                        <img
                          src={getImageUrl(imgSrc)}
                          alt={itemName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{itemName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Qty {it.quantity} · {formatCurrency(it.price)} each
                        </p>
                      </div>
                      <p className="font-display text-base font-semibold">
                        {formatCurrency(it.price * it.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {order.shippingAddress && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold">Shipping address</h2>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {(order.shippingAddress.fullName || (order.shippingAddress.firstName)) && (
                  <p className="font-medium text-foreground">
                    {order.shippingAddress.fullName ||
                      [order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(" ")}
                  </p>
                )}
                {(order.shippingAddress.phone || order.shippingAddress.mobile) && (
                  <p>{order.shippingAddress.phone || order.shippingAddress.mobile}</p>
                )}
                <p>
                  {[
                    order.shippingAddress.street,
                    order.shippingAddress.city,
                    order.shippingAddress.state,
                    order.shippingAddress.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Summary</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              {shippingFee !== undefined && (
                <Row label="Shipping" value={formatCurrency(shippingFee)} />
              )}
              {tax !== undefined && tax > 0 && (
                <Row label="Tax" value={formatCurrency(tax)} />
              )}
              <Separator className="my-2" />
              <Row label="Total" value={formatCurrency(order.totalAmount)} bold />
              {order.paymentMethod && (
                <p className="pt-2 text-xs text-muted-foreground">
                  Paid via{" "}
                  <span className="font-medium text-foreground capitalize">
                    {order.paymentMethod}
                  </span>
                </p>
              )}
            </div>
          </section>

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" /> Cancel order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. If you've already paid, a refund will be
                    processed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onCancel}
                    disabled={cancelling}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, cancel"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between ${bold ? "text-base font-display font-semibold" : "text-muted-foreground"}`}
    >
      <span>{label}</span>
      <span className={bold ? "text-foreground" : "text-foreground"}>{value}</span>
    </div>
  );
}
