import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { paymentService } from "@/lib/services";

export const Route = createFileRoute("/admin/payments")({
  component: () => (
    <AdminGuard>
      <AdminPaymentsPage />
    </AdminGuard>
  ),
});

interface PaymentRow {
  _id: string;
  order: string;
  user?: { name?: string; email?: string };
  paymentMethod: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
}

function AdminPaymentsPage() {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pending, setPending] = useState<{ id: string; action: string } | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getAll({ page, pageSize: 25 });
      let list: PaymentRow[] = res.payments || [];
      if (status !== "all") list = list.filter((p) => p.status === status);
      if (method !== "all") list = list.filter((p) => p.paymentMethod === method);
      setItems(list);
      setPages(res.pages || 1);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, status, method]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const runAction = async () => {
    if (!pending) return;
    try {
      if (pending.action === "refund") await paymentService.refund(pending.id);
      else await paymentService.updateStatus(pending.id, pending.action);
      toast.success("Updated");
      fetch();
    } catch {
      toast.error("Action failed");
    } finally {
      setPending(null);
    }
  };

  const badge = (s: string) =>
    s === "completed" ? "default" : s === "pending" ? "secondary" : "destructive";

  return (
    <AdminLayout title="Payments">
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank-transfer">Bank transfer</SelectItem>
            <SelectItem value="ussd">USSD</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="cod">COD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
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
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No payments
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs">#{p.order?.slice(-8)}</TableCell>
                  <TableCell className="text-sm">{p.user?.name || p.user?.email || "—"}</TableCell>
                  <TableCell>{p.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={badge(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {p.currency} {Number(p.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={p.status === "completed"}
                        onClick={() => setPending({ id: p._id, action: "completed" })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={p.status === "failed"}
                        onClick={() => setPending({ id: p._id, action: "failed" })}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={p.status === "refunded"}
                        onClick={() => setPending({ id: p._id, action: "refund" })}
                      >
                        Refund
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {pending?.action}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action === "refund"
                ? "Trigger a gateway refund? This cannot be undone."
                : `Mark this payment as ${pending?.action}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
