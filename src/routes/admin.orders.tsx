import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderService } from "@/lib/services";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/admin/orders")({
  component: () => (
    <AdminGuard>
      <AdminOrdersPage />
    </AdminGuard>
  ),
});

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

interface OrderRow {
  _id: string;
  user?: { name?: string; email?: string };
  totalPrice: number;
  status: string;
  isPaid?: boolean;
  isDelivered?: boolean;
  createdAt?: string;
}

interface ShipForm {
  trackingNumber: string;
  shippingCarrier: string;
  trackingUrl: string;
  estimatedDelivery: string;
}
const emptyShip: ShipForm = {
  trackingNumber: "",
  shippingCarrier: "",
  trackingUrl: "",
  estimatedDelivery: "",
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipOrder, setShipOrder] = useState<OrderRow | null>(null);
  const [shipForm, setShipForm] = useState<ShipForm>(emptyShip);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll({ page: 1, pageSize: 50 });
      setOrders(res.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success("Status updated");
      fetch();
    } catch {
      toast.error("Update failed");
    }
  };

  const deliver = async (id: string) => {
    try {
      await orderService.deliver(id);
      toast.success("Marked delivered");
      fetch();
    } catch {
      toast.error("Failed");
    }
  };

  const cancel = async (id: string) => {
    try {
      await orderService.cancel(id);
      toast.success("Cancelled");
      fetch();
    } catch {
      toast.error("Failed");
    }
  };

  const ship = async () => {
    if (!shipOrder || !shipForm.trackingNumber) return;
    try {
      await orderService.ship(shipOrder._id, shipForm);
      toast.success("Shipping info saved");
      setShipOrder(null);
      setShipForm(emptyShip);
      fetch();
    } catch {
      toast.error("Ship failed");
    }
  };

  return (
    <AdminLayout title="Orders" subtitle="Manage customer orders & fulfillment">
      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Paid</TableHead>
              <TableHead className="hidden md:table-cell">Delivered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No orders
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="font-mono text-xs">#{o._id.slice(-8)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{o.user?.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.user?.email}</div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(o.totalPrice)}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o._id, v)}>
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={o.isPaid ? "default" : "secondary"}>
                      {o.isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={o.isDelivered ? "default" : "secondary"}>
                      {o.isDelivered ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {!o.isDelivered && (
                        <Button size="sm" variant="outline" onClick={() => deliver(o._id)}>
                          Deliver
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShipOrder(o);
                          setShipForm(emptyShip);
                        }}
                      >
                        <Truck className="h-3.5 w-3.5" /> Ship
                      </Button>
                      {o.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancel(o._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!shipOrder} onOpenChange={(o) => !o && setShipOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship order #{shipOrder?._id.slice(-8)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Tracking number</Label>
              <Input
                value={shipForm.trackingNumber}
                onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Carrier</Label>
              <Input
                value={shipForm.shippingCarrier}
                onChange={(e) => setShipForm({ ...shipForm, shippingCarrier: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>ETA</Label>
              <Input
                type="date"
                value={shipForm.estimatedDelivery}
                onChange={(e) =>
                  setShipForm({
                    ...shipForm,
                    estimatedDelivery: e.target.value,
                  })
                }
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Tracking URL</Label>
              <Input
                value={shipForm.trackingUrl}
                onChange={(e) => setShipForm({ ...shipForm, trackingUrl: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipOrder(null)}>
              Cancel
            </Button>
            <Button onClick={ship} disabled={!shipForm.trackingNumber}>
              Ship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
