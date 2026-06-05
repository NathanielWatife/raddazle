import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/lib/services";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => (
    <AdminGuard>
      <AdminDashboardPage />
    </AdminGuard>
  ),
});

interface Stats {
  users?: { totalUsers?: number; activeUsers?: number };
  products?: { totalProducts?: number };
  orders?: { totalOrders?: number; totalRevenue?: number };
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((res) => setStats(res.stats))
      .catch(() => setStats({}))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Total users",
      value: stats?.users?.totalUsers ?? 0,
      sub: `${stats?.users?.activeUsers ?? 0} active`,
      icon: Users,
      tone: "from-blue-500/15 to-blue-500/0 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Products",
      value: stats?.products?.totalProducts ?? 0,
      sub: "In catalog",
      icon: Package,
      tone: "from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Orders",
      value: stats?.orders?.totalOrders ?? 0,
      sub: "All time",
      icon: ShoppingCart,
      tone: "from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Revenue",
      value: formatCurrency(stats?.orders?.totalRevenue ?? 0),
      sub: "Gross",
      icon: DollarSign,
      tone: "from-primary/20 to-primary/0 text-primary",
    },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of your store activity">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden border-border/60">
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${c.tone}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </p>
                    {loading ? (
                      <Skeleton className="mt-2 h-7 w-24" />
                    ) : (
                      <p className="mt-2 font-display text-2xl font-bold tracking-tight">
                        {c.value}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-background/70">
                    <c.icon className="h-5 w-5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mt-8 border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" /> Quick links
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: "/admin/products", label: "Manage products" },
              { to: "/admin/orders", label: "Manage orders" },
              { to: "/admin/categories", label: "Manage categories" },
              { to: "/admin/users", label: "Manage users" },
            ].map((l) => (
              <a
                key={l.to}
                href={l.to}
                className="rounded-xl border border-border bg-secondary/40 p-4 text-sm font-medium transition-colors hover:bg-secondary"
              >
                {l.label} →
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
