import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productService, type Product } from "@/lib/services";

export const Route = createFileRoute("/admin/products/$id/inventory")({
  component: () => (
    <AdminGuard>
      <InventoryPage />
    </AdminGuard>
  ),
});

interface HistoryItem {
  _id: string;
  change: number;
  reason: string;
  previousStock: number;
  newStock: number;
  user?: { name?: string };
  order?: { _id?: string } | string;
  note?: string;
  createdAt: string;
}

const reasons = [
  "manual-adjustment",
  "order-placement",
  "order-cancellation",
  "return",
  "correction",
  "initial-stock",
];

function InventoryPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    delta: "0",
    reason: "manual-adjustment",
    note: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, h] = await Promise.all([
        productService.getById(id),
        productService.getInventoryHistory(id, { page: 1, pageSize: 25 }),
      ]);
      setProduct(p.product);
      setHistory(h.history || []);
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = parseInt(form.delta, 10);
    if (!delta) return;
    try {
      await productService.adjustInventory(id, {
        delta,
        reason: form.reason,
        note: form.note,
      });
      toast.success("Inventory adjusted");
      setForm({ delta: "0", reason: "manual-adjustment", note: "" });
      load();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Adjustment failed",
      );
    }
  };

  return (
    <AdminLayout
      title={product ? `Inventory · ${product.name}` : "Inventory"}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/products">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      }
    >
      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !product ? (
        <p className="text-muted-foreground">Product not found.</p>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Current stock
                </p>
                <p className="mt-2 font-display text-3xl font-bold">{product.countInStock ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <form onSubmit={onAdjust} className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <Label>Δ Change</Label>
                    <Input
                      type="number"
                      value={form.delta}
                      onChange={(e) => setForm({ ...form, delta: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Reason</Label>
                    <Select
                      value={form.reason}
                      onValueChange={(v) => setForm({ ...form, reason: v })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-4">
                    <Label>Note</Label>
                    <Input
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <Button type="submit">Apply adjustment</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4 text-sm font-semibold">History</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Δ</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Prev</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead className="hidden md:table-cell">By</TableHead>
                  <TableHead className="hidden lg:table-cell">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No history
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((h) => (
                    <TableRow key={h._id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(h.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className={h.change >= 0 ? "text-success" : "text-destructive"}>
                        {h.change >= 0 ? `+${h.change}` : h.change}
                      </TableCell>
                      <TableCell>{h.reason}</TableCell>
                      <TableCell>{h.previousStock}</TableCell>
                      <TableCell>{h.newStock}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {h.user?.name || "—"}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {h.note || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
