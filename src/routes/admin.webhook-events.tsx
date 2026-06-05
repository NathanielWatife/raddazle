import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminService } from "@/lib/services";

export const Route = createFileRoute("/admin/webhook-events")({
  component: () => (
    <AdminGuard>
      <AdminWebhookEventsPage />
    </AdminGuard>
  ),
});

interface WebhookEvent {
  _id: string;
  eventId?: string;
  provider: string;
  reference?: string;
  payment?: string;
  order?: string;
  handled?: boolean;
  status?: string;
  receivedAt?: string;
  createdAt: string;
  payload?: unknown;
}

function AdminWebhookEventsPage() {
  const [items, setItems] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("all");
  const [handled, setHandled] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [reference, setReference] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<WebhookEvent | null>(null);
  const [exporting, setExporting] = useState(false);

  const buildParams = useCallback(
    (p = page) => {
      const params: Record<string, unknown> = { page: p, pageSize: 25 };
      if (provider !== "all") params.provider = provider;
      if (handled !== "all") params.handled = handled;
      if (status !== "all") params.status = status;
      if (q) params.q = q;
      if (reference) params.reference = reference;
      return params;
    },
    [page, provider, handled, status, q, reference],
  );

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getWebhookEvents(buildParams());
      setItems(res.events || []);
      setPages(res.pages || 1);
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load webhook events",
      );
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows: WebhookEvent[] = [];
      let current = 1;
      let total = 1;
      const MAX = 5000;
      while (current <= total && rows.length < MAX) {
        const data = await adminService.getWebhookEvents({
          ...buildParams(current),
          page: current,
          pageSize: 200,
        });
        rows.push(...(data.events || []));
        total = data.pages || 1;
        current++;
        if (!data.events?.length) break;
      }
      const headers = [
        "id",
        "eventId",
        "provider",
        "reference",
        "payment",
        "order",
        "handled",
        "status",
        "createdAt",
        "receivedAt",
      ];
      const lines = [headers.join(",")];
      for (const r of rows) {
        const vals = headers.map((h) => {
          const v = String((r as unknown as Record<string, unknown>)[h] ?? "").replace(/"/g, '""');
          return /[",\n]/.test(v) ? `"${v}"` : v;
        });
        lines.push(vals.join(","));
      }
      const blob = new Blob([lines.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `webhook-events-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout
      title="Webhook events"
      subtitle="Inbound payment provider notifications"
      actions={
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={exporting}>
          <Download className="h-4 w-4" /> {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      }
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="paystack">Paystack</SelectItem>
            <SelectItem value="flutterwave">Flutterwave</SelectItem>
          </SelectContent>
        </Select>
        <Select value={handled} onValueChange={setHandled}>
          <SelectTrigger>
            <SelectValue placeholder="Handled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any handling</SelectItem>
            <SelectItem value="true">Handled</SelectItem>
            <SelectItem value="false">Unprocessed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Event ID" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input
          placeholder="Reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Received</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="hidden md:table-cell">Payment</TableHead>
              <TableHead className="hidden md:table-cell">Order</TableHead>
              <TableHead>Handled</TableHead>
              <TableHead>Status</TableHead>
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
                  No events
                </TableCell>
              </TableRow>
            ) : (
              items.map((ev) => (
                <TableRow key={ev._id} onClick={() => setSelected(ev)} className="cursor-pointer">
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(ev.receivedAt || ev.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{ev.provider}</TableCell>
                  <TableCell className="font-mono text-xs">{ev.reference || "—"}</TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">
                    {ev.payment || "—"}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">
                    {ev.order || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ev.handled ? "default" : "secondary"}>
                      {ev.handled ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ev.status === "error" ? "destructive" : "secondary"}>
                      {ev.status || "—"}
                    </Badge>
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Webhook event details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Event ID:</span>{" "}
                  <span className="font-mono text-xs">{selected.eventId || selected._id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Provider:</span> {selected.provider}
                </div>
                <div>
                  <span className="text-muted-foreground">Reference:</span>{" "}
                  {selected.reference || "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Handled:</span>{" "}
                  {selected.handled ? "Yes" : "No"}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Payload
                </div>
                <pre className="max-h-96 overflow-auto rounded-lg bg-ink p-3 text-xs text-white">
                  {JSON.stringify(selected.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
