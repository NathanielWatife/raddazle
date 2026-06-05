import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/services";

export const Route = createFileRoute("/admin/reset-password")({
  validateSearch: (s: Record<string, unknown>) => ({
    email: (s.email as string) ?? "",
    code: (s.code as string) ?? "",
  }),
  component: AdminResetPage,
});

function AdminResetPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.email) setEmail(search.email);
    if (search.code) setCode(search.code);
  }, [search.email, search.code]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        token: code,
        newPassword: password,
      });
      toast.success("Password reset successful. Please sign in.");
      navigate({ to: "/admin/login" });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Reset failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <h1 className="font-display text-2xl font-bold">Set new password</h1>
        <p className="mt-1 text-sm text-white/70">Enter the 6-digit code from your email.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-white/80">Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 border-white/20 bg-white/5 text-white"
            />
          </div>
          <div>
            <Label className="text-white/80">Verification code</Label>
            <Input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1.5 border-white/20 bg-white/5 text-white"
            />
          </div>
          <div>
            <Label className="text-white/80">New password</Label>
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 border-white/20 bg-white/5 text-white"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset password"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link to="/admin/login" className="text-white/70 hover:text-white">
            ← Back to admin login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
