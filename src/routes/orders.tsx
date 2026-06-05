import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orderService } from "@/lib/services";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [{ title: "My orders · Raddazle" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: () => (
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  ),
});

interface OrderSummary {
  _id: string;
  orderNumber?: string;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  createdAt: string;
  items?: { product?: { name?: string } | null; quantity: number }[];
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

function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data.orders || data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Account</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">My orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and review every purchase you've made.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 font-display text-lg font-semibold">No orders yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Discover something you'll love.</p>
          <Link to="/shop">
            <Button className="mt-4 rounded-full">Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, i) => (
            <motion.div
              key={o._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to="/orders/$id"
                params={{ id: o._id }}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-elevated"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        Order #{o.orderNumber || o._id.slice(-8).toUpperCase()}
                      </span>
                      <Badge variant="outline" className={statusVariant(o.status)}>
                        {o.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}{" "}
                      · {o.items?.length || 0} item
                      {(o.items?.length || 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-semibold">
                    {formatCurrency(o.totalAmount)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
