import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { adminService } from "@/lib/services";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <AdminGuard>
      <AdminUsersPage />
    </AdminGuard>
  ),
});

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super-admin";
  status?: string;
  isVerified?: boolean;
  createdAt?: string;
}

function AdminUsersPage() {
  const { user: me } = useAuthStore();
  const isSuper = me?.role === "super-admin";
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search,
        role: role === "all" ? "" : role,
        status: status === "all" ? "" : status,
        page: 1,
        limit: 50,
      });
      setUsers(res.users || []);
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load users",
      );
    } finally {
      setLoading(false);
    }
  }, [search, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleAll = (checked: boolean) => setSelected(checked ? users.map((u) => u._id) : []);
  const toggleOne = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const runBulk = async () => {
    if (!pendingAction || selected.length === 0) return;
    try {
      await adminService.bulkAction(pendingAction, selected);
      toast.success(`Users ${pendingAction}d`);
      setSelected([]);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          `Failed to ${pendingAction}`,
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleRoleChange = async (u: AdminUser, newRole: string) => {
    if (!isSuper) return;
    try {
      await adminService.updateUser(u._id, { role: newRole });
      toast.success("Role updated");
      fetchUsers();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to update role",
      );
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportUsers();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <AdminLayout
      title="Users"
      actions={
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super-admin">Super-admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => setPendingAction("activate")}>
            Activate
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPendingAction("suspend")}>
            Suspend
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setPendingAction("delete")}>
            Delete
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={selected.length > 0 && selected.length === users.length}
                  onCheckedChange={(v) => toggleAll(!!v)}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Verified</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(u._id)}
                      onCheckedChange={() => toggleOne(u._id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {isSuper ? (
                      <Select value={u.role} onValueChange={(v) => handleRoleChange(u, v)}>
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                          <SelectItem value="super-admin">super-admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={u.role === "user" ? "secondary" : "default"}>{u.role}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "suspended" ? "destructive" : "secondary"}>
                      {u.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {u.isVerified ? (
                      <ShieldCheck className="h-4 w-4 text-success" />
                    ) : (
                      <ShieldX className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!pendingAction} onOpenChange={(o) => !o && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {pendingAction}</AlertDialogTitle>
            <AlertDialogDescription>
              Apply <strong>{pendingAction}</strong> to {selected.length} user(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runBulk}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
